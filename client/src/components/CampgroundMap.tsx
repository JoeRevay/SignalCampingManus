/**
 * CampgroundMap — Google Maps with verified (green) vs OSM (blue) markers.
 * Uses @googlemaps/markerclusterer for efficient rendering of 3000+ campgrounds.
 */
import { useRef, useCallback, useEffect, useState } from "react";
import { MapView } from "@/components/Map";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { getCarrierLikelihood, getLikelihoodColor, getLikelihoodSymbol, CARRIER_DISCLAIMER } from "@/lib/carrierLikelihood";

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
  signal_score?: number;
  carrier_count?: number;
  remote_work_score?: number;
  verizon_coverage?: boolean;
  att_coverage?: boolean;
  tmobile_coverage?: boolean;
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

function getSignalColor(score: number | undefined): string {
  if (score == null) return '#9ca3af';
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function getSignalLabel(score: number | undefined): string {
  if (score == null) return 'Unknown';
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
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

  // Signal coverage section with carrier likelihood
  const sigColor = getSignalColor(cg.signal_score);
  const sigLabel = getSignalLabel(cg.signal_score);
  const likelihood = getCarrierLikelihood(cg);

  const carrierRows = [
    { name: 'Verizon', level: likelihood.verizon },
    { name: 'AT&T', level: likelihood.att },
    { name: 'T-Mobile', level: likelihood.tmobile },
  ].map(c => {
    const color = getLikelihoodColor(c.level);
    const sym = getLikelihoodSymbol(c.level);
    return `<span style="font-size:10px;color:${color};font-weight:500">${c.name} ${sym} ${c.level}</span>`;
  }).join('');

  const signalHtml = `
    <div style="background:#f8fafc;border-radius:6px;padding:8px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:11px;font-weight:600;color:#334155">Signal Score</span>
        <span style="font-size:13px;font-weight:700;color:${sigColor}">${cg.signal_score ?? '—'} <span style="font-size:10px;font-weight:400">${sigLabel}</span></span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:4px">
        ${carrierRows}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:10px;color:#64748b">Remote Work Score</span>
        <span style="font-size:11px;font-weight:600;color:#6366f1">${cg.remote_work_score != null ? Math.round(cg.remote_work_score) : '—'}/100</span>
      </div>
      <p style="font-size:8px;color:#94a3b8;margin:4px 0 0;line-height:1.3">${CARRIER_DISCLAIMER}</p>
    </div>
  `;

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
      ${signalHtml}
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

/** Custom cluster renderer that shows count with green styling */
class ClusterRenderer {
  render(
    { count, position }: { count: number; position: google.maps.LatLng },
    _stats: any,
    map: google.maps.Map
  ): google.maps.marker.AdvancedMarkerElement {
    const size = count < 50 ? 40 : count < 200 ? 50 : 60;
    const fontSize = count < 50 ? 13 : count < 200 ? 14 : 15;

    const el = document.createElement("div");
    el.style.cssText = `
      width: ${size}px; height: ${size}px;
      background: linear-gradient(135deg, #16a34a, #15803d);
      border: 3px solid rgba(255,255,255,0.9);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: ${fontSize}px;
      font-family: system-ui, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      cursor: pointer;
      transition: transform 0.15s ease;
    `;
    el.textContent = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
    el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.12)"; });
    el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

    return new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: el,
      zIndex: 1000 + count,
    });
  }
}

export default function CampgroundMap({ campgrounds, onCampgroundClick, className }: CampgroundMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
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

    // Clean up previous markers and clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
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
        position: pos,
        content: el,
        title: cg.campground_name,
        // Don't set map here — the clusterer will manage map assignment
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

    // Create clusterer with SuperCluster algorithm for performance
    clustererRef.current = new MarkerClusterer({
      map,
      markers: newMarkers,
      algorithm: new SuperClusterAlgorithm({ radius: 80, maxZoom: 14 }),
      renderer: new ClusterRenderer(),
    });

    if (campgrounds.length > 0) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
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
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">N</span>
          </div>
          <span className="text-xs text-gray-600">Cluster</span>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{campgrounds.length.toLocaleString()} campgrounds</span>
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
