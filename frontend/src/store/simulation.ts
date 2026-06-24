import { create } from "zustand";
import { config, STORAGE_KEYS } from "@/lib/config";

const TICK_MS = 2000;

export interface ApplianceDef {
  id: string;
  name: string;
  icon: string;
  basePower: number;
  usageHoursPerDay: number;
  color: string;
}

export interface Appliance extends ApplianceDef {
  active: boolean;
  power: number;
  custom?: boolean;
}

export interface SensorReading {
  value: number;
  unit: string;
  status: "normal" | "warning" | "danger";
  label?: string;
}

export interface SimAlert {
  type: "warning" | "danger";
  message: string;
}

export interface SimState {
  meterNumber: string;
  balanceKwh: number;
  gridConnected: boolean;
  meterOnline: boolean;
  simulationRunning: boolean;
  lastUpdated: string;
  sessionStart: string;
  totalEnergyConsumedKwh: number;
  appliances: Appliance[];
  sensors: Record<string, SensorReading>;
  alerts: SimAlert[];
}

export const APPLIANCE_DEFS: ApplianceDef[] = [
  { id: "ac", name: "Air Conditioner", icon: "fan", basePower: 850, usageHoursPerDay: 5, color: "#3b82f6" },
  { id: "lights", name: "Smart Lights", icon: "lightbulb", basePower: 120, usageHoursPerDay: 6, color: "#fbbf24" },
  { id: "fridge", name: "Refrigerator", icon: "snowflake", basePower: 200, usageHoursPerDay: 9, color: "#10b981" },
  { id: "tv", name: "Smart TV", icon: "tv", basePower: 85, usageHoursPerDay: 5, color: "#8b5cf6" },
  { id: "water_heater", name: "Water Heater", icon: "shower-head", basePower: 1500, usageHoursPerDay: 1.5, color: "#ef4444" },
];

const PERIOD_DAYS: Record<string, number> = { daily: 1, weekly: 7, monthly: 30 };

function safeParse<T>(str: string | null): T | null {
  try {
    return str ? (JSON.parse(str) as T) : null;
  } catch {
    return null;
  }
}

function getMeterId(): string {
  const profile = safeParse<{ meter?: string }>(localStorage.getItem(STORAGE_KEYS.profile));
  if (profile?.meter) return profile.meter;
  return localStorage.getItem(STORAGE_KEYS.user) || "1234567890";
}

function jitter(base: number, variance: number, decimals = 1): number {
  const v = base + (Math.random() - 0.5) * variance * 2;
  const factor = Math.pow(10, decimals);
  return Math.round(v * factor) / factor;
}

function defaultState(): SimState {
  return {
    meterNumber: getMeterId(),
    balanceKwh: 285,
    gridConnected: true,
    meterOnline: true,
    simulationRunning: true,
    lastUpdated: new Date().toISOString(),
    sessionStart: new Date().toISOString(),
    totalEnergyConsumedKwh: 0,
    appliances: APPLIANCE_DEFS.map((a) => ({
      ...a,
      active: a.id === "fridge" || a.id === "lights",
      power: 0,
    })),
    sensors: {},
    alerts: [],
  };
}

function loadState(): SimState {
  const saved = safeParse<SimState>(localStorage.getItem(STORAGE_KEYS.simulation));
  if (saved && saved.appliances) {
    APPLIANCE_DEFS.forEach((def) => {
      if (!saved.appliances.find((a) => a.id === def.id)) {
        saved.appliances.push({ ...def, active: false, power: 0 });
      }
    });
    return saved;
  }
  return defaultState();
}

function totalPower(s: SimState): number {
  return s.appliances.reduce((sum, a) => sum + (a.active ? a.basePower : 0), 0);
}

/** Pure compute step: drains balance, refreshes sensors + alerts, returns a new state. */
function computeTick(prev: SimState): SimState {
  const s: SimState = {
    ...prev,
    appliances: prev.appliances.map((a) => ({ ...a })),
  };
  const totalW = totalPower(s);
  const currentA = totalW / 230;
  const pf = totalW > 0 ? jitter(0.92, 0.05, 2) : 1;
  const voltage = jitter(230, 3, 1);

  s.sensors = {
    voltage: { value: voltage, unit: "V", status: "normal" },
    current: { value: jitter(currentA, currentA * 0.05, 2), unit: "A", status: currentA > 8 ? "warning" : "normal" },
    power: { value: Math.round(totalW + jitter(0, 15, 0)), unit: "W", status: totalW > 2000 ? "warning" : "normal" },
    frequency: { value: jitter(50, 0.15, 2), unit: "Hz", status: "normal" },
    power_factor: { value: pf, unit: "", status: pf < 0.85 ? "warning" : "normal" },
    temperature: { value: jitter(28, 2, 1), unit: "°C", status: "normal" },
    humidity: { value: jitter(62, 5, 0), unit: "%", status: "normal" },
  };

  s.appliances.forEach((a) => {
    a.power = a.active ? Math.round(a.basePower + jitter(0, a.basePower * 0.08, 0)) : 0;
  });

  const kwhPerTick = (totalW / 1000) * (TICK_MS / 3_600_000);
  s.totalEnergyConsumedKwh = prev.totalEnergyConsumedKwh + kwhPerTick;
  s.balanceKwh = Math.max(0, prev.balanceKwh - kwhPerTick);

  const alerts: SimAlert[] = [];
  if (s.balanceKwh < config.LOW_BALANCE_KWH) {
    alerts.push({ type: "warning", message: `Low balance: ${s.balanceKwh.toFixed(1)} kWh remaining` });
  }
  if (s.balanceKwh < config.CRITICAL_BALANCE_KWH) {
    alerts.push({ type: "danger", message: "Critical balance - disconnection imminent" });
  }
  if (totalW > 2500) {
    alerts.push({ type: "warning", message: `High load: ${(totalW / 1000).toFixed(2)} kW - reduce usage` });
  }
  if (voltage < 215 || voltage > 245) {
    alerts.push({ type: "danger", message: "Voltage out of normal range" });
  }
  s.alerts = alerts;
  s.lastUpdated = new Date().toISOString();
  return s;
}

export interface DashboardSnapshot {
  balanceKwh: number;
  meterNumber: string;
  connected: boolean;
  simulationRunning: boolean;
  usageTodayKwh: number;
  currentPowerKw: number;
  drainRateKwhPerHr: number;
  estHoursLeft: number | null;
  estDaysLeft: number | null;
  voltage: number;
  alerts: SimAlert[];
}

export interface BreakdownItem {
  id: string;
  name: string;
  color: string;
  hoursPerDay: number;
  activeNow: boolean;
  kwh: number;
  cost: number;
  share: number;
}

interface SimStore {
  state: SimState;
  start: () => void;
  stop: () => void;
  toggleAppliance: (id: string) => void;
  topUp: (kwh: number) => void;
  reset: () => void;
  snapshot: () => DashboardSnapshot;
  breakdown: (period: "daily" | "weekly" | "monthly") => {
    period: string;
    days: number;
    items: BreakdownItem[];
    totalKwh: number;
    totalCost: number;
  };
}

let tickHandle: ReturnType<typeof setInterval> | null = null;

function persist(state: SimState) {
  localStorage.setItem(STORAGE_KEYS.simulation, JSON.stringify(state));
}

export const useSimulation = create<SimStore>((set, get) => ({
  state: loadState(),

  start: () => {
    if (tickHandle) clearInterval(tickHandle);
    set((prev) => {
      const next = computeTick({ ...prev.state, simulationRunning: true });
      persist(next);
      return { state: next };
    });
    tickHandle = setInterval(() => {
      const cur = get().state;
      if (!cur.simulationRunning) return;
      const next = computeTick(cur);
      persist(next);
      set({ state: next });
    }, TICK_MS);
  },

  stop: () => {
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
    set((prev) => {
      const next = { ...prev.state, simulationRunning: false };
      persist(next);
      return { state: next };
    });
  },

  toggleAppliance: (id) =>
    set((prev) => {
      const appliances = prev.state.appliances.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a,
      );
      const next = computeTick({ ...prev.state, appliances });
      persist(next);
      return { state: next };
    }),

  topUp: (kwh) =>
    set((prev) => {
      const next = computeTick({ ...prev.state, balanceKwh: prev.state.balanceKwh + kwh });
      persist(next);
      return { state: next };
    }),

  reset: () =>
    set(() => {
      const next = computeTick(defaultState());
      persist(next);
      return { state: next };
    }),

  snapshot: () => {
    const s = get().state;
    const totalW = totalPower(s);
    const currentPowerKw = totalW / 1000;
    const estHoursLeft = currentPowerKw > 0.01 ? s.balanceKwh / currentPowerKw : null;
    return {
      balanceKwh: s.balanceKwh,
      meterNumber: s.meterNumber,
      connected: s.gridConnected && s.meterOnline && s.balanceKwh > 0,
      simulationRunning: s.simulationRunning,
      usageTodayKwh: s.totalEnergyConsumedKwh,
      currentPowerKw,
      drainRateKwhPerHr: currentPowerKw,
      estHoursLeft,
      estDaysLeft: estHoursLeft != null ? estHoursLeft / 24 : null,
      voltage: s.sensors.voltage?.value ?? 230,
      alerts: s.alerts,
    };
  },

  breakdown: (period) => {
    const s = get().state;
    const days = PERIOD_DAYS[period] || 1;
    const tariff = config.TARIFF_TZS_PER_KWH;
    const items: BreakdownItem[] = s.appliances.map((a) => {
      const dailyKwh = (a.basePower / 1000) * a.usageHoursPerDay;
      const kwh = dailyKwh * days;
      return {
        id: a.id,
        name: a.name,
        color: a.color,
        hoursPerDay: a.usageHoursPerDay,
        activeNow: a.active,
        kwh,
        cost: kwh * tariff,
        share: 0,
      };
    });
    const totalKwh = items.reduce((sum, i) => sum + i.kwh, 0);
    items.forEach((i) => (i.share = totalKwh ? (i.kwh / totalKwh) * 100 : 0));
    items.sort((a, b) => b.kwh - a.kwh);
    return { period, days, items, totalKwh, totalCost: totalKwh * tariff };
  },
}));
