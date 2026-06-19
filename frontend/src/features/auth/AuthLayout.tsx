import { useTranslation } from "react-i18next";
import { Logo } from "@/components/layout/Logo";
import { Zap, ShieldCheck, Activity } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <Logo className="[&_p]:text-primary-foreground" />
        <div className="space-y-6">
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">
            {t("app.tagline")}
          </h2>
          <ul className="space-y-3 text-primary-foreground/90">
            <li className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-accent" /> Lipa, umeme unaongezwa moja kwa moja
            </li>
            <li className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-accent" /> Fuatilia salio na matumizi moja kwa moja
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" /> Hakuna tokeni ya kuandika tena
            </li>
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/70">TANESCO LUKU - SmartLUKU prototype</p>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
