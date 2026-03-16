/**
 * MvpLaunch — Internal documentation page.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Signal, MapPin, Database, CheckCircle2, ArrowLeft } from "lucide-react";
import mvpData from "@/data/mvp_campgrounds.json";
import allData from "@/data/campgrounds.json";

const campgrounds = mvpData as any[];
const allCampgrounds = allData as any[];

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan", OH: "Ohio", PA: "Pennsylvania", WI: "Wisconsin",
};

export default function MvpLaunch() {
  useEffect(() => { document.title = "MVP Data Overview | SignalCamping"; }, []);

  const stateCounts: Record<string, number> = {};
  allCampgrounds.forEach(c => { stateCounts[c.state] = (stateCounts[c.state] || 0) + 1; });
  const verifiedCount = campgrounds.filter(c => c.is_verified).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/"><div className="flex items-center gap-2"><Signal className="w-5 h-5 text-green-700" /><span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span></div></Link>
        </div>
      </header>
      <section className="container py-8 max-w-3xl mx-auto">
        <Link href="/"><Button variant="ghost" size="sm" className="mb-4 text-green-700"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>MVP Data Overview</h1>
        <p className="text-gray-500 mb-6">Summary of the SignalCamping dataset after the verification audit.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">{allCampgrounds.length}</p><p className="text-xs text-gray-500">Total Campgrounds</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">{verifiedCount}</p><p className="text-xs text-gray-500">Verified</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-700">{Object.keys(stateCounts).length}</p><p className="text-xs text-gray-500">States</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-violet-700">{allCampgrounds.length - verifiedCount}</p><p className="text-xs text-gray-500">OSM (Unverified)</p></CardContent></Card>
        </div>

        <h2 className="text-xl font-bold mb-3">By State</h2>
        <div className="space-y-2 mb-8">
          {Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).map(([code, count]) => (
            <div key={code} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="font-medium text-sm">{STATE_NAMES[code] || code}</span>
              <Badge variant="outline">{count}</Badge>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-3">Data Sources</h2>
        <div className="space-y-2">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-600" /><div><p className="font-medium text-sm">Verified MVP ({verifiedCount})</p><p className="text-xs text-gray-500">Manually verified against Michigan DNR, Ohio DNR, NPS, USFS, Recreation.gov</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Database className="w-5 h-5 text-blue-600" /><div><p className="font-medium text-sm">OpenStreetMap ({allCampgrounds.length - verifiedCount})</p><p className="text-xs text-gray-500">Named campgrounds from Overpass API query of Great Lakes region</p></div></div></CardContent></Card>
        </div>
      </section>
      <footer className="bg-gray-900 text-gray-400 py-8"><div className="container text-center text-sm">&copy; 2026 SignalCamping</div></footer>
    </div>
  );
}
