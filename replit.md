# SignalCamping

A research initiative and interactive dashboard to help outdoor enthusiasts find campgrounds with reliable cellular coverage in the Great Lakes region (MI, OH, PA, WV, WI).

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui components
- **Backend**: Node.js, Express, tRPC (type-safe API)
- **Database**: PostgreSQL (Replit built-in) via Drizzle ORM + `postgres` driver
- **Build**: Vite (frontend), esbuild (server bundling)
- **Package Manager**: pnpm
- **Runtime**: tsx (dev), Node.js (prod)

## Architecture

This is a full-stack monorepo where Express serves both the API and the Vite dev server in development mode:

- `client/` — React frontend
- `server/` — Express + tRPC backend
- `shared/` — Shared TypeScript types
- `drizzle/` — Database schema and migrations
- `datasets/` — Raw and processed campground data (CSV, JSON, GeoJSON)

## Development

```bash
pnpm install
pnpm run dev
```

Server runs on port 5000 (Express + Vite middleware mode).

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (provisioned by Replit)
- `OAUTH_SERVER_URL` — OAuth provider URL (optional)
- `VITE_APP_ID` — App ID for OAuth (optional)
- `VITE_OAUTH_PORTAL_URL` — OAuth portal URL (optional)
- `VITE_ANALYTICS_ENDPOINT` — Analytics endpoint (optional)
- `VITE_ANALYTICS_WEBSITE_ID` — Analytics website ID (optional)

## Deployment

- Build: `pnpm run build`
- Run: `node dist/index.js`
- Target: autoscale
