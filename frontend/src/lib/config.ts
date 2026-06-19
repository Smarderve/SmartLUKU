/** Runtime configuration ported from src/js/config.js. */
export const config = {
  /** Vite dev proxy forwards /api to the Express backend on :3001. */
  API_BASE: "/api",
  API_TIMEOUT_MS: 8000,
  SMS_THRESHOLD_KWH: 20,
  SMS_COOLDOWN_MS: 300_000,
  TARIFF_TZS_PER_KWH: 292,
  AVG_DAILY_KWH_FALLBACK: 6,
  LOW_BALANCE_KWH: 100,
  CRITICAL_BALANCE_KWH: 20,
} as const;

export const STORAGE_KEYS = {
  user: "smartluku-user",
  profile: "smartluku-profile",
  theme: "smartluku-theme",
  language: "smartluku-language",
  simulation: "smartluku_simulation",
  transactions: "smartluku_transactions",
  consumption: "smartluku_consumption",
  settings: "smartluku_settings",
  notifications: "smartluku_notification_inbox",
  outageReports: "smartluku_outage_reports",
  smsLog: "smartluku_sms_log",
} as const;

export const PAYMENT_PROVIDERS = [
  { id: "mpesa", name: "M-Pesa", color: "#e1140a", initials: "M" },
  { id: "mixx", name: "Mixx by Yas", color: "#0a4ea2", initials: "Y" },
  { id: "airtel", name: "Airtel Money", color: "#e40000", initials: "A" },
  { id: "halopesa", name: "HaloPesa", color: "#f57c00", initials: "H" },
  { id: "card", name: "Card / Bank", color: "#1f5a3d", initials: "C" },
] as const;

export const AMOUNT_PRESETS = [5000, 10000, 20000, 50000];
