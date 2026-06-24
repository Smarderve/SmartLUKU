import { create } from "zustand";
import { STORAGE_KEYS, config } from "@/lib/config";

interface SettingsState {
  smsThreshold: number;
  smsAlerts: boolean;
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (raw) return { smsThreshold: config.SMS_THRESHOLD_KWH, smsAlerts: true, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { smsThreshold: config.SMS_THRESHOLD_KWH, smsAlerts: true };
}

interface SettingsStore extends SettingsState {
  update: (patch: Partial<SettingsState>) => void;
}

export const useSettings = create<SettingsStore>((set, get) => ({
  ...load(),
  update: (patch) => {
    const next = { ...get(), ...patch };
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ smsThreshold: next.smsThreshold, smsAlerts: next.smsAlerts }),
    );
    set(patch);
  },
}));
