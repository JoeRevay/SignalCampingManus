/**
 * ListsDirectory — Browse all shareable "Best of" / "Top 10" lists
 *
 * Design: Grid of list cards organized by category, optimized for discovery.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Signal, Trophy, Laptop, Waves, Zap, Tent, Trees, Mountain, MapPin, Star
} from "lucide-react";

import listsData from "@/data/shareable_lists.json";

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  "top-rated": { label: "Top Rated", icon: Trophy, color: "bg-amber-100 text-amber-800 border-amber-200" },
  "remote-work": { label: "Remote Work", icon: Laptop, color: "bg-purple-100 text-purple-800 border-purple-200" },
  "waterfront": { label: "Waterfront", icon: Waves, color: "bg-blue-100 text-blue-800 border-blue-200" },
  "carrier": { label: "By Carrier", icon: Signal, color: "bg-green-100 text-green-800 border-green-200" },
  "amenity": { label: "Amenities", icon: Zap, color: "bg-amber-100 text-amber-800 border-amber-200" },
  "family": { label: "Family", icon: Tent, color: "bg-pink-100 text-pink-800 border-pink-200" },
  "type": { label: "Campground Type", icon: Trees, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "geography": { label: "Geography", icon: Mountain, color: "bg-stone-100 text-stone-800 border-stone-200" },
  "trip": { label: "Road Trips", icon: MapPin, color: "bg-orange-100 text-orange-800 border-orange-200" },
};

const allCategories = ["all", ...Object.keys(categoryConfig)];

export default function ListsDirectory() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredLists = useMemo(() => {
    if (activeCategory === "all") return listsData as any[];
    return (listsData as any[]).filter(l => l.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <Signal className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg hidden sm:block" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs">Map</Button>
              </Link>
              <Link href="/route-finder">
                <Button variant="ghost" size="sm" className="text-xs">Routes</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Shareable Campground Lists
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated lists of the best campgrounds with cell service. Perfect for sharing in camping groups, Reddit, and social media.
          </p>
          <Badge className="mt-3 bg-green-100 text-green-800 border-green-200">
            {(listsData as any[]).length} Lists &middot; 150 Campgrounds
          </Badge>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {allCategories.map(cat => {
            const config = categoryConfig[cat];
            const isActive = activeCategory === cat;
            return (
              <Button
                key={cat}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`text-xs ${isActive ? "bg-green-700 hover:bg-green-800" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {config ? (
                  <>
                    <config.icon className="w-3.5 h-3.5 mr-1" />
                    {config.label}
                  </>
                ) : (
                  "All"
                )}
              </Button>
            );
          })}
        </div>

        {/* Lists grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list: any) => {
            const config = categoryConfig[list.category] || { label: "Other", icon: Star, color: "bg-gray-100 text-gray-800 border-gray-200" };
            const CatIcon = config.icon;
            return (
              <Link key={list.slug} href={`/list/${list.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-tight group-hover:text-green-700 transition-colors line-clamp-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {list.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {list.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        {list.count} campgrounds
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-green-200 text-green-700">
                        {list.avg_signal}/5 signal
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-700">
                        {list.avg_rws}/10 RWS
                      </Badge>
                      {list.state !== "ALL" && (
                        <Badge variant="outline" className="text-[10px]">
                          {list.state_full}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Want to explore all campgrounds on the interactive map?
          </p>
          <Link href="/">
            <Button className="bg-green-700 hover:bg-green-800">Open Map Explorer</Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-8 mt-10">
        <div className="container text-center">
          <p className="text-sm">&copy; 2026 SignalCamping &mdash; Find campgrounds where your phone works.</p>
        </div>
      </footer>
    </div>
  );
}
