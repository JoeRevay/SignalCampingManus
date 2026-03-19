/**
 * CityLanding — City-level campground listing. No signal fields.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Tent, Truck, Waves, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import seoData from "@/data/seo_pages.json";
import allData from "@/data/campgrounds.json";

const STATE_NAMES: Record<string, string> = { MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin" };
const parseBool = (v: any) => v === true || v === "True" || v === "Yes";
const campgrounds = (allData as any[]).map(cg => ({ ...cg, tent_sites: parseBool(cg.tent_sites), rv_sites: parseBool(cg.rv_sites), electric_hookups: parseBool(cg.electric_hookups), waterfront: parseBool(cg.waterfront) }));

export default function CityLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const page = useMemo(() => (seoData as any[]).find(p => p.slug === `city/${slug}` || p.slug?.endsWith(slug)), [slug]);
  const cityCampgrounds = useMemo(() => {
    if (!page) return [];
    return campgrounds.filter(c => (c.city || "").toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug.split("/").pop() && c.state === page.state);
  }, [page, slug]);

  useEffect(() => { if (page) document.title = `${page.title} | SignalCamping`; }, [page]);

  if (!page) return (
    <div className="min-h-screen"><header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-40"><div className="container py-3"><Link href="/"><Signal className="w-5 h-5 text-green-700" /></Link></div></header>
    <div className="container py-16 text-center"><h2 className="text-2xl font-bold mb-4">Page Not Found</h2><Link href="/"><Button>Back Home</Button></Link></div></div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />
      <nav className="container pt-4 pb-2"><ol className="flex items-center gap-1.5 text-sm text-gray-500"><li><Link href="/">Home</Link></li><li><ChevronRight className="w-3.5 h-3.5" /></li><li className="font-medium text-gray-800">{page.title}</li></ol></nav>
      <section className="container py-6">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{page.title}</h1>
        <Badge className="bg-green-100 text-green-700">{cityCampgrounds.length} campgrounds</Badge>
      </section>
      <section className="container pb-8"><div className="space-y-2">
        {cityCampgrounds.map((cg: any, i: number) => (
          <Link key={cg.slug + i} href={`/campground/${cg.slug}`}><Card className="hover:shadow-md transition cursor-pointer"><CardContent className="p-4"><div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">{i+1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-sm truncate">{cg.campground_name}</h3>{cg.is_verified && <Badge className="bg-green-100 text-green-800 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-0.5" />Verified</Badge>}</div>
              <p className="text-xs text-gray-500"><MapPin className="w-3 h-3 inline mr-1" />{cg.city}, {STATE_NAMES[cg.state]}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="text-xs">{(cg.campground_type||"campground").replace(/_/g," ")}</Badge>
                {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5"><Tent className="w-3 h-3" /></Badge>}
                {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5"><Truck className="w-3 h-3" /></Badge>}
                {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5"><Waves className="w-3 h-3" /></Badge>}
              </div>
            </div><ChevronRight className="w-4 h-4 text-gray-300 shrink-0" /></div></CardContent></Card></Link>
        ))}
      </div></section>
      <footer className="bg-gray-900 text-gray-400 py-8"><div className="container text-center text-sm">&copy; 2026 SignalCamping</div></footer>
    </div>
  );
}
