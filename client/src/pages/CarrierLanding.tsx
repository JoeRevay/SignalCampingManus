/**
 * CarrierLanding — SEO landing page for carrier-specific campground signal coverage.
 * Supports: Verizon (/campgrounds-with-verizon-signal/:state)
 *           AT&T   (/campgrounds-with-att-signal/:state)
 *           T-Mobile (/campgrounds-with-tmobile-signal/:state)
 *
 * Carrier is inferred from window.location.pathname since all three routes
 * share this component. State is a wouter route param (lowercase 2-letter code).
 *
 * Ranking: signal_score descending — the same metric used across all other pages.
 * Filter:  verizon_coverage / att_coverage / tmobile_coverage === true
 */
import { useMemo, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Signal, MapPin, ChevronRight, Wifi, Info,
  Briefcase, CheckCircle2, HelpCircle,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import campgroundsRaw from "@/data/campgrounds.json";

// ── Types ────────────────────────────────────────────────────────────────────

interface Campground {
  slug: string;
  campground_name: string;
  state: string;
  state_full?: string;
  city?: string;
  campground_type?: string;
  signal_score?: number;
  remote_work_score?: number;
  verizon_coverage?: boolean;
  att_coverage?: boolean;
  tmobile_coverage?: boolean;
  carrier_count?: number;
  is_verified?: boolean;
  nearest_verizon_distance_km?: number | null;
  nearest_att_distance_km?: number | null;
  nearest_tmobile_distance_km?: number | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const campgrounds: Campground[] = campgroundsRaw as Campground[];

const STATE_MAP: Record<string, { code: string; name: string }> = {
  mi: { code: "MI", name: "Michigan" },
  oh: { code: "OH", name: "Ohio" },
  pa: { code: "PA", name: "Pennsylvania" },
  wi: { code: "WI", name: "Wisconsin" },
  wv: { code: "WV", name: "West Virginia" },
};

type CarrierKey = "verizon" | "att" | "tmobile";

interface CarrierConfig {
  key: CarrierKey;
  label: string;
  fullName: string;
  coverageField: keyof Campground;
  distanceField: keyof Campground;
  color: string;
  tagColor: string;
  intro: string[];
  faqs: { q: string; a: string }[];
}

const CARRIERS: Record<CarrierKey, CarrierConfig> = {
  verizon: {
    key: "verizon",
    label: "Verizon",
    fullName: "Verizon Wireless",
    coverageField: "verizon_coverage",
    distanceField: "nearest_verizon_distance_km",
    color: "text-red-700",
    tagColor: "bg-red-50 text-red-700 border-red-200",
    intro: [
      "Verizon has the largest 4G LTE rural footprint of any U.S. carrier, making it the top choice for campers who need reliable coverage away from major cities. Its extensive tower network reaches many campgrounds in the Great Lakes region that AT&T and T-Mobile simply don't cover.",
      "In Michigan, Ohio, Pennsylvania, and Wisconsin, Verizon's network tends to perform well near lakeshores, state forest roads, and campgrounds within 10–15 miles of small towns. The carrier's investment in rural infrastructure — including many towers on or near public lands — gives it a real edge for outdoor use.",
      "SignalCamping models Verizon coverage using publicly available tower location data, campground coordinates, and terrain-adjusted proximity calculations. Campgrounds listed here have a confirmed or likely Verizon signal based on those models. Real-world results can vary by terrain, device, and network conditions.",
      "On this page you'll find campgrounds in this state where Verizon signal is modeled as available, ranked by overall signal score. Each listing shows the campground's signal strength, remote work suitability, and a direct link to the full detail page.",
    ],
    faqs: [
      {
        q: "Does Verizon work well at campgrounds in the Great Lakes region?",
        a: "Generally yes — Verizon has the broadest rural coverage in the Midwest. Michigan state parks, Ohio campgrounds near Lake Erie, and Pennsylvania forests are well-served. Remote backcountry sites may still have gaps, but most established campgrounds within 15 miles of a town should get a signal.",
      },
      {
        q: "Is Verizon better than AT&T or T-Mobile for camping?",
        a: "For rural camping in this region, Verizon typically edges out AT&T and T-Mobile because of its larger tower count in non-urban areas. T-Mobile's network has improved significantly, but Verizon remains the most consistent choice for campgrounds far from major highways.",
      },
      {
        q: "Can I work remotely from a campground using Verizon?",
        a: "Yes, at campgrounds with strong Verizon signal (score 70+), most remote work tasks — video calls, file uploads, email — should work reliably. Lower-scored campgrounds may handle calls and light browsing but struggle with sustained video conferencing. Check the Remote Work score on each listing.",
      },
      {
        q: "How accurate is the Verizon coverage data?",
        a: "SignalCamping uses modeled data based on tower proximity and publicly available infrastructure records. It's directionally accurate but not a substitute for checking Verizon's official coverage map. Actual signal varies by device, terrain, and network load.",
      },
      {
        q: "Which states have the most campgrounds with Verizon coverage?",
        a: "Pennsylvania and Michigan have the highest counts of campgrounds with modeled Verizon coverage in our dataset, followed by Wisconsin and Ohio. Pennsylvania's campground density and Verizon's strong rural PA network make it the best-covered state in our region.",
      },
    ],
  },

  att: {
    key: "att",
    label: "AT&T",
    fullName: "AT&T Wireless",
    coverageField: "att_coverage",
    distanceField: "nearest_att_distance_km",
    color: "text-blue-700",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    intro: [
      "AT&T offers solid rural coverage across the Great Lakes region, with a network that performs well near established campgrounds, state parks, and recreation areas that see moderate visitor traffic. While Verizon has a slight edge in the most remote backcountry, AT&T is competitive for the vast majority of drive-up and established campground sites.",
      "In Ohio and Pennsylvania especially, AT&T's network density is strong enough to serve most campgrounds within 10 miles of a town. Michigan's Upper Peninsula and Wisconsin's Northwoods are trickier — AT&T coverage tends to thin out faster than Verizon in those areas.",
      "SignalCamping's AT&T coverage model uses tower location data and campground coordinates to estimate likely coverage. Campgrounds on this page have a modeled AT&T signal presence — they're a starting point for trip planning, not a guarantee of service.",
      "Browse the ranked list below to find campgrounds in this state where AT&T signal is modeled as available. Each listing shows a signal score, remote work rating, and link to the full campground page.",
    ],
    faqs: [
      {
        q: "Does AT&T work well at campgrounds?",
        a: "AT&T performs well at most established campgrounds within 10–15 miles of towns or highways. State parks and well-trafficked recreation areas tend to have decent AT&T coverage. More remote sites — especially in the UP or deep Northwoods — may see reduced or no signal.",
      },
      {
        q: "How does AT&T compare to Verizon for camping in this region?",
        a: "Verizon generally has a slight advantage in the most rural parts of Michigan, Wisconsin, and Pennsylvania. AT&T is competitive in Ohio and in campgrounds near Interstate corridors. For state parks and established campgrounds, both carriers perform similarly.",
      },
      {
        q: "Can I use AT&T for remote work at campgrounds?",
        a: "Campgrounds with a strong AT&T signal (score 70+) can support video calls, email, and file transfers. Plan for variability at sites with moderate scores. Always check the signal score and remote work rating on the individual campground page.",
      },
      {
        q: "Is FirstNet on AT&T available at campgrounds?",
        a: "FirstNet is built on AT&T's network and uses the same tower infrastructure. Where AT&T has signal, FirstNet subscribers may get priority access — useful if the network is congested at busy campgrounds during peak season.",
      },
      {
        q: "How is AT&T coverage modeled on SignalCamping?",
        a: "We use publicly available tower location data combined with campground coordinates to estimate proximity-based coverage likelihood. It's a directional model — useful for trip planning but not a replacement for AT&T's official coverage map.",
      },
    ],
  },

  tmobile: {
    key: "tmobile",
    label: "T-Mobile",
    fullName: "T-Mobile",
    coverageField: "tmobile_coverage",
    distanceField: "nearest_tmobile_distance_km",
    color: "text-pink-700",
    tagColor: "bg-pink-50 text-pink-700 border-pink-200",
    intro: [
      "T-Mobile has made aggressive strides in rural coverage over the last several years, particularly since its merger with Sprint. Its 600 MHz low-band spectrum travels farther and penetrates terrain better than higher-frequency signals, giving it improved reach at campgrounds that were previously dead zones.",
      "In the Great Lakes region, T-Mobile coverage has caught up significantly in Ohio, Pennsylvania, and parts of southern Michigan. Wisconsin's Northwoods and Michigan's Upper Peninsula still present challenges, but T-Mobile's continued rural buildout is closing the gap with Verizon.",
      "SignalCamping models T-Mobile coverage using publicly available tower data and campground location coordinates. The campgrounds listed here have a modeled T-Mobile presence — useful for planning, but real-world signal varies by terrain, device, and network changes.",
      "Use this page to find campgrounds in the selected state where T-Mobile signal is estimated to be available. Each entry is ranked by overall signal score and includes a remote work rating for digital nomads and work-from-anywhere campers.",
    ],
    faqs: [
      {
        q: "Has T-Mobile improved its rural camping coverage?",
        a: "Yes — T-Mobile's rural coverage has improved substantially since its 600 MHz spectrum deployment and the Sprint merger. Many campgrounds that had no T-Mobile signal a few years ago now have at least light coverage. Ohio and Pennsylvania have seen the most improvement in our dataset.",
      },
      {
        q: "How does T-Mobile compare to Verizon for camping?",
        a: "Verizon still leads in the most rural parts of Michigan and Wisconsin. However, T-Mobile is now competitive in Ohio, Pennsylvania, and campgrounds near major highways. Its low-band 600 MHz signal often outperforms AT&T in hilly terrain because of how the frequency propagates.",
      },
      {
        q: "Can I work remotely at a campground using T-Mobile?",
        a: "Campgrounds with a T-Mobile signal score of 70+ can support video calls and remote work. T-Mobile's mid-band 5G (where available) can be quite fast, but most rural campgrounds are on slower LTE. Check the Remote Work score on each campground's detail page.",
      },
      {
        q: "Does T-Mobile's home internet work at campgrounds?",
        a: "T-Mobile Home Internet uses the same tower network as its mobile service. If T-Mobile has signal at a campground, you may be able to use a hotspot or a mobile gateway device — though speeds will vary with distance to the tower and local congestion.",
      },
      {
        q: "Why does T-Mobile show fewer campgrounds than Verizon?",
        a: "Verizon has a larger rural tower footprint in this region, particularly in Michigan and Wisconsin. T-Mobile's coverage is growing rapidly but still has gaps in the most remote areas. Pennsylvania tends to have the most overlap between T-Mobile and Verizon coverage in our dataset.",
      },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectCarrier(pathname: string): CarrierKey {
  if (pathname.includes("verizon")) return "verizon";
  if (pathname.includes("att")) return "att";
  return "tmobile";
}

function remoteWorkLabel(score?: number): { label: string; cls: string } {
  if (score == null) return { label: "Unknown", cls: "text-gray-400" };
  if (score >= 70) return { label: "Good", cls: "text-green-600" };
  if (score >= 40) return { label: "Moderate", cls: "text-amber-600" };
  return { label: "Poor", cls: "text-red-500" };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CarrierLanding() {
  const [location] = useLocation();
  const params = useParams<{ state: string }>();
  const stateSlug = params.state?.toLowerCase() || "";
  const stateInfo = STATE_MAP[stateSlug];

  const carrierKey = useMemo(() => detectCarrier(location), [location]);
  const carrier = CARRIERS[carrierKey];

  // Filter campgrounds by state + carrier coverage, ranked by signal_score
  const ranked = useMemo(() => {
    if (!stateInfo) return [];
    return campgrounds
      .filter(
        (cg) =>
          cg.state === stateInfo.code &&
          cg[carrier.coverageField] === true &&
          cg.signal_score != null
      )
      .sort((a, b) => (b.signal_score ?? 0) - (a.signal_score ?? 0))
      .slice(0, 30);
  }, [stateInfo, carrier]);

  const likelyCoverageCount = useMemo(() => {
    if (!stateInfo) return 0;
    return campgrounds.filter(
      (cg) => cg.state === stateInfo.code && cg[carrier.coverageField] === true
    ).length;
  }, [stateInfo, carrier]);

  const otherStates = Object.entries(STATE_MAP).filter(
    ([slug]) => slug !== stateSlug
  );

  useEffect(() => {
    if (!stateInfo) {
      document.title = `${carrier.label} Campground Signal Coverage | SignalCamping`;
      return;
    }
    document.title = `${carrier.label} Signal at Campgrounds in ${stateInfo.name} | SignalCamping`;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `Find campgrounds in ${stateInfo.name} with ${carrier.label} coverage. Browse ${likelyCoverageCount} campgrounds ranked by signal strength. Data-modeled from public tower records.`;
  }, [stateInfo, carrier, likelyCoverageCount]);

  // Unknown state fallback
  if (!stateInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <SiteHeader />
        <div className="container py-16 text-center max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-3">State Not Found</h1>
          <p className="text-gray-500 mb-6">We don't have data for that state yet.</p>
          <Link href="/top-campgrounds">
            <Button className="bg-green-700 hover:bg-green-800 text-white">Browse All Campgrounds</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li>
            <Link href={`/campgrounds/${stateSlug}`} className="hover:text-green-700 transition">
              {stateInfo.name}
            </Link>
          </li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{carrier.label} Coverage</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10 space-y-3">
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              {carrier.label} Coverage
            </Badge>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Campgrounds with {carrier.label} Signal in {stateInfo.name}
            </h1>
            <p className="text-green-100 text-base max-w-2xl">
              {likelyCoverageCount} campgrounds in {stateInfo.name} with modeled {carrier.label} coverage — ranked by signal strength.
            </p>
            <div className="flex gap-3 flex-wrap pt-1">
              <Link href={`/campgrounds/${stateSlug}`}>
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  All {stateInfo.name} Campgrounds
                </Button>
              </Link>
              <Link href="/top-campgrounds">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Top Campgrounds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: SEO intro + ranked list */}
          <div className="lg:col-span-2 space-y-8">

            {/* SEO Intro */}
            <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
              {carrier.intro.map((para, i) => (
                <p key={i} className="leading-relaxed">{para}</p>
              ))}
            </div>

            {/* Ranked List */}
            <div>
              <h2
                className="text-xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Top Campgrounds for {carrier.label} in {stateInfo.name}
              </h2>

              {ranked.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No campgrounds found with confirmed {carrier.label} coverage in {stateInfo.name}.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {ranked.map((cg, idx) => {
                    const rw = remoteWorkLabel(cg.remote_work_score);
                    return (
                      <Link key={cg.slug} href={`/campground/${cg.slug}`}>
                        <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Rank badge */}
                              <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-bold flex items-center justify-center">
                                {idx + 1}
                              </div>

                              {/* Main content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                  <div>
                                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                                      {cg.campground_name}
                                      {cg.is_verified && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 inline ml-1.5 -mt-px" />
                                      )}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {cg.city ? `${cg.city}, ` : ""}{cg.state_full || cg.state}
                                    </p>
                                  </div>

                                  {/* Signal score */}
                                  <div className="text-right shrink-0">
                                    <span className={`text-lg font-bold ${
                                      (cg.signal_score ?? 0) >= 70
                                        ? "text-green-600"
                                        : (cg.signal_score ?? 0) >= 40
                                        ? "text-amber-500"
                                        : "text-red-500"
                                    }`}>
                                      {cg.signal_score}
                                    </span>
                                    <span className="text-xs text-gray-400">/100</span>
                                  </div>
                                </div>

                                {/* Tags row */}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {cg.campground_type && (
                                    <Badge variant="outline" className="text-xs py-0 px-1.5">
                                      {cg.campground_type.replace(/_/g, " ")}
                                    </Badge>
                                  )}
                                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${carrier.tagColor}`}>
                                    <Wifi className="w-3 h-3" /> {carrier.label}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    Remote work:{" "}
                                    <span className={`font-medium ${rw.cls}`}>{rw.label}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}

              {ranked.length > 0 && (
                <p className="text-xs text-gray-400 mt-3">
                  Showing top {ranked.length} of {likelyCoverageCount} campgrounds with {carrier.label} coverage in {stateInfo.name}, ranked by signal score.
                </p>
              )}
            </div>

            {/* Disclaimer */}
            <Card className="border-amber-100 bg-amber-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                  <Info className="w-4 h-4" /> About This Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-900/80 space-y-2">
                <p>
                  Coverage on this page is <strong>modeled from public tower location data</strong>, not measured directly at each campsite. Actual signal depends on terrain, tree cover, device type, network load, and carrier infrastructure changes that may not yet be reflected in public data.
                </p>
                <p>
                  Use this page as a planning starting point. For mission-critical connectivity, check {carrier.fullName}&rsquo;s official coverage map and consider crowdsourced reports from other campers.
                </p>
              </CardContent>
            </Card>

            {/* FAQ */}
            <div>
              <h2
                className="text-xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {carrier.faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1.5">{faq.q}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">

            {/* Coverage summary */}
            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <Signal className="w-4 h-4 text-green-700" /> {carrier.label} in {stateInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Campgrounds with signal</span>
                  <span className="font-semibold text-gray-800">{likelyCoverageCount}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Top signal score</span>
                  <span className="font-semibold text-green-700">{ranked[0]?.signal_score ?? "—"}/100</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-500">Remote work ready</span>
                  <span className="font-semibold text-indigo-700">
                    {ranked.filter((c) => (c.remote_work_score ?? 0) >= 70).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Other carriers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Other Carriers in {stateInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(["verizon", "att", "tmobile"] as CarrierKey[])
                  .filter((k) => k !== carrierKey)
                  .map((k) => {
                    const c = CARRIERS[k];
                    const urlSegment =
                      k === "verizon"
                        ? "verizon"
                        : k === "att"
                        ? "att"
                        : "tmobile";
                    return (
                      <Link key={k} href={`/campgrounds-with-${urlSegment}-signal/${stateSlug}`}>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-green-700 transition cursor-pointer">
                          <span className={`text-sm font-medium ${c.color}`}>{c.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </Link>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Other states */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {carrier.label} in Other States
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {otherStates.map(([slug, info]) => {
                  const urlSegment =
                    carrierKey === "verizon"
                      ? "verizon"
                      : carrierKey === "att"
                      ? "att"
                      : "tmobile";
                  return (
                    <Link key={slug} href={`/campgrounds-with-${urlSegment}-signal/${slug}`}>
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 hover:text-green-700 transition cursor-pointer text-sm">
                        <span className="text-gray-700">{info.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Remote work link */}
            <Card className="bg-indigo-50/50 border-indigo-100">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-800">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm font-semibold">Remote Work Camping</span>
                </div>
                <p className="text-xs text-indigo-700">
                  Find campgrounds in {stateInfo.name} ranked for remote-work readiness — not just signal, but town proximity and highway access too.
                </p>
                <Link href={`/remote-work-camping/${stateSlug}`}>
                  <Button size="sm" variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 mt-1">
                    Remote Work Campgrounds <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* HelpCircle callout */}
            <Card className="bg-gray-50 border-gray-100">
              <CardContent className="p-4 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-600 font-medium mb-1">
                  <HelpCircle className="w-3.5 h-3.5" /> How We Rank
                </div>
                <p>Campgrounds are sorted by <strong>Signal Score</strong> (0–100), a composite of tower proximity, carrier count, and distance from infrastructure — the same metric used across all SignalCamping pages.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
        <div className="container text-center text-sm">
          <p>&copy; 2026 SignalCamping &mdash; Campground signal data modeled from public tower records.</p>
        </div>
      </footer>
    </div>
  );
}
