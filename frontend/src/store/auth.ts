import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/config";
import type { UserProfile } from "@/types";

function safeParse<T>(str: string | null): T | null {
  try {
    return str ? (JSON.parse(str) as T) : null;
  } catch {
    return null;
  }
}

function loadProfile(): UserProfile | null {
  const profile = safeParse<UserProfile>(localStorage.getItem(STORAGE_KEYS.profile));
  if (profile?.meter) return profile;
  const meter = localStorage.getItem(STORAGE_KEYS.user);
  if (meter) return { meter };
  return null;
}

interface AuthStore {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  login: (meter: string, profile?: Partial<UserProfile>) => void;
  register: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  logout: () => void;
}

const DEMO_PROFILE: UserProfile = {
  meter: "01234567890",
  firstName: "Asha",
  lastName: "Mwananchi",
  fullName: "Asha Mwananchi",
  phone: "+255 712 000 000",
  email: "asha@example.co.tz",
  region: "dar",
  regionName: "Dar es Salaam",
  district: "kinondoni",
  districtName: "Kinondoni",
  street: "Msasani",
};

export const useAuth = create<AuthStore>((set, get) => ({
  profile: loadProfile(),
  isAuthenticated: Boolean(loadProfile()),

  login: (meter, profile) => {
    const next: UserProfile = { ...(get().profile ?? {}), ...profile, meter };
    localStorage.setItem(STORAGE_KEYS.user, meter);
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
    set({ profile: next, isAuthenticated: true });
  },

  register: (profile) => {
    localStorage.setItem(STORAGE_KEYS.user, profile.meter);
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    set({ profile, isAuthenticated: true });
  },

  updateProfile: (patch) => {
    const next = { ...(get().profile ?? { meter: "" }), ...patch } as UserProfile;
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
    if (next.meter) localStorage.setItem(STORAGE_KEYS.user, next.meter);
    set({ profile: next });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.profile);
    set({ profile: null, isAuthenticated: false });
  },
}));

/** Seeds a demo profile for quick exploration (used by the login screen). */
export function seedDemoProfile() {
  useAuth.getState().register(DEMO_PROFILE);
}
