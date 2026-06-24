import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Activity, Gauge, Plus, TriangleAlert, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { useSimulation } from "@/store/simulation";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { useSettings } from "@/store/settings";
import { api } from "@/lib/api";
import { config } from "@/lib/config";
import { dailyUsageSeries } from "@/lib/series";
import { formatKwh, formatNumber, formatTZS } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";
import { getUserNetwork, STATUS_COLOR, STATUS_LABEL } from "@/lib/tanzania-data";

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useSimulation((s) => s.state);
  const snapshot = useSimulation((s) => s.snapshot);
  const profile = useAuth((s) => s.profile);
  const pushNotification = useUi((s) => s.pushNotification);
  const settings = useSettings();

  const snap = snapshot();
  const animatedBalance = useCountUp(snap.balanceKwh);
  const series = useMemo(() => dailyUsageSeries(snap.meterNumber), [snap.meterNumber]);
  const userNet = useMemo(() => getUserNetwork(profile), [profile]);

  const low = snap.balanceKwh < settings.smsThreshold + config.LOW_BALANCE_KWH;
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (low && !notifiedRef.current) {
      notifiedRef.current = true;
      pushNotification({
        title: t("dashboard.lowBalanceWarning"),
        message: `${t("common.balance")}: ${formatKwh(snap.balanceKwh)}`,
        severity: snap.balanceKwh < config.CRITICAL_BALANCE_KWH ? "danger" : "warning",
      });
      if (settings.smsAlerts && profile?.phone) {
        api
          .lowBalanceSms({
            phone: profile.phone,
            balanceKwh: +snap.balanceKwh.toFixed(1),
            meterNumber: snap.meterNumber,
          })
          .catch(() => undefined);
      }
    }
    if (!low) notifiedRef.current = false;
  }, [low, snap.balanceKwh, snap.meterNumber, pushNotification, settings, profile, t]);

  const daysLeft = snap.estDaysLeft;
  const tzsValue = snap.balanceKwh * config.TARIFF_TZS_PER_KWH;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{t("dashboard.greeting")}</p>
        <h2 className="text-2xl font-extrabold tracking-tight">
          {profile?.firstName ?? profile?.fullName ?? "Karibu"}
        </h2>
      </div>

      {low && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-warning animate-fade-in">
          <TriangleAlert className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium text-foreground">{t("dashboard.lowBalanceWarning")}</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-primary-foreground/80">{t("dashboard.balanceCard")}</p>
              <Badge
                variant="secondary"
                className={`gap-1.5 border-0 ${snap.connected ? "bg-white/15 text-white" : "bg-destructive/30 text-white"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${snap.connected ? "bg-success animate-pulse-ring" : "bg-destructive"}`}
                />
                {snap.connected ? t("dashboard.powerFlowing") : t("dashboard.powerOff")}
              </Badge>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-extrabold tabular-nums tracking-tight">
                {formatNumber(animatedBalance, 1)}
              </span>
              <span className="mb-1.5 text-lg font-semibold text-primary-foreground/80">kWh</span>
            </div>
            <p className="mt-1 text-sm text-primary-foreground/80">≈ {formatTZS(tzsValue)}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-primary-foreground/90">
              <span>
                {t("dashboard.daysLeft")}:{" "}
                <strong className="tabular-nums">
                  {daysLeft != null ? formatNumber(daysLeft, 1) : "—"}
                </strong>
              </span>
              <span>
                {t("dashboard.powerNow")}:{" "}
                <strong className="tabular-nums">{formatNumber(snap.currentPowerKw, 2)} kW</strong>
              </span>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="mt-5 w-full sm:w-auto"
              onClick={() => navigate("/payment")}
            >
              <Plus className="h-5 w-5" />
              {t("dashboard.buyUnits")}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-card" onClick={() => navigate("/network")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("dashboard.yourNetwork")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{userNet.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: STATUS_COLOR[userNet.status] }}
              />
              <span className="text-sm font-medium" style={{ color: STATUS_COLOR[userNet.status] }}>
                {STATUS_LABEL[userNet.status]}
              </span>
              <span className="ml-auto text-sm text-muted-foreground">{userNet.uptime}%</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {userNet.customers.toLocaleString()} {t("network.customers").toLowerCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("dashboard.usedToday")}
          value={formatKwh(snap.usageTodayKwh, 2)}
          icon={Activity}
        />
        <StatCard
          label={t("dashboard.powerNow")}
          value={`${formatNumber(snap.currentPowerKw, 2)} kW`}
          icon={Zap}
          tone={snap.currentPowerKw > 2.5 ? "warning" : "default"}
        />
        <StatCard
          label={t("dashboard.voltage")}
          value={`${formatNumber(snap.voltage, 0)} V`}
          icon={Gauge}
          tone={snap.voltage < 215 || snap.voltage > 245 ? "destructive" : "success"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.usageTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--border))" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} kWh`, t("common.units")]}
                />
                <Area
                  type="monotone"
                  dataKey="kwh"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2.5}
                  fill="url(#usageFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Last update: {new Date(state.lastUpdated).toLocaleTimeString("en-GB")}
      </p>
    </div>
  );
}
