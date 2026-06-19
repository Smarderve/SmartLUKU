import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Receipt as ReceiptIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransactions } from "@/store/transactions";
import { PAYMENT_PROVIDERS } from "@/lib/config";
import { formatDateTime, formatKwh, formatTZS } from "@/lib/utils";
import type { Transaction } from "@/types";

const PAGE_SIZE = 8;

function providerName(id: string) {
  return PAYMENT_PROVIDERS.find((p) => p.id === id)?.name ?? id;
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const transactions = useTransactions((s) => s.transactions);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const filtered = useMemo(
    () =>
      transactions
        .filter((tx) => filter === "all" || tx.paymentMethod === filter)
        .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    [transactions, filter],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function exportCsv() {
    const header = ["Date", "Method", "Amount", "Units", "Status", "Reference"];
    const lines = filtered.map((tx) =>
      [
        new Date(tx.timestamp).toISOString(),
        providerName(tx.paymentMethod),
        tx.amount,
        tx.unitsAdded,
        tx.status,
        tx.reference,
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smartluku-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-44">
          <Select
            value={filter}
            onValueChange={(v) => {
              setFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("history.filterAll")}</SelectItem>
              {PAYMENT_PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="h-4 w-4" />
          {t("history.exportCsv")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              {t("history.noData")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">{t("history.date")}</th>
                    <th className="px-4 py-3 font-medium">{t("history.method")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("history.amount")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("history.units")}</th>
                    <th className="px-4 py-3 font-medium">{t("history.status")}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="whitespace-nowrap px-4 py-3">{formatDateTime(tx.timestamp)}</td>
                      <td className="px-4 py-3">{providerName(tx.paymentMethod)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatTZS(tx.amount)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-success">
                        +{formatKwh(tx.unitsAdded)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">{tx.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setReceipt(tx)}>
                          <ReceiptIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ‹
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {page + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </Button>
        </div>
      )}

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("history.receipt")}</DialogTitle>
            <DialogDescription>{receipt?.reference}</DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="space-y-2 text-sm">
              <Row label={t("history.date")} value={formatDateTime(receipt.timestamp)} />
              <Row label={t("common.meter")} value={receipt.meterNumber} />
              <Row label={t("history.method")} value={providerName(receipt.paymentMethod)} />
              <Row label={t("history.amount")} value={formatTZS(receipt.amount)} />
              <Row label={t("payment.fee")} value={formatTZS(receipt.fee)} />
              <Row label={t("payment.total")} value={formatTZS(receipt.total)} bold />
              <Row label={t("payment.unitsCredited")} value={`+${formatKwh(receipt.unitsAdded)}`} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold tabular-nums" : "tabular-nums"}>{value}</span>
    </div>
  );
}
