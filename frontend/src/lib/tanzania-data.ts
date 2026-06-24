/**
 * Tanzania regions/districts/streets + simulated TANESCO distribution networks.
 * Ported from the legacy src/js/tanzania-data.js with deterministic, seeded
 * statuses so the network map stays stable within a session.
 */

export type NetworkStatus = "operational" | "maintenance" | "down";

export interface DistrictData {
  name: string;
  streets: string[];
}

export interface RegionData {
  name: string;
  districts: Record<string, DistrictData>;
}

export interface Incident {
  id: string;
  date: Date;
  durationMin: number;
  cause: string;
  resolved: boolean;
  severity: "low" | "medium" | "high";
}

export interface Network {
  id: string;
  name: string;
  region: string;
  district: string;
  color: string;
  status: NetworkStatus;
  uptime: number;
  customers: number;
  voltage: number;
  loadPct: number;
  incidents: Incident[];
  downtime30dMin: number;
  lastIncident: Incident | null;
}

export interface NetworkSummary {
  total: number;
  operational: number;
  maintenance: number;
  down: number;
  customers: number;
  avgUptime: number;
}

export interface UserLikeProfile {
  region?: string;
  district?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NetworkGeometry {
  hub: LatLng;
  substation: LatLng;
  branches: Array<LatLng & { street: string }>;
  trunk: [number, number][];
  branchLines: [number, number][][];
}

interface RawNetwork {
  id: string;
  name: string;
  region: string;
  district: string;
  color: string;
}

export const regions: Record<string, RegionData> = {
  dar: {
    name: "Dar es Salaam",
    districts: {
      kinondoni: {
        name: "Kinondoni",
        streets: ["Bagamoyo Rd", "Toure Dr", "Morogoro Rd", "Chang'ombe Rd", "Haile Selassie Rd", "Ali Hassan Mwinyi Rd", "Kalamkamba", "Mlandizi", "Msasani"],
      },
      ilala: {
        name: "Ilala",
        streets: ["Nelson Mandela Rd", "Samora Machel Ave", "Mosque St", "Kenyatta Rd", "Sokoine Dr", "Maktaba St", "Mikocheni", "Jamhuri St", "Zanaki St"],
      },
      temeke: {
        name: "Temeke",
        streets: ["Temeke Main Rd", "Makonde Rd", "Mtakuja Rd", "Industrial Area", "Chalinze", "Tandika", "Mbagala", "Mjimwema", "Dar Port Area"],
      },
    },
  },
  arusha: {
    name: "Arusha",
    districts: {
      "arusha-urban": {
        name: "Arusha Urban",
        streets: ["Goliondoi Rd", "Serengeti Rd", "Bomas Rd", "Clock Tower", "Uhuru Monument", "Stadium Road", "Arusha Town Centre", "Sam Nujoma Rd", "Makao"],
      },
      "arusha-rural": {
        name: "Arusha Rural",
        streets: ["Moshi Road", "Namanga Road", "Usa River", "Maweni", "Mabwe", "Mateves", "Maji", "Arusha National Park Road", "Kilimanjaro Road"],
      },
      moshi: {
        name: "Moshi",
        streets: ["Main Street", "New Street", "Kilimanjaro Rd", "Kibo Road", "Market Street", "Stadium Road", "Majengo", "Uru", "Mandileo"],
      },
    },
  },
  dodoma: {
    name: "Dodoma",
    districts: {
      "dodoma-urban": {
        name: "Dodoma Urban",
        streets: ["Independence Ave", "Lumumba St", "Samora Machel Ave", "Swahili St", "Democracy St", "Makonde St", "Njombe Rd", "Makurumimba", "Stadium Rd"],
      },
      "dodoma-rural": {
        name: "Dodoma Rural",
        streets: ["Dar Road", "Iringa Road", "Chalinze", "Morogoro", "Msalato", "Mlandizi", "Chamwino", "Bahi", "Singida Road"],
      },
      bahi: {
        name: "Bahi",
        streets: ["Bahi Main Rd", "Mlandizi Rd", "Singida Road", "Dodoma Road", "Bashnet", "Ibagwa", "Magangani", "Chilika", "Nsukusumo"],
      },
    },
  },
  mbeya: {
    name: "Mbeya",
    districts: {
      "mbeya-urban": {
        name: "Mbeya Urban",
        streets: ["Nelson Mandela St", "Independence Ave", "Kefa Road", "Tanzam Road", "Mbeya Town Centre", "Hospital St", "Nkumbi", "Mbalizi", "Chunya"],
      },
      "mbeya-rural": {
        name: "Mbeya Rural",
        streets: ["Mbeya-Iringa Rd", "Rungwe Road", "Songwe", "Mbezi", "Msenda", "Mbeya-Zambia Border", "Chunya Road", "Malangi", "Kapologwe"],
      },
      rungwe: {
        name: "Rungwe",
        streets: ["Rungwe Main Rd", "Kyela Road", "Lake Tanganyika Rd", "Kiwira", "Busokelo", "Masoko", "Mbeya Road", "Ndumbi", "Lusungu"],
      },
    },
  },
  morogoro: {
    name: "Morogoro",
    districts: {
      "morogoro-urban": {
        name: "Morogoro Urban",
        streets: ["Dar Road", "Iringa Road", "Market Street", "Morogoro Town Centre", "Station Rd", "Kikundi St", "Kichangani", "Miembeni", "Buguruni"],
      },
      "morogoro-rural": {
        name: "Morogoro Rural",
        streets: ["Dar-Iringa Rd", "Uluguru Mts", "Mvomero Road", "Mlandizi", "Chalinze", "Mikumi", "Mikumi National Park", "Mazava", "Udekwa"],
      },
      mvomero: {
        name: "Mvomero",
        streets: ["Mvomero Main Rd", "Morogoro Rd", "Berega", "Madibira", "Turiani", "Mgeta", "Dakawa", "Choma", "Lukosi"],
      },
    },
  },
  "dar-coastal": {
    name: "Coast Region (Pwani)",
    districts: {
      bagamoyo: {
        name: "Bagamoyo",
        streets: ["Bagamoyo Main Rd", "Dar-Chalinze Rd", "Beach Road", "Historical Site Rd", "Chalinze", "Sange", "Kaole", "Kunduchi", "Mbweni"],
      },
      pangani: {
        name: "Pangani",
        streets: ["Pangani Main Rd", "Tanga Rd", "Pangani Beach Rd", "Lusinga", "Bumbuli", "Muzi", "Marumba", "Manga", "Ndolage"],
      },
    },
  },
  lindi: {
    name: "Lindi",
    districts: {
      "lindi-urban": {
        name: "Lindi Urban",
        streets: ["Lindi Main St", "Beach Road", "Market Street", "Lindi Town Centre", "Port Road", "Mikindani Rd", "Hospital Rd", "Police St", "School St"],
      },
      mtwara: {
        name: "Mtwara",
        streets: ["Mtwara Main Rd", "Port Road", "Mikindani", "Beach Road", "Market Street", "Newala Road", "Masasi Road", "Lindi Road", "Hospital St"],
      },
    },
  },
  tanga: {
    name: "Tanga",
    districts: {
      "tanga-urban": {
        name: "Tanga Urban",
        streets: ["Makonde Rd", "Hospital Rd", "Sokoine St", "Tanga Town Centre", "Port Road", "Amboni Cave Rd", "Beach Road", "Market Street", "Sheikh Ali Mwinyi St"],
      },
      bumbuli: {
        name: "Bumbuli",
        streets: ["Bumbuli Main Rd", "Tanga-Arusha Rd", "Kilimanjaro Rd", "Same Road", "Mwanga", "Korogwe", "Amboni", "Pangani", "Same"],
      },
    },
  },
  iringa: {
    name: "Iringa",
    districts: {
      "iringa-urban": {
        name: "Iringa Urban",
        streets: ["Dar Road", "Dodoma Road", "Mbeya Road", "Iringa Town Centre", "Market Street", "Hospital Rd", "Kalenga", "Kitumbi", "Tunungu"],
      },
      "iringa-rural": {
        name: "Iringa Rural",
        streets: ["Iringa-Songea Rd", "Iringa-Mbeya Rd", "Njombe Road", "Ihimba", "Mufindi", "Makete", "Ilula", "Rugomelo", "Mimbizi"],
      },
    },
  },
  singida: {
    name: "Singida",
    districts: {
      "singida-urban": {
        name: "Singida Urban",
        streets: ["Singida Main St", "Moshi Road", "Arusha Road", "Dodoma Road", "Market Street", "Hospital Rd", "Iramba Rd", "Ikungi", "Manyoni"],
      },
      ikungi: {
        name: "Ikungi",
        streets: ["Ikungi Main Rd", "Dodoma Rd", "Singida Rd", "Manyoni", "Iramba", "Mwangata", "Loleza", "Ilongero", "Singida Rural"],
      },
    },
  },
  mwanza: {
    name: "Mwanza",
    districts: {
      "mwanza-urban": {
        name: "Mwanza Urban",
        streets: ["Mwanza Main St", "Lake Victoria Road", "Tabora Road", "Market Street", "Port Road", "Kenyatta Ave", "Bukoba Road", "Hospital St", "Beach Road"],
      },
      bukoba: {
        name: "Bukoba",
        streets: ["Bukoba Main Rd", "Lake Victoria Rd", "Mwanza Road", "Kagera Road", "Market Street", "Hospital Rd", "Port Road", "Beach Rd", "School St"],
      },
    },
  },
};

const RAW_NETWORKS: RawNetwork[] = [
  { id: "net-dar-01", name: "Dar Es Salaam Grid - North", region: "dar", district: "kinondoni", color: "#FF6B6B" },
  { id: "net-dar-02", name: "Dar Es Salaam Grid - Central", region: "dar", district: "ilala", color: "#4ECDC4" },
  { id: "net-dar-03", name: "Dar Es Salaam Grid - South", region: "dar", district: "temeke", color: "#45B7D1" },
  { id: "net-arusha-01", name: "Arusha Main Network", region: "arusha", district: "arusha-urban", color: "#96CEB4" },
  { id: "net-arusha-02", name: "Mt. Meru Rural Network", region: "arusha", district: "arusha-rural", color: "#FFEAA7" },
  { id: "net-dodoma-01", name: "Dodoma Central Grid", region: "dodoma", district: "dodoma-urban", color: "#DDA0DD" },
  { id: "net-dodoma-02", name: "Dodoma Rural Network", region: "dodoma", district: "dodoma-rural", color: "#98D8C8" },
  { id: "net-mbeya-01", name: "Mbeya Urban Network", region: "mbeya", district: "mbeya-urban", color: "#F7DC6F" },
  { id: "net-mbeya-02", name: "Rungwe Highland Network", region: "mbeya", district: "rungwe", color: "#BB8FCE" },
  { id: "net-morogoro-01", name: "Morogoro Central Grid", region: "morogoro", district: "morogoro-urban", color: "#85C1E2" },
  { id: "net-morogoro-02", name: "Uluguru Valley Network", region: "morogoro", district: "morogoro-rural", color: "#F8B88B" },
];

const INCIDENT_CAUSES = [
  "Transformer overload",
  "Scheduled maintenance",
  "Storm / weather damage",
  "Underground cable fault",
  "Equipment upgrade",
  "Vandalism on line",
  "Overvoltage protection trip",
  "Substation breaker fault",
];

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildIncidents(net: RawNetwork, status: NetworkStatus) {
  const base = hash(net.id);
  const count = 3 + (base % 4);
  const incidents: Incident[] = [];
  let totalDownMin = 0;

  for (let i = 0; i < count; i++) {
    const s = hash(`${net.id}:${i}`);
    const daysAgo = (s % 75) + i * 4 + 1;
    const date = new Date(Date.now() - daysAgo * 86400000 - (s % 86400) * 1000);
    const durationMin = 15 + (s % 285);
    totalDownMin += durationMin;
    incidents.push({
      id: `${net.id}-inc-${i}`,
      date,
      durationMin,
      cause: INCIDENT_CAUSES[s % INCIDENT_CAUSES.length],
      resolved: true,
      severity: durationMin > 180 ? "high" : durationMin > 60 ? "medium" : "low",
    });
  }

  incidents.sort((a, b) => b.date.getTime() - a.date.getTime());
  if (status !== "operational" && incidents.length) {
    incidents[0].resolved = false;
  }
  return { incidents, totalDownMin };
}

function buildNetwork(raw: RawNetwork): Network {
  const seed = hash(raw.id);
  const r = seed % 100;
  const status: NetworkStatus = r < 60 ? "operational" : r < 78 ? "maintenance" : "down";
  const jit = (seed % 60) / 10;
  const uptime =
    status === "operational"
      ? +(99.9 - jit * 0.15).toFixed(2)
      : status === "maintenance"
        ? +(98.5 - jit * 0.4).toFixed(2)
        : +(92.0 - jit * 0.9).toFixed(2);
  const { incidents, totalDownMin } = buildIncidents(raw, status);
  return {
    ...raw,
    status,
    uptime,
    customers: 850 + (seed % 7400),
    voltage: status === "down" ? 0 : 228 + (seed % 9),
    loadPct: 35 + (seed % 60),
    incidents,
    downtime30dMin: totalDownMin,
    lastIncident: incidents.length ? incidents[0] : null,
  };
}

export const networks: Network[] = RAW_NETWORKS.map(buildNetwork);

export function getNetworkReport(ref: string): Network | null {
  return networks.find((n) => n.id === ref || n.name === ref) ?? null;
}

export function getNetworkStatus(ref: string): NetworkStatus {
  return getNetworkReport(ref)?.status ?? "operational";
}

export function getNetworkSummary(): NetworkSummary {
  const summary: NetworkSummary = {
    total: networks.length,
    operational: 0,
    maintenance: 0,
    down: 0,
    customers: 0,
    avgUptime: 0,
  };
  let uptimeSum = 0;
  networks.forEach((n) => {
    summary[n.status]++;
    summary.customers += n.customers;
    uptimeSum += n.uptime;
  });
  summary.avgUptime = +(uptimeSum / networks.length).toFixed(2);
  return summary;
}

export function getUserNetwork(profile?: UserLikeProfile | null): Network {
  if (profile?.region) {
    const byDistrict = networks.find(
      (n) => n.region === profile.region && n.district === profile.district,
    );
    if (byDistrict) return byDistrict;
    const byRegion = networks.find((n) => n.region === profile.region);
    if (byRegion) return byRegion;
  }
  return networks[0];
}

export function getRegions(): Array<{ code: string; name: string }> {
  return Object.entries(regions).map(([code, region]) => ({ code, name: region.name }));
}

export function getDistricts(regionCode: string): Array<{ code: string; name: string }> {
  const region = regions[regionCode];
  if (!region) return [];
  return Object.entries(region.districts).map(([code, district]) => ({
    code,
    name: district.name,
  }));
}

export function getStreets(regionCode: string, districtCode: string): string[] {
  return regions[regionCode]?.districts[districtCode]?.streets ?? [];
}

export function getNetworksForScope(
  scope: "mine" | "region" | "national",
  profile?: UserLikeProfile | null,
): Network[] {
  const userNet = getUserNetwork(profile);
  if (scope === "mine") return [userNet];
  if (scope === "region") return networks.filter((n) => n.region === userNet.region);
  return networks.slice();
}

const REGION_COORDS: Record<string, [number, number]> = {
  dar: [-6.8, 39.2833],
  arusha: [-3.3869, 36.683],
  dodoma: [-6.1667, 35.7333],
  mbeya: [-8.75, 33.4667],
  morogoro: [-6.8167, 37.6667],
  iringa: [-7.7667, 35.6833],
  "dar-coastal": [-6.4, 38.9],
  lindi: [-9.9986, 39.71],
  tanga: [-5.0689, 39.0989],
  singida: [-4.8167, 34.75],
  mwanza: [-2.5167, 32.8833],
};

function districtOffset(region: string, district: string) {
  const seed = hash(`${region}:${district}`);
  const angle = (seed % 360) * (Math.PI / 180);
  const dist = 0.04 + (seed % 30) / 1000;
  return { dlat: Math.sin(angle) * dist, dlng: Math.cos(angle) * dist };
}

export function getNetworkGeometry(net: Network): NetworkGeometry {
  const hub = REGION_COORDS[net.region] ?? [-6.8, 39.2833];
  const off = districtOffset(net.region, net.district);
  const subLat = hub[0] + off.dlat;
  const subLng = hub[1] + off.dlng;
  const streets = getStreets(net.region, net.district).slice(0, 6);
  const branches = streets.map((street, i) => {
    const a = -Math.PI / 2 + i * ((Math.PI * 1.1) / Math.max(streets.length - 1, 1));
    const r = 0.012 + (i % 3) * 0.004;
    return { street, lat: subLat + Math.sin(a) * r, lng: subLng + Math.cos(a) * r };
  });
  return {
    hub: { lat: hub[0], lng: hub[1] },
    substation: { lat: subLat, lng: subLng },
    branches,
    trunk: [
      [hub[0], hub[1]],
      [subLat, subLng],
    ],
    branchLines: branches.map((b) => [
      [subLat, subLng],
      [b.lat, b.lng],
    ]),
  };
}

export const NATIONAL_GRID_HUB: [number, number] = [-6.1722, 35.7395];
export const TZ_CENTER: [number, number] = [-6.369, 35.0];

export const STATUS_COLOR: Record<NetworkStatus, string> = {
  operational: "#10b981",
  maintenance: "#f59e0b",
  down: "#ef4444",
};

export const STATUS_LABEL: Record<NetworkStatus, string> = {
  operational: "Active",
  maintenance: "Maintenance",
  down: "Down",
};
