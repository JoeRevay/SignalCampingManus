/**
 * StatsPanel — Quick overview statistics for the filtered dataset.
 */
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CheckCircle2, Tent, Waves, Zap } from "lucide-react";

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
      verified: campgrounds.filter(c => c.is_verified).length,
      tent: campgrounds.filter(c => c.tent_sites).length,
      waterfront: campgrounds.filter(c => c.waterfront).length,
      electric: campgrounds.filter(c => c.electric_hookups).length,
      states: new Set(campgrounds.map(c => c.state)).size,
    };
  }, [campgrounds]);

  if (!stats) return null;

  const items = [
    { icon: MapPin, label: "Campgrounds", value: stats.count.toLocaleString(), sub: `of ${totalCount.toLocaleString()}`, color: "text-green-700" },
    { icon: CheckCircle2, label: "Verified", value: stats.verified.toString(), sub: `${((stats.verified / stats.count) * 100).toFixed(0)}% of results`, color: "text-emerald-600" },
    { icon: Tent, label: "Tent Sites", value: stats.tent.toString(), sub: `${((stats.tent / stats.count) * 100).toFixed(0)}% of results`, color: "text-blue-600" },
    { icon: Waves, label: "Waterfront", value: stats.waterfront.toString(), sub: `${((stats.waterfront / stats.count) * 100).toFixed(0)}% of results`, color: "text-cyan-600" },
    { icon: Zap, label: "Electric", value: stats.electric.toString(), sub: `${((stats.electric / stats.count) * 100).toFixed(0)}% of results`, color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
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
