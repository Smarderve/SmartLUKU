import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Coins, Receipt, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulation } from "@/store/simulation";
import { monthlyUsageSeries } from "@/lib/series";
import { formatKwh, formatNumber, formatTZS } from "@/lib/utils";
import { config } from "@/lib/config";

type Period = "daily" | "weekly" | "monthly";

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const snapshot = useSimulation((s) => s.snapshot);
  const breakdown = useSimulation((s) => s.breakdown);
  const [period, setPeriod] = useState<Period>("daily");

  const meter = snapshot().meterNumber;
  const months = useMemo(() => monthlyUsageSeries(meter), [meter]);
  const bd = useMemo(() => breakdown(period), [breakdown, period]);

  const thisMonth = months[months.length - 1];
  const maxKwh = Math.max(...bd.items.map((i) => i.kwh), 1);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("analytics.monthlyUsage")}
          value={formatKwh(thisMonth.kwh, 0)}
          icon={Zap}
        />
        <StatCard
          label={t("analytics.monthlySpend")}
          value={formatTZS(thisMonth.cost)}
          icon={Receipt}
        />
        <StatCard
          label={t("analytics.avgCost")}
          value={formatTZS(config.TARIFF_TZS_PER_KWH)}
          icon={Coins}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.monthlyUsage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={months} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} kWh`, t("common.units")]}
                />
                <Line
                  type="monotone"
                  dataKey="kwh"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("analytics.byAppliance")}</CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="h-9">
              <TabsTrigger value="daily">{t("analytics.daily")}</TabsTrigger>
              <TabsTrigger value="weekly">{t("analytics.weekly")}</TabsTrigger>
              <TabsTrigger value="monthly">{t("analytics.monthly")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-3">
          {bd.items.map((item) => (
            <div key={item.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatKwh(item.kwh)} · {formatTZS(item.cost)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(item.kwh / maxKwh) * 100}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 text-sm font-semibold">
            <span>{t("payment.total")}</span>
            <span className="tabular-nums">
              {formatNumber(bd.totalKwh, 1)} kWh · {formatTZS(bd.totalCost)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
