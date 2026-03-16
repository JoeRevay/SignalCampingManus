/**
 * BestRemoteWork — Top 50 Campgrounds for Remote Work
 *
 * Ranks campgrounds by remote_work_score descending.
 * Shows carrier likelihood, signal score, town/highway proximity.
 * Uses existing dataset — no data rebuild.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Signal, MapPin, Wifi, Laptop, ArrowLeft, ChevronDown, ChevronUp,
  Navigation, Building2, CheckCircle2, Info
} from "lucide-react";
import {
  getCarrierLikelihood,
  LIKELIHOOD_STYLES,
  CARRIER_DISCLAIMER,
  type CarrierLikelihood,
} from "@/lib/carrierLikelihood";

import rawData from "@/data/campgrounds.json";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

interface Campground {
  campground_name: string;
  slug: string;
  state: string;
  city: string;
  campground_type: string;
  remote_work_score: number;
  signal_score: number;
  carrier_count: number;
  verizon_coverage: boolean;
  att_coverage: boolean;
  tmobile_coverage: boolean;
  distance_to_town_miles: number | null;
  nearest_town: string;
  distance_to_highway_miles: number | null;
  is_verified: boolean;
  latitude: number;
  longitude: number;
  [key: string]: any;
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

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#2563eb";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

export default function BestRemoteWork() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const top50 = useMemo(() => {
    return (rawData as Campground[])
      .filter(cg => cg.remote_work_score != null && cg.remote_work_score > 0)
      .sort((a, b) => b.remote_work_score - a.remote_work_score)
      .slice(0, 50);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/20">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
                  <Signal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</h1>
                  <p className="text-[10px] text-muted-foreground leading-none">Where your phone works &mdash; or doesn&rsquo;t</p>
                </div>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs text-green-700">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Home
                </Button>
              </Link>
              <Link href="/top-campgrounds">
                <Button variant="ghost" size="sm" className="text-xs text-green-700 hidden sm:inline-flex">
                  All Campgrounds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 py-14 sm:py-20">
        <div className="container">
          <div className="max-w-2xl">
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 mb-4 text-xs">
              <Laptop className="w-3 h-3 mr-1" /> Remote Work Rankings
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Best Campgrounds for{" "}
              <span className="text-blue-300">Remote Work</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-6">
              These campgrounds are ranked using SignalCamping&rsquo;s <strong className="text-white/90">remote_work_score</strong>, a composite metric based on cellular signal coverage (70%), proximity to the nearest town with 10,000+ population (20%), and distance to the nearest highway (10%).
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

      {/* Rankings */}
      <section className="py-10">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing the top <strong>50</strong> campgrounds by remote work score
            </p>
            <Badge variant="outline" className="text-xs">
              {top50.filter(c => c.is_verified).length} verified
            </Badge>
          </div>

          <div className="space-y-3">
            {top50.map((cg, idx) => {
              const likelihood = getCarrierLikelihood(cg);
              const isExpanded = expandedIdx === idx;
              const sc = scoreColor(cg.remote_work_score);

              return (
                <Card
                  key={cg.slug}
                  className={`transition-all duration-200 hover:shadow-md ${isExpanded ? "ring-1 ring-blue-200 shadow-md" : ""}`}
                >
                  <CardContent className="p-0">
                    {/* Main row */}
                    <div
                      className="flex items-center gap-3 sm:gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    >
                      {/* Rank */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm sm:text-base"
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
                          <Link href={`/campground/${cg.slug}`}>
                            <span className="font-semibold text-sm sm:text-base hover:text-blue-700 transition-colors" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                              {cg.campground_name}
                            </span>
                          </Link>
                          {cg.is_verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{cg.city ? `${cg.city}, ` : ""}{STATE_NAMES[cg.state] || cg.state}</span>
                          <span className="text-gray-300">|</span>
                          <span className="capitalize">{cg.campground_type?.replace(/_/g, " ")}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <div className="text-xl sm:text-2xl font-bold" style={{ color: sc, fontFamily: "Space Grotesk, sans-serif" }}>
                          {Math.round(cg.remote_work_score)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">RW Score</div>
                      </div>

                      {/* Expand toggle */}
                      <div className="shrink-0 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4 bg-gray-50/50">
                        {/* Score breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <ScoreBar score={cg.remote_work_score} label="Remote Work Score" color="#2563eb" />
                            <ScoreBar score={cg.signal_score} label="Signal Score" color="#16a34a" />
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Carriers Detected</span>
                              <span className="font-medium">{cg.carrier_count} of 3</span>
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
                            <Button size="sm" variant="outline" className="text-xs">
                              View Details
                            </Button>
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
                The remote work score is a weighted composite of three factors: <strong>cellular signal coverage</strong> (70% weight) based on tower proximity data from FCC and OpenCellID, <strong>distance to the nearest town</strong> with 10,000+ population (20% weight), and <strong>distance to the nearest highway</strong> (10% weight). Scores range from 0 to 100. A score of 80+ indicates strong remote work viability; 60&ndash;79 is moderate; below 60 may present connectivity challenges.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                {CARRIER_DISCLAIMER}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-8">
        <div className="container text-center text-sm">
          &copy; 2026 SignalCamping &mdash; Find campgrounds where your phone works, or where it doesn&rsquo;t.
        </div>
      </footer>
    </div>
  );
}
