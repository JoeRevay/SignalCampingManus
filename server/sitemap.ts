import fs from "fs";
import path from "path";

const BASE_URL = "https://signalcamping.com";
const VALID_STATES = new Set(["MI", "OH", "PA", "WI"]);
const STATE_SLUGS: Record<string, string> = { MI: "mi", OH: "oh", PA: "pa", WI: "wi" };

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function loadCampgrounds(): any[] {
  const candidates = [
    path.resolve(process.cwd(), "client/src/data/campgrounds.json"),
    path.resolve(process.cwd(), "data/campgrounds.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      } catch {
        console.error(`[Sitemap] Failed to parse ${p}`);
      }
    }
  }
  console.warn("[Sitemap] campgrounds.json not found — sitemap will be incomplete");
  return [];
}

const FULL_STATE_NAMES: Record<string, string> = {
  MI: "michigan",
  OH: "ohio",
  PA: "pennsylvania",
  WI: "wisconsin",
};
const SEO_CARRIERS = ["verizon", "att", "tmobile"];

let _cachedXml: string | null = null;

export function generateSitemapXml(): string {
  if (_cachedXml) return _cachedXml;

  const today = new Date().toISOString().split("T")[0];
  const campgrounds = loadCampgrounds();

  // Top 500 campground pages by signal_quality_score
  const top500 = [...campgrounds]
    .sort((a, b) => (b.signal_quality_score || 0) - (a.signal_quality_score || 0))
    .slice(0, 500);

  // Qualifying city pages
  // Threshold: 3+ campgrounds OR ≥1 strong-signal (score≥80) OR ≥1 remote-work-ready (score≥60)
  const cityData: Record<string, { count: number; strongSignal: number; remoteWorkReady: number }> = {};
  for (const cg of campgrounds) {
    const state = (cg.state || "").toUpperCase();
    const city = cg.city || "";
    if (!VALID_STATES.has(state) || !city) continue;
    const key = `${state}::${normalize(city)}`;
    if (!cityData[key]) cityData[key] = { count: 0, strongSignal: 0, remoteWorkReady: 0 };
    cityData[key].count++;
    if ((cg.signal_score || 0) >= 80) cityData[key].strongSignal++;
    if ((cg.remote_work_score || 0) >= 60) cityData[key].remoteWorkReady++;
  }

  const qualifyingCities = Object.entries(cityData)
    .filter(([, s]) => s.count >= 3 || s.strongSignal >= 1 || s.remoteWorkReady >= 1)
    .map(([key]) => {
      const [state, citySlug] = key.split("::");
      return { state, citySlug };
    })
    .sort((a, b) => a.state.localeCompare(b.state) || a.citySlug.localeCompare(b.citySlug));

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  function addUrl(urlPath: string, priority: string, freq: string) {
    lines.push(`  <url>`);
    lines.push(`    <loc>${BASE_URL}${urlPath}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push(`    <changefreq>${freq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    lines.push(`  </url>`);
  }

  // Static pages
  const staticPages: [string, string, string][] = [
    ["/", "1.0", "weekly"],
    ["/top-campgrounds", "0.9", "weekly"],
    ["/campgrounds/mi", "0.8", "weekly"],
    ["/campgrounds/oh", "0.8", "weekly"],
    ["/campgrounds/pa", "0.8", "weekly"],
    ["/campgrounds/wi", "0.8", "weekly"],
    ["/best-cell-signal-campgrounds-upper-peninsula", "0.8", "monthly"],
    ["/best-verizon-signal-campgrounds-michigan", "0.8", "monthly"],
    ["/best-remote-work-campgrounds", "0.8", "monthly"],
    ["/route-finder", "0.7", "monthly"],
    ["/lists", "0.6", "monthly"],
  ];
  for (const [p, priority, freq] of staticPages) addUrl(p, priority, freq);

  // Carrier pages (4 states × 3 carriers = 12)
  for (const stateSlug of ["mi", "oh", "pa", "wi"]) {
    for (const carrier of ["verizon", "att", "tmobile"]) {
      addUrl(`/campgrounds-with-${carrier}-signal/${stateSlug}`, "0.7", "monthly");
    }
  }

  // Remote work pages (4 states)
  for (const stateSlug of ["mi", "oh", "pa", "wi"]) {
    addUrl(`/remote-work-camping/${stateSlug}`, "0.7", "monthly");
  }

  // New SEO ranking pages: carrier + state, remote work + state, strong signal + state
  for (const stateName of Object.values(FULL_STATE_NAMES)) {
    for (const carrier of SEO_CARRIERS) {
      addUrl(`/best-campgrounds-with-${carrier}-signal-in/${stateName}`, "0.8", "monthly");
    }
    addUrl(`/best-remote-work-campgrounds-in/${stateName}`, "0.8", "monthly");
    addUrl(`/campgrounds-with-strong-cell-service-in/${stateName}`, "0.8", "monthly");
  }

  // Top 500 campground pages
  for (const cg of top500) {
    if (cg.slug) addUrl(`/campground/${cg.slug}`, "0.6", "monthly");
  }

  // Qualifying city pages
  for (const { state, citySlug } of qualifyingCities) {
    const stateCode = STATE_SLUGS[state];
    addUrl(`/campgrounds-with-cell-service/${citySlug}-${stateCode}`, "0.5", "monthly");
  }

  lines.push("</urlset>");

  const xml = lines.join("\n");
  _cachedXml = xml;

  const newSeoCount = Object.keys(FULL_STATE_NAMES).length * (SEO_CARRIERS.length + 2); // 3 carriers + remote-work + strong-signal per state
  console.log(
    `[Sitemap] Generated: ${staticPages.length} static + 12 carrier + 4 remote-work + ` +
    `${newSeoCount} new-seo-ranking + ` +
    `${top500.filter(c => c.slug).length} campground + ${qualifyingCities.length} city = ` +
    `${staticPages.length + 12 + 4 + newSeoCount + top500.filter(c => c.slug).length + qualifyingCities.length} URLs`
  );

  return xml;
}
