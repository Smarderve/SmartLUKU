import { hash } from "./tanzania-data";
import { config } from "./config";

/** Deterministic pseudo-random in [0,1) seeded by a string. */
function rand(seed: string): number {
  return (hash(seed) % 1000) / 1000;
}

export interface DayUsage {
  day: string;
  label: string;
  kwh: number;
  cost: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Last `days` of synthetic daily usage, stable per meter. */
export function dailyUsageSeries(meter: string, days = 7): DayUsage[] {
  const out: DayUsage[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const base = config.AVG_DAILY_KWH_FALLBACK;
    const wiggle = rand(`${meter}:${d.toDateString()}`) * 6 - 1.5;
    const weekendBoost = d.getDay() === 0 || d.getDay() === 6 ? 1.8 : 0;
    const kwh = Math.max(1.5, base + wiggle + weekendBoost);
    out.push({
      day: d.toISOString().slice(0, 10),
      label: WEEKDAYS[d.getDay()],
      kwh: +kwh.toFixed(1),
      cost: Math.round(kwh * config.TARIFF_TZS_PER_KWH),
    });
  }
  return out;
}

export interface MonthUsage {
  month: string;
  kwh: number;
  cost: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthlyUsageSeries(meter: string, months = 6): MonthUsage[] {
  const out: MonthUsage[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const base = 150;
    const wiggle = rand(`${meter}:m:${d.getFullYear()}-${d.getMonth()}`) * 110;
    const kwh = Math.round(base + wiggle);
    out.push({
      month: MONTHS[d.getMonth()],
      kwh,
      cost: kwh * config.TARIFF_TZS_PER_KWH,
    });
  }
  return out;
}

/** 24h hourly load curve (kW) with a morning + evening peak. */
export function hourlyLoadSeries(meter: string): { hour: string; kw: number }[] {
  return Array.from({ length: 24 }).map((_, h) => {
    const morning = Math.exp(-((h - 7) ** 2) / 6) * 1.4;
    const evening = Math.exp(-((h - 19) ** 2) / 5) * 2.1;
    const noise = rand(`${meter}:h:${h}`) * 0.4;
    return { hour: `${h}:00`, kw: +(0.25 + morning + evening + noise).toFixed(2) };
  });
}
