/**
 * TopCampgrounds — Browse all campgrounds with search and state filter.
 * Uses OSM data (3127 campgrounds). No signal fields.
 */
import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Signal, MapPin, Search, ChevronRight, CheckCircle2,
  Tent, Truck, Zap, Waves, ArrowUpDown
} from "lucide-react";
import top100Data from "@/data/top100_seo.json";

const campgrounds = (top100Data as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || (cg.tent_sites as any) === "True",
  rv_sites: cg.rv_sites === true || (cg.rv_sites as any) === "True",
  electric_hookups: cg.electric_hookups === true || (cg.electric_hookups as any) === "True",
  waterfront: cg.waterfront === true || (cg.waterfront as any) === "True",
}));

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin", WV: "West Virginia",
};

export default function TopCampgrounds() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"campground_name" | "state">("campground_name");

  useEffect(() => {
    document.title = "All Campgrounds | SignalCamping";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Browse ${campgrounds.length.toLocaleString()} campgrounds across Michigan, Ohio, Pennsylvania, West Virginia, and Wisconsin. Real locations from OpenStreetMap.`;
  }, []);

  const filtered = useMemo(() => {
    let data = [...campgrounds];
    if (stateFilter) data = data.filter(c => c.state === stateFilter);
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(c =>
        c.campground_name.toLowerCase().includes(term) ||
        (c.city || "").toLowerCase().includes(term) ||
        (c.operator || "").toLowerCase().includes(term)
      );
    }
    data.sort((a: any, b: any) => {
      if (sortBy === "campground_name") return a.campground_name.localeCompare(b.campground_name);
      return a.state.localeCompare(b.state) || a.campground_name.localeCompare(b.campground_name);
    });
    return data;
  }, [search, stateFilter, sortBy]);

  const stateCounts = useMemo(() => {
    const c: Record<string, number> = {};
    campgrounds.forEach((cg: any) => { c[cg.state] = (c[cg.state] || 0) + 1; });
    return c;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <Signal className="w-5 h-5 text-green-700" />
            <span className="font-bold text-lg tracking-tight text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Signal<span className="text-green-700">Camping</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/lists" className="text-gray-600 hover:text-green-700 transition hidden sm:block">Lists</Link>
            <Link href="/" className="text-gray-600 hover:text-green-700 transition">Map</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-800 to-emerald-900 text-white py-10">
        <div className="container">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            All Campgrounds
          </h1>
          <p className="text-green-100 max-w-2xl">
            Browse {campgrounds.length.toLocaleString()} campground locations across the Great Lakes region. Data sourced from OpenStreetMap.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.entries(STATE_NAMES).map(([code, name]) => (
              <Badge key={code} className="bg-white/10 text-white border-white/20 text-xs">
                {name}: {stateCounts[code] || 0}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container py-6">
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search campgrounds..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button variant={!stateFilter ? "default" : "outline"} size="sm" className={`text-xs ${!stateFilter ? "bg-green-700 hover:bg-green-800" : ""}`}
              onClick={() => setStateFilter(null)}>All</Button>
            {Object.entries(STATE_NAMES).map(([code]) => (
              <Button key={code} variant={stateFilter === code ? "default" : "outline"} size="sm"
                className={`text-xs ${stateFilter === code ? "bg-green-700 hover:bg-green-800" : ""}`}
                onClick={() => setStateFilter(stateFilter === code ? null : code)}>
                {code}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSortBy(s => s === "campground_name" ? "state" : "campground_name")}>
            <ArrowUpDown className="w-3 h-3 mr-1" /> Sort by {sortBy === "campground_name" ? "Name" : "State"}
          </Button>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length.toLocaleString()} campgrounds</p>

        {/* Results */}
        <div className="space-y-2">
          {filtered.map((cg: any, i: number) => {
            const slug = cg.slug || cg.campground_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <Link key={slug + i} href={`/campground/${slug}`}>
                <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-bold text-sm text-gray-900 truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {cg.campground_name}
                          </h2>
                          {cg.is_verified && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {cg.city ? `${cg.city}, ` : ""}{cg.state_full || STATE_NAMES[cg.state] || cg.state}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{(cg.campground_type || "campground").replace(/_/g, " ")}</Badge>
                          {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Tent className="w-3 h-3" />Tent</Badge>}
                          {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Truck className="w-3 h-3" />RV</Badge>}
                          {cg.electric_hookups && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Zap className="w-3 h-3" />Electric</Badge>}
                          {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Waves className="w-3 h-3" />Waterfront</Badge>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Back to Map CTA */}
      <section className="container pb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-green-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Explore All {campgrounds.length.toLocaleString()} Campgrounds
              </h3>
              <p className="text-sm text-green-600 mt-1">
                Use our interactive map to discover campgrounds with the filters that matter to you.
              </p>
            </div>
            <Link href="/">
              <Button className="bg-green-700 hover:bg-green-800 text-white">
                Open Discovery Map <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
        <div className="container text-center">
          <p className="text-sm">&copy; 2026 SignalCamping &mdash; Campground discovery powered by OpenStreetMap data.</p>
        </div>
      </footer>
    </div>
  );
}
