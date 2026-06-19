import { create } from "zustand";
import { STORAGE_KEYS, config } from "@/lib/config";
import { api } from "@/lib/api";
import type { Transaction } from "@/types";

function load(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.transactions);
    return raw ? (JSON.parse(raw) as Transaction[]) : seed();
  } catch {
    return [];
  }
}

/** A few historical demo payments so History/Analytics aren't empty on first run. */
function seed(): Transaction[] {
  const methods = ["mpesa", "airtel", "mixx", "card"];
  const now = Date.now();
  const items: Transaction[] = Array.from({ length: 6 }).map((_, i) => {
    const amount = [5000, 10000, 20000, 10000, 50000, 20000][i];
    const units = amount / config.TARIFF_TZS_PER_KWH;
    return {
      id: `seed-${i}`,
      meterNumber: "01234567890",
      amount,
      unitsAdded: +units.toFixed(2),
      paymentMethod: methods[i % methods.length],
      type: "topup",
      status: "completed",
      reference: `SLK${(now - i * 8.64e7).toString().slice(-8)}`,
      fee: Math.round(amount * 0.01),
      total: amount + Math.round(amount * 0.01),
      timestamp: new Date(now - i * 8.64e7 * 5).toISOString(),
    };
  });
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(items));
  return items;
}

interface TxStore {
  transactions: Transaction[];
  add: (tx: Transaction) => void;
}

export const useTransactions = create<TxStore>((set, get) => ({
  transactions: load(),
  add: (tx) => {
    const transactions = [tx, ...get().transactions];
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    set({ transactions });
    // Best-effort persistence to the backend; ignored if the DB is offline.
    api
      .createTransaction({
        id: tx.id,
        meterNumber: tx.meterNumber,
        amount: tx.amount,
        unitsAdded: tx.unitsAdded,
        paymentMethod: tx.paymentMethod,
        type: tx.type,
        status: tx.status,
        reference: tx.reference,
        fee: tx.fee,
        total: tx.total,
        timestamp: tx.timestamp,
      })
      .catch(() => undefined);
  },
}));
