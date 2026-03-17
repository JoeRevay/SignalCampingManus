/**
 * campgroundBlurb — Generate short descriptive blurbs for campground listings.
 *
 * Uses ONLY existing dataset fields: nearest_town, distance_to_town_miles,
 * state, campground_type, carrier likelihood, remote_work_score, waterfront,
 * backcountry, signal_score.
 *
 * No data modifications — pure presentation logic.
 */

import { getCarrierLikelihood, type CarrierLikelihoodResult } from "./carrierLikelihood";

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan",
  OH: "Ohio",
  PA: "Pennsylvania",
  WI: "Wisconsin",
};

interface BlurbCampground {
  campground_name: string;
  state: string;
  city?: string;
  campground_type?: string;
  nearest_town?: string;
  distance_to_town_miles?: number | null;
  distance_to_highway_miles?: number | null;
  signal_score?: number;
  remote_work_score?: number;
  carrier_count?: number;
  verizon_coverage?: boolean;
  att_coverage?: boolean;
  tmobile_coverage?: boolean;
  waterfront?: boolean | string;
  backcountry?: boolean;
  [key: string]: any;
}

/**
 * Build a carrier summary string like "Verizon, AT&T, and T-Mobile"
 * from the likelihood result, including only "Likely" carriers.
 */
function likelyCarrierList(likelihood: CarrierLikelihoodResult): string {
  const carriers: string[] = [];
  if (likelihood.verizon === "Likely") carriers.push("Verizon");
  if (likelihood.att === "Likely") carriers.push("AT&T");
  if (likelihood.tmobile === "Likely") carriers.push("T-Mobile");
  if (carriers.length === 0) return "";
  if (carriers.length === 1) return carriers[0];
  if (carriers.length === 2) return `${carriers[0]} and ${carriers[1]}`;
  return `${carriers[0]}, ${carriers[1]}, and ${carriers[2]}`;
}

/**
 * Describe the campground type in natural language.
 */
function typePhrase(type?: string): string {
  if (!type) return "campground";
  const t = type.replace(/_/g, " ").toLowerCase();
  if (t.includes("state park")) return "state park campground";
  if (t.includes("national forest")) return "national forest campground";
  if (t.includes("state forest")) return "state forest campground";
  if (t.includes("county park")) return "county park campground";
  if (t.includes("private")) return "private campground";
  return t;
}

/**
 * Describe proximity to town in natural language.
 */
function townPhrase(cg: BlurbCampground): string {
  if (!cg.nearest_town) return "";
  // Clean up town name: "Muskegon city, MI" → "Muskegon"
  const town = cg.nearest_town
    .replace(/ city,? [A-Z]{2}$/i, "")
    .replace(/ town,? [A-Z]{2}$/i, "")
    .replace(/ village,? [A-Z]{2}$/i, "")
    .replace(/,? [A-Z]{2}$/, "")
    .trim();
  if (!town) return "";

  const dist = cg.distance_to_town_miles;
  if (dist != null && dist <= 5) return `near ${town}`;
  if (dist != null && dist <= 15) return `about ${Math.round(dist)} miles from ${town}`;
  if (dist != null) return `roughly ${Math.round(dist)} miles from ${town}`;
  return `in the ${town} area`;
}

/**
 * Generate a 1–2 sentence descriptive blurb for a campground.
 */
export function generateBlurb(cg: BlurbCampground): string {
  const likelihood = getCarrierLikelihood(cg);
  const stateName = STATE_NAMES[cg.state] || cg.state;
  const type = typePhrase(cg.campground_type);
  const town = townPhrase(cg);
  const carriers = likelyCarrierList(likelihood);
  const isWaterfront = cg.waterfront === true || cg.waterfront === "True";
  const rwScore = cg.remote_work_score ?? 0;
  const sigScore = cg.signal_score ?? 0;

  // Build first sentence: location + type
  let sentence1 = "";
  if (town) {
    sentence1 = `This ${type} ${town} in ${stateName}`;
  } else if (cg.city) {
    sentence1 = `This ${type} near ${cg.city} in ${stateName}`;
  } else {
    sentence1 = `This ${stateName} ${type}`;
  }

  // Add waterfront note
  if (isWaterfront) {
    sentence1 += " sits along the waterfront";
  }

  // Build second sentence: signal/carrier/remote work info
  let sentence2 = "";
  if (carriers && sigScore >= 70) {
    sentence2 = `offers strong coverage from ${carriers}`;
  } else if (carriers && sigScore >= 40) {
    sentence2 = `has moderate coverage from ${carriers}`;
  } else if (sigScore >= 70) {
    sentence2 = `has a strong signal score with coverage possible from multiple carriers`;
  } else if (sigScore >= 40) {
    sentence2 = `has moderate signal coverage`;
  } else {
    sentence2 = `has limited signal coverage — ideal for disconnecting`;
  }

  // Add remote work context
  if (rwScore >= 80) {
    sentence2 += " and is well-suited for remote work";
  } else if (rwScore >= 60) {
    sentence2 += " with reasonable remote work potential";
  }

  // Add town amenity access
  const dist = cg.distance_to_town_miles;
  if (dist != null && dist <= 10 && cg.nearest_town) {
    const cleanTown = cg.nearest_town
      .replace(/ city,? [A-Z]{2}$/i, "")
      .replace(/ town,? [A-Z]{2}$/i, "")
      .replace(/ village,? [A-Z]{2}$/i, "")
      .replace(/,? [A-Z]{2}$/, "")
      .trim();
    if (cleanTown && !sentence1.includes(cleanTown)) {
      sentence2 += `, with quick access to amenities in ${cleanTown}`;
    }
  }

  return `${sentence1} ${sentence2}.`;
}
