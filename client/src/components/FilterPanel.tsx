/**
 * FilterPanel — Advanced search filters for campground discovery.
 * Filters: carrier signal, waterfront, tent, electric, distance from lake/town,
 * campground type, elevation range, forest cover.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Filter, X, RotateCcw } from "lucide-react";

export interface Filters {
  searchTerm: string;
  state: string | null;
  verizonMin: string | null;    // "Strong" | "Moderate" | "Weak" | null
  attMin: string | null;
  tmobileMin: string | null;
  waterfront: boolean;
  tent: boolean;
  electric: boolean;
  rv: boolean;
  maxDistLake: number;
  maxDistTown: number;
  minElevation: number;
  maxElevation: number;
  minForestCover: number;
  campgroundType: string | null;
  minSignalScore: number;
}

export const DEFAULT_FILTERS: Filters = {
  searchTerm: "",
  state: null,
  verizonMin: null,
  attMin: null,
  tmobileMin: null,
  waterfront: false,
  tent: false,
  electric: false,
  rv: false,
  maxDistLake: 500,
  maxDistTown: 50,
  minElevation: 0,
  maxElevation: 4000,
  minForestCover: 0,
  campgroundType: null,
  minSignalScore: 1,
};

const SIGNAL_LEVELS = ["Strong", "Moderate", "Weak"];
const STATES = [
  { value: "MI", label: "Michigan" },
  { value: "OH", label: "Ohio" },
  { value: "PA", label: "Pennsylvania" },
  { value: "WI", label: "Wisconsin" },
  { value: "WV", label: "West Virginia" },
];
const CAMP_TYPES = [
  { value: "state_park", label: "State Park" },
  { value: "national_forest", label: "National Forest" },
  { value: "private", label: "Private" },
];

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterPanel({ filters, onChange, totalCount, filteredCount }: FilterPanelProps) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });
  const activeCount = countActiveFilters(filters);

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-green-700" />
            Filters
            {activeCount > 0 && (
              <Badge className="bg-green-100 text-green-700 text-xs">{activeCount} active</Badge>
            )}
          </CardTitle>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onChange({ ...DEFAULT_FILTERS })}>
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} campgrounds
        </p>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        {/* State */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">State</Label>
          <div className="flex flex-wrap gap-1.5">
            {STATES.map(s => (
              <button key={s.value}
                className={`px-2.5 py-1 rounded-md text-xs border transition ${
                  filters.state === s.value
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                }`}
                onClick={() => update({ state: filters.state === s.value ? null : s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Signal Strength */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Min Signal Score: {filters.minSignalScore}/5
          </Label>
          <Slider
            value={[filters.minSignalScore]}
            min={1} max={5} step={1}
            onValueChange={([v]) => update({ minSignalScore: v })}
          />
        </div>

        {/* Carrier filters */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Carrier Signal</Label>
          <div className="space-y-2">
            {([["verizonMin", "Verizon"], ["attMin", "AT&T"], ["tmobileMin", "T-Mobile"]] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16">{label}</span>
                <div className="flex gap-1">
                  {SIGNAL_LEVELS.map(level => (
                    <button key={level}
                      className={`px-2 py-0.5 rounded text-xs border transition ${
                        filters[key] === level
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-gray-500 border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => update({ [key]: filters[key] === level ? null : level } as any)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities toggles */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Amenities</Label>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["waterfront", "Waterfront"],
              ["tent", "Tent Sites"],
              ["electric", "Electric"],
              ["rv", "RV Sites"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Switch
                  checked={filters[key]}
                  onCheckedChange={(v) => update({ [key]: v } as any)}
                  className="scale-75"
                />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campground Type */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Campground Type</Label>
          <div className="flex flex-wrap gap-1.5">
            {CAMP_TYPES.map(t => (
              <button key={t.value}
                className={`px-2.5 py-1 rounded-md text-xs border transition ${
                  filters.campgroundType === t.value
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                }`}
                onClick={() => update({ campgroundType: filters.campgroundType === t.value ? null : t.value })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Distance to Lake */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
            Max Distance to Lake: {filters.maxDistLake >= 500 ? "Any" : `${filters.maxDistLake} mi`}
          </Label>
          <Slider
            value={[filters.maxDistLake]}
            min={1} max={500} step={5}
            onValueChange={([v]) => update({ maxDistLake: v })}
          />
        </div>

        {/* Distance to Town */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
            Max Distance to Town: {filters.maxDistTown >= 50 ? "Any" : `${filters.maxDistTown} mi`}
          </Label>
          <Slider
            value={[filters.maxDistTown]}
            min={1} max={50} step={1}
            onValueChange={([v]) => update({ maxDistTown: v })}
          />
        </div>

        {/* Elevation Range */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
            Elevation: {filters.minElevation}–{filters.maxElevation >= 4000 ? "Any" : filters.maxElevation} ft
          </Label>
          <Slider
            value={[filters.minElevation, filters.maxElevation]}
            min={0} max={4000} step={100}
            onValueChange={([min, max]) => update({ minElevation: min, maxElevation: max })}
          />
        </div>

        {/* Forest Cover */}
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
            Min Forest Cover: {filters.minForestCover}%
          </Label>
          <Slider
            value={[filters.minForestCover]}
            min={0} max={100} step={5}
            onValueChange={([v]) => update({ minForestCover: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function countActiveFilters(f: Filters): number {
  let count = 0;
  if (f.state) count++;
  if (f.verizonMin) count++;
  if (f.attMin) count++;
  if (f.tmobileMin) count++;
  if (f.waterfront) count++;
  if (f.tent) count++;
  if (f.electric) count++;
  if (f.rv) count++;
  if (f.maxDistLake < 500) count++;
  if (f.maxDistTown < 50) count++;
  if (f.minElevation > 0) count++;
  if (f.maxElevation < 4000) count++;
  if (f.minForestCover > 0) count++;
  if (f.campgroundType) count++;
  if (f.minSignalScore > 1) count++;
  return count;
}

/* ── Filter logic (exported for use in parent) ── */
export function applyFilters(data: any[], filters: Filters): any[] {
  const signalRank: Record<string, number> = { Strong: 3, Moderate: 2, Weak: 1, "No Signal": 0 };
  const minRank = (level: string | null) => level ? signalRank[level] || 0 : -1;

  return data.filter(cg => {
    // Search
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const searchable = `${cg.campground_name} ${cg.city} ${cg.nearest_lake_name} ${cg.nearest_town}`.toLowerCase();
      if (!searchable.includes(term)) return false;
    }
    // State
    if (filters.state && cg.state !== filters.state) return false;
    // Signal score
    if (cg.signal_confidence_score < filters.minSignalScore) return false;
    // Carrier minimums
    if (filters.verizonMin && signalRank[cg.verizon_signal] < minRank(filters.verizonMin)) return false;
    if (filters.attMin && signalRank[cg.att_signal] < minRank(filters.attMin)) return false;
    if (filters.tmobileMin && signalRank[cg.tmobile_signal] < minRank(filters.tmobileMin)) return false;
    // Amenities
    if (filters.waterfront && !cg.waterfront) return false;
    if (filters.tent && !cg.tent_sites) return false;
    if (filters.electric && !cg.electric_hookups) return false;
    if (filters.rv && !cg.rv_sites) return false;
    // Type
    if (filters.campgroundType && cg.campground_type !== filters.campgroundType) return false;
    // Distance
    if (filters.maxDistLake < 500 && cg.distance_to_lake_miles > filters.maxDistLake) return false;
    if (filters.maxDistTown < 50 && cg.distance_to_town_miles > filters.maxDistTown) return false;
    // Elevation
    if (cg.elevation_ft < filters.minElevation) return false;
    if (filters.maxElevation < 4000 && cg.elevation_ft > filters.maxElevation) return false;
    // Forest cover
    if (cg.forest_cover_percent < filters.minForestCover) return false;
    return true;
  });
}
