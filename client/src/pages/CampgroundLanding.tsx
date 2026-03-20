/**
 * CampgroundLanding — Individual campground detail page.
 * Uses OSM data + verified MVP subset. No signal fields.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Signal, MapPin, Tent, Truck, Zap, Waves,
  Navigation, ArrowLeft, ExternalLink,
  ChevronRight, Compass, CheckCircle2,
  Info, Globe, Wifi, HelpCircle,
  Briefcase, Building2, Route
} from "lucide-react";
import { getCarrierLikelihood, LIKELIHOOD_STYLES, CARRIER_DISCLAIMER, type CarrierLikelihood } from "@/lib/carrierLikelihood";
import CamperSignalReports from "@/components/CamperSignalReports";
import SiteHeader from "@/components/SiteHeader";
import top100Data from "@/data/top100_seo.json";
import mvpData from "@/data/mvp_campgrounds.json";
import { MapView } from "@/components/Map";

const parseBool = (v: any) => v === true || v === "True" || v === "Yes";

// Merge top100 and MVP data, preferring MVP (has verified details)
const allCampgrounds = (() => {
  const mvp = (mvpData as any[]).map(cg => ({
    ...cg,
    tent_sites: parseBool(cg.tent_sites),
    rv_sites: parseBool(cg.rv_sites),
    electric_hookups: parseBool(cg.electric_hookups),
    waterfront: parseBool(cg.waterfront),
  }));
  const mvpSlugs = new Set(mvp.map((c: any) => c.slug));
  const top100Only = (top100Data as any[]).filter(c => !mvpSlugs.has(c.slug)).map(cg => ({
    ...cg,
    tent_sites: parseBool(cg.tent_sites),
    rv_sites: parseBool(cg.rv_sites),
    electric_hookups: parseBool(cg.electric_hookups),
    waterfront: parseBool(cg.waterfront),
  }));
  return [...mvp, ...top100Only];
})();

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

function generateDescription(cg: any): string {
  const state = STATE_NAMES[cg.state] || cg.state;
  const amenities: string[] = [];
  if (cg.tent_sites) amenities.push("tent camping");
  if (cg.rv_sites) amenities.push("RV sites");
  if (cg.electric_hookups) amenities.push("electric hookups");
  if (cg.waterfront) amenities.push("waterfront access");
  const amenityStr = amenities.length > 0 ? ` offering ${amenities.join(", ")}` : "";
  return `${cg.campground_name} is a ${(cg.campground_type || "campground").replace(/_/g, " ")} in ${cg.city || ""} ${state}${amenityStr}. ` +
    (cg.operator ? `Operated by ${cg.operator}. ` : "") +
    (cg.is_verified ? "This campground has been verified against official sources." : "Location data from OpenStreetMap.");
}

function generateStructuredData(cg: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Campground",
    name: cg.campground_name,
    description: generateDescription(cg),
    address: {
      "@type": "PostalAddress",
      addressLocality: cg.city || "",
      addressRegion: STATE_NAMES[cg.state] || cg.state,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: cg.latitude,
      longitude: cg.longitude,
    },
    url: cg.website || undefined,
    amenityFeature: [
      ...(cg.tent_sites ? [{ "@type": "LocationFeatureSpecification", name: "Tent Camping", value: true }] : []),
      ...(cg.rv_sites ? [{ "@type": "LocationFeatureSpecification", name: "RV Sites", value: true }] : []),
      ...(cg.electric_hookups ? [{ "@type": "LocationFeatureSpecification", name: "Electric Hookups", value: true }] : []),
      ...(cg.waterfront ? [{ "@type": "LocationFeatureSpecification", name: "Waterfront", value: true }] : []),
    ],
  };
}

export default function CampgroundLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const cg = useMemo(() => allCampgrounds.find((c: any) => c.slug === slug), [slug]);

  const related = useMemo(() => {
    if (!cg) return [];
    return allCampgrounds
      .filter((c: any) => c.state === cg.state && c.slug !== cg.slug)
      .slice(0, 6);
  }, [cg]);

  const nearby = useMemo(() => {
    if (!cg) return [];
    return allCampgrounds
      .filter((c: any) => c.state !== cg.state && c.slug !== cg.slug)
      .sort((a: any, b: any) => {
        const distA = Math.abs(a.latitude - cg.latitude) + Math.abs(a.longitude - cg.longitude);
        const distB = Math.abs(b.latitude - cg.latitude) + Math.abs(b.longitude - cg.longitude);
        return distA - distB;
      })
      .slice(0, 4);
  }, [cg]);

  useEffect(() => {
    if (!cg) return;
    const state = STATE_NAMES[cg.state] || cg.state;
    document.title = `${cg.campground_name} - Camping in ${state} | SignalCamping`;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(generateStructuredData(cg));
    script.id = "campground-jsonld";
    const existing = document.getElementById("campground-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `${cg.campground_name} in ${cg.city || ""}, ${state}. ${cg.is_verified ? "Verified campground." : "OSM data."} View amenities, location, and directions.`;

    return () => { const el = document.getElementById("campground-jsonld"); if (el) el.remove(); };
  }, [cg]);

  if (!cg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <SiteHeader />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Campground Not Found</h2>
          <p className="text-gray-500 mb-6">The campground you're looking for isn't in our database.</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discovery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const state = STATE_NAMES[cg.state] || cg.state;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href={`/campgrounds/${cg.state.toLowerCase()}`} className="hover:text-green-700 transition">{state}</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-none">{cg.campground_name}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {(cg.campground_type || "campground").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                  {cg.is_verified && (
                    <Badge className="bg-green-400/90 text-green-950 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  )}
                  {cg.data_source === "osm" && !cg.is_verified && (
                    <Badge className="bg-blue-400/90 text-blue-950 text-xs">OpenStreetMap</Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {cg.campground_name}
                </h1>
                <p className="text-green-100 flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  {cg.city ? `${cg.city}, ` : ""}{state}
                </p>
                <p className="text-green-200/80 text-sm max-w-2xl leading-relaxed">
                  {generateDescription(cg)}
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mt-5 flex-wrap">
              {cg.reservation_link && (
                <a href={cg.reservation_link} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-green-800 hover:bg-green-50 font-semibold shadow-lg">
                    <ExternalLink className="w-4 h-4 mr-2" /> Make a Reservation
                  </Button>
                </a>
              )}
              {cg.website && (
                <a href={cg.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                    <Globe className="w-4 h-4 mr-2" /> Official Website
                  </Button>
                </a>
              )}
              <a href={`https://www.google.com/maps?q=${cg.latitude},${cg.longitude}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  <Compass className="w-4 h-4 mr-2" /> Get Directions
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="container pb-6">
        {(() => {
          const score = cg.signal_score ?? 0;
          const nearTown = cg.nearest_town ? ` near ${cg.nearest_town}` : "";
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
          return (
            <div className="text-base text-gray-700 space-y-3 leading-relaxed">
              <p>Looking for cell service at {cg.campground_name}{nearTown} in {state}? Here&rsquo;s what you can realistically expect based on signal data and nearby coverage.</p>
              <p>Signal strength here is generally <strong>{strengthLabel}</strong>. This means {usability}.</p>
              <p>If you&rsquo;re planning to work remotely or rely on mobile data, this campground is <strong>{rwVerdict}</strong>.</p>
            </div>
          );
        })()}
      </section>

      {/* Main Content Grid */}
      <section className="container pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: Amenities + Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Amenities & Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Camping Amenities & Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { available: cg.tent_sites, label: "Tent Camping", Icon: Tent, desc: "Designated tent sites with fire rings and picnic tables." },
                    { available: cg.rv_sites, label: "RV Sites", Icon: Truck, desc: "Pull-through and back-in RV sites with level pads." },
                    { available: cg.electric_hookups, label: "Electric Hookups", Icon: Zap, desc: "Electric service at select sites." },
                    { available: cg.waterfront, label: "Waterfront Access", Icon: Waves, desc: "Sites with direct access to water." },
                  ] as const).map(({ available, label, Icon, desc }) => (
                    <div key={label} className={`flex items-start gap-3 p-4 rounded-lg border transition ${
                      available
                        ? "bg-white border-gray-200 hover:border-green-200 hover:shadow-sm"
                        : "bg-gray-50/50 border-gray-100 opacity-60"
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${available ? "bg-green-100" : "bg-gray-100"}`}>
                        <Icon className={`w-5 h-5 ${available ? "text-green-600" : "text-gray-400"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{label}</span>
                          {available ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <HelpCircle className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{available ? desc : "No confirmed data for this amenity."}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional amenities from OSM */}
                {(cg.showers || cg.drinking_water || cg.toilets || cg.fire_allowed) && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Additional Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {cg.showers && <Badge variant="outline" className="text-xs">Showers</Badge>}
                      {cg.drinking_water && <Badge variant="outline" className="text-xs">Drinking Water</Badge>}
                      {cg.toilets && <Badge variant="outline" className="text-xs">Toilets</Badge>}
                      {cg.fire_allowed && <Badge variant="outline" className="text-xs">Campfires Allowed</Badge>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cell Signal & Remote Work */}
            <Card className="border-indigo-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <Signal className="w-5 h-5 text-indigo-600" /> Cell Signal & Remote Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Signal Score Card */}
                  <div className={`p-4 rounded-xl border ${
                    (cg.signal_score ?? 0) >= 70 ? 'bg-green-50 border-green-200' :
                    (cg.signal_score ?? 0) >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-xs text-gray-500 font-medium mb-1">Signal Score</p>
                    <p className={`text-3xl font-bold ${
                      (cg.signal_score ?? 0) >= 70 ? 'text-green-700' :
                      (cg.signal_score ?? 0) >= 40 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {cg.signal_score ?? '—'}<span className="text-lg">/100</span>
                    </p>
                    <p className={`text-xs mt-1 ${
                      (cg.signal_score ?? 0) >= 70 ? 'text-green-600' :
                      (cg.signal_score ?? 0) >= 40 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {(cg.signal_score ?? 0) >= 70 ? 'Good coverage — 2+ carriers detected' :
                       (cg.signal_score ?? 0) >= 40 ? 'Fair coverage — 1 carrier detected' :
                       'Poor coverage — no carriers detected nearby'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1.5">Rankings use tower proximity refinement for tie-breaking</p>
                  </div>

                  {/* Remote Work Score Card */}
                  <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200">
                    <p className="text-xs text-gray-500 font-medium mb-1">Remote Work Score</p>
                    <p className="text-3xl font-bold text-indigo-700">
                      {cg.remote_work_score != null ? Math.round(cg.remote_work_score) : '—'}<span className="text-lg">/100</span>
                    </p>
                    <p className="text-xs text-indigo-500 mt-1">
                      Based on signal, town proximity & highway access
                    </p>
                  </div>
                </div>

                {/* Carrier Likelihood */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Carrier Likelihood</p>
                  {(() => {
                    const lk = getCarrierLikelihood(cg);
                    const carriers: { name: string; level: CarrierLikelihood }[] = [
                      { name: 'Verizon', level: lk.verizon },
                      { name: 'AT&T', level: lk.att },
                      { name: 'T-Mobile', level: lk.tmobile },
                    ];
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        {carriers.map(c => {
                          const style = LIKELIHOOD_STYLES[c.level];
                          return (
                            <div key={c.name} className={`flex items-center gap-2 p-3 rounded-lg border transition ${style.bgClass} ${style.borderClass}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                c.level === 'Likely' ? 'bg-green-100' : c.level === 'Possible' ? 'bg-amber-100' : 'bg-gray-100'
                              }`}>
                                {c.level === 'Unknown'
                                  ? <HelpCircle className="w-4 h-4 text-gray-400" />
                                  : <Wifi className={`w-4 h-4 ${c.level === 'Likely' ? 'text-green-600' : 'text-amber-600'}`} />
                                }
                              </div>
                              <div>
                                <span className="font-medium text-sm block">{c.name}</span>
                                <span className={`text-xs ${style.textClass}`}>
                                  {style.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <p className="text-[10px] text-gray-400 mt-2 leading-tight flex items-start gap-1">
                    <Info className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{CARRIER_DISCLAIMER}</span>
                  </p>
                </div>

                {/* Distance Info */}
                <div className="grid grid-cols-2 gap-3">
                  {cg.nearest_town && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-500" />
                        <p className="text-xs text-gray-500 font-medium">Nearest Town</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{cg.nearest_town}</p>
                      {cg.distance_to_town_miles != null && (
                        <p className="text-xs text-gray-500">{cg.distance_to_town_miles.toFixed(1)} miles away</p>
                      )}
                    </div>
                  )}
                  {cg.distance_to_highway_miles != null && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Route className="w-3.5 h-3.5 text-gray-500" />
                        <p className="text-xs text-gray-500 font-medium">Nearest Highway</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{cg.distance_to_highway_miles.toFixed(1)} mi</p>
                      <p className="text-xs text-gray-500">Primary road access</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Camper Signal Reports */}
            <CamperSignalReports campgroundId={cg.slug} campgroundName={cg.campground_name} />

            {/* What to Know */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  What to Know Before You Go
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-gray-600 space-y-4">
                <p>
                  <strong>{cg.campground_name}</strong> is a {(cg.campground_type || "campground").replace(/_/g, " ")} campground
                  located in {cg.city ? `${cg.city}, ` : ""}{state}.
                  {cg.waterfront ? " This campground offers waterfront camping." : ""}
                  {cg.operator ? ` Operated by ${cg.operator}.` : ""}
                </p>
                {cg.reservation_link && (
                  <p>
                    Reservations are recommended, especially during peak season (May through September).
                    You can book your site through the <a href={cg.reservation_link} target="_blank" rel="noopener noreferrer"
                    className="text-green-700 underline hover:text-green-800">official reservation system</a>.
                  </p>
                )}
                {cg.is_verified && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-green-800 text-sm">Verified Campground</p>
                        <p className="text-sm text-green-700 mt-1">
                          This campground has been verified against official sources
                          {cg.verification_source ? ` (${cg.verification_source})` : ""}.
                          {cg.notes ? ` ${cg.notes}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!cg.is_verified && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-800 text-sm">OpenStreetMap Data</p>
                        <p className="text-sm text-blue-700 mt-1">
                          This campground's information comes from OpenStreetMap contributors. Some details may be incomplete or need verification.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      <Briefcase className="w-5 h-5 text-gray-500" /> Remote Work Verdict
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <span className={`inline-block text-sm font-semibold px-3 py-1 rounded border ${verdict.color}`}>{verdict.label}</span>
                    <p className="text-sm text-gray-600">{verdict.desc}</p>
                  </CardContent>
                </Card>
              );
            })()}

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Quick Facts */}
            <Card className="border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Quick Facts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: MapPin, label: "Location", value: `${cg.city ? cg.city + ", " : ""}${state}`, color: "text-rose-600" },
                  { icon: Compass, label: "Type", value: (cg.campground_type || "campground").replace(/_/g, " "), color: "text-amber-600" },
                  ...(cg.operator ? [{ icon: Globe, label: "Operator", value: cg.operator, color: "text-blue-600" }] : []),
                  ...(cg.phone ? [{ icon: Navigation, label: "Phone", value: cg.phone, color: "text-green-600" }] : []),
                  { icon: CheckCircle2, label: "Data Source", value: cg.is_verified ? "Verified" : "OpenStreetMap", color: cg.is_verified ? "text-green-600" : "text-blue-600" },
                ].map((item: any) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-gray-800 text-right max-w-[180px] truncate">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mini Map */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-700" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[200px] w-full">
                  <MapView
                    onMapReady={(map) => {
                      const pos = { lat: cg.latitude, lng: cg.longitude };
                      map.setCenter(pos);
                      map.setZoom(11);
                      new google.maps.Marker({
                        position: pos,
                        map,
                        title: cg.campground_name,
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: cg.is_verified ? "#16a34a" : "#3b82f6",
                          fillOpacity: 1,
                          strokeColor: "#fff",
                          strokeWeight: 2,
                        },
                      });
                    }}
                  />
                </div>
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <p className="text-[10px] text-gray-500">Latitude</p>
                      <p className="text-xs font-mono font-bold text-gray-800">{cg.latitude.toFixed(4)}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <p className="text-[10px] text-gray-500">Longitude</p>
                      <p className="text-xs font-mono font-bold text-gray-800">{cg.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                  <a href={`https://www.google.com/maps?q=${cg.latitude},${cg.longitude}`}
                    target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" size="sm" className="w-full text-green-700 border-green-200 hover:bg-green-50">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open in Google Maps
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Camping Tips */}
            <Card className="bg-amber-50/50 border-amber-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" /> Camping Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-900/80 space-y-2">
                <p>Download offline maps before arriving at the campground.</p>
                <p>Check current conditions and seasonal closures before your trip.</p>
                <p>Make reservations early for popular summer weekends.</p>
                <p>Pack layers for variable Great Lakes weather.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Campgrounds */}
      {related.length > 0 && (
        <section className="container pb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            More Campgrounds in {state}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((r: any) => (
              <CampgroundCard key={r.slug} campground={r} />
            ))}
          </div>
        </section>
      )}

      {/* Nearby in Other States */}
      {nearby.length > 0 && (
        <section className="container pb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Nearby Campgrounds in Other States
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearby.map((n: any) => (
              <CampgroundCard key={n.slug} campground={n} />
            ))}
          </div>
        </section>
      )}

      {/* All Campgrounds Link */}
      <section className="container pb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-green-800" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Explore All Campgrounds
              </h3>
              <p className="text-sm text-green-600 mt-1">
                Browse our full directory of campgrounds across the Great Lakes region.
              </p>
            </div>
            <Link href="/top-campgrounds">
              <Button className="bg-green-700 hover:bg-green-800 text-white">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* State browse link */}
      <section className="container pb-8 text-center">
        <Link href={`/campgrounds/${cg.state?.toLowerCase()}`} className="text-green-700 hover:underline text-sm font-medium">
          View more campgrounds in {state}
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
        <div className="container text-center">
          <p className="text-sm">&copy; 2026 SignalCamping &mdash; Campground discovery powered by OpenStreetMap data.</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Campground Card for internal linking ── */
function CampgroundCard({ campground: cg }: { campground: any }) {
  const state = STATE_NAMES[cg.state] || cg.state;
  return (
    <Link href={`/campground/${cg.slug}`}>
      <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{cg.campground_name}</h3>
            {cg.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />}
          </div>
          <p className="text-xs text-gray-500 mb-2">{cg.city ? `${cg.city}, ` : ""}{state}</p>
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-xs">{(cg.campground_type || "campground").replace(/_/g, " ")}</Badge>
            {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5">Tent</Badge>}
            {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5">RV</Badge>}
            {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5">Waterfront</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

