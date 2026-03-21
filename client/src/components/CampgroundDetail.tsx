/**
 * CampgroundDetail — Detail sidebar panel for a selected campground.
 * Adapted for OSM data with verified badge.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Tent, Truck, Zap, Waves, ExternalLink, X,
  CheckCircle2, Globe, Phone, Signal, Wifi, HelpCircle,
  Briefcase, Building2, Route, Info
} from "lucide-react";
import { getCarrierLikelihood, LIKELIHOOD_STYLES, CARRIER_DISCLAIMER, type CarrierLikelihood } from "@/lib/carrierLikelihood";
import { Link } from "wouter";
import AffiliateRecommendations from "@/components/AffiliateRecommendations";

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

      {/* SEO content block */}
      {(() => {
        const score = cg.signal_score ?? 0;
        const stateName = cg.state_full || cg.state;
        const strengthLabel = score >= 70 ? "strong" : score >= 40 ? "moderate" : "weak";
        const usability = score >= 70
          ? "video calls, streaming, and remote work should all work reliably here"
          : score >= 40
          ? "basic calls and browsing should work, though streaming or video calls may be inconsistent"
          : "connectivity will be unreliable — offline-first tools are recommended";
        const rwVerdict = score >= 70
          ? "a good option for consistent connectivity"
          : score >= 40
          ? "workable if you plan around connectivity gaps"
          : "not recommended for remote work or data-heavy tasks";
        const townName = cg.nearest_town ? cg.nearest_town.replace(/,\s*[A-Z]{2}$/, "").trim() : "";
        const nearTown = townName ? ` near ${townName}` : "";
        return (
          <div className="text-sm text-gray-600 space-y-2 py-1 border-t border-b border-gray-100">
            <p>Looking for cell service at {cg.campground_name}{nearTown} in {stateName}? Here&rsquo;s what you can realistically expect based on signal data and nearby coverage.</p>
            <p>Signal strength here is generally <strong>{strengthLabel}</strong>. This means {usability}.</p>
            <p>If you&rsquo;re planning to work remotely or rely on mobile data, this campground is <strong>{rwVerdict}</strong>.</p>
          </div>
        );
      })()}

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

      {/* Cell Signal & Remote Work */}
      <Card className="border-indigo-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Signal className="w-4 h-4 text-indigo-600" /> Cell Signal & Remote Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Signal Score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Signal Score</span>
            <span className={`text-sm font-bold ${
              (cg.signal_score ?? 0) >= 70 ? 'text-green-600' :
              (cg.signal_score ?? 0) >= 40 ? 'text-amber-500' : 'text-red-500'
            }`}>
              {cg.signal_score ?? '—'}/100
              <span className="text-xs font-normal ml-1">
                {(cg.signal_score ?? 0) >= 70 ? 'Good' : (cg.signal_score ?? 0) >= 40 ? 'Fair' : 'Poor'}
              </span>
            </span>
          </div>

          {/* Remote Work Score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Remote Work
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {cg.remote_work_score != null ? Math.round(cg.remote_work_score) : '—'}/100
            </span>
          </div>

          {/* Carrier Likelihood */}
          <div className="space-y-1.5">
            <span className="text-xs text-gray-500">Carrier Likelihood</span>
            {(() => {
              const lk = getCarrierLikelihood(cg);
              const carriers: { name: string; level: CarrierLikelihood }[] = [
                { name: 'Verizon', level: lk.verizon },
                { name: 'AT&T', level: lk.att },
                { name: 'T-Mobile', level: lk.tmobile },
              ];
              return (
                <div className="grid grid-cols-3 gap-1.5">
                  {carriers.map(c => {
                    const style = LIKELIHOOD_STYLES[c.level];
                    return (
                      <div key={c.name} className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${style.bgClass} ${style.textClass}`}>
                        {c.level === 'Unknown' ? <HelpCircle className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                        <span className="truncate">{c.name}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-400 leading-tight">
            <Info className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />
            {CARRIER_DISCLAIMER}
          </p>

          {/* Distance info */}
          {(cg.nearest_town || cg.distance_to_highway_miles != null) && (
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              {cg.nearest_town && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Nearest Town
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {cg.nearest_town}{cg.distance_to_town_miles != null ? ` (${cg.distance_to_town_miles.toFixed(1)} mi)` : ''}
                  </span>
                </div>
              )}
              {cg.distance_to_highway_miles != null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Route className="w-3 h-3" /> Nearest Highway
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {cg.distance_to_highway_miles.toFixed(1)} mi
                  </span>
                </div>
              )}
            </div>
          )}
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

      {/* Remote Work Verdict */}
      {(() => {
        const score = cg.signal_score ?? 0;
        const verdict = score >= 70
          ? { label: "Good", color: "text-green-700 bg-green-50 border-green-200", desc: "This campground offers reliable enough signal for video calls, file uploads, and day-to-day remote work." }
          : score >= 40
          ? { label: "Moderate", color: "text-amber-700 bg-amber-50 border-amber-200", desc: "Signal is usable for calls and light browsing but may struggle with video conferencing or large data transfers." }
          : { label: "Poor", color: "text-red-700 bg-red-50 border-red-200", desc: "Signal is weak or unreliable. Plan to work offline and sync when you have connectivity." };
        return (
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" /> Remote Work Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${verdict.color}`}>{verdict.label}</span>
              <p className="text-xs text-gray-600">{verdict.desc}</p>
            </CardContent>
          </Card>
        );
      })()}

      <AffiliateRecommendations campground={cg} />

      <Link href={`/campground/${slug}`}>
        <Button className="w-full bg-green-700 hover:bg-green-800">View Full Details</Button>
      </Link>

      {/* State browse link */}
      <p className="text-xs text-center text-gray-500">
        <Link href={`/campgrounds/${cg.state?.toLowerCase()}`} className="text-green-700 hover:underline">
          View more campgrounds in {cg.state_full || cg.state}
        </Link>
      </p>
    </div>
  );
}
