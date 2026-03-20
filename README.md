# SignalCamping

A full-stack web app that helps outdoor enthusiasts find campgrounds with reliable cellular coverage across the Great Lakes region.

---

## What It Does

SignalCamping lets campers search and browse campgrounds in Michigan, Ohio, Pennsylvania, and Wisconsin filtered by cell signal quality. Every campground has a modeled signal score (0–100) derived from real tower proximity data for Verizon, AT&T, and T-Mobile. Users can filter by carrier, amenity type, state, and remote-work suitability, then share lists or plan multi-stop routes.

---

## Page Types

| Route pattern | Page | Purpose |
|---|---|---|
| `/` | Home | Landing page with featured content and entry points |
| `/top-campgrounds` | Top Campgrounds | Ranked directory across all states |
| `/campgrounds/:state` | State Landing | Per-state directory with SEO intro, stats grid, ranked list, full searchable directory |
| `/campground/:slug` | Campground Detail | Signal scores, carrier likelihood, amenities, map, signal report submission |
| `/campgrounds-with-{carrier}-signal/:state` | Carrier Landing | Carrier-specific ranked campground list per state (Verizon / AT&T / T-Mobile) |
| `/campgrounds-with-cell-service/:slug` | City Landing | City-level campground directory |
| `/remote-work-camping/:state` | Remote Work Landing | Campgrounds ranked by remote work score per state |
| `/best-remote-work-campgrounds` | Best Remote Work | Cross-state remote work rankings |
| `/{amenity}-campgrounds-with-cell-service/:state` | Amenity Landing | Filtered by amenity type (waterfront, tent, RV, electric, lakefront, forest) |
| `/camping-trip/:slug` | Trip Route | Multi-stop camping route with signal info at each stop |
| `/route-finder` | Route Finder | Interactive tool for building multi-stop camping routes |
| `/lists` / `/list/:slug` | Lists | User-created shareable campground lists |
| `/best-cell-signal-campgrounds-upper-peninsula` | UP Signal | Michigan Upper Peninsula campgrounds ranked by signal |
| `/best-verizon-signal-campgrounds-michigan` | Verizon Michigan | Michigan campgrounds ranked by Verizon signal |

---

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite 7** — build tooling and dev server
- **Wouter** — client-side routing
- **Tailwind CSS v4** with `@tailwindcss/typography`
- **shadcn/ui** (Radix UI primitives) — component library
- **TanStack Query v5** — server state management
- **tRPC v11** — end-to-end type-safe API client
- **Recharts** — signal distribution charts
- **Framer Motion** — page transitions and animations
- **Lucide React** — icons
- **Google Maps API** — campground map display and marker clustering

### Backend
- **Node.js** with **Express 4**
- **tRPC v11** — typed API router
- **Drizzle ORM** — database access layer
- **`jose`** — JWT session handling for optional OAuth authentication

### Database
- **PostgreSQL** (Replit managed) — stores signal reports, user sessions, shareable lists
- **Drizzle Kit** — schema migrations

### Package Manager
- **pnpm 10**

---

## Data

Campground data is bundled as static JSON in `client/src/data/`:

| File | Records | Used by |
|---|---|---|
| `campgrounds.json` | 2,464 | Full app dataset — map, search, state pages |
| `top100_seo.json` | 2,464 | State landing and campground detail pages |
| `mvp_campgrounds.json` | ~476 | Supplemental detail data for MVP campgrounds |

### Key fields per campground
- `campground_name`, `slug`, `city`, `state`, `lat`, `lng`
- `tent_sites`, `rv_sites`, `electric_hookups`, `waterfront`
- `verizon_coverage`, `att_coverage`, `tmobile_coverage` (boolean)
- `signal_score` (0–100), `signal_quality_score` (granular ranking metric)
- `remote_work_score` (combines signal, town proximity, highway access)
- `is_verified`

Signal scores are modeled from public cell tower infrastructure data using terrain-adjusted coverage radii (suburban 15 km / rural 12 km / backcountry 6 km), not carrier-reported maps.

---

## Dev Commands

```bash
# Install dependencies
pnpm install

# Start development server (frontend + backend with hot reload)
pnpm dev

# Type-check without emitting
pnpm check

# Format with Prettier
pnpm format

# Run tests (Vitest)
pnpm test

# Build for production
pnpm build

# Run production build
pnpm start

# Generate and apply database migrations
pnpm db:push
```

The dev server runs on the port Replit assigns. In development, the Vite proxy forwards `/api` and `/trpc` requests to the Express backend on the same process.

---

## Deployment (Replit)

This project is configured to run on Replit. The workflow command is:

```
pnpm run dev
```

For production deployment, Replit builds the project with `pnpm build` and serves `dist/index.js` via `pnpm start`. The frontend is served as static assets from the Express server; there is no separate CDN or static host.

Environment variables required:
- `DATABASE_URL` — PostgreSQL connection string (provided automatically by Replit)
- `GOOGLE_MAPS_API_KEY` — for campground map display (restrict to your Replit domain in Google Cloud Console)
- `OAUTH_SERVER_URL` *(optional)* — enables authenticated user accounts; app functions in anonymous mode without it

---

## Project Structure

```
├── client/
│   └── src/
│       ├── App.tsx                  # Router with all 19 routes + ScrollToTop
│       ├── pages/                   # One file per route (see Page Types above)
│       ├── components/              # Shared UI components (SiteHeader, cards, etc.)
│       ├── data/                    # Bundled campground JSON datasets
│       └── lib/                     # Utilities (rankingUtils, carrierLikelihood, etc.)
├── server/
│   ├── _core/                       # Express entry, tRPC router, Vite middleware
│   ├── db.ts                        # Drizzle schema and database client
│   ├── routers.ts                   # tRPC route definitions
│   └── storage.ts                   # Data access helpers
├── package.json
└── README.md
```

---

## Current Status

The app is live and fully functional for four states: **Michigan, Ohio, Pennsylvania, Wisconsin**.

**Working today:**
- State pages with rich SEO content, stats grids, carrier-specific counts, and searchable/paginated directories
- Campground detail pages with signal scores, carrier likelihood badges, amenity data, Google Maps embed, and anonymous signal report submission
- Carrier landing pages (Verizon / AT&T / T-Mobile × 4 states)
- Remote work rankings, amenity-filtered pages, city-level pages
- Route finder and shareable campground lists

**Not yet implemented:**
- User authentication (OAuth flow is wired but `OAUTH_SERVER_URL` is not configured)
- Additional states beyond MI / OH / PA / WI
- Real-time or crowdsourced signal score updates (current scores are static model outputs)
