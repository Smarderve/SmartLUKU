import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Activity, Gauge, Power, Waves, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { useSimulation } from "@/store/simulation";
import { hourlyLoadSeries } from "@/lib/series";
import { formatKwh, formatNumber } from "@/lib/utils";

export default function MonitoringPage() {
  const { t } = useTranslation();
  const state = useSimulation((s) => s.state);
  const snapshot = useSimulation((s) => s.snapshot);
  const toggleAppliance = useSimulation((s) => s.toggleAppliance);
  const snap = snapshot();

  const load = useMemo(() => hourlyLoadSeries(snap.meterNumber), [snap.meterNumber]);
  const peakHour = useMemo(
    () => load.reduce((max, p) => (p.kw > max.kw ? p : max), load[0]),
    [load],
  );

  const sensors = state.sensors;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("monitoring.currentDraw")}
          value={`${formatNumber(snap.currentPowerKw, 2)} kW`}
          icon={Zap}
          tone={snap.currentPowerKw > 2.5 ? "warning" : "default"}
        />
        <StatCard
          label={t("monitoring.voltage")}
          value={`${formatNumber(sensors.voltage?.value ?? 230, 0)} V`}
          icon={Gauge}
          tone="success"
        />
        <StatCard
          label={t("monitoring.frequency")}
          value={`${formatNumber(sensors.frequency?.value ?? 50, 2)} Hz`}
          icon={Waves}
        />
        <StatCard
          label={t("monitoring.connection")}
          value={snap.connected ? t("common.active") : t("common.offline")}
          icon={Power}
          tone={snap.connected ? "success" : "destructive"}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("monitoring.peakHours")}</CardTitle>
            <Badge variant="warning">
              {t("monitoring.peakHours")}: {peakHour.hour}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={load} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    interval={3}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v} kW`, t("monitoring.currentDraw")]}
                  />
                  <Bar dataKey="kw" radius={[4, 4, 0, 0]}>
                    {load.map((entry) => (
                      <Cell
                        key={entry.hour}
                        fill={
                          entry.hour === peakHour.hour
                            ? "hsl(var(--warning))"
                            : "hsl(var(--secondary))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("monitoring.todayUsage")}: <strong>{formatKwh(snap.usageTodayKwh, 2)}</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("monitoring.appliances")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.appliances.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${a.color}22`, color: a.color }}
                >
                  <Activity className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {a.active ? `${a.power} W` : "0 W"} · {a.basePower} W max
                  </p>
                </div>
                <Switch checked={a.active} onCheckedChange={() => toggleAppliance(a.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
