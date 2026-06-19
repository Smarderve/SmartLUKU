import { create } from "zustand";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "warning" | "destructive";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id" | "variant" | "duration"> & Partial<ToastItem>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = {
      id,
      title: t.title,
      description: t.description,
      variant: t.variant ?? "default",
      duration: t.duration ?? 4500,
    };
    set((s) => ({ toasts: [...s.toasts, item] }));
    if (item.duration > 0) {
      setTimeout(() => get().dismiss(id), item.duration);
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Imperative helper usable outside React components. */
export const toast = {
  show: (title: string, opts?: Partial<ToastItem>) =>
    useToastStore.getState().push({ title, ...opts }),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: "destructive" }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: "warning" }),
};

const icons = {
  default: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: XCircle,
};

const accent = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-popover p-4 shadow-card animate-fade-in"
            role="status"
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", accent[t.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
