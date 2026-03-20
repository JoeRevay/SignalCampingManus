"""Generate sitemap.xml for SignalCamping from cleaned dataset."""
import json
import re
from datetime import date
from collections import defaultdict

BASE_URL = "https://signalcamping.com"
TODAY = date.today().isoformat()
VALID_STATES = {"MI", "OH", "PA", "WI"}
STATE_SLUGS = {"MI": "mi", "OH": "oh", "PA": "pa", "WI": "wi"}

def normalize(s):
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")

# Load client campgrounds (already cleaned)
with open("client/src/data/campgrounds.json") as f:
    campgrounds = json.load(f)

# ── Campground pages: top 500 by signal_quality_score ──────────────────────
campgrounds_sorted = sorted(
    campgrounds,
    key=lambda c: (c.get("signal_quality_score") or 0),
    reverse=True,
)
top500 = campgrounds_sorted[:500]

# ── City pages: group by (state, city), apply index-worthiness threshold ────
# Threshold: 3+ campgrounds OR ≥1 strong-signal (score≥80) OR ≥1 remote-work-ready (score≥60)
city_data = defaultdict(lambda: {"count": 0, "strong_signal": 0, "remote_work_ready": 0})

for cg in campgrounds:
    state = (cg.get("state") or "").upper()
    city = cg.get("city") or ""
    if state not in VALID_STATES or not city:
        continue
    key = (state, normalize(city))
    city_data[key]["count"] += 1
    if (cg.get("signal_score") or 0) >= 80:
        city_data[key]["strong_signal"] += 1
    if (cg.get("remote_work_score") or 0) >= 60:
        city_data[key]["remote_work_ready"] += 1

qualifying_cities = []
for (state, city_slug), stats in city_data.items():
    is_worthy = (
        stats["count"] >= 3
        or stats["strong_signal"] >= 1
        or stats["remote_work_ready"] >= 1
    )
    if is_worthy:
        qualifying_cities.append((state, city_slug))

qualifying_cities.sort(key=lambda x: (x[0], x[1]))

# ── Carrier pages ────────────────────────────────────────────────────────────
carrier_pages = []
for state_slug in ["mi", "oh", "pa", "wi"]:
    for carrier in ["verizon", "att", "tmobile"]:
        carrier_pages.append(f"/campgrounds-with-{carrier}-signal/{state_slug}")

# ── Remote work pages ────────────────────────────────────────────────────────
remote_work_pages = [f"/remote-work-camping/{s}" for s in ["mi", "oh", "pa", "wi"]]

# ── Static pages ─────────────────────────────────────────────────────────────
static_pages = [
    ("/", "1.0", "weekly"),
    ("/top-campgrounds", "0.9", "weekly"),
    ("/campgrounds/mi", "0.8", "weekly"),
    ("/campgrounds/oh", "0.8", "weekly"),
    ("/campgrounds/pa", "0.8", "weekly"),
    ("/campgrounds/wi", "0.8", "weekly"),
    ("/best-cell-signal-campgrounds-upper-peninsula", "0.8", "monthly"),
    ("/best-verizon-signal-campgrounds-michigan", "0.8", "monthly"),
    ("/best-remote-work-campgrounds", "0.8", "monthly"),
    ("/route-finder", "0.7", "monthly"),
    ("/lists", "0.6", "monthly"),
]

# ── Build XML ─────────────────────────────────────────────────────────────────
lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]

def add_url(path, priority, freq):
    lines.append("  <url>")
    lines.append(f"    <loc>{BASE_URL}{path}</loc>")
    lines.append(f"    <lastmod>{TODAY}</lastmod>")
    lines.append(f"    <changefreq>{freq}</changefreq>")
    lines.append(f"    <priority>{priority}</priority>")
    lines.append("  </url>")

for path, priority, freq in static_pages:
    add_url(path, priority, freq)

for path in carrier_pages:
    add_url(path, "0.7", "monthly")

for path in remote_work_pages:
    add_url(path, "0.7", "monthly")

for cg in top500:
    slug = cg.get("slug", "")
    if slug:
        add_url(f"/campground/{slug}", "0.6", "monthly")

for state, city_slug in qualifying_cities:
    state_code = STATE_SLUGS[state]
    add_url(f"/campgrounds-with-cell-service/{city_slug}-{state_code}", "0.5", "monthly")

lines.append("</urlset>")
lines.append("")

xml = "\n".join(lines)

with open("client/public/sitemap.xml", "w") as f:
    f.write(xml)

print(f"Static pages:       {len(static_pages)}")
print(f"Carrier pages:      {len(carrier_pages)}")
print(f"Remote work pages:  {len(remote_work_pages)}")
print(f"Campground pages:   {len([c for c in top500 if c.get('slug')])}")
print(f"City pages:         {len(qualifying_cities)}  (of {len(city_data)} total cities)")
print(f"Total URLs:         {len(static_pages) + len(carrier_pages) + len(remote_work_pages) + len([c for c in top500 if c.get('slug')]) + len(qualifying_cities)}")
