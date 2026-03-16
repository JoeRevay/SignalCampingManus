/**
 * RouteFinder — Find campgrounds along a route between two points.
 * Uses all campgrounds data. No signal fields.
 */
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Signal, MapPin, Navigation, ChevronRight, Tent, Truck, Waves,
  CheckCircle2, Search
} from "lucide-react";
import campgroundsData from "@/data/campgrounds.json";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin", WV: "West Virginia",
};

const parseBool = (v: any) => v === true || v === "True" || v === "Yes";
const allCampgrounds = (campgroundsData as any[]).map(cg => ({
  ...cg,
  tent_sites: parseBool(cg.tent_sites),
  rv_sites: parseBool(cg.rv_sites),
  electric_hookups: parseBool(cg.electric_hookups),
  waterfront: parseBool(cg.waterfront),
}));

// Preset routes
const PRESETS = [
  { label: "Cleveland to Traverse City", startLat: 41.4993, startLng: -81.6944, endLat: 44.7631, endLng: -85.6206 },
  { label: "Detroit to Mackinaw City", startLat: 42.3314, startLng: -83.0458, endLat: 45.7772, endLng: -84.7278 },
  { label: "Columbus to Hocking Hills", startLat: 39.9612, startLng: -82.9988, endLat: 39.4403, endLng: -82.5382 },
  { label: "Pittsburgh to Erie", startLat: 40.4406, startLng: -79.9959, endLat: 42.1292, endLng: -80.0851 },
  { label: "Milwaukee to Door County", startLat: 43.0389, startLng: -87.9065, endLat: 45.0076, endLng: -87.3154 },
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

export default function RouteFinder() {
  const [startLat, setStartLat] = useState(41.4993);
  const [startLng, setStartLng] = useState(-81.6944);
  const [endLat, setEndLat] = useState(44.7631);
  const [endLng, setEndLng] = useState(-85.6206);
  const [corridorWidth, setCorridorWidth] = useState(30);

  useEffect(() => {
    document.title = "Route Finder | SignalCamping";
  }, []);

  const results = useMemo(() => {
    return allCampgrounds
      .map(cg => ({
        ...cg,
        corridorDist: pointToSegmentDist(cg.latitude, cg.longitude, startLat, startLng, endLat, endLng),
      }))
      .filter(cg => cg.corridorDist <= corridorWidth)
      .sort((a, b) => a.corridorDist - b.corridorDist);
  }, [startLat, startLng, endLat, endLng, corridorWidth]);

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
              onClick={() => { setStartLat(p.startLat); setStartLng(p.startLng); setEndLat(p.endLat); setEndLng(p.endLng); }}>
              <Navigation className="w-3 h-3 mr-1" /> {p.label}
            </Button>
          ))}
        </div>

        {/* Inputs */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div><label className="text-xs text-gray-500">Start Lat</label><Input type="number" step="0.01" value={startLat} onChange={e => setStartLat(+e.target.value)} className="h-8 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Start Lng</label><Input type="number" step="0.01" value={startLng} onChange={e => setStartLng(+e.target.value)} className="h-8 text-sm" /></div>
              <div><label className="text-xs text-gray-500">End Lat</label><Input type="number" step="0.01" value={endLat} onChange={e => setEndLat(+e.target.value)} className="h-8 text-sm" /></div>
              <div><label className="text-xs text-gray-500">End Lng</label><Input type="number" step="0.01" value={endLng} onChange={e => setEndLng(+e.target.value)} className="h-8 text-sm" /></div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Corridor Width: {corridorWidth} miles</label>
              <Slider value={[corridorWidth]} onValueChange={v => setCorridorWidth(v[0])} min={5} max={100} step={5} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-500 mb-4">{results.length} campgrounds found along route</p>

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
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8"><div className="container text-center text-sm">&copy; 2026 SignalCamping</div></footer>
    </div>
  );
}
