/**
 * RouteFinder — Trip corridor discovery page
 *
 * Design: Search interface for finding campgrounds along a travel route.
 * Users select start/destination and see campgrounds along the corridor.
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Signal, MapPin, Navigation, Tent, Zap, Waves, ArrowRight,
  ExternalLink, Mountain, Laptop, Car
} from "lucide-react";

import campgroundsData from "@/data/mvp_campgrounds.json";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440718528/7Ys6UrtVjk2wmoMCZVS2Yg/hero-route-trip-fFHyNfqxYJZ2WSdcvmnYF7.webp";

const allCampgrounds = (campgroundsData as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || cg.tent_sites === "True",
  rv_sites: cg.rv_sites === true || cg.rv_sites === "True",
  electric_hookups: cg.electric_hookups === true || cg.electric_hookups === "True",
  waterfront: cg.waterfront === true || cg.waterfront === "True",
}));

// Predefined popular routes
const POPULAR_ROUTES = [
  { origin: "Cleveland, OH", dest: "Traverse City, MI", originLat: 41.4993, originLng: -81.6944, destLat: 44.7631, destLng: -85.6206 },
  { origin: "Detroit, MI", dest: "Mackinaw City, MI", originLat: 42.3314, originLng: -83.0458, destLat: 45.7772, destLng: -84.7278 },
  { origin: "Columbus, OH", dest: "Hocking Hills, OH", originLat: 39.9612, originLng: -82.9988, destLat: 39.4400, destLng: -82.5400 },
  { origin: "Pittsburgh, PA", dest: "Erie, PA", originLat: 40.4406, originLng: -79.9959, destLat: 42.1292, destLng: -80.0851 },
  { origin: "Milwaukee, WI", dest: "Door County, WI", originLat: 43.0389, originLng: -87.9065, destLat: 44.8341, destLng: -87.3770 },
  { origin: "Ann Arbor, MI", dest: "Sleeping Bear Dunes, MI", originLat: 42.2808, originLng: -83.7430, destLat: 44.8113, destLng: -86.0584 },
  { origin: "Toledo, OH", dest: "Put-in-Bay, OH", originLat: 41.6528, originLng: -83.5379, destLat: 41.6525, destLng: -82.8203 },
  { origin: "Grand Rapids, MI", dest: "Petoskey, MI", originLat: 42.9634, originLng: -85.6681, destLat: 45.3733, destLng: -84.9553 },
];

const CITIES = [
  "Cleveland, OH", "Detroit, MI", "Columbus, OH", "Pittsburgh, PA", "Milwaukee, WI",
  "Ann Arbor, MI", "Grand Rapids, MI", "Toledo, OH", "Cincinnati, OH", "Traverse City, MI",
  "Mackinaw City, MI", "Hocking Hills, OH", "Erie, PA", "Door County, WI",
  "Petoskey, MI", "Sleeping Bear Dunes, MI", "Put-in-Bay, OH", "Marquette, MI",
  "Madison, WI", "Morgantown, WV",
];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Cleveland, OH": { lat: 41.4993, lng: -81.6944 },
  "Detroit, MI": { lat: 42.3314, lng: -83.0458 },
  "Columbus, OH": { lat: 39.9612, lng: -82.9988 },
  "Pittsburgh, PA": { lat: 40.4406, lng: -79.9959 },
  "Milwaukee, WI": { lat: 43.0389, lng: -87.9065 },
  "Ann Arbor, MI": { lat: 42.2808, lng: -83.7430 },
  "Grand Rapids, MI": { lat: 42.9634, lng: -85.6681 },
  "Toledo, OH": { lat: 41.6528, lng: -83.5379 },
  "Cincinnati, OH": { lat: 39.1031, lng: -84.5120 },
  "Traverse City, MI": { lat: 44.7631, lng: -85.6206 },
  "Mackinaw City, MI": { lat: 45.7772, lng: -84.7278 },
  "Hocking Hills, OH": { lat: 39.4400, lng: -82.5400 },
  "Erie, PA": { lat: 42.1292, lng: -80.0851 },
  "Door County, WI": { lat: 44.8341, lng: -87.3770 },
  "Petoskey, MI": { lat: 45.3733, lng: -84.9553 },
  "Sleeping Bear Dunes, MI": { lat: 44.8113, lng: -86.0584 },
  "Put-in-Bay, OH": { lat: 41.6525, lng: -82.8203 },
  "Marquette, MI": { lat: 46.5436, lng: -87.3954 },
  "Madison, WI": { lat: 43.0731, lng: -89.4012 },
  "Morgantown, WV": { lat: 39.6295, lng: -79.9559 },
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointToSegmentDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * dx, projY = ay + t * dy;
  return haversine(px, py, projX, projY);
}

const signalColor: Record<string, string> = {
  Strong: "text-green-600 bg-green-50 border-green-200",
  Moderate: "text-amber-600 bg-amber-50 border-amber-200",
  Weak: "text-red-600 bg-red-50 border-red-200",
  "No Signal": "text-gray-600 bg-gray-100 border-gray-300",
};

export default function RouteFinder() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [corridorWidth, setCorridorWidth] = useState(30); // miles
  const [minSignal, setMinSignal] = useState(1);
  const [searched, setSearched] = useState(false);

  const routeResults = useMemo(() => {
    if (!origin || !destination) return [];
    const oCoords = CITY_COORDS[origin];
    const dCoords = CITY_COORDS[destination];
    if (!oCoords || !dCoords) return [];

    return allCampgrounds
      .map(cg => {
        const dist = pointToSegmentDist(cg.latitude, cg.longitude, oCoords.lat, oCoords.lng, dCoords.lat, dCoords.lng);
        const distFromOrigin = haversine(cg.latitude, cg.longitude, oCoords.lat, oCoords.lng);
        return { ...cg, corridorDist: dist, distFromOrigin };
      })
      .filter(cg => cg.corridorDist <= corridorWidth && cg.signal_confidence_score >= minSignal)
      .sort((a, b) => a.distFromOrigin - b.distFromOrigin);
  }, [origin, destination, corridorWidth, minSignal]);

  const routeDistance = useMemo(() => {
    if (!origin || !destination) return 0;
    const oCoords = CITY_COORDS[origin];
    const dCoords = CITY_COORDS[destination];
    if (!oCoords || !dCoords) return 0;
    return Math.round(haversine(oCoords.lat, oCoords.lng, dCoords.lat, dCoords.lng));
  }, [origin, destination]);

  const handleSearch = () => setSearched(true);

  const handlePopularRoute = (route: typeof POPULAR_ROUTES[0]) => {
    setOrigin(route.origin);
    setDestination(route.dest);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <Signal className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg hidden sm:block" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs">Map</Button>
              </Link>
              <Link href="/lists">
                <Button variant="ghost" size="sm" className="text-xs">Lists</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img src={HERO_IMG} alt="Road trip through fall foliage" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Route Campground Finder
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              Find campgrounds with cell service along your road trip route
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-5xl mx-auto">
        {/* Search form */}
        <Card className="mb-6 -mt-8 relative z-10 shadow-lg">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                  <SelectContent>
                    {CITIES.filter(c => c !== origin).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Corridor Width</label>
                <Select value={String(corridorWidth)} onValueChange={v => setCorridorWidth(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 miles</SelectItem>
                    <SelectItem value="30">30 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                    <SelectItem value="75">75 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-green-700 hover:bg-green-800"
                  onClick={handleSearch}
                  disabled={!origin || !destination}
                >
                  <Navigation className="w-4 h-4 mr-1" /> Find Campgrounds
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular routes */}
        {!searched && (
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Popular Routes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POPULAR_ROUTES.map(route => (
                <Card
                  key={`${route.origin}-${route.dest}`}
                  className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                  onClick={() => handlePopularRoute(route)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <Car className="w-5 h-5 text-orange-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        {route.origin} <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" /> {route.dest}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ~{Math.round(haversine(route.originLat, route.originLng, route.destLat, route.destLng))} miles
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searched && origin && destination && (
          <>
            {/* Route summary */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {origin}
              </Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {destination}
              </Badge>
              <Badge variant="outline" className="text-sm">{routeDistance} mi</Badge>
              <Badge variant="outline" className="text-sm">{routeResults.length} campgrounds found</Badge>
            </div>

            {routeResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No campgrounds found along this route with the current filters. Try widening the corridor or lowering the signal requirement.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {routeResults.map((cg, i) => (
                  <Card key={cg.campground_name} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        {/* Stop number */}
                        <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:w-16 shrink-0">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(cg.distFromOrigin)} mi</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <Link href={`/campground/${slugify(cg.campground_name)}`}>
                                <h3 className="font-bold hover:text-green-700 transition-colors cursor-pointer" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                  {cg.campground_name}
                                </h3>
                              </Link>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {cg.city}, {cg.state}
                                <span className="text-xs ml-2">({Math.round(cg.corridorDist)} mi off route)</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800 border-green-200 font-bold">
                                {cg.signal_confidence_score}/5 Signal
                              </Badge>
                              <Badge className={`font-bold ${cg.remote_work_score >= 7 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                                <Laptop className="w-3 h-3 mr-0.5" /> {cg.remote_work_score}/10
                              </Badge>
                            </div>
                          </div>

                          {/* Carrier + amenities */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="outline" className={`text-[10px] ${signalColor[cg.verizon_signal]}`}>
                              VZ: {cg.verizon_signal}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${signalColor[cg.att_signal]}`}>
                              AT&T: {cg.att_signal}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${signalColor[cg.tmobile_signal]}`}>
                              TMo: {cg.tmobile_signal}
                            </Badge>
                            {cg.waterfront && <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600"><Waves className="w-3 h-3 mr-0.5" /> Waterfront</Badge>}
                            {cg.tent_sites && <Badge variant="outline" className="text-[10px]"><Tent className="w-3 h-3 mr-0.5" /> Tent</Badge>}
                            {cg.electric_hookups && <Badge variant="outline" className="text-[10px]"><Zap className="w-3 h-3 mr-0.5" /> Electric</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-8 mt-10">
        <div className="container text-center">
          <p className="text-sm">&copy; 2026 SignalCamping &mdash; Find campgrounds where your phone works.</p>
        </div>
      </footer>
    </div>
  );
}
