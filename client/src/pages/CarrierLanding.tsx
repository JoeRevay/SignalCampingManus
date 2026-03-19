/**
 * CarrierLanding — Placeholder page. Signal data not yet available.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function CarrierLanding() {
  useEffect(() => { document.title = "Carrier Signal Coverage | SignalCamping"; }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />
      <div className="container py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Coming Soon</h1>
        <p className="text-gray-500 mb-6">
          This page will be available once we've collected real carrier signal coverage data for campgrounds in the Great Lakes region. We're working on gathering verified measurements.
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
