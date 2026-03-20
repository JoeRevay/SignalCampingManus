/**
 * CityLanding — City-level campground listing with signal data.
 * Route: /campgrounds-with-cell-service/:slug  (slug = {city-slug}-{state-code})
 * Examples: /campgrounds-with-cell-service/yellow-springs-oh
 *           /campgrounds-with-cell-service/elmira-mi
 *
 * Source of truth: campgrounds.json
 * seo_pages.json: optional meta title/description only — never gates rendering.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight, Tent, Truck, Waves, CheckCircle2, Signal } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { getCarrierLikelihood, LIKELIHOOD_STYLES } from "@/lib/carrierLikelihood";
import seoData from "@/data/seo_pages.json";
import allData from "@/data/campgrounds.json";

const STATE_NAMES: Record<string, string> = { MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin" };
const VALID_STATES = new Set(["mi", "oh", "pa", "wi"]);

const parseBool = (v: any) => v === true || v === "True" || v === "Yes";
const normalize = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

const campgrounds = (allData as any[]).map(cg => ({
  ...cg,
  tent_sites: parseBool(cg.tent_sites),
  rv_sites: parseBool(cg.rv_sites),
  electric_hookups: parseBool(cg.electric_hookups),
  waterfront: parseBool(cg.waterfront),
}));

function signalColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#2563eb";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

/** Parse a slug like "yellow-springs-oh" → { citySlug: "yellow-springs", stateCode: "oh" } */
function parseSlug(slug: string): { citySlug: string; stateCode: string } | null {
  const parts = slug.split("-");
  if (parts.length < 2) return null;
  const stateCode = parts[parts.length - 1].toLowerCase();
  if (!VALID_STATES.has(stateCode)) return null;
  const citySlug = parts.slice(0, -1).join("-");
  if (!citySlug) return null;
  return { citySlug, stateCode };
}

/** Capitalize each word for display (e.g. "yellow-springs" → "Yellow Springs") */
function unslugify(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function CityLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const parsed = useMemo(() => parseSlug(slug), [slug]);

  const cityCampgrounds = useMemo(() => {
    if (!parsed) return [];
    const stateCode = parsed.stateCode.toUpperCase();
    return campgrounds
      .filter(c => c.state.toLowerCase() === stateCode.toLowerCase() && normalize(c.city) === parsed.citySlug)
      .sort((a, b) => (b.signal_score ?? 0) - (a.signal_score ?? 0));
  }, [parsed]);

  // Derived display values — prefer real data from first campground, fall back to slug
  const cityName = cityCampgrounds[0]?.city || unslugify(parsed?.citySlug || "");
  const stateCode = parsed?.stateCode.toUpperCase() || "";
  const stateName = STATE_NAMES[stateCode] || stateCode;

  // Optional SEO metadata from seo_pages.json
  const seoEntry = useMemo(() => {
    if (!parsed) return null;
    return (seoData as any[]).find(p =>
      p.slug === slug ||
      p.slug === `city/${slug}` ||
      p.slug?.endsWith(slug)
    ) || null;
  }, [parsed, slug]);

  const pageTitle = seoEntry?.title || `Campgrounds Near ${cityName} with Cell Service`;
  const metaDesc = seoEntry?.description ||
    `Find ${cityCampgrounds.length} campground${cityCampgrounds.length !== 1 ? "s" : ""} near ${cityName}, ${stateName} ranked by signal score. See Verizon, AT&T, and T-Mobile coverage for each site.`;

  useEffect(() => {
    if (!parsed) return;
    document.title = `${pageTitle} | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = metaDesc;
  }, [parsed, pageTitle, metaDesc]);

  // Unknown slug — not a valid state+city pattern
  if (!parsed) return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <Link href="/"><Button>Back Home</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href={`/campgrounds/${parsed.stateCode}`} className="hover:text-green-700">{stateName}</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="font-medium text-gray-800">{cityName}</li>
        </ol>
      </nav>

      {/* Header */}
      <section className="container py-6">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{pageTitle}</h1>
        <p className="text-sm text-gray-600 mb-3 max-w-xl leading-relaxed">
          {cityCampgrounds.length > 0
            ? `${cityCampgrounds.length} campground${cityCampgrounds.length !== 1 ? "s" : ""} near ${cityName}, ${stateName} — sorted by signal score. Each listing shows coverage likelihood for Verizon, AT&T, and T-Mobile. Click any campground for the full signal breakdown.`
            : `No campgrounds found near ${cityName}, ${stateName} in our dataset. Try browsing all ${stateName} campgrounds below.`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-green-100 text-green-700">{cityCampgrounds.length} campground{cityCampgrounds.length !== 1 ? "s" : ""}</Badge>
          {cityCampgrounds.filter(c => c.is_verified).length > 0 && (
            <Badge variant="outline" className="text-xs">{cityCampgrounds.filter(c => c.is_verified).length} verified</Badge>
          )}
        </div>
      </section>

      {/* Campground list */}
      <section className="container pb-8">
        {cityCampgrounds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-4">No campgrounds found for this location.</p>
            <Link href={`/campgrounds/${parsed.stateCode}`}>
              <Button variant="outline">Browse All {stateName} Campgrounds</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {cityCampgrounds.map((cg: any, i: number) => {
              const likelihood = getCarrierLikelihood(cg);
              const score = cg.signal_score ?? null;
              return (
                <Link key={cg.slug + i} href={`/campground/${cg.slug}`}>
                  <Card className="hover:shadow-md transition cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{cg.campground_name}</h3>
                            {cg.is_verified && <Badge className="bg-green-100 text-green-800 text-[10px] shrink-0"><CheckCircle2 className="w-3 h-3 mr-0.5" />Verified</Badge>}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            <MapPin className="w-3 h-3 inline mr-1" />{cg.city}, {STATE_NAMES[cg.state]}
                          </p>

                          {/* Signal score + carrier likelihood */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {score != null && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200" style={{ color: signalColor(score) }}>
                                <Signal className="w-3 h-3" /> {Math.round(score)}
                              </span>
                            )}
                            {(["verizon", "att", "tmobile"] as const).map(carrier => {
                              const level = likelihood[carrier];
                              const style = LIKELIHOOD_STYLES[level];
                              const label = carrier === "att" ? "AT&T" : carrier === "tmobile" ? "T-Mob" : "Vzn";
                              return (
                                <span key={carrier} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${style.bgClass} ${style.textClass} ${style.borderClass}`}>
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: style.dotColor }} />
                                  {label}
                                </span>
                              );
                            })}
                          </div>

                          {/* Amenity badges */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="outline" className="text-xs">{(cg.campground_type || "campground").replace(/_/g, " ")}</Badge>
                            {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5"><Tent className="w-3 h-3" /></Badge>}
                            {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5"><Truck className="w-3 h-3" /></Badge>}
                            {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5"><Waves className="w-3 h-3" /></Badge>}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Back to state link */}
        <div className="mt-8">
          <Link href={`/campgrounds/${parsed.stateCode}`}>
            <Button variant="outline" className="text-sm">
              Browse All {stateName} Campgrounds
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container text-center text-sm">&copy; 2026 SignalCamping</div>
      </footer>
    </div>
  );
}
