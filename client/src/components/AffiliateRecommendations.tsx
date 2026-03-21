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

const SLOT_CONFIG: Record<string, {
  title: string;
  helper: string;
  ctaLabel: string;
  socialProof: string;
}> = {
  portable_power: {
    title: "Portable Power for Off-Grid Reliability",
    helper: "A practical backup for charging devices and staying productive at camp.",
    ctaLabel: "View Power Solutions",
    socialProof: "Common setup used by campers working remotely.",
  },
  signal_booster: {
    title: "Signal Boosters for Weak Coverage",
    helper: "Best when this campground has inconsistent or marginal cell reception.",
    ctaLabel: "Fix Weak Signal",
    socialProof: "Popular for improving connectivity at similar campgrounds.",
  },
  mobile_router: {
    title: "Mobile Routers for Flexible Work Setups",
    helper: "Useful when multiple devices need a more stable or shareable connection.",
    ctaLabel: "Improve Connectivity",
    socialProof: "Common setup used by campers working remotely.",
  },
  starlink_accessory: {
    title: "Starlink Add-Ons for High-Connectivity Camping",
    helper: "Ideal for building a more advanced remote-work setup at camp.",
    ctaLabel: "Upgrade Your Setup",
    socialProof: "Popular for improving connectivity at similar campgrounds.",
  },
};

function FeaturedCard({ rec, signalWeak }: { rec: ResolvedRec; signalWeak: boolean }) {
  const config = SLOT_CONFIG[rec.slot] ?? {
    title: rec.product.title,
    helper: rec.product.description,
    ctaLabel: "View Options",
    socialProof: "",
  };

  const featuredLabel = signalWeak ? "Recommended Setup for Weak Signal" : "Recommended Setup";
  const trustCopy = signalWeak
    ? "Chosen to improve reliability in low-signal conditions."
    : "Chosen based on signal strength, reliability, and real-world usage.";

  return (
    <div className="bg-white rounded-lg border border-green-100 shadow-sm p-4">
      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full mb-3">
        {featuredLabel}
      </span>
      <div className="flex items-start gap-3">
        {rec.product.image && (
          <img
            src={rec.product.image}
            alt={rec.product.title}
            className="w-12 h-12 object-cover rounded-md border border-gray-100 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug">{config.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">via {rec.product.merchant}</p>
          <p className="text-[11px] text-green-700 font-medium mt-1">{trustCopy}</p>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{config.helper}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
        <p className="text-[11px] text-gray-400 italic leading-snug">{config.socialProof}</p>
        <a href={rec.href} target="_blank" rel="noopener noreferrer sponsored" className="shrink-0">
          <button className="text-xs font-semibold bg-green-700 hover:bg-green-800 active:bg-green-900 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            {config.ctaLabel} →
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
    ctaLabel: "View Options",
    socialProof: "",
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 leading-snug">{config.title}</p>
        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{config.helper}</p>
      </div>
      <a
        href={rec.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="shrink-0"
      >
        <button className="text-[11px] font-semibold text-green-700 border border-green-300 hover:bg-green-50 active:bg-green-100 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap">
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

  const signalScore: number = campground.signal_quality_score ?? campground.signal_score ?? null;
  const signalWeak = signalScore !== null && signalScore < 70;

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

  const hookText = signalWeak
    ? "Signal is weak here — this setup helps you stay connected."
    : "Solid signal here — these upgrades can improve reliability and performance.";

  return (
    <div className="rounded-xl border border-gray-300 bg-gradient-to-b from-stone-50 to-white p-5 space-y-3 shadow-sm">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 leading-tight">
          Recommended Gear for This Campground
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Selected based on this campground's connectivity and remote-work profile.
        </p>
      </div>

      {/* Contextual hook */}
      <div className={`text-xs font-semibold px-3 py-2 rounded-md ${
        signalWeak
          ? "bg-amber-50 text-amber-800 border border-amber-200"
          : "bg-green-50 text-green-800 border border-green-200"
      }`}>
        {hookText}
      </div>

      {/* Featured card */}
      <FeaturedCard rec={featured} signalWeak={signalWeak} />

      {/* Secondary cards */}
      {secondary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
