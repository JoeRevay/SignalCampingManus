/**
 * Best Campgrounds with Cell Service in Michigan's Upper Peninsula
 * Ranks the top 25 UP campgrounds by signal_score using the existing dataset.
 *
 * Includes: descriptive blurbs per listing, Related Signal Guides section.
 */
import { useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Signal, MapPin, ChevronRight, Wifi, Briefcase, CheckCircle2,
  ArrowLeft, Mountain
} from "lucide-react";
import campgroundsData from "@/data/campgrounds.json";
import {
  getCarrierLikelihood,
  LIKELIHOOD_STYLES,
  type CarrierLikelihood,
} from "@/lib/carrierLikelihood";
import { generateBlurb } from "@/lib/campgroundBlurb";
import RelatedSignalGuides from "@/components/RelatedSignalGuides";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

const parseBool = (v: any) => v === true || v === "True" || v === "Yes";

function CarrierBadge({ carrier, level }: { carrier: string; level: CarrierLikelihood }) {
  const style = LIKELIHOOD_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${style.bgClass} ${style.textClass} ${style.borderClass}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dotColor }} />
      {carrier}: {style.label}
    </span>
  );
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function UpperPeninsulaSignal() {
  useEffect(() => {
    document.title = "Best Cell Signal Campgrounds in Michigan's Upper Peninsula | SignalCamping";
  }, []);

  const upCampgrounds = useMemo(() => {
    return (campgroundsData as any[])
      .filter(cg => cg.state === "MI" && cg.latitude >= 45.0)
      .map(cg => ({
        ...cg,
        tent_sites: parseBool(cg.tent_sites),
        rv_sites: parseBool(cg.rv_sites),
        waterfront: parseBool(cg.waterfront),
        signal_score: cg.signal_score ?? 0,
        remote_work_score: cg.remote_work_score ?? 0,
      }))
      .sort((a, b) => b.signal_score - a.signal_score)
      .slice(0, 25);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/20">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Signal className="w-5 h-5 text-green-700" />
              <span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/best-remote-work-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700">Remote Work</Button>
            </Link>
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700">All Campgrounds</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Map
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-800 via-green-900 to-emerald-900 text-white py-12">
        <div className="container">
          <Link href="/campgrounds/mi">
            <span className="inline-flex items-center gap-1 text-green-300 text-sm hover:text-green-200 mb-3 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Michigan Campgrounds
            </span>
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-1">
              <Mountain className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Best Campgrounds with Cell Service in Michigan's Upper Peninsula
              </h1>
              <p className="text-green-100 max-w-2xl leading-relaxed text-sm md:text-base">
                Cell service in Michigan's Upper Peninsula can be unpredictable. SignalCamping analyzed campgrounds
                across the region using signal scores derived from tower proximity and connectivity modeling to identify
                locations most likely to have reliable cellular coverage.
              </p>
              <p className="text-green-200/80 mt-2 text-sm">
                This page ranks the best locations for campers who want to stay connected while visiting the U.P.
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold">{upCampgrounds.length}</div>
              <div className="text-[11px] text-green-300">Top Ranked</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold">
                {upCampgrounds.length > 0 ? Math.round(upCampgrounds.reduce((s, c) => s + c.signal_score, 0) / upCampgrounds.length) : 0}
              </div>
              <div className="text-[11px] text-green-300">Avg Signal Score</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold">
                {upCampgrounds.filter(c => c.is_verified).length}
              </div>
              <div className="text-[11px] text-green-300">Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rankings */}
      <section className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Signal className="w-5 h-5 text-green-700" />
          <h2 className="text-lg font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Top 25 by Signal Score
          </h2>
        </div>

        <div className="space-y-3">
          {upCampgrounds.map((cg, i) => {
            const likelihood = getCarrierLikelihood(cg);
            const signalColor = cg.signal_score >= 70 ? "#16a34a" : cg.signal_score >= 40 ? "#d97706" : "#dc2626";
            const rwColor = cg.remote_work_score >= 70 ? "#16a34a" : cg.remote_work_score >= 40 ? "#d97706" : "#dc2626";
            const blurb = generateBlurb(cg);

            return (
              <Link key={cg.slug + i} href={`/campground/${cg.slug}`}>
                <Card className="hover:shadow-md transition cursor-pointer group">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start gap-3">
                      {/* Rank */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
                        i < 3 ? "bg-green-700 text-white" : i < 10 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {i + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm md:text-base truncate group-hover:text-green-700 transition">
                            {cg.campground_name}
                          </h3>
                          {cg.is_verified && (
                            <Badge className="bg-green-100 text-green-800 text-[10px] shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 inline mr-0.5" />
                          {cg.city ? `${cg.city}, ` : ""}{STATE_NAMES[cg.state] || cg.state}
                          {cg.campground_type && (
                            <span className="ml-2 text-gray-400">· {(cg.campground_type || "").replace(/_/g, " ")}</span>
                          )}
                        </p>

                        {/* Blurb */}
                        <p className="text-xs text-gray-600 leading-relaxed mb-3 italic">
                          {blurb}
                        </p>

                        {/* Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Wifi className="w-3 h-3" /> Signal Score
                              </span>
                              <span className="text-xs font-bold" style={{ color: signalColor }}>{cg.signal_score}</span>
                            </div>
                            <ScoreBar value={cg.signal_score} color={signalColor} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> Remote Work
                              </span>
                              <span className="text-xs font-bold" style={{ color: rwColor }}>{Math.round(cg.remote_work_score)}</span>
                            </div>
                            <ScoreBar value={cg.remote_work_score} color={rwColor} />
                          </div>
                        </div>

                        {/* Carrier Likelihood */}
                        <div className="flex flex-wrap gap-1.5">
                          <CarrierBadge carrier="Verizon" level={likelihood.verizon} />
                          <CarrierBadge carrier="AT&T" level={likelihood.att} />
                          <CarrierBadge carrier="T-Mobile" level={likelihood.tmobile} />
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50/60 border border-amber-200/60 rounded-lg">
          <p className="text-xs text-amber-800/80 leading-relaxed">
            <strong>Note:</strong> Signal scores are modeled from publicly available tower and coverage data.
            Actual service may vary depending on terrain, weather, and network conditions.
            The Upper Peninsula's rugged geography means coverage can change significantly over short distances.
            Always have offline maps and emergency plans when camping in remote areas.
          </p>
        </div>

        {/* Related Signal Guides */}
        <RelatedSignalGuides exclude="/best-cell-signal-campgrounds-upper-peninsula" />

        {/* Related Links */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/campgrounds/mi">
            <Button variant="outline" size="sm" className="text-xs">
              <MapPin className="w-3.5 h-3.5 mr-1" /> All Michigan Campgrounds
            </Button>
          </Link>
          <Link href="/top-campgrounds">
            <Button variant="outline" size="sm" className="text-xs">
              <Signal className="w-3.5 h-3.5 mr-1" /> All Campgrounds
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container text-center text-sm">&copy; 2026 SignalCamping</div>
      </footer>
    </div>
  );
}
