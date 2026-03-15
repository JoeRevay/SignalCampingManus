/**
 * StateLanding — SEO-optimized state-level campground listing page.
 *
 * Targets queries like:
 *   "campgrounds with cell service in michigan"
 *   "ohio camping with phone signal"
 *   "best cell service campgrounds wisconsin"
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Signal, MapPin, Star, ChevronRight, Tent, Truck, Zap, Waves,
  Mountain, Trees, Trophy
} from "lucide-react";

import top100Data from "@/data/top100_seo.json";

interface Campground {
  campground_name: string;
  city: string;
  state: string;
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

const STATE_MAP: Record<string, { code: string; name: string; desc: string }> = {
  mi: { code: "MI", name: "Michigan", desc: "Explore campgrounds across Michigan's Upper and Lower Peninsulas, from the shores of Lake Michigan to the forests of the UP." },
  oh: { code: "OH", name: "Ohio", desc: "Discover Ohio's state parks and campgrounds in the rolling hills of Appalachian country and along Lake Erie." },
  pa: { code: "PA", name: "Pennsylvania", desc: "Find camping with cell service in Pennsylvania's Allegheny Mountains, state forests, and lakeside parks." },
  wi: { code: "WI", name: "Wisconsin", desc: "Camp with confidence in Wisconsin's Northwoods, Door County, and along the shores of Lake Superior." },
  wv: { code: "WV", name: "West Virginia", desc: "Explore West Virginia's mountain campgrounds in the Monongahela National Forest and New River Gorge region." },
};

const signalBadge = (s: string) => {
  const c = s === "Strong" ? "bg-green-100 text-green-800" :
    s === "Moderate" ? "bg-yellow-100 text-yellow-800" :
    s === "Weak" ? "bg-orange-100 text-orange-800" :
    "bg-red-100 text-red-800";
  return <span className={`text-xs px-1.5 py-0.5 rounded ${c}`}>{s}</span>;
};

export default function StateLanding() {
  const params = useParams<{ state: string }>();
  const stateSlug = params.state?.toLowerCase() || "";
  const stateInfo = STATE_MAP[stateSlug];

  const stateCampgrounds = useMemo(() => {
    if (!stateInfo) return [];
    return campgrounds
      .filter(cg => cg.state === stateInfo.code)
      .sort((a, b) => b.seo_score - a.seo_score);
  }, [stateInfo]);

  useEffect(() => {
    if (!stateInfo) return;
    document.title = `${stateInfo.name} Campgrounds with Cell Service | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Find ${stateCampgrounds.length} campgrounds with reliable cell service in ${stateInfo.name}. Signal strength data for Verizon, AT&T, and T-Mobile at every campground.`;
  }, [stateInfo, stateCampgrounds.length]);

  if (!stateInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <StateHeader />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">State Not Found</h2>
          <Link href="/top-campgrounds"><Button className="bg-green-600 hover:bg-green-700 text-white">View All Campgrounds</Button></Link>
        </div>
      </div>
    );
  }

  const avgSignal = stateCampgrounds.length > 0
    ? (stateCampgrounds.reduce((s, c) => s + c.signal_confidence_score, 0) / stateCampgrounds.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <StateHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/top-campgrounds" className="hover:text-green-700 transition">Top 100</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{stateInfo.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {stateInfo.name} Campgrounds with Cell Service
        </h1>
        <p className="text-gray-500 max-w-3xl mb-4">{stateInfo.desc}</p>
        <div className="flex gap-3 flex-wrap">
          <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">{stateCampgrounds.length} Campgrounds</Badge>
          <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">Avg Signal: {avgSignal}/5</Badge>
        </div>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <div className="space-y-3">
          {stateCampgrounds.map((cg, idx) => (
            <Link key={cg.slug} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                      idx < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cg.campground_name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" /> {cg.city}, {stateInfo.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < cg.signal_confidence_score ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">{cg.campground_type.replace(/_/g, " ")}</Badge>
                        <span className="text-xs text-gray-400">VZW: {signalBadge(cg.verizon_signal)}</span>
                        <span className="text-xs text-gray-400">ATT: {signalBadge(cg.att_signal)}</span>
                        <span className="text-xs text-gray-400">TMO: {signalBadge(cg.tmobile_signal)}</span>
                      </div>
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
          ))}
        </div>
      </section>

      {/* Other States */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Explore Other States
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATE_MAP).filter(([k]) => k !== stateSlug).map(([slug, info]) => (
            <Link key={slug} href={`/campgrounds/${slug}`}>
              <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer text-center">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm">{info.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {campgrounds.filter(c => c.state === info.code).length} campgrounds
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
        <div className="container">
          <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
            &copy; 2026 SignalCamping &mdash; Campground discovery with cellular signal data.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StateHeader() {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
                <Signal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h2>
                <p className="text-xs text-muted-foreground">Great Lakes Campground Signal Discovery</p>
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700">Top 100</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700 hover:bg-green-50">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
