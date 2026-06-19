import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, Plus, Smartphone, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AMOUNT_PRESETS, PAYMENT_PROVIDERS, config } from "@/lib/config";
import { useSimulation } from "@/store/simulation";
import { useTransactions } from "@/store/transactions";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { api } from "@/lib/api";
import { cn, formatKwh, formatNumber, formatTZS } from "@/lib/utils";
import type { Transaction } from "@/types";

type Step = "form" | "processing" | "success";

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useAuth((s) => s.profile);
  const topUp = useSimulation((s) => s.topUp);
  const snapshot = useSimulation((s) => s.snapshot);
  const addTransaction = useTransactions((s) => s.add);
  const pushNotification = useUi((s) => s.pushNotification);

  const [step, setStep] = useState<Step>("form");
  const [provider, setProvider] = useState<string>(PAYMENT_PROVIDERS[0].id);
  const [meter, setMeter] = useState(profile?.meter ?? "");
  const [amount, setAmount] = useState<number>(10000);
  const [result, setResult] = useState<{ units: number; balance: number; reconnected: boolean } | null>(null);

  const units = useMemo(() => amount / config.TARIFF_TZS_PER_KWH, [amount]);
  const fee = Math.round(amount * 0.01);
  const total = amount + fee;
  const valid = meter.replace(/\s+/g, "").length >= 6 && amount >= 500;

  async function pay() {
    if (!valid) return;
    setStep("processing");
    const balanceBefore = snapshot().balanceKwh;
    await new Promise((r) => setTimeout(r, 2200));

    topUp(units);
    const after = snapshot();
    const reconnected = balanceBefore <= 0 && after.balanceKwh > 0;

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      meterNumber: meter.replace(/\s+/g, ""),
      amount,
      unitsAdded: +units.toFixed(2),
      paymentMethod: provider,
      type: "topup",
      status: "completed",
      reference: `SLK${Date.now().toString().slice(-9)}`,
      fee,
      total,
      timestamp: new Date().toISOString(),
    };
    addTransaction(tx);

    pushNotification({
      title: t("payment.successTitle"),
      message: `${t("payment.unitsCredited")}: ${formatKwh(units)} · ${formatTZS(amount)}`,
      severity: "success",
    });

    if (profile?.phone) {
      api
        .sendSms({
          phone: profile.phone,
          meterNumber: tx.meterNumber,
          message: `SmartLUKU: ${formatKwh(units)} imeongezwa. Salio: ${formatKwh(after.balanceKwh)}. Asante!`,
        })
        .catch(() => undefined);
    }

    setResult({ units, balance: after.balanceKwh, reconnected });
    setStep("success");
  }

  if (step === "processing") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <Loader2 className="absolute h-20 w-20 animate-spin text-primary/30" />
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-6 text-xl font-bold">{t("payment.processing")}</h2>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t("payment.stkPush")}</p>
      </div>
    );
  }

  if (step === "success" && result) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-11 w-11 text-success" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold">{t("payment.successTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("payment.successBody")}</p>

        <Card className="mt-6 w-full">
          <CardContent className="divide-y divide-border p-0">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground">{t("payment.unitsCredited")}</span>
              <span className="text-lg font-bold text-success">+{formatKwh(result.units)}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground">{t("payment.newBalance")}</span>
              <span className="text-lg font-bold tabular-nums">{formatKwh(result.balance)}</span>
            </div>
          </CardContent>
        </Card>

        {result.reconnected && (
          <div className="mt-4 flex w-full items-center gap-2 rounded-xl bg-success/10 p-3 text-sm font-medium text-success">
            <Zap className="h-4 w-4" />
            {t("payment.autoReconnect")}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">{t("payment.smsReceipt")}</p>

        <div className="mt-6 flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
            {t("dashboard.buyUnits")}
          </Button>
          <Button className="flex-1" onClick={() => navigate("/")}>
            {t("payment.done")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold">{t("payment.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("payment.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("payment.selectProvider")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PAYMENT_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all",
                provider === p.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40",
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: p.color }}
              >
                {p.initials}
              </span>
              <span className="text-sm font-medium leading-tight">{p.name}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="meter">{t("payment.meterNumber")}</Label>
            <Input
              id="meter"
              inputMode="numeric"
              value={meter}
              onChange={(e) => setMeter(e.target.value)}
              placeholder="01234567890"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("payment.amount")}</Label>
            <div className="grid grid-cols-4 gap-2">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={cn(
                    "rounded-xl border py-2.5 text-sm font-semibold tabular-nums transition-all",
                    amount === preset
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {preset / 1000}k
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder={t("payment.customAmount")}
              className="tabular-nums"
            />
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("payment.estUnits")}</span>
              <span className="font-semibold text-success">{formatKwh(units)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("payment.fee")}</span>
              <span className="tabular-nums">{formatTZS(fee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>{t("payment.total")}</span>
              <span className="tabular-nums">{formatTZS(total)}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" disabled={!valid} onClick={pay}>
            <Plus className="h-5 w-5" />
            {t("payment.payNow")} · {formatNumber(units, 1)} kWh
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
