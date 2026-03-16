/**
 * Carrier Likelihood Classification
 *
 * Converts raw boolean coverage fields into confidence-based display labels.
 * This avoids misleading "Not detected" language when tower data is incomplete.
 *
 * Rules:
 *   raw = true                                        → "Likely"
 *   raw = false BUT proximity/infrastructure suggests  → "Possible"
 *   raw = false AND remote/backcountry                 → "Unknown"
 */

export type CarrierLikelihood = "Likely" | "Possible" | "Unknown";

export interface CarrierLikelihoodResult {
  verizon: CarrierLikelihood;
  att: CarrierLikelihood;
  tmobile: CarrierLikelihood;
}

interface CampgroundSignalData {
  verizon_coverage?: boolean;
  att_coverage?: boolean;
  tmobile_coverage?: boolean;
  carrier_count?: number;
  distance_to_town_miles?: number | null;
  distance_to_highway_miles?: number | null;
  backcountry?: boolean;
  group_only?: boolean;
  campground_type?: string;
}

function isNearInfrastructure(cg: CampgroundSignalData): boolean {
  if ((cg.carrier_count ?? 0) >= 2) return true;
  if (cg.distance_to_town_miles != null && cg.distance_to_town_miles <= 10) return true;
  if (cg.distance_to_highway_miles != null && cg.distance_to_highway_miles <= 5) return true;
  if (!cg.backcountry && !cg.group_only) return true;
  return false;
}

function classifyCarrier(rawCoverage: boolean | undefined, cg: CampgroundSignalData): CarrierLikelihood {
  if (rawCoverage === true) return "Likely";
  if (isNearInfrastructure(cg)) return "Possible";
  return "Unknown";
}

export function getCarrierLikelihood(cg: CampgroundSignalData): CarrierLikelihoodResult {
  return {
    verizon: classifyCarrier(cg.verizon_coverage, cg),
    att: classifyCarrier(cg.att_coverage, cg),
    tmobile: classifyCarrier(cg.tmobile_coverage, cg),
  };
}

/** Display config for each likelihood level */
export const LIKELIHOOD_STYLES = {
  Likely: {
    label: "Likely",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
    dotColor: "#16a34a",
    icon: "wifi" as const,
  },
  Possible: {
    label: "Possible",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    dotColor: "#d97706",
    icon: "wifi" as const,
  },
  Unknown: {
    label: "Unknown",
    bgClass: "bg-gray-50",
    textClass: "text-gray-500",
    borderClass: "border-gray-200",
    dotColor: "#9ca3af",
    icon: "help" as const,
  },
} as const;

/** HTML color for use in map popup (inline styles) */
export function getLikelihoodColor(level: CarrierLikelihood): string {
  return LIKELIHOOD_STYLES[level].dotColor;
}

/** HTML symbol for use in map popup */
export function getLikelihoodSymbol(level: CarrierLikelihood): string {
  switch (level) {
    case "Likely": return "✓";
    case "Possible": return "~";
    case "Unknown": return "?";
  }
}

export const CARRIER_DISCLAIMER =
  "Carrier likelihood is modeled from public data and may vary by exact campsite, terrain, device, and network changes.";
