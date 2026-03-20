/**
 * CityLanding — City-level campground listing with signal data.
 * Route: /campgrounds-with-cell-service/:slug  (slug = {city-slug}-{state-code})
 * Examples: /campgrounds-with-cell-service/yellow-springs-oh
 *           /campgrounds-with-cell-service/elmira-mi
 *
 * Source of truth: campgrounds.json
 * seo_pages.json: optional meta title/description only — never gates rendering.
 *
 * Index-worthiness: 3+ campgrounds OR ≥1 strong-signal (score≥80) OR ≥1 remote-work-ready (score≥60).
 * Below threshold: page renders normally but carries noindex meta tag.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, ChevronRight, Tent, Truck, Waves, CheckCircle2,
  Signal, Laptop, Info, Building2,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { getCarrierLikelihood, LIKELIHOOD_STYLES, CARRIER_DISCLAIMER } from "@/lib/carrierLikelihood";
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

/** Parse "yellow-springs-oh" → { citySlug: "yellow-springs", stateCode: "oh" } */
function parseSlug(slug: string): { citySlug: string; stateCode: string } | null {
  const parts = slug.split("-");
  if (parts.length < 2) return null;
  const stateCode = parts[parts.length - 1].toLowerCase();
  if (!VALID_STATES.has(stateCode)) return null;
  const citySlug = parts.slice(0, -1).join("-");
  if (!citySlug) return null;
  return { citySlug, stateCode };
}

function unslugify(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function CityLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const parsed = useMemo(() => parseSlug(slug), [slug]);

  const cityCampgrounds = useMemo(() => {
    if (!parsed) return [];
    const sc = parsed.stateCode.toUpperCase();
    return campgrounds
      .filter(c => c.state.toLowerCase() === sc.toLowerCase() && normalize(c.city) === parsed.citySlug)
      .sort((a, b) => (b.signal_score ?? 0) - (a.signal_score ?? 0));
  }, [parsed]);

  // Derived display values
  const cityName = cityCampgrounds[0]?.city || unslugify(parsed?.citySlug || "");
  const stateCode = parsed?.stateCode.toUpperCase() || "";
  const stateName = STATE_NAMES[stateCode] || stateCode;

  // City-level stats from the real dataset
  const cityStats = useMemo(() => ({
    total: cityCampgrounds.length,
    strongSignal: cityCampgrounds.filter(c => (c.signal_score ?? 0) >= 80).length,
    threeCarrier: cityCampgrounds.filter(c =>
      c.verizon_coverage === true && c.att_coverage === true && c.tmobile_coverage === true
    ).length,
    remoteWorkReady: cityCampgrounds.filter(c => (c.remote_work_score ?? 0) >= 60).length,
    verified: cityCampgrounds.filter(c => c.is_verified).length,
  }), [cityCampgrounds]);

  // Index-worthiness: 3+ campgrounds OR ≥1 strong-signal OR ≥1 remote-work-ready
  const isIndexWorthy = cityStats.total >= 3 || cityStats.strongSignal >= 1 || cityStats.remoteWorkReady >= 1;

  // Nearby cities: other cities in the same state, ranked by campground count, top 8
  const nearbyCities = useMemo(() => {
    if (!parsed) return [];
    const sc = parsed.stateCode.toUpperCase();
    const counts: Record<string, { citySlug: string; cityName: string; count: number }> = {};
    campgrounds
      .filter(c => c.state.toLowerCase() === sc.toLowerCase() && c.city && normalize(c.city) !== parsed.citySlug)
      .forEach(c => {
        const key = normalize(c.city);
        if (!counts[key]) counts[key] = { citySlug: key, cityName: c.city, count: 0 };
        counts[key].count++;
      });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [parsed]);

  // Optional SEO metadata
  const seoEntry = useMemo(() => {
    if (!parsed) return null;
    return (seoData as any[]).find(p =>
      p.slug === slug || p.slug === `city/${slug}` || p.slug?.endsWith(slug)
    ) || null;
  }, [parsed, slug]);

  const pageTitle = seoEntry?.title || `Campgrounds Near ${cityName} with Cell Service`;
  const metaDesc = seoEntry?.description ||
    `Find ${cityStats.total} campground${cityStats.total !== 1 ? "s" : ""} near ${cityName}, ${stateName} ranked by signal score. See Verizon, AT&T, and T-Mobile coverage for each site.`;

  useEffect(() => {
    if (!parsed) return;
    document.title = `${pageTitle} | SignalCamping`;

    // Meta description
    let desc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!desc) { desc = document.createElement("meta"); desc.name = "description"; document.head.appendChild(desc); }
    desc.content = metaDesc;

    // Robots: noindex if below threshold
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = isIndexWorthy ? "index, follow" : "noindex, follow";

    return () => { robots.content = "index, follow"; };
  }, [parsed, pageTitle, metaDesc, isIndexWorthy]);

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
        <p className="text-sm text-gray-600 mb-4 max-w-2xl leading-relaxed">
          {cityCampgrounds.length > 0
            ? `${cityStats.total} campground${cityStats.total !== 1 ? "s" : ""} near ${cityName}, ${stateName} — sorted by signal score using modeled tower proximity data for Verizon, AT&T, and T-Mobile. ${cityStats.strongSignal > 0 ? `${cityStats.strongSignal} location${cityStats.strongSignal !== 1 ? "s" : ""} score 80 or above on our 100-point signal scale.` : ""} Click any campground for the full signal breakdown and carrier likelihood.`
            : `No campgrounds found near ${cityName}, ${stateName} in our dataset. Try browsing all ${stateName} campgrounds below.`}
        </p>

        {/* Stats grid */}
        {cityCampgrounds.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-green-700" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{cityStats.total}</div>
              <div className="text-xs text-gray-500 mt-0.5">Campgrounds</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <div className="text-xl font-bold text-green-600" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{cityStats.strongSignal}</div>
              <div className="text-xs text-gray-500 mt-0.5">Strong Signal</div>
            </div>
            {cityStats.threeCarrier > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-xl font-bold text-blue-600" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{cityStats.threeCarrier}</div>
                <div className="text-xs text-gray-500 mt-0.5">3-Carrier Coverage</div>
              </div>
            )}
            {cityStats.remoteWorkReady > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-xl font-bold text-indigo-600" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{cityStats.remoteWorkReady}</div>
                <div className="text-xs text-gray-500 mt-0.5">Remote Work Ready</div>
              </div>
            )}
            {cityStats.threeCarrier === 0 && cityStats.remoteWorkReady === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-600" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{cityStats.verified}</div>
                <div className="text-xs text-gray-500 mt-0.5">Verified</div>
              </div>
            )}
          </div>
        )}

        {/* Quick nav badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-green-100 text-green-700">{cityStats.total} campground{cityStats.total !== 1 ? "s" : ""}</Badge>
          {cityStats.verified > 0 && (
            <Badge variant="outline" className="text-xs">{cityStats.verified} verified</Badge>
          )}
        </div>
      </section>

      {/* Internal links: carrier pages + remote work */}
      {cityCampgrounds.length > 0 && (
        <section className="container pb-5">
          <div className="flex flex-wrap gap-2">
            <Link href={`/campgrounds-with-verizon-signal/${parsed.stateCode}`}>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition py-1 px-2.5">
                <Signal className="w-3 h-3 mr-1 text-red-500" /> Verizon in {stateName}
              </Badge>
            </Link>
            <Link href={`/campgrounds-with-att-signal/${parsed.stateCode}`}>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition py-1 px-2.5">
                <Signal className="w-3 h-3 mr-1 text-blue-500" /> AT&amp;T in {stateName}
              </Badge>
            </Link>
            <Link href={`/campgrounds-with-tmobile-signal/${parsed.stateCode}`}>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 transition py-1 px-2.5">
                <Signal className="w-3 h-3 mr-1 text-pink-500" /> T-Mobile in {stateName}
              </Badge>
            </Link>
            {cityStats.remoteWorkReady > 0 && (
              <Link href={`/remote-work-camping/${parsed.stateCode}`}>
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition py-1 px-2.5">
                  <Laptop className="w-3 h-3 mr-1 text-indigo-500" /> Remote Work in {stateName}
                </Badge>
              </Link>
            )}
          </div>
        </section>
      )}

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
      </section>

      {/* Methodology / disclaimer */}
      {cityCampgrounds.length > 0 && (
        <section className="container pb-8">
          <Card className="border-gray-100 bg-gray-50/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                <Info className="w-4 h-4 text-green-600" /> About These Signal Scores
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Signal scores are modeled from real cell tower location data — not carrier coverage maps. Each campground's GPS coordinates are compared against the nearest Verizon, AT&T, and T-Mobile towers, with coverage radii adjusted for terrain type (suburban 15 km, rural 12 km, backcountry 6 km). The score (0–100) reflects overall connectivity potential: 80+ is strong, 60–79 is moderate, below 60 may be limited. Scores for campgrounds near {cityName}, {stateName} are based on the same methodology used across all {cityStats.total} location{cityStats.total !== 1 ? "s" : ""} in this city.
              </p>
              <p className="text-xs text-muted-foreground mt-2">{CARRIER_DISCLAIMER}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Nearby cities in the same state */}
      {nearbyCities.length > 0 && (
        <section className="container pb-8">
          <h2 className="text-base font-bold text-gray-800 mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            More Cities in {stateName}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {nearbyCities.map(({ citySlug, cityName: name, count }) => (
              <Link key={citySlug} href={`/campgrounds-with-cell-service/${citySlug}-${parsed.stateCode}`}>
                <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-5">{count} campground{count !== 1 ? "s" : ""}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to state */}
      <section className="container pb-10">
        <div className="flex flex-wrap gap-3">
          <Link href={`/campgrounds/${parsed.stateCode}`}>
            <Button variant="outline" className="text-sm">Browse All {stateName} Campgrounds</Button>
          </Link>
          <Link href="/top-campgrounds">
            <Button variant="outline" className="text-sm">View Top Campgrounds</Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container text-center text-sm">&copy; 2026 SignalCamping</div>
      </footer>
    </div>
  );
}
