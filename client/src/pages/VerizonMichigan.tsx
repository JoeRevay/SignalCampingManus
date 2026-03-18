/**
 * VerizonMichigan — Top Michigan campgrounds with Verizon signal.
 *
 * Sorted by signal_quality_score descending. Filtered for quality.
 * Displays signal_score as user-facing, signal_quality_score as secondary.
 */
import { useMemo, useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Signal, MapPin, ChevronRight, ChevronDown, ChevronUp,
  CheckCircle2, Wifi, Laptop, ArrowLeft
} from "lucide-react";
import {
  getCarrierLikelihood, type CarrierLikelihood, LIKELIHOOD_STYLES
} from "@/lib/carrierLikelihood";
import { generateRankingDescription, filterForBestSignal, sortBySignalQuality } from "@/lib/rankingUtils";
import RelatedSignalGuides from "@/components/RelatedSignalGuides";
import rawData from "@/data/campgrounds.json";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-400";
}

export default function VerizonMichigan() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const ranked = useMemo(() => {
    const miVerizon = (rawData as any[]).filter(cg => cg.state === "MI" && cg.verizon_coverage === true);
    const filtered = filterForBestSignal(miVerizon, 85);
    return sortBySignalQuality(filtered).slice(0, 25);
  }, []);

  const avgSignal = useMemo(() => {
    if (!ranked.length) return 0;
    return Math.round(ranked.reduce((s, c) => s + (c.signal_score ?? 0), 0) / ranked.length);
  }, [ranked]);

  const avgRemote = useMemo(() => {
    if (!ranked.length) return 0;
    return Math.round(ranked.reduce((s, c) => s + (c.remote_work_score ?? 0), 0) / ranked.length);
  }, [ranked]);

  const verifiedCount = useMemo(() => ranked.filter(c => c.is_verified).length, [ranked]);

  useEffect(() => {
    document.title = "Best Campgrounds with Verizon Signal in Michigan | SignalCamping";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = "Top Michigan campgrounds ranked by Verizon signal quality using tower proximity analysis.";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-red-50/20">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
                  <Signal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</h2>
                  <p className="text-[10px] text-muted-foreground leading-none">Where your phone works &mdash; or doesn&rsquo;t</p>
                </div>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/campgrounds/mi">
                <Button variant="ghost" size="sm" className="text-xs text-green-700">Michigan</Button>
              </Link>
              <Link href="/top-campgrounds">
                <Button variant="ghost" size="sm" className="text-xs text-green-700">All Campgrounds</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700 hover:bg-green-50">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/campgrounds/mi" className="hover:text-green-700 transition">Michigan</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">Best Verizon Signal</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container py-8">
        <div className="max-w-3xl">
          <Badge className="bg-red-100 text-red-800 border-red-200 mb-3">Verizon Coverage</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Best Campgrounds with Verizon Signal in Michigan
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Rankings are based on tower proximity analysis using signal_quality_score, which measures
            how close each campground is to Verizon cell towers. Only campgrounds with a quality score
            of 85 or higher are included. Real-world performance may vary by terrain, weather, and device.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Ranked", value: String(ranked.length), sub: "campgrounds" },
              { label: "Avg Signal", value: String(avgSignal), sub: "out of 100" },
              { label: "Avg Remote", value: String(avgRemote), sub: "work score" },
              { label: "Verified", value: String(verifiedCount), sub: "official sources" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ranked List */}
      <section className="container pb-12">
        <div className="space-y-2">
          {ranked.map((cg: any, idx: number) => {
            const likelihood = getCarrierLikelihood(cg);
            const expanded = expandedIdx === idx;
            const sqs = cg.signal_quality_score ?? cg.signal_score ?? 0;
            const description = generateRankingDescription(cg);

            return (
              <Card
                key={cg.slug + idx}
                className="hover:shadow-md hover:border-red-200 transition cursor-pointer"
                onClick={() => setExpandedIdx(expanded ? null : idx)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Rank */}
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0 text-sm font-bold text-red-700">
                      {idx + 1}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {cg.campground_name}
                        </h3>
                        {cg.is_verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {cg.city ? `${cg.city}, ` : ""}Michigan
                        {cg.campground_type && (
                          <Badge variant="outline" className="text-[10px] ml-2">{(cg.campground_type || "").replace(/_/g, " ")}</Badge>
                        )}
                      </p>

                      {/* Data-driven description */}
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        {description}
                      </p>

                      {/* Score bars */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Signal className={`w-3.5 h-3.5 ${scoreColor(cg.signal_score ?? 0)}`} />
                          <span className="text-xs text-gray-500">Signal</span>
                          <span className={`text-xs font-bold ${scoreColor(cg.signal_score ?? 0)}`}>{cg.signal_score ?? "—"}</span>
                          <span className="text-[10px] text-gray-400 ml-0.5">Q:{sqs}</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreBg(cg.signal_score ?? 0)}`} style={{ width: `${cg.signal_score ?? 0}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Laptop className={`w-3.5 h-3.5 ${scoreColor(cg.remote_work_score ?? 0)}`} />
                          <span className="text-xs text-gray-500">Remote</span>
                          <span className={`text-xs font-bold ${scoreColor(cg.remote_work_score ?? 0)}`}>{Math.round(cg.remote_work_score ?? 0)}</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreBg(cg.remote_work_score ?? 0)}`} style={{ width: `${cg.remote_work_score ?? 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Carrier badges - always visible */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          { name: "Verizon", level: likelihood.verizon },
                          { name: "AT&T", level: likelihood.att },
                          { name: "T-Mobile", level: likelihood.tmobile },
                        ].map(c => {
                          const style = LIKELIHOOD_STYLES[c.level];
                          return (
                            <span key={c.name} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${style.bgClass} ${style.textClass} ${style.borderClass}`}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dotColor }} />
                              {c.name}: {style.label}
                            </span>
                          );
                        })}
                      </div>

                      {/* Expanded detail */}
                      {expanded && (
                        <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                          {/* Extra info */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {cg.nearest_town && (
                              <div className="text-gray-500">
                                <span className="font-medium text-gray-600">Town:</span> {cg.nearest_town}
                                {cg.distance_to_town_miles != null && ` (${cg.distance_to_town_miles} mi)`}
                              </div>
                            )}
                            {cg.distance_to_highway_miles != null && (
                              <div className="text-gray-500">
                                <span className="font-medium text-gray-600">Highway:</span> {cg.distance_to_highway_miles} mi
                              </div>
                            )}
                          </div>

                          {/* Link to detail */}
                          <Link href={`/campground/${cg.slug}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-700 hover:bg-red-50 mt-1">
                              View Campground Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Expand icon */}
                    <div className="shrink-0 mt-1">
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container pb-8">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-600">Note:</strong> Rankings use signal_quality_score based on
            tower proximity analysis. Signal scores and carrier likelihood are modeled from publicly available
            tower and coverage data. Actual service may vary depending on terrain, weather, device, and network
            conditions. Verizon is a registered trademark of Verizon Communications Inc. SignalCamping is not
            affiliated with Verizon.
          </p>
        </div>
      </section>

      {/* Related Signal Guides */}
      <section className="container pb-12">
        <RelatedSignalGuides exclude="/best-verizon-signal-campgrounds-michigan" />

        {/* Back navigation */}
        <div className="mt-4 flex gap-3 flex-wrap">
          <Link href="/campgrounds/mi">
            <Button variant="outline" className="text-sm border-green-200 text-green-700 hover:bg-green-50">
              <ArrowLeft className="w-4 h-4 mr-1" /> All Michigan Campgrounds
            </Button>
          </Link>
          <Link href="/top-campgrounds">
            <Button variant="outline" className="text-sm border-green-200 text-green-700 hover:bg-green-50">
              <Signal className="w-4 h-4 mr-1" /> All Campgrounds
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
        <div className="container text-center">
          <p className="text-sm">&copy; 2026 SignalCamping &mdash; Find campgrounds where your phone works, or where it doesn&rsquo;t.</p>
        </div>
      </footer>
    </div>
  );
}
