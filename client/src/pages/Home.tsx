import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import {
  Signal, MapPin, Wifi, Tent, Truck, Zap, Waves,
  Mountain, Navigation, ChevronLeft, ChevronRight, ArrowUpDown
} from "lucide-react";
import campgroundsData from "@/data/campgrounds.json";

/* ──────────────────────────── Types ──────────────────────────── */

interface Campground {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  type: string;
  tent: boolean | string;
  rv: boolean | string;
  electric: boolean | string;
  waterfront: boolean | string;
  verizon: string;
  att: string;
  tmobile: string;
  signal_confidence: number;
  elevation_ft: number;
  nearest_lake: string;
  distance_to_nearest_town_mi: number;
  reservation_link: string;
  website: string;
}

/* ──────────────────────────── Helpers ──────────────────────────── */

const signalColor = (s: string) =>
  s === "Strong" ? "bg-green-100 text-green-800" :
  s === "Moderate" ? "bg-yellow-100 text-yellow-800" :
  s === "Weak" ? "bg-orange-100 text-orange-800" :
  "bg-red-100 text-red-800";

const PAGE_SIZE = 25;

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin", WV: "West Virginia",
};

/* ──────────────────────────── Component ──────────────────────────── */

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  /* ── Normalise booleans ── */
  const normalizedData: Campground[] = useMemo(() =>
    (campgroundsData as any[]).map((cg) => ({
      ...cg,
      tent: cg.tent === true || cg.tent === "True",
      rv: cg.rv === true || cg.rv === "True",
      electric: cg.electric === true || cg.electric === "True",
      waterfront: cg.waterfront === true || cg.waterfront === "True",
    })),
  []);

  /* ── Filter + sort ── */
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let data = normalizedData.filter((cg) => {
      const matchesSearch =
        cg.name.toLowerCase().includes(term) ||
        cg.city.toLowerCase().includes(term) ||
        cg.nearest_lake.toLowerCase().includes(term);
      const matchesState = !selectedState || cg.state === selectedState;
      return matchesSearch && matchesState;
    });
    data.sort((a, b) => {
      const av = a[sortField as keyof Campground];
      const bv = b[sortField as keyof Campground];
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return 0;
    });
    return data;
  }, [searchTerm, selectedState, sortField, sortDir, normalizedData]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pagedData = filteredData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };

  /* ── Statistics ── */
  const states = useMemo(() => Array.from(new Set(normalizedData.map(c => c.state))).sort(), [normalizedData]);

  const stateStats = useMemo(() => {
    const m: Record<string, { count: number; sigSum: number; elevSum: number; distSum: number }> = {};
    normalizedData.forEach(cg => {
      if (!m[cg.state]) m[cg.state] = { count: 0, sigSum: 0, elevSum: 0, distSum: 0 };
      m[cg.state].count++;
      m[cg.state].sigSum += cg.signal_confidence;
      m[cg.state].elevSum += cg.elevation_ft;
      m[cg.state].distSum += cg.distance_to_nearest_town_mi;
    });
    return Object.entries(m).map(([state, d]) => ({
      state,
      campgrounds: d.count,
      avgSignal: Math.round(d.sigSum / d.count * 10) / 10,
      avgElevation: Math.round(d.elevSum / d.count),
      avgDistTown: Math.round(d.distSum / d.count * 10) / 10,
    }));
  }, [normalizedData]);

  const signalDistribution = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    normalizedData.forEach(cg => { dist[cg.signal_confidence] = (dist[cg.signal_confidence] || 0) + 1; });
    return [5, 4, 3, 2, 1].map(s => ({
      score: `${s} Stars`, count: dist[s] || 0,
      percentage: (((dist[s] || 0) / normalizedData.length) * 100).toFixed(1),
    }));
  }, [normalizedData]);

  const carrierCoverage = useMemo(() => {
    const c: Record<string, Record<string, number>> = { verizon: {}, att: {}, tmobile: {} };
    normalizedData.forEach(cg => {
      (["verizon", "att", "tmobile"] as const).forEach(carrier => {
        const sig = cg[carrier] as string;
        c[carrier][sig] = (c[carrier][sig] || 0) + 1;
      });
    });
    return c;
  }, [normalizedData]);

  const amenitiesStats = useMemo(() => [
    { name: "Tent Camping", count: normalizedData.filter(c => c.tent).length },
    { name: "RV Sites", count: normalizedData.filter(c => c.rv).length },
    { name: "Electric Hookups", count: normalizedData.filter(c => c.electric).length },
    { name: "Waterfront", count: normalizedData.filter(c => c.waterfront).length },
  ], [normalizedData]);

  const typeDistribution = useMemo(() => {
    const t: Record<string, number> = {};
    normalizedData.forEach(cg => { t[cg.type] = (t[cg.type] || 0) + 1; });
    return Object.entries(t).map(([type, count]) => ({
      name: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), value: count,
    }));
  }, [normalizedData]);

  /* ── Elevation distribution (bucketed) ── */
  const elevationBuckets = useMemo(() => {
    const buckets: Record<string, number> = {};
    normalizedData.forEach(cg => {
      const bucket = `${Math.floor(cg.elevation_ft / 500) * 500}-${Math.floor(cg.elevation_ft / 500) * 500 + 499}`;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });
    return Object.entries(buckets)
      .map(([range, count]) => ({ range: range + " ft", count }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));
  }, [normalizedData]);

  /* ── Elevation vs Signal scatter ── */
  const elevSignalScatter = useMemo(() =>
    normalizedData.map(cg => ({
      elevation: cg.elevation_ft,
      signal: cg.signal_confidence,
      name: cg.name,
      dist: cg.distance_to_nearest_town_mi,
    })),
  [normalizedData]);

  /* ── Top lakes ── */
  const topLakes = useMemo(() => {
    const m: Record<string, number> = {};
    normalizedData.forEach(cg => { m[cg.nearest_lake] = (m[cg.nearest_lake] || 0) + 1; });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([lake, count]) => ({ lake, count }));
  }, [normalizedData]);

  /* ── Distance to town distribution ── */
  const distBuckets = useMemo(() => {
    const b: Record<string, number> = { "0-5 mi": 0, "5-10 mi": 0, "10-20 mi": 0, "20-30 mi": 0, "30+ mi": 0 };
    normalizedData.forEach(cg => {
      const d = cg.distance_to_nearest_town_mi;
      if (d < 5) b["0-5 mi"]++;
      else if (d < 10) b["5-10 mi"]++;
      else if (d < 20) b["10-20 mi"]++;
      else if (d < 30) b["20-30 mi"]++;
      else b["30+ mi"]++;
    });
    return Object.entries(b).map(([range, count]) => ({ range, count }));
  }, [normalizedData]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const avgElev = Math.round(normalizedData.reduce((s, c) => s + c.elevation_ft, 0) / normalizedData.length);
  const avgDist = (normalizedData.reduce((s, c) => s + c.distance_to_nearest_town_mi, 0) / normalizedData.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* ───── Header ───── */}
      <header className="border-b border-blue-100 bg-white shadow-sm">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <Signal className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">SignalCamping</h1>
              <p className="text-lg text-gray-500">Great Lakes Campground Signal Research</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            Comprehensive dataset of <span className="font-semibold text-blue-700">{normalizedData.length.toLocaleString()} campgrounds</span> across
            Michigan, Ohio, Pennsylvania, West Virginia, and Wisconsin — with Verizon, AT&T, and T-Mobile signal analysis,
            elevation data, nearest lake mapping, and distance-to-town metrics.
          </p>
        </div>
      </header>

      {/* ───── Search & Filter ───── */}
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <Input
            placeholder="Search campgrounds, cities, or lakes..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            className="h-10"
          />
          <select
            value={selectedState || ""}
            onChange={(e) => { setSelectedState(e.target.value || null); setPage(0); }}
            className="h-10 px-3 border border-gray-300 rounded-md bg-white"
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{STATE_NAMES[s] || s} ({s})</option>)}
          </select>
        </div>
      </div>

      {/* ───── Tabs ───── */}
      <div className="container pb-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* ════════ OVERVIEW ════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Campgrounds", value: normalizedData.length.toLocaleString(), color: "text-blue-600", sub: "Great Lakes Region" },
                { label: "States", value: states.length, color: "text-green-600", sub: "MI OH PA WI WV" },
                { label: "Avg Signal", value: (normalizedData.reduce((s, c) => s + c.signal_confidence, 0) / normalizedData.length).toFixed(1), color: "text-amber-600", sub: "Out of 5" },
                { label: "Avg Elevation", value: avgElev.toLocaleString() + " ft", color: "text-violet-600", sub: "Above sea level" },
                { label: "Avg Dist to Town", value: avgDist + " mi", color: "text-rose-600", sub: "Nearest town" },
                { label: "Waterfront", value: normalizedData.filter(c => c.waterfront).length, color: "text-cyan-600", sub: `${((normalizedData.filter(c => c.waterfront).length / normalizedData.length) * 100).toFixed(0)}% of total` },
              ].map(kpi => (
                <Card key={kpi.label}>
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</CardTitle></CardHeader>
                  <CardContent><div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div><p className="text-xs text-gray-400 mt-1">{kpi.sub}</p></CardContent>
                </Card>
              ))}
            </div>

            {/* State bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Campgrounds by State</CardTitle>
                <CardDescription>Count, average signal score, and average elevation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stateStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="campgrounds" fill="#3b82f6" name="Campgrounds" />
                    <Bar yAxisId="right" dataKey="avgSignal" fill="#10b981" name="Avg Signal" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Type pie */}
            <Card>
              <CardHeader>
                <CardTitle>Campground Types</CardTitle>
                <CardDescription>Distribution across management types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={typeDistribution} cx="50%" cy="50%" labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`} outerRadius={90} dataKey="value">
                      {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════ COVERAGE ════════ */}
          <TabsContent value="coverage" className="space-y-6">
            {/* Carrier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["verizon", "att", "tmobile"] as const).map(carrier => (
                <Card key={carrier}>
                  <CardHeader><CardTitle className="text-lg">{carrier === "att" ? "AT&T" : carrier === "tmobile" ? "T-Mobile" : "Verizon"} Coverage</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {["Strong", "Moderate", "Weak", "No Signal"].map(sig => {
                      const count = carrierCoverage[carrier]?.[sig] || 0;
                      const pct = ((count / normalizedData.length) * 100).toFixed(1);
                      return (
                        <div key={sig} className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${signalColor(sig)} w-24 text-center`}>{sig}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${sig === "Strong" ? "bg-green-500" : sig === "Moderate" ? "bg-yellow-400" : sig === "Weak" ? "bg-orange-400" : "bg-red-400"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Signal confidence distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Signal Confidence Score Distribution</CardTitle>
                <CardDescription>Composite score (1-5) based on combined carrier data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={signalDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `${v} campgrounds`} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                  {signalDistribution.map(item => (
                    <div key={item.score} className="p-2 bg-gray-50 rounded">
                      <p className="font-semibold text-sm">{item.count}</p>
                      <p className="text-xs text-gray-500">{item.score}</p>
                      <p className="text-xs text-gray-400">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════ GEOGRAPHY (NEW) ════════ */}
          <TabsContent value="geography" className="space-y-6">
            {/* Elevation distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mountain className="w-5 h-5 text-violet-600" /> Elevation Distribution</CardTitle>
                <CardDescription>Number of campgrounds by elevation range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={elevationBuckets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" angle={-25} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `${v} campgrounds`} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Elevation vs Signal scatter */}
            <Card>
              <CardHeader>
                <CardTitle>Elevation vs. Signal Confidence</CardTitle>
                <CardDescription>How altitude affects cellular coverage (bubble size = distance to nearest town)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="elevation" name="Elevation (ft)" unit=" ft" type="number" />
                    <YAxis dataKey="signal" name="Signal Score" domain={[0, 6]} />
                    <ZAxis dataKey="dist" range={[20, 200]} name="Dist to Town (mi)" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value: number, name: string) => [
                        name === "Elevation (ft)" ? `${value.toLocaleString()} ft` :
                        name === "Signal Score" ? `${value}/5` :
                        `${value} mi`, name
                      ]} />
                    <Scatter data={elevSignalScatter} fill="#3b82f6" fillOpacity={0.4} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distance to town */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Navigation className="w-5 h-5 text-rose-600" /> Distance to Nearest Town</CardTitle>
                <CardDescription>How remote are the campgrounds?</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={distBuckets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `${v} campgrounds`} />
                    <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top lakes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Waves className="w-5 h-5 text-cyan-600" /> Top 15 Nearest Lakes</CardTitle>
                <CardDescription>Most frequently referenced lakes in the dataset</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topLakes} layout="vertical" margin={{ left: 160 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="lake" type="category" width={155} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => `${v} campgrounds`} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* State elevation comparison */}
            <Card>
              <CardHeader>
                <CardTitle>State Comparison: Elevation & Distance</CardTitle>
                <CardDescription>Average elevation and distance to nearest town by state</CardDescription>
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
                    <Bar yAxisId="left" dataKey="avgElevation" fill="#8b5cf6" name="Avg Elevation (ft)" />
                    <Bar yAxisId="right" dataKey="avgDistTown" fill="#f43f5e" name="Avg Dist to Town (mi)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════ AMENITIES ════════ */}
          <TabsContent value="amenities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Amenities Availability</CardTitle>
                <CardDescription>Percentage of campgrounds offering each amenity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={amenitiesStats} layout="vertical" margin={{ left: 160 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={155} />
                    <Tooltip formatter={(v: number) => `${v} campgrounds`} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {amenitiesStats.map(a => (
                    <div key={a.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {a.name === "Tent Camping" && <Tent className="w-5 h-5 text-green-600" />}
                      {a.name === "RV Sites" && <Truck className="w-5 h-5 text-blue-600" />}
                      {a.name === "Electric Hookups" && <Zap className="w-5 h-5 text-amber-600" />}
                      {a.name === "Waterfront" && <Waves className="w-5 h-5 text-cyan-600" />}
                      <div>
                        <p className="font-medium text-sm">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.count} / {normalizedData.length} ({((a.count / normalizedData.length) * 100).toFixed(0)}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════ DATA TABLE ════════ */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campground Dataset</CardTitle>
                <CardDescription>
                  Showing {Math.min(page * PAGE_SIZE + 1, filteredData.length)}-{Math.min((page + 1) * PAGE_SIZE, filteredData.length)} of {filteredData.length} campgrounds
                  {selectedState && <> in <span className="font-semibold">{STATE_NAMES[selectedState]}</span></>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 border-b sticky top-0">
                      <tr>
                        {[
                          { key: "name", label: "Name" },
                          { key: "city", label: "City, State" },
                          { key: "type", label: "Type" },
                          { key: "elevation_ft", label: "Elev (ft)" },
                          { key: "nearest_lake", label: "Nearest Lake" },
                          { key: "distance_to_nearest_town_mi", label: "Dist Town" },
                          { key: "verizon", label: "VZW" },
                          { key: "att", label: "ATT" },
                          { key: "tmobile", label: "TMO" },
                          { key: "signal_confidence", label: "Score" },
                        ].map(col => (
                          <th key={col.key}
                            className="p-2 font-semibold text-left cursor-pointer hover:bg-gray-200 transition select-none whitespace-nowrap"
                            onClick={() => toggleSort(col.key)}>
                            <span className="flex items-center gap-1">
                              {col.label}
                              {sortField === col.key && <ArrowUpDown className="w-3 h-3 text-blue-600" />}
                            </span>
                          </th>
                        ))}
                        <th className="p-2 font-semibold text-center">Amenities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.map((cg, idx) => (
                        <tr key={idx} className="border-b hover:bg-blue-50/40 transition">
                          <td className="p-2 font-medium text-blue-700 whitespace-nowrap">{cg.name}</td>
                          <td className="p-2 whitespace-nowrap">{cg.city}, {cg.state}</td>
                          <td className="p-2"><Badge variant="outline" className="text-xs">{cg.type.replace(/_/g, " ")}</Badge></td>
                          <td className="p-2 text-right tabular-nums">{cg.elevation_ft.toLocaleString()}</td>
                          <td className="p-2 text-xs whitespace-nowrap">{cg.nearest_lake}</td>
                          <td className="p-2 text-right tabular-nums">{cg.distance_to_nearest_town_mi} mi</td>
                          <td className="p-2"><span className={`text-xs px-1.5 py-0.5 rounded ${signalColor(cg.verizon)}`}>{cg.verizon}</span></td>
                          <td className="p-2"><span className={`text-xs px-1.5 py-0.5 rounded ${signalColor(cg.att)}`}>{cg.att}</span></td>
                          <td className="p-2"><span className={`text-xs px-1.5 py-0.5 rounded ${signalColor(cg.tmobile)}`}>{cg.tmobile}</span></td>
                          <td className="p-2 text-center"><Badge className="bg-blue-100 text-blue-800 text-xs">{cg.signal_confidence}★</Badge></td>
                          <td className="p-2">
                            <div className="flex gap-1 justify-center">
                              {cg.tent && <Tent className="w-3.5 h-3.5 text-green-600" />}
                              {cg.rv && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                              {cg.electric && <Zap className="w-3.5 h-3.5 text-amber-600" />}
                              {cg.waterfront && <Waves className="w-3.5 h-3.5 text-cyan-600" />}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Page {page + 1} of {totalPages} ({filteredData.length} results)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ───── Architecture Section ───── */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <MapPin className="w-5 h-5 text-blue-600" />, title: "Database Schema", desc: "7-table relational design with campgrounds, coverage, amenities, reviews, and geographic regions." },
              { icon: <Signal className="w-5 h-5 text-blue-600" />, title: "SEO Architecture", desc: "4-level programmatic page generation: state, regional, city, and individual campground pages." },
              { icon: <Wifi className="w-5 h-5 text-blue-600" />, title: "Filter System", desc: "Multi-criteria search by signal strength, amenities, elevation, distance, and campground type." },
            ].map(card => (
              <Card key={card.title}>
                <CardHeader><CardTitle className="flex items-center gap-2">{card.icon}{card.title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-gray-600">{card.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Signal className="w-5 h-5" />SignalCamping</h3>
              <p className="text-sm leading-relaxed">Find campgrounds with reliable cellular coverage across the Great Lakes region. {normalizedData.length.toLocaleString()} campgrounds and growing.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Dataset Fields</h4>
              <p className="text-sm leading-relaxed">Name, location, type, tent/RV/electric/waterfront, Verizon/AT&T/T-Mobile signal, confidence score, elevation, nearest lake, distance to town, reservation & website links.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">States Covered</h4>
              <p className="text-sm">Michigan &bull; Ohio &bull; Pennsylvania &bull; West Virginia &bull; Wisconsin</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
            &copy; 2026 SignalCamping. Research dataset and system architecture for campground discovery.
          </div>
        </div>
      </footer>
    </div>
  );
}
