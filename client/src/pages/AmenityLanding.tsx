/**
 * AmenityLanding — SEO page for amenity-based campground listings.
 * URL: /lakefront-campgrounds-with-cell-service/:state, /waterfront-campgrounds/:state, etc.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Signal, MapPin, ChevronRight, Star,
  Tent, Truck, Zap, Waves, Mountain, Trees
} from "lucide-react";

import seoData from "@/data/seo_pages.json";
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

const AMENITY_FILTERS: Record<string, { label: string; icon: string; filter: (c: any) => boolean }> = {
  lakefront: { label: "Lakefront", icon: "waves", filter: c => c.waterfront && (c.distance_to_lake_miles || 99) <= 2 },
  waterfront: { label: "Waterfront", icon: "waves", filter: c => c.waterfront },
  "tent-camping": { label: "Tent Camping", icon: "tent", filter: c => c.tent_sites },
  "rv-camping": { label: "RV Camping", icon: "truck", filter: c => c.rv_sites },
  "electric-hookups": { label: "Electric Hookups", icon: "zap", filter: c => c.electric_hookups },
  forest: { label: "Forest", icon: "trees", filter: c => (c.forest_cover_percent || 0) >= 60 },
  "near-town": { label: "Near Town", icon: "mappin", filter: c => (c.distance_to_town_miles || 99) <= 5 },
  "high-elevation": { label: "High Elevation", icon: "mountain", filter: c => (c.elevation_ft || 0) >= 1500 },
  "remote-wilderness": { label: "Remote Wilderness", icon: "trees", filter: c => (c.distance_to_town_miles || 0) >= 20 },
  "full-amenity": { label: "Full Amenity", icon: "star", filter: c => c.tent_sites && c.rv_sites && c.electric_hookups && c.waterfront },
};

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

export default function AmenityLanding() {
  const params = useParams<{ state: string }>();
  // Extract amenity from URL path: /{amenity}-campgrounds-with-cell-service/:state
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const amenityMatch = path.match(/\/([a-z-]+)-campgrounds-with-cell-service/);
  const amenitySlug = amenityMatch?.[1] || "";
  const stateSlug = params.state || "";
  const stateInfo = STATE_MAP[stateSlug] || { code: stateSlug.toUpperCase(), name: stateSlug };
  const amenityInfo = AMENITY_FILTERS[amenitySlug] || { label: amenitySlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()), filter: () => true };

  const amenityCampgrounds = useMemo(() =>
    campgrounds
      .filter(c => c.state === stateInfo.code && amenityInfo.filter(c))
      .sort((a, b) => (b.remote_work_score || 0) - (a.remote_work_score || 0)),
    [stateInfo.code, amenitySlug]
  );

  const strongCount = amenityCampgrounds.filter(c => c.best_signal_strength === "Strong").length;
  const avgRws = amenityCampgrounds.length
    ? (amenityCampgrounds.reduce((s, c) => s + (c.remote_work_score || 0), 0) / amenityCampgrounds.length).toFixed(1)
    : "0";

  useEffect(() => {
    document.title = `${amenityInfo.label} Campgrounds with Cell Service in ${stateInfo.name} | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Find ${amenityCampgrounds.length} ${amenityInfo.label.toLowerCase()} campgrounds with cell service in ${stateInfo.name}. ${strongCount} with strong signal.`;
  }, [amenityInfo.label, stateInfo.name, amenityCampgrounds.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <Header />

      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/seo-directory" className="hover:text-green-700 transition">Directory</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{amenityInfo.label} in {stateInfo.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3">Amenity Guide</Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {amenityInfo.label} Campgrounds with Cell Service in {stateInfo.name}
            </h1>
            <p className="text-teal-100 text-base max-w-2xl">
              {amenityCampgrounds.length} campgrounds matching "{amenityInfo.label}" with cellular coverage data.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{amenityCampgrounds.length}</div>
                <div className="text-xs text-teal-200">Campgrounds</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-green-300">{strongCount}</div>
                <div className="text-xs text-teal-200">Strong Signal</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{avgRws}</div>
                <div className="text-xs text-teal-200">Avg RWS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          {amenityInfo.label} Campgrounds
        </h2>
        <div className="grid gap-3">
          {amenityCampgrounds.map((cg, i) => (
            <Link key={cg.slug} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md transition cursor-pointer border-gray-100 hover:border-teal-200">
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
                        {cg.nearest_lake_name && <span className="flex items-center gap-1"><Waves className="w-3 h-3" />{cg.nearest_lake_name} ({cg.distance_to_lake_miles} mi)</span>}
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
                    </div>
                  </div>
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
        {amenityCampgrounds.length === 0 && (
          <p className="text-gray-500 text-center py-8">No campgrounds match this amenity filter in {stateInfo.name}.</p>
        )}
      </section>

      {/* Other amenity links */}
      <section className="container pb-8">
        <Card className="bg-teal-50/30 border-teal-100">
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Browse Other Amenities</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(AMENITY_FILTERS).filter(([k]) => k !== amenitySlug).slice(0, 6).map(([slug, info]) => (
                <Link key={slug} href={`/${slug}-campgrounds-with-cell-service/${stateSlug}`}>
                  <div className="p-3 bg-white rounded-lg border hover:border-teal-300 transition cursor-pointer">
                    <div className="font-medium text-sm text-gray-900">{info.label} in {stateInfo.name}</div>
                    <div className="text-xs text-gray-500">With cell service</div>
                  </div>
                </Link>
              ))}
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
