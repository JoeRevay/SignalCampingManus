/**
 * Product V1 — Full product definition for SignalCamping v1
 *
 * Design: Documentation-style page with 11 sections
 * New: RemoteWorkScore, Route Discovery, Carrier/Remote Work SEO, Shareable Lists, Updated Blueprint
 */
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, MapPin, Signal, Filter, FileCode,
  Database, Layout, Globe, ChevronLeft, Laptop,
  Map as MapIcon, Route, Share2, Wrench, ArrowRight,
  Wifi, Zap, TreePine, Navigation, List, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from "recharts";

import mvpData from "@/data/mvp_campgrounds.json";

const campgrounds = mvpData as any[];

/* ── Derived data ── */
const rwsDist = (() => {
  const buckets = { excellent: 0, good: 0, usable: 0, poor: 0 };
  campgrounds.forEach(c => {
    const label = c.remote_work_label as keyof typeof buckets;
    if (label in buckets) buckets[label]++;
  });
  return [
    { name: "Excellent (9-10)", value: buckets.excellent, color: "#16a34a" },
    { name: "Good (7-8)", value: buckets.good, color: "#22c55e" },
    { name: "Usable (4-6)", value: buckets.usable, color: "#eab308" },
    { name: "Poor (0-3)", value: buckets.poor, color: "#ef4444" },
  ];
})();

const signalVsRws = campgrounds.map(c => ({
  name: c.campground_name,
  signal: c.avg_signal_numeric,
  rws: c.remote_work_score,
  state: c.state,
}));

const stateRws = (() => {
  const states: Record<string, { total: number; count: number }> = {};
  campgrounds.forEach(c => {
    if (!states[c.state]) states[c.state] = { total: 0, count: 0 };
    states[c.state].total += c.remote_work_score;
    states[c.state].count++;
  });
  return Object.entries(states).map(([state, d]) => ({
    state,
    avg: parseFloat((d.total / d.count).toFixed(1)),
    count: d.count,
  }));
})();

const topRemoteWork = [...campgrounds]
  .sort((a, b) => b.remote_work_score - a.remote_work_score)
  .slice(0, 15);

const topSignal = [...campgrounds]
  .sort((a, b) => b.avg_signal_numeric - a.avg_signal_numeric)
  .slice(0, 10);

const topWaterfront = campgrounds
  .filter(c => c.waterfront && c.best_signal_strength !== "none")
  .sort((a, b) => b.avg_signal_numeric - a.avg_signal_numeric)
  .slice(0, 10);

const exampleRoutes = [
  { start: "Cleveland, OH", end: "Traverse City, MI", distance: "290 mi", campgrounds: "~42", topSignal: "~15" },
  { start: "Detroit, MI", end: "Upper Peninsula, MI", distance: "450 mi", campgrounds: "~65", topSignal: "~20" },
  { start: "Columbus, OH", end: "Hocking Hills, OH", distance: "60 mi", campgrounds: "~12", topSignal: "~5" },
  { start: "Pittsburgh, PA", end: "Erie, PA", distance: "130 mi", campgrounds: "~18", topSignal: "~8" },
  { start: "Toledo, OH", end: "Mackinaw City, MI", distance: "250 mi", campgrounds: "~38", topSignal: "~12" },
];

const seoPages = [
  { type: "Homepage", pattern: "/", count: 1, source: "All campgrounds" },
  { type: "State", pattern: "/campgrounds-with-cell-service/{state}", count: 2, source: "WHERE state = $1" },
  { type: "Regional", pattern: "/campgrounds-with-cell-service/{region}", count: 8, source: "WHERE lat BETWEEN bounds" },
  { type: "City", pattern: "/campgrounds-with-cell-service/{city}-{st}", count: 71, source: "ST_DWithin(30 mi)" },
  { type: "Campground", pattern: "/campground/{slug}", count: 150, source: "WHERE slug = $1" },
  { type: "Remote Work", pattern: "/remote-work-camping/{state}", count: 2, source: "WHERE rws >= 7 AND state" },
  { type: "Carrier", pattern: "/campgrounds-with-{carrier}-signal/{state}", count: 6, source: "WHERE carrier_signal IN (Strong, Moderate)" },
  { type: "Trip Route", pattern: "/camping-stops/{start}-to-{end}", count: 10, source: "Corridor query" },
  { type: "Shareable Lists", pattern: "/lists/{slug}", count: 10, source: "Dynamic ranking queries" },
];

const totalPages = seoPages.reduce((sum, p) => sum + p.count, 0);

const apiEndpoints = [
  { method: "GET", path: "/api/campgrounds", purpose: "List with filters (state, signal, amenities, rws)" },
  { method: "GET", path: "/api/campgrounds/[slug]", purpose: "Single campground detail" },
  { method: "GET", path: "/api/campgrounds/geojson", purpose: "GeoJSON for map rendering" },
  { method: "GET", path: "/api/route-campgrounds", purpose: "Corridor search along route" },
  { method: "GET", path: "/api/lists/[slug]", purpose: "Dynamic shareable list data" },
  { method: "GET", path: "/api/search", purpose: "Full-text search across campgrounds" },
  { method: "POST", path: "/api/reviews", purpose: "Submit user review (future)" },
];

export default function ProductV1() {
  const [activeTab, setActiveTab] = useState("remote-work");

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="container flex items-center h-14 gap-3">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                <Signal className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h1>
                <p className="text-[10px] text-muted-foreground leading-none">Product v1 Definition</p>
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/mvp-launch"><Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">MVP Launch</Button></Link>
            <Link href="/"><Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">Discovery Map</Button></Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Link href="/"><Button variant="ghost" size="sm" className="mb-4 text-green-700 hover:text-green-800 -ml-2"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Discovery Map</Button></Link>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Product v1</Badge>
            <Badge variant="outline" className="border-green-200 text-green-700">Michigan + Ohio</Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700">{campgrounds.length} Campgrounds</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Full Product Definition
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Complete product specification including RemoteWorkScore, route corridor discovery,
            expanded SEO architecture ({totalPages} pages), shareable lists, and implementation blueprint.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {[
            { label: "Campgrounds", value: campgrounds.length, icon: MapPin, color: "text-green-600" },
            { label: "Avg RWS", value: (campgrounds.reduce((s, c) => s + c.remote_work_score, 0) / campgrounds.length).toFixed(1), icon: Laptop, color: "text-blue-600" },
            { label: "Excellent RW", value: rwsDist[0].value, icon: Wifi, color: "text-emerald-600" },
            { label: "SEO Pages", value: `~${totalPages}`, icon: Globe, color: "text-purple-600" },
            { label: "Routes", value: "5+", icon: Route, color: "text-orange-600" },
            { label: "Lists", value: "10+", icon: List, color: "text-pink-600" },
            { label: "API Endpoints", value: "7", icon: Database, color: "text-indigo-600" },
            { label: "Carriers", value: "3", icon: Signal, color: "text-teal-600" },
          ].map((stat, i) => (
            <Card key={i} className="border-stone-200">
              <CardContent className="p-3 text-center">
                <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <div className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-stone-100 p-1 mb-6">
            {[
              { value: "remote-work", label: "Remote Work Score", icon: Laptop },
              { value: "route", label: "Route Discovery", icon: Route },
              { value: "seo", label: "SEO Pages", icon: Globe },
              { value: "lists", label: "Shareable Lists", icon: Share2 },
              { value: "filters", label: "Filters", icon: Filter },
              { value: "blueprint", label: "Blueprint", icon: Wrench },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 data-[state=active]:bg-white">
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── REMOTE WORK SCORE TAB ── */}
          <TabsContent value="remote-work" className="space-y-6">
            {/* Formula */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Laptop className="w-4 h-4" /> RemoteWorkScore Formula (0–10)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  A composite score indicating how suitable a campground is for remote work, calculated from signal strength, reliability, power availability, and proximity to towns.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Input</th>
                        <th className="text-center py-2 px-4 font-medium">Weight</th>
                        <th className="text-center py-2 px-4 font-medium">Max Points</th>
                        <th className="text-left py-2 pl-4 font-medium">Logic</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { input: "best_signal_strength", weight: "40%", max: "4.0", logic: "Strong=4, Moderate=2.5, Weak=1, None=0" },
                        { input: "signal_confidence_score", weight: "20%", max: "2.0", logic: "(confidence / 5) × 2" },
                        { input: "electric_hookups", weight: "20%", max: "2.0", logic: "Yes=2, No=0" },
                        { input: "distance_to_town_miles", weight: "15%", max: "1.5", logic: "≤5mi=1.5, ≤10=1.2, ≤15=0.8, ≤25=0.4, >25=0.1" },
                        { input: "wifi_available (est.)", weight: "5%", max: "0.5", logic: "Private=0.5, State Park=0.3, County=0.2, Other=0" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4 font-mono text-xs">{row.input}</td>
                          <td className="py-2.5 px-4 text-center font-medium">{row.weight}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{row.max}</td>
                          <td className="py-2.5 pl-4 text-xs text-muted-foreground">{row.logic}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { range: "9–10", label: "Excellent", color: "bg-green-100 text-green-800", desc: "Strong signal + power + close to town" },
                    { range: "7–8", label: "Good", color: "bg-emerald-100 text-emerald-800", desc: "Reliable for video calls & uploads" },
                    { range: "4–6", label: "Usable", color: "bg-yellow-100 text-yellow-800", desc: "Email & messaging work; calls spotty" },
                    { range: "0–3", label: "Poor", color: "bg-red-100 text-red-800", desc: "Disconnect and enjoy nature" },
                  ].map(r => (
                    <div key={r.label} className={`rounded-lg p-3 ${r.color}`}>
                      <div className="font-bold text-lg">{r.range}</div>
                      <div className="font-medium text-sm">{r.label}</div>
                      <div className="text-xs mt-1 opacity-80">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribution Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">RWS Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={rwsDist} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {rwsDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Average RWS by State</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stateRws}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="state" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="avg" fill="#16a34a" radius={[4, 4, 0, 0]} name="Avg RWS" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Signal vs RWS Scatter */}
            <Card>
              <CardHeader><CardTitle className="text-base">Signal Strength vs RemoteWorkScore</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="signal" name="Signal" domain={[1, 5]} label={{ value: "Avg Signal (1-5)", position: "bottom" }} />
                    <YAxis dataKey="rws" name="RWS" domain={[0, 10]} label={{ value: "RemoteWorkScore", angle: -90, position: "insideLeft" }} />
                    <ZAxis range={[30, 30]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(val: number) => val.toFixed(1)} />
                    <Scatter data={signalVsRws} fill="#16a34a" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top 15 Remote Work Campgrounds */}
            <Card>
              <CardHeader><CardTitle className="text-base">Top 15 Remote Work Campgrounds</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-2 font-medium">#</th>
                        <th className="text-left py-2 px-2 font-medium">Campground</th>
                        <th className="text-left py-2 px-2 font-medium">City</th>
                        <th className="text-center py-2 px-2 font-medium">State</th>
                        <th className="text-center py-2 px-2 font-medium">RWS</th>
                        <th className="text-center py-2 px-2 font-medium">Signal</th>
                        <th className="text-center py-2 px-2 font-medium">Electric</th>
                        <th className="text-center py-2 px-2 font-medium">Town Dist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRemoteWork.map((cg, i) => (
                        <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="py-2 pr-2 font-mono">{i + 1}</td>
                          <td className="py-2 px-2 font-medium max-w-[180px] truncate">{cg.campground_name}</td>
                          <td className="py-2 px-2 text-muted-foreground">{cg.city}</td>
                          <td className="py-2 px-2 text-center">{cg.state}</td>
                          <td className="py-2 px-2 text-center">
                            <Badge className={`text-[10px] ${cg.remote_work_score >= 9 ? 'bg-green-100 text-green-800' : cg.remote_work_score >= 7 ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {cg.remote_work_score}/10
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cg.marker_color }} />
                              <span className="capitalize">{cg.best_signal_strength}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">{cg.electric_hookups ? "✓" : "—"}</td>
                          <td className="py-2 px-2 text-center">{cg.distance_to_town_miles?.toFixed(1)} mi</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* "Can you work remotely here?" section template */}
            <Card>
              <CardHeader><CardTitle className="text-base">"Can You Work Remotely Here?" — Page Section Template</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {topRemoteWork[0]?.remote_work_score}
                    </div>
                    <div>
                      <div className="font-semibold text-green-800">Excellent for Remote Work</div>
                      <div className="text-xs text-muted-foreground">Based on signal, power, and proximity</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2"><Signal className="w-3 h-3 text-green-600" /> Strong Verizon signal</div>
                    <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-600" /> Electric hookups available</div>
                    <div className="flex items-center gap-2"><Navigation className="w-3 h-3 text-blue-600" /> 4.2 mi to nearest town</div>
                    <div className="flex items-center gap-2"><Wifi className="w-3 h-3 text-purple-600" /> WiFi likely (State Park)</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    This campground scores {topRemoteWork[0]?.remote_work_score}/10 for remote work suitability. Video calls and file uploads should work reliably with Verizon. Electric hookups keep your devices charged all day.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ROUTE DISCOVERY TAB ── */}
          <TabsContent value="route" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Route className="w-4 h-4" /> Route Corridor Algorithm</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-4">
                <p className="text-muted-foreground">
                  The route corridor system finds campgrounds along a travel route between two points, prioritizing strong signal locations.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { step: "1", title: "Route Generation", desc: "Accept start/end coordinates. Use Google Directions API to generate a polyline of waypoints.", icon: Navigation },
                    { step: "2", title: "Corridor Buffer", desc: "Buffer the polyline by 30 miles (configurable). Creates a geographic corridor polygon.", icon: MapIcon },
                    { step: "3", title: "Query & Rank", desc: "Find campgrounds within corridor. Sort by signal strength (desc) and distance from route (asc).", icon: Filter },
                  ].map(s => (
                    <div key={s.step} className="bg-stone-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">{s.step}</div>
                        <h4 className="font-semibold">{s.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Example Routes */}
            <Card>
              <CardHeader><CardTitle className="text-base">Example Trip Routes</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Start</th>
                        <th className="text-left py-2 px-4 font-medium">Destination</th>
                        <th className="text-center py-2 px-4 font-medium">Distance</th>
                        <th className="text-center py-2 px-4 font-medium">Campgrounds</th>
                        <th className="text-center py-2 pl-4 font-medium">Strong Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exampleRoutes.map((r, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4">{r.start}</td>
                          <td className="py-2.5 px-4">{r.end}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{r.distance}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{r.campgrounds}</td>
                          <td className="py-2.5 pl-4 text-center font-mono text-green-700">{r.topSignal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* PostGIS Query */}
            <Card>
              <CardHeader><CardTitle className="text-base">PostGIS Corridor Query</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`WITH route AS (
  SELECT ST_Buffer(
    ST_MakeLine(
      ST_SetSRID(ST_MakePoint(-81.6944, 41.4993), 4326),  -- Cleveland
      ST_SetSRID(ST_MakePoint(-85.6206, 44.7631), 4326)   -- Traverse City
    ),
    0.435  -- ~30 mile buffer
  ) AS corridor
)
SELECT c.*, 
  ST_Distance(c.location, route_line) AS distance_from_route
FROM campgrounds c, route r
WHERE ST_Within(c.location, r.corridor)
  AND c.best_signal_strength IN ('strong', 'moderate')
ORDER BY 
  CASE c.best_signal_strength 
    WHEN 'strong' THEN 1 WHEN 'moderate' THEN 2 ELSE 3 END,
  distance_from_route ASC
LIMIT 25;`}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Client-side approximation */}
            <Card>
              <CardHeader><CardTitle className="text-base">Client-Side Approximation (MVP)</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`function findCampgroundsAlongRoute(campgrounds, waypoints, bufferMiles = 30) {
  const bufferDeg = bufferMiles / 69.0;
  
  return campgrounds.filter(cg => {
    return waypoints.some(wp => {
      const dLat = Math.abs(cg.latitude - wp.lat);
      const dLng = Math.abs(cg.longitude - wp.lng);
      return dLat <= bufferDeg && dLng <= bufferDeg;
    });
  }).sort((a, b) => {
    const sigOrder = { strong: 0, moderate: 1, weak: 2, none: 3 };
    const sigDiff = (sigOrder[a.best_signal_strength] || 3) 
                  - (sigOrder[b.best_signal_strength] || 3);
    if (sigDiff !== 0) return sigDiff;
    return a.remote_work_score - b.remote_work_score;
  });
}`}</code>
                </pre>
              </CardContent>
            </Card>

            {/* API Endpoint */}
            <Card>
              <CardHeader><CardTitle className="text-base">API Endpoint Design</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <div className="bg-stone-50 rounded-lg p-4 font-mono text-xs space-y-2">
                  <div className="text-green-700 font-bold">GET /api/route-campgrounds</div>
                  <div className="text-muted-foreground">
                    ?start_lat=41.4993&start_lng=-81.6944<br />
                    &end_lat=44.7631&end_lng=-85.6206<br />
                    &buffer_miles=30<br />
                    &min_signal=moderate<br />
                    &min_rws=5<br />
                    &limit=25
                  </div>
                </div>
                <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 text-xs overflow-x-auto mt-4">
                  <code>{`// Response
{
  "route": {
    "start": "Cleveland, OH",
    "end": "Traverse City, MI",
    "distance_miles": 290
  },
  "corridor_width_miles": 30,
  "campgrounds": [
    {
      "name": "Ludington State Park",
      "signal": "strong",
      "remote_work_score": 9.2,
      "distance_from_route_miles": 12.4,
      ...
    }
  ],
  "total_found": 42
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SEO PAGES TAB ── */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> Complete URL Inventory (~{totalPages} pages)</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Page Type</th>
                        <th className="text-left py-2 px-4 font-medium">URL Pattern</th>
                        <th className="text-center py-2 px-4 font-medium">Count</th>
                        <th className="text-left py-2 pl-4 font-medium">Data Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seoPages.map((p, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4 font-medium">{p.type}</td>
                          <td className="py-2.5 px-4 font-mono text-xs">{p.pattern}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{p.count}</td>
                          <td className="py-2.5 pl-4 text-xs text-muted-foreground">{p.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-xs text-green-800 mt-4">
                  <strong>Total indexable pages: ~{totalPages}</strong> — Each page targets a unique long-tail keyword cluster.
                </div>
              </CardContent>
            </Card>

            {/* New Page Type Templates */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Laptop className="w-4 h-4" /> Remote Work Pages</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>URL:</strong> <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">/remote-work-camping/michigan</code></div>
                  <div><strong>Title:</strong> Best Remote Work Campgrounds in Michigan | SignalCamping</div>
                  <div><strong>Meta:</strong> Find N campgrounds in Michigan rated for remote work. Average RWS: X/10.</div>
                  <div className="bg-stone-50 rounded-lg p-3 mt-2">
                    <h4 className="font-medium text-xs mb-1">Page Sections:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {["Hero + State Stats", "RWS Distribution Chart", "Top 10 RW Campgrounds", "Filter by RWS Range", "Carrier Coverage", "Related State Pages"].map(s => (
                        <div key={s} className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-green-500" /> {s}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Signal className="w-4 h-4" /> Carrier-Specific Pages</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>URL:</strong> <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">/campgrounds-with-verizon-signal/michigan</code></div>
                  <div><strong>Title:</strong> Michigan Campgrounds with Verizon Signal (N Sites) | SignalCamping</div>
                  <div><strong>Meta:</strong> Find N campgrounds in Michigan with confirmed Verizon coverage.</div>
                  <div className="bg-stone-50 rounded-lg p-3 mt-2">
                    <h4 className="font-medium text-xs mb-1">Page Sections:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {["Hero + Carrier Stats", "Signal Strength Breakdown", "Strong Signal Campgrounds", "Map (carrier-filtered)", "Compare Carriers", "Related Carrier Pages"].map(s => (
                        <div key={s} className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-green-500" /> {s}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Route className="w-4 h-4" /> Trip Route Pages</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>URL:</strong> <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">/camping-stops/cleveland-to-traverse-city</code></div>
                  <div><strong>Title:</strong> Campgrounds with Cell Service: Cleveland to Traverse City | SignalCamping</div>
                  <div><strong>Meta:</strong> Find N campgrounds with cell service along the route.</div>
                  <div className="bg-stone-50 rounded-lg p-3 mt-2">
                    <h4 className="font-medium text-xs mb-1">Page Sections:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {["Route Map with Markers", "Campground List by Distance", "Signal Strength Filter", "Estimated Drive Times", "Amenity Filters", "Related Routes"].map(s => (
                        <div key={s} className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-green-500" /> {s}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Share2 className="w-4 h-4" /> Shareable List Pages</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>URL:</strong> <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">/lists/top-signal-michigan</code></div>
                  <div><strong>Title:</strong> Top 10 Campgrounds Where Your Phone Works in Michigan</div>
                  <div><strong>Meta:</strong> The best campgrounds for cell service in Michigan, ranked by signal strength.</div>
                  <div className="bg-stone-50 rounded-lg p-3 mt-2">
                    <h4 className="font-medium text-xs mb-1">Page Sections:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {["Numbered List with Cards", "Signal Badges", "Quick Amenity Icons", "Share Buttons", "Related Lists", "CTA: Explore on Map"].map(s => (
                        <div key={s} className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-green-500" /> {s}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── SHAREABLE LISTS TAB ── */}
          <TabsContent value="lists" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Auto-Generated List Types</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-4">Lists are dynamically generated from database queries and cached. Each has a unique URL designed for social sharing and SEO.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">List Title</th>
                        <th className="text-left py-2 px-4 font-medium">URL Slug</th>
                        <th className="text-left py-2 pl-4 font-medium">Query Logic</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { title: "Top 10 Campgrounds Where Your Phone Works in Michigan", slug: "/lists/top-signal-mi", query: "state=MI, ORDER BY avg_signal DESC" },
                        { title: "Top 10 Campgrounds Where Your Phone Works in Ohio", slug: "/lists/top-signal-oh", query: "state=OH, ORDER BY avg_signal DESC" },
                        { title: "Best Remote Work Campsites in Michigan", slug: "/lists/remote-work-mi", query: "state=MI, rws>=7, ORDER BY rws DESC" },
                        { title: "Best Remote Work Campsites in Ohio", slug: "/lists/remote-work-oh", query: "state=OH, rws>=7, ORDER BY rws DESC" },
                        { title: "Top 10 Verizon Campgrounds in Michigan", slug: "/lists/verizon-mi", query: "state=MI, verizon=Strong, ORDER BY confidence DESC" },
                        { title: "Best Waterfront Campgrounds with Cell Service in Michigan", slug: "/lists/waterfront-signal-mi", query: "state=MI, waterfront, signal!=none" },
                        { title: "Best Waterfront Campgrounds with Cell Service in Ohio", slug: "/lists/waterfront-signal-oh", query: "state=OH, waterfront, signal!=none" },
                        { title: "Top 10 Lakeside Campgrounds for Remote Workers", slug: "/lists/lakeside-remote-work", query: "waterfront, rws>=7, ORDER BY rws DESC" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4">{row.title}</td>
                          <td className="py-2.5 px-4 font-mono text-xs">{row.slug}</td>
                          <td className="py-2.5 pl-4 text-xs text-muted-foreground">{row.query}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview: Top Signal Michigan */}
            <Card>
              <CardHeader><CardTitle className="text-base">Preview: Top 10 Where Your Phone Works in Michigan</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topSignal.filter(c => c.state === "MI").slice(0, 10).map((cg, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{cg.campground_name}</div>
                        <div className="text-xs text-muted-foreground">{cg.city}, {cg.state}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className="bg-green-100 text-green-800 text-[10px]">RWS {cg.remote_work_score}</Badge>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cg.marker_color }} />
                          <span className="text-xs capitalize">{cg.best_signal_strength}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Preview: Best Waterfront with Signal */}
            <Card>
              <CardHeader><CardTitle className="text-base">Preview: Best Waterfront Campgrounds with Cell Service</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topWaterfront.slice(0, 8).map((cg, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{cg.campground_name}</div>
                        <div className="text-xs text-muted-foreground">{cg.city}, {cg.state} · {cg.nearest_lake_name}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700">Waterfront</Badge>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cg.marker_color }} />
                          <span className="text-xs capitalize">{cg.best_signal_strength}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* List Generation Logic */}
            <Card>
              <CardHeader><CardTitle className="text-base">List Generation Logic</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`const LIST_TEMPLATES = [
  {
    slug: "top-signal-{state}",
    title: "Top 10 Campgrounds Where Your Phone Works in {StateName}",
    query: (state) => campgrounds
      .filter(c => c.state === state)
      .sort((a, b) => b.avg_signal_numeric - a.avg_signal_numeric)
      .slice(0, 10)
  },
  {
    slug: "remote-work-{state}",
    title: "Best Remote Work Campsites in {StateName}",
    query: (state) => campgrounds
      .filter(c => c.state === state && c.remote_work_score >= 7)
      .sort((a, b) => b.remote_work_score - a.remote_work_score)
      .slice(0, 10)
  },
  {
    slug: "waterfront-signal-{state}",
    title: "Best Waterfront Campgrounds with Cell Service in {StateName}",
    query: (state) => campgrounds
      .filter(c => c.state === state && c.waterfront 
        && c.best_signal_strength !== 'none')
      .sort((a, b) => b.avg_signal_numeric - a.avg_signal_numeric)
      .slice(0, 10)
  }
];`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FILTERS TAB ── */}
          <TabsContent value="filters" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Extended Filter Definitions</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Filter</th>
                        <th className="text-left py-2 px-4 font-medium">UI Control</th>
                        <th className="text-left py-2 px-4 font-medium">Query Param</th>
                        <th className="text-left py-2 pl-4 font-medium">DB Column</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { filter: "Carrier Signal", ui: "Multi-select chips", param: "verizon=Strong", col: "verizon_signal, att_signal, tmobile_signal" },
                        { filter: "RemoteWorkScore", ui: "Range slider (0–10)", param: "min_rws=7", col: "remote_work_score" },
                        { filter: "Waterfront", ui: "Toggle switch", param: "waterfront=true", col: "waterfront" },
                        { filter: "Tent Camping", ui: "Toggle switch", param: "tent=true", col: "tent_sites" },
                        { filter: "Electric Hookups", ui: "Toggle switch", param: "electric=true", col: "electric_hookups" },
                        { filter: "State", ui: "Chip group", param: "state=MI", col: "state" },
                        { filter: "Distance from Lake", ui: "Range slider (0–30 mi)", param: "lake_max=10", col: "distance_to_lake_miles" },
                        { filter: "Distance from Town", ui: "Range slider (0–50 mi)", param: "town_max=15", col: "distance_to_town_miles" },
                        { filter: "Min Signal Confidence", ui: "Star rating (1–5)", param: "min_conf=3", col: "signal_confidence_score" },
                        { filter: "Campground Type", ui: "Chip group", param: "type=State+Park", col: "campground_type" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4 font-medium">{row.filter}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{row.ui}</td>
                          <td className="py-2.5 px-4 font-mono text-xs">{row.param}</td>
                          <td className="py-2.5 pl-4 font-mono text-xs">{row.col}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Combined Filter Query Example</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`-- "Remote-work-friendly waterfront campgrounds in Michigan 
--  with strong Verizon, within 10 miles of a lake"
SELECT c.*
FROM campgrounds c
WHERE c.state = 'MI'
  AND c.waterfront = TRUE
  AND c.verizon_signal = 'Strong'
  AND c.remote_work_score >= 7.0
  AND c.distance_to_lake_miles <= 10.0
  AND c.electric_hookups = TRUE
ORDER BY c.remote_work_score DESC, c.avg_signal_numeric DESC
LIMIT 25;`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BLUEPRINT TAB ── */}
          <TabsContent value="blueprint" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="w-4 h-4" /> Recommended Tech Stack</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Component</th>
                        <th className="text-left py-2 px-4 font-medium">Recommendation</th>
                        <th className="text-left py-2 pl-4 font-medium">Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { comp: "Frontend", rec: "Next.js 14 (App Router)", why: "SSG for SEO, ISR for lists, React ecosystem" },
                        { comp: "Database", rec: "Supabase (PostgreSQL + PostGIS)", why: "Free tier, built-in auth, geo queries" },
                        { comp: "Map Library", rec: "Mapbox GL JS", why: "Free 50K loads/mo, clustering, routes" },
                        { comp: "Hosting", rec: "Vercel", why: "Free tier, edge functions, Next.js native" },
                        { comp: "CSS", rec: "Tailwind CSS 4", why: "Utility-first, responsive, fast iteration" },
                        { comp: "ORM", rec: "Drizzle ORM", why: "Type-safe, lightweight, PostgreSQL native" },
                        { comp: "Search", rec: "Client-side → Algolia", why: "Start simple, upgrade at scale" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4 font-medium">{row.comp}</td>
                          <td className="py-2.5 px-4">{row.rec}</td>
                          <td className="py-2.5 pl-4 text-muted-foreground text-xs">{row.why}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">API Endpoints</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Method</th>
                        <th className="text-left py-2 px-4 font-medium">Endpoint</th>
                        <th className="text-left py-2 pl-4 font-medium">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiEndpoints.map((ep, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4"><Badge variant="outline" className="text-[10px]">{ep.method}</Badge></td>
                          <td className="py-2.5 px-4 font-mono text-xs">{ep.path}</td>
                          <td className="py-2.5 pl-4 text-muted-foreground text-xs">{ep.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Hosting Cost Estimate</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Service</th>
                        <th className="text-left py-2 px-4 font-medium">Free Tier</th>
                        <th className="text-left py-2 pl-4 font-medium">Paid Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { service: "Vercel", free: "100GB bandwidth, serverless", paid: "$20/mo Pro" },
                        { service: "Supabase", free: "500MB DB, 50K auth users", paid: "$25/mo Pro" },
                        { service: "Mapbox", free: "50K map loads/mo", paid: "$0.50/1K loads" },
                        { service: "Domain", free: "—", paid: "$12/yr (.com)" },
                        { service: "Total (launch)", free: "$0–1/mo", paid: "$45–60/mo at scale" },
                      ].map((row, i) => (
                        <tr key={i} className={`border-b border-stone-100 ${i === 4 ? 'font-bold' : ''}`}>
                          <td className="py-2.5 pr-4">{row.service}</td>
                          <td className="py-2.5 px-4">{row.free}</td>
                          <td className="py-2.5 pl-4">{row.paid}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">7-Week Launch Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { week: 1, focus: "Database + Data Import", tasks: "Supabase setup, schema, seed 150 campgrounds" },
                    { week: 2, focus: "Map + Filters", tasks: "Mapbox integration, filter panel, clustering" },
                    { week: 3, focus: "Campground Pages", tasks: "Individual pages with SEO, signal bars, RWS" },
                    { week: 4, focus: "State + SEO Pages", tasks: "State/regional/city pages, sitemap.xml" },
                    { week: 5, focus: "Route Discovery", tasks: "Corridor algorithm, route search UI" },
                    { week: 6, focus: "Lists + Remote Work", tasks: "Shareable lists, remote work pages, carrier pages" },
                    { week: 7, focus: "Polish + Launch", tasks: "Mobile optimization, performance, GA4, GSC" },
                  ].map(w => (
                    <div key={w.week} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm flex items-center justify-center shrink-0">{w.week}</div>
                      <div>
                        <div className="font-medium text-sm">{w.focus}</div>
                        <div className="text-xs text-muted-foreground">{w.tasks}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Structure */}
            <Card>
              <CardHeader><CardTitle className="text-base">Project Folder Structure</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`signalcamping/
├── app/
│   ├── page.tsx                                    # Homepage with map
│   ├── layout.tsx                                  # Root layout
│   ├── campground/[slug]/page.tsx                  # Individual campground
│   ├── campgrounds-with-cell-service/[state]/      # State pages
│   ├── remote-work-camping/[state]/                # Remote work pages
│   ├── campgrounds-with-[carrier]-signal/[state]/  # Carrier pages
│   ├── camping-stops/[route]/                      # Trip route pages
│   └── lists/[slug]/                               # Shareable lists
├── components/
│   ├── CampgroundMap.tsx
│   ├── FilterPanel.tsx
│   ├── CampgroundCard.tsx
│   ├── SignalBadge.tsx
│   ├── RemoteWorkBadge.tsx
│   ├── RouteSearch.tsx
│   └── ShareableList.tsx
├── lib/
│   ├── db.ts              # Drizzle + Supabase
│   ├── queries.ts         # Database queries
│   ├── route-corridor.ts  # Route algorithm
│   ├── seo.ts             # Meta generation
│   └── scoring.ts         # RemoteWorkScore
├── data/
│   ├── campgrounds.json   # Static fallback
│   └── geojson/
├── public/
│   ├── sitemap.xml
│   └── robots.txt
└── drizzle/
    └── schema.ts          # Database schema`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-10 mt-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <Signal className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h3>
              </div>
              <p className="text-sm">Product v1 definition for Michigan and Ohio campground discovery.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Pages</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/" className="hover:text-green-400 transition">Discovery Map</Link></li>
                <li><Link href="/top-campgrounds" className="hover:text-green-400 transition">Top 100 Campgrounds</Link></li>
                <li><Link href="/mvp-launch" className="hover:text-green-400 transition">MVP Launch Package</Link></li>
                <li><Link href="/build-spec" className="hover:text-green-400 transition">v1 Build Spec</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">States</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/campgrounds/mi" className="hover:text-green-400 transition">Michigan Campgrounds</Link></li>
                <li><Link href="/campgrounds/oh" className="hover:text-green-400 transition">Ohio Campgrounds</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-6 text-sm text-center text-stone-500">
            &copy; 2026 SignalCamping &mdash; Product v1 Definition
          </div>
        </div>
      </footer>
    </div>
  );
}
