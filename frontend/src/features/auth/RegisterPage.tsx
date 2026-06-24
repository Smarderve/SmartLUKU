import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/store/auth";
import { getDistricts, getRegions, regions } from "@/lib/tanzania-data";
import type { UserProfile } from "@/types";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);
  const [form, setForm] = useState({
    meter: "",
    firstName: "",
    lastName: "",
    phone: "",
    region: "",
    district: "",
  });

  const districts = useMemo(
    () => (form.region ? getDistricts(form.region) : []),
    [form.region],
  );

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value, ...(key === "region" ? { district: "" } : {}) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const profile: UserProfile = {
      meter: form.meter.replace(/\s+/g, ""),
      firstName: form.firstName,
      lastName: form.lastName,
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      phone: form.phone,
      region: form.region,
      regionName: regions[form.region]?.name,
      district: form.district,
      districtName: districts.find((d) => d.code === form.district)?.name,
    };
    register(profile);
    navigate("/", { replace: true });
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{t("auth.registerTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.registerSubtitle")}</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">{t("settings.fullName")}</Label>
            <Input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">&nbsp;</Label>
            <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meter">{t("auth.meterNumber")}</Label>
          <Input
            id="meter"
            inputMode="numeric"
            placeholder="01234567890"
            value={form.meter}
            onChange={(e) => set("meter", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t("settings.phone")}</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+255 7..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("settings.region")}</Label>
            <Select value={form.region} onValueChange={(v) => set("region", v)}>
              <SelectTrigger>
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                {getRegions().map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("settings.district")}</Label>
            <Select value={form.district} onValueChange={(v) => set("district", v)} disabled={!form.region}>
              <SelectTrigger>
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.code} value={d.code}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t("auth.register")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </AuthLayout>
  );
}
