/**
 * CityLanding — SEO city-level page showing campgrounds near a specific city.
 * URL: /campgrounds-with-cell-service/:slug (e.g., traverse-city-mi)
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Signal, MapPin, Tent, Truck, Zap, Waves, ArrowLeft,
  ChevronRight, Star, ExternalLink, Mountain, Trees
} from "lucide-react";

import seoData from "@/data/seo_pages.json";
import mvpData from "@/data/mvp_campgrounds.json";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin", WV: "West Virginia",
};

const signalBadge = (s: string) =>
  s === "Strong" ? "bg-green-100 text-green-800" :
  s === "Moderate" ? "bg-yellow-100 text-yellow-800" :
  s === "Weak" ? "bg-orange-100 text-orange-800" :
  "bg-red-100 text-red-800";

const signalPct = (s: string) =>
  s === "Strong" ? 100 : s === "Moderate" ? 66 : s === "Weak" ? 33 : 5;

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const campgrounds = (mvpData as any[]).map(c => ({
  ...c,
  slug: c.slug || slugify(c.campground_name),
  tent_sites: c.tent_sites === true || c.tent_sites === "True",
  rv_sites: c.rv_sites === true || c.rv_sites === "True",
  electric_hookups: c.electric_hookups === true || c.electric_hookups === "True",
  waterfront: c.waterfront === true || c.waterfront === "True",
}));

function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <Signal className="w-5 h-5 text-green-700" />
          <span className="font-bold text-lg tracking-tight text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Signal<span className="text-green-700">Camping</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/top-campgrounds" className="text-gray-600 hover:text-green-700 transition hidden sm:block">Top 100</Link>
          <Link href="/seo-directory" className="text-gray-600 hover:text-green-700 transition hidden sm:block">SEO Directory</Link>
          <Link href="/" className="text-gray-600 hover:text-green-700 transition">Map</Link>
        </nav>
      </div>
    </header>
  );
}

export default function CityLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const cityPage = useMemo(() =>
    (seoData as any).city_pages?.find((p: any) => p.slug === slug),
    [slug]
  );

  const cityCampgrounds = useMemo(() => {
    if (!cityPage) return [];
    const slugSet = new Set(cityPage.campground_slugs || []);
    return campgrounds.filter(c => slugSet.has(c.slug));
  }, [cityPage]);

  useEffect(() => {
    if (!cityPage) return;
    document.title = `Campgrounds with Cell Service Near ${cityPage.city}, ${cityPage.state_name} | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Find ${cityPage.campground_count} campgrounds with cell phone service near ${cityPage.city}, ${cityPage.state_name}. ${cityPage.strong_signal} with strong signal. Average RemoteWorkScore: ${cityPage.avg_rws}/10.`;
  }, [cityPage]);

  if (!cityPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <Header />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">City Page Not Found</h2>
          <p className="text-gray-500 mb-6">We don't have a page for this city yet.</p>
          <Link href="/seo-directory"><Button className="bg-green-600 hover:bg-green-700 text-white"><ArrowLeft className="w-4 h-4 mr-2" /> Browse All Pages</Button></Link>
        </div>
      </div>
    );
  }

  const strongCount = cityCampgrounds.filter(c => c.best_signal_strength === "Strong").length;
  const modCount = cityCampgrounds.filter(c => c.best_signal_strength === "Moderate").length;
  const weakCount = cityCampgrounds.filter(c => c.best_signal_strength === "Weak").length;
  const wfCount = cityCampgrounds.filter(c => c.waterfront).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <Header />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href={`/campgrounds/${cityPage.state.toLowerCase()}`} className="hover:text-green-700 transition">{cityPage.state_name}</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{cityPage.city}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3">City Guide</Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Campgrounds with Cell Service Near {cityPage.city}, {cityPage.state}
            </h1>
            <p className="text-green-100 text-base max-w-2xl">
              {cityPage.campground_count} campgrounds within 35 miles of {cityPage.city} with cellular coverage data for Verizon, AT&T, and T-Mobile.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{cityPage.campground_count}</div>
                <div className="text-xs text-green-200">Campgrounds</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{strongCount}</div>
                <div className="text-xs text-green-200">Strong Signal</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{cityPage.avg_rws}</div>
                <div className="text-xs text-green-200">Avg RWS</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{wfCount}</div>
                <div className="text-xs text-green-200">Waterfront</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Distribution */}
      <section className="container pb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Signal Strength Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{strongCount}</div>
                <div className="text-xs text-gray-500">Strong</div>
                <div className="w-full bg-green-200 rounded-full h-1.5 mt-2"><div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${cityCampgrounds.length ? (strongCount / cityCampgrounds.length * 100) : 0}%` }} /></div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{modCount}</div>
                <div className="text-xs text-gray-500">Moderate</div>
                <div className="w-full bg-yellow-200 rounded-full h-1.5 mt-2"><div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${cityCampgrounds.length ? (modCount / cityCampgrounds.length * 100) : 0}%` }} /></div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{weakCount}</div>
                <div className="text-xs text-gray-500">Weak</div>
                <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2"><div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${cityCampgrounds.length ? (weakCount / cityCampgrounds.length * 100) : 0}%` }} /></div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{cityCampgrounds.length - strongCount - modCount - weakCount}</div>
                <div className="text-xs text-gray-500">No Signal</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-gray-500 h-1.5 rounded-full" style={{ width: `${cityCampgrounds.length ? ((cityCampgrounds.length - strongCount - modCount - weakCount) / cityCampgrounds.length * 100) : 0}%` }} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          All Campgrounds Near {cityPage.city}
        </h2>
        <div className="grid gap-3">
          {cityCampgrounds.map((cg, i) => (
            <Link key={cg.slug} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md transition cursor-pointer border-gray-100 hover:border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 truncate">{cg.campground_name}</span>
                        <Badge className={`text-[10px] ${signalBadge(cg.best_signal_strength)}`}>{cg.best_signal_strength}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cg.city}, {cg.state}</span>
                        <span className="flex items-center gap-1"><Mountain className="w-3 h-3" />{cg.elevation_ft?.toLocaleString()} ft</span>
                        <span className="flex items-center gap-1"><Trees className="w-3 h-3" />{cg.forest_cover_percent}% forest</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cg.tent_sites && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Tent className="w-2.5 h-2.5" />Tent</span>}
                        {cg.rv_sites && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Truck className="w-2.5 h-2.5" />RV</span>}
                        {cg.electric_hookups && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />Electric</span>}
                        {cg.waterfront && <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Waves className="w-2.5 h-2.5" />Waterfront</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-gray-900">{cg.remote_work_score}</span>
                        <span className="text-[10px] text-gray-400">/10</span>
                      </div>
                      <div className="text-[10px] text-gray-400">RWS</div>
                      <div className="mt-1 text-[10px] text-gray-500">{cg.best_carrier}</div>
                    </div>
                  </div>
                  {/* Carrier bars */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[{ name: "Verizon", sig: cg.verizon_signal }, { name: "AT&T", sig: cg.att_signal }, { name: "T-Mobile", sig: cg.tmobile_signal }].map(cr => (
                      <div key={cr.name} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-gray-500"><span>{cr.name}</span><span>{cr.sig}</span></div>
                        <Progress value={signalPct(cr.sig)} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {cityCampgrounds.length === 0 && (
          <p className="text-gray-500 text-center py-8">No campgrounds found near {cityPage.city}. Try a nearby city.</p>
        )}
      </section>

      {/* Internal Links */}
      <section className="container pb-8">
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Explore More</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href={`/campgrounds/${cityPage.state.toLowerCase()}`}>
                <div className="p-3 bg-white rounded-lg border hover:border-green-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">All {cityPage.state_name} Campgrounds</div>
                  <div className="text-xs text-gray-500">State-wide coverage guide</div>
                </div>
              </Link>
              <Link href={`/campgrounds-with-verizon-signal/${cityPage.state.toLowerCase()}`}>
                <div className="p-3 bg-white rounded-lg border hover:border-green-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">Verizon Coverage in {cityPage.state_name}</div>
                  <div className="text-xs text-gray-500">Carrier-specific guide</div>
                </div>
              </Link>
              <Link href={`/remote-work-camping/${cityPage.state.toLowerCase()}`}>
                <div className="p-3 bg-white rounded-lg border hover:border-green-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">Remote Work Camping in {cityPage.state_name}</div>
                  <div className="text-xs text-gray-500">Best spots for digital nomads</div>
                </div>
              </Link>
              <Link href="/top-campgrounds">
                <div className="p-3 bg-white rounded-lg border hover:border-green-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">Top 100 Campgrounds</div>
                  <div className="text-xs text-gray-500">Highest-rated across all states</div>
                </div>
              </Link>
              <Link href="/seo-directory">
                <div className="p-3 bg-white rounded-lg border hover:border-green-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">SEO Page Directory</div>
                  <div className="text-xs text-gray-500">Browse all 264 pages</div>
                </div>
              </Link>
              <Link href="/">
                <div className="p-3 bg-white rounded-lg border hover:border-green-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">Interactive Map</div>
                  <div className="text-xs text-gray-500">Explore with filters</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-white/60 py-6">
        <div className="container text-center text-xs text-gray-400">
          SignalCamping — Find campgrounds where your phone works.
        </div>
      </footer>
    </div>
  );
}
