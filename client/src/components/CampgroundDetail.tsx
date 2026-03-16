/**
 * CampgroundDetail — Detail sidebar panel for a selected campground.
 * Adapted for OSM data with verified badge.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Tent, Truck, Zap, Waves, ExternalLink, X,
  CheckCircle2, Globe, Phone
} from "lucide-react";
import { Link } from "wouter";

interface CampgroundDetailProps {
  campground: any;
  onClose: () => void;
}

export default function CampgroundDetail({ campground: cg, onClose }: CampgroundDetailProps) {
  if (!cg) return null;
  const slug = cg.slug || cg.campground_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-gray-900 leading-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              {cg.campground_name}
            </h2>
            {cg.is_verified && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {cg.city ? `${cg.city}, ` : ""}{cg.state_full || cg.state}
          </p>
          <Badge variant="outline" className="mt-1 text-xs">{cg.campground_type}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              { has: cg.tent_sites, icon: Tent, label: "Tent Sites", color: "text-green-600" },
              { has: cg.rv_sites, icon: Truck, label: "RV Sites", color: "text-blue-600" },
              { has: cg.electric_hookups, icon: Zap, label: "Electric", color: "text-amber-600" },
              { has: cg.waterfront, icon: Waves, label: "Waterfront", color: "text-cyan-600" },
            ].map(a => (
              <div key={a.label} className={`flex items-center gap-2 text-sm ${a.has ? a.color : "text-gray-300"}`}>
                <a.icon className="w-4 h-4" />
                <span>{a.label}</span>
                {a.has === true && <CheckCircle2 className="w-3 h-3" />}
              </div>
            ))}
            {cg.showers === true && <div className="flex items-center gap-2 text-sm text-purple-600"><span>🚿</span> Showers</div>}
            {cg.drinking_water === true && <div className="flex items-center gap-2 text-sm text-blue-600"><span>💧</span> Drinking Water</div>}
            {cg.toilets === true && <div className="flex items-center gap-2 text-sm text-gray-600"><span>🚻</span> Toilets</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cg.website && (
            <a href={cg.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          )}
          {cg.reservation_link && (
            <a href={cg.reservation_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> Reservations
            </a>
          )}
          {cg.phone && (
            <a href={`tel:${cg.phone}`} className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5" /> {cg.phone}
            </a>
          )}
          {cg.operator && <p className="text-xs text-gray-500">Operator: {cg.operator}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" /> Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Latitude</p>
              <p className="text-sm font-mono font-bold">{cg.latitude?.toFixed(4)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Longitude</p>
              <p className="text-sm font-mono font-bold">{cg.longitude?.toFixed(4)}</p>
            </div>
          </div>
          <a href={`https://www.google.com/maps?q=${cg.latitude},${cg.longitude}`}
            target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open in Google Maps
            </Button>
          </a>
        </CardContent>
      </Card>

      <Link href={`/campground/${slug}`}>
        <Button className="w-full bg-green-700 hover:bg-green-800">View Full Details</Button>
      </Link>
    </div>
  );
}
