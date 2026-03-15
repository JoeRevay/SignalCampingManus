/**
 * CampgroundDetail — Full detail view for a single campground.
 * Shows signal coverage, amenities, geography, and links.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Signal, MapPin, Tent, Truck, Zap, Waves, Mountain,
  Trees, Navigation, ArrowLeft, ExternalLink, Star
} from "lucide-react";

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
  reservation_link: string;
  website: string;
}

interface CampgroundDetailProps {
  campground: CampgroundData;
  onBack: () => void;
}

const signalColor = (s: string) =>
  s === "Strong" ? "bg-green-100 text-green-800 border-green-200" :
  s === "Moderate" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
  s === "Weak" ? "bg-orange-100 text-orange-800 border-orange-200" :
  "bg-red-100 text-red-800 border-red-200";

const signalPercent = (s: string) =>
  s === "Strong" ? 100 : s === "Moderate" ? 66 : s === "Weak" ? 33 : 5;

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin", WV: "West Virginia",
};

export default function CampgroundDetail({ campground: cg, onBack }: CampgroundDetailProps) {
  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to results
        </Button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{cg.campground_name}</h2>
            <p className="text-gray-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4" />
              {cg.city}, {STATE_NAMES[cg.state] || cg.state}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{cg.campground_type.replace(/_/g, " ")}</Badge>
              <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                {cg.signal_confidence_score}/5 Signal Score
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {cg.reservation_link && (
              <a href={cg.reservation_link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Reserve
                </Button>
              </a>
            )}
            {cg.website && (
              <a href={cg.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Website
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Coverage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Signal className="w-4 h-4 text-blue-600" /> Cellular Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              ["Verizon", cg.verizon_signal],
              ["AT&T", cg.att_signal],
              ["T-Mobile", cg.tmobile_signal],
            ] as const).map(([carrier, signal]) => (
              <div key={carrier} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{carrier}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${signalColor(signal)}`}>{signal}</span>
                </div>
                <Progress value={signalPercent(signal)} className="h-2" />
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Confidence</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < cg.signal_confidence_score ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Amenities & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {([
                [cg.tent_sites, "Tent Camping", Tent, "green"],
                [cg.rv_sites, "RV Sites", Truck, "blue"],
                [cg.electric_hookups, "Electric Hookups", Zap, "amber"],
                [cg.waterfront, "Waterfront", Waves, "cyan"],
              ] as const).map(([available, label, Icon, color]) => (
                <div key={label} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  available ? "bg-gray-50 border-gray-200" : "bg-gray-50/50 border-gray-100 opacity-50"
                }`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{available ? "Available" : "Not available"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geography */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mountain className="w-4 h-4 text-violet-600" /> Geography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-violet-50 rounded-lg">
                <p className="text-xs text-violet-600 font-medium">Elevation</p>
                <p className="text-lg font-bold text-violet-800">{cg.elevation_ft.toLocaleString()} ft</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Forest Cover</p>
                <p className="text-lg font-bold text-green-800">{cg.forest_cover_percent}%</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-cyan-600" /> Nearest Lake
                </span>
                <span className="font-medium">{cg.nearest_lake_name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Distance to Lake</span>
                <span className="font-medium">{cg.distance_to_lake_miles} mi</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-rose-600" /> Nearest Town
                </span>
                <span className="font-medium">{cg.nearest_town}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Distance to Town</span>
                <span className="font-medium">{cg.distance_to_town_miles} mi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Latitude</p>
                <p className="text-sm font-mono font-bold">{cg.latitude.toFixed(4)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Longitude</p>
                <p className="text-sm font-mono font-bold">{cg.longitude.toFixed(4)}</p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps?q=${cg.latitude},${cg.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open in Google Maps
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
