import {
  getAffiliateSlotsForCampground,
  getPrimaryAffiliateProduct,
  appendAffiliateSubId,
  type AffiliateProduct,
} from "@/lib/affiliate";

interface AffiliateRecommendationsProps {
  campground: any;
}

interface ResolvedRec {
  slot: string;
  product: AffiliateProduct;
}

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
      return product ? { slot, product } : null;
    })
    .filter((r): r is ResolvedRec => r !== null);

  if (recs.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Recommended Gear for Staying Connected
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Based on this campground's connectivity profile, these are the most relevant gear picks.
        </p>
      </div>

      <div className="space-y-2">
        {recs.map(({ slot, product }) => {
          const href = appendAffiliateSubId(product.url, slug, slot);
          return (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-start gap-3"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-14 h-14 object-cover rounded shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{product.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{product.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">via {product.merchant}</p>
              </div>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="shrink-0"
              >
                <button className="text-xs font-medium bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap">
                  View Deal
                </button>
              </a>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 mt-2 leading-snug">
        Some links may be affiliate links, which means SignalCamping may earn a commission at no extra cost to you.
      </p>
    </div>
  );
}
