/**
 * SeoDirectory — Browse all SEO pages. No signal fields.
 */
import { useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Signal, MapPin, ChevronRight } from "lucide-react";
import seoData from "@/data/seo_pages.json";

export default function SeoDirectory() {
  useEffect(() => { document.title = "SEO Directory | SignalCamping"; }, []);
  const pages = seoData as any[];
  const states = useMemo(() => pages.filter(p => p.type === "state"), []);
  const cities = useMemo(() => pages.filter(p => p.type === "city").sort((a, b) => b.count - a.count), []);
  const amenities = useMemo(() => pages.filter(p => p.type === "amenity"), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/"><div className="flex items-center gap-2"><Signal className="w-5 h-5 text-green-700" /><span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span></div></Link>
          <div className="ml-auto"><Link href="/"><Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700"><MapPin className="w-3.5 h-3.5 mr-1" /> Map</Button></Link></div>
        </div>
      </header>
      <section className="container py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SEO Directory</h1>
        <h2 className="text-xl font-bold mb-3">By State ({states.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {states.map((p: any) => (
            <Link key={p.slug} href={`/${p.slug}`}><Card className="hover:shadow-md transition cursor-pointer text-center"><CardContent className="p-4">
              <h3 className="font-semibold text-sm">{p.state_full || p.state}</h3>
              <p className="text-xs text-gray-500">{p.count} campgrounds</p>
            </CardContent></Card></Link>
          ))}
        </div>
        <h2 className="text-xl font-bold mb-3">By City ({cities.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
          {cities.slice(0, 30).map((p: any) => (
            <Link key={p.slug} href={`/campgrounds-with-cell-service/${p.slug.replace("city/", "")}`}>
              <Card className="hover:shadow-md transition cursor-pointer"><CardContent className="p-3 flex items-center justify-between">
                <div><h3 className="font-medium text-sm">{p.city}, {p.state}</h3></div>
                <Badge variant="outline" className="text-xs">{p.count}</Badge>
              </CardContent></Card>
            </Link>
          ))}
        </div>
        <h2 className="text-xl font-bold mb-3">By Type ({amenities.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {amenities.map((p: any) => (
            <Card key={p.slug} className="text-center"><CardContent className="p-4">
              <h3 className="font-semibold text-sm capitalize">{p.amenity}</h3>
              <p className="text-xs text-gray-500">{p.count} campgrounds</p>
            </CardContent></Card>
          ))}
        </div>
      </section>
      <footer className="bg-gray-900 text-gray-400 py-8"><div className="container text-center text-sm">&copy; 2026 SignalCamping</div></footer>
    </div>
  );
}
