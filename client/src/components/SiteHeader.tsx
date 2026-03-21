import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, Trophy, Navigation } from "lucide-react";
import rawData from "@/data/campgrounds.json";
const logoSrc = "/logo.png";

const SITE_COUNT = (rawData as any[]).length.toLocaleString();

interface SiteHeaderProps {
  onMapClick?: () => void;
}

export default function SiteHeader({ onMapClick }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img
              src={logoSrc}
              alt="SignalCamping — Where your phone works or doesn't"
              className="h-16 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>

          <div className="ml-auto flex items-center gap-1">
            {onMapClick ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex"
                onClick={onMapClick}
              >
                <MapIcon className="w-3.5 h-3.5 mr-1" /> Map
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                  <MapIcon className="w-3.5 h-3.5 mr-1" /> Map
                </Button>
              </Link>
            )}
            <Link href="/lists">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                <Trophy className="w-3.5 h-3.5 mr-1" /> Lists
              </Button>
            </Link>
            <Link href="/route-finder">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden sm:inline-flex">
                <Navigation className="w-3.5 h-3.5 mr-1" /> Routes
              </Button>
            </Link>
            <Link href="/top-campgrounds">
              <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hidden md:inline-flex">
                All Campgrounds
              </Button>
            </Link>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex border-green-200 text-green-700 bg-green-50">
              {SITE_COUNT} Sites
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
