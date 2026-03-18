"""Regenerate geojson.json and map_markers.json from the cleaned campgrounds.json."""
import json

# Load the cleaned client dataset (source of truth)
with open("client/src/data/campgrounds.json") as f:
    campgrounds = json.load(f)

print(f"Source: {len(campgrounds)} campgrounds from cleaned dataset")

# Build slug set for validation
slugs = set(c["slug"] for c in campgrounds)

# --- Regenerate geojson.json ---
features = []
for cg in campgrounds:
    lat = cg.get("latitude")
    lon = cg.get("longitude")
    if lat is None or lon is None:
        continue
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "properties": {
            "campground_name": cg.get("campground_name", ""),
            "slug": cg.get("slug", ""),
            "city": cg.get("city", ""),
            "state": cg.get("state", ""),
            "state_full": cg.get("state_full", ""),
            "campground_type": cg.get("campground_type", ""),
            "osm_id": cg.get("osm_id", ""),
            "data_source": cg.get("data_source", ""),
            "is_verified": cg.get("is_verified", False),
            "verification_source": cg.get("verification_source", ""),
            "verification_confidence": cg.get("verification_confidence", ""),
            "tent_sites": cg.get("tent_sites", False),
            "rv_sites": cg.get("rv_sites", False),
            "electric_hookups": cg.get("electric_hookups", False),
            "waterfront": cg.get("waterfront", False),
            "signal_score": cg.get("signal_score"),
            "signal_quality_score": cg.get("signal_quality_score"),
            "carrier_count": cg.get("carrier_count", 0),
            "remote_work_score": cg.get("remote_work_score"),
            "verizon_coverage": cg.get("verizon_coverage", False),
            "att_coverage": cg.get("att_coverage", False),
            "tmobile_coverage": cg.get("tmobile_coverage", False),
        }
    }
    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open("client/src/data/geojson.json", "w") as f:
    json.dump(geojson, f)

print(f"GeoJSON: {len(features)} features written")

# --- Regenerate map_markers.json ---
markers = []
for cg in campgrounds:
    lat = cg.get("latitude")
    lon = cg.get("longitude")
    if lat is None or lon is None:
        continue
    marker = {
        "slug": cg.get("slug", ""),
        "campground_name": cg.get("campground_name", ""),
        "state": cg.get("state", ""),
        "campground_type": cg.get("campground_type", ""),
        "is_verified": cg.get("is_verified", False),
        "signal_score": cg.get("signal_score"),
        "signal_quality_score": cg.get("signal_quality_score"),
        "carrier_count": cg.get("carrier_count", 0),
        "remote_work_score": cg.get("remote_work_score"),
        "latitude": lat,
        "longitude": lon,
        "verizon_coverage": cg.get("verizon_coverage", False),
        "att_coverage": cg.get("att_coverage", False),
        "tmobile_coverage": cg.get("tmobile_coverage", False),
    }
    markers.append(marker)

with open("client/src/data/map_markers.json", "w") as f:
    json.dump(markers, f)

print(f"Map markers: {len(markers)} markers written")
print(f"\nDone. Map data now matches cleaned dataset exactly.")
