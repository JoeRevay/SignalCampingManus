/**
 * ListsDirectory — Browse all curated lists.
 */
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Signal, MapPin, ChevronRight } from "lucide-react";
import listsData from "@/data/shareable_lists.json";

export default function ListsDirectory() {
  const lists = listsData as any[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/"><div className="flex items-center gap-2"><Signal className="w-5 h-5 text-green-700" /><span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span></div></Link>
          <div className="ml-auto"><Link href="/"><Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700"><MapPin className="w-3.5 h-3.5 mr-1" /> Map</Button></Link></div>
        </div>
      </header>

      <section className="container py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Curated Campground Lists</h1>
        <p className="text-gray-500 mb-6">Browse our curated lists of verified campgrounds across the Great Lakes region.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list: any) => (
            <Link key={list.slug || list.id} href={`/list/${list.slug || list.id}`}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm mb-2 group-hover:text-green-700 transition-colors" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{list.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{list.description}</p>
                  <Badge variant="outline" className="text-[10px]">{list.count || list.slugs?.length || 0} campgrounds</Badge>
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
