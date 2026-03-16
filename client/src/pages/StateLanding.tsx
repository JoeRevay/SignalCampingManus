/**
 * StateLanding — State-level campground listing page.
 * Uses OSM data. No signal fields.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Signal, MapPin, ChevronRight, Tent, Truck, Zap, Waves, CheckCircle2
} from "lucide-react";
import top100Data from "@/data/top100_seo.json";

const campgrounds = (top100Data as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || (cg.tent_sites as any) === "True",
  rv_sites: cg.rv_sites === true || (cg.rv_sites as any) === "True",
  electric_hookups: cg.electric_hookups === true || (cg.electric_hookups as any) === "True",
  waterfront: cg.waterfront === true || (cg.waterfront as any) === "True",
}));

const STATE_MAP: Record<string, { code: string; name: string; desc: string }> = {
  mi: { code: "MI", name: "Michigan", desc: "Explore campgrounds across Michigan's Upper and Lower Peninsulas, from the shores of Lake Michigan to the forests of the UP." },
  oh: { code: "OH", name: "Ohio", desc: "Discover Ohio's state parks and campgrounds in the rolling hills of Appalachian country and along Lake Erie." },
  pa: { code: "PA", name: "Pennsylvania", desc: "Find campgrounds in Pennsylvania's Allegheny Mountains, state forests, and lakeside parks." },
  wi: { code: "WI", name: "Wisconsin", desc: "Camp in Wisconsin's Northwoods, Door County, and along the shores of Lake Superior." },

};

export default function StateLanding() {
  const params = useParams<{ state: string }>();
  const stateSlug = params.state?.toLowerCase() || "";
  const stateInfo = STATE_MAP[stateSlug];

  const stateCampgrounds = useMemo(() => {
    if (!stateInfo) return [];
    return campgrounds
      .filter(cg => cg.state === stateInfo.code)
      .sort((a: any, b: any) => a.campground_name.localeCompare(b.campground_name));
  }, [stateInfo]);

  const verifiedCount = useMemo(() => stateCampgrounds.filter((c: any) => c.is_verified).length, [stateCampgrounds]);

  useEffect(() => {
    if (!stateInfo) return;
    document.title = `${stateInfo.name} Campgrounds | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Browse ${stateCampgrounds.length} campgrounds in ${stateInfo.name}. Real locations from OpenStreetMap.`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <StateHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/top-campgrounds" className="hover:text-green-700 transition">All Campgrounds</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{stateInfo.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          {stateInfo.name} Campgrounds
        </h1>
        <p className="text-gray-500 max-w-3xl mb-4">{stateInfo.desc}</p>
        <div className="flex gap-3 flex-wrap">
          <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">{stateCampgrounds.length} Campgrounds</Badge>
          {verifiedCount > 0 && (
            <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">{verifiedCount} Verified</Badge>
          )}
        </div>
      </section>

      {/* Campground List */}
      <section className="container pb-8">
        <div className="space-y-2">
          {stateCampgrounds.map((cg: any, idx: number) => (
            <Link key={cg.slug + idx} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
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
                        {cg.city ? `${cg.city}, ` : ""}{stateInfo.name}
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
          ))}
        </div>
      </section>

      {/* Other States */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Explore Other States
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATE_MAP).filter(([k]) => k !== stateSlug).map(([slug, info]) => (
            <Link key={slug} href={`/campgrounds/${slug}`}>
              <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer text-center">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm">{info.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {campgrounds.filter((c: any) => c.state === info.code).length} campgrounds
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
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
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</h2>
                <p className="text-xs text-muted-foreground">Great Lakes Campground Discovery</p>
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700">All Campgrounds</Button>
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
