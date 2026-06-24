import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Cpu, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { useSettings } from "@/store/settings";
import { useSimulation } from "@/store/simulation";
import { toast } from "@/components/ui/toast";
import { regions } from "@/lib/tanzania-data";

export default function SettingsPage() {
  const { t } = useTranslation();
  const profile = useAuth((s) => s.profile);
  const updateProfile = useAuth((s) => s.updateProfile);
  const { theme, setTheme, language, setLanguage } = useUi();
  const settings = useSettings();
  const appliances = useSimulation((s) => s.state.appliances);
  const toggleAppliance = useSimulation((s) => s.toggleAppliance);

  const [form, setForm] = useState({
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
  });

  function saveProfile() {
    updateProfile(form);
    toast.success(t("common.save"), t("settings.profile"));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 flex w-full flex-wrap">
          <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.notifications")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("settings.preferences")}</TabsTrigger>
          <TabsTrigger value="devices">{t("settings.devices")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("settings.fullName")}</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("settings.phone")}</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("settings.email")}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("settings.region")}</Label>
                  <Input disabled value={profile?.regionName ?? regions[profile?.region ?? ""]?.name ?? "-"} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("common.meter")}</Label>
                  <Input disabled value={profile?.meter ?? "-"} />
                </div>
              </div>
              <Button onClick={saveProfile}>
                <Save className="h-4 w-4" />
                {t("common.save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("settings.smsAlerts")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.lowBalanceWarning")}
                  </p>
                </div>
                <Switch
                  checked={settings.smsAlerts}
                  onCheckedChange={(v) => settings.update({ smsAlerts: v })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.smsThreshold")}</Label>
                <Input
                  type="number"
                  value={settings.smsThreshold}
                  onChange={(e) => settings.update({ smsThreshold: Number(e.target.value) })}
                  className="max-w-[8rem] tabular-nums"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.preferences")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="mb-2 block">{t("settings.language")}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={language === "sw" ? "default" : "outline"}
                    onClick={() => setLanguage("sw")}
                  >
                    Kiswahili
                  </Button>
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    onClick={() => setLanguage("en")}
                  >
                    English
                  </Button>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">{t("settings.theme")}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                  >
                    {t("settings.themeLight")}
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                  >
                    {t("settings.themeDark")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.devices")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appliances.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: `${a.color}22`, color: a.color }}
                  >
                    <Cpu className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.basePower} W</p>
                  </div>
                  <Badge variant={a.active ? "success" : "secondary"}>
                    {a.active ? t("common.active") : t("common.offline")}
                  </Badge>
                  <Switch checked={a.active} onCheckedChange={() => toggleAppliance(a.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
