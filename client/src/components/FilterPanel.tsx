/**
 * FilterPanel — Filters for campground discovery.
 * Adapted for OSM data: state, type, amenities, verified status, search.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Filter, X, RotateCcw } from "lucide-react";

export interface Filters {
  searchTerm: string;
  state: string | null;
  waterfront: boolean;
  tent: boolean;
  electric: boolean;
  rv: boolean;
  campgroundType: string | null;
  verifiedOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  searchTerm: "",
  state: null,
  waterfront: false,
  tent: false,
  electric: false,
  rv: false,
  campgroundType: null,
  verifiedOnly: false,
};

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  states: { code: string; name: string; count: number }[];
  types: { value: string; label: string; count: number }[];
  className?: string;
}

export default function FilterPanel({ filters, onChange, states, types, className }: FilterPanelProps) {
  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const activeCount = countActiveFilters(filters);

  return (
    <Card className={`border-gray-100 shadow-sm ${className || ""}`}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4 text-green-700" /> Filters
          {activeCount > 0 && (
            <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] px-1.5">
              {activeCount}
            </Badge>
          )}
        </CardTitle>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 h-7" onClick={() => onChange({ ...DEFAULT_FILTERS })}>
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Verified Only */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Verified Only
          </Label>
          <Switch checked={filters.verifiedOnly} onCheckedChange={v => update({ verifiedOnly: v })} />
        </div>

        {/* State */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">State</Label>
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`px-2.5 py-1 rounded-md text-xs border transition ${
                !filters.state ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
              }`}
              onClick={() => update({ state: null })}
            >
              All
            </button>
            {states.map(s => (
              <button key={s.code}
                className={`px-2.5 py-1 rounded-md text-xs border transition ${
                  filters.state === s.code ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                }`}
                onClick={() => update({ state: filters.state === s.code ? null : s.code })}
              >
                {s.name} ({s.count})
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Amenities</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "tent" as const, label: "Tent Sites" },
              { key: "rv" as const, label: "RV Sites" },
              { key: "electric" as const, label: "Electric" },
              { key: "waterfront" as const, label: "Waterfront" },
            ].map(a => (
              <div key={a.key} className="flex items-center justify-between">
                <Label className="text-xs text-gray-600">{a.label}</Label>
                <Switch checked={filters[a.key]} onCheckedChange={v => update({ [a.key]: v })} />
              </div>
            ))}
          </div>
        </div>

        {/* Campground Type */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Type</Label>
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`px-2.5 py-1 rounded-md text-xs border transition ${
                !filters.campgroundType ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
              }`}
              onClick={() => update({ campgroundType: null })}
            >
              All
            </button>
            {types.map(t => (
              <button key={t.value}
                className={`px-2.5 py-1 rounded-md text-xs border transition ${
                  filters.campgroundType === t.value ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                }`}
                onClick={() => update({ campgroundType: filters.campgroundType === t.value ? null : t.value })}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function countActiveFilters(f: Filters): number {
  let count = 0;
  if (f.state) count++;
  if (f.waterfront) count++;
  if (f.tent) count++;
  if (f.electric) count++;
  if (f.rv) count++;
  if (f.campgroundType) count++;
  if (f.verifiedOnly) count++;
  return count;
}

export function applyFilters(data: any[], filters: Filters): any[] {
  return data.filter(cg => {
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const searchable = `${cg.campground_name} ${cg.city || ""} ${cg.state || ""} ${cg.operator || ""} ${cg.campground_type || ""}`.toLowerCase();
      if (!searchable.includes(term)) return false;
    }
    if (filters.state && cg.state !== filters.state) return false;
    if (filters.verifiedOnly && !cg.is_verified) return false;
    if (filters.waterfront && !cg.waterfront) return false;
    if (filters.tent && !cg.tent_sites) return false;
    if (filters.electric && !cg.electric_hookups) return false;
    if (filters.rv && !cg.rv_sites) return false;
    if (filters.campgroundType && cg.campground_type !== filters.campgroundType) return false;
    return true;
  });
}
