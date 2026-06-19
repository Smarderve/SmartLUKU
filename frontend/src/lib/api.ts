import { config } from "./config";
import type {
  ChatMessage,
  ConsumptionLog,
  HealthStatus,
  OutageReport,
  Transaction,
} from "@/types";

export class ApiError extends Error {
  status: number;
  offline: boolean;
  constructor(message: string, status: number, offline = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.offline = offline;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.API_TIMEOUT_MS);
  try {
    const res = await fetch(`${config.API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new ApiError(
        data?.error || res.statusText,
        res.status,
        Boolean(data?.offline),
      );
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw new ApiError((err as Error).message || "Network error", 0);
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  health: () => request<HealthStatus>("/health"),

  smsStatus: () => request<Record<string, unknown>>("/sms/status"),
  sendSms: (body: { phone: string; message: string; meterNumber?: string }) =>
    request<unknown>("/sms/send", { method: "POST", body: JSON.stringify(body) }),
  lowBalanceSms: (body: {
    phone: string;
    balanceKwh: number;
    meterNumber?: string;
    topUpUrl?: string;
  }) => request<unknown>("/sms/low-balance", { method: "POST", body: JSON.stringify(body) }),

  chat: (body: { messages: ChatMessage[]; usageContext?: unknown }) =>
    request<{ reply: string; demo?: boolean }>("/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getUser: (meter: string) => request<Record<string, unknown>>(`/users/${meter}`),
  saveUser: (meter: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/users/${meter}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getTransactions: (params: { meter?: string; type?: string; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.meter) q.set("meter", params.meter);
    if (params.type) q.set("type", params.type);
    if (params.limit) q.set("limit", String(params.limit));
    return request<{ transactions: Transaction[] }>(`/transactions?${q.toString()}`);
  },
  createTransaction: (body: Partial<Transaction> & { meterNumber: string; amount: number }) =>
    request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(body) }),

  getConsumption: (params: { meter: string; days?: number; limit?: number }) => {
    const q = new URLSearchParams({ meter: params.meter });
    if (params.days) q.set("days", String(params.days));
    if (params.limit) q.set("limit", String(params.limit));
    return request<{ logs: ConsumptionLog[] }>(`/consumption?${q.toString()}`);
  },
  logConsumption: (body: Partial<ConsumptionLog> & { meterNumber: string; unitsUsed: number }) =>
    request<ConsumptionLog>("/consumption", { method: "POST", body: JSON.stringify(body) }),

  getOutages: (limit = 200) =>
    request<{ reports: OutageReport[] }>(`/outages?limit=${limit}`),
  createOutage: (body: Partial<OutageReport> & { lat: number; lng: number }) =>
    request<OutageReport>("/outages", { method: "POST", body: JSON.stringify(body) }),

  getSimulation: (meter: string) =>
    request<{ meterNumber: string; state: unknown; updatedAt: string }>(`/simulation/${meter}`),
  saveSimulation: (meter: string, state: unknown) =>
    request<{ meterNumber: string; saved: boolean }>(`/simulation/${meter}`, {
      method: "POST",
      body: JSON.stringify({ state }),
    }),
};
