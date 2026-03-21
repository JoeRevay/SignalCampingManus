import {
  getAffiliateSlotsForCampground,
  getPrimaryAffiliateProduct,
  resolveProductHref,
  appendAffiliateSubId,
  type AffiliateProduct,
} from "@/lib/affiliate";

interface AffiliateRecommendationsProps {
  campground: any;
}

interface ResolvedRec {
  slot: string;
  product: AffiliateProduct;
  href: string;
}

const SLOT_CONFIG: Record<string, { ctaLabel: string; helpText: string }> = {
  portable_power: {
    ctaLabel: "Shop Portable Power",
    helpText: "Helpful for off-grid camping, backup charging, and remote work.",
  },
  signal_booster: {
    ctaLabel: "Shop Signal Boosters",
    helpText: "Best for campgrounds with weaker or inconsistent signal.",
  },
  mobile_router: {
    ctaLabel: "Shop Mobile Routers",
    helpText: "Useful when multiple devices need a more flexible connection setup.",
  },
  starlink_accessory: {
    ctaLabel: "Shop Starlink Gear",
    helpText: "Ideal for high-connectivity camping and advanced remote work setups.",
  },
};

export default function AffiliateRecommendations({ campground }: AffiliateRecommendationsProps) {
  if (!campground) return null;

  const slug: string =
    campground.slug ||
    (campground.campground_name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const slots = getAffiliateSlotsForCampground(campground);

  const recs: ResolvedRec[] = slots
    .map((slot) => {
      const product = getPrimaryAffiliateProduct(slot);
      if (!product) return null;
      const base = resolveProductHref(product);
      if (!base) return null;
      const href = appendAffiliateSubId(base, slug, slot);
      return { slot, product, href };
    })
    .filter((r): r is ResolvedRec => r !== null);

  if (recs.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              Recommended Gear for Staying Connected
            </h3>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
              Curated Picks
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Curated gear picks based on this campground's signal and remote-work profile.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {recs.map(({ slot, product, href }) => {
          const config = SLOT_CONFIG[slot] ?? { ctaLabel: "View Deal", helpText: "" };
          return (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex items-start gap-3"
            >
              {/* Image or placeholder */}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-md border border-gray-100 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-md border border-gray-100 bg-gray-100 shrink-0" />
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{product.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">via {product.merchant}</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{product.description}</p>
                {config.helpText && (
                  <p className="text-[11px] text-gray-400 mt-1 italic leading-snug">{config.helpText}</p>
                )}
              </div>

              {/* CTA */}
              <div className="shrink-0 self-center">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  <button className="text-xs font-semibold bg-green-700 hover:bg-green-800 active:bg-green-900 text-white px-3 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm">
                    {config.ctaLabel}
                  </button>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclosure */}
      <p className="text-[10px] text-gray-400 mt-3 leading-snug">
        Some links may be affiliate links, which means SignalCamping may earn a commission at no extra cost to you.
      </p>
    </div>
  );
}
