/**
 * BuildSpec — Internal build specification page.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Signal, ArrowLeft } from "lucide-react";

export default function BuildSpec() {
  useEffect(() => { document.title = "Build Spec | SignalCamping"; }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/"><div className="flex items-center gap-2"><Signal className="w-5 h-5 text-green-700" /><span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>SignalCamping</span></div></Link>
        </div>
      </header>
      <div className="container py-16 text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Build Specification</h1>
        <p className="text-gray-500 mb-6">Internal build specification page.</p>
        <Link href="/"><Button className="bg-green-700 hover:bg-green-800 text-white"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Map</Button></Link>
      </div>
    </div>
  );
}
