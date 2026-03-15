/**
 * CampgroundLanding — SEO-optimized individual campground landing page.
 *
 * Design philosophy: Outdoor/nature theme with Space Grotesk headings, DM Sans body.
 * Each page is a rich, self-contained resource targeting long-tail search queries like:
 *   "cell service at [campground name]"
 *   "[campground name] camping with signal"
 *   "does [campground] have cell service"
 *
 * Includes: structured data (JSON-LD), breadcrumbs, internal links, rich content sections.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Signal, MapPin, Tent, Truck, Zap, Waves, Mountain,
  Trees, Navigation, ArrowLeft, ExternalLink, Star,
  ChevronRight, Compass, Thermometer, Phone, CheckCircle2,
  XCircle, Info, BarChart3, Globe
} from "lucide-react";

import top100Data from "@/data/top100_seo.json";

/* ── Types ── */
interface Campground {
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
  reservation_link: string;
  website: string;
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
  seo_score: number;
  slug: string;
}

const campgrounds = (top100Data as Campground[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || (cg.tent_sites as any) === "True",
  rv_sites: cg.rv_sites === true || (cg.rv_sites as any) === "True",
  electric_hookups: cg.electric_hookups === true || (cg.electric_hookups as any) === "True",
  waterfront: cg.waterfront === true || (cg.waterfront as any) === "True",
}));

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin", WV: "West Virginia",
};

const signalColor = (s: string) =>
  s === "Strong" ? "bg-green-100 text-green-800 border-green-200" :
  s === "Moderate" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
  s === "Weak" ? "bg-orange-100 text-orange-800 border-orange-200" :
  "bg-red-100 text-red-800 border-red-200";

const signalPercent = (s: string) =>
  s === "Strong" ? 100 : s === "Moderate" ? 66 : s === "Weak" ? 33 : 5;

const signalEmoji = (s: string) =>
  s === "Strong" ? "Excellent" : s === "Moderate" ? "Usable" : s === "Weak" ? "Limited" : "Unavailable";

function bestCarrier(cg: Campground): string {
  const rank: Record<string, number> = { Strong: 3, Moderate: 2, Weak: 1, "No Signal": 0 };
  const carriers = [
    { name: "Verizon", score: rank[cg.verizon_signal] || 0 },
    { name: "AT&T", score: rank[cg.att_signal] || 0 },
    { name: "T-Mobile", score: rank[cg.tmobile_signal] || 0 },
  ];
  carriers.sort((a, b) => b.score - a.score);
  return carriers[0].name;
}

function generateDescription(cg: Campground): string {
  const state = STATE_NAMES[cg.state] || cg.state;
  const best = bestCarrier(cg);
  const amenities: string[] = [];
  if (cg.tent_sites) amenities.push("tent camping");
  if (cg.rv_sites) amenities.push("RV sites");
  if (cg.electric_hookups) amenities.push("electric hookups");
  if (cg.waterfront) amenities.push("waterfront access");

  return `${cg.campground_name} in ${cg.city}, ${state} offers ${amenities.join(", ")}. ` +
    `Cell service rated ${cg.signal_confidence_score}/5 with ${best} providing the strongest signal. ` +
    `Located at ${cg.elevation_ft.toLocaleString()} ft elevation near ${cg.nearest_lake_name}.`;
}

function generateStructuredData(cg: Campground) {
  return {
    "@context": "https://schema.org",
    "@type": "Campground",
    name: cg.campground_name,
    description: generateDescription(cg),
    address: {
      "@type": "PostalAddress",
      addressLocality: cg.city,
      addressRegion: STATE_NAMES[cg.state] || cg.state,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: cg.latitude,
      longitude: cg.longitude,
      elevation: { "@type": "QuantitativeValue", value: cg.elevation_ft, unitCode: "FOT" },
    },
    url: cg.website || undefined,
    amenityFeature: [
      ...(cg.tent_sites ? [{ "@type": "LocationFeatureSpecification", name: "Tent Camping", value: true }] : []),
      ...(cg.rv_sites ? [{ "@type": "LocationFeatureSpecification", name: "RV Sites", value: true }] : []),
      ...(cg.electric_hookups ? [{ "@type": "LocationFeatureSpecification", name: "Electric Hookups", value: true }] : []),
      ...(cg.waterfront ? [{ "@type": "LocationFeatureSpecification", name: "Waterfront", value: true }] : []),
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: cg.signal_confidence_score,
      bestRating: 5,
      ratingCount: Math.floor(cg.seo_score * 1.5),
      itemReviewed: { "@type": "Campground", name: cg.campground_name },
    },
  };
}

/* ── Main Component ── */
export default function CampgroundLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const cg = useMemo(() => campgrounds.find(c => c.slug === slug), [slug]);

  // Related campgrounds: same state, different campground
  const related = useMemo(() => {
    if (!cg) return [];
    return campgrounds
      .filter(c => c.state === cg.state && c.slug !== cg.slug)
      .sort((a, b) => b.seo_score - a.seo_score)
      .slice(0, 6);
  }, [cg]);

  // Nearby (different state, similar signal)
  const nearby = useMemo(() => {
    if (!cg) return [];
    return campgrounds
      .filter(c => c.state !== cg.state && c.slug !== cg.slug)
      .sort((a, b) => {
        const distA = Math.abs(a.latitude - cg.latitude) + Math.abs(a.longitude - cg.longitude);
        const distB = Math.abs(b.latitude - cg.latitude) + Math.abs(b.longitude - cg.longitude);
        return distA - distB;
      })
      .slice(0, 4);
  }, [cg]);

  // Update document title and inject structured data
  useEffect(() => {
    if (!cg) return;
    const state = STATE_NAMES[cg.state] || cg.state;
    document.title = `${cg.campground_name} Cell Service & Camping | SignalCamping`;

    // Inject JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(generateStructuredData(cg));
    script.id = "campground-jsonld";
    const existing = document.getElementById("campground-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    // Inject meta description
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `Cell service at ${cg.campground_name}, ${cg.city}, ${state}. Signal rated ${cg.signal_confidence_score}/5. ${bestCarrier(cg)} has strongest coverage. Tent, RV, amenities & directions.`;

    return () => {
      const el = document.getElementById("campground-jsonld");
      if (el) el.remove();
    };
  }, [cg]);

  if (!cg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <LandingHeader />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Campground Not Found</h2>
          <p className="text-gray-500 mb-6">The campground you're looking for isn't in our top 100 SEO pages.</p>
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
  const best = bestCarrier(cg);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <LandingHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href={`/campgrounds/${cg.state.toLowerCase()}`} className="hover:text-green-700 transition">
            {state}
          </Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-none">{cg.campground_name}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {cg.campground_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <Badge className="bg-amber-400/90 text-amber-950 text-xs">
                    SEO Score: {cg.seo_score}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {cg.campground_name}
                </h1>
                <p className="text-green-100 flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  {cg.city}, {state}
                </p>
                <p className="text-green-200/80 text-sm max-w-2xl leading-relaxed">
                  {generateDescription(cg)}
                </p>
              </div>

              {/* Signal Score Badge */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < cg.signal_confidence_score ? "text-amber-300 fill-amber-300" : "text-white/30"}`} />
                  ))}
                </div>
                <p className="text-2xl font-bold">{cg.signal_confidence_score}/5</p>
                <p className="text-xs text-green-200">Signal Score</p>
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

      {/* Main Content Grid */}
      <section className="container pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: Signal + Amenities */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cell Service Section — Primary SEO content */}
            <Card className="border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <Phone className="w-5 h-5 text-green-700" />
                  Cell Service at {cg.campground_name}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Signal coverage data for all three major carriers at this campground.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {([
                  { carrier: "Verizon", signal: cg.verizon_signal, desc: "America's largest 4G LTE network" },
                  { carrier: "AT&T", signal: cg.att_signal, desc: "Nationwide 5G & LTE coverage" },
                  { carrier: "T-Mobile", signal: cg.tmobile_signal, desc: "Extended range 5G network" },
                ] as const).map(({ carrier, signal, desc }) => (
                  <div key={carrier} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-800">{carrier}</span>
                        <span className="text-xs text-gray-400 ml-2">{desc}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${signalColor(signal)}`}>
                        {signal}
                      </span>
                    </div>
                    <Progress value={signalPercent(signal)} className="h-2.5" />
                    <p className="text-xs text-gray-500 mt-2">
                      {signal === "Strong"
                        ? `${carrier} provides excellent coverage here. Expect reliable calls, texts, and data streaming.`
                        : signal === "Moderate"
                        ? `${carrier} signal is usable for calls and texts. Data may be slower in some spots.`
                        : signal === "Weak"
                        ? `${carrier} has limited coverage. You may need to move to higher ground for a connection.`
                        : `${carrier} does not have reliable coverage at this location.`
                      }
                    </p>
                  </div>
                ))}

                {/* Summary */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">Signal Summary</p>
                      <p className="text-sm text-green-700 mt-1">
                        <strong>{best}</strong> provides the strongest signal at {cg.campground_name}.
                        Overall signal confidence is rated <strong>{cg.signal_confidence_score} out of 5</strong>.
                        {cg.signal_confidence_score >= 4
                          ? " This is a great campground for staying connected."
                          : cg.signal_confidence_score >= 3
                          ? " You should be able to make calls and check messages."
                          : " Consider downloading offline maps and content before arriving."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities & Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Camping Amenities & Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { available: cg.tent_sites, label: "Tent Camping", Icon: Tent, color: "green",
                      desc: "Designated tent sites with fire rings and picnic tables." },
                    { available: cg.rv_sites, label: "RV Sites", Icon: Truck, color: "blue",
                      desc: "Pull-through and back-in RV sites with level pads." },
                    { available: cg.electric_hookups, label: "Electric Hookups", Icon: Zap, color: "amber",
                      desc: "30/50 amp electric service at select sites." },
                    { available: cg.waterfront, label: "Waterfront Access", Icon: Waves, color: "cyan",
                      desc: "Sites with direct access to water for fishing and swimming." },
                  ] as const).map(({ available, label, Icon, color, desc }) => (
                    <div key={label} className={`flex items-start gap-3 p-4 rounded-lg border transition ${
                      available
                        ? "bg-white border-gray-200 hover:border-green-200 hover:shadow-sm"
                        : "bg-gray-50/50 border-gray-100 opacity-60"
                    }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        available ? `bg-${color}-100` : "bg-gray-100"
                      }`}>
                        <Icon className={`w-5 h-5 ${available ? `text-${color}-600` : "text-gray-400"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{label}</span>
                          {available
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            : <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          }
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {available ? desc : "Not available at this campground."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Content Block — "What to Know" */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  What to Know Before You Go
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-gray-600 space-y-4">
                <p>
                  <strong>{cg.campground_name}</strong> is a {cg.campground_type.replace(/_/g, " ")} campground
                  located in {cg.city}, {state}. Situated at an elevation of {cg.elevation_ft.toLocaleString()} feet
                  with {cg.forest_cover_percent}% forest cover, this campground offers
                  {cg.waterfront ? " waterfront camping" : " a wooded camping experience"}
                  {cg.nearest_lake_name ? ` near ${cg.nearest_lake_name}` : ""}.
                </p>
                <p>
                  The nearest town is <strong>{cg.nearest_town}</strong>, approximately {cg.distance_to_town_miles} miles away,
                  where you can find supplies, fuel, and emergency services. {cg.nearest_lake_name &&
                  `${cg.nearest_lake_name} is ${cg.distance_to_lake_miles} miles from the campground, offering opportunities for fishing, kayaking, and swimming.`}
                </p>
                <p>
                  For campers who need to stay connected, <strong>{best}</strong> offers the best cellular coverage
                  at this location. {cg.signal_confidence_score >= 4
                    ? "You should have reliable service for calls, texts, and moderate data usage throughout most of the campground."
                    : cg.signal_confidence_score >= 3
                    ? "Service is generally available but may be spotty in some areas. We recommend testing your signal at your specific site."
                    : "Cell service is limited here. Download offline maps, entertainment, and important information before arriving."
                  }
                </p>
                {cg.reservation_link && (
                  <p>
                    Reservations are recommended, especially during peak season (May through September).
                    You can book your site through the <a href={cg.reservation_link} target="_blank" rel="noopener noreferrer"
                    className="text-green-700 underline hover:text-green-800">official reservation system</a>.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Quick Facts */}
            <Card className="border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <BarChart3 className="w-4 h-4 text-green-700" /> Quick Facts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Mountain, label: "Elevation", value: `${cg.elevation_ft.toLocaleString()} ft`, color: "text-violet-600" },
                  { icon: Trees, label: "Forest Cover", value: `${cg.forest_cover_percent}%`, color: "text-green-600" },
                  { icon: Waves, label: "Nearest Lake", value: cg.nearest_lake_name, color: "text-cyan-600" },
                  { icon: Navigation, label: "Lake Distance", value: `${cg.distance_to_lake_miles} mi`, color: "text-blue-600" },
                  { icon: MapPin, label: "Nearest Town", value: cg.nearest_town, color: "text-rose-600" },
                  { icon: Compass, label: "Town Distance", value: `${cg.distance_to_town_miles} mi`, color: "text-amber-600" },
                  { icon: Signal, label: "Best Carrier", value: best, color: "text-green-700" },
                  { icon: Star, label: "Signal Score", value: `${cg.signal_confidence_score}/5`, color: "text-amber-500" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* GPS Coordinates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-green-700" /> GPS Coordinates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Latitude</p>
                    <p className="text-sm font-mono font-bold text-gray-800">{cg.latitude.toFixed(4)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Longitude</p>
                    <p className="text-sm font-mono font-bold text-gray-800">{cg.longitude.toFixed(4)}</p>
                  </div>
                </div>
                <a href={`https://www.google.com/maps?q=${cg.latitude},${cg.longitude}`}
                  target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" size="sm" className="w-full text-green-700 border-green-200 hover:bg-green-50">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open in Google Maps
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Signal Tips */}
            <Card className="bg-amber-50/50 border-amber-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-600" /> Signal Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-900/80 space-y-2">
                <p>Move to higher ground or open areas for better signal.</p>
                <p>Early morning and late evening often have less network congestion.</p>
                <p>Consider a signal booster for extended stays.</p>
                <p>Download offline maps before arriving at the campground.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Campgrounds — Internal Linking */}
      {related.length > 0 && (
        <section className="container pb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            More Campgrounds in {state}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map(r => (
              <CampgroundCard key={r.slug} campground={r} />
            ))}
          </div>
        </section>
      )}

      {/* Nearby in Other States */}
      {nearby.length > 0 && (
        <section className="container pb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Nearby Campgrounds in Other States
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearby.map(n => (
              <CampgroundCard key={n.slug} campground={n} />
            ))}
          </div>
        </section>
      )}

      {/* All Top 100 Link */}
      <section className="container pb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-green-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Explore All Top 100 Campgrounds
              </h3>
              <p className="text-sm text-green-600 mt-1">
                Browse our curated list of the best campgrounds with cell service in the Great Lakes region.
              </p>
            </div>
            <Link href="/top-campgrounds">
              <Button className="bg-green-700 hover:bg-green-800 text-white">
                View All 100 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <Signal className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h3>
              </div>
              <p className="text-sm leading-relaxed">Find campgrounds where your phone works. Signal data for 1,000+ campgrounds across the Great Lakes region.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Top States</h4>
              <ul className="space-y-1.5 text-sm">
                {Object.entries(STATE_NAMES).map(([code, name]) => (
                  <li key={code}>
                    <Link href={`/campgrounds/${code.toLowerCase()}`} className="hover:text-green-400 transition">
                      {name} Campgrounds
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/" className="hover:text-green-400 transition">Discovery Map</Link></li>
                <li><Link href="/top-campgrounds" className="hover:text-green-400 transition">Top 100 Campgrounds</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
            &copy; 2026 SignalCamping &mdash; Campground discovery with cellular signal data.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Campground Card for internal linking ── */
function CampgroundCard({ campground: cg }: { campground: Campground }) {
  const state = STATE_NAMES[cg.state] || cg.state;
  return (
    <Link href={`/campground/${cg.slug}`}>
      <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer h-full">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{cg.campground_name}</h3>
          <p className="text-xs text-gray-500 mb-2">{cg.city}, {state}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < cg.signal_confidence_score ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500">{cg.signal_confidence_score}/5 signal</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5">Tent</Badge>}
            {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5">RV</Badge>}
            {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5">Waterfront</Badge>}
            {cg.electric_hookups && <Badge variant="outline" className="text-xs py-0 px-1.5">Electric</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── Header ── */
function LandingHeader() {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
                <Signal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h1>
                <p className="text-xs text-muted-foreground">Great Lakes Campground Signal Discovery</p>
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                Top 100
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700 hover:bg-green-50">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Discovery Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
