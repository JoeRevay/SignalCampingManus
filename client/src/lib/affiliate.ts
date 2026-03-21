import affiliateProducts from "@/data/affiliateProducts.json";

// ─── Paste your Amazon Associates tag here ───────────────────────────────────
const AMAZON_TAG = "signalcamping-20";
// ─────────────────────────────────────────────────────────────────────────────

export interface AffiliateProduct {
  id: string;
  type?: string;
  keywords?: string;
  title: string;
  description: string;
  merchant: string;
  url?: string;
  image?: string;
  active: boolean;
  ready?: boolean;
  priority: number;
  last_updated: string;
}

export type AffiliateSlot =
  | "portable_power"
  | "signal_booster"
  | "mobile_router"
  | "starlink_accessory";

const catalog = affiliateProducts as Record<string, AffiliateProduct[]>;

/** Build an Amazon keyword search URL with the affiliate tag. */
export function buildAmazonSearchUrl(keywords: string): string {
  const encoded = encodeURIComponent(keywords.trim());
  return `https://www.amazon.com/s?k=${encoded}&tag=${AMAZON_TAG}`;
}

/**
 * Resolve the final outbound href for a product.
 * - type "amazon_search" → generate from keywords
 * - direct url present   → use as-is
 * - fallback             → empty string (link won't render)
 */
export function resolveProductHref(product: AffiliateProduct): string {
  if (product.type === "amazon_search" && product.keywords) {
    return buildAmazonSearchUrl(product.keywords);
  }
  if (product.url) {
    return product.url;
  }
  return "";
}

export function getActiveAffiliateProducts(slot: string): AffiliateProduct[] {
  const products = catalog[slot];
  if (!products) return [];
  return products
    .filter((p) => p.active)
    .sort((a, b) => a.priority - b.priority);
}

export function getPrimaryAffiliateProduct(slot: string): AffiliateProduct | null {
  const products = getActiveAffiliateProducts(slot);
  return products.length > 0 ? products[0] : null;
}

export function getAffiliateSlotsForCampground(campground: any): AffiliateSlot[] {
  const slots: AffiliateSlot[] = [];

  const signalScore: number = campground?.signal_quality_score ?? campground?.signal_score ?? null;
  const remoteWorkScore: number = campground?.remote_work_score ?? null;

  slots.push("portable_power");

  if (signalScore !== null && signalScore < 70) {
    slots.push("signal_booster");
  }

  if (remoteWorkScore !== null && remoteWorkScore >= 70) {
    slots.push("mobile_router");
  }

  if (remoteWorkScore !== null && remoteWorkScore >= 85) {
    slots.push("starlink_accessory");
  }

  const unique = [...new Set(slots)] as AffiliateSlot[];
  return unique.slice(0, 3);
}

/** Append internal tracking params to any outbound URL (non-destructive). */
export function appendAffiliateSubId(
  url: string,
  campgroundSlug?: string,
  slot?: string
): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("sc_source", "signalcamping");
    if (campgroundSlug) parsed.searchParams.set("sc_campground", campgroundSlug);
    if (slot) parsed.searchParams.set("sc_slot", slot);
    return parsed.toString();
  } catch {
    return url;
  }
}
