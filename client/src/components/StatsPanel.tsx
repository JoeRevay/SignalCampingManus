/**
 * StatsPanel — Quick overview statistics for the filtered dataset.
 */
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Signal, MapPin, Mountain, Trees, Waves, Navigation } from "lucide-react";

interface StatsPanelProps {
  campgrounds: any[];
  totalCount: number;
}

export default function StatsPanel({ campgrounds, totalCount }: StatsPanelProps) {
  const stats = useMemo(() => {
    if (campgrounds.length === 0) return null;
    const len = campgrounds.length;
    return {
      count: len,
      avgSignal: (campgrounds.reduce((s, c) => s + c.signal_confidence_score, 0) / len).toFixed(1),
      avgElev: Math.round(campgrounds.reduce((s, c) => s + c.elevation_ft, 0) / len),
      avgForest: Math.round(campgrounds.reduce((s, c) => s + c.forest_cover_percent, 0) / len),
      waterfront: campgrounds.filter(c => c.waterfront).length,
      avgDistTown: (campgrounds.reduce((s, c) => s + c.distance_to_town_miles, 0) / len).toFixed(1),
      states: new Set(campgrounds.map(c => c.state)).size,
    };
  }, [campgrounds]);

  if (!stats) return null;

  const items = [
    { icon: MapPin, label: "Campgrounds", value: stats.count.toLocaleString(), sub: `of ${totalCount.toLocaleString()}`, color: "text-green-700" },
    { icon: Signal, label: "Avg Signal", value: `${stats.avgSignal}/5`, sub: "confidence", color: "text-blue-600" },
    { icon: Mountain, label: "Avg Elevation", value: `${stats.avgElev.toLocaleString()} ft`, sub: "above sea level", color: "text-violet-600" },
    { icon: Trees, label: "Avg Forest", value: `${stats.avgForest}%`, sub: "tree cover", color: "text-emerald-600" },
    { icon: Waves, label: "Waterfront", value: stats.waterfront.toString(), sub: `${((stats.waterfront / stats.count) * 100).toFixed(0)}% of results`, color: "text-cyan-600" },
    { icon: Navigation, label: "Avg to Town", value: `${stats.avgDistTown} mi`, sub: "nearest town", color: "text-rose-600" },
  ];

  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map(item => (
        <Card key={item.label} className="border-gray-100">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</span>
            </div>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-400">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
