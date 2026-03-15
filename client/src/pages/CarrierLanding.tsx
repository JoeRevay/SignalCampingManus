/**
 * CarrierLanding — SEO carrier-specific page showing campgrounds with signal for a given carrier.
 * URL: /campgrounds-with-verizon-signal/:state, /campgrounds-with-att-signal/:state, etc.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Signal, MapPin, ArrowLeft, ChevronRight, Star, Phone,
  Tent, Truck, Zap, Waves, Mountain
} from "lucide-react";

import seoData from "@/data/seo_pages.json";
import mvpData from "@/data/mvp_campgrounds.json";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", mi: "Michigan", oh: "Ohio",
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

const CARRIER_MAP: Record<string, { name: string; field: string }> = {
  verizon: { name: "Verizon", field: "verizon_signal" },
  att: { name: "AT&T", field: "att_signal" },
  "at-t": { name: "AT&T", field: "att_signal" },
  tmobile: { name: "T-Mobile", field: "tmobile_signal" },
  "t-mobile": { name: "T-Mobile", field: "tmobile_signal" },
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

export default function CarrierLanding() {
  const params = useParams<{ state: string }>();
  // Extract carrier from URL path: /campgrounds-with-{carrier}-signal/:state
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const carrierMatch = path.match(/campgrounds-with-(\w+)-signal/);
  const carrierSlug = carrierMatch?.[1] || "verizon";
  const stateSlug = params.state || "";
  const stateCode = stateSlug.toUpperCase();
  const stateName = STATE_NAMES[stateCode] || STATE_NAMES[stateSlug] || stateSlug;
  const carrierInfo = CARRIER_MAP[carrierSlug] || { name: carrierSlug, field: `${carrierSlug}_signal` };

  const carrierPage = useMemo(() =>
    (seoData as any).carrier_pages?.find((p: any) =>
      p.carrier_slug === carrierSlug && (p.state === stateCode || p.state === "ALL")
    ),
    [carrierSlug, stateCode]
  );

  const carrierCampgrounds = useMemo(() => {
    const field = carrierInfo.field;
    return campgrounds
      .filter(c => {
        if (stateCode && stateCode !== "ALL") {
          if (c.state !== stateCode) return false;
        }
        return (c as any)[field] === "Strong" || (c as any)[field] === "Moderate";
      })
      .sort((a, b) => {
        const rank: Record<string, number> = { Strong: 2, Moderate: 1, Weak: 0 };
        return (rank[(b as any)[field]] || 0) - (rank[(a as any)[field]] || 0);
      });
  }, [carrierInfo.field, stateCode]);

  const strongCount = carrierCampgrounds.filter(c => (c as any)[carrierInfo.field] === "Strong").length;
  const modCount = carrierCampgrounds.filter(c => (c as any)[carrierInfo.field] === "Moderate").length;

  useEffect(() => {
    document.title = `Campgrounds with ${carrierInfo.name} Signal in ${stateName} | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Find ${carrierCampgrounds.length} campgrounds with ${carrierInfo.name} cell service in ${stateName}. ${strongCount} with strong signal, ${modCount} with moderate coverage.`;
  }, [carrierInfo.name, stateName, carrierCampgrounds.length, strongCount, modCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <Header />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/seo-directory" className="hover:text-green-700 transition">Directory</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{carrierInfo.name} in {stateName}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3">
              <Phone className="w-3 h-3 mr-1" />{carrierInfo.name} Coverage
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Campgrounds with {carrierInfo.name} Signal in {stateName}
            </h1>
            <p className="text-blue-100 text-base max-w-2xl">
              {carrierCampgrounds.length} campgrounds with {carrierInfo.name} coverage. {strongCount} with strong signal for calls, texts, and data.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{carrierCampgrounds.length}</div>
                <div className="text-xs text-blue-200">Total</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-green-300">{strongCount}</div>
                <div className="text-xs text-blue-200">Strong</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-yellow-300">{modCount}</div>
                <div className="text-xs text-blue-200">Moderate</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{Math.round(strongCount / Math.max(carrierCampgrounds.length, 1) * 100)}%</div>
                <div className="text-xs text-blue-200">Strong Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          {carrierInfo.name} Coverage by Campground
        </h2>
        <div className="grid gap-3">
          {carrierCampgrounds.map((cg) => {
            const sig = (cg as any)[carrierInfo.field];
            return (
              <Link key={cg.slug} href={`/campground/${cg.slug}`}>
                <Card className="hover:shadow-md transition cursor-pointer border-gray-100 hover:border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 truncate">{cg.campground_name}</span>
                          <Badge className={`text-[10px] ${signalBadge(sig)}`}>{sig}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cg.city}, {cg.state}</span>
                          <span className="flex items-center gap-1"><Mountain className="w-3 h-3" />{cg.elevation_ft?.toLocaleString()} ft</span>
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
                        <div key={cr.name} className={`space-y-0.5 ${cr.name === carrierInfo.name ? "bg-blue-50/50 rounded p-1 -m-1" : ""}`}>
                          <div className="flex justify-between text-[10px] text-gray-500"><span className={cr.name === carrierInfo.name ? "font-bold text-blue-700" : ""}>{cr.name}</span><span>{cr.sig}</span></div>
                          <Progress value={signalPct(cr.sig)} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Other Carriers */}
      <section className="container pb-8">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Compare Other Carriers</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.entries(CARRIER_MAP).filter(([k]) => k !== carrierSlug && !k.includes("-")).map(([slug, info]) => (
                <Link key={slug} href={`/campgrounds-with-${slug}-signal/${stateSlug}`}>
                  <div className="p-3 bg-white rounded-lg border hover:border-blue-300 transition cursor-pointer">
                    <div className="font-medium text-sm text-gray-900">{info.name} in {stateName}</div>
                    <div className="text-xs text-gray-500">View coverage map</div>
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
