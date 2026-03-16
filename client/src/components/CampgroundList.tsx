/**
 * CampgroundList — Sortable, paginated list of campgrounds.
 * Adapted for OSM data with verified badge.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, Tent, Truck, Zap, Waves, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

interface CampgroundListProps {
  campgrounds: any[];
  onSelect?: (cg: any) => void;
}

const PAGE_SIZE = 25;
type SortKey = "name" | "state" | "type";

export default function CampgroundList({ campgrounds, onSelect }: CampgroundListProps) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const arr = [...campgrounds];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.campground_name.localeCompare(b.campground_name); break;
        case "state": cmp = a.state.localeCompare(b.state); break;
        case "type": cmp = (a.campground_type || "").localeCompare(b.campground_type || ""); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [campgrounds, sortKey, sortAsc]);

  useMemo(() => setPage(0), [campgrounds.length]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  return (
    <Card className="border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Campgrounds</CardTitle>
            <CardDescription className="text-xs">{campgrounds.length} results</CardDescription>
          </div>
          <div className="flex gap-1">
            {(["name", "state", "type"] as SortKey[]).map(k => (
              <Button key={k} variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => toggleSort(k)}>
                <ArrowUpDown className="w-3 h-3 mr-1" />
                {k === "name" ? "Name" : k === "state" ? "State" : "Type"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {pageData.map((cg: any, i: number) => {
            const slug = cg.slug || cg.campground_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <Link key={slug + i} href={`/campground/${slug}`}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{cg.campground_name}</h3>
                      {cg.is_verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {cg.city ? `${cg.city}, ` : ""}{cg.state_full || cg.state}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{cg.campground_type}</Badge>
                  <div className="flex gap-1 shrink-0">
                    {cg.tent_sites && <Tent className="w-3.5 h-3.5 text-green-600" />}
                    {cg.rv_sites && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                    {cg.electric_hookups && <Zap className="w-3.5 h-3.5 text-amber-600" />}
                    {cg.waterfront && <Waves className="w-3.5 h-3.5 text-cyan-600" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
