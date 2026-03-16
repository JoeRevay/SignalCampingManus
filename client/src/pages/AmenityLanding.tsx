/**
 * AmenityLanding — Placeholder page. Signal data not yet available.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Signal, MapPin, ArrowLeft, Info } from "lucide-react";

export default function AmenityLanding() {
  useEffect(() => { document.title = "Amenity-Based Campground Search | SignalCamping"; }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/"><div className="flex items-center gap-2"><Signal className="w-5 h-5 text-green-700" /><span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span></div></Link>
          <div className="ml-auto"><Link href="/"><Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700"><MapPin className="w-3.5 h-3.5 mr-1" /> Map</Button></Link></div>
        </div>
      </header>
      <div className="container py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Coming Soon</h1>
        <p className="text-gray-500 mb-6">
          This page will be available once we've collected real amenity-based campground search data for campgrounds in the Great Lakes region. We're working on gathering verified measurements.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/"><Button className="bg-green-700 hover:bg-green-800 text-white"><ArrowLeft className="w-4 h-4 mr-2" /> Explore Map</Button></Link>
          <Link href="/top-campgrounds"><Button variant="outline">All Campgrounds</Button></Link>
        </div>
      </div>
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto"><div className="container text-center text-sm">&copy; 2026 SignalCamping</div></footer>
    </div>
  );
}
