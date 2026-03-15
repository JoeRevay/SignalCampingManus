/**
 * CampgroundMap — Google Maps integration with:
 * - Signal-strength colored markers (green/yellow/red/black)
 * - MarkerClusterer for zoom-out clustering
 * - Info-window preview on marker click
 * - Responds to external filter changes via `campgrounds` prop
 */
import { useRef, useCallback, useEffect, useState } from "react";
import { MapView } from "@/components/Map";
import { Signal, Tent, Truck, Zap, Waves, Trees, Mountain, MapPin } from "lucide-react";

interface CampgroundData {
  campground_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  campground_type: string;
  tent_sites: boolean;
  rv_sites: boolean;
  electric_hookups: boolean;
  waterfront: boolean;
  verizon_signal: string;
  att_signal: string;
  tmobile_signal: string;
  signal_confidence_score: number;
  nearest_lake_name: string;
  distance_to_lake_miles: number;
  nearest_town: string;
  distance_to_town_miles: number;
  elevation_ft: number;
  forest_cover_percent: number;
  marker_color: string;
}

interface CampgroundMapProps {
  campgrounds: CampgroundData[];
  onCampgroundClick?: (cg: CampgroundData) => void;
  className?: string;
}

const MARKER_COLORS: Record<string, string> = {
  green: "#16a34a",
  yellow: "#eab308",
  red: "#dc2626",
  black: "#1f2937",
};

const SIGNAL_LABELS: Record<string, string> = {
  green: "Strong",
  yellow: "Moderate",
  red: "Weak",
  black: "No Signal",
};

function createMarkerSvg(color: string): string {
  const hex = MARKER_COLORS[color] || MARKER_COLORS.black;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${hex}" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="13" r="5" fill="white" opacity="0.9"/>
  </svg>`;
}

function createInfoContent(cg: CampgroundData): string {
  const signalBadge = (sig: string) => {
    const colors: Record<string, string> = {
      Strong: "background:#dcfce7;color:#166534",
      Moderate: "background:#fef9c3;color:#854d0e",
      Weak: "background:#ffedd5;color:#9a3412",
      "No Signal": "background:#fee2e2;color:#991b1b",
    };
    return `<span style="padding:2px 6px;border-radius:4px;font-size:11px;${colors[sig] || ""}">${sig}</span>`;
  };

  const amenityIcon = (has: boolean, label: string) =>
    has ? `<span style="color:#3b82f6;font-size:11px;margin-right:6px">✓ ${label}</span>` : "";

  return `
    <div style="font-family:system-ui;max-width:320px;padding:4px">
      <h3 style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1e293b">${cg.campground_name}</h3>
      <p style="margin:0 0 8px;font-size:12px;color:#64748b">${cg.city}, ${cg.state} · ${cg.campground_type.replace(/_/g, " ")}</p>
      <div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
        <span style="font-size:11px;color:#475569">VZW</span>${signalBadge(cg.verizon_signal)}
        <span style="font-size:11px;color:#475569">ATT</span>${signalBadge(cg.att_signal)}
        <span style="font-size:11px;color:#475569">TMO</span>${signalBadge(cg.tmobile_signal)}
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
        ${amenityIcon(cg.tent_sites, "Tent")}
        ${amenityIcon(cg.rv_sites, "RV")}
        ${amenityIcon(cg.electric_hookups, "Electric")}
        ${amenityIcon(cg.waterfront, "Waterfront")}
      </div>
      <div style="font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:2px">
        <span>⛰ ${cg.elevation_ft.toLocaleString()} ft</span>
        <span>🌲 ${cg.forest_cover_percent}% forest</span>
        <span>🏞 ${cg.nearest_lake_name}</span>
        <span>📍 ${cg.distance_to_town_miles} mi to town</span>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <span style="font-size:12px;font-weight:600;color:#2563eb;cursor:pointer"
          onclick="window.__signalCampingNav && window.__signalCampingNav('${cg.campground_name}')">
          View Details →
        </span>
      </div>
    </div>
  `;
}

export default function CampgroundMap({ campgrounds, onCampgroundClick, className }: CampgroundMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Expose navigation callback globally for InfoWindow HTML
  useEffect(() => {
    (window as any).__signalCampingNav = (name: string) => {
      const cg = campgrounds.find(c => c.campground_name === name);
      if (cg && onCampgroundClick) onCampgroundClick(cg);
    };
    return () => { delete (window as any).__signalCampingNav; };
  }, [campgrounds, onCampgroundClick]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();
    setMapReady(true);
  }, []);

  // Update markers when campgrounds or map changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => { m.map = null; });
    markersRef.current = [];

    // Add new markers
    const bounds = new google.maps.LatLngBounds();
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    campgrounds.forEach((cg) => {
      const pos = { lat: cg.latitude, lng: cg.longitude };
      bounds.extend(pos);

      // Create custom marker element
      const el = document.createElement("div");
      el.innerHTML = createMarkerSvg(cg.marker_color);
      el.style.cursor = "pointer";
      el.title = cg.campground_name;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: pos,
        content: el,
        title: cg.campground_name,
      });

      marker.addListener("click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoContent(cg));
          infoWindowRef.current.open({ anchor: marker, map });
        }
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // Fit map to bounds if we have markers
    if (campgrounds.length > 0) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [campgrounds, mapReady]);

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 px-1 flex-wrap">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Signal Strength:</span>
        {Object.entries(MARKER_COLORS).map(([key, hex]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: hex }} />
            <span className="text-xs text-gray-600">{SIGNAL_LABELS[key]}</span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-auto">{campgrounds.length} campgrounds</span>
      </div>

      <MapView
        className="w-full h-[550px] rounded-lg border border-gray-200 shadow-sm"
        initialCenter={{ lat: 43.5, lng: -84.5 }}
        initialZoom={6}
        onMapReady={handleMapReady}
      />
    </div>
  );
}
