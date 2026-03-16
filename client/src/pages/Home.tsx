/**
 * Home — SignalCamping MVP Homepage
 *
 * Design: Outdoor-themed, polished landing page with hero, map preview,
 * featured lists, route search, and internal links.
 * Style: Space Grotesk headings, DM Sans body, green/earth palette.
 *
 * Data: OSM base inventory (3114 campgrounds, 4 states) + verified MVP subset (485).
 */
import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Signal, Map as MapIcon, List, BarChart3, Download, Search,
  ChevronLeft, ChevronRight, Menu, X, ArrowRight, Waves, Tent,
  Zap, MapPin, Trophy, Navigation, Star, Trees,
  CheckCircle2, Car
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

import CampgroundMap from "@/components/CampgroundMap";
import FilterPanel, { type Filters, DEFAULT_FILTERS, applyFilters } from "@/components/FilterPanel";
import CampgroundList from "@/components/CampgroundList";
import CampgroundDetail from "@/components/CampgroundDetail";
import StatsPanel from "@/components/StatsPanel";

import rawData from "@/data/campgrounds.json";
import listsData from "@/data/shareable_lists.json";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440718528/7Ys6UrtVjk2wmoMCZVS2Yg/hero-camping-signal-EzwZHRaoseAjvWPQqMZuz7.webp";
const MAP_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440718528/7Ys6UrtVjk2wmoMCZVS2Yg/hero-map-discovery-Piy6xvKVyz6pBgBrequccc.webp";
const ROUTE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440718528/7Ys6UrtVjk2wmoMCZVS2Yg/hero-route-trip-fFHyNfqxYJZ2WSdcvmnYF7.webp";

/* ──────────────────────────── Data normalisation ──────────────────────────── */
const allCampgrounds = (rawData as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || cg.tent_sites === "True",
  rv_sites: cg.rv_sites === true || cg.rv_sites === "True",
  electric_hookups: cg.electric_hookups === true || cg.electric_hookups === "True",
  waterfront: cg.waterfront === true || cg.waterfront === "True",
}));

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

/* ── Compute filter metadata (static, computed once at module load) ── */
const stateOptions = (() => {
  const counts: Record<string, number> = {};
  allCampgrounds.forEach(c => { counts[c.state] = (counts[c.state] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, name: STATE_NAMES[code] || code, count }));
})();

const typeOptions = (() => {
  const counts: Record<string, number> = {};
  allCampgrounds.forEach(c => { counts[c.campground_type] = (counts[c.campground_type] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, label: value.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), count }));
})();

/* ──────────────────────────── Main Component ──────────────────────────── */
export default function Home() {
  const [view, setView] = useState<"landing" | "explorer">("landing");
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [selectedCampground, setSelectedCampground] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const filtered = useMemo(() => applyFilters(allCampgrounds, filters), [filters]);

  const handleSearch = useCallback((term: string) => {
    setFilters(f => ({ ...f, searchTerm: term }));
  }, []);

  const downloadCSV = useCallback(() => {
    const headers = [
      "campground_name", "city", "state", "latitude", "longitude", "campground_type",
      "tent_sites", "rv_sites", "electric_hookups", "waterfront",
      "website", "operator", "is_verified"
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

  /* Analytics data */
  const stateStats = useMemo(() => {
    const m: Record<string, { count: number; verified: number }> = {};
    filtered.forEach(cg => {
      if (!m[cg.state]) m[cg.state] = { count: 0, verified: 0 };
      m[cg.state].count++;
      if (cg.is_verified) m[cg.state].verified++;
    });
    return Object.entries(m).map(([state, d]) => ({
      state, campgrounds: d.count, verified: d.verified,
    }));
  }, [filtered]);

  const typeDistribution = useMemo(() => {
    const t: Record<string, number> = {};
    filtered.forEach(cg => { t[cg.campground_type] = (t[cg.campground_type] || 0) + 1; });
    return Object.entries(t).map(([type, count]) => ({
      name: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), value: count,
    }));
  }, [filtered]);

  const COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed"];

  /* Detail view */
  if (selectedCampground) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <Header onExplore={() => setView("explorer")} />
        <div className="container py-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedCampground(null)} className="mb-4 text-gray-500">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to results
          </Button>
          <CampgroundDetail campground={selectedCampground} onClose={() => setSelectedCampground(null)} />
        </div>
      </div>
    );
  }

  /* Explorer view */
  if (view === "explorer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <Header onExplore={() => setView("explorer")} />
        <div className="lg:hidden container pt-4">
          <Button variant="outline" size="sm" onClick={() => setMobileSidebar(!mobileSidebar)}>
            {mobileSidebar ? <X className="w-4 h-4 mr-1" /> : <Menu className="w-4 h-4 mr-1" />}
            {mobileSidebar ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        <div className="container py-4">
          <div className="flex gap-6">
            <aside className={`${sidebarOpen ? "w-72 min-w-[288px]" : "w-0 min-w-0 overflow-hidden"} hidden lg:block transition-all duration-300 shrink-0`}>
              <div className="sticky top-16">
                <FilterPanel filters={filters} onChange={setFilters} states={stateOptions} types={typeOptions} />
              </div>
            </aside>
            {mobileSidebar && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebar(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4 shadow-xl">
                  <FilterPanel filters={filters} onChange={setFilters} states={stateOptions} types={typeOptions} />
                </div>
              </div>
            )}
            <main className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600">
                    {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search campgrounds, cities, operators..." value={filters.searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10 h-10" />
                </div>
                <Button variant="outline" size="sm" onClick={downloadCSV} className="shrink-0">
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
              </div>
              <StatsPanel campgrounds={filtered} totalCount={allCampgrounds.length} />
              <Tabs defaultValue="map" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="map" className="flex items-center gap-1.5"><MapIcon className="w-4 h-4" /> Map</TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-1.5"><List className="w-4 h-4" /> List</TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="map" className="mt-4">
                  <CampgroundMap campgrounds={filtered} onCampgroundClick={setSelectedCampground} />
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                  <CampgroundList campgrounds={filtered} onSelect={setSelectedCampground} />
                </TabsContent>
                <TabsContent value="analytics" className="mt-4 space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Campgrounds by State</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stateStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="state" /><YAxis yAxisId="left" /><YAxis yAxisId="right" orientation="right" />
                          <Tooltip /><Legend />
                          <Bar yAxisId="left" dataKey="campgrounds" fill="#16a34a" name="Total" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="verified" fill="#2563eb" name="Verified" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">Campground Types</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={typeDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                            {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ──────────────────────────── Landing Page ──────────────────────────── */
  const featuredLists = (listsData as any[]).slice(0, 6);

  return (
    <div className="min-h-screen">
      <Header onExplore={() => setView("explorer")} />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Campground discovery" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        </div>
        <div className="container relative z-10 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <Badge className="bg-green-600/90 text-white border-green-500 mb-4 text-xs">
              {allCampgrounds.length.toLocaleString()} Campgrounds &middot; 4 States &middot; OpenStreetMap Data
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Find campgrounds where your phone works{" "}
              <span className="text-green-400">&mdash; or where it doesn&rsquo;t.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
              Explore {allCampgrounds.length.toLocaleString()}+ campgrounds by cell signal, carrier coverage, and remote-work readiness.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg" onClick={() => setView("explorer")}>
                <MapIcon className="w-5 h-5 mr-2" /> Explore the Map
              </Button>
              <Link href="/top-campgrounds">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Trophy className="w-5 h-5 mr-2" /> Browse All Campgrounds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-gradient-to-r from-green-800 to-emerald-900 py-6">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: allCampgrounds.length.toLocaleString(), label: "Campgrounds", icon: Tent },
              { value: "4", label: "States Covered", icon: MapPin },
              { value: allCampgrounds.filter(c => c.is_verified).length.toString(), label: "Verified Sites", icon: CheckCircle2 },
              { value: (listsData as any[]).length.toString(), label: "Curated Lists", icon: Star },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center">
                <stat.icon className="w-5 h-5 text-green-300 mb-1" />
                <div className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{stat.value}</div>
                <div className="text-xs text-green-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map Preview ── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="bg-green-100 text-green-800 border-green-200 mb-3">Interactive Map</Badge>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Explore {allCampgrounds.length.toLocaleString()} Campgrounds on the Map
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Whether you need reliable signal for remote work or want to find the most off-grid spot to disconnect, our interactive map shows every campground across the Great Lakes region. Filter by state, type, carrier coverage, and more.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { color: "bg-green-500", label: "Verified Campgrounds", desc: "Confirmed against official state park / DNR sources" },
                  { color: "bg-blue-500", label: "OSM Campgrounds", desc: "Real locations from OpenStreetMap contributors" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${item.color} shrink-0`} />
                    <div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="bg-green-700 hover:bg-green-800" onClick={() => setView("explorer")}>
                Open Map Explorer <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl cursor-pointer group" onClick={() => setView("explorer")}>
              <img src={MAP_IMG} alt="Great Lakes campground map" className="w-full h-auto group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg flex items-center gap-2 font-semibold text-green-800">
                  <MapIcon className="w-5 h-5" /> Click to Explore
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Lists ── */}
      <section className="py-16 bg-gradient-to-b from-stone-50 to-white">
        <div className="container">
          <div className="text-center mb-10">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 mb-3">Curated Lists</Badge>
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Verified Campground Lists
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Curated lists of verified campgrounds across the Great Lakes. Perfect for planning your next trip.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredLists.map((list: any) => (
              <Link key={list.slug || list.id} href={`/list/${list.slug || list.id}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-sm mb-2 group-hover:text-green-700 transition-colors leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      {list.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{list.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{list.count || list.campground_slugs?.length || list.slugs?.length || 0} campgrounds</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/lists">
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                View All Lists <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Route Discovery ── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative rounded-xl overflow-hidden shadow-2xl order-2 lg:order-1">
              <img src={ROUTE_IMG} alt="Road trip through fall foliage" className="w-full h-auto" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="text-white text-sm font-medium">Popular: Cleveland to Traverse City</div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 mb-3">Route Discovery</Badge>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Find Campgrounds Along Your Road Trip
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Planning a road trip? Our route finder shows campgrounds along your travel corridor across the Great Lakes region.
              </p>
              <div className="space-y-2 mb-6">
                {["Cleveland to Traverse City", "Detroit to Mackinaw City", "Columbus to Hocking Hills", "Pittsburgh to Erie"].map(route => (
                  <div key={route} className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-orange-600" />
                    <span>{route}</span>
                  </div>
                ))}
              </div>
              <Link href="/route-finder">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Navigation className="w-4 h-4 mr-2" /> Plan Your Route
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Data Sources ── */}
      <section className="py-16 bg-gradient-to-b from-stone-50 to-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              How Our Data Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We combine authoritative data sources to provide the most accurate campground directory for the Great Lakes region.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: "OpenStreetMap", desc: `Our base inventory of ${allCampgrounds.length.toLocaleString()} campgrounds comes from OSM, the world's largest open geographic database, maintained by a global community of contributors.`, step: "1" },
              { icon: CheckCircle2, title: "Official Verification", desc: "We verify campgrounds against state DNR websites, Recreation.gov, NPS, and US Forest Service records to confirm names, locations, and details.", step: "2" },
              { icon: Star, title: "Curated Lists", desc: "Verified campgrounds are organized into curated lists by state, amenity type, and use case to help you find the perfect campsite.", step: "3" },
            ].map(item => (
              <Card key={item.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-green-700" />
                  </div>
                  <div className="text-xs text-green-600 font-bold mb-1">Step {item.step}</div>
                  <h3 className="font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by State ── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Browse by State
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {[
              { state: "Michigan", code: "mi", stateCode: "MI" },
              { state: "Ohio", code: "oh", stateCode: "OH" },
              { state: "Pennsylvania", code: "pa", stateCode: "PA" },
              { state: "Wisconsin", code: "wi", stateCode: "WI" },

            ].map(s => (
              <Link key={s.code} href={`/campgrounds/${s.code}`}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer text-center">
                  <CardContent className="p-5">
                    <Trees className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-bold text-sm mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{s.state}</h3>
                    <p className="text-xs text-muted-foreground">{allCampgrounds.filter(c => c.state === s.stateCode).length} campgrounds</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Header ── */
function Header({ onExplore }: { onExplore?: () => void }) {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
                <Signal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</h1>
                <p className="text-[10px] text-muted-foreground leading-none">Where your phone works &mdash; or doesn&rsquo;t</p>
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex" onClick={onExplore}>
              <MapIcon className="w-3.5 h-3.5 mr-1" /> Map
            </Button>
            <Link href="/lists">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                <Trophy className="w-3.5 h-3.5 mr-1" /> Lists
              </Button>
            </Link>
            <Link href="/route-finder">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                <Navigation className="w-3.5 h-3.5 mr-1" /> Routes
              </Button>
            </Link>
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden md:inline-flex">
                All Campgrounds
              </Button>
            </Link>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex border-green-200 text-green-700 bg-green-50">
              {(rawData as any[]).length.toLocaleString()} Sites
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                <Signal className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</h3>
            </div>
            <p className="text-sm leading-relaxed">SignalCamping helps you discover campgrounds where you can stay connected in nature &mdash; and places where you can truly unplug. Data sourced from OpenStreetMap and verified against official state records.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Browse by State</h4>
            <ul className="space-y-1.5 text-sm">
              {["mi", "oh", "pa", "wi"].map(s => (
                <li key={s}><Link href={`/campgrounds/${s}`} className="hover:text-green-400 transition">{s.toUpperCase()} Campgrounds</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Features</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/lists" className="hover:text-green-400 transition">Curated Lists</Link></li>
              <li><Link href="/route-finder" className="hover:text-green-400 transition">Route Finder</Link></li>
              <li><Link href="/top-campgrounds" className="hover:text-green-400 transition">All Campgrounds</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Data Sources</h4>
            <ul className="space-y-1.5 text-sm">
              <li className="text-gray-500">OpenStreetMap</li>
              <li className="text-gray-500">Michigan DNR</li>
              <li className="text-gray-500">Ohio DNR</li>
              <li className="text-gray-500">Recreation.gov</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
          &copy; 2026 SignalCamping &mdash; Find campgrounds where your phone works, or where it doesn&rsquo;t.
        </div>
      </div>
    </footer>
  );
}
