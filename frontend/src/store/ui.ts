import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/config";
import type { NotificationItem } from "@/types";

export type Theme = "light" | "dark";
export type Language = "sw" | "en";

function initTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEYS.theme) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEYS.language) as Language | null;
  return stored === "en" ? "en" : "sw";
}

function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notifications);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
  } catch {
    return [];
  }
}

interface UiStore {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  notifications: NotificationItem[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
  pushNotification: (n: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export const useUi = create<UiStore>((set, get) => ({
  theme: initTheme(),
  language: initLanguage(),
  sidebarOpen: false,
  notifications: loadNotifications(),

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
  setLanguage: (language) => {
    localStorage.setItem(STORAGE_KEYS.language, language);
    set({ language });
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  pushNotification: (n) =>
    set((s) => {
      const item: NotificationItem = {
        ...n,
        id: Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
        read: false,
      };
      const notifications = [item, ...s.notifications].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
      return { notifications };
    }),
  markAllRead: () =>
    set((s) => {
      const notifications = s.notifications.map((n) => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
      return { notifications };
    }),
  clearNotifications: () => {
    localStorage.removeItem(STORAGE_KEYS.notifications);
    set({ notifications: [] });
  },
}));
