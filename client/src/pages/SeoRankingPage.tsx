/**
 * SeoRankingPage — Reusable programmatic SEO ranking page.
 *
 * Handles three URL families:
 *   /best-campgrounds-with-{carrier}-signal-in/:state
 *   /best-remote-work-campgrounds-in/:state
 *   /campgrounds-with-strong-cell-service-in/:state
 *
 * State param uses full lowercase name: ohio, michigan, pennsylvania, wisconsin
 */
import { useMemo, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Signal, MapPin, ChevronRight, Laptop, Wifi, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AffiliateRecommendations from "@/components/AffiliateRecommendations";
import rawData from "@/data/campgrounds.json";

const campgrounds = rawData as any[];

// ── State map (full lowercase name → code / display name) ──────────────────
const STATE_MAP: Record<string, { code: string; name: string; slug: string }> = {
  michigan:      { code: "MI", name: "Michigan",      slug: "mi" },
  ohio:          { code: "OH", name: "Ohio",          slug: "oh" },
  pennsylvania:  { code: "PA", name: "Pennsylvania",  slug: "pa" },
  wisconsin:     { code: "WI", name: "Wisconsin",     slug: "wi" },
};

// ── Carrier map ─────────────────────────────────────────────────────────────
const CARRIER_MAP: Record<string, { label: string; field: string }> = {
  verizon: { label: "Verizon", field: "verizon_coverage" },
  att:     { label: "AT&T",    field: "att_coverage"     },
  tmobile: { label: "T-Mobile", field: "tmobile_coverage" },
};

type PageType = "carrier" | "remote-work" | "strong-signal";

function detectPageType(loc: string): { type: PageType; carrier?: string } {
  if (loc.includes("/best-campgrounds-with-verizon-signal-in/")) return { type: "carrier", carrier: "verizon" };
  if (loc.includes("/best-campgrounds-with-att-signal-in/"))     return { type: "carrier", carrier: "att" };
  if (loc.includes("/best-campgrounds-with-tmobile-signal-in/")) return { type: "carrier", carrier: "tmobile" };
  if (loc.includes("/best-remote-work-campgrounds-in/"))         return { type: "remote-work" };
  return { type: "strong-signal" };
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-500";
}

export default function SeoRankingPage() {
  const params = useParams<{ state: string }>();
  const [location] = useLocation();

  const stateKey = (params.state || "").toLowerCase();
  const stateInfo = STATE_MAP[stateKey];

  const { type, carrier } = useMemo(() => detectPageType(location), [location]);
  const carrierInfo = carrier ? CARRIER_MAP[carrier] : null;

  // ── Filter + rank campgrounds ─────────────────────────────────────────────
  const ranked = useMemo(() => {
    if (!stateInfo) return [];
    const stateCgs = campgrounds.filter(cg => cg.state === stateInfo.code);

    if (type === "carrier" && carrierInfo) {
      return stateCgs
        .filter(cg => cg[carrierInfo.field] === true && cg.signal_score != null)
        .sort((a, b) => (b.signal_score ?? 0) - (a.signal_score ?? 0))
        .slice(0, 25);
    }

    if (type === "remote-work") {
      return stateCgs
        .filter(cg => cg.remote_work_score != null && cg.remote_work_score >= 50)
        .sort((a, b) => (b.remote_work_score ?? 0) - (a.remote_work_score ?? 0))
        .slice(0, 25);
    }

    // strong-signal
    return stateCgs
      .filter(cg => cg.signal_quality_score != null && cg.signal_quality_score >= 70)
      .sort((a, b) => (b.signal_quality_score ?? 0) - (a.signal_quality_score ?? 0))
      .slice(0, 25);
  }, [stateInfo, type, carrierInfo]);

  // ── Metadata ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!stateInfo) return;

    let title = "";
    let desc = "";

    if (type === "carrier" && carrierInfo) {
      title = `Best Campgrounds with ${carrierInfo.label} Signal in ${stateInfo.name} (2026) | SignalCamping`;
      desc  = `Top ${ranked.length} campgrounds in ${stateInfo.name} with ${carrierInfo.label} coverage, ranked by signal strength. Real tower-modeled data.`;
    } else if (type === "remote-work") {
      title = `Best Remote Work Campgrounds in ${stateInfo.name} (2026) | SignalCamping`;
      desc  = `Top ${ranked.length} campgrounds in ${stateInfo.name} for remote work, ranked by connectivity, signal, and proximity to services.`;
    } else {
      title = `Campgrounds with Strong Cell Service in ${stateInfo.name} (2026) | SignalCamping`;
      desc  = `Top ${ranked.length} campgrounds in ${stateInfo.name} with strong cell signal, ranked by signal quality score.`;
    }

    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = desc;
  }, [stateInfo, type, carrierInfo, ranked.length]);

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!stateInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <SiteHeader />
        <div className="container py-16 text-center max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-3">State Not Found</h1>
          <p className="text-gray-500 mb-6">We don&rsquo;t have data for that state yet.</p>
          <Link href="/top-campgrounds" className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Browse All Campgrounds
          </Link>
        </div>
      </div>
    );
  }

  // ── Build page copy ───────────────────────────────────────────────────────
  let h1 = "";
  let intro = "";
  let scoreLabel = "Signal Score";
  let scoreField = "signal_score";

  if (type === "carrier" && carrierInfo) {
    h1    = `Best Campgrounds with ${carrierInfo.label} Signal in ${stateInfo.name}`;
    intro = `${stateInfo.name} has ${ranked.length} campgrounds with confirmed or likely ${carrierInfo.label} coverage, ranked here by signal strength. Coverage is modeled from public tower location data and terrain-adjusted proximity calculations — real-world results may vary by device and conditions.`;
  } else if (type === "remote-work") {
    h1          = `Best Remote Work Campgrounds in ${stateInfo.name}`;
    intro       = `${stateInfo.name} has ${ranked.length} campgrounds suitable for remote work, ranked by a composite score that combines signal strength, carrier coverage, proximity to town, and highway access. These are the top options for campers who need to stay connected.`;
    scoreLabel  = "Remote Work Score";
    scoreField  = "remote_work_score";
  } else {
    h1          = `Campgrounds with Strong Cell Service in ${stateInfo.name}`;
    intro       = `${stateInfo.name} has ${ranked.length} campgrounds with strong cell service based on signal quality score — a metric that combines carrier coverage, tower proximity, and terrain. These are the most reliably connected campgrounds in the state.`;
    scoreLabel  = "Signal Quality";
    scoreField  = "signal_quality_score";
  }

  // Related ranking links for internal linking
  const relatedLinks = [
    type !== "carrier" || carrier !== "verizon"
      ? { href: `/best-campgrounds-with-verizon-signal-in/${stateKey}`, label: `Best Verizon Campgrounds in ${stateInfo.name}` }
      : null,
    type !== "carrier" || carrier !== "att"
      ? { href: `/best-campgrounds-with-att-signal-in/${stateKey}`, label: `Best AT&T Campgrounds in ${stateInfo.name}` }
      : null,
    type !== "carrier" || carrier !== "tmobile"
      ? { href: `/best-campgrounds-with-tmobile-signal-in/${stateKey}`, label: `Best T-Mobile Campgrounds in ${stateInfo.name}` }
      : null,
    type !== "remote-work"
      ? { href: `/best-remote-work-campgrounds-in/${stateKey}`, label: `Best Remote Work Campgrounds in ${stateInfo.name}` }
      : null,
    type !== "strong-signal"
      ? { href: `/campgrounds-with-strong-cell-service-in/${stateKey}`, label: `Strong Cell Service Campgrounds in ${stateInfo.name}` }
      : null,
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li>
            <Link href={`/campgrounds/${stateInfo.slug}`} className="hover:text-green-700 transition">
              {stateInfo.name}
            </Link>
          </li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium truncate max-w-[220px]">{h1}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container py-6">
        <div className="flex items-center gap-2 mb-2">
          {type === "carrier" && <Signal className="w-5 h-5 text-green-600" />}
          {type === "remote-work" && <Laptop className="w-5 h-5 text-blue-600" />}
          {type === "strong-signal" && <Wifi className="w-5 h-5 text-green-600" />}
          <Badge className="bg-green-100 text-green-700 text-xs">{ranked.length} Campgrounds</Badge>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {h1}
        </h1>
        <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">{intro}</p>
      </section>

      {/* Affiliate module — top-ranked campground as context */}
      {ranked.length > 0 && (
        <section className="container pb-6">
          <AffiliateRecommendations campground={ranked[0]} />
        </section>
      )}

      {/* Ranked list */}
      <section className="container pb-10">
        {ranked.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No campgrounds found for these criteria in {stateInfo.name}.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {ranked.map((cg, idx) => {
              const score = cg[scoreField] != null ? Math.round(cg[scoreField]) : null;
              const carriers: string[] = [];
              if (cg.verizon_coverage) carriers.push("Verizon");
              if (cg.att_coverage) carriers.push("AT&T");
              if (cg.tmobile_coverage) carriers.push("T-Mobile");

              return (
                <Link key={cg.slug} href={`/campground/${cg.slug}`}>
                  <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Rank */}
                        <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-bold flex items-center justify-center">
                          {idx + 1}
                        </div>

                        {/* Main */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="min-w-0">
                              <h2 className="font-semibold text-gray-900 text-sm leading-snug flex items-center gap-1.5 flex-wrap">
                                {cg.campground_name}
                                {cg.is_verified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                )}
                              </h2>
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {cg.city ? `${cg.city}, ` : ""}{cg.state_full || cg.state}
                              </p>
                            </div>
                            {score !== null && (
                              <div className="shrink-0 text-right">
                                <span className={`text-base font-bold ${scoreColor(score)}`}>{score}</span>
                                <span className="text-xs text-gray-400">/100</span>
                                <p className="text-[10px] text-gray-400 mt-0.5">{scoreLabel}</p>
                              </div>
                            )}
                          </div>

                          {/* Carrier badges + type */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              {(cg.campground_type || "campground").replace(/_/g, " ")}
                            </Badge>
                            {carriers.map(c => (
                              <Badge key={c} className="text-[10px] py-0 px-1.5 bg-green-50 text-green-700 border-green-200">
                                <Wifi className="w-2.5 h-2.5 mr-0.5" />{c}
                              </Badge>
                            ))}
                            {type === "remote-work" && cg.signal_score != null && (
                              <Badge className="text-[10px] py-0 px-1.5 bg-gray-50 text-gray-600 border-gray-200">
                                Signal {cg.signal_score}/100
                              </Badge>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 self-center" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Supporting copy */}
      <section className="container pb-8">
        <div className="prose prose-sm max-w-2xl text-gray-600 space-y-3">
          {type === "carrier" && carrierInfo && (
            <>
              <p>
                Signal data on SignalCamping is modeled from publicly available cell tower locations
                and terrain-adjusted proximity calculations. Campgrounds listed here have a confirmed
                or likely {carrierInfo.label} signal based on those models. Real-world reception can
                vary based on device, foliage, terrain, and network load.
              </p>
              <p>
                For the most accurate picture, check the individual campground page where we show
                distance to the nearest {carrierInfo.label} tower and compare it against the other
                two major carriers.
              </p>
            </>
          )}
          {type === "remote-work" && (
            <>
              <p>
                The remote work score on SignalCamping combines multiple factors: carrier coverage,
                signal quality, distance to the nearest town, and highway access. A score of 70 or
                above indicates conditions that generally support reliable video calls and file transfers.
              </p>
              <p>
                If you rely on connectivity for work, look for campgrounds with all three major carriers
                and a signal score above 70. These tend to offer the most consistent experience across
                different devices and usage patterns.
              </p>
            </>
          )}
          {type === "strong-signal" && (
            <>
              <p>
                Signal quality score is a composite metric that combines carrier coverage breadth,
                tower proximity, and terrain factors. Campgrounds with a score of 70 or above
                typically offer reliable connectivity for video calls, streaming, and remote work.
              </p>
              <p>
                Even at high-signal campgrounds, performance can vary by carrier, device, and
                campsite location. Check the individual campground pages for carrier-specific
                coverage details.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Related ranking pages — internal linking */}
      {relatedLinks.length > 0 && (
        <section className="container pb-10">
          <h2
            className="text-base font-semibold text-gray-700 mb-3"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            More Rankings for {stateInfo.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relatedLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Signal className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-gray-700 font-medium flex-1">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container text-center text-sm">
          <p>&copy; 2026 SignalCamping</p>
          <div className="flex justify-center gap-4 mt-2 text-xs flex-wrap">
            <Link href={`/campgrounds/${stateInfo.slug}`} className="hover:text-white transition">
              All {stateInfo.name} Campgrounds
            </Link>
            <Link href="/top-campgrounds" className="hover:text-white transition">Top Campgrounds</Link>
            <Link href="/best-remote-work-campgrounds" className="hover:text-white transition">Remote Work</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
