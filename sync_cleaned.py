"""
Sync cleaned dataset to all client data files and main dataset files.
Replaces campgrounds_signal_scored.json and campgrounds_signal_scored_clean.json,
then rebuilds all client-side data files from the cleaned dataset.
"""
import json
import os

CLEANED = "datasets/campgrounds_cleaned_final.json"

with open(CLEANED) as f:
    cleaned = json.load(f)

cleaned_slugs = {r.get("slug") for r in cleaned}
cleaned_osm_ids = {r.get("osm_id") for r in cleaned}
print(f"Cleaned dataset: {len(cleaned)} records")

# ── 1. Replace main dataset files ──
for target in [
    "datasets/campgrounds_signal_scored.json",
    "datasets/campgrounds_signal_scored_clean.json",
]:
    with open(target, "w") as f:
        json.dump(cleaned, f, indent=2)
    print(f"Updated: {target}")

# ── 2. Update client/src/data/campgrounds.json ──
# This is the main client data file (may have fewer fields)
client_main = "client/src/data/campgrounds.json"
if os.path.exists(client_main):
    with open(client_main) as f:
        client_data = json.load(f)
    original = len(client_data)
    # Filter by slug or osm_id
    filtered = [r for r in client_data if r.get("slug") in cleaned_slugs or r.get("osm_id") in cleaned_osm_ids]
    with open(client_main, "w") as f:
        json.dump(filtered, f, indent=2)
    print(f"Updated: {client_main} ({original} -> {len(filtered)})")

# ── 3. Update client/src/data/campgrounds_signal_scored_clean.json ──
client_scored = "client/src/data/campgrounds_signal_scored_clean.json"
if os.path.exists(client_scored):
    with open(client_scored, "w") as f:
        json.dump(cleaned, f, indent=2)
    print(f"Updated: {client_scored}")

# ── 4. Update top100_seo.json (keep only records that exist in cleaned) ──
top100 = "client/src/data/top100_seo.json"
if os.path.exists(top100):
    with open(top100) as f:
        top_data = json.load(f)
    original = len(top_data)
    filtered = [r for r in top_data if r.get("slug") in cleaned_slugs or r.get("osm_id") in cleaned_osm_ids]
    with open(top100, "w") as f:
        json.dump(filtered, f, indent=2)
    print(f"Updated: {top100} ({original} -> {len(filtered)})")

# ── 5. Update mvp_campgrounds.json ──
mvp = "client/src/data/mvp_campgrounds.json"
if os.path.exists(mvp):
    with open(mvp) as f:
        mvp_data = json.load(f)
    original = len(mvp_data)
    filtered = [r for r in mvp_data if r.get("slug") in cleaned_slugs or r.get("osm_id") in cleaned_osm_ids]
    with open(mvp, "w") as f:
        json.dump(filtered, f, indent=2)
    print(f"Updated: {mvp} ({original} -> {len(filtered)})")

# ── 6. Update shareable_lists.json (filter campgrounds within lists) ──
lists_file = "client/src/data/shareable_lists.json"
if os.path.exists(lists_file):
    with open(lists_file) as f:
        lists_data = json.load(f)
    for lst in lists_data:
        if "campgrounds" in lst:
            original = len(lst["campgrounds"])
            lst["campgrounds"] = [c for c in lst["campgrounds"] if c.get("slug") in cleaned_slugs or c.get("osm_id") in cleaned_osm_ids]
            lst["count"] = len(lst["campgrounds"])
    with open(lists_file, "w") as f:
        json.dump(lists_data, f, indent=2)
    print(f"Updated: {lists_file}")

# ── 7. Update GeoJSON file ──
geojson_file = "client/src/data/campgrounds_scored.geojson"
if os.path.exists(geojson_file):
    with open(geojson_file) as f:
        geo = json.load(f)
    original = len(geo.get("features", []))
    geo["features"] = [
        f for f in geo.get("features", [])
        if f.get("properties", {}).get("slug") in cleaned_slugs
        or f.get("properties", {}).get("osm_id") in cleaned_osm_ids
    ]
    with open(geojson_file, "w") as f:
        json.dump(geo, f, indent=2)
    print(f"Updated: {geojson_file} ({original} -> {len(geo['features'])})")

print("\nAll files synced successfully.")
