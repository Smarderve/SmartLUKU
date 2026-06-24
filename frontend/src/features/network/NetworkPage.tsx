import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CircleDot, HelpCircle, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NetworkMap } from "./NetworkMap";
import { useAuth } from "@/store/auth";
import { useReportOutage } from "@/lib/hooks";
import { toast } from "@/components/ui/toast";
import {
  getNetworkGeometry,
  getNetworkSummary,
  getNetworksForScope,
  getUserNetwork,
  STATUS_COLOR,
  STATUS_LABEL,
  type NetworkStatus,
} from "@/lib/tanzania-data";
import { formatDate, formatDuration } from "@/lib/utils";

type Scope = "mine" | "region" | "national";

const severityVariant: Record<string, "success" | "warning" | "destructive"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

export default function NetworkPage() {
  const { t } = useTranslation();
  const profile = useAuth((s) => s.profile);
  const reportOutage = useReportOutage();

  const userNet = useMemo(() => getUserNetwork(profile), [profile]);
  const [scope, setScope] = useState<Scope>("national");
  const [selectedId, setSelectedId] = useState<string>(userNet.id);
  const [reportOpen, setReportOpen] = useState(false);
  const [desc, setDesc] = useState("");

  const networks = useMemo(() => getNetworksForScope(scope, profile), [scope, profile]);
  const summary = useMemo(() => getNetworkSummary(), []);
  const selected = networks.find((n) => n.id === selectedId) ?? userNet;

  function submitReport() {
    const geo = getNetworkGeometry(selected);
    reportOutage.mutate(
      {
        lat: geo.substation.lat,
        lng: geo.substation.lng,
        description: desc || "Power outage reported",
        region: selected.region,
        meterNumber: profile?.meter,
        reporterPhone: profile?.phone,
      },
      {
        onSuccess: () => {
          toast.success(t("network.reportOutage"), selected.name);
          setReportOpen(false);
          setDesc("");
        },
      },
    );
  }

  const statusCounts: { key: NetworkStatus; value: number }[] = [
    { key: "operational", value: summary.operational },
    { key: "maintenance", value: summary.maintenance },
    { key: "down", value: summary.down },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t("network.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("network.subtitle")}</p>
        </div>
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
          <TabsList>
            <TabsTrigger value="mine">{t("network.scopeMine")}</TabsTrigger>
            <TabsTrigger value="region">{t("network.scopeRegion")}</TabsTrigger>
            <TabsTrigger value="national">{t("network.scopeNational")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {statusCounts.map((s) => (
          <Card key={s.key} className="p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[s.key] }} />
              <span className="text-sm text-muted-foreground">{t(`network.${s.key}`)}</span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
          </Card>
        ))}
        <Card className="p-4">
          <span className="text-sm text-muted-foreground">{t("network.uptime")}</span>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">{summary.avgUptime}%</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NetworkMap networks={networks} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t("network.lineReport")}
              </CardTitle>
              {selected.id === userNet.id && <Badge>{t("network.scopeMine")}</Badge>}
            </div>
            <p className="text-lg font-bold leading-tight">{selected.name}</p>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: STATUS_COLOR[selected.status] }}
              />
              <span className="text-sm font-semibold" style={{ color: STATUS_COLOR[selected.status] }}>
                {STATUS_LABEL[selected.status]}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric icon={CircleDot} label={t("network.uptime")} value={`${selected.uptime}%`} />
              <Metric
                icon={Users}
                label={t("network.customers")}
                value={selected.customers.toLocaleString()}
              />
              <Metric
                icon={AlertCircle}
                label={t("network.downtime30d")}
                value={formatDuration(selected.downtime30dMin)}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>{t("network.isItMe")}</strong>{" "}
                {selected.status === "operational"
                  ? "Gridi inafanya kazi vizuri — kama umeme umekatika, angalia salio lako."
                  : "Kuna tatizo kwenye gridi hii kwa sasa."}
              </span>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">{t("network.incidents")}</p>
              <div className="space-y-2">
                {selected.incidents.slice(0, 4).map((inc) => (
                  <div key={inc.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{inc.cause}</span>
                      <Badge variant={severityVariant[inc.severity]}>
                        {formatDuration(inc.durationMin)}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(inc.date)}</span>
                      {!inc.resolved && (
                        <span className="font-semibold text-destructive">{t("network.ongoing")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setReportOpen(true)}
            >
              <MapPin className="h-4 w-4" />
              {t("network.reportOutage")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("network.reportOutage")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="desc">{selected.name}</Label>
            <Input
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Eleza tatizo (hiari)..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submitReport} disabled={reportOutage.isPending}>
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleDot;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/60 p-2.5">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-sm font-bold tabular-nums">{value}</p>
      <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}
