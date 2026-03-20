/**
 * RemoteWorkLanding — Per-state remote work campground rankings.
 * Route: /remote-work-camping/:state
 */
import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Laptop, MapPin, ChevronRight, ChevronDown, ChevronUp,
  Wifi, Building2, Navigation, CheckCircle2, Info, ArrowLeft,
} from "lucide-react";
import {
  getCarrierLikelihood,
  LIKELIHOOD_STYLES,
  CARRIER_DISCLAIMER,
  type CarrierLikelihood,
} from "@/lib/carrierLikelihood";
import {
  generateRankingDescription,
  filterForRanking,
  sortByRemoteWork,
} from "@/lib/rankingUtils";
import rawData from "@/data/campgrounds.json";
import SiteHeader from "@/components/SiteHeader";

const STATE_MAP: Record<string, { code: string; name: string }> = {
  mi: { code: "MI", name: "Michigan" },
  oh: { code: "OH", name: "Ohio" },
  pa: { code: "PA", name: "Pennsylvania" },
  wi: { code: "WI", name: "Wisconsin" },
};

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#2563eb";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ color }}>{Math.round(score)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, score)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function CarrierBadge({ carrier, level }: { carrier: string; level: CarrierLikelihood }) {
  const style = LIKELIHOOD_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.bgClass} ${style.textClass} ${style.borderClass}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dotColor }} />
      {carrier}: {style.label}
    </span>
  );
}

export default function RemoteWorkLanding() {
  const params = useParams<{ state: string }>();
  const stateSlug = params.state?.toLowerCase() || "";
  const stateInfo = STATE_MAP[stateSlug];

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const ranked = useMemo(() => {
    if (!stateInfo) return [];
    const stateCgs = (rawData as any[]).filter(
      cg => cg.state === stateInfo.code && cg.remote_work_score != null && cg.remote_work_score >= 60
    );
    const filtered = filterForRanking(stateCgs);
    return sortByRemoteWork(filtered).slice(0, 50);
  }, [stateInfo]);

  useEffect(() => {
    if (!stateInfo) {
      document.title = "Remote Work Campgrounds | SignalCamping";
      return;
    }
    document.title = `Best Remote Work Campgrounds in ${stateInfo.name} | SignalCamping`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = `Find the best campgrounds in ${stateInfo.name} for remote work. ${ranked.length} campgrounds ranked by remote work score — combining signal coverage, town proximity, and highway access.`;
  }, [stateInfo, ranked.length]);

  if (!stateInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/20">
        <SiteHeader />
        <div className="container py-16 text-center max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">State Not Found</h2>
          <Link href="/best-remote-work-campgrounds">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white">View All Remote Work Rankings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/20">
      <SiteHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-blue-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/best-remote-work-campgrounds" className="hover:text-blue-700 transition">Remote Work Rankings</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href={`/campgrounds/${stateSlug}`} className="hover:text-blue-700 transition">{stateInfo.name}</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">Remote Work</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 py-12 mt-2">
        <div className="container">
          <div className="max-w-2xl">
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 mb-4 text-xs">
              <Laptop className="w-3 h-3 mr-1" /> Remote Work Rankings &middot; {stateInfo.name}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Remote Work Campgrounds in{" "}
              <span className="text-blue-300">{stateInfo.name}</span>
            </h1>
            <p className="text-base text-white/70 leading-relaxed mb-6">
              {ranked.length} campgrounds in {stateInfo.name} ranked by remote work score — a composite of
              signal coverage, proximity to towns, and highway access. Only campgrounds scoring 60 or above are included.
              Real-world connectivity may vary.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-blue-300" /> Signal Coverage: 70%
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-300" /> Town Proximity: 20%
              </span>
              <span className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-blue-300" /> Highway Access: 10%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Nav back to state */}
      <div className="container pt-6 pb-2 flex items-center gap-3">
        <Link href={`/campgrounds/${stateSlug}`}>
          <Button variant="outline" size="sm" className="text-xs text-gray-600 border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> All {stateInfo.name} Campgrounds
          </Button>
        </Link>
        <Link href="/best-remote-work-campgrounds">
          <Button variant="outline" size="sm" className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50">
            All-States Remote Work Rankings
          </Button>
        </Link>
      </div>

      {/* Rankings */}
      <section className="py-6">
        <div className="container max-w-4xl">

          {ranked.length === 0 ? (
            <div className="text-center py-20">
              <Laptop className="w-10 h-10 mx-auto mb-4 text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-700 mb-2">No results for {stateInfo.name}</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                No campgrounds in {stateInfo.name} currently score 60 or above on the remote work scale.
                Try browsing all campgrounds in the state or view the cross-state rankings.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href={`/campgrounds/${stateSlug}`}>
                  <Button variant="outline">Browse {stateInfo.name} Campgrounds</Button>
                </Link>
                <Link href="/best-remote-work-campgrounds">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-white">All-States Rankings</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-muted-foreground">
                  Showing <strong>{ranked.length}</strong> campgrounds with remote work score ≥ 60
                </p>
                <Badge variant="outline" className="text-xs">
                  {ranked.filter(c => c.is_verified).length} verified
                </Badge>
              </div>

              <div className="space-y-3">
                {ranked.map((cg: any, idx: number) => {
                  const likelihood = getCarrierLikelihood(cg);
                  const isExpanded = expandedIdx === idx;
                  const sc = scoreColor(cg.remote_work_score);
                  const sqs = cg.signal_quality_score ?? cg.signal_score ?? 0;
                  const description = generateRankingDescription(cg);

                  return (
                    <Card
                      key={cg.slug}
                      className={`transition-all duration-200 hover:shadow-md ${isExpanded ? "ring-1 ring-blue-200 shadow-md" : ""}`}
                    >
                      <CardContent className="p-0">
                        {/* Main row — click to expand */}
                        <div
                          className="flex items-center gap-3 sm:gap-4 p-4 cursor-pointer"
                          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                        >
                          {/* Rank */}
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm sm:text-base"
                            style={{
                              backgroundColor: idx < 3 ? sc + "15" : "#f5f5f5",
                              color: idx < 3 ? sc : "#6b7280",
                            }}
                          >
                            {idx + 1}
                          </div>

                          {/* Name & location */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-semibold text-sm sm:text-base hover:text-blue-700 transition-colors"
                                style={{ fontFamily: "Space Grotesk, sans-serif" }}
                              >
                                {cg.campground_name}
                              </span>
                              {cg.is_verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{cg.city ? `${cg.city}, ` : ""}{stateInfo.name}</span>
                              <span className="text-gray-300">|</span>
                              <span className="capitalize">{(cg.campground_type ?? "").replace(/_/g, " ")}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1.5 hidden sm:block">
                              {description}
                            </p>
                          </div>

                          {/* Remote work score */}
                          <div className="text-right shrink-0">
                            <div
                              className="text-xl sm:text-2xl font-bold"
                              style={{ color: sc, fontFamily: "Space Grotesk, sans-serif" }}
                            >
                              {Math.round(cg.remote_work_score)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">RW Score</div>
                          </div>

                          {/* Expand toggle */}
                          <div className="shrink-0 text-gray-400">
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4" />
                              : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4 bg-gray-50/50">
                            <p className="text-xs text-gray-500 leading-relaxed sm:hidden">{description}</p>

                            {/* Score breakdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <ScoreBar score={cg.remote_work_score} label="Remote Work Score" color="#2563eb" />
                                <div>
                                  <ScoreBar score={cg.signal_score ?? 0} label="Signal Score" color="#16a34a" />
                                  <p className="text-[10px] text-gray-400 mt-0.5">Quality: {sqs}</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Carriers Detected</span>
                                  <span className="font-medium">{cg.carrier_count ?? "—"} of 3</span>
                                </div>
                                {cg.nearest_town && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nearest Town</span>
                                    <span className="font-medium text-right text-xs">{cg.nearest_town}</span>
                                  </div>
                                )}
                                {cg.distance_to_town_miles != null && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Distance to Town</span>
                                    <span className="font-medium">{cg.distance_to_town_miles.toFixed(1)} mi</span>
                                  </div>
                                )}
                                {cg.distance_to_highway_miles != null && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Distance to Highway</span>
                                    <span className="font-medium">{cg.distance_to_highway_miles.toFixed(1)} mi</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Carrier likelihood */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Carrier Likelihood</p>
                              <div className="flex flex-wrap gap-2">
                                <CarrierBadge carrier="Verizon" level={likelihood.verizon} />
                                <CarrierBadge carrier="AT&T" level={likelihood.att} />
                                <CarrierBadge carrier="T-Mobile" level={likelihood.tmobile} />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-1">
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 max-w-xs">
                                <Info className="w-3 h-3 shrink-0" />
                                {CARRIER_DISCLAIMER}
                              </p>
                              <Link href={`/campground/${cg.slug}`}>
                                <Button size="sm" variant="outline" className="text-xs">View Details</Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Methodology note */}
              <Card className="mt-10 border-blue-100 bg-blue-50/30">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    <Info className="w-4 h-4 text-blue-600" /> How Remote Work Score is Calculated
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The remote work score is a weighted composite of three factors: <strong>cellular signal coverage</strong> (70% weight)
                    based on tower proximity data, <strong>distance to the nearest town</strong> with 10,000+ population (20% weight),
                    and <strong>distance to the nearest highway</strong> (10% weight). Scores range from 0 to 100.
                    A score of 80+ indicates strong remote work viability; 60–79 is moderate.
                    This page only includes {stateInfo.name} campgrounds scoring 60 or above.
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">{CARRIER_DISCLAIMER}</p>
                </CardContent>
              </Card>

              {/* Cross-links */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href={`/campgrounds/${stateSlug}`} className="flex-1">
                  <Button variant="outline" className="w-full text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> All {stateInfo.name} Campgrounds
                  </Button>
                </Link>
                <Link href="/best-remote-work-campgrounds" className="flex-1">
                  <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm">
                    All-States Remote Work Rankings <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-8 mt-8">
        <div className="container text-center text-sm">
          &copy; 2026 SignalCamping &mdash; Find campgrounds where your phone works, or where it doesn&rsquo;t.
        </div>
      </footer>
    </div>
  );
}
