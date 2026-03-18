"""Generate sitemap.xml for SignalCamping from cleaned dataset."""
import json
from datetime import date

BASE_URL = "https://signalcamping.com"
TODAY = date.today().isoformat()

# Load client campgrounds (already cleaned)
with open("client/src/data/campgrounds.json") as f:
    campgrounds = json.load(f)

# Sort by signal_quality_score descending, take top 500
campgrounds.sort(key=lambda c: (c.get("signal_quality_score", 0) or 0), reverse=True)
top500 = campgrounds[:500]

# Static pages
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

# Build XML
lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]

for path, priority, freq in static_pages:
    lines.append("  <url>")
    lines.append(f"    <loc>{BASE_URL}{path}</loc>")
    lines.append(f"    <lastmod>{TODAY}</lastmod>")
    lines.append(f"    <changefreq>{freq}</changefreq>")
    lines.append(f"    <priority>{priority}</priority>")
    lines.append("  </url>")

for cg in top500:
    slug = cg.get("slug", "")
    if not slug:
        continue
    lines.append("  <url>")
    lines.append(f"    <loc>{BASE_URL}/campground/{slug}</loc>")
    lines.append(f"    <lastmod>{TODAY}</lastmod>")
    lines.append(f"    <changefreq>monthly</changefreq>")
    lines.append(f"    <priority>0.6</priority>")
    lines.append("  </url>")

lines.append("</urlset>")
lines.append("")

xml = "\n".join(lines)

with open("client/public/sitemap.xml", "w") as f:
    f.write(xml)

print(f"Generated sitemap.xml with {len(static_pages)} static pages + {len([c for c in top500 if c.get('slug')])} campground pages")
print(f"Total URLs: {len(static_pages) + len([c for c in top500 if c.get('slug')])}")
