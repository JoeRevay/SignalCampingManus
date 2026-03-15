/**
 * MVP Launch — Complete launch-ready package for SignalCamping v1
 *
 * Design: Documentation-style page with interactive data previews
 * Sections: Validation, Signal Classification, GeoJSON, Map Design, Filters, Templates
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, AlertTriangle, MapPin, Signal, Filter, FileCode,
  Database, Layout, Globe, ChevronLeft, Download, Map as MapIcon,
  Layers, Search, ArrowRight, ExternalLink, Zap
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import mvpData from "@/data/mvp_campgrounds.json";

/* ── Data processing ── */
const campgrounds = mvpData as any[];

const signalDist = (() => {
  const counts = { strong: 0, moderate: 0, weak: 0, none: 0 };
  campgrounds.forEach(c => {
    const s = c.best_signal_strength as keyof typeof counts;
    if (s in counts) counts[s]++;
  });
  return [
    { name: "Strong", value: counts.strong, color: "#22c55e" },
    { name: "Moderate", value: counts.moderate, color: "#eab308" },
    { name: "Weak", value: counts.weak, color: "#ef4444" },
    { name: "None", value: counts.none, color: "#1f2937" },
  ];
})();

const stateDist = (() => {
  const counts: Record<string, number> = {};
  campgrounds.forEach(c => { counts[c.state] = (counts[c.state] || 0) + 1; });
  return Object.entries(counts).map(([state, count]) => ({ state, count }));
})();

const typeDist = (() => {
  const counts: Record<string, number> = {};
  campgrounds.forEach(c => { counts[c.campground_type] = (counts[c.campground_type] || 0) + 1; });
  return Object.entries(counts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
})();

const carrierDist = (() => {
  const carriers = ["Verizon", "AT&T", "T-Mobile"];
  const fields = ["verizon_signal", "att_signal", "tmobile_signal"];
  return carriers.map((carrier, i) => {
    const field = fields[i];
    const counts = { Strong: 0, Moderate: 0, Weak: 0, "No Signal": 0 };
    campgrounds.forEach(c => {
      const val = c[field] as keyof typeof counts;
      if (val in counts) counts[val]++;
    });
    return { carrier, ...counts };
  });
})();

const amenityStats = [
  { name: "Waterfront", count: campgrounds.filter(c => c.waterfront).length, pct: 0 },
  { name: "Tent Sites", count: campgrounds.filter(c => c.tent_sites).length, pct: 0 },
  { name: "RV Sites", count: campgrounds.filter(c => c.rv_sites).length, pct: 0 },
  { name: "Electric", count: campgrounds.filter(c => c.electric_hookups).length, pct: 0 },
];
amenityStats.forEach(a => { a.pct = Math.round(a.count / campgrounds.length * 100); });

/* ── GeoJSON sample ── */
const geojsonSample = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [-86.4526, 43.9453] },
  properties: {
    id: "ludington-state-park",
    name: "Ludington State Park",
    city: "Ludington",
    state: "MI",
    signal: "strong",
    color: "#22c55e",
    carrier: "Verizon",
    confidence: 4,
    waterfront: true,
    tent: true,
    electric: true
  }
};

/* ── Top campgrounds preview ── */
const topCampgrounds = [...campgrounds]
  .sort((a, b) => a.mvp_rank - b.mvp_rank)
  .slice(0, 20);

export default function MvpLaunch() {
  const [activeTab, setActiveTab] = useState("overview");

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
                <p className="text-[10px] text-muted-foreground leading-none">Great Lakes Campground Signal Discovery</p>
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">Top 100</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">Discovery Map</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Back link */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 text-green-700 hover:text-green-800 -ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Discovery Map
          </Button>
        </Link>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">MVP Launch Package</Badge>
            <Badge variant="outline" className="border-green-200 text-green-700">Michigan + Ohio</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Launch-Ready Data Package
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Complete validated dataset, GeoJSON map data, signal classification, and architecture documentation
            for launching SignalCamping v1 with {campgrounds.length} campgrounds across Michigan and Ohio.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Campgrounds", value: campgrounds.length, icon: MapPin, color: "text-green-600" },
            { label: "Validated", value: "100%", icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Strong Signal", value: signalDist[0].value, icon: Signal, color: "text-green-500" },
            { label: "Moderate", value: signalDist[1].value, icon: Signal, color: "text-yellow-500" },
            { label: "GeoJSON Features", value: campgrounds.length, icon: MapIcon, color: "text-blue-500" },
            { label: "SEO Pages", value: "~232", icon: Globe, color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-stone-200">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <div className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-stone-100 p-1 mb-6">
            {[
              { value: "overview", label: "Overview", icon: Layout },
              { value: "validation", label: "Validation", icon: CheckCircle2 },
              { value: "signals", label: "Signal Classification", icon: Signal },
              { value: "geojson", label: "GeoJSON & Map", icon: MapIcon },
              { value: "filters", label: "Search Filters", icon: Filter },
              { value: "templates", label: "Page Templates", icon: FileCode },
              { value: "data", label: "MVP Data", icon: Database },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 data-[state=active]:bg-white">
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Signal Distribution Pie */}
              <Card>
                <CardHeader><CardTitle className="text-base">Signal Strength Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={signalDist} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {signalDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* State Distribution */}
              <Card>
                <CardHeader><CardTitle className="text-base">Campgrounds by State</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stateDist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="state" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Carrier Coverage */}
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">Carrier Coverage Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={carrierDist} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" />
                      <YAxis dataKey="carrier" type="category" width={80} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Strong" stackId="a" fill="#22c55e" />
                      <Bar dataKey="Moderate" stackId="a" fill="#eab308" />
                      <Bar dataKey="Weak" stackId="a" fill="#ef4444" />
                      <Bar dataKey="No Signal" stackId="a" fill="#1f2937" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Amenity Stats */}
            <Card>
              <CardHeader><CardTitle className="text-base">Amenity Coverage</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {amenityStats.map(a => (
                    <div key={a.name} className="text-center p-4 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{a.pct}%</div>
                      <div className="text-sm text-muted-foreground">{a.name}</div>
                      <div className="text-xs text-stone-400">{a.count} of {campgrounds.length}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── VALIDATION TAB ── */}
          <TabsContent value="validation" className="space-y-6">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">All Validation Checks Passed</h3>
                    <p className="text-sm text-green-700">The MVP dataset of {campgrounds.length} campgrounds passed all 7 validation checks with zero flagged issues.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Validation Results</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Check</th>
                        <th className="text-center py-2 px-4 font-medium">Issues Found</th>
                        <th className="text-center py-2 pl-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { check: "Duplicate campgrounds", count: 0 },
                        { check: "Missing coordinates", count: 0 },
                        { check: "Invalid coordinates (outside Great Lakes bounds)", count: 0 },
                        { check: "Invalid reservation links", count: 0 },
                        { check: "Unrealistic signal ratings", count: 0 },
                        { check: "State format issues", count: 0 },
                        { check: "City format issues", count: 0 },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4">{row.check}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{row.count}</td>
                          <td className="py-2.5 pl-4 text-center">
                            <Badge className="bg-green-100 text-green-700 border-green-200">PASS</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Validation Methodology</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p><strong>Duplicate detection:</strong> Checked for exact campground name matches across all 150 records. No duplicates found.</p>
                <p><strong>Coordinate validation:</strong> Verified all latitude values fall within 38.0°–49.0°N and all longitude values within 74.0°–93.0°W (Great Lakes bounding box).</p>
                <p><strong>Reservation links:</strong> Confirmed all 150 campgrounds have URLs starting with <code>http://</code> or <code>https://</code>.</p>
                <p><strong>Signal ratings:</strong> Verified all carrier signal values are one of: Strong, Moderate, Weak, No Signal. Checked signal_confidence_score is between 1–5. Flagged suspicious patterns (all carriers identical with low confidence).</p>
                <p><strong>Formatting:</strong> Verified state abbreviations are MI or OH. Checked city names start with uppercase letters.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SIGNAL CLASSIFICATION TAB ── */}
          <TabsContent value="signals" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Signal Strength Classification Rules</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Each campground's <code>avg_signal_numeric</code> (average across Verizon, AT&T, T-Mobile) is mapped to a categorical signal strength and marker color.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Numeric Range</th>
                        <th className="text-left py-2 px-4 font-medium">Category</th>
                        <th className="text-left py-2 px-4 font-medium">Marker Color</th>
                        <th className="text-center py-2 px-4 font-medium">Count</th>
                        <th className="text-center py-2 pl-4 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { range: "4.0 – 5.0", cat: "Strong", color: "#22c55e", label: "Green", count: signalDist[0].value },
                        { range: "3.0 – 3.99", cat: "Moderate", color: "#eab308", label: "Yellow", count: signalDist[1].value },
                        { range: "2.0 – 2.99", cat: "Weak", color: "#ef4444", label: "Red", count: signalDist[2].value },
                        { range: "1.0 – 1.99", cat: "None", color: "#1f2937", label: "Black", count: signalDist[3].value },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4 font-mono text-xs">{row.range}</td>
                          <td className="py-2.5 px-4 font-medium">{row.cat}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border border-stone-200" style={{ backgroundColor: row.color }} />
                              <span className="text-xs text-muted-foreground">{row.label} ({row.color})</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono">{row.count}</td>
                          <td className="py-2.5 pl-4 text-center">{(row.count / campgrounds.length * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">New Fields Added</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Field</th>
                        <th className="text-left py-2 px-4 font-medium">Type</th>
                        <th className="text-left py-2 px-4 font-medium">Values</th>
                        <th className="text-left py-2 pl-4 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-stone-100">
                        <td className="py-2.5 pr-4 font-mono text-xs">best_signal_strength</td>
                        <td className="py-2.5 px-4">string</td>
                        <td className="py-2.5 px-4"><code>strong | moderate | weak | none</code></td>
                        <td className="py-2.5 pl-4 text-muted-foreground">Derived from avg_signal_numeric</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="py-2.5 pr-4 font-mono text-xs">marker_color</td>
                        <td className="py-2.5 px-4">string</td>
                        <td className="py-2.5 px-4"><code>#22c55e | #eab308 | #ef4444 | #1f2937</code></td>
                        <td className="py-2.5 pl-4 text-muted-foreground">Hex color for map markers</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Campground Type Distribution */}
            <Card>
              <CardHeader><CardTitle className="text-base">Campground Type Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={typeDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── GEOJSON & MAP TAB ── */}
          <TabsContent value="geojson" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Full GeoJSON
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-muted-foreground">Complete GeoJSON with all campground properties for detailed map interactions and popups.</p>
                  <div className="bg-stone-50 rounded-lg p-3 space-y-1 text-xs font-mono">
                    <div>Features: <strong>{campgrounds.length}</strong></div>
                    <div>Properties per feature: <strong>27</strong></div>
                    <div>File size: <strong>~150 KB</strong></div>
                    <div>Use case: <strong>Detail popups, full search</strong></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Lightweight GeoJSON
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-muted-foreground">Minimal GeoJSON for fast initial map rendering with clustering. Loads in under 100ms.</p>
                  <div className="bg-stone-50 rounded-lg p-3 space-y-1 text-xs font-mono">
                    <div>Features: <strong>{campgrounds.length}</strong></div>
                    <div>Properties per feature: <strong>11</strong></div>
                    <div>File size: <strong>~77 KB</strong></div>
                    <div>Use case: <strong>Initial map load, clustering</strong></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">GeoJSON Feature Example</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{JSON.stringify(geojsonSample, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Map System Design</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><MapIcon className="w-4 h-4 text-green-600" /> Marker Clustering</h4>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>Zoom 1–6: Large clusters (state-level)</li>
                      <li>Zoom 7–9: Medium clusters (regional)</li>
                      <li>Zoom 10–12: Small clusters or individual</li>
                      <li>Zoom 13+: All individual markers visible</li>
                    </ul>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Signal className="w-4 h-4 text-green-600" /> Marker Colors</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Strong", color: "#22c55e" },
                        { label: "Moderate", color: "#eab308" },
                        { label: "Weak", color: "#ef4444" },
                        { label: "No Signal", color: "#1f2937" },
                      ].map(m => (
                        <div key={m.label} className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                          <span>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Popup Preview (on marker click)</h4>
                  <div className="bg-white rounded-lg border border-stone-200 p-3 max-w-xs">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-semibold text-sm">Ludington State Park</div>
                        <div className="text-xs text-muted-foreground">Ludington, MI</div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-[10px]">MI</Badge>
                    </div>
                    <div className="flex items-center gap-1 my-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium">Strong Signal (4.2/5)</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">Best: Verizon</div>
                    <div className="flex gap-1 mb-3">
                      <Badge variant="outline" className="text-[10px] px-1.5">Tent</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">Electric</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">Waterfront</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-[10px] h-6 bg-green-600 hover:bg-green-700">View Details</Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-6">Reserve</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Interaction Flow</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {["Page Load", "Clusters Render", "User Zooms In", "Markers Appear", "Click Marker", "Popup Shows", "View Details", "Detail Page"].map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 font-medium">{step}</div>
                        {i < 7 && <ArrowRight className="w-3 h-3 text-stone-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FILTERS TAB ── */}
          <TabsContent value="filters" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Search Filter Definitions</CardTitle></CardHeader>
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
                        { filter: "Waterfront", ui: "Toggle switch", param: "waterfront=true", col: "waterfront" },
                        { filter: "Tent Camping", ui: "Toggle switch", param: "tent=true", col: "tent_sites" },
                        { filter: "Electric Hookups", ui: "Toggle switch", param: "electric=true", col: "electric_hookups" },
                        { filter: "State", ui: "Chip group", param: "state=MI", col: "state" },
                        { filter: "Distance from Lake", ui: "Range slider (0–30 mi)", param: "lake_max=10", col: "distance_to_lake_miles" },
                        { filter: "Distance from Town", ui: "Range slider (0–50 mi)", param: "town_max=15", col: "distance_to_town_miles" },
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
              <CardHeader><CardTitle className="text-base">Example SQL Queries</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Waterfront + Strong Verizon in Michigan</h4>
                  <pre className="bg-stone-900 text-stone-100 rounded-lg p-3 text-xs overflow-x-auto">
                    <code>{`SELECT c.*, ST_AsGeoJSON(c.location) as geojson
FROM campgrounds c
JOIN states s ON c.state_id = s.id
WHERE s.abbreviation = 'MI'
  AND c.waterfront = TRUE
  AND c.verizon_signal = 'Strong'
ORDER BY c.mvp_rank ASC
LIMIT 25 OFFSET 0;`}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Tent-friendly within 5 miles of a lake</h4>
                  <pre className="bg-stone-900 text-stone-100 rounded-lg p-3 text-xs overflow-x-auto">
                    <code>{`SELECT c.*, c.distance_to_lake AS lake_distance
FROM campgrounds c
WHERE c.tent_sites = TRUE
  AND c.distance_to_lake <= 5.0
ORDER BY c.distance_to_lake ASC,
         c.avg_signal_numeric DESC;`}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Client-side filter logic (MVP)</h4>
                  <pre className="bg-stone-900 text-stone-100 rounded-lg p-3 text-xs overflow-x-auto">
                    <code>{`function applyFilters(campgrounds, filters) {
  return campgrounds.filter(cg => {
    if (filters.state && cg.state !== filters.state) return false;
    if (filters.waterfront && !cg.waterfront) return false;
    if (filters.tent && !cg.tent_sites) return false;
    if (filters.electric && !cg.electric_hookups) return false;
    if (filters.verizon && cg.verizon_signal !== filters.verizon) return false;
    if (filters.lakeMax && cg.distance_to_lake_miles > filters.lakeMax) return false;
    if (filters.townMax && cg.distance_to_town_miles > filters.townMax) return false;
    return true;
  });
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PAGE TEMPLATES TAB ── */}
          <TabsContent value="templates" className="space-y-6">
            {/* Campground Page Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCode className="w-4 h-4" /> Individual Campground Page
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">URL Pattern</h4>
                    <code className="text-xs bg-stone-100 px-2 py-1 rounded">/campground/{"{"}<span className="text-green-700">slug</span>{"}"}</code>
                    <p className="text-xs text-muted-foreground mt-1">Example: /campground/ludington-state-park</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">SEO Title Pattern</h4>
                    <code className="text-xs bg-stone-100 px-2 py-1 rounded">{"{"}<span className="text-green-700">Name</span>{"}"} Cell Service & Camping | SignalCamping</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Meta Description Pattern</h4>
                  <div className="bg-stone-50 rounded-lg p-3 text-xs text-muted-foreground">
                    <span className="text-green-700">{"{"}<span>Name</span>{"}"}</span> in <span className="text-green-700">{"{"}<span>City</span>{"}"}</span>, <span className="text-green-700">{"{"}<span>State</span>{"}"}</span> — <span className="text-green-700">{"{"}<span>Best Carrier</span>{"}"}</span> has <span className="text-green-700">{"{"}<span>Signal</span>{"}"}</span> signal. <span className="text-green-700">{"{"}<span>Amenities</span>{"}"}</span>. Signal confidence: <span className="text-green-700">{"{"}<span>Score</span>{"}"}</span>/5.
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Page Sections</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {["Breadcrumbs", "Hero + Signal Badge", "Carrier Coverage Bars", "Quick Facts Sidebar", "Amenity Grid", "What to Know", "Mini Map", "Nearby Campgrounds", "More in State", "JSON-LD Schema"].map(s => (
                      <div key={s} className="bg-stone-50 rounded px-3 py-2 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* State Page Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" /> State Landing Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">URL Pattern</h4>
                    <code className="text-xs bg-stone-100 px-2 py-1 rounded">/campgrounds-with-cell-service/{"{"}<span className="text-green-700">state</span>{"}"}</code>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">SEO Title Pattern</h4>
                    <code className="text-xs bg-stone-100 px-2 py-1 rounded">{"{"}<span className="text-green-700">State</span>{"}"} Campgrounds with Cell Service ({"{"}<span className="text-green-700">N</span>{"}"}) | SignalCamping</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Page Sections</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {["Breadcrumbs", "State Hero + Stats", "Filter Sidebar", "State Map", "Campground List (25/page)", "Coverage Charts", "Cross-link to Other State"].map(s => (
                      <div key={s} className="bg-stone-50 rounded px-3 py-2 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional + City Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4" /> Regional & City Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">Page Type</th>
                        <th className="text-left py-2 px-4 font-medium">URL Example</th>
                        <th className="text-left py-2 px-4 font-medium">Data Source</th>
                        <th className="text-center py-2 pl-4 font-medium">Est. Pages</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-stone-100">
                        <td className="py-2.5 pr-4 font-medium">State</td>
                        <td className="py-2.5 px-4 font-mono text-xs">/campgrounds-with-cell-service/michigan</td>
                        <td className="py-2.5 px-4 text-muted-foreground">WHERE state = 'MI'</td>
                        <td className="py-2.5 pl-4 text-center">2</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="py-2.5 pr-4 font-medium">Regional</td>
                        <td className="py-2.5 px-4 font-mono text-xs">/campgrounds-with-cell-service/northern-michigan</td>
                        <td className="py-2.5 px-4 text-muted-foreground">WHERE lat BETWEEN bounds</td>
                        <td className="py-2.5 pl-4 text-center">~8</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="py-2.5 pr-4 font-medium">City</td>
                        <td className="py-2.5 px-4 font-mono text-xs">/campgrounds-with-cell-service/petoskey-mi</td>
                        <td className="py-2.5 px-4 text-muted-foreground">ST_DWithin(30 miles)</td>
                        <td className="py-2.5 pl-4 text-center">~71</td>
                      </tr>
                      <tr className="border-b border-stone-100">
                        <td className="py-2.5 pr-4 font-medium">Campground</td>
                        <td className="py-2.5 px-4 font-mono text-xs">/campground/ludington-state-park</td>
                        <td className="py-2.5 px-4 text-muted-foreground">WHERE slug = $1</td>
                        <td className="py-2.5 pl-4 text-center">150</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-xs text-green-800">
                  <strong>Total indexable pages: ~232</strong> — Each page targets a unique long-tail keyword cluster and creates internal links to related pages, building a strong topical authority signal for search engines.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DATA TAB ── */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 20 MVP Campgrounds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-2 font-medium">#</th>
                        <th className="text-left py-2 px-2 font-medium">Campground</th>
                        <th className="text-left py-2 px-2 font-medium">City</th>
                        <th className="text-center py-2 px-2 font-medium">State</th>
                        <th className="text-center py-2 px-2 font-medium">Signal</th>
                        <th className="text-center py-2 px-2 font-medium">Carrier</th>
                        <th className="text-center py-2 px-2 font-medium">Score</th>
                        <th className="text-center py-2 px-2 font-medium">Water</th>
                        <th className="text-center py-2 pl-2 font-medium">Tent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCampgrounds.map((cg, i) => (
                        <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="py-2 pr-2 font-mono">{cg.mvp_rank}</td>
                          <td className="py-2 px-2 font-medium max-w-[200px] truncate">{cg.campground_name}</td>
                          <td className="py-2 px-2 text-muted-foreground">{cg.city}</td>
                          <td className="py-2 px-2 text-center">{cg.state}</td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cg.marker_color }} />
                              <span className="capitalize">{cg.best_signal_strength}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-muted-foreground">{cg.best_carrier}</td>
                          <td className="py-2 px-2 text-center font-mono">{cg.signal_confidence_score}/5</td>
                          <td className="py-2 px-2 text-center">{cg.waterfront ? "✓" : "—"}</td>
                          <td className="py-2 pl-2 text-center">{cg.tent_sites ? "✓" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Output Files</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-medium">File</th>
                        <th className="text-left py-2 px-4 font-medium">Format</th>
                        <th className="text-center py-2 px-4 font-medium">Records</th>
                        <th className="text-left py-2 pl-4 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { file: "mvp_cleaned.csv", format: "CSV", records: "150", desc: "Cleaned MVP dataset with signal classification" },
                        { file: "mvp_flagged_records.csv", format: "CSV", records: "0", desc: "Records requiring manual review (none found)" },
                        { file: "mvp_campgrounds_full.geojson", format: "GeoJSON", records: "150", desc: "Full GeoJSON with all 27 properties per feature" },
                        { file: "mvp_campgrounds_light.geojson", format: "GeoJSON", records: "150", desc: "Lightweight GeoJSON for fast map rendering" },
                        { file: "mvp_validation_report.md", format: "Markdown", records: "—", desc: "Complete validation report with statistics" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-stone-100">
                          <td className="py-2.5 pr-4 font-mono text-xs">{row.file}</td>
                          <td className="py-2.5 px-4"><Badge variant="outline" className="text-[10px]">{row.format}</Badge></td>
                          <td className="py-2.5 px-4 text-center font-mono">{row.records}</td>
                          <td className="py-2.5 pl-4 text-muted-foreground">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <p className="text-sm">MVP launch package for Michigan and Ohio campground discovery.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Pages</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/" className="hover:text-green-400 transition">Discovery Map</Link></li>
                <li><Link href="/top-campgrounds" className="hover:text-green-400 transition">Top 100 Campgrounds</Link></li>
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
            &copy; 2026 SignalCamping &mdash; MVP Launch Package
          </div>
        </div>
      </footer>
    </div>
  );
}
