import { Fragment, useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useUi } from "@/store/ui";
import {
  getNetworkGeometry,
  STATUS_COLOR,
  TZ_CENTER,
  type Network,
} from "@/lib/tanzania-data";

function FitToNetworks({ networks }: { networks: Network[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = networks.flatMap((n) => {
      const g = getNetworkGeometry(n);
      return [
        [g.hub.lat, g.hub.lng],
        [g.substation.lat, g.substation.lng],
      ] as [number, number][];
    });
    if (pts.length === 1) {
      map.setView(pts[0], 9);
    } else if (pts.length > 1) {
      map.fitBounds(pts, { padding: [40, 40], maxZoom: 11 });
    }
    setTimeout(() => map.invalidateSize(), 150);
  }, [networks, map]);
  return null;
}

const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export function NetworkMap({
  networks,
  selectedId,
  onSelect,
}: {
  networks: Network[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const theme = useUi((s) => s.theme);
  const geometries = useMemo(
    () => networks.map((n) => ({ net: n, geo: getNetworkGeometry(n) })),
    [networks],
  );

  return (
    <MapContainer
      center={TZ_CENTER}
      zoom={6}
      scrollWheelZoom
      className="h-[420px] w-full rounded-2xl"
      style={{ background: "hsl(var(--muted))" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url={theme === "dark" ? DARK_TILES : LIGHT_TILES}
      />
      <FitToNetworks networks={networks} />
      {geometries.map(({ net, geo }) => {
        const color = STATUS_COLOR[net.status];
        const selected = net.id === selectedId;
        return (
          <Fragment key={net.id}>
            <Polyline
              positions={geo.trunk}
              pathOptions={{ color, weight: selected ? 5 : 3, opacity: 0.85 }}
            />
            {geo.branchLines.map((line, i) => (
              <Polyline
                key={i}
                positions={line}
                pathOptions={{ color, weight: selected ? 2.5 : 1.5, opacity: 0.5, dashArray: "4 4" }}
              />
            ))}
            {geo.branches.map((b, i) => (
              <CircleMarker
                key={i}
                center={[b.lat, b.lng]}
                radius={3}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 0 }}
              />
            ))}
            <CircleMarker
              center={[geo.substation.lat, geo.substation.lng]}
              radius={selected ? 11 : 8}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
              }}
              eventHandlers={{ click: () => onSelect(net.id) }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <span className="font-semibold">{net.name}</span>
              </Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
