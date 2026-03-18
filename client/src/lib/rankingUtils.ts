/**
 * rankingUtils — Shared utilities for ranking/list pages.
 *
 * Provides:
 * 1. Quality filtering (remove low-quality entries)
 * 2. Correct sorting (signal_quality_score → remote_work_score → name)
 * 3. Data-driven description generation
 *
 * Uses ONLY existing dataset fields — no data modifications.
 */

/* ─── Name-based exclusion patterns ─── */
const SITE_PATTERNS = [
  /\bsite\b/i,
  /\btent site\b/i,
  /\btent pad\b/i,
  /\bbackcountry site\b/i,
  /\bcampsite\b/i,
  /\bcamp\s*#/i,
  /\bpad\b/i,
  /\bloop\b/i,
];

/** Names that indicate a real campground — never exclude these */
const SAFE_PATTERNS = [
  /campground/i,
  /state park/i,
  /county park/i,
  /national forest/i,
  /recreation area/i,
  /\bkoa\b/i,
  /\bcamp\b/i,
];

const SAFE_OPERATORS = ["dnr", "national park", "usfs", "county"];

/** Single-word generic names that are not real campgrounds */
const SINGLE_WORD_BLOCKLIST = [
  "bear", "beaver", "deer", "eagle", "fox", "hawk", "moose", "owl",
  "pine", "oak", "birch", "cedar", "maple", "spruce", "elm",
  "north", "south", "east", "west", "upper", "lower",
];

/**
 * Check if a campground record is a legitimate campground (not an individual site).
 */
function isLegitCampground(cg: any): boolean {
  const name: string = (cg.campground_name || "").trim();

  // Very short or empty names
  if (name.length < 4) {
    // But keep if verified
    if (cg.is_verified === true || cg.is_verified === "True") return true;
    return false;
  }

  // Single character or number-only names (e.g., "A", "23E", "12")
  if (/^[A-Za-z0-9]{1,3}$/.test(name) && !/camp/i.test(name)) {
    if (cg.is_verified === true || cg.is_verified === "True") return true;
    return false;
  }

  // Check safe patterns first — if name contains a safe keyword, always keep
  if (SAFE_PATTERNS.some(p => p.test(name))) return true;

  // Check safe operator
  const operator = (cg.operator || "").toLowerCase();
  if (SAFE_OPERATORS.some(op => operator.includes(op))) return true;

  // Check verified
  if (cg.is_verified === true || cg.is_verified === "True") return true;

  // Now check exclusion patterns
  if (SITE_PATTERNS.some(p => p.test(name))) return false;

  // Single-word generic names
  const words = name.split(/\s+/);
  if (words.length === 1 && SINGLE_WORD_BLOCKLIST.includes(name.toLowerCase())) return false;

  // Contains "#" (e.g., "Site #12")
  if (name.includes("#")) return false;

  // Campground type indicates individual site
  const type = (cg.campground_type || "").toLowerCase();
  if (type.includes("site") || type.includes("backcountry") || type.includes("primitive_site")) {
    return false;
  }

  return true;
}

/**
 * Filter campgrounds for ranking lists — removes low-quality entries.
 */
export function filterForRanking(campgrounds: any[]): any[] {
  return campgrounds.filter(isLegitCampground);
}

/**
 * Filter for "Best Signal" lists — requires minimum signal_quality_score.
 */
export function filterForBestSignal(campgrounds: any[], minQuality = 85): any[] {
  return filterForRanking(campgrounds).filter(
    cg => (cg.signal_quality_score ?? cg.signal_score ?? 0) >= minQuality
  );
}

/**
 * Sort campgrounds by signal quality (primary), remote work (secondary), name (tertiary).
 */
export function sortBySignalQuality(campgrounds: any[]): any[] {
  return [...campgrounds].sort(
    (a, b) =>
      (b.signal_quality_score ?? 0) - (a.signal_quality_score ?? 0) ||
      (b.remote_work_score ?? 0) - (a.remote_work_score ?? 0) ||
      (a.campground_name || "").localeCompare(b.campground_name || "")
  );
}

/**
 * Sort campgrounds by remote work score (primary), signal quality (secondary), name (tertiary).
 */
export function sortByRemoteWork(campgrounds: any[]): any[] {
  return [...campgrounds].sort(
    (a, b) =>
      (b.remote_work_score ?? 0) - (a.remote_work_score ?? 0) ||
      (b.signal_quality_score ?? 0) - (a.signal_quality_score ?? 0) ||
      (a.campground_name || "").localeCompare(b.campground_name || "")
  );
}

/* ─── Data-driven description generation ─── */

function getSignalTier(sqs: number): "excellent" | "strong" | "moderate" | "limited" {
  if (sqs >= 90) return "excellent";
  if (sqs >= 75) return "strong";
  if (sqs >= 50) return "moderate";
  return "limited";
}

function getRemoteWorkTier(rw: number): "high" | "good" | "moderate" | "limited" {
  if (rw >= 80) return "high";
  if (rw >= 65) return "good";
  if (rw >= 45) return "moderate";
  return "limited";
}

function getCarrierSummary(cg: any): string {
  const carriers: string[] = [];
  if (cg.verizon_coverage === true) carriers.push("Verizon");
  if (cg.att_coverage === true) carriers.push("AT&T");
  if (cg.tmobile_coverage === true) carriers.push("T-Mobile");

  if (carriers.length === 3) return "all three major carriers";
  if (carriers.length === 2) return `${carriers[0]} and ${carriers[1]}`;
  if (carriers.length === 1) return carriers[0];
  return "no major carriers detected";
}

/**
 * Generate a data-driven description for a campground listing.
 * Uses carrier_count, carrier availability, signal_quality_score tier,
 * and remote_work_score tier.
 */
export function generateRankingDescription(cg: any): string {
  const sqs = cg.signal_quality_score ?? cg.signal_score ?? 0;
  const rw = cg.remote_work_score ?? 0;
  const carrierCount = cg.carrier_count ?? 0;
  const signalTier = getSignalTier(sqs);
  const rwTier = getRemoteWorkTier(rw);
  const carrierSummary = getCarrierSummary(cg);

  // Build coverage sentence
  let coverage = "";
  if (carrierCount === 3) {
    coverage = `Excellent multi-carrier coverage with ${carrierSummary} available.`;
  } else if (carrierCount === 2) {
    coverage = `Reliable two-carrier coverage from ${carrierSummary}.`;
  } else if (carrierCount === 1) {
    coverage = `Single-carrier coverage from ${carrierSummary}.`;
  } else {
    coverage = "Carrier coverage data not yet confirmed for this location.";
  }

  // Build quality sentence
  let quality = "";
  if (signalTier === "excellent") {
    quality = "Tower proximity analysis indicates excellent signal quality.";
  } else if (signalTier === "strong") {
    quality = "Signal quality is strong based on nearby tower density.";
  } else if (signalTier === "moderate") {
    quality = "Moderate signal quality with some distance to nearest towers.";
  } else {
    quality = "Limited signal quality — towers are relatively distant.";
  }

  // Build remote work sentence
  let remote = "";
  if (rwTier === "high") {
    remote = "Strong option for remote work.";
  } else if (rwTier === "good") {
    remote = "Suitable for general connectivity and light remote work.";
  } else if (rwTier === "moderate") {
    remote = "May support basic connectivity needs.";
  } else {
    remote = "Better suited for disconnecting than remote work.";
  }

  return `${coverage} ${quality} ${remote}`;
}
