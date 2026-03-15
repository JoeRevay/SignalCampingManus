/**
 * SeoDirectory — Master directory of all 264 SEO pages.
 * URL: /seo-directory
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Signal, MapPin, Phone, Laptop, Tent, Route, Search,
  ChevronRight, Globe, Layers, BarChart3
} from "lucide-react";

import seoData from "@/data/seo_pages.json";
import mvpData from "@/data/mvp_campgrounds.json";

const data = seoData as any;

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const campgrounds = (mvpData as any[]).map(c => ({
  ...c,
  slug: c.slug || slugify(c.campground_name),
}));

function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <Signal className="w-5 h-5 text-green-700" />
          <span className="font-bold text-lg tracking-tight text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Signal<span className="text-green-700">Camping</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/top-campgrounds" className="text-gray-600 hover:text-green-700 transition hidden sm:block">Top 100</Link>
          <Link href="/" className="text-gray-600 hover:text-green-700 transition">Map</Link>
        </nav>
      </div>
    </header>
  );
}

export default function SeoDirectory() {
  const [search, setSearch] = useState("");

  const summary = data.summary || {};
  const cityPages = (data.city_pages || []).filter((p: any) =>
    !search || p.city.toLowerCase().includes(search.toLowerCase()) || p.state_name.toLowerCase().includes(search.toLowerCase())
  );
  const carrierPages = (data.carrier_pages || []).filter((p: any) =>
    !search || p.carrier.toLowerCase().includes(search.toLowerCase()) || p.state_name.toLowerCase().includes(search.toLowerCase())
  );
  const rwPages = (data.remote_work_pages || []).filter((p: any) =>
    !search || p.state_name.toLowerCase().includes(search.toLowerCase())
  );
  const amenityPages = (data.amenity_pages || []).filter((p: any) =>
    !search || p.amenity_label.toLowerCase().includes(search.toLowerCase()) || p.state_name.toLowerCase().includes(search.toLowerCase())
  );
  const tripPages = (data.trip_route_pages || []).filter((p: any) =>
    !search || p.origin.toLowerCase().includes(search.toLowerCase()) || p.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <Header />

      <nav className="container pt-4 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-green-700 transition">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-800 font-medium">SEO Page Directory</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container pb-6">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3">
              <Globe className="w-3 h-3 mr-1" />SEO Architecture
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              SEO Page Directory
            </h1>
            <p className="text-gray-300 text-base max-w-2xl mb-4">
              {summary.total_seo_pages || 264} programmatic SEO pages targeting long-tail campground + cell service keywords.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-lg font-bold">{summary.state_page_count || 2}</div>
                <div className="text-[10px] text-gray-400">State</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-lg font-bold">{summary.city_page_count || 48}</div>
                <div className="text-[10px] text-gray-400">City</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-lg font-bold">{summary.carrier_page_count || 15}</div>
                <div className="text-[10px] text-gray-400">Carrier</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-lg font-bold">{summary.remote_work_page_count || 20}</div>
                <div className="text-[10px] text-gray-400">Remote Work</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-lg font-bold">{summary.amenity_page_count || 19}</div>
                <div className="text-[10px] text-gray-400">Amenity</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-lg font-bold">{summary.trip_route_page_count || 10}</div>
                <div className="text-[10px] text-gray-400">Trip Route</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-lg font-bold">{summary.campground_page_count || 150}</div>
                <div className="text-[10px] text-gray-400">Campground</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="container pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search pages by city, state, carrier, amenity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="container pb-8">
        <Tabs defaultValue="city">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="city" className="text-xs"><MapPin className="w-3 h-3 mr-1" />City ({cityPages.length})</TabsTrigger>
            <TabsTrigger value="carrier" className="text-xs"><Phone className="w-3 h-3 mr-1" />Carrier ({carrierPages.length})</TabsTrigger>
            <TabsTrigger value="remote" className="text-xs"><Laptop className="w-3 h-3 mr-1" />Remote Work ({rwPages.length})</TabsTrigger>
            <TabsTrigger value="amenity" className="text-xs"><Tent className="w-3 h-3 mr-1" />Amenity ({amenityPages.length})</TabsTrigger>
            <TabsTrigger value="trip" className="text-xs"><Route className="w-3 h-3 mr-1" />Trip ({tripPages.length})</TabsTrigger>
            <TabsTrigger value="campground" className="text-xs"><Layers className="w-3 h-3 mr-1" />Campground</TabsTrigger>
          </TabsList>

          {/* City Pages */}
          <TabsContent value="city">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cityPages.map((p: any) => (
                <Link key={p.slug} href={`/campgrounds-with-cell-service/${p.slug}`}>
                  <Card className="hover:shadow-md transition cursor-pointer hover:border-green-200 h-full">
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{p.city}, {p.state}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.campground_count} campgrounds · Avg RWS {p.avg_rws}</div>
                      <div className="flex gap-2">
                        <Badge className="text-[10px] bg-green-50 text-green-700">{p.strong_signal} strong</Badge>
                        <Badge className="text-[10px] bg-gray-50 text-gray-600">{p.campground_count} total</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Carrier Pages */}
          <TabsContent value="carrier">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {carrierPages.map((p: any) => (
                <Link key={p.slug} href={`/campgrounds-with-${p.carrier_slug}-signal/${p.state.toLowerCase()}`}>
                  <Card className="hover:shadow-md transition cursor-pointer hover:border-blue-200 h-full">
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{p.carrier} in {p.state_name}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.total} campgrounds · {p.strong} strong · {Math.round(p.coverage_pct)}% coverage</div>
                      <div className="flex gap-2">
                        <Badge className="text-[10px] bg-green-50 text-green-700">{p.strong} strong</Badge>
                        <Badge className="text-[10px] bg-yellow-50 text-yellow-700">{p.moderate} moderate</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Remote Work Pages */}
          <TabsContent value="remote">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rwPages.map((p: any) => (
                <Link key={p.slug} href={`/remote-work-camping/${p.state?.toLowerCase() || p.slug}`}>
                  <Card className="hover:shadow-md transition cursor-pointer hover:border-purple-200 h-full">
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm text-gray-900 mb-1">
                        {p.type === "state" ? `Remote Work in ${p.state_name}` : p.slug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{p.total} campgrounds · Avg RWS {p.avg_rws}</div>
                      <div className="flex gap-2">
                        <Badge className="text-[10px] bg-green-50 text-green-700">{p.excellent} excellent</Badge>
                        <Badge className="text-[10px] bg-blue-50 text-blue-700">{p.good} good</Badge>
                        <Badge className="text-[10px] bg-yellow-50 text-yellow-700">{p.usable} usable</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Amenity Pages */}
          <TabsContent value="amenity">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {amenityPages.map((p: any) => (
                <Link key={p.slug} href={`/${p.amenity}-campgrounds-with-cell-service/${p.state.toLowerCase()}`}>
                  <Card className="hover:shadow-md transition cursor-pointer hover:border-teal-200 h-full">
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{p.amenity_label} in {p.state_name}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.total} campgrounds · {p.strong_signal} strong signal · Avg RWS {p.avg_rws}</div>
                      <Badge className="text-[10px] bg-teal-50 text-teal-700">{p.amenity_label}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Trip Route Pages */}
          <TabsContent value="trip">
            <div className="grid sm:grid-cols-2 gap-3">
              {tripPages.map((p: any) => (
                <Link key={p.slug} href={`/camping-trip/${p.slug}`}>
                  <Card className="hover:shadow-md transition cursor-pointer hover:border-orange-200 h-full">
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{p.origin} → {p.destination}</div>
                      <div className="text-xs text-gray-500 mb-2">{p.distance_miles} mi · {p.campground_count} campgrounds · Avg RWS {p.avg_rws}</div>
                      <div className="flex gap-2">
                        <Badge className="text-[10px] bg-orange-50 text-orange-700">{p.distance_miles} mi</Badge>
                        <Badge className="text-[10px] bg-green-50 text-green-700">{p.strong_signal} strong</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Campground Pages */}
          <TabsContent value="campground">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {campgrounds
                .filter(c => !search || c.campground_name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 60)
                .map((c: any) => (
                <Link key={c.slug} href={`/campground/${c.slug}`}>
                  <Card className="hover:shadow-md transition cursor-pointer hover:border-green-200 h-full">
                    <CardContent className="p-4">
                      <div className="font-semibold text-sm text-gray-900 mb-1 truncate">{c.campground_name}</div>
                      <div className="text-xs text-gray-500">{c.city}, {c.state} · RWS {c.remote_work_score}/10</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {campgrounds.length > 60 && <p className="text-center text-xs text-gray-400 mt-4">Showing 60 of {campgrounds.length} campground pages. Use search to filter.</p>}
          </TabsContent>
        </Tabs>
      </section>

      <footer className="border-t border-green-100 bg-white/60 py-6">
        <div className="container text-center text-xs text-gray-400">
          SignalCamping — Find campgrounds where your phone works.
        </div>
      </footer>
    </div>
  );
}
