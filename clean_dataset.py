"""
Dataset Cleaning Script for SignalCamping
Removes individual campsites, invalid names, backcountry markers, and duplicates.
Preserves legitimate campgrounds.
"""
import json
import re
import math
from collections import Counter

INPUT = "datasets/campgrounds_signal_scored.json"
OUTPUT = "datasets/campgrounds_cleaned_final.json"

with open(INPUT) as f:
    data = json.load(f)

original_count = len(data)
print(f"Original record count: {original_count}")

# ── Tracking removal reasons ──
removal_reasons = {
    "individual_site": [],
    "backcountry_group": [],
    "invalid_name": [],
    "osm_micro_type": [],
    "duplicate": [],
}

# ── Helper: Check if record is protected (legit campground) ──
PROTECTED_NAME_PATTERNS = [
    r"\bCampground\b",
    r"\bState Park\b",
    r"\bCounty Park\b",
    r"\bNational Forest\b",
    r"\bRecreation Area\b",
    r"\bKOA\b",
    r"\bCamp\b",
]
PROTECTED_NAME_RE = re.compile("|".join(PROTECTED_NAME_PATTERNS), re.IGNORECASE)

PROTECTED_OPERATORS = ["DNR", "National Park", "USFS", "County"]

def is_protected(rec):
    name = rec.get("campground_name", "")
    if PROTECTED_NAME_RE.search(name):
        return True
    if rec.get("is_verified") in [True, "True", "true"]:
        return True
    operator = rec.get("operator", "") or ""
    for op in PROTECTED_OPERATORS:
        if op.lower() in operator.lower():
            return True
    return False

# ── STEP 1: Individual site name patterns ──
SITE_PATTERNS = re.compile(
    r"""
    \bSite\s*\d*\b |
    \bTent\s+Site\b |
    \bTent\s+Pad\b |
    \bBackcountry\s+Site\b |
    \bCampsite\b |
    Camp\s*\# |
    \bPad\s*\d+\b |
    \bLoop\b
    """,
    re.IGNORECASE | re.VERBOSE,
)

# Also match number-only or very short alphanumeric names like "23E", "A", "12"
SHORT_ALPHANUM_RE = re.compile(r"^[#]?\d+[A-Za-z]?$|^[A-Za-z]$")

# ── STEP 2: OSM micro-feature types ──
MICRO_TYPES = {"site", "backcountry", "primitive_site"}

# ── Main cleaning pass ──
cleaned = []
removed_ids = set()

for rec in data:
    name = (rec.get("campground_name") or "").strip()
    cg_type = (rec.get("campground_type") or "").lower()
    osm_id = rec.get("osm_id", "")

    # Check protection first
    protected = is_protected(rec)

    # Rule 1: Invalid / short names
    if len(name) < 4 or SHORT_ALPHANUM_RE.match(name):
        if not protected:
            removal_reasons["invalid_name"].append(name)
            removed_ids.add(osm_id)
            continue

    # Rule 2: Individual site name patterns
    if SITE_PATTERNS.search(name):
        if not protected:
            removal_reasons["individual_site"].append(name)
            removed_ids.add(osm_id)
            continue

    # Rule 3: Backcountry / group_only flags
    is_bc = rec.get("backcountry") in [True, "True", "true"]
    is_go = rec.get("group_only") in [True, "True", "true"]
    if (is_bc or is_go) and not protected:
        removal_reasons["backcountry_group"].append(name)
        removed_ids.add(osm_id)
        continue

    # Rule 4: OSM micro-feature types
    if cg_type in MICRO_TYPES and not protected:
        removal_reasons["osm_micro_type"].append(name)
        removed_ids.add(osm_id)
        continue

    cleaned.append(rec)

pre_dedup_count = len(cleaned)
print(f"After filtering (before dedup): {pre_dedup_count}")

# ── STEP 3: Deduplication (same name within 0.5 km) ──
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# Sort by signal_quality_score desc so we keep the best-scored record
cleaned.sort(key=lambda r: -(r.get("signal_quality_score") or r.get("signal_score") or 0))

seen = {}  # name_lower -> list of (lat, lon, record)
final = []
dup_count = 0

for rec in cleaned:
    name = rec.get("campground_name", "").strip()
    name_lower = name.lower()
    lat = rec.get("latitude", 0) or 0
    lon = rec.get("longitude", 0) or 0

    if name_lower in seen:
        is_dup = False
        for (slat, slon, _) in seen[name_lower]:
            dist = haversine_km(lat, lon, slat, slon)
            if dist < 0.5:
                is_dup = True
                break
        if is_dup:
            removal_reasons["duplicate"].append(name)
            dup_count += 1
            continue

    seen.setdefault(name_lower, []).append((lat, lon, rec))
    final.append(rec)

# Re-sort by campground_name for clean output
final.sort(key=lambda r: r.get("campground_name", ""))

final_count = len(final)
print(f"After deduplication: {final_count}")

# ── Write output ──
with open(OUTPUT, "w") as f:
    json.dump(final, f, indent=2)

print(f"\nWritten to {OUTPUT}")

# ── Summary ──
total_removed = original_count - final_count
print(f"\n{'='*60}")
print(f"CLEANING SUMMARY")
print(f"{'='*60}")
print(f"Original count:       {original_count}")
print(f"Removed (total):      {total_removed}")
print(f"Final count:          {final_count}")
print(f"{'='*60}")
print(f"Removal breakdown:")
print(f"  Individual site:    {len(removal_reasons['individual_site'])}")
print(f"  Backcountry/group:  {len(removal_reasons['backcountry_group'])}")
print(f"  Invalid name:       {len(removal_reasons['invalid_name'])}")
print(f"  OSM micro type:     {len(removal_reasons['osm_micro_type'])}")
print(f"  Duplicate:          {len(removal_reasons['duplicate'])}")
print(f"{'='*60}")

# Show some examples of each category
for reason, names in removal_reasons.items():
    if names:
        print(f"\nSample {reason} removals ({len(names)} total):")
        for n in sorted(set(names))[:10]:
            print(f"  - {n}")
