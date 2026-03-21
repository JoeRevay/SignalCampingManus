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

const SLOT_CONFIG: Record<string, { title: string; helper: string; ctaLabel: string; featuredLabel: string }> = {
  portable_power: {
    title: "Portable Power for Off-Grid Reliability",
    helper: "A practical backup for charging devices, running gear, and staying productive at camp.",
    ctaLabel: "Browse Power Options",
    featuredLabel: "Top pick for this campground",
  },
  signal_booster: {
    title: "Signal Boosters for Weak Coverage",
    helper: "Best when this campground has inconsistent or marginal cell reception.",
    ctaLabel: "Browse Signal Boosters",
    featuredLabel: "Recommended for this signal level",
  },
  mobile_router: {
    title: "Mobile Routers for Flexible Work Setups",
    helper: "Useful when multiple devices need a more stable or shareable connection.",
    ctaLabel: "Browse Mobile Routers",
    featuredLabel: "Useful for remote work here",
  },
  starlink_accessory: {
    title: "Starlink Add-Ons for High-Connectivity Camping",
    helper: "Ideal for campers building a more advanced remote-work setup.",
    ctaLabel: "Browse Starlink Gear",
    featuredLabel: "For advanced connectivity setups",
  },
};

function FeaturedCard({ rec }: { rec: ResolvedRec }) {
  const config = SLOT_CONFIG[rec.slot] ?? {
    title: rec.product.title,
    helper: rec.product.description,
    ctaLabel: "View Deal",
    featuredLabel: "Recommended",
  };
  return (
    <div className="bg-white rounded-lg border border-green-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
          {config.featuredLabel}
        </span>
      </div>
      <div className="flex items-start gap-3">
        {rec.product.image && (
          <img
            src={rec.product.image}
            alt={rec.product.title}
            className="w-14 h-14 object-cover rounded-md border border-gray-100 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug">{config.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">via {rec.product.merchant}</p>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{config.helper}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <a
          href={rec.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block"
        >
          <button className="w-full text-sm font-semibold bg-green-700 hover:bg-green-800 active:bg-green-900 text-white px-4 py-2.5 rounded-lg transition-colors">
            {config.ctaLabel}
          </button>
        </a>
      </div>
    </div>
  );
}

function SecondaryCard({ rec }: { rec: ResolvedRec }) {
  const config = SLOT_CONFIG[rec.slot] ?? {
    title: rec.product.title,
    helper: rec.product.description,
    ctaLabel: "View Deal",
    featuredLabel: "",
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-snug truncate">{config.title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{config.helper}</p>
      </div>
      <a
        href={rec.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="shrink-0"
      >
        <button className="text-[11px] font-semibold text-green-700 border border-green-300 hover:bg-green-50 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap">
          {config.ctaLabel}
        </button>
      </a>
    </div>
  );
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
      if (!product) return null;
      const base = resolveProductHref(product);
      if (!base) return null;
      const href = appendAffiliateSubId(base, slug, slot);
      return { slot, product, href };
    })
    .filter((r): r is ResolvedRec => r !== null);

  if (recs.length === 0) return null;

  const [featured, ...secondary] = recs;

  return (
    <div className="rounded-xl border border-gray-200 bg-stone-50/70 p-4 space-y-3">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 leading-tight">
          Recommended Gear for This Campground
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Selected based on this campground's connectivity and remote-work profile.
        </p>
      </div>

      {/* Featured card */}
      <FeaturedCard rec={featured} />

      {/* Secondary cards */}
      {secondary.length > 0 && (
        <div className="space-y-2">
          {secondary.map((rec) => (
            <SecondaryCard key={rec.product.id} rec={rec} />
          ))}
        </div>
      )}

      {/* Disclosure */}
      <p className="text-[10px] text-gray-400 leading-snug">
        Some links may be affiliate links, which means SignalCamping may earn a commission at no extra cost to you.
      </p>
    </div>
  );
}
