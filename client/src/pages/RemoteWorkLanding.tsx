/**
 * RemoteWorkLanding — SEO page for remote work camping by state.
 * URL: /remote-work-camping/:state
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Signal, MapPin, ChevronRight, Star, Laptop, Wifi,
  Tent, Truck, Zap, Waves, Mountain, BatteryCharging
} from "lucide-react";

import mvpData from "@/data/mvp_campgrounds.json";

const STATE_MAP: Record<string, { code: string; name: string }> = {
  michigan: { code: "MI", name: "Michigan" }, mi: { code: "MI", name: "Michigan" },
  ohio: { code: "OH", name: "Ohio" }, oh: { code: "OH", name: "Ohio" },
};

const signalBadge = (s: string) =>
  s === "Strong" ? "bg-green-100 text-green-800" :
  s === "Moderate" ? "bg-yellow-100 text-yellow-800" :
  s === "Weak" ? "bg-orange-100 text-orange-800" :
  "bg-red-100 text-red-800";

const signalPct = (s: string) =>
  s === "Strong" ? 100 : s === "Moderate" ? 66 : s === "Weak" ? 33 : 5;

const rwsBadge = (score: number) =>
  score >= 9 ? "bg-green-100 text-green-800 border-green-200" :
  score >= 7 ? "bg-blue-100 text-blue-800 border-blue-200" :
  score >= 4 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
  "bg-red-100 text-red-800 border-red-200";

const rwsLabel = (score: number) =>
  score >= 9 ? "Excellent" : score >= 7 ? "Good" : score >= 4 ? "Usable" : "Limited";

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

export default function RemoteWorkLanding() {
  const params = useParams<{ state: string }>();
  const stateSlug = params.state || "";
  const stateInfo = STATE_MAP[stateSlug] || { code: stateSlug.toUpperCase(), name: stateSlug };

  const rwCampgrounds = useMemo(() =>
    campgrounds
      .filter(c => c.state === stateInfo.code && (c.remote_work_score || 0) >= 4)
      .sort((a, b) => (b.remote_work_score || 0) - (a.remote_work_score || 0)),
    [stateInfo.code]
  );

  const excellent = rwCampgrounds.filter(c => c.remote_work_score >= 9);
  const good = rwCampgrounds.filter(c => c.remote_work_score >= 7 && c.remote_work_score < 9);
  const usable = rwCampgrounds.filter(c => c.remote_work_score >= 4 && c.remote_work_score < 7);
  const avgRws = rwCampgrounds.length ? (rwCampgrounds.reduce((s, c) => s + c.remote_work_score, 0) / rwCampgrounds.length).toFixed(1) : "0";
  const withElectric = rwCampgrounds.filter(c => c.electric_hookups).length;
  const withWaterfront = rwCampgrounds.filter(c => c.waterfront).length;

  useEffect(() => {
    document.title = `Best Campgrounds for Remote Work in ${stateInfo.name} | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `${rwCampgrounds.length} campgrounds in ${stateInfo.name} rated for remote work. ${excellent.length} excellent, ${good.length} good. Average RemoteWorkScore: ${avgRws}/10.`;
  }, [stateInfo.name, rwCampgrounds.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <Header />

      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/seo-directory" className="hover:text-green-700 transition">Directory</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">Remote Work in {stateInfo.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-violet-800 via-purple-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3">
              <Laptop className="w-3 h-3 mr-1" />Remote Work Guide
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Best Campgrounds for Remote Work in {stateInfo.name}
            </h1>
            <p className="text-purple-100 text-base max-w-2xl">
              {rwCampgrounds.length} campgrounds rated for remote work suitability. Strong signal + electric hookups + proximity to town = productive camping.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-green-300">{excellent.length}</div>
                <div className="text-xs text-purple-200">Excellent (9+)</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-blue-300">{good.length}</div>
                <div className="text-xs text-purple-200">Good (7-8.9)</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-yellow-300">{usable.length}</div>
                <div className="text-xs text-purple-200">Usable (4-6.9)</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{avgRws}</div>
                <div className="text-xs text-purple-200">Avg RWS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is RWS */}
      <section className="container pb-6">
        <Card className="bg-purple-50/50 border-purple-100">
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>What is RemoteWorkScore?</CardTitle></CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-2">
            <p>RemoteWorkScore (RWS) rates each campground from 0-10 based on how well it supports remote work:</p>
            <div className="grid sm:grid-cols-4 gap-3 mt-3">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <Wifi className="w-4 h-4 text-purple-600" />
                <div><div className="font-medium text-xs">Signal Strength</div><div className="text-[10px] text-gray-500">40% weight</div></div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <BatteryCharging className="w-4 h-4 text-purple-600" />
                <div><div className="font-medium text-xs">Electric Hookups</div><div className="text-[10px] text-gray-500">25% weight</div></div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <MapPin className="w-4 h-4 text-purple-600" />
                <div><div className="font-medium text-xs">Near Town</div><div className="text-[10px] text-gray-500">20% weight</div></div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                <Star className="w-4 h-4 text-purple-600" />
                <div><div className="font-medium text-xs">Confidence</div><div className="text-[10px] text-gray-500">15% weight</div></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Top Remote Work Campgrounds in {stateInfo.name}
        </h2>
        <div className="grid gap-3">
          {rwCampgrounds.slice(0, 30).map((cg, i) => (
            <Link key={cg.slug} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md transition cursor-pointer border-gray-100 hover:border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 rounded-full w-6 h-6 flex items-center justify-center shrink-0">#{i + 1}</span>
                        <span className="font-semibold text-gray-900 truncate">{cg.campground_name}</span>
                        <Badge className={`text-[10px] border ${rwsBadge(cg.remote_work_score)}`}>{rwsLabel(cg.remote_work_score)}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cg.city}, {cg.state}</span>
                        <span className="flex items-center gap-1"><Mountain className="w-3 h-3" />{cg.elevation_ft?.toLocaleString()} ft</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cg.distance_to_town_miles} mi to town</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {cg.tent_sites && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Tent className="w-2.5 h-2.5" />Tent</span>}
                        {cg.electric_hookups && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />Electric</span>}
                        {cg.waterfront && <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Waves className="w-2.5 h-2.5" />Waterfront</span>}
                        <Badge className={`text-[10px] ${signalBadge(cg.best_signal_strength)}`}>{cg.best_signal_strength} ({cg.best_carrier})</Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-purple-700">{cg.remote_work_score}</div>
                      <div className="text-[10px] text-gray-400">/10 RWS</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="container pb-8">
        <Card className="bg-purple-50/30 border-purple-100">
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Explore More</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href={`/campgrounds/${stateInfo.code.toLowerCase()}`}>
                <div className="p-3 bg-white rounded-lg border hover:border-purple-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">All {stateInfo.name} Campgrounds</div>
                  <div className="text-xs text-gray-500">Full state guide</div>
                </div>
              </Link>
              <Link href={`/campgrounds-with-verizon-signal/${stateInfo.code.toLowerCase()}`}>
                <div className="p-3 bg-white rounded-lg border hover:border-purple-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">Verizon in {stateInfo.name}</div>
                  <div className="text-xs text-gray-500">Carrier coverage</div>
                </div>
              </Link>
              <Link href="/seo-directory">
                <div className="p-3 bg-white rounded-lg border hover:border-purple-300 transition cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">SEO Page Directory</div>
                  <div className="text-xs text-gray-500">Browse all 264 pages</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-green-100 bg-white/60 py-6">
        <div className="container text-center text-xs text-gray-400">
          SignalCamping — Find campgrounds where your phone works.
        </div>
      </footer>
    </div>
  );
}
