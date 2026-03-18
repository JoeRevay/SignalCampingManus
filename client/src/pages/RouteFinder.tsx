/**
 * RouteFinder — Find campgrounds along a route between two addresses.
 * Uses Google Maps Places Autocomplete for address input and Geocoder for resolution.
 */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Signal, MapPin, Navigation, ChevronRight, Tent, Truck, Waves,
  CheckCircle2, Search, ArrowRight, Loader2, X
} from "lucide-react";
import campgroundsData from "@/data/campgrounds.json";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

const parseBool = (v: any) => v === true || v === "True" || v === "Yes";
const allCampgrounds = (campgroundsData as any[]).map(cg => ({
  ...cg,
  tent_sites: parseBool(cg.tent_sites),
  rv_sites: parseBool(cg.rv_sites),
  electric_hookups: parseBool(cg.electric_hookups),
  waterfront: parseBool(cg.waterfront),
}));

// Preset routes with display addresses
const PRESETS = [
  { label: "Cleveland → Traverse City", startAddr: "Cleveland, OH", endAddr: "Traverse City, MI", startLat: 41.4993, startLng: -81.6944, endLat: 44.7631, endLng: -85.6206 },
  { label: "Detroit → Mackinaw City", startAddr: "Detroit, MI", endAddr: "Mackinaw City, MI", startLat: 42.3314, startLng: -83.0458, endLat: 45.7772, endLng: -84.7278 },
  { label: "Columbus → Hocking Hills", startAddr: "Columbus, OH", endAddr: "Hocking Hills, OH", startLat: 39.9612, startLng: -82.9988, endLat: 39.4403, endLng: -82.5382 },
  { label: "Pittsburgh → Erie", startAddr: "Pittsburgh, PA", endAddr: "Erie, PA", startLat: 40.4406, startLng: -79.9959, endLat: 42.1292, endLng: -80.0851 },
  { label: "Milwaukee → Door County", startAddr: "Milwaukee, WI", endAddr: "Door County, WI", startLat: 43.0389, startLng: -87.9065, endLat: 45.0076, endLng: -87.3154 },
];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointToSegmentDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return haversine(px, py, ax + t * dx, ay + t * dy);
}

// Reuse the centralized Maps loader from Map.tsx to avoid duplicate script injection
import { loadMapScript } from "@/components/Map";

function ensureMapsLoaded(): Promise<void> {
  return loadMapScript().then(() => {});
}

interface GeoResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

async function geocodeAddress(address: string): Promise<GeoResult | null> {
  await ensureMapsLoaded();
  if (!window.google?.maps) return null;
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        resolve({
          lat: loc.lat(),
          lng: loc.lng(),
          formattedAddress: results[0].formatted_address,
        });
      } else {
        resolve(null);
      }
    });
  });
}

// Autocomplete hook
function useAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  onSelect: (result: GeoResult) => void
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureMapsLoaded().then(() => {
      if (cancelled || !inputRef.current || !window.google?.maps?.places) return;
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode"],
        componentRestrictions: { country: "us" },
        fields: ["geometry", "formatted_address"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place?.geometry?.location) {
          onSelect({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            formattedAddress: place.formatted_address || "",
          });
        }
      });
      autocompleteRef.current = ac;
    });
    return () => { cancelled = true; };
  }, []);
}

export default function RouteFinder() {
  const [startAddr, setStartAddr] = useState("Cleveland, OH");
  const [endAddr, setEndAddr] = useState("Traverse City, MI");
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>({ lat: 41.4993, lng: -81.6944 });
  const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>({ lat: 44.7631, lng: -85.6206 });
  const [corridorWidth, setCorridorWidth] = useState(30);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Route Finder | SignalCamping";
  }, []);

  const handleStartSelect = useCallback((result: GeoResult) => {
    setStartAddr(result.formattedAddress);
    setStartCoords({ lat: result.lat, lng: result.lng });
    setError(null);
  }, []);

  const handleEndSelect = useCallback((result: GeoResult) => {
    setEndAddr(result.formattedAddress);
    setEndCoords({ lat: result.lat, lng: result.lng });
    setError(null);
  }, []);

  useAutocomplete(startInputRef, handleStartSelect);
  useAutocomplete(endInputRef, handleEndSelect);

  // Manual geocode on Enter or Search button
  const handleSearch = useCallback(async () => {
    setGeocoding(true);
    setError(null);
    try {
      const [startResult, endResult] = await Promise.all([
        geocodeAddress(startAddr),
        geocodeAddress(endAddr),
      ]);
      if (!startResult) {
        setError("Could not find the starting address. Please try a more specific location.");
        setGeocoding(false);
        return;
      }
      if (!endResult) {
        setError("Could not find the destination address. Please try a more specific location.");
        setGeocoding(false);
        return;
      }
      setStartCoords({ lat: startResult.lat, lng: startResult.lng });
      setEndCoords({ lat: endResult.lat, lng: endResult.lng });
      setStartAddr(startResult.formattedAddress);
      setEndAddr(endResult.formattedAddress);
    } catch {
      setError("Geocoding failed. Please try again.");
    }
    setGeocoding(false);
  }, [startAddr, endAddr]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  const handlePreset = useCallback((p: typeof PRESETS[0]) => {
    setStartAddr(p.startAddr);
    setEndAddr(p.endAddr);
    setStartCoords({ lat: p.startLat, lng: p.startLng });
    setEndCoords({ lat: p.endLat, lng: p.endLng });
    setError(null);
    // Update the input fields directly
    if (startInputRef.current) startInputRef.current.value = p.startAddr;
    if (endInputRef.current) endInputRef.current.value = p.endAddr;
  }, []);

  const results = useMemo(() => {
    if (!startCoords || !endCoords) return [];
    return allCampgrounds
      .map(cg => ({
        ...cg,
        corridorDist: pointToSegmentDist(cg.latitude, cg.longitude, startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng),
      }))
      .filter(cg => cg.corridorDist <= corridorWidth)
      .sort((a, b) => a.corridorDist - b.corridorDist);
  }, [startCoords, endCoords, corridorWidth]);

  const routeDistance = startCoords && endCoords
    ? haversine(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/"><div className="flex items-center gap-2"><Signal className="w-5 h-5 text-green-700" /><span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span></div></Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/lists"><Button variant="ghost" size="sm" className="text-xs text-green-700">Lists</Button></Link>
            <Link href="/"><Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700"><MapPin className="w-3.5 h-3.5 mr-1" /> Map</Button></Link>
          </div>
        </div>
      </header>

      <section className="container py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Route Finder</h1>
        <p className="text-gray-500 mb-6">Find campgrounds along your road trip route across the Great Lakes region.</p>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PRESETS.map(p => (
            <Button key={p.label} variant="outline" size="sm" className="text-xs"
              onClick={() => handlePreset(p)}>
              <Navigation className="w-3 h-3 mr-1" /> {p.label}
            </Button>
          ))}
        </div>

        {/* Address Inputs */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end mb-4">
              {/* Start Address */}
              <div className="relative">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Starting Point</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                  <Input
                    ref={startInputRef}
                    type="text"
                    placeholder="Enter city, address, or place..."
                    defaultValue={startAddr}
                    onChange={e => setStartAddr(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-10 pl-9 pr-8 text-sm"
                  />
                  {startAddr && (
                    <button
                      onClick={() => { setStartAddr(""); setStartCoords(null); if (startInputRef.current) startInputRef.current.value = ""; }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center pb-0.5">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* End Address */}
              <div className="relative">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <Input
                    ref={endInputRef}
                    type="text"
                    placeholder="Enter city, address, or place..."
                    defaultValue={endAddr}
                    onChange={e => setEndAddr(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-10 pl-9 pr-8 text-sm"
                  />
                  {endAddr && (
                    <button
                      onClick={() => { setEndAddr(""); setEndCoords(null); if (endInputRef.current) endInputRef.current.value = ""; }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={geocoding || !startAddr || !endAddr}
                className="h-10 bg-green-700 hover:bg-green-800 text-white"
              >
                {geocoding ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
                Find Route
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                {error}
              </div>
            )}

            {/* Corridor Width */}
            <div>
              <label className="text-xs font-medium text-gray-600">Corridor Width: <span className="text-green-700 font-bold">{corridorWidth} miles</span></label>
              <Slider value={[corridorWidth]} onValueChange={v => setCorridorWidth(v[0])} min={5} max={100} step={5} className="mt-2" />
              <p className="text-[11px] text-gray-400 mt-1">How far from the route to search for campgrounds</p>
            </div>
          </CardContent>
        </Card>

        {/* Route Summary */}
        {startCoords && endCoords && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-green-700">{results.length}</span> campgrounds found within {corridorWidth} mi of route
            </p>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500">
              ~{Math.round(routeDistance)} mi straight-line distance
            </p>
          </div>
        )}

        {!startCoords || !endCoords ? (
          <div className="text-center py-16 text-gray-400">
            <Navigation className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Enter a starting point and destination to find campgrounds along your route.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tent className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No campgrounds found in this corridor. Try increasing the corridor width.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.slice(0, 50).map((cg: any, i: number) => (
              <Link key={cg.slug + i} href={`/campground/${cg.slug}`}>
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{cg.campground_name}</h3>
                          {cg.is_verified && <Badge className="bg-green-100 text-green-800 text-[10px] shrink-0"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified</Badge>}
                        </div>
                        <p className="text-xs text-gray-500"><MapPin className="w-3 h-3 inline mr-1" />{cg.city ? `${cg.city}, ` : ""}{STATE_NAMES[cg.state] || cg.state} &middot; {cg.corridorDist.toFixed(1)} mi from route</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant="outline" className="text-xs">{(cg.campground_type || "campground").replace(/_/g, " ")}</Badge>
                          {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5"><Tent className="w-3 h-3" /></Badge>}
                          {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5"><Truck className="w-3 h-3" /></Badge>}
                          {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5"><Waves className="w-3 h-3" /></Badge>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {results.length > 50 && (
              <p className="text-center text-sm text-gray-400 py-4">Showing top 50 of {results.length} results</p>
            )}
          </div>
        )}
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8"><div className="container text-center text-sm">&copy; 2026 SignalCamping</div></footer>
    </div>
  );
}
