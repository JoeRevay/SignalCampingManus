/**
 * ListsDirectory — Browse all curated lists.
 */
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import listsData from "@/data/shareable_lists.json";
import SiteHeader from "@/components/SiteHeader";

export default function ListsDirectory() {
  const lists = listsData as any[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />

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
                  <Badge variant="outline" className="text-[10px]">{list.count || list.campground_slugs?.length || list.slugs?.length || 0} campgrounds</Badge>
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
