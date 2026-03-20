/**
 * StateLanding — State-level campground listing page.
 *
 * Michigan (/campgrounds/mi) gets enhanced SEO content:
 *   - 500–800 word introduction with target keywords
 *   - "Best Campgrounds in Michigan for Cell Service" H2
 *   - "How We Rank Campground Signal Strength" H2
 * Other states get the standard listing layout.
 */
import { useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Signal, MapPin, ChevronRight, Tent, Truck, Zap, Waves, CheckCircle2,
  Radio, Laptop, Mountain, TreePine
} from "lucide-react";
import top100Data from "@/data/top100_seo.json";
import { filterForBestSignal, sortBySignalQuality, generateRankingDescription } from "@/lib/rankingUtils";
import SiteHeader from "@/components/SiteHeader";
import { getCarrierLikelihood, LIKELIHOOD_STYLES, type CarrierLikelihood } from "@/lib/carrierLikelihood";

const campgrounds = (top100Data as any[]).map(cg => ({
  ...cg,
  tent_sites: cg.tent_sites === true || (cg.tent_sites as any) === "True",
  rv_sites: cg.rv_sites === true || (cg.rv_sites as any) === "True",
  electric_hookups: cg.electric_hookups === true || (cg.electric_hookups as any) === "True",
  waterfront: cg.waterfront === true || (cg.waterfront as any) === "True",
}));

const STATE_MAP: Record<string, { code: string; name: string; desc: string }> = {
  mi: { code: "MI", name: "Michigan", desc: "Explore campgrounds across Michigan's Upper and Lower Peninsulas, from the shores of Lake Michigan to the forests of the UP." },
  oh: { code: "OH", name: "Ohio", desc: "Discover Ohio's state parks and campgrounds in the rolling hills of Appalachian country and along Lake Erie." },
  pa: { code: "PA", name: "Pennsylvania", desc: "Find campgrounds in Pennsylvania's Allegheny Mountains, state forests, and lakeside parks." },
  wi: { code: "WI", name: "Wisconsin", desc: "Camp in Wisconsin's Northwoods, Door County, and along the shores of Lake Superior." },
};

export default function StateLanding() {
  const params = useParams<{ state: string }>();
  const stateSlug = params.state?.toLowerCase() || "";
  const stateInfo = STATE_MAP[stateSlug];

  const stateCampgrounds = useMemo(() => {
    if (!stateInfo) return [];
    return campgrounds
      .filter(cg => cg.state === stateInfo.code)
      .sort((a: any, b: any) => a.campground_name.localeCompare(b.campground_name));
  }, [stateInfo]);

  const verifiedCount = useMemo(() => stateCampgrounds.filter((c: any) => c.is_verified).length, [stateCampgrounds]);

  /* ── Michigan-specific: top campgrounds by signal quality ── */
  const miTopSignal = useMemo(() => {
    if (stateSlug !== "mi") return [];
    const miCampgrounds = campgrounds.filter(cg => cg.state === "MI");
    const filtered = filterForBestSignal(miCampgrounds, 85);
    const sorted = sortBySignalQuality(filtered);
    const seen = new Set<string>();
    return sorted
      .filter(cg => {
        if (seen.has(cg.campground_name)) return false;
        seen.add(cg.campground_name);
        return true;
      })
      .slice(0, 15);
  }, [stateSlug]);

  /* ── Michigan-specific: computed stats for intro ── */
  const miStats = useMemo(() => {
    if (stateSlug !== "mi") return null;
    const mi = campgrounds.filter(cg => cg.state === "MI");
    return {
      total: mi.length,
      verizon: mi.filter(c => c.verizon_coverage === true).length,
      att: mi.filter(c => c.att_coverage === true).length,
      tmobile: mi.filter(c => c.tmobile_coverage === true).length,
      threeCarrier: mi.filter(c => c.verizon_coverage === true && c.att_coverage === true && c.tmobile_coverage === true).length,
      highQuality: mi.filter(c => (c.signal_quality_score ?? 0) >= 85).length,
      remoteWorkGood: mi.filter(c => (c.remote_work_score ?? 0) >= 65).length,
    };
  }, [stateSlug]);

  useEffect(() => {
    if (!stateInfo) return;
    if (stateSlug === "mi") {
      document.title = `Campgrounds in Michigan with Cell Service | ${stateCampgrounds.length} Campgrounds | SignalCamping`;
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
      meta.content = `Find the best campgrounds in Michigan for cell service and remote work. Browse ${stateCampgrounds.length} campgrounds with real signal data from ${miStats?.threeCarrier ?? 0}+ locations with three-carrier coverage.`;
    } else {
      document.title = `${stateInfo.name} Campgrounds | SignalCamping`;
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
      meta.content = `Browse ${stateCampgrounds.length} campgrounds in ${stateInfo.name}. Real locations from OpenStreetMap with cell signal data.`;
    }
  }, [stateInfo, stateSlug, stateCampgrounds.length, miStats]);

  if (!stateInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
        <SiteHeader />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">State Not Found</h2>
          <Link href="/top-campgrounds"><Button className="bg-green-600 hover:bg-green-700 text-white">View All Campgrounds</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />

      {/* Breadcrumbs */}
      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link href="/top-campgrounds" className="hover:text-green-700 transition">All Campgrounds</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">{stateInfo.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          {stateSlug === "mi" ? "Campgrounds in Michigan with Cell Service" : `${stateInfo.name} Campgrounds`}
        </h1>
        <p className="text-gray-500 max-w-3xl mb-4">{stateInfo.desc}</p>
        <div className="flex gap-3 flex-wrap">
          <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">{stateCampgrounds.length} Campgrounds</Badge>
          {verifiedCount > 0 && (
            <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">{verifiedCount} Verified</Badge>
          )}
          {miStats && (
            <>
              <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1">{miStats.highQuality} Strong Signal</Badge>
              <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">{miStats.remoteWorkGood} Remote Work Ready</Badge>
            </>
          )}
        </div>
      </section>

      {/* Browse by Carrier */}
      <section className="container pb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Browse {stateInfo.name} Campgrounds by Carrier
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href={`/campgrounds-with-verizon-signal/${stateSlug}`}>
            <Card className="hover:shadow-md hover:border-red-200 transition cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <Signal className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700">Verizon</p>
                  <p className="text-xs text-gray-500">Campgrounds with signal</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link href={`/campgrounds-with-att-signal/${stateSlug}`}>
            <Card className="hover:shadow-md hover:border-blue-200 transition cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Signal className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700">AT&amp;T</p>
                  <p className="text-xs text-gray-500">Campgrounds with signal</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link href={`/campgrounds-with-tmobile-signal/${stateSlug}`}>
            <Card className="hover:shadow-md hover:border-pink-200 transition cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                  <Signal className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-pink-700">T-Mobile</p>
                  <p className="text-xs text-gray-500">Campgrounds with signal</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ═══════════════════ MICHIGAN SEO INTRODUCTION ═══════════════════ */}
      {stateSlug === "mi" && miStats && (
        <section className="container pb-8">
          <div className="max-w-3xl">
            <div className="prose prose-gray prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Michigan is one of the most popular camping destinations in the Midwest, and for good reason. With more than 100 state parks, thousands of miles of Great Lakes shoreline, and vast stretches of national forest in both the Upper and Lower Peninsulas, the state offers something for every kind of camper. But there is a practical question that comes up more and more often, especially for families, solo travelers, and remote workers: <strong>which campgrounds in Michigan have reliable cell service?</strong>
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                That question used to be nearly impossible to answer without trial and error. You might ask around on forums, check a carrier's coverage map (which tends to be optimistic), or simply hope for the best when you pull into a campground. SignalCamping was built to change that. We analyzed real cell tower locations from public infrastructure databases and modeled signal coverage for every campground in our Michigan dataset — {miStats.total} locations in total — across Verizon, AT&T, and T-Mobile. The result is a practical, data-driven directory of <strong>campgrounds in Michigan with cell service</strong> that you can actually trust before you book.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cell signal matters for campers for reasons that go well beyond scrolling social media. Parents want to know they can call for help if a kid gets hurt on a trail. Travelers need GPS and weather alerts, especially in remote parts of the Upper Peninsula where conditions can change fast. And a growing number of people are looking for the <strong>best campgrounds in Michigan for remote work</strong> — places where you can take a video call from a picnic table in the morning and paddle a kayak in the afternoon. Our data shows that {miStats.remoteWorkGood} Michigan campgrounds score well enough on connectivity to support that kind of trip, with {miStats.threeCarrier} locations showing likely coverage from all three major carriers.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Of course, not every campground needs a strong signal. Some of the best camping in Michigan is deep in the Porcupine Mountains or along the shores of Lake Superior, where the whole point is to unplug. We include those locations too, with honest signal scores so you know what to expect. Whether you are looking for <strong>Michigan camping with good signal</strong> or a place to truly disconnect, the data here helps you make that choice intentionally rather than by accident.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                What makes our approach different from a carrier coverage map is specificity. Carrier maps paint broad strokes — they will show most of southern Michigan as "covered" without telling you whether the campground tucked behind a ridge actually gets a usable signal. We start from the other direction: we take each campground's exact GPS coordinates, find the nearest cell towers for each carrier, and calculate a signal score based on distance, tower density, and terrain classification. The closer a campground is to multiple towers, the higher its score. It is not a guarantee — terrain, foliage, and weather all affect real-world signal — but it is a much better starting point than a color-coded blob on a map.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Below you will find every campground in our Michigan database, along with featured rankings for the Upper Peninsula and carrier-specific guides. Each campground links to a detail page with signal scores, carrier likelihood, amenity data, and a map. If you have camped at any of these locations, you can also submit a signal report to help other campers plan their trips.
              </p>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-700" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{miStats.total}</div>
              <div className="text-xs text-gray-500 mt-1">Campgrounds Analyzed</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-700" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{miStats.threeCarrier}</div>
              <div className="text-xs text-gray-500 mt-1">Three-Carrier Coverage</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-700" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{miStats.verizon}</div>
              <div className="text-xs text-gray-500 mt-1">Verizon Coverage</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-700" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{miStats.remoteWorkGood}</div>
              <div className="text-xs text-gray-500 mt-1">Remote Work Ready</div>
            </div>
          </div>
        </section>
      )}

      {/* Featured: Upper Peninsula Signal (Michigan only) */}
      {stateSlug === "mi" && (
        <section className="container pb-6">
          <Link href="/best-cell-signal-campgrounds-upper-peninsula">
            <Card className="bg-gradient-to-r from-green-800 via-green-900 to-emerald-900 text-white hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Signal className="w-6 h-6 text-green-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-white/10 text-green-200 border-green-500/30 text-[10px]">Featured</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Best Campgrounds with Cell Service in the Upper Peninsula
                  </h3>
                  <p className="text-green-200 text-sm leading-relaxed">
                    Cell service in the U.P. can be unpredictable. See the top 25 campgrounds ranked by signal score.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-green-300 shrink-0 hidden sm:block" />
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {/* Featured: Verizon Michigan (Michigan only) */}
      {stateSlug === "mi" && (
        <section className="container pb-6">
          <Link href="/best-verizon-signal-campgrounds-michigan">
            <Card className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Signal className="w-6 h-6 text-red-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-white/10 text-red-200 border-red-400/30 text-[10px]">Carrier Spotlight</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Best Michigan Campgrounds with Verizon Signal
                  </h3>
                  <p className="text-red-200 text-sm leading-relaxed">
                    Top 25 Michigan campgrounds ranked by modeled Verizon signal score.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-red-200 shrink-0 hidden sm:block" />
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {/* ═══════════════════ MICHIGAN: BEST CAMPGROUNDS FOR CELL SERVICE ═══════════════════ */}
      {stateSlug === "mi" && miTopSignal.length > 0 && (
        <section className="container pb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Best Campgrounds in Michigan for Cell Service
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-2xl">
            These campgrounds rank highest in our signal quality analysis, with strong tower proximity across multiple carriers. Each location scored 85 or above on our 100-point signal quality scale.
          </p>
          <div className="space-y-3">
            {miTopSignal.map((cg: any, idx: number) => {
              const likelihood = getCarrierLikelihood(cg);
              const desc = generateRankingDescription(cg);
              return (
                <Link key={cg.slug + idx} href={`/campground/${cg.slug}`}>
                  <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shrink-0 text-sm font-bold text-white shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
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
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed mb-2">{desc}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] px-2 py-0.5">
                              <Signal className="w-3 h-3 mr-1" />
                              Score: {cg.signal_score ?? "—"}
                            </Badge>
                            {(["verizon", "att", "tmobile"] as const).map(carrier => {
                              const level = likelihood[carrier];
                              if (level === "Unknown") return null;
                              const style = LIKELIHOOD_STYLES[level];
                              const label = carrier === "att" ? "AT&T" : carrier === "tmobile" ? "T-Mobile" : "Verizon";
                              return (
                                <Badge key={carrier} className={`${style.bgClass} ${style.textClass} ${style.borderClass} text-[10px] px-2 py-0.5`}>
                                  {label}: {style.label}
                                </Badge>
                              );
                            })}
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
          <div className="mt-4 text-center">
            <Link href="/top-campgrounds">
              <Button variant="outline" className="text-green-700 border-green-200 hover:bg-green-50 text-sm">
                View Full Rankings Across All States <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════ MICHIGAN: HOW WE RANK SIGNAL STRENGTH ═══════════════════ */}
      {stateSlug === "mi" && (
        <section className="container pb-10">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              How We Rank Campground Signal Strength
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Every signal score on SignalCamping is calculated from real cell tower infrastructure data, not from carrier-reported coverage maps. We use publicly available tower location databases that include verified positions for Verizon, AT&T, and T-Mobile towers across Michigan and the broader Great Lakes region.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                For each campground, our model takes the exact GPS coordinates and measures the distance to the nearest towers for each carrier. We apply coverage radius rules that account for terrain type — suburban areas get a wider effective range (up to 15 km), rural locations use a 12 km radius, and backcountry sites are modeled at 6 km to reflect the reality of signal attenuation in dense forest and hilly terrain. We also sample signal strength at multiple points within a 750-meter buffer around each campground to account for the fact that your actual campsite may not be at the exact center point.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The result is two scores. The <strong>signal score</strong> (0–100) is the primary number you see on each campground page — it reflects overall connectivity potential based on how many carriers are likely available and how close the nearest towers are. The <strong>signal quality score</strong> is a more granular metric we use internally for rankings. It breaks ties between campgrounds that share the same signal score by factoring in exact tower distances, giving a finer-grained ordering when dozens of campgrounds all score in the same tier.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We also calculate a <strong>remote work score</strong> for each location, which combines signal strength with proximity to towns (for backup Wi-Fi and supplies) and highway access. This is especially useful if you are searching for the best campgrounds in Michigan for remote work and need confidence that you can maintain a reliable connection for video calls and file uploads.
              </p>
              <p className="text-gray-700 leading-relaxed">
                No model is perfect. Real-world signal depends on weather, foliage density, your specific device, and network congestion. We encourage campers to submit their own signal reports from the field — every report helps refine the picture for the next person planning a trip.
              </p>
            </div>

            {/* Methodology quick-reference */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-800">Tower Data</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Real tower locations from public infrastructure databases — not carrier-reported coverage estimates.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Mountain className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-800">Terrain-Adjusted</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Coverage radii vary by terrain classification: suburban (15 km), rural (12 km), and backcountry (6 km).
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Laptop className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-800">Remote Work Scored</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Each campground gets a remote work score combining signal strength, town proximity, and highway access.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ FULL CAMPGROUND DIRECTORY ═══════════════════ */}
      <section className="container pb-8">
        {stateSlug === "mi" && (
          <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            All {stateCampgrounds.length} Michigan Campgrounds
          </h2>
        )}
        {stateSlug === "mi" && (
          <p className="text-gray-500 text-sm mb-4">
            Browse every campground in our Michigan database, listed alphabetically. Click any campground for detailed signal data, carrier coverage, and amenity information.
          </p>
        )}
        <div className="space-y-2">
          {stateCampgrounds.map((cg: any, idx: number) => (
            <Link key={cg.slug + idx} href={`/campground/${cg.slug}`}>
              <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-sm font-bold text-green-700">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {cg.campground_name}
                        </h3>
                        {cg.is_verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cg.city ? `${cg.city}, ` : ""}{stateInfo.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{(cg.campground_type || "campground").replace(/_/g, " ")}</Badge>
                        {cg.tent_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Tent className="w-3 h-3" />Tent</Badge>}
                        {cg.rv_sites && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Truck className="w-3 h-3" />RV</Badge>}
                        {cg.electric_hookups && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Zap className="w-3 h-3" />Electric</Badge>}
                        {cg.waterfront && <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1"><Waves className="w-3 h-3" />Waterfront</Badge>}
                        {cg.signal_score != null && (
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0 gap-1">
                            <Signal className="w-3 h-3" />{cg.signal_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Other States */}
      <section className="container pb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Explore Other States
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATE_MAP).filter(([k]) => k !== stateSlug).map(([slug, info]) => (
            <Link key={slug} href={`/campgrounds/${slug}`}>
              <Card className="hover:shadow-md hover:border-green-200 transition cursor-pointer text-center">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 text-sm">{info.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {campgrounds.filter((c: any) => c.state === info.code).length} campgrounds
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10">
        <div className="container text-center">
          <p className="text-sm">&copy; 2026 SignalCamping &mdash; Campground discovery powered by OpenStreetMap and real cell tower data.</p>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <Link href="/top-campgrounds" className="hover:text-white transition">All Campgrounds</Link>
            <Link href="/best-remote-work-campgrounds" className="hover:text-white transition">Remote Work Camping</Link>
            <Link href="/best-cell-signal-campgrounds-upper-peninsula" className="hover:text-white transition">Upper Peninsula</Link>
            <Link href="/" className="hover:text-white transition">Map</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

