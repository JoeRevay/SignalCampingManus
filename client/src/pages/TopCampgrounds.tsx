/**
 * TopCampgrounds — SEO Hub Page: "Campgrounds with Cell Service"
 *
 * Structured as a hub page with:
 * 1. Strong intro paragraph explaining SignalCamping's purpose
 * 2. Top 25 campgrounds by signal_score with blurbs
 * 3. Browse by Region (links to state + UP pages)
 * 4. Browse by Carrier (Verizon + future carrier pages)
 * 5. Browse by Use Case (remote work, off-grid)
 * 6. Full browseable directory with search/filter/pagination
 *
 * Uses existing campgrounds.json data — no modifications.
 */
import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Signal, MapPin, Search, ChevronRight, CheckCircle2,
  Tent, Truck, Zap, Waves, ArrowUpDown, ChevronLeft,
  ChevronsLeft, ChevronsRight, Mountain, Laptop, WifiOff,
  Map as MapIcon, Trees, Radio, Globe, ArrowRight
} from "lucide-react";
import top100Data from "@/data/campgrounds.json";
import { getCarrierLikelihood, LIKELIHOOD_STYLES, type CarrierLikelihood } from "@/lib/carrierLikelihood";
import { generateBlurb } from "@/lib/campgroundBlurb";

const PER_PAGE = 50;

const campgrounds = (top100Data as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || (cg.tent_sites as any) === "True",
  rv_sites: cg.rv_sites === true || (cg.rv_sites as any) === "True",
  electric_hookups: cg.electric_hookups === true || (cg.electric_hookups as any) === "True",
  waterfront: cg.waterfront === true || (cg.waterfront as any) === "True",
}));

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

const STATE_CODES: Record<string, string> = {
  MI: "mi", OH: "oh", PA: "pa", WI: "wi",
};

/* ── Top 25 by signal score (deduplicated by name) ── */
const top25 = (() => {
  const seen = new Set<string>();
  return [...campgrounds]
    .sort((a, b) => (b.signal_score ?? 0) - (a.signal_score ?? 0))
    .filter(cg => {
      if (seen.has(cg.campground_name)) return false;
      seen.add(cg.campground_name);
      return true;
    })
    .slice(0, 25);
})();

/* ── Carrier likelihood badge ── */
function LikelihoodBadge({ level, carrier }: { level: CarrierLikelihood; carrier: string }) {
  const style = LIKELIHOOD_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bgClass} ${style.textClass} border ${style.borderClass}`}>
      {carrier} <span className="font-bold">{style.label}</span>
    </span>
  );
}

export default function TopCampgrounds() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"campground_name" | "state">("campground_name");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Campgrounds with Cell Service | SignalCamping";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Find ${campgrounds.length.toLocaleString()} campgrounds with cell service across Michigan, Ohio, Pennsylvania, and Wisconsin. Ranked by signal score with carrier coverage for Verizon, AT&T, and T-Mobile.`;
  }, []);

  useEffect(() => { setPage(1); }, [search, stateFilter, verifiedOnly, sortBy]);

  const filtered = useMemo(() => {
    let data = [...campgrounds];
    if (stateFilter) data = data.filter(c => c.state === stateFilter);
    if (verifiedOnly) data = data.filter(c => c.is_verified);
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(c =>
        c.campground_name.toLowerCase().includes(term) ||
        (c.city || "").toLowerCase().includes(term) ||
        (c.campground_type || "").toLowerCase().includes(term) ||
        (c.operator || "").toLowerCase().includes(term)
      );
    }
    data.sort((a: any, b: any) => {
      if (sortBy === "campground_name") return a.campground_name.localeCompare(b.campground_name);
      return a.state.localeCompare(b.state) || a.campground_name.localeCompare(b.campground_name);
    });
    return data;
  }, [search, stateFilter, verifiedOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PER_PAGE;
  const pageEnd = pageStart + PER_PAGE;
  const pageData = filtered.slice(pageStart, pageEnd);

  const stateCounts = useMemo(() => {
    const c: Record<string, number> = {};
    campgrounds.forEach((cg: any) => { c[cg.state] = (c[cg.state] || 0) + 1; });
    return c;
  }, []);

  const verifiedCount = useMemo(() => campgrounds.filter(c => c.is_verified).length, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    scrollToTop();
  }, [scrollToTop]);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

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
            <Link href="/route-finder" className="text-gray-600 hover:text-green-700 transition hidden sm:block">Routes</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-800 to-emerald-900 text-white py-12">
        <div className="container">
          <Badge className="bg-white/10 text-green-200 border-green-500/30 mb-3 text-xs">
            {campgrounds.length.toLocaleString()} Campgrounds &middot; 4 States &middot; Signal Scored
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Campgrounds with Cell Service
          </h1>
          <p className="text-green-100 max-w-3xl text-base sm:text-lg leading-relaxed">
            Find campgrounds where your phone works across the Great Lakes region.
            {" "}<span className="text-green-300 font-medium">{verifiedCount} verified</span> against official records.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {Object.entries(STATE_NAMES).map(([code, name]) => (
              <Badge key={code} className="bg-white/10 text-white border-white/20 text-xs">
                {name}: {stateCounts[code] || 0}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO Intro Section ── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="container max-w-4xl">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              <strong>SignalCamping</strong> helps outdoor enthusiasts find campgrounds with reliable cell service across Michigan, Ohio, Pennsylvania, and Wisconsin. Whether you need to stay connected for remote work, safety, or simply to share your adventure, knowing which campgrounds have strong cellular coverage can make or break a trip.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              We analyzed {campgrounds.length.toLocaleString()} campgrounds using modeled signal scores derived from publicly available tower proximity data, carrier coverage maps, and geographic infrastructure indicators. Each campground is scored on a 0&ndash;100 scale and classified by carrier likelihood for Verizon, AT&T, and T-Mobile. Our data comes from OpenStreetMap and is verified against official state park, DNR, and federal recreation sources where possible.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              This page serves as a central hub for all signal-related campground research. Browse the top-ranked campgrounds below, explore by region or carrier, or search the full directory to find the right campground for your connectivity needs.
            </p>
          </div>
        </div>
      </section>

      {/* ── Top 25 Campgrounds with Cell Service ── */}
      <section className="py-10 bg-gradient-to-b from-stone-50 to-white">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Signal className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Top 25 Campgrounds with Cell Service
              </h2>
              <p className="text-sm text-gray-500">Ranked by signal score across all carriers</p>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {top25.map((cg, i) => {
              const slug = cg.slug || cg.campground_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              const likelihood = getCarrierLikelihood(cg);
              const blurb = generateBlurb(cg);
              return (
                <Link key={slug + i} href={`/campground/${slug}`}>
                  <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shrink-0 text-sm font-bold text-white">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-sm text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                              {cg.campground_name}
                            </h3>
                            {cg.is_verified && (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] shrink-0">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {cg.city ? `${cg.city}, ` : ""}{STATE_NAMES[cg.state] || cg.state}
                          </p>
                          {/* Signal + Remote Work scores */}
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs font-semibold text-green-700">
                              Signal: {cg.signal_score ?? "N/A"}/100
                            </span>
                            {cg.remote_work_score != null && (
                              <span className="text-xs text-blue-600">
                                Remote Work: {cg.remote_work_score}/100
                              </span>
                            )}
                          </div>
                          {/* Carrier badges */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <LikelihoodBadge carrier="Verizon" level={likelihood.verizon} />
                            <LikelihoodBadge carrier="AT&T" level={likelihood.att} />
                            <LikelihoodBadge carrier="T-Mobile" level={likelihood.tmobile} />
                          </div>
                          {/* Blurb */}
                          <p className="text-xs text-gray-500 leading-relaxed">{blurb}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Browse by Region ── */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MapIcon className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Browse by Region
              </h2>
              <p className="text-sm text-gray-500">Explore campgrounds with cell service by state and region</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* State pages */}
            {Object.entries(STATE_NAMES).map(([code, name]) => (
              <Link key={code} href={`/campgrounds/${STATE_CODES[code]}`}>
                <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Trees className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {name} Campgrounds
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Browse {stateCounts[code] || 0} campgrounds with signal data across {name}.
                    </p>
                    <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                      Explore {code} <ArrowRight className="w-3 h-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {/* Upper Peninsula featured */}
            <Link href="/best-cell-signal-campgrounds-upper-peninsula">
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full border-green-200 bg-green-50/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Mountain className="w-5 h-5 text-green-700" />
                    <h3 className="font-bold text-sm text-green-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      Michigan&rsquo;s Upper Peninsula
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Top 25 campgrounds with the strongest cell signal in the U.P., where coverage is notoriously spotty.
                  </p>
                  <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                    View U.P. Rankings <ArrowRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Browse by Carrier ── */}
      <section className="py-10 bg-gradient-to-b from-stone-50 to-white border-t border-gray-100">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Radio className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Browse by Carrier
              </h2>
              <p className="text-sm text-gray-500">Find campgrounds ranked by your specific carrier</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/best-verizon-signal-campgrounds-michigan">
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full border-red-200 bg-red-50/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Signal className="w-4 h-4 text-red-700" />
                    </div>
                    <h3 className="font-bold text-sm text-red-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      Verizon &mdash; Michigan
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Top 25 Michigan campgrounds ranked by modeled Verizon signal score. The most popular carrier for rural camping.
                  </p>
                  <span className="text-xs text-red-700 font-medium flex items-center gap-1">
                    View Verizon Rankings <ArrowRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Card className="h-full border-blue-200 bg-blue-50/30 opacity-70">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Signal className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="font-bold text-sm text-blue-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    AT&T &mdash; Coming Soon
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Ranked campgrounds by AT&T signal strength. Currently in development.
                </p>
                <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600">Coming Soon</Badge>
              </CardContent>
            </Card>
            <Card className="h-full border-pink-200 bg-pink-50/30 opacity-70">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                    <Signal className="w-4 h-4 text-pink-700" />
                  </div>
                  <h3 className="font-bold text-sm text-pink-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    T-Mobile &mdash; Coming Soon
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Ranked campgrounds by T-Mobile signal strength. Currently in development.
                </p>
                <Badge variant="outline" className="text-[10px] border-pink-200 text-pink-600">Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Browse by Use Case ── */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Browse by Use Case
              </h2>
              <p className="text-sm text-gray-500">Find campgrounds that match how you camp</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/best-remote-work-campgrounds">
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full border-blue-200 bg-blue-50/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Laptop className="w-5 h-5 text-blue-700" />
                    <h3 className="font-bold text-sm text-blue-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      Best Remote Work Campgrounds
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Top 50 campgrounds ranked by remote work score &mdash; combining signal strength, town proximity, and highway access. Ideal for digital nomads and remote workers who want to camp without losing connectivity.
                  </p>
                  <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                    View Remote Work Rankings <ArrowRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Card className="h-full border-gray-200 bg-gray-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <WifiOff className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-sm text-gray-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Off-Grid &amp; Disconnected Camping
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  Looking to truly unplug? Many campgrounds in our database have low signal scores and limited carrier coverage &mdash; perfect for a digital detox. Use the directory below and filter by state to find backcountry and remote sites.
                </p>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  Browse the directory below <ArrowRight className="w-3 h-3" />
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Full Directory ── */}
      <section className="py-10 bg-gradient-to-b from-stone-50 to-white border-t border-gray-100">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Full Campground Directory
              </h2>
              <p className="text-sm text-gray-500">Search and filter all {campgrounds.length.toLocaleString()} campgrounds</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center mb-4">
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
            <Button variant={verifiedOnly ? "default" : "outline"} size="sm"
              className={`text-xs ${verifiedOnly ? "bg-green-700 hover:bg-green-800" : "border-green-200 text-green-700"}`}
              onClick={() => setVerifiedOnly(!verifiedOnly)}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Only
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSortBy(s => s === "campground_name" ? "state" : "campground_name")}>
              <ArrowUpDown className="w-3 h-3 mr-1" /> Sort by {sortBy === "campground_name" ? "Name" : "State"}
            </Button>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              {filtered.length.toLocaleString()} campgrounds
              {filtered.length > PER_PAGE && (
                <span className="text-gray-400"> &middot; Page {safePage} of {totalPages}</span>
              )}
            </p>
            {filtered.length > PER_PAGE && (
              <p className="text-xs text-gray-400">
                Showing {pageStart + 1}&ndash;{Math.min(pageEnd, filtered.length)} of {filtered.length.toLocaleString()}
              </p>
            )}
          </div>

          {/* Results */}
          <div className="space-y-2">
            {pageData.map((cg: any, i: number) => {
              const slug = cg.slug || cg.campground_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              const globalIndex = pageStart + i;
              return (
                <Link key={slug + globalIndex} href={`/campground/${slug}`}>
                  <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">
                          {globalIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm text-gray-900 truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                              {cg.campground_name}
                            </h3>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
              <Button variant="outline" size="sm" className="text-xs" disabled={safePage <= 1} onClick={() => goToPage(1)}>
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400 text-xs">&hellip;</span>
                ) : (
                  <Button key={p} variant={p === safePage ? "default" : "outline"} size="sm"
                    className={`text-xs min-w-[36px] ${p === safePage ? "bg-green-700 hover:bg-green-800" : ""}`}
                    onClick={() => goToPage(p as number)}>
                    {p}
                  </Button>
                )
              )}
              <Button variant="outline" size="sm" className="text-xs" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="text-xs" disabled={safePage >= totalPages} onClick={() => goToPage(totalPages)}>
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Methodology Note ── */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container max-w-3xl">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            Signal scores and carrier likelihood are modeled from publicly available tower and coverage data. Actual service may vary depending on terrain, weather, device, and network conditions. Campground data is sourced from OpenStreetMap and verified against official state park, DNR, and federal recreation records where available.
          </p>
        </div>
      </section>

      {/* Back to Map CTA */}
      <section className="container pb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-green-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Explore All {campgrounds.length.toLocaleString()} Campgrounds on the Map
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
                <Signal className="w-4 h-4 text-green-400" />
                <span className="font-bold text-white text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span>
              </div>
              <p className="text-xs leading-relaxed">
                Find campgrounds where your phone works &mdash; or where it doesn&rsquo;t. Data sourced from OpenStreetMap and verified against official records.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Signal Guides</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/best-cell-signal-campgrounds-upper-peninsula" className="hover:text-green-400 transition">Upper Peninsula Cell Signal</Link></li>
                <li><Link href="/best-verizon-signal-campgrounds-michigan" className="hover:text-green-400 transition">Verizon Signal &mdash; Michigan</Link></li>
                <li><Link href="/best-remote-work-campgrounds" className="hover:text-green-400 transition">Remote Work Campgrounds</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Browse by State</h4>
              <ul className="space-y-1.5 text-xs">
                {Object.entries(STATE_NAMES).map(([code, name]) => (
                  <li key={code}><Link href={`/campgrounds/${STATE_CODES[code]}`} className="hover:text-green-400 transition">{name}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center text-gray-500">
            &copy; 2026 SignalCamping &mdash; Campground discovery powered by OpenStreetMap data.
          </div>
        </div>
      </footer>
    </div>
  );
}
