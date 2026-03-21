/**
 * ShareableList — Curated campground list page.
 * Uses verified MVP data. No signal fields.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, ChevronRight, Tent, Truck, Zap, Waves,
  CheckCircle2, ArrowLeft, Share2
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AffiliateRecommendations from "@/components/AffiliateRecommendations";
import listsData from "@/data/shareable_lists.json";
import campgroundsData from "@/data/mvp_campgrounds.json";
import allData from "@/data/campgrounds.json";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

const parseBool = (v: any) => v === true || v === "True" || v === "Yes";

// Build lookup from all data sources
const allCampgrounds = (() => {
  const mvp = (campgroundsData as any[]).map(cg => ({ ...cg, tent_sites: parseBool(cg.tent_sites), rv_sites: parseBool(cg.rv_sites), electric_hookups: parseBool(cg.electric_hookups), waterfront: parseBool(cg.waterfront) }));
  const mvpSlugs = new Set(mvp.map(c => c.slug));
  const rest = (allData as any[]).filter(c => !mvpSlugs.has(c.slug)).map(cg => ({ ...cg, tent_sites: parseBool(cg.tent_sites), rv_sites: parseBool(cg.rv_sites), electric_hookups: parseBool(cg.electric_hookups), waterfront: parseBool(cg.waterfront) }));
  return [...mvp, ...rest];
})();

const slugLookup = new Map(allCampgrounds.map(c => [c.slug, c]));

export default function ShareableList() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const list = useMemo(() => (listsData as any[]).find(l => (l.slug || l.id) === slug), [slug]);
  const campgrounds = useMemo(() => {
    if (!list) return [];
    return (list.campground_slugs || list.slugs || []).map((s: string) => slugLookup.get(s)).filter(Boolean);
  }, [list]);

  useEffect(() => {
    if (!list) return;
    document.title = `${list.title} | SignalCamping`;
  }, [list]);

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <SiteHeader />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">List Not Found</h2>
          <Link href="/lists"><Button className="bg-green-600 hover:bg-green-700 text-white"><ArrowLeft className="w-4 h-4 mr-2" /> All Lists</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />

      <nav className="container pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-green-700">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/lists" className="hover:text-green-700">Lists</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium truncate max-w-[200px]">{list.title}</li>
        </ol>
      </nav>

      <section className="container py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{list.title}</h1>
        <p className="text-gray-500 mb-4">{list.description}</p>
        <Badge className="bg-green-100 text-green-700">{campgrounds.length} campgrounds</Badge>
      </section>

      {campgrounds.length > 0 && (
        <section className="container pb-4">
          <AffiliateRecommendations campground={campgrounds[0]} />
        </section>
      )}

      <section className="container pb-8">
        <div className="space-y-2">
          {campgrounds.map((cg: any, i: number) => (
            <Link key={cg.slug} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{cg.campground_name}</h3>
                        {cg.is_verified && <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] shrink-0"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{cg.city ? `${cg.city}, ` : ""}{STATE_NAMES[cg.state] || cg.state}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-xs">{(cg.campground_type || "campground").replace(/_/g, " ")}</Badge>
                        {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Tent className="w-3 h-3" />Tent</Badge>}
                        {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Truck className="w-3 h-3" />RV</Badge>}
                        {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Waves className="w-3 h-3" />Waterfront</Badge>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8"><div className="container text-center text-sm">&copy; 2026 SignalCamping</div></footer>
    </div>
  );
}
