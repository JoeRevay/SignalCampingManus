/**
 * CamperSignalReports — Crowdsourced signal quality reports per campground.
 * Allows anonymous visitors to report signal quality for Verizon, AT&T, T-Mobile.
 * Displays aggregate counts per carrier and rating.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Signal, Wifi, WifiOff, CheckCircle2, Users, BarChart3, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";

const CARRIERS = ["Verizon", "AT&T", "T-Mobile"] as const;
const RATINGS = ["Strong", "Usable", "No Signal"] as const;
type Carrier = (typeof CARRIERS)[number];
type Rating = (typeof RATINGS)[number];

const CARRIER_COLORS: Record<Carrier, { bg: string; border: string; text: string; accent: string }> = {
  Verizon: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", accent: "bg-red-600" },
  "AT&T": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", accent: "bg-blue-600" },
  "T-Mobile": { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", accent: "bg-pink-600" },
};

const RATING_CONFIG: Record<Rating, { icon: typeof Signal; color: string; bgColor: string; borderColor: string }> = {
  Strong: { icon: Signal, color: "text-green-600", bgColor: "bg-green-50 hover:bg-green-100", borderColor: "border-green-200" },
  Usable: { icon: Wifi, color: "text-amber-600", bgColor: "bg-amber-50 hover:bg-amber-100", borderColor: "border-amber-200" },
  "No Signal": { icon: WifiOff, color: "text-red-600", bgColor: "bg-red-50 hover:bg-red-100", borderColor: "border-red-200" },
};

interface CamperSignalReportsProps {
  campgroundId: string;
  campgroundName: string;
}

export default function CamperSignalReports({ campgroundId, campgroundName }: CamperSignalReportsProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [submittingRating, setSubmittingRating] = useState<Rating | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, refetch } = trpc.signalReports.getAggregates.useQuery(
    { campgroundId },
    { staleTime: 30_000 }
  );

  const submitMutation = trpc.signalReports.submit.useMutation({
    onSuccess: () => {
      toast.success("Report submitted! Thank you for helping fellow campers.");
      setSelectedCarrier(null);
      setSubmittingRating(null);
      setShowForm(false);
      refetch();
    },
    onError: (err) => {
      toast.error("Failed to submit report. Please try again.");
      setSubmittingRating(null);
    },
  });

  const handleSubmit = (carrier: Carrier, rating: Rating) => {
    setSubmittingRating(rating);
    submitMutation.mutate({ campgroundId, carrier, rating });
  };

  const aggregates = data?.aggregates;
  const totalReports = data?.totalReports ?? 0;

  // Check if any carrier has reports
  const hasReports = totalReports > 0;

  return (
    <Card className="border-violet-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            <Users className="w-5 h-5 text-violet-600" /> Camper Signal Reports
          </CardTitle>
          {totalReports > 0 && (
            <Badge variant="outline" className="text-xs border-violet-200 text-violet-600">
              {totalReports} report{totalReports !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Real signal reports from campers who visited this campground.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aggregate Display */}
        {isLoading ? (
          <div className="space-y-3">
            {CARRIERS.map((c) => (
              <div key={c} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : hasReports ? (
          <div className="space-y-3">
            {CARRIERS.map((carrier) => {
              const colors = CARRIER_COLORS[carrier];
              const counts = aggregates?.[carrier] ?? { Strong: 0, Usable: 0, "No Signal": 0 };
              const total = Object.values(counts).reduce((a, b) => a + b, 0);

              if (total === 0) return (
                <div key={carrier} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${colors.text}`}>{carrier}</span>
                    <span className="text-xs text-gray-400">No reports yet</span>
                  </div>
                </div>
              );

              return (
                <div key={carrier} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold text-sm ${colors.text}`}>{carrier}</span>
                    <span className="text-xs text-gray-500">{total} report{total !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {RATINGS.map((rating) => {
                      const config = RATING_CONFIG[rating];
                      const Icon = config.icon;
                      const count = counts[rating] ?? 0;
                      return (
                        <div key={rating} className="flex items-center gap-1.5 bg-white/70 rounded-md px-2 py-1.5">
                          <Icon className={`w-3.5 h-3.5 ${config.color} shrink-0`} />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 truncate">{rating}</p>
                            <p className={`text-sm font-bold ${config.color}`}>{count}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Visual bar */}
                  {total > 0 && (
                    <div className="mt-2 h-2 rounded-full overflow-hidden flex bg-gray-200">
                      {counts.Strong > 0 && (
                        <div
                          className="bg-green-500 transition-all"
                          style={{ width: `${(counts.Strong / total) * 100}%` }}
                        />
                      )}
                      {counts.Usable > 0 && (
                        <div
                          className="bg-amber-400 transition-all"
                          style={{ width: `${(counts.Usable / total) * 100}%` }}
                        />
                      )}
                      {counts["No Signal"] > 0 && (
                        <div
                          className="bg-red-400 transition-all"
                          style={{ width: `${(counts["No Signal"] / total) * 100}%` }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No reports yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to report signal quality here!</p>
          </div>
        )}

        {/* Submit Report Section */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" /> Hide Report Form
              </>
            ) : (
              <>
                <Signal className="w-4 h-4 mr-1" /> Report Your Signal
              </>
            )}
          </Button>

          {showForm && (
            <div className="mt-3 space-y-3">
              {/* Step 1: Select Carrier */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">1. Select your carrier</p>
                <div className="grid grid-cols-3 gap-2">
                  {CARRIERS.map((carrier) => {
                    const colors = CARRIER_COLORS[carrier];
                    const isSelected = selectedCarrier === carrier;
                    return (
                      <button
                        key={carrier}
                        onClick={() => setSelectedCarrier(carrier)}
                        className={`p-3 rounded-lg border-2 text-center transition-all text-sm font-medium ${
                          isSelected
                            ? `${colors.bg} ${colors.border} ${colors.text} shadow-sm`
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {carrier}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Rating */}
              {selectedCarrier && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    2. How was {selectedCarrier} signal?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {RATINGS.map((rating) => {
                      const config = RATING_CONFIG[rating];
                      const Icon = config.icon;
                      const isSubmitting = submittingRating === rating && submitMutation.isPending;
                      return (
                        <button
                          key={rating}
                          onClick={() => handleSubmit(selectedCarrier, rating)}
                          disabled={submitMutation.isPending}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${config.bgColor} ${config.borderColor} disabled:opacity-50`}
                        >
                          <Icon className={`w-5 h-5 ${config.color} mx-auto mb-1`} />
                          <span className={`text-xs font-medium ${config.color} block`}>
                            {isSubmitting ? "Sending..." : rating}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-gray-400 leading-tight">
          Signal reports are submitted anonymously by campground visitors. Individual experiences may vary
          based on device, time of day, weather, and network conditions.
        </p>
      </CardContent>
    </Card>
  );
}
