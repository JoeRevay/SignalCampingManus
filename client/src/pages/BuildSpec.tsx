/**
 * BuildSpec — SignalCamping v1 Implementation Blueprint
 *
 * Design: Technical documentation page with structured sections,
 * code blocks, tables, and visual hierarchy.
 */
import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Signal, ArrowLeft, Database, Globe, Map as MapIcon, Search,
  Server, Layers, Code, FileText, Folder, ChevronDown, ChevronRight,
  Zap, DollarSign, Clock, BarChart3, Layout, Smartphone, Link as LinkIcon
} from "lucide-react";

/* ── Section navigation ── */
const SECTIONS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "tech-stack", label: "Tech Stack", icon: Layers },
  { id: "database", label: "Database", icon: Database },
  { id: "pages", label: "Page Specs", icon: Layout },
  { id: "api", label: "API Endpoints", icon: Server },
  { id: "map-ux", label: "Map UX", icon: MapIcon },
  { id: "filters", label: "Filters", icon: Search },
  { id: "project-structure", label: "Project Structure", icon: Folder },
  { id: "hosting", label: "Hosting", icon: Globe },
  { id: "seo", label: "SEO Strategy", icon: BarChart3 },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "scaling", label: "Scaling Plan", icon: Zap },
];

/* ── Code block component ── */
function CodeBlock({ code, language = "sql" }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 my-4">
      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 font-mono flex items-center justify-between">
        <span>{language}</span>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ── Data table component ── */
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-600 border-t border-gray-100">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Collapsible section ── */
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden my-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left font-medium text-gray-700"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {title}
      </button>
      {open && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
}

export default function BuildSpec() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-sm">
                  <Signal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h1>
                  <p className="text-xs text-muted-foreground">Great Lakes Campground Signal Discovery</p>
                </div>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/top-campgrounds">
                <button className="text-xs text-green-700 hover:text-green-800 px-3 py-1.5 rounded-md hover:bg-green-50 transition hidden sm:inline-flex">
                  Top 100
                </button>
              </Link>
              <Link href="/">
                <button className="text-xs text-green-700 hover:text-green-800 px-3 py-1.5 rounded-md hover:bg-green-50 transition hidden sm:inline-flex">
                  Discovery Map
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Back link */}
        <Link href="/">
          <span className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 mb-6 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Discovery Map
          </span>
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">v1 Build Spec</Badge>
            <Badge variant="outline" className="text-gray-500">Michigan + Ohio MVP</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Implementation Blueprint
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Complete technical specification for building SignalCamping v1 — a map-driven campground discovery platform
            with cellular signal data for 150 campgrounds across Michigan and Ohio.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar navigation */}
          <nav className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
            <div className="space-y-0.5">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSection(s.id);
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                      activeSection === s.id
                        ? "bg-green-50 text-green-800 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">

            {/* ── 1. Overview ── */}
            <section id="overview" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Product Overview</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                SignalCamping v1 is a mobile-friendly web application that helps campers find campgrounds in Michigan and Ohio
                where their phone works. The MVP launches with 150 ranked campgrounds, an interactive map with signal-strength
                markers, carrier-specific filters, and SEO-optimized landing pages designed to capture long-tail organic search traffic.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Campgrounds", value: "150", sub: "MI + OH" },
                  { label: "Michigan", value: "81", sub: "39 cities" },
                  { label: "Ohio", value: "69", sub: "32 cities" },
                  { label: "SEO Pages", value: "153", sub: "indexable" },
                ].map((s) => (
                  <Card key={s.label} className="border-gray-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{s.value}</div>
                      <div className="text-sm font-medium text-gray-700">{s.label}</div>
                      <div className="text-xs text-gray-400">{s.sub}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <p className="text-sm text-green-800">
                    <strong>Target Keywords:</strong> "campgrounds with cell service in Michigan," "does Ludington State Park have Verizon coverage,"
                    "Ohio campgrounds with signal," "best campgrounds with phone service near Traverse City"
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ── 2. Tech Stack ── */}
            <section id="tech-stack" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Recommended Tech Stack</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Optimized for a solo founder who needs to ship fast, iterate cheaply, and scale later without a rewrite.
                Every choice prioritizes developer velocity, low operational cost, and strong SEO out of the box.
              </p>

              <DataTable
                headers={["Layer", "Technology", "Rationale"]}
                rows={[
                  ["Framework", "Next.js 14 (App Router)", "SSR for SEO, API routes built-in, file-based routing matches programmatic SEO structure"],
                  ["Language", "TypeScript", "Type safety across frontend and API, catches data shape errors at build time"],
                  ["Styling", "Tailwind CSS 4", "Utility-first, no context switching, responsive design built into class names"],
                  ["UI Components", "shadcn/ui", "Copy-paste components, no dependency lock-in, Radix primitives for accessibility"],
                  ["Map Library", "Mapbox GL JS", "Free 50K loads/month, built-in clustering, vector tiles, better free tier than Google Maps"],
                  ["Database", "Supabase (PostgreSQL)", "Managed Postgres with PostGIS, built-in auth, REST API, 500MB free tier"],
                  ["ORM", "Drizzle ORM", "Lightweight, type-safe SQL, excellent Postgres/PostGIS support"],
                  ["Hosting", "Vercel", "Zero-config Next.js deployment, edge functions, free tier covers MVP traffic"],
                  ["Analytics", "Plausible / Umami", "Privacy-friendly, lightweight, no cookie banners needed"],
                  ["Search", "PostgreSQL full-text", "No external service needed at MVP scale; upgrade to Algolia at 10K+ campgrounds"],
                ]}
              />

              <CollapsibleSection title="Why Not Alternatives?">
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>Google Maps vs. Mapbox:</strong> Google Maps charges $7 per 1,000 loads after the $200 monthly credit. Mapbox provides 50,000 free map loads and supports custom marker styling, clustering, and vector tiles natively.</p>
                  <p><strong>MongoDB vs. PostgreSQL:</strong> The campground data is highly relational (campgrounds → amenities → coverage → reviews). PostgreSQL with PostGIS handles both relational queries and geospatial lookups in a single engine.</p>
                  <p><strong>Remix vs. Next.js:</strong> Next.js has a larger ecosystem, more hosting options, and better static generation for programmatic SEO pages.</p>
                </div>
              </CollapsibleSection>
            </section>

            {/* ── 3. Database ── */}
            <section id="database" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Database Schema</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                PostgreSQL with PostGIS extension for geospatial queries. The schema supports the full MVP dataset
                plus future expansion for reviews and crowdsourced signal reports.
              </p>

              <CollapsibleSection title="States Table" defaultOpen>
                <CodeBlock language="sql" code={`CREATE TABLE states (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    abbreviation    CHAR(2) NOT NULL UNIQUE,
    slug            VARCHAR(50) NOT NULL UNIQUE,
    meta_title      VARCHAR(120),
    meta_description VARCHAR(300),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);`} />
              </CollapsibleSection>

              <CollapsibleSection title="Campgrounds Table" defaultOpen>
                <CodeBlock language="sql" code={`CREATE TABLE campgrounds (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL UNIQUE,
    city                VARCHAR(100) NOT NULL,
    state_id            INTEGER NOT NULL REFERENCES states(id),
    latitude            DECIMAL(10,6) NOT NULL,
    longitude           DECIMAL(10,6) NOT NULL,
    location            GEOGRAPHY(POINT, 4326),
    campground_type     VARCHAR(30) NOT NULL,
    
    -- Amenities
    tent_sites          BOOLEAN DEFAULT FALSE,
    rv_sites            BOOLEAN DEFAULT FALSE,
    electric_hookups    BOOLEAN DEFAULT FALSE,
    waterfront          BOOLEAN DEFAULT FALSE,
    
    -- Cellular coverage
    verizon_signal      VARCHAR(15) NOT NULL,
    att_signal          VARCHAR(15) NOT NULL,
    tmobile_signal      VARCHAR(15) NOT NULL,
    signal_confidence   SMALLINT NOT NULL CHECK (signal_confidence BETWEEN 1 AND 5),
    best_carrier        VARCHAR(20),
    avg_signal_numeric  DECIMAL(3,2),
    
    -- Geography
    nearest_lake        VARCHAR(100),
    distance_to_lake    DECIMAL(6,1),
    nearest_town        VARCHAR(100),
    distance_to_town    DECIMAL(6,1),
    elevation_ft        INTEGER,
    forest_cover_pct    SMALLINT,
    
    -- Links & metadata
    reservation_link    TEXT,
    website             TEXT,
    mvp_rank            SMALLINT,
    mvp_score           DECIMAL(6,2),
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);`} />
              </CollapsibleSection>

              <CollapsibleSection title="Indexes (Performance Critical)">
                <CodeBlock language="sql" code={`CREATE INDEX idx_campgrounds_state ON campgrounds(state_id);
CREATE INDEX idx_campgrounds_slug ON campgrounds(slug);
CREATE INDEX idx_campgrounds_verizon ON campgrounds(verizon_signal);
CREATE INDEX idx_campgrounds_att ON campgrounds(att_signal);
CREATE INDEX idx_campgrounds_tmobile ON campgrounds(tmobile_signal);
CREATE INDEX idx_campgrounds_waterfront ON campgrounds(waterfront);
CREATE INDEX idx_campgrounds_tent ON campgrounds(tent_sites);
CREATE INDEX idx_campgrounds_location ON campgrounds USING GIST(location);
CREATE INDEX idx_campgrounds_mvp_rank ON campgrounds(mvp_rank);`} />
              </CollapsibleSection>

              <CollapsibleSection title="Reviews Table (Future)">
                <CodeBlock language="sql" code={`CREATE TABLE reviews (
    id              SERIAL PRIMARY KEY,
    campground_id   INTEGER NOT NULL REFERENCES campgrounds(id),
    user_name       VARCHAR(100),
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    signal_rating   SMALLINT CHECK (signal_rating BETWEEN 1 AND 5),
    carrier_used    VARCHAR(20),
    comment         TEXT,
    visit_date      DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);`} />
              </CollapsibleSection>

              <CollapsibleSection title="PostGIS Nearby Query">
                <CodeBlock language="sql" code={`-- Find campgrounds within 50 miles of a target
SELECT c.*, 
  ST_Distance(c.location, target.location) / 1609.34 AS distance_miles
FROM campgrounds c, 
  (SELECT location FROM campgrounds WHERE slug = $1) AS target
WHERE c.slug != $1
  AND ST_DWithin(c.location, target.location, 80467)
ORDER BY ST_Distance(c.location, target.location)
LIMIT 6;`} />
              </CollapsibleSection>
            </section>

            {/* ── 4. Page Specs ── */}
            <section id="pages" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Page Specifications</h2>

              {/* Homepage */}
              <Card className="mb-6 border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Homepage</Badge>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">/</code>
                  </div>
                  <CardTitle className="text-lg">Homepage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p><strong>Purpose:</strong> Primary entry point. Communicates the value proposition, provides search, shows the interactive map, and links to state pages and top campgrounds.</p>
                  <p><strong>SEO Title:</strong> <code className="bg-gray-100 px-1 rounded">Campgrounds with Cell Service | SignalCamping</code></p>
                  <p><strong>Meta Description:</strong> Find 150 campgrounds in Michigan and Ohio with reliable cell service. Check Verizon, AT&T, and T-Mobile coverage before you camp.</p>
                  <p><strong>Layout:</strong> Hero section with search bar → Interactive map (60vh) → Filter bar → Featured campgrounds (top 10 horizontal scroll) → State sections (MI + OH cards) → Footer</p>
                  <p><strong>Internal Links:</strong> Both state pages, all featured campground detail pages, filter results page. Map marker popups link to individual campground pages.</p>
                </CardContent>
              </Card>

              {/* State Pages */}
              <Card className="mb-6 border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">State Page</Badge>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">/campgrounds-with-cell-service/{"michigan"}</code>
                  </div>
                  <CardTitle className="text-lg">State Landing Pages (2 pages)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p><strong>Purpose:</strong> State-level landing page targeting searches like "Michigan campgrounds with cell service." Lists all campgrounds in that state, sorted by MVP rank.</p>
                  <p><strong>SEO Title:</strong> <code className="bg-gray-100 px-1 rounded">{"Michigan"} Campgrounds with Cell Service (81 Campgrounds) | SignalCamping</code></p>
                  <p><strong>Meta Description:</strong> Browse 81 campgrounds in Michigan with verified cell service data. Check Verizon, AT&T, and T-Mobile signal strength at Traverse City State Park, Ludington State Park, and more.</p>
                  <p><strong>Layout:</strong> Breadcrumbs → State hero with stats → Filter sidebar + State map + Campground list (25/page) → State statistics charts → Cross-link to other state → Footer</p>
                  <p><strong>Internal Links:</strong> Each campground row links to detail page. Cross-link to the other state. Breadcrumbs to homepage.</p>
                  <p><strong>Required Data:</strong> All campgrounds in state, state-level aggregates (avg signal, waterfront count, type breakdown), carrier coverage distribution, unique cities.</p>
                </CardContent>
              </Card>

              {/* Campground Pages */}
              <Card className="mb-6 border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Campground Page</Badge>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">/campground/{"ludington-state-park"}</code>
                  </div>
                  <CardTitle className="text-lg">Individual Campground Pages (150 pages)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p><strong>Purpose:</strong> Most important page type for SEO. Targets long-tail queries like "Ludington State Park cell service" and "does Hocking Hills have Verizon."</p>
                  <p><strong>SEO Title:</strong> <code className="bg-gray-100 px-1 rounded">{"Ludington State Park"} Cell Service & Camping | SignalCamping</code></p>
                  <p><strong>Meta Description:</strong> Ludington State Park in Ludington, Michigan — Verizon has the strongest signal (Strong). Tent sites, RV sites, electric hookups, waterfront access. Signal confidence: 4/5.</p>
                  <p><strong>Layout:</strong> Breadcrumbs → Hero (name, location, signal badge, CTAs) → Cell service section (3 carrier bars + summary) + Quick Facts sidebar → Amenity grid → "About" rich text → Mini map → Nearby campgrounds (6) → More in state (6) → Structured JSON-LD → Footer</p>
                  <p><strong>Internal Links:</strong> Breadcrumbs to homepage and state page. "Nearby Campgrounds" creates mesh of internal links. "More in State" links to same-state campgrounds. Mini map markers link to other pages.</p>
                  <p><strong>Required Data:</strong> All 29 fields from MVP dataset. Nearby campgrounds computed via PostGIS (within 50 miles). Same-state campgrounds excluding nearby ones.</p>
                </CardContent>
              </Card>

              {/* Search Page */}
              <Card className="mb-6 border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">Search Page</Badge>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">/search?state=MI&verizon=Strong</code>
                  </div>
                  <CardTitle className="text-lg">Search / Filter Results Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p><strong>Purpose:</strong> Dynamic results page driven by filter parameters. Not indexed by search engines (noindex meta tag).</p>
                  <p><strong>Layout:</strong> Same as state page (sidebar filters + map + list), but with no state restriction by default. URL query parameters drive filter state for shareable filtered views.</p>
                  <p><strong>Internal Links:</strong> Each result links to campground detail page. Filter state is encoded in URL for sharing.</p>
                </CardContent>
              </Card>
            </section>

            {/* ── 5. API Endpoints ── */}
            <section id="api" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>API Endpoints</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All API routes live under <code className="bg-gray-100 px-1 rounded">/api/v1/</code>. Next.js App Router handles these as Route Handlers.
              </p>

              <DataTable
                headers={["Method", "Endpoint", "Purpose", "Response Format"]}
                rows={[
                  ["GET", "/api/v1/campgrounds", "Paginated, filtered campground list", "JSON (data + pagination)"],
                  ["GET", "/api/v1/campgrounds/markers", "Lightweight GeoJSON for map markers", "GeoJSON FeatureCollection"],
                  ["GET", "/api/v1/campgrounds/:slug", "Full campground + nearby campgrounds", "JSON (campground + nearby[])"],
                  ["GET", "/api/v1/states/:abbrev/stats", "State-level aggregated statistics", "JSON (counts + breakdowns)"],
                  ["GET", "/api/v1/search/suggest?q=", "Search autocomplete suggestions", "JSON (suggestions[])"],
                ]}
              />

              <CollapsibleSection title="Filter Query Parameters (GET /api/v1/campgrounds)" defaultOpen>
                <DataTable
                  headers={["Parameter", "Type", "Example", "DB Column"]}
                  rows={[
                    ["state", "string", "MI or MI,OH", "state_id (via states table)"],
                    ["verizon", "string", "Strong,Moderate", "verizon_signal"],
                    ["att", "string", "Strong", "att_signal"],
                    ["tmobile", "string", "Strong,Moderate", "tmobile_signal"],
                    ["min_signal", "integer", "3", "signal_confidence"],
                    ["waterfront", "boolean", "true", "waterfront"],
                    ["tent", "boolean", "true", "tent_sites"],
                    ["rv", "boolean", "true", "rv_sites"],
                    ["electric", "boolean", "true", "electric_hookups"],
                    ["type", "string", "State Park", "campground_type"],
                    ["max_lake_dist", "number", "10", "distance_to_lake"],
                    ["max_town_dist", "number", "20", "distance_to_town"],
                    ["q", "string", "ludington", "Full-text on name, city, lake"],
                    ["sort", "string", "mvp_rank", "mvp_rank | signal | name"],
                    ["page", "integer", "1", "OFFSET calculation"],
                    ["limit", "integer", "25", "LIMIT (max 100)"],
                  ]}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Map Markers Response Example">
                <CodeBlock language="json" code={`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-86.5209, 43.9553]
      },
      "properties": {
        "id": 1,
        "name": "Ludington State Park",
        "slug": "ludington-state-park",
        "city": "Ludington",
        "state": "MI",
        "signal_confidence": 4,
        "best_carrier": "Verizon",
        "marker_color": "#22c55e"
      }
    }
  ]
}`} />
              </CollapsibleSection>
            </section>

            {/* ── 6. Map UX ── */}
            <section id="map-ux" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Map UX Specification</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-gray-200">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Marker Colors</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { color: "#22c55e", label: "Strong Signal", bg: "bg-green-500" },
                      { color: "#eab308", label: "Moderate Signal", bg: "bg-yellow-500" },
                      { color: "#ef4444", label: "Weak Signal", bg: "bg-red-500" },
                      { color: "#1f2937", label: "No Signal", bg: "bg-gray-800" },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded-full ${m.bg}`} />
                        <span className="text-gray-600">{m.label}</span>
                        <code className="text-xs text-gray-400 ml-auto">{m.color}</code>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Map Configuration</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm text-gray-600">
                    <p><strong>Style:</strong> mapbox://styles/mapbox/outdoors-v12</p>
                    <p><strong>Center:</strong> [-84.5, 42.5] (MI+OH center)</p>
                    <p><strong>Zoom:</strong> 6 (default), 5-16 (range)</p>
                    <p><strong>Cluster radius:</strong> 50px</p>
                    <p><strong>Cluster max zoom:</strong> 12</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-gray-200 mb-4">
                <CardHeader className="pb-2"><CardTitle className="text-base">Interaction Behavior</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <p><strong>Zoomed out (zoom &lt; 10):</strong> Markers cluster into circles showing count. Cluster color reflects dominant signal strength. Click cluster to zoom in.</p>
                  <p><strong>Zoomed in (zoom &ge; 10):</strong> Individual markers as 12px colored circles with white border. Hover shows tooltip with name and best carrier.</p>
                  <p><strong>Marker click:</strong> Opens popup card with name, city, signal score, best carrier, amenity icons, and "View Details" link to campground page.</p>
                  <p><strong>Filter interaction:</strong> When filters change, map re-fetches markers and animates to fit new bounds. Loading indicator during fetch. Empty state message if no results.</p>
                </CardContent>
              </Card>
            </section>

            {/* ── 7. Filters ── */}
            <section id="filters" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Filter System</h2>

              <DataTable
                headers={["Filter", "UI Type", "Options", "DB Column"]}
                rows={[
                  ["State", "Multi-select chips", "Michigan, Ohio", "state_id"],
                  ["Verizon Signal", "Multi-select", "Strong, Moderate, Weak, No Signal", "verizon_signal"],
                  ["AT&T Signal", "Multi-select", "Strong, Moderate, Weak, No Signal", "att_signal"],
                  ["T-Mobile Signal", "Multi-select", "Strong, Moderate, Weak, No Signal", "tmobile_signal"],
                  ["Min Signal Score", "Slider (1-5)", "1, 2, 3, 4, 5", "signal_confidence"],
                  ["Waterfront", "Toggle", "Yes / No", "waterfront"],
                  ["Tent Sites", "Toggle", "Yes / No", "tent_sites"],
                  ["RV Sites", "Toggle", "Yes / No", "rv_sites"],
                  ["Electric Hookups", "Toggle", "Yes / No", "electric_hookups"],
                  ["Campground Type", "Multi-select", "State Park, National Forest, Private", "campground_type"],
                  ["Max Lake Distance", "Slider (0-50 mi)", "Continuous", "distance_to_lake"],
                  ["Max Town Distance", "Slider (0-50 mi)", "Continuous", "distance_to_town"],
                  ["Search Text", "Text input", "Free text", "Full-text search"],
                ]}
              />

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Mobile UX:</strong> On mobile, the filter sidebar collapses into a "Filters" button that opens a bottom sheet (using Vaul drawer).
                Active filter count is shown as a badge on the button. Filters are applied on "Apply" button click, not on change.
              </div>
            </section>

            {/* ── 8. Project Structure ── */}
            <section id="project-structure" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Project Structure</h2>

              <CodeBlock language="text" code={`signalcamping/
├── app/
│   ├── layout.tsx                    # Root layout (header, footer, fonts)
│   ├── page.tsx                      # Homepage
│   ├── campground/
│   │   └── [slug]/page.tsx           # Individual campground (SSG)
│   ├── campgrounds-with-cell-service/
│   │   └── [state]/page.tsx          # State landing page (SSG)
│   ├── search/page.tsx               # Filter results (CSR)
│   ├── api/v1/
│   │   ├── campgrounds/route.ts      # GET campgrounds (filtered)
│   │   ├── campgrounds/markers/route.ts  # GET GeoJSON markers
│   │   ├── campgrounds/[slug]/route.ts   # GET single campground
│   │   ├── states/[abbrev]/stats/route.ts # GET state stats
│   │   └── search/suggest/route.ts   # GET autocomplete
│   ├── sitemap.ts                    # Dynamic sitemap
│   └── robots.ts                     # Robots.txt
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── CampgroundMap.tsx             # Mapbox map
│   ├── FilterPanel.tsx               # Filter sidebar
│   ├── CampgroundCard.tsx            # List card
│   ├── SignalBadge.tsx               # Signal badge
│   ├── CarrierBar.tsx                # Carrier progress bar
│   ├── Breadcrumbs.tsx               # Breadcrumbs
│   └── SearchBar.tsx                 # Search autocomplete
├── lib/
│   ├── db.ts                         # Drizzle connection
│   ├── schema.ts                     # Drizzle schema
│   ├── map-config.ts                 # Mapbox config
│   └── seo.ts                        # SEO helpers
├── data/
│   ├── signal_camping_top150_mvp.csv # MVP dataset
│   └── signal_camping_mi_oh.csv      # Full MI+OH dataset
├── scripts/
│   └── seed.mts                      # Database seed
├── drizzle/migrations/               # DB migrations
├── .env.local                        # Environment variables
├── next.config.ts
├── tailwind.config.ts
└── package.json`} />
            </section>

            {/* ── 9. Hosting ── */}
            <section id="hosting" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Hosting & Cost</h2>

              <DataTable
                headers={["Service", "Provider", "Tier", "Monthly Cost"]}
                rows={[
                  ["Application", "Vercel", "Hobby (free)", "$0"],
                  ["Database", "Supabase", "Free (500MB)", "$0"],
                  ["Map Tiles", "Mapbox", "Free (50K loads)", "$0"],
                  ["Domain", "Cloudflare Registrar", "signalcamping.com", "~$1/mo"],
                  ["Analytics", "Plausible Cloud", "Free / $9/mo", "$0–9"],
                  ["Error Tracking", "Sentry", "Free (5K events)", "$0"],
                ]}
              />

              <Card className="border-green-200 bg-green-50/50 mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-700" />
                    <span className="font-semibold text-green-800">Estimated Launch Cost: $0–$10/month</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Free tiers of Vercel, Supabase, and Mapbox comfortably handle MVP traffic.
                    The first cost trigger will be Mapbox at 50K+ map loads/month, which indicates meaningful traction.
                  </p>
                </CardContent>
              </Card>

              <h3 className="text-lg font-semibold mt-6 mb-3">Scaling Triggers</h3>
              <DataTable
                headers={["Metric", "Threshold", "Action", "New Cost"]}
                rows={[
                  ["Map loads", "50K/month", "Upgrade Mapbox to Pay-as-you-go", "$5/1K loads"],
                  ["Database", "500MB", "Upgrade Supabase to Pro", "$25/month"],
                  ["API requests", "100K/month", "Upgrade Vercel to Pro", "$20/month"],
                  ["Campgrounds", "1,000+", "Add Redis caching layer", "$10/month"],
                  ["Campgrounds", "13,000+", "Dedicated PostgreSQL + Elasticsearch", "$50+/month"],
                ]}
              />
            </section>

            {/* ── 10. SEO Strategy ── */}
            <section id="seo" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SEO Strategy</h2>

              <h3 className="text-lg font-semibold mb-3">URL Structure</h3>
              <DataTable
                headers={["Page Type", "URL Pattern", "Example", "Count"]}
                rows={[
                  ["Homepage", "/", "signalcamping.com", "1"],
                  ["State", "/campgrounds-with-cell-service/{state}", "/campgrounds-with-cell-service/michigan", "2"],
                  ["Campground", "/campground/{slug}", "/campground/ludington-state-park", "150"],
                  ["Search", "/search?filters...", "/search?state=MI&waterfront=true", "noindex"],
                ]}
              />

              <h3 className="text-lg font-semibold mt-6 mb-3">SEO Title & Meta Patterns</h3>
              <DataTable
                headers={["Page", "Title Pattern", "Meta Description Pattern"]}
                rows={[
                  ["Homepage", "Campgrounds with Cell Service | SignalCamping", "Find {count} campgrounds in Michigan and Ohio with reliable cell service..."],
                  ["State", "{State} Campgrounds with Cell Service ({count}) | SignalCamping", "Browse {count} campgrounds in {State} with verified cell service data..."],
                  ["Campground", "{Name} Cell Service & Camping | SignalCamping", "{Name} in {City}, {State} — {carrier} has the strongest signal ({level})..."],
                ]}
              />

              <h3 className="text-lg font-semibold mt-6 mb-3">Structured Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Every campground page includes JSON-LD structured data using the Schema.org Campground type,
                including name, address, geo coordinates, amenity features, and URL. This enables rich snippets in search results.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-3">Internal Linking Mesh</h3>
              <p className="text-sm text-gray-600 mb-3">
                Each campground page links to 6 nearby campgrounds (PostGIS distance query) and 6 same-state campgrounds,
                creating a dense internal linking mesh. State pages link to all campgrounds within them. The homepage links to
                both state pages and the top 10 featured campgrounds. This structure ensures every page is reachable within
                3 clicks from the homepage.
              </p>
            </section>

            {/* ── 11. Timeline ── */}
            <section id="timeline" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Implementation Timeline</h2>
              <p className="text-gray-600 mb-4">Assumes a solo developer working 20–30 hours per week.</p>

              <DataTable
                headers={["Week", "Milestone", "Deliverables"]}
                rows={[
                  ["1", "Project Setup + Database", "Next.js scaffold, Supabase setup, schema migration, seed 150 campgrounds, basic layout"],
                  ["2", "Campground Pages", "Individual campground page template, SSG for all 150, structured data, meta tags"],
                  ["3", "State Pages + Homepage", "State landing pages, homepage with featured campgrounds, search bar, navigation"],
                  ["4", "Map Integration", "Mapbox setup, clustered markers, popups, map+filter interaction"],
                  ["5", "Filter System + API", "All API endpoints, filter panel, URL-based filter state, pagination"],
                  ["6", "Mobile + Polish", "Responsive design pass, bottom sheet filters, performance optimization, sitemap"],
                  ["7", "Launch Prep", "Domain setup, analytics, error tracking, SEO audit, Google Search Console submission"],
                ]}
              />

              <Card className="border-blue-200 bg-blue-50/50 mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-700" />
                    <span className="font-semibold text-blue-800">Total: 6–7 weeks to launch</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    The dataset and architecture are already complete. The implementation work is primarily frontend development
                    and API wiring, with the database schema and seed data ready to deploy.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ── 12. Scaling ── */}
            <section id="scaling" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Scaling to All U.S. Campgrounds</h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                The architecture is designed to scale from 150 to 13,000+ campgrounds without a rewrite.
              </p>

              <DataTable
                headers={["Phase", "Campgrounds", "States", "Key Actions"]}
                rows={[
                  ["MVP (current)", "150", "2 (MI, OH)", "Launch with curated dataset, validate SEO strategy"],
                  ["Phase 2", "1,000", "5 (Great Lakes)", "Add WI, PA, WV; integrate RIDB API for federal campgrounds"],
                  ["Phase 3", "5,000", "25 (Eastern US)", "Add state park APIs, FCC Broadband Map for signal data"],
                  ["Phase 4", "13,000+", "50 (National)", "Full RIDB integration, crowdsourced signal reports, Elasticsearch"],
                ]}
              />

              <h3 className="text-lg font-semibold mt-6 mb-3">URL Structure at Scale</h3>
              <DataTable
                headers={["Level", "Pattern", "Example", "Estimated Count"]}
                rows={[
                  ["State", "/campgrounds-with-cell-service/{state}", "/campgrounds-with-cell-service/california", "50"],
                  ["Region", "/campgrounds-with-cell-service/{region}", "/campgrounds-with-cell-service/northern-michigan", "~200"],
                  ["City", "/campgrounds-with-cell-service/{city}-{state}", "/campgrounds-with-cell-service/traverse-city-mi", "~500"],
                  ["Campground", "/campground/{slug}", "/campground/yosemite-upper-pines", "~13,000"],
                ]}
              />

              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                <strong>Data Sources for National Scale:</strong> Recreation.gov RIDB API (~3,500 federal campgrounds), state park system APIs and directories (~9,500 state/private campgrounds), FCC Broadband Map API for carrier coverage data, crowdsourced signal reports from users.
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 py-10 mt-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <Signal className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SignalCamping</h3>
              </div>
              <p className="text-sm leading-relaxed">v1 Build Spec — Implementation blueprint for a map-driven campground discovery platform.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Browse by State</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/campgrounds/mi" className="hover:text-green-400 transition">Michigan Campgrounds</Link></li>
                <li><Link href="/campgrounds/oh" className="hover:text-green-400 transition">Ohio Campgrounds</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Resources</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link href="/top-campgrounds" className="hover:text-green-400 transition">Top 100 Campgrounds</Link></li>
                <li><Link href="/" className="hover:text-green-400 transition">Discovery Map</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
            &copy; 2026 SignalCamping &mdash; Campground discovery with cellular signal data.
          </div>
        </div>
      </footer>
    </div>
  );
}
