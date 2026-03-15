/**
 * Home — SignalCamping Discovery Platform
 *
 * Design: Map-driven campground discovery with sidebar filters.
 * Layout: Left sidebar (filters) + main area (search, stats, map/list toggle, detail view).
 */
import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Signal, Map as MapIcon, List, BarChart3, Download, Search,
  ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from "recharts";

import CampgroundMap from "@/components/CampgroundMap";
import FilterPanel, { type Filters, DEFAULT_FILTERS, applyFilters } from "@/components/FilterPanel";
import CampgroundList from "@/components/CampgroundList";
import CampgroundDetail from "@/components/CampgroundDetail";
import StatsPanel from "@/components/StatsPanel";

import rawData from "@/data/campgrounds.json";

/* ──────────────────────────── Data normalisation ──────────────────────────── */

const allCampgrounds = (rawData as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || cg.tent_sites === "True",
  rv_sites: cg.rv_sites === true || cg.rv_sites === "True",
  electric_hookups: cg.electric_hookups === true || cg.electric_hookups === "True",
  waterfront: cg.waterfront === true || cg.waterfront === "True",
}));

/* ──────────────────────────── Component ──────────────────────────── */

export default function Home() {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [selectedCampground, setSelectedCampground] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  /* ── Filtered data ── */
  const filtered = useMemo(() => applyFilters(allCampgrounds, filters), [filters]);

  /* ── Search handler (updates filters.searchTerm) ── */
  const handleSearch = useCallback((term: string) => {
    setFilters(f => ({ ...f, searchTerm: term }));
  }, []);

  /* ── CSV download ── */
  const downloadCSV = useCallback(() => {
    const headers = [
      "campground_name", "city", "state", "latitude", "longitude", "campground_type",
      "tent_sites", "rv_sites", "electric_hookups", "waterfront",
      "verizon_signal", "att_signal", "tmobile_signal", "signal_confidence_score",
      "nearest_lake_name", "distance_to_lake_miles", "nearest_town", "distance_to_town_miles",
      "elevation_ft", "forest_cover_percent", "reservation_link", "website"
    ];
    const rows = filtered.map(cg => headers.map(h => {
      const v = cg[h];
      return typeof v === "string" && v.includes(",") ? `"${v}"` : v;
    }).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signal_camping_${filtered.length}_campgrounds.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  /* ── Analytics data for charts ── */
  const stateStats = useMemo(() => {
    const m: Record<string, { count: number; sig: number; elev: number; forest: number }> = {};
    filtered.forEach(cg => {
      if (!m[cg.state]) m[cg.state] = { count: 0, sig: 0, elev: 0, forest: 0 };
      m[cg.state].count++;
      m[cg.state].sig += cg.signal_confidence_score;
      m[cg.state].elev += cg.elevation_ft;
      m[cg.state].forest += cg.forest_cover_percent;
    });
    return Object.entries(m).map(([state, d]) => ({
      state, campgrounds: d.count,
      avgSignal: Math.round(d.sig / d.count * 10) / 10,
      avgElevation: Math.round(d.elev / d.count),
      avgForest: Math.round(d.forest / d.count),
    }));
  }, [filtered]);

  const typeDistribution = useMemo(() => {
    const t: Record<string, number> = {};
    filtered.forEach(cg => { t[cg.campground_type] = (t[cg.campground_type] || 0) + 1; });
    return Object.entries(t).map(([type, count]) => ({
      name: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), value: count,
    }));
  }, [filtered]);

  const signalDist = useMemo(() => {
    const d: Record<number, number> = {};
    filtered.forEach(cg => { d[cg.signal_confidence_score] = (d[cg.signal_confidence_score] || 0) + 1; });
    return [5, 4, 3, 2, 1].map(s => ({ score: `${s}★`, count: d[s] || 0 }));
  }, [filtered]);

  const elevSignalScatter = useMemo(() =>
    filtered.slice(0, 500).map(cg => ({
      elevation: cg.elevation_ft, signal: cg.signal_confidence_score,
      forest: cg.forest_cover_percent, name: cg.campground_name,
    })),
  [filtered]);

  const COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed"];

  /* ── Detail view ── */
  if (selectedCampground) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <Header />
        <div className="container py-6">
          <CampgroundDetail campground={selectedCampground} onBack={() => setSelectedCampground(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <Header />

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden container pt-4">
        <Button variant="outline" size="sm" onClick={() => setMobileSidebar(!mobileSidebar)}>
          {mobileSidebar ? <X className="w-4 h-4 mr-1" /> : <Menu className="w-4 h-4 mr-1" />}
          {mobileSidebar ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      <div className="container py-4">
        <div className="flex gap-6">
          {/* ── Sidebar ── */}
          <aside className={`
            ${sidebarOpen ? "w-72 min-w-[288px]" : "w-0 min-w-0 overflow-hidden"}
            hidden lg:block transition-all duration-300 shrink-0
          `}>
            <div className="sticky top-4">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                totalCount={allCampgrounds.length}
                filteredCount={filtered.length}
              />
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileSidebar && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebar(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4 shadow-xl">
                <FilterPanel
                  filters={filters}
                  onChange={(f) => { setFilters(f); }}
                  totalCount={allCampgrounds.length}
                  filteredCount={filtered.length}
                />
              </div>
            </div>
          )}

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Search bar + actions */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-400 hover:text-gray-600">
                  {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campgrounds, cities, lakes, or towns..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={downloadCSV} className="shrink-0">
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
            </div>

            {/* Stats */}
            <StatsPanel campgrounds={filtered} totalCount={allCampgrounds.length} />

            {/* Tabs: Map / List / Analytics */}
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="map" className="flex items-center gap-1.5">
                  <MapIcon className="w-4 h-4" /> Map
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-1.5">
                  <List className="w-4 h-4" /> List
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" /> Analytics
                </TabsTrigger>
              </TabsList>

              {/* ── Map Tab ── */}
              <TabsContent value="map" className="mt-4">
                <CampgroundMap
                  campgrounds={filtered}
                  onCampgroundClick={setSelectedCampground}
                />
              </TabsContent>

              {/* ── List Tab ── */}
              <TabsContent value="list" className="mt-4">
                <CampgroundList campgrounds={filtered} onSelect={setSelectedCampground} />
              </TabsContent>

              {/* ── Analytics Tab ── */}
              <TabsContent value="analytics" className="mt-4 space-y-6">
                {/* State breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campgrounds by State</CardTitle>
                    <CardDescription>Count and average signal score for filtered results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stateStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="state" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="campgrounds" fill="#16a34a" name="Campgrounds" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="avgSignal" fill="#2563eb" name="Avg Signal" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Type pie */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Campground Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                            {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Signal distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Signal Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={signalDist}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="score" />
                          <YAxis />
                          <Tooltip formatter={(v: number) => `${v} campgrounds`} />
                          <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Elevation vs Signal scatter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Elevation vs. Signal Confidence</CardTitle>
                    <CardDescription>Bubble size represents forest cover percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="elevation" name="Elevation" unit=" ft" type="number" />
                        <YAxis dataKey="signal" name="Signal" domain={[0, 6]} />
                        <ZAxis dataKey="forest" range={[20, 200]} name="Forest Cover" />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }}
                          formatter={(value: number, name: string) => [
                            name === "Elevation" ? `${value.toLocaleString()} ft` :
                            name === "Signal" ? `${value}/5` :
                            `${value}%`, name
                          ]} />
                        <Scatter data={elevSignalScatter} fill="#16a34a" fillOpacity={0.4} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* State elevation + forest comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">State Comparison: Elevation & Forest Cover</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stateStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="state" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="avgElevation" fill="#7c3aed" name="Avg Elevation (ft)" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="avgForest" fill="#16a34a" name="Avg Forest Cover (%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10 mt-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <Signal className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h3>
              </div>
              <p className="text-sm leading-relaxed">Map-driven campground discovery with cellular signal analysis. {allCampgrounds.length.toLocaleString()} campgrounds across the Great Lakes region.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Browse by State</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/campgrounds/mi" className="hover:text-green-400 transition">Michigan Campgrounds</Link></li>
                <li><Link href="/campgrounds/oh" className="hover:text-green-400 transition">Ohio Campgrounds</Link></li>
                <li><Link href="/campgrounds/pa" className="hover:text-green-400 transition">Pennsylvania Campgrounds</Link></li>
                <li><Link href="/campgrounds/wi" className="hover:text-green-400 transition">Wisconsin Campgrounds</Link></li>
                <li><Link href="/campgrounds/wv" className="hover:text-green-400 transition">West Virginia Campgrounds</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/top-campgrounds" className="hover:text-green-400 transition">Top 100 Campgrounds</Link></li>
                <li><Link href="/build-spec" className="hover:text-green-400 transition">v1 Build Spec</Link></li>
                <li><Link href="/mvp-launch" className="hover:text-green-400 transition">MVP Launch Package</Link></li>
                <li><Link href="/product-v1" className="hover:text-green-400 transition">Product v1 Definition</Link></li>
                <li><span className="text-gray-500">GeoJSON map-ready format</span></li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">Scalable to 13,000+ U.S. campgrounds</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
            &copy; 2026 SignalCamping &mdash; Research dataset and system architecture for campground discovery.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Header component ── */
function Header() {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
            <Signal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h1>
            <p className="text-xs text-muted-foreground">Great Lakes Campground Signal Discovery</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                Top 100
              </Button>
            </Link>
            <Link href="/build-spec">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                Build Spec
              </Button>
            </Link>
            <Link href="/mvp-launch">
              <Button variant="ghost" size="sm" className="text-xs text-amber-700 hover:text-amber-800 hidden sm:inline-flex">
                MVP Launch
              </Button>
            </Link>
            <Link href="/product-v1">
              <Button variant="ghost" size="sm" className="text-xs text-purple-700 hover:text-purple-800 hidden sm:inline-flex">
                Product v1
              </Button>
            </Link>
            <Link href="/seo-directory">
              <Button variant="ghost" size="sm" className="text-xs text-gray-700 hover:text-gray-800 hidden sm:inline-flex">
                SEO Pages
              </Button>
            </Link>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex border-green-200 text-green-700 bg-green-50">
              {allCampgrounds.length.toLocaleString()} Campgrounds
            </Badge>
            <Badge variant="outline" className="text-xs hidden md:inline-flex border-blue-200 text-blue-700 bg-blue-50">5 States</Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
