/**
 * ShareableList — Individual shareable "Best of" / "Top 10" list page
 *
 * Design: Clean, screenshot-friendly layout optimized for social sharing.
 * Mobile-first with comparison table, summary cards, and OG-ready metadata.
 */
import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Signal, MapPin, Wifi, Tent, Zap, Waves, Star, ArrowLeft,
  ExternalLink, Share2, Trophy, Laptop, Trees, Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";

import listsData from "@/data/shareable_lists.json";
import campgroundsData from "@/data/mvp_campgrounds.json";

const allCampgrounds = (campgroundsData as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || cg.tent_sites === "True",
  rv_sites: cg.rv_sites === true || cg.rv_sites === "True",
  electric_hookups: cg.electric_hookups === true || cg.electric_hookups === "True",
  waterfront: cg.waterfront === true || cg.waterfront === "True",
}));

const signalColor: Record<string, string> = {
  Strong: "text-green-600 bg-green-50 border-green-200",
  Moderate: "text-amber-600 bg-amber-50 border-amber-200",
  Weak: "text-red-600 bg-red-50 border-red-200",
  "No Signal": "text-gray-600 bg-gray-100 border-gray-300",
};

const signalIcon: Record<string, string> = {
  Strong: "████",
  Moderate: "███░",
  Weak: "██░░",
  "No Signal": "░░░░",
};

const categoryIcons: Record<string, any> = {
  "top-rated": Trophy,
  "remote-work": Laptop,
  "waterfront": Waves,
  "carrier": Signal,
  "amenity": Zap,
  "family": Tent,
  "type": Trees,
  "geography": Mountain,
  "trip": MapPin,
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ShareableList() {
  const { slug } = useParams<{ slug: string }>();

  const listData = useMemo(() => {
    return (listsData as any[]).find(l => l.slug === slug);
  }, [slug]);

  const campgrounds = useMemo(() => {
    if (!listData) return [];
    const names = new Set(listData.campground_ids);
    return allCampgrounds
      .filter(cg => names.has(cg.campground_name))
      .sort((a, b) => b.mvp_score - a.mvp_score);
  }, [listData]);

  if (!listData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">List Not Found</h2>
            <p className="text-muted-foreground mb-4">This shareable list doesn't exist.</p>
            <Link href="/lists">
              <Button variant="outline">Browse All Lists</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[listData.category] || Star;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: listData.title, text: listData.description, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

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
              <Link href="/lists">
                <Button variant="ghost" size="sm" className="text-xs">All Lists</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs">Map</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6 max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <span>/</span>
          <Link href="/lists" className="hover:text-green-700">Lists</Link>
          <span>/</span>
          <span className="text-foreground truncate">{listData.title}</span>
        </nav>

        {/* Hero Card — screenshot-friendly */}
        <div className="bg-gradient-to-br from-green-800 via-green-900 to-emerald-950 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full" />
            <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <CategoryIcon className="w-5 h-5 text-green-300" />
              <Badge className="bg-green-700/50 text-green-200 border-green-600/50 text-xs">
                {listData.category.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Badge>
              {listData.state !== "ALL" && (
                <Badge className="bg-green-700/50 text-green-200 border-green-600/50 text-xs">
                  {listData.state_full}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {listData.title}
            </h1>
            <p className="text-green-100/80 text-sm sm:text-base leading-relaxed max-w-2xl mb-6">
              {listData.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{listData.count}</div>
                <div className="text-xs text-green-200">Campgrounds</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{listData.avg_signal}<span className="text-base">/5</span></div>
                <div className="text-xs text-green-200">Avg Signal</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{listData.avg_rws}<span className="text-base">/10</span></div>
                <div className="text-xs text-green-200">Avg Remote Work</div>
              </div>
            </div>
          </div>
        </div>

        {/* Share button */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" /> Share This List
          </Button>
        </div>

        {/* Campground Cards */}
        <div className="space-y-4">
          {campgrounds.map((cg, i) => (
            <Card key={cg.campground_name} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Rank badge */}
                  <div className="sm:w-16 bg-gradient-to-b from-green-600 to-green-700 flex items-center justify-center py-3 sm:py-0">
                    <span className="text-white font-bold text-xl">#{i + 1}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <Link href={`/campground/${slugify(cg.campground_name)}`}>
                          <h3 className="font-bold text-lg hover:text-green-700 transition-colors cursor-pointer" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {cg.campground_name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {cg.city}, {cg.state_full || cg.state}
                          {cg.waterfront && (
                            <Badge variant="outline" className="text-[10px] ml-2 border-blue-200 text-blue-600 bg-blue-50">
                              <Waves className="w-3 h-3 mr-0.5" /> Waterfront
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Signal + RWS badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-0.5">Signal</div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 font-bold">
                            {cg.signal_confidence_score}/5
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-0.5">RWS</div>
                          <Badge className={`font-bold ${cg.remote_work_score >= 7 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : cg.remote_work_score >= 5 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                            {cg.remote_work_score}/10
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Carrier signals */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { label: "Verizon", value: cg.verizon_signal },
                        { label: "AT&T", value: cg.att_signal },
                        { label: "T-Mobile", value: cg.tmobile_signal },
                      ].map(carrier => (
                        <div key={carrier.label} className={`rounded-md border px-2.5 py-1.5 text-center ${signalColor[carrier.value] || "text-gray-500 bg-gray-50 border-gray-200"}`}>
                          <div className="text-[10px] font-medium opacity-70">{carrier.label}</div>
                          <div className="text-xs font-bold font-mono">{signalIcon[carrier.value] || "?"}</div>
                          <div className="text-[10px]">{carrier.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Amenities row */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {cg.tent_sites && (
                        <Badge variant="outline" className="text-[10px] border-green-200 text-green-700 bg-green-50/50">
                          <Tent className="w-3 h-3 mr-0.5" /> Tent
                        </Badge>
                      )}
                      {cg.rv_sites && (
                        <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50/50">
                          RV
                        </Badge>
                      )}
                      {cg.electric_hookups && (
                        <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50/50">
                          <Zap className="w-3 h-3 mr-0.5" /> Electric
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] border-stone-200 text-stone-600">
                        <Mountain className="w-3 h-3 mr-0.5" /> {cg.elevation_ft?.toLocaleString()} ft
                      </Badge>
                      {cg.nearest_lake_name && (
                        <Badge variant="outline" className="text-[10px] border-cyan-200 text-cyan-700 bg-cyan-50/50">
                          <Waves className="w-3 h-3 mr-0.5" /> {cg.nearest_lake_name}
                        </Badge>
                      )}
                    </div>

                    {/* Action links */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                      <Link href={`/campground/${slugify(cg.campground_name)}`}>
                        <span className="text-xs text-green-700 hover:text-green-800 font-medium cursor-pointer">View Details →</span>
                      </Link>
                      {cg.reservation_link && (
                        <a href={cg.reservation_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          Reserve <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Explore More Campgrounds
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use our interactive map to discover 150 campgrounds with verified cellular coverage data.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button className="bg-green-700 hover:bg-green-800">Open Map Explorer</Button>
            </Link>
            <Link href="/lists">
              <Button variant="outline">Browse All Lists</Button>
            </Link>
          </div>
        </div>

        {/* Related lists */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            More Lists You Might Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(listsData as any[])
              .filter(l => l.slug !== slug)
              .slice(0, 4)
              .map(l => (
                <Link key={l.slug} href={`/list/${l.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{l.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{l.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{l.count} campgrounds</Badge>
                        <Badge variant="outline" className="text-[10px]">{l.avg_signal}/5 signal</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
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
