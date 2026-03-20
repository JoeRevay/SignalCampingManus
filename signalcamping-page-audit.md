# SignalCamping — Public Page Audit
_Generated March 20, 2026_

---

## Strong / Production-Ready

### `StateLanding` — `/campgrounds/:state` (MI, OH, PA, WI)
Rich, consistent structure across all four states: keyword-targeted H1, stat badges (campground count, strong signal, remote-work ready), carrier browse cards, top-5 by signal list, 6-paragraph SEO intro with dynamic state stats, stats grid, ranked top-15 "Best Campgrounds for Cell Service" list with carrier likelihood badges, "How We Rank" methodology section, and a searchable/paginated directory. Michigan additionally gets two featured cards (Upper Peninsula, Verizon Michigan). No thin content. No placeholder sections.

**Recommended action:** None. This is the content benchmark.

---

### `TopCampgrounds` — `/top-campgrounds`
Hub page with a strong hero, SEO intro paragraphs, top-25 signal-ranked list with per-campground blurbs and carrier badges, Browse by Region card grid, Browse by Carrier section, Browse by Use Case links, and a full filtered/paginated directory with sort options. Clean metadata.

**Recommended action:** Minor — the "AT&T Coming Soon" and "T-Mobile Coming Soon" cards in Browse by Carrier are misleading since those carrier pages actually exist. They link to `/best-verizon-signal-campgrounds-michigan` only rather than the general carrier landing pages.

---

### `CarrierLanding` — `/campgrounds-with-{verizon|att|tmobile}-signal/:state`
12 live routes (3 carriers × 4 states). Has breadcrumbs, signal-ranked campground list filtered by carrier, other-carriers sidebar, other-states sidebar, remote work link, FAQ section, disclaimer, and per-page SEO metadata. Fully dynamic by carrier and state.

**Recommended action:** None.

---

### `CampgroundLanding` — `/campground/:slug`
Individual detail pages with JSON-LD structured data, signal score display, carrier likelihood badges with a methodology disclaimer, amenity icons, Google Maps embed, signal report submission form (works anonymously), and cross-links to carrier pages and the remote work page. Merges MVP verified data over the base dataset.

**Recommended action:** None structurally. The Google Maps embed shows a domain restriction error in dev (`RefererNotAllowedMapError`) — requires the production domain to be allowlisted in Google Cloud Console before deploy.

---

### `UpperPeninsulaSignal` — `/best-cell-signal-campgrounds-upper-peninsula`
Focused, real content: top U.P. campgrounds filtered and ranked by signal quality, with carrier badges, score bars, and data-driven descriptions. Includes related signal guide cross-links.

**Recommended action:** None.

---

### `VerizonMichigan` — `/best-verizon-signal-campgrounds-michigan`
Top-25 Michigan campgrounds ranked by Verizon signal, with expandable rows showing score bars (signal + remote work), carrier badges, and tower distance data. Includes related signal guide cross-links.

**Recommended action:** None.

---

### `BestRemoteWork` — `/best-remote-work-campgrounds`
Top-50 remote-work-ranked campgrounds with score bars (signal + remote work), carrier badges, state filtering, and links to per-state campground pages and top campground detail pages. Has methodology context and a disclaimer.

**Recommended action:** None structurally. Minor SEO issue — it lacks a meta description tag, unlike the state pages.

---

## Acceptable — Needs Improvement

### `RouteFinder` — `/route-finder`
The tool is genuinely functional: Google Places autocomplete, geocoding with error handling, haversine corridor algorithm, adjustable corridor width slider, 5 preset routes, and a ranked list of up to 50 campgrounds. Works without signal data.

**Issues:**
- Results show campground type and amenity badges but **no signal score or carrier likelihood** — a glaring omission for a site built around signal. The campground cards in results are identical to a generic directory listing.
- No SEO content. The page is purely interactive — a crawler sees "Route Finder" and a blank results area. Not indexable in a meaningful way.
- No meta description.

**Recommended action:** Add `signal_score` and at least one carrier badge to each result card. Add a short intro paragraph below the H1 for SEO. The tool itself does not need rebuilding.

---

### `ListsDirectory` — `/lists`
Renders a grid of curated list cards (title, short description, campground count). Functional and clean.

**Issues:**
- No SEO intro text explaining what the lists section is.
- No meta title/description tag is set (generic browser tab title).
- No signal data or signal context appears anywhere on this page.

**Recommended action:** Set a meta title/description. Add two sentences of intro copy explaining the lists. Low-priority.

---

### `ShareableList` — `/list/:slug`
Shows a titled campground list with breadcrumbs, a description, and campground cards.

**Issues:**
- Cards show name, city, campground type, and amenity badges — **no signal score, no carrier likelihood**. This is a display-layer omission only; the data is available in the merged campground lookup already built in the component.
- No meta description is set.

**Recommended action:** Add `signal_score` and a carrier likelihood indicator to each campground card. The data exists — this is a display change only.

---

## Thin / Placeholder / Risky to Expose Publicly

### `RemoteWorkLanding` — `/remote-work-camping/:state`
Pure "Coming Soon" placeholder. Displays an info icon, a heading, a one-sentence explanation, and two buttons back to the home and all-campgrounds pages. Nothing else.

**Why this is risky:** This URL is directly linked from the state landing pages (visible on every campground card above a remote work score threshold) and from `BestRemoteWork`. It receives real traffic intent from users who clicked through expecting remote-work campground rankings per state — and delivers a dead end. A fully functional `BestRemoteWork` page with per-state filtering already exists at `/best-remote-work-campgrounds`.

**Recommended action (two options):**
1. Replace the placeholder with a real per-state filtered page using `remote_work_score` data that already exists in the dataset.
2. Minimum viable fix: redirect `/remote-work-camping/:state` to `/best-remote-work-campgrounds` with a state parameter.

---

### `AmenityLanding` — Six route patterns × 4 states = 24 URLs
Routes: `/waterfront-campgrounds-with-cell-service/:state`, `/tent-campgrounds-with-cell-service/:state`, `/rv-campgrounds-with-cell-service/:state`, `/electric-campgrounds-with-cell-service/:state`, `/lakefront-campgrounds-with-cell-service/:state`, `/forest-campgrounds-with-cell-service/:state`

All 24 possible URLs hit the identical "Coming Soon" placeholder. The amenity booleans (`tent_sites`, `rv_sites`, `electric_hookups`, `waterfront`) already exist in the dataset — the data to power these pages is present.

**Why this is risky:** These are keyword-valuable URLs (e.g., "waterfront campgrounds with cell service Michigan"). If indexed as "Coming Soon" pages, they damage crawl trust and waste indexability. They are not currently in visible navigation, which limits immediate SEO harm, but they are accessible and crawlable.

**Recommended action:** Either implement them (each page would be a filtered version of StateLanding filtered by amenity boolean + state — the data exists), or add `noindex` meta tags to all six route templates until they are ready, and remove any links pointing to them.

---

### `TripRouteLanding` — `/camping-trip/:slug`
Same "Coming Soon" placeholder. No routes of this pattern are linked from any visible navigation or content. The Route Finder links to `/campground/:slug` (individual detail), not `/camping-trip/:slug`, so this route has no real entry point currently.

**Why this is risky:** Low immediate risk since it is unlinked. However it occupies a URL namespace implying saved/shareable trip itineraries — functionality that does not exist.

**Recommended action:** Remove this route from the router entirely, or add `noindex`. Do not build features that generate links to it until the page is real.

---

### `CityLanding` — `/campgrounds-with-cell-service/:slug`
Has a real structure (breadcrumb, H1, campground list) and pulls real campground data filtered by city. However:

- **No signal data shown.** Cards display campground name, type, and amenity icons. The URL says "with-cell-service" but signal scores and carrier likelihood are entirely absent.
- **No SEO intro copy.** There is no descriptive paragraph, no context about signal scoring, and no keyword targeting below the H1.
- **No meta description.**
- **Thin at small counts.** Some cities will have 1–2 campgrounds. A city page with one listing and no explanatory copy is the weakest possible SEO page type.

**Recommended action:** Add signal scores and carrier likelihood to campground cards (the data source in this component already has those fields — display only). Add a short intro paragraph using the city/state name. Add a meta description. Consider a minimum campground threshold — cities with fewer than 3 campgrounds should either redirect to the state page or be excluded from sitemap indexing.

---

## Summary Table

| Page | Route | Category | Primary Issue |
|---|---|---|---|
| StateLanding | `/campgrounds/:state` | Strong | — |
| TopCampgrounds | `/top-campgrounds` | Strong | Carrier cards link wrong destinations |
| CarrierLanding | `/campgrounds-with-{carrier}-signal/:state` | Strong | — |
| CampgroundLanding | `/campground/:slug` | Strong | Google Maps API domain allowlist (deploy config) |
| UpperPeninsulaSignal | `/best-cell-signal-campgrounds-upper-peninsula` | Strong | — |
| VerizonMichigan | `/best-verizon-signal-campgrounds-michigan` | Strong | — |
| BestRemoteWork | `/best-remote-work-campgrounds` | Strong | Missing meta description |
| RouteFinder | `/route-finder` | Acceptable | No signal data in results; no SEO copy |
| ListsDirectory | `/lists` | Acceptable | No meta tags; no intro copy |
| ShareableList | `/list/:slug` | Acceptable | No signal data in campground cards |
| RemoteWorkLanding | `/remote-work-camping/:state` | **Thin — fix or redirect** | "Coming Soon" placeholder; actively linked from state pages |
| AmenityLanding | `/{amenity}-campgrounds-with-cell-service/:state` | **Thin — noindex or implement** | 24 "Coming Soon" URLs; data already exists to build them |
| TripRouteLanding | `/camping-trip/:slug` | **Thin — remove or hide** | Unlinked "Coming Soon"; no entry point exists |
| CityLanding | `/campgrounds-with-cell-service/:slug` | **Thin — needs work** | No signal data; no SEO copy; thin at low campground counts |
