import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, seedDemoProfile } from "@/store/auth";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [meter, setMeter] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = meter.replace(/\s+/g, "");
    if (value.length < 6) {
      setError("Enter a valid meter number");
      return;
    }
    login(value);
    navigate("/", { replace: true });
  }

  function demo() {
    seedDemoProfile();
    navigate("/", { replace: true });
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{t("auth.loginTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="meter">{t("auth.meterNumber")}</Label>
          <Input
            id="meter"
            inputMode="numeric"
            placeholder="01234567890"
            value={meter}
            onChange={(e) => {
              setMeter(e.target.value);
              setError("");
            }}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t("auth.login")}
        </Button>
      </form>
      <Button variant="outline" className="mt-3 w-full" onClick={demo}>
        {t("auth.demo")}
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          {t("auth.register")}
        </Link>
      </p>
    </AuthLayout>
  );
}
