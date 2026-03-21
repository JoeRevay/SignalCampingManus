import affiliateProducts from "@/data/affiliateProducts.json";

export interface AffiliateProduct {
  id: string;
  title: string;
  description: string;
  merchant: string;
  url: string;
  image: string;
  active: boolean;
  priority: number;
  last_updated: string;
}

export type AffiliateSlot =
  | "portable_power"
  | "signal_booster"
  | "mobile_router"
  | "starlink_accessory";

const catalog = affiliateProducts as Record<string, AffiliateProduct[]>;

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
