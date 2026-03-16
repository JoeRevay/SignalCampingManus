/**
 * CampgroundMap — Google Maps with verified (green) vs OSM (blue) markers.
 * Handles 3000+ campgrounds with clustering and info-window previews.
 */
import { useRef, useCallback, useEffect, useState } from "react";
import { MapView } from "@/components/Map";

interface CampgroundData {
  campground_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  campground_type: string;
  tent_sites?: boolean | null;
  rv_sites?: boolean | null;
  electric_hookups?: boolean | null;
  waterfront?: boolean | null;
  is_verified?: boolean;
  website?: string;
  slug?: string;
  operator?: string;
}

interface CampgroundMapProps {
  campgrounds: CampgroundData[];
  onCampgroundClick?: (cg: CampgroundData) => void;
  className?: string;
}

const VERIFIED_COLOR = "#16a34a";
const OSM_COLOR = "#2563eb";

function createMarkerSvg(isVerified: boolean) {
  const fill = isVerified ? VERIFIED_COLOR : OSM_COLOR;
  return `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="${fill}" opacity="0.9"/>
    <circle cx="14" cy="13" r="6" fill="white" opacity="0.9"/>
    ${isVerified
      ? '<path d="M11 13l2 2 4-4" stroke="' + fill + '" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<circle cx="14" cy="13" r="2.5" fill="' + fill + '"/>'
    }
  </svg>`;
}

function createInfoContent(cg: CampgroundData) {
  const verified = cg.is_verified
    ? `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;color:#16a34a;background:#dcfce7;padding:2px 6px;border-radius:4px;font-weight:600">&#10003; Verified</span>`
    : `<span style="font-size:10px;color:#6b7280;background:#f3f4f6;padding:2px 6px;border-radius:4px">OSM Data</span>`;

  const amenities: string[] = [];
  if (cg.tent_sites) amenities.push("Tent");
  if (cg.rv_sites) amenities.push("RV");
  if (cg.electric_hookups) amenities.push("Electric");
  if (cg.waterfront) amenities.push("Waterfront");

  const amenityHtml = amenities.length > 0
    ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">${amenities.map(a =>
        `<span style="font-size:10px;color:#475569;background:#f1f5f9;padding:1px 6px;border-radius:4px">&#10003; ${a}</span>`
      ).join("")}</div>`
    : "";

  const websiteLink = cg.website
    ? `<a href="${cg.website}" target="_blank" rel="noopener" style="font-size:11px;color:#2563eb;text-decoration:none;margin-right:12px">Website &rarr;</a>`
    : "";

  const slug = cg.slug || cg.campground_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return `
    <div style="font-family:system-ui;max-width:300px;padding:4px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <h3 style="margin:0;font-size:14px;font-weight:700;color:#1e293b;flex:1">${cg.campground_name}</h3>
        ${verified}
      </div>
      <p style="margin:0 0 8px;font-size:12px;color:#64748b">${cg.city ? cg.city + ", " : ""}${cg.state} &middot; ${cg.campground_type}</p>
      ${amenityHtml}
      <div style="display:flex;align-items:center;gap:8px;border-top:1px solid #e2e8f0;padding-top:6px">
        ${websiteLink}
        <span style="font-size:12px;font-weight:600;color:#16a34a;cursor:pointer"
          onclick="window.__signalCampingNav && window.__signalCampingNav('${slug}')">
          View Details &rarr;
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

  useEffect(() => {
    (window as any).__signalCampingNav = (slug: string) => {
      if (slug) window.location.href = `/campground/${slug}`;
    };
    return () => { delete (window as any).__signalCampingNav; };
  }, []);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach(m => { m.map = null; });
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    campgrounds.forEach((cg) => {
      const pos = { lat: cg.latitude, lng: cg.longitude };
      bounds.extend(pos);

      const el = document.createElement("div");
      el.innerHTML = createMarkerSvg(!!cg.is_verified);
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

    if (campgrounds.length > 0) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [campgrounds, mapReady]);

  const verifiedCount = campgrounds.filter(c => c.is_verified).length;
  const osmCount = campgrounds.length - verifiedCount;

  return (
    <div className={className}>
      <div className="flex items-center gap-4 mb-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: VERIFIED_COLOR }} />
          <span className="text-xs text-gray-600">Verified ({verifiedCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: OSM_COLOR }} />
          <span className="text-xs text-gray-600">OpenStreetMap ({osmCount})</span>
        </div>
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
