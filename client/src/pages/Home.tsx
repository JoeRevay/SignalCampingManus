import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from "recharts";
import { Signal, MapPin, Wifi, Tent, Truck, Zap, Waves, Heart } from "lucide-react";
import campgroundsData from "@/data/campgrounds.json";

interface Campground {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  type: string;
  tent: boolean | string;
  rv: boolean | string;
  electric: boolean | string;
  waterfront: boolean | string;
  verizon: string;
  att: string;
  tmobile: string;
  signal_confidence: number;
  reservation_link: string;
  website: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Parse boolean values
  const normalizedData: Campground[] = useMemo(() => {
    return campgroundsData.map((cg: any) => ({
      ...cg,
      tent: cg.tent === true || cg.tent === "True",
      rv: cg.rv === true || cg.rv === "True",
      electric: cg.electric === true || cg.electric === "True",
      waterfront: cg.waterfront === true || cg.waterfront === "True",
    }));
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return normalizedData.filter((cg) => {
      const matchesSearch = cg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cg.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = !selectedState || cg.state === selectedState;
      return matchesSearch && matchesState;
    });
  }, [searchTerm, selectedState]);

  // State statistics
  const stateStats = useMemo(() => {
    const stats: Record<string, { count: number; avgSignal: number }> = {};
    normalizedData.forEach((cg) => {
      if (!stats[cg.state]) {
        stats[cg.state] = { count: 0, avgSignal: 0 };
      }
      stats[cg.state].count++;
      stats[cg.state].avgSignal += cg.signal_confidence;
    });
    Object.keys(stats).forEach((state) => {
      stats[state].avgSignal = Math.round((stats[state].avgSignal / stats[state].count) * 10) / 10;
    });
    return Object.entries(stats).map(([state, data]) => ({
      state,
      campgrounds: data.count,
      avgSignal: data.avgSignal,
    }));
  }, []);

  // Signal confidence distribution
  const signalDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    normalizedData.forEach((cg) => {
      dist[cg.signal_confidence as keyof typeof dist]++;
    });
    return [
      { score: "5 Stars", count: dist[5], percentage: ((dist[5] / normalizedData.length) * 100).toFixed(1) },
      { score: "4 Stars", count: dist[4], percentage: ((dist[4] / normalizedData.length) * 100).toFixed(1) },
      { score: "3 Stars", count: dist[3], percentage: ((dist[3] / normalizedData.length) * 100).toFixed(1) },
      { score: "2 Stars", count: dist[2], percentage: ((dist[2] / normalizedData.length) * 100).toFixed(1) },
      { score: "1 Star", count: dist[1], percentage: ((dist[1] / normalizedData.length) * 100).toFixed(1) },
    ];
  }, []);

  // Carrier coverage distribution
  const carrierCoverage = useMemo(() => {
    const carriers: Record<string, Record<string, number>> = { verizon: {}, att: {}, tmobile: {} };
    normalizedData.forEach((cg) => {
      ["verizon", "att", "tmobile"].forEach((carrier) => {
        const signal = cg[carrier as keyof Campground] as string;
        if (!carriers[carrier][signal]) {
          carriers[carrier][signal] = 0;
        }
        carriers[carrier][signal]++;
      });
    });
    return carriers;
  }, []);

  // Amenities statistics
  const amenitiesStats = useMemo(() => {
    return [
      { name: "Tent Camping", count: normalizedData.filter((c) => c.tent).length },
      { name: "RV Sites", count: normalizedData.filter((c) => c.rv).length },
      { name: "Electric Hookups", count: normalizedData.filter((c) => c.electric).length },
      { name: "Waterfront", count: normalizedData.filter((c) => c.waterfront).length },
    ];
  }, []);

  // Campground type distribution
  const typeDistribution = useMemo(() => {
    const types: Record<string, number> = {};
    normalizedData.forEach((cg) => {
      types[cg.type] = (types[cg.type] || 0) + 1;
    });
    return Object.entries(types).map(([type, count]) => ({
      name: type.replace(/_/g, " ").toUpperCase(),
      value: count,
    }));
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const states = Array.from(new Set(normalizedData.map((c) => c.state))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Signal className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">SignalCamping</h1>
              <p className="text-lg text-gray-600">Great Lakes Campground Signal Research</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-2xl">
            Discover campgrounds with reliable cellular coverage across Michigan, Ohio, Pennsylvania, West Virginia, and Wisconsin. Our comprehensive dataset analyzes Verizon, AT&T, and T-Mobile signal strength at 100+ campgrounds.
          </p>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            placeholder="Search campgrounds or cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
          <select
            value={selectedState || ""}
            onChange={(e) => setSelectedState(e.target.value || null)}
            className="h-10 px-3 border border-gray-300 rounded-md"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Campgrounds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{normalizedData.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Great Lakes Region</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">States Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{states.length}</div>
                  <p className="text-xs text-gray-500 mt-1">MI, OH, PA, WI, WV</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Signal Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">
                    {(normalizedData.reduce((sum, c) => sum + c.signal_confidence, 0) / normalizedData.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Out of 5 stars</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Waterfront Sites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-600">
                    {normalizedData.filter((c) => c.waterfront).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{((normalizedData.filter((c) => c.waterfront).length / normalizedData.length) * 100).toFixed(0)}% of total</p>
                </CardContent>
              </Card>
            </div>

            {/* Campgrounds by State */}
            <Card>
              <CardHeader>
                <CardTitle>Campgrounds by State</CardTitle>
                <CardDescription>Distribution and average signal confidence score</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stateStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="campgrounds" fill="#3b82f6" name="Campgrounds" />
                    <Bar yAxisId="right" dataKey="avgSignal" fill="#10b981" name="Avg Signal Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Campground Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Campground Types</CardTitle>
                <CardDescription>Distribution across different management types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Verizon Coverage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verizon Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(carrierCoverage.verizon || {}).map(([signal, count]) => (
                    <div key={signal} className="flex justify-between items-center">
                      <span className="text-sm">{signal}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AT&T Coverage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AT&T Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(carrierCoverage.att || {}).map(([signal, count]) => (
                    <div key={signal} className="flex justify-between items-center">
                      <span className="text-sm">{signal}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* T-Mobile Coverage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">T-Mobile Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(carrierCoverage.tmobile || {}).map(([signal, count]) => (
                    <div key={signal} className="flex justify-between items-center">
                      <span className="text-sm">{signal}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Signal Confidence Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Signal Confidence Score Distribution</CardTitle>
                <CardDescription>Confidence level based on multiple data sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={signalDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} campgrounds`} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {signalDistribution.map((item) => (
                    <div key={item.score} className="flex justify-between text-sm">
                      <span>{item.score}</span>
                      <span className="text-gray-600">{item.count} campgrounds ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Amenities Availability</CardTitle>
                <CardDescription>Percentage of campgrounds offering each amenity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={amenitiesStats}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={190} />
                    <Tooltip formatter={(value) => `${value} campgrounds`} />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {amenitiesStats.map((amenity) => (
                    <div key={amenity.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {amenity.name === "Tent Camping" && <Tent className="w-5 h-5 text-blue-600" />}
                      {amenity.name === "RV Sites" && <Truck className="w-5 h-5 text-blue-600" />}
                      {amenity.name === "Electric Hookups" && <Zap className="w-5 h-5 text-blue-600" />}
                      {amenity.name === "Waterfront" && <Waves className="w-5 h-5 text-blue-600" />}
                      <div>
                        <p className="font-medium text-sm">{amenity.name}</p>
                        <p className="text-xs text-gray-600">
                          {amenity.count} / {normalizedData.length} ({((amenity.count / normalizedData.length) * 100).toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campground Dataset</CardTitle>
                <CardDescription>
                  Showing {filteredData.length} of {normalizedData.length} campgrounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-2 font-semibold">Name</th>
                        <th className="text-left p-2 font-semibold">City, State</th>
                        <th className="text-left p-2 font-semibold">Type</th>
                        <th className="text-center p-2 font-semibold">Verizon</th>
                        <th className="text-center p-2 font-semibold">AT&T</th>
                        <th className="text-center p-2 font-semibold">T-Mobile</th>
                        <th className="text-center p-2 font-semibold">Score</th>
                        <th className="text-center p-2 font-semibold">Amenities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 20).map((cg, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium text-blue-600">{cg.name}</td>
                          <td className="p-2">{cg.city}, {cg.state}</td>
                          <td className="p-2 text-xs">
                            <Badge variant="outline">{cg.type.replace(/_/g, " ")}</Badge>
                          </td>
                          <td className="p-2 text-center text-xs">
                            <span className={`px-2 py-1 rounded ${
                              cg.verizon === "Strong" ? "bg-green-100 text-green-800" :
                              cg.verizon === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                              cg.verizon === "Weak" ? "bg-orange-100 text-orange-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {cg.verizon}
                            </span>
                          </td>
                          <td className="p-2 text-center text-xs">
                            <span className={`px-2 py-1 rounded ${
                              cg.att === "Strong" ? "bg-green-100 text-green-800" :
                              cg.att === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                              cg.att === "Weak" ? "bg-orange-100 text-orange-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {cg.att}
                            </span>
                          </td>
                          <td className="p-2 text-center text-xs">
                            <span className={`px-2 py-1 rounded ${
                              cg.tmobile === "Strong" ? "bg-green-100 text-green-800" :
                              cg.tmobile === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                              cg.tmobile === "Weak" ? "bg-orange-100 text-orange-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {cg.tmobile}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <Badge className="bg-blue-100 text-blue-800">{cg.signal_confidence}★</Badge>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex gap-1 justify-center">
                              {cg.tent && <Tent className="w-4 h-4 text-blue-600" />}
                              {cg.rv && <Truck className="w-4 h-4 text-blue-600" />}
                              {cg.electric && <Zap className="w-4 h-4 text-blue-600" />}
                              {cg.waterfront && <Waves className="w-4 h-4 text-blue-600" />}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredData.length > 20 && (
                  <p className="text-sm text-gray-600 mt-4">Showing 20 of {filteredData.length} results</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Documentation Section */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive relational database design with tables for campgrounds, cellular coverage, amenities, reviews, and geographic regions.
                </p>
                <Button variant="outline" size="sm">View Schema</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signal className="w-5 h-5 text-blue-600" />
                  SEO Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Programmatic page generation across state, regional, city, and campground levels for comprehensive search coverage.
                </p>
                <Button variant="outline" size="sm">View Architecture</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  Filter System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Advanced filtering by signal strength, amenities, location, and campground type for precise campground discovery.
                </p>
                <Button variant="outline" size="sm">View Filters</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Signal className="w-5 h-5" />
                SignalCamping
              </h3>
              <p className="text-sm">Find campgrounds with reliable cellular coverage across the Great Lakes region.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Browse Campgrounds</a></li>
                <li><a href="#" className="hover:text-white transition">Signal Coverage Maps</a></li>
                <li><a href="#" className="hover:text-white transition">Amenities Guide</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">States Covered</h4>
              <p className="text-sm">Michigan • Ohio • Pennsylvania • West Virginia • Wisconsin</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 SignalCamping. Research dataset and system architecture for campground discovery.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
