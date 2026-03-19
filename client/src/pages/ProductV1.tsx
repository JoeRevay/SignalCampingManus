/**
 * ProductV1 — Product documentation page.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function ProductV1() {
  useEffect(() => { document.title = "Product V1 | SignalCamping"; }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <SiteHeader />
      <div className="container py-16 text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Product V1</h1>
        <p className="text-gray-500 mb-6">Internal product documentation page. Visit the main site for campground data.</p>
        <Link href="/"><Button className="bg-green-700 hover:bg-green-800 text-white"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Map</Button></Link>
      </div>
    </div>
  );
}
