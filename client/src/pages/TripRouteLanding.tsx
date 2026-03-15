/**
 * TripRouteLanding — SEO page for trip route campground discovery.
 * URL: /camping-trip/:slug (e.g., cleveland-to-traverse-city)
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Signal, MapPin, ChevronRight, Star, Route, Navigation,
  Tent, Truck, Zap, Waves, Mountain
} from "lucide-react";

import seoData from "@/data/seo_pages.json";
import mvpData from "@/data/mvp_campgrounds.json";

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

export default function TripRouteLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const tripRoute = useMemo(() =>
    (seoData as any).trip_route_pages?.find((p: any) => p.slug === slug),
    [slug]
  );

  // For trip routes, show campgrounds from both origin and destination states
  const routeCampgrounds = useMemo(() => {
    if (!tripRoute) return [];
    const states = new Set([tripRoute.origin_state, tripRoute.dest_state]);
    return campgrounds
      .filter(c => states.has(c.state))
      .sort((a, b) => (b.remote_work_score || 0) - (a.remote_work_score || 0));
  }, [tripRoute]);

  const strongCount = routeCampgrounds.filter(c => c.best_signal_strength === "Strong").length;
  const wfCount = routeCampgrounds.filter(c => c.waterfront).length;

  useEffect(() => {
    if (!tripRoute) return;
    document.title = `Campgrounds with Cell Service: ${tripRoute.origin} to ${tripRoute.destination} | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Plan a camping trip from ${tripRoute.origin} to ${tripRoute.destination}. ${routeCampgrounds.length} campgrounds along the route with cell service. ${strongCount} with strong signal.`;
  }, [tripRoute, routeCampgrounds.length]);

  if (!tripRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <Header />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Route Not Found</h2>
          <p className="text-gray-500 mb-6">This trip route page doesn't exist yet.</p>
          <Link href="/seo-directory"><button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Browse All Pages</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <Header />

      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/seo-directory" className="hover:text-green-700 transition">Directory</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{tripRoute.origin} to {tripRoute.destination}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3">
              <Route className="w-3 h-3 mr-1" />Trip Route
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Campgrounds with Cell Service: {tripRoute.origin} to {tripRoute.destination}
            </h1>
            <p className="text-orange-100 text-base max-w-2xl">
              {routeCampgrounds.length} campgrounds along the {tripRoute.distance_miles}-mile route with cellular coverage data.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{tripRoute.distance_miles}</div>
                <div className="text-xs text-orange-200">Miles</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{routeCampgrounds.length}</div>
                <div className="text-xs text-orange-200">Campgrounds</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-green-300">{strongCount}</div>
                <div className="text-xs text-orange-200">Strong Signal</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{wfCount}</div>
                <div className="text-xs text-orange-200">Waterfront</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Route Overview */}
      <section className="container pb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Route Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <div className="font-medium text-sm">{tripRoute.origin}, {tripRoute.origin_state}</div>
                  <div className="text-xs text-gray-500">Start</div>
                </div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 min-w-[40px]" />
              <div className="text-center">
                <div className="text-sm font-bold text-gray-700">{tripRoute.distance_miles} mi</div>
                <div className="text-[10px] text-gray-400">~{Math.round(tripRoute.distance_miles / 55)} hrs drive</div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 min-w-[40px]" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <div className="font-medium text-sm">{tripRoute.destination}, {tripRoute.dest_state}</div>
                  <div className="text-xs text-gray-500">Destination</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              This route passes through {new Set(routeCampgrounds.map((c: any) => c.state)).size} states with campgrounds near major highways. 
              {strongCount > 0 ? ` ${strongCount} campgrounds have strong cell signal, making them ideal for staying connected during your trip.` : ""}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Campgrounds Along the Route
        </h2>
        <div className="grid gap-3">
          {routeCampgrounds.slice(0, 40).map((cg) => (
            <Link key={cg.slug} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md transition cursor-pointer border-gray-100 hover:border-orange-200">
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
      </section>

      {/* Other Routes */}
      <section className="container pb-8">
        <Card className="bg-orange-50/30 border-orange-100">
          <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Other Trip Routes</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {(seoData as any).trip_route_pages?.filter((p: any) => p.slug !== slug).slice(0, 6).map((route: any) => (
                <Link key={route.slug} href={`/camping-trip/${route.slug}`}>
                  <div className="p-3 bg-white rounded-lg border hover:border-orange-300 transition cursor-pointer">
                    <div className="font-medium text-sm text-gray-900">{route.origin} → {route.destination}</div>
                    <div className="text-xs text-gray-500">{route.distance_miles} mi · {route.campground_count} campgrounds</div>
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
