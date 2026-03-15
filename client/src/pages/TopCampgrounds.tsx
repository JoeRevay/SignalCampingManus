/**
 * TopCampgrounds — SEO listing page for the top 100 campgrounds.
 *
 * Targets queries like:
 *   "best campgrounds with cell service great lakes"
 *   "campgrounds with phone signal michigan ohio"
 *   "top camping spots with cell coverage"
 */
import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Signal, MapPin, Star, Search, ChevronRight,
  Tent, Truck, Zap, Waves, Mountain, Trees, ArrowUpDown, Trophy
} from "lucide-react";

import top100Data from "@/data/top100_seo.json";

interface Campground {
  campground_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  campground_type: string;
  tent_sites: boolean;
  rv_sites: boolean;
  electric_hookups: boolean;
  waterfront: boolean;
  verizon_signal: string;
  att_signal: string;
  tmobile_signal: string;
  signal_confidence_score: number;
  nearest_lake_name: string;
  distance_to_lake_miles: number;
  nearest_town: string;
  distance_to_town_miles: number;
  elevation_ft: number;
  forest_cover_percent: number;
  seo_score: number;
  slug: string;
}

const campgrounds = (top100Data as Campground[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || (cg.tent_sites as any) === "True",
  rv_sites: cg.rv_sites === true || (cg.rv_sites as any) === "True",
  electric_hookups: cg.electric_hookups === true || (cg.electric_hookups as any) === "True",
  waterfront: cg.waterfront === true || (cg.waterfront as any) === "True",
}));

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin", WV: "West Virginia",
};

const signalBadge = (s: string) => {
  const c = s === "Strong" ? "bg-green-100 text-green-800" :
    s === "Moderate" ? "bg-yellow-100 text-yellow-800" :
    s === "Weak" ? "bg-orange-100 text-orange-800" :
    "bg-red-100 text-red-800";
  return <span className={`text-xs px-1.5 py-0.5 rounded ${c}`}>{s}</span>;
};

export default function TopCampgrounds() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"seo_score" | "signal_confidence_score" | "campground_name">("seo_score");

  useEffect(() => {
    document.title = "Top 100 Campgrounds with Cell Service | SignalCamping";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "Discover the top 100 campgrounds with reliable cell service in Michigan, Ohio, Pennsylvania, West Virginia, and Wisconsin. Ranked by signal strength, amenities, and SEO potential.";
  }, []);

  const filtered = useMemo(() => {
    let result = [...campgrounds];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(cg =>
        cg.campground_name.toLowerCase().includes(term) ||
        cg.city.toLowerCase().includes(term) ||
        cg.nearest_lake_name.toLowerCase().includes(term)
      );
    }
    if (stateFilter) {
      result = result.filter(cg => cg.state === stateFilter);
    }
    result.sort((a, b) => {
      if (sortBy === "campground_name") return a.campground_name.localeCompare(b.campground_name);
      return (b[sortBy] as number) - (a[sortBy] as number);
    });
    return result;
  }, [search, stateFilter, sortBy]);

  const stateBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    campgrounds.forEach(cg => { counts[cg.state] = (counts[cg.state] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
                  <Signal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h1>
                  <p className="text-xs text-muted-foreground">Great Lakes Campground Signal Discovery</p>
                </div>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700 hover:bg-green-50">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> Discovery Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">Top 100 Campgrounds</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container py-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Top 100 Campgrounds with Cell Service
          </h1>
        </div>
        <p className="text-gray-500 max-w-3xl mb-6">
          Our curated ranking of the best campgrounds in the Great Lakes region where your phone actually works.
          Scored on signal strength, amenities, location, and search relevance.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search campgrounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              className={`px-2.5 py-1 rounded-md text-xs border transition ${
                !stateFilter ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
              }`}
              onClick={() => setStateFilter(null)}
            >
              All States
            </button>
            {stateBreakdown.map(([state, count]) => (
              <button key={state}
                className={`px-2.5 py-1 rounded-md text-xs border transition ${
                  stateFilter === state ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                }`}
                onClick={() => setStateFilter(stateFilter === state ? null : state)}
              >
                {STATE_NAMES[state]} ({count})
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {([
              { key: "seo_score" as const, label: "SEO Score" },
              { key: "signal_confidence_score" as const, label: "Signal" },
              { key: "campground_name" as const, label: "Name" },
            ]).map(s => (
              <button key={s.key}
                className={`px-2.5 py-1 rounded-md text-xs border transition flex items-center gap-1 ${
                  sortBy === s.key ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSortBy(s.key)}
              >
                <ArrowUpDown className="w-3 h-3" /> {s.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">{filtered.length} campgrounds</p>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <div className="space-y-3">
          {filtered.map((cg, idx) => {
            const globalRank = campgrounds.findIndex(c => c.slug === cg.slug) + 1;
            const state = STATE_NAMES[cg.state] || cg.state;
            return (
              <Link key={cg.slug} href={`/campground/${cg.slug}`}>
                <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                        globalRank <= 3 ? "bg-amber-100 text-amber-700" :
                        globalRank <= 10 ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        #{globalRank}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                              {cg.campground_name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {cg.city}, {state}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-gray-400">SEO Score</p>
                              <p className="font-bold text-green-700">{cg.seo_score}</p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < cg.signal_confidence_score ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <Badge variant="outline" className="text-xs">{cg.campground_type.replace(/_/g, " ")}</Badge>
                          <span className="text-xs text-gray-400">VZW: {signalBadge(cg.verizon_signal)}</span>
                          <span className="text-xs text-gray-400">ATT: {signalBadge(cg.att_signal)}</span>
                          <span className="text-xs text-gray-400">TMO: {signalBadge(cg.tmobile_signal)}</span>
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            <Mountain className="w-3 h-3 inline mr-0.5" />{cg.elevation_ft.toLocaleString()} ft
                          </span>
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            <Trees className="w-3 h-3 inline mr-0.5" />{cg.forest_cover_percent}% forest
                          </span>
                        </div>

                        {/* Amenity icons */}
                        <div className="flex gap-1.5 mt-2">
                          {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Tent className="w-3 h-3" />Tent</Badge>}
                          {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Truck className="w-3 h-3" />RV</Badge>}
                          {cg.electric_hookups && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Zap className="w-3 h-3" />Electric</Badge>}
                          {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Waves className="w-3 h-3" />Waterfront</Badge>}
                        </div>
                      </div>
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
              <h3 className="font-bold text-green-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Explore All 1,000 Campgrounds
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
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <Signal className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h3>
              </div>
              <p className="text-sm leading-relaxed">Find campgrounds where your phone works. Signal data for 1,000+ campgrounds across the Great Lakes region.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Top States</h4>
              <ul className="space-y-1.5 text-sm">
                {Object.entries(STATE_NAMES).map(([code, name]) => (
                  <li key={code}>
                    <Link href={`/campgrounds/${code.toLowerCase()}`} className="hover:text-green-400 transition">
                      {name} Campgrounds
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/" className="hover:text-green-400 transition">Discovery Map</Link></li>
                <li><Link href="/top-campgrounds" className="hover:text-green-400 transition">Top 100 Campgrounds</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
            &copy; 2026 SignalCamping &mdash; Campground discovery with cellular signal data.
          </div>
        </div>
      </footer>
    </div>
  );
}
