/**
 * campgroundSummary.ts
 *
 * Generates a natural-language 2–4 sentence summary for a campground detail page.
 * Built entirely from real dataset fields — no hardcoded campground names.
 */

const STATE_NAMES: Record<string, string> = {
  MI: "Michigan",
  OH: "Ohio",
  PA: "Pennsylvania",
  WI: "Wisconsin",
};

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function generateCampgroundSummary(cg: any): string {
  const name = (cg.campground_name || "This campground").trim();
  const stateName = STATE_NAMES[cg.state] || cg.state_full || cg.state || "";
  const city = (cg.city || "").trim();
  const location = city ? `${city}, ${stateName}` : stateName;
  const typeName = (cg.campground_type || "campground")
    .replace(/_/g, " ")
    .toLowerCase();

  const signalScore: number | null =
    cg.signal_quality_score ?? cg.signal_score ?? null;
  const rwScore: number | null = cg.remote_work_score ?? null;

  // Confirmed carriers
  const carriers: string[] = [];
  if (cg.verizon_coverage === true) carriers.push("Verizon");
  if (cg.att_coverage === true) carriers.push("AT&T");
  if (cg.tmobile_coverage === true) carriers.push("T-Mobile");

  // ── Sentence 1: Opening ──────────────────────────────────────────────────
  const sentence1 = `${name} is a ${typeName}${location ? ` in ${location}` : ""}.`;

  // ── Sentence 2: Signal summary ───────────────────────────────────────────
  let sentence2 = "";
  if (signalScore !== null) {
    if (signalScore >= 70) {
      sentence2 =
        carriers.length > 0
          ? `Signal strength here is strong — ${formatList(carriers)} coverage ${carriers.length > 1 ? "are" : "is"} available based on tower proximity data, making it a reliable option for staying connected.`
          : `Signal strength here is strong, with good coverage based on tower proximity data.`;
    } else if (signalScore >= 40) {
      sentence2 =
        carriers.length > 0
          ? `Coverage is moderate — ${formatList(carriers)} ${carriers.length > 1 ? "offer" : "offers"} the best chance of connectivity at this location, though conditions can vary.`
          : `Signal here is moderate, with usable connectivity for calls and light browsing.`;
    } else {
      sentence2 =
        carriers.length > 0
          ? `Signal is limited here — ${formatList(carriers)} ${carriers.length > 1 ? "offer" : "offers"} the most reliable path to connectivity, though results may vary by device and conditions.`
          : `Signal here is weak. Plan to work offline and sync when you reach better coverage.`;
    }
  } else if (carriers.length > 0) {
    sentence2 = `${formatList(carriers)} coverage ${carriers.length > 1 ? "are" : "is"} available based on tower proximity data.`;
  }

  // ── Sentence 3: Remote work suitability ─────────────────────────────────
  let sentence3 = "";
  if (rwScore !== null) {
    if (rwScore >= 70) {
      sentence3 = `With a remote work score of ${Math.round(rwScore)}/100, it's a solid choice for campers who need to stay productive during their trip.`;
    } else if (rwScore >= 50) {
      sentence3 = `Its remote work score of ${Math.round(rwScore)}/100 means occasional connectivity is possible, though it may not suit those needing reliable daily work sessions.`;
    } else {
      sentence3 = `With a remote work score of ${Math.round(rwScore)}/100, this spot is best for an unplugged stay rather than remote work.`;
    }
  }

  // ── Sentence 4: Amenity highlight (optional) ─────────────────────────────
  const amenities: string[] = [];
  if (cg.waterfront === true) amenities.push("waterfront access");
  if (cg.electric_hookups === true) amenities.push("electric hookups");
  const sentence4 =
    amenities.length > 0 ? `The campground offers ${formatList(amenities)}.` : "";

  const parts = [sentence1, sentence2, sentence3, sentence4].filter(Boolean);
  return parts.slice(0, 4).join(" ");
}

/**
 * Generates an SEO-focused meta description for a campground page.
 */
export function generateCampgroundMeta(cg: any): string {
  const name = (cg.campground_name || "This campground").trim();
  const stateName = STATE_NAMES[cg.state] || cg.state_full || cg.state || "";
  const city = (cg.city || "").trim();
  const location = city ? `${city}, ${stateName}` : stateName;

  const signalScore: number | null =
    cg.signal_quality_score ?? cg.signal_score ?? null;
  const rwScore: number | null = cg.remote_work_score ?? null;

  const carriers: string[] = [];
  if (cg.verizon_coverage === true) carriers.push("Verizon");
  if (cg.att_coverage === true) carriers.push("AT&T");
  if (cg.tmobile_coverage === true) carriers.push("T-Mobile");

  const signalLabel =
    signalScore === null
      ? "unknown signal"
      : signalScore >= 70
      ? "strong signal"
      : signalScore >= 40
      ? "moderate signal"
      : "weak signal";

  const carrierText =
    carriers.length > 0
      ? `${formatList(carriers)} coverage available`
      : "limited carrier coverage";

  const rwText =
    rwScore !== null ? ` Remote work score: ${Math.round(rwScore)}/100.` : "";

  return `${name} in ${location} — ${signalLabel}, ${carrierText}.${rwText} View campground details, cell signal, and connectivity info on SignalCamping.`;
}
