/**
 * CampgroundList — Sortable, paginated table of campgrounds.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, Tent, Truck, Zap, Waves } from "lucide-react";

interface CampgroundData {
  campground_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  campground_type: string;
  tent_sites: boolean;
  rv_sites: boolean;
  electric_hookups: boolean;
  waterfront: boolean;
  verizon_signal: string;
  att_signal: string;
  tmobile_signal: string;
  signal_confidence_score: number;
  nearest_lake_name: string;
  distance_to_lake_miles: number;
  nearest_town: string;
  distance_to_town_miles: number;
  elevation_ft: number;
  forest_cover_percent: number;
  marker_color: string;
}

interface CampgroundListProps {
  campgrounds: CampgroundData[];
  onSelect: (cg: CampgroundData) => void;
}

const PAGE_SIZE = 20;

const signalBadge = (s: string) => {
  const c = s === "Strong" ? "bg-green-100 text-green-800" :
    s === "Moderate" ? "bg-yellow-100 text-yellow-800" :
    s === "Weak" ? "bg-orange-100 text-orange-800" :
    "bg-red-100 text-red-800";
  return <span className={`text-xs px-1.5 py-0.5 rounded ${c}`}>{s}</span>;
};

export default function CampgroundList({ campgrounds, onSelect }: CampgroundListProps) {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string>("campground_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const d = [...campgrounds];
    d.sort((a, b) => {
      const av = a[sortField as keyof CampgroundData];
      const bv = b[sortField as keyof CampgroundData];
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return 0;
    });
    return d;
  }, [campgrounds, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };

  // Reset page when campgrounds change
  useMemo(() => setPage(0), [campgrounds.length]);

  const columns = [
    { key: "campground_name", label: "Name", w: "min-w-[180px]" },
    { key: "city", label: "Location", w: "min-w-[120px]" },
    { key: "campground_type", label: "Type", w: "" },
    { key: "elevation_ft", label: "Elev", w: "" },
    { key: "nearest_lake_name", label: "Lake", w: "min-w-[120px]" },
    { key: "distance_to_town_miles", label: "Town Dist", w: "" },
    { key: "forest_cover_percent", label: "Forest", w: "" },
    { key: "verizon_signal", label: "VZW", w: "" },
    { key: "att_signal", label: "ATT", w: "" },
    { key: "tmobile_signal", label: "TMO", w: "" },
    { key: "signal_confidence_score", label: "Score", w: "" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Campground Results</CardTitle>
        <CardDescription>
          {sorted.length === 0
            ? "No campgrounds match your filters"
            : `Showing ${Math.min(page * PAGE_SIZE + 1, sorted.length)}–${Math.min((page + 1) * PAGE_SIZE, sorted.length)} of ${sorted.length.toLocaleString()}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                {columns.map(col => (
                  <th key={col.key}
                    className={`p-2 text-left font-medium text-gray-500 text-xs uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition select-none whitespace-nowrap ${col.w}`}
                    onClick={() => toggleSort(col.key)}>
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key && <ArrowUpDown className="w-3 h-3 text-green-700" />}
                    </span>
                  </th>
                ))}
                <th className="p-2 text-center font-medium text-gray-500 text-xs uppercase tracking-wide">Amenities</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((cg, idx) => (
                <tr key={idx}
                  className="border-b hover:bg-green-50/40 transition cursor-pointer"
                  onClick={() => onSelect(cg)}>
                  <td className="p-2 font-medium text-green-800 whitespace-nowrap">{cg.campground_name}</td>
                  <td className="p-2 whitespace-nowrap text-gray-600">{cg.city}, {cg.state}</td>
                  <td className="p-2"><Badge variant="outline" className="text-xs">{cg.campground_type.replace(/_/g, " ")}</Badge></td>
                  <td className="p-2 text-right tabular-nums text-gray-600">{cg.elevation_ft.toLocaleString()}</td>
                  <td className="p-2 text-xs text-gray-600 whitespace-nowrap">{cg.nearest_lake_name}</td>
                  <td className="p-2 text-right tabular-nums text-gray-600">{cg.distance_to_town_miles} mi</td>
                  <td className="p-2 text-right tabular-nums text-gray-600">{cg.forest_cover_percent}%</td>
                  <td className="p-2">{signalBadge(cg.verizon_signal)}</td>
                  <td className="p-2">{signalBadge(cg.att_signal)}</td>
                  <td className="p-2">{signalBadge(cg.tmobile_signal)}</td>
                  <td className="p-2 text-center"><Badge className="bg-emerald-100 text-emerald-800 text-xs">{cg.signal_confidence_score}★</Badge></td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      {cg.tent_sites && <Tent className="w-3.5 h-3.5 text-green-600" />}
                      {cg.rv_sites && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                      {cg.electric_hookups && <Zap className="w-3.5 h-3.5 text-amber-600" />}
                      {cg.waterfront && <Waves className="w-3.5 h-3.5 text-cyan-600" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
