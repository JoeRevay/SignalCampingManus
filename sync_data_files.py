#!/usr/bin/env python3
"""
Sync enriched carrier data from campgrounds_signal_scored.json
to all client-side data files used by different pages.
"""

import json
import os

ENRICHED_PATH = "datasets/campgrounds_signal_scored.json"

# Fields to propagate
SYNC_FIELDS = [
    "att_coverage",
    "tmobile_coverage",
    "verizon_coverage",
    "carrier_count",
    "signal_score",
    "remote_work_score",
]

# Client data files to update
CLIENT_FILES = [
    "client/src/data/campgrounds.json",
    "client/src/data/top100_seo.json",
    "client/src/data/mvp_campgrounds.json",
    "client/src/data/campgrounds_osm_normalized.json",
]

def main():
    print("Loading enriched dataset...")
    with open(ENRICHED_PATH) as f:
        enriched = json.load(f)
    
    # Build lookup by slug
    lookup = {}
    for cg in enriched:
        slug = cg.get("slug", "")
        if slug:
            lookup[slug] = cg
    print(f"  Enriched records with slugs: {len(lookup)}")
    
    for fpath in CLIENT_FILES:
        if not os.path.exists(fpath):
            print(f"\n  SKIP: {fpath} (not found)")
            continue
        
        print(f"\nUpdating: {fpath}")
        with open(fpath) as f:
            data = json.load(f)
        
        updated = 0
        for rec in data:
            slug = rec.get("slug", "")
            if slug in lookup:
                src = lookup[slug]
                for field in SYNC_FIELDS:
                    if field in src:
                        rec[field] = src[field]
                updated += 1
        
        with open(fpath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  Updated {updated}/{len(data)} records")
    
    # Also update the geojson file if it has properties with these fields
    geojson_path = "client/src/data/geojson.json"
    if os.path.exists(geojson_path):
        print(f"\nUpdating: {geojson_path}")
        with open(geojson_path) as f:
            geojson = json.load(f)
        
        updated = 0
        for feat in geojson.get("features", []):
            props = feat.get("properties", {})
            slug = props.get("slug", "")
            if slug in lookup:
                src = lookup[slug]
                for field in SYNC_FIELDS:
                    if field in src:
                        props[field] = src[field]
                updated += 1
        
        with open(geojson_path, "w") as f:
            json.dump(geojson, f, indent=2)
        print(f"  Updated {updated} features")
    
    # Summary verification
    print("\n" + "=" * 50)
    print("VERIFICATION AFTER SYNC")
    print("=" * 50)
    
    for fpath in CLIENT_FILES:
        if not os.path.exists(fpath):
            continue
        with open(fpath) as f:
            data = json.load(f)
        att = sum(1 for r in data if r.get("att_coverage") in [True])
        tm = sum(1 for r in data if r.get("tmobile_coverage") in [True])
        vz = sum(1 for r in data if r.get("verizon_coverage") in [True])
        print(f"  {os.path.basename(fpath)}: {len(data)} recs | VZ:{vz} ATT:{att} TM:{tm}")
    
    print("\n[DONE] All client data files synced.")

if __name__ == "__main__":
    main()
