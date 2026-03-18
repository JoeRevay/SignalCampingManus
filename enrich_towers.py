#!/usr/bin/env python3
"""
Signal Camping — Tower-Based Coverage Enrichment

Replaces modeled AT&T and T-Mobile coverage with real tower data.
Preserves existing Verizon coverage. Recomputes signal_score and remote_work_score.
"""

import json
import csv
import math
import random
from collections import Counter
from scipy.spatial import cKDTree
import numpy as np

# ─── Configuration ───────────────────────────────────────────────────────────

# MNC codes for carrier identification
ATT_MNCS = {410, 560}
TMOBILE_MNCS = {260, 250, 240}

# Coverage radii in km
RADIUS_RURAL_KM = 12
RADIUS_FOREST_KM = 6
RADIUS_SUBURBAN_KM = 15

# Backcountry buffer sampling radius in meters
BACKCOUNTRY_BUFFER_M = 750

# Signal score mapping
SIGNAL_SCORE_MAP = {0: 10, 1: 40, 2: 70, 3: 90}

# Remote work score weights
RW_SIGNAL_WEIGHT = 0.70
RW_TOWN_WEIGHT = 0.20
RW_HIGHWAY_WEIGHT = 0.10

# Earth radius in km (for haversine)
EARTH_RADIUS_KM = 6371.0

# ─── Helpers ─────────────────────────────────────────────────────────────────

def deg_to_rad(deg):
    return deg * math.pi / 180.0

def km_to_deg(km):
    """Approximate conversion for KDTree (works well at mid-latitudes)."""
    return km / 111.0

def is_backcountry(cg):
    """Determine if a campground is backcountry/forest."""
    if cg.get("backcountry") is True or cg.get("backcountry") == "True":
        return True
    if cg.get("group_only") is True or cg.get("group_only") == "True":
        return True
    op = str(cg.get("operator", "") or "").upper()
    if "DCNR" in op:
        return True
    return False

def get_coverage_radius_km(cg):
    """Determine coverage radius based on campground type."""
    if is_backcountry(cg):
        return RADIUS_FOREST_KM
    # Simple heuristic: if near a town (<5 miles), treat as suburban
    dist = cg.get("distance_to_town_miles")
    if dist is not None and isinstance(dist, (int, float)) and dist < 5:
        return RADIUS_SUBURBAN_KM
    return RADIUS_RURAL_KM

def generate_buffer_points(lat, lon, radius_m=750, n_points=8):
    """Generate sampling points around a center for backcountry multi-point averaging."""
    points = [(lat, lon)]  # center point
    radius_deg = (radius_m / 1000.0) / 111.0
    for i in range(n_points):
        angle = 2 * math.pi * i / n_points
        dlat = radius_deg * math.cos(angle)
        dlon = radius_deg * math.sin(angle) / max(math.cos(deg_to_rad(lat)), 0.01)
        points.append((lat + dlat, lon + dlon))
    return points

def compute_town_proximity_score(dist_miles):
    """Score town proximity (0-100). Closer = higher."""
    if dist_miles is None or not isinstance(dist_miles, (int, float)):
        return 0
    if dist_miles <= 2:
        return 100
    elif dist_miles <= 5:
        return 90
    elif dist_miles <= 10:
        return 75
    elif dist_miles <= 20:
        return 60
    elif dist_miles <= 40:
        return 40
    elif dist_miles <= 80:
        return 20
    else:
        return 5

def compute_highway_proximity_score(dist_miles):
    """Score highway proximity (0-100). Closer = higher."""
    if dist_miles is None or not isinstance(dist_miles, (int, float)):
        return 0
    if dist_miles <= 1:
        return 100
    elif dist_miles <= 5:
        return 85
    elif dist_miles <= 10:
        return 70
    elif dist_miles <= 20:
        return 50
    elif dist_miles <= 40:
        return 30
    elif dist_miles <= 80:
        return 15
    else:
        return 5

def compute_remote_work_score(signal_score, town_miles, highway_miles):
    """Compute remote work score from signal, town, and highway proximity."""
    town_score = compute_town_proximity_score(town_miles)
    highway_score = compute_highway_proximity_score(highway_miles)
    raw = (RW_SIGNAL_WEIGHT * signal_score +
           RW_TOWN_WEIGHT * town_score +
           RW_HIGHWAY_WEIGHT * highway_score)
    return round(raw * 2) / 2  # round to nearest 0.5

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("SignalCamping — Tower-Based Coverage Enrichment")
    print("=" * 60)

    # 1. Load campground dataset
    print("\n[1] Loading campground dataset...")
    with open("datasets/campgrounds_signal_scored.json") as f:
        campgrounds = json.load(f)
    print(f"    Loaded {len(campgrounds)} campgrounds")

    # 2. Load tower dataset
    print("\n[2] Loading tower dataset...")
    att_towers = []
    tmobile_towers = []
    
    with open("/home/ubuntu/upload/cell_towers_att_tmobile.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                lat = float(row["lat"])
                lon = float(row["lon"])
                mnc = int(row["mnc"])
            except (ValueError, KeyError):
                continue
            
            if mnc in ATT_MNCS:
                att_towers.append((lat, lon))
            elif mnc in TMOBILE_MNCS:
                tmobile_towers.append((lat, lon))
    
    print(f"    AT&T towers: {len(att_towers)}")
    print(f"    T-Mobile towers: {len(tmobile_towers)}")

    # 3. Build spatial indices
    print("\n[3] Building spatial indices (KDTree)...")
    att_coords = np.array(att_towers) if att_towers else np.empty((0, 2))
    tmobile_coords = np.array(tmobile_towers) if tmobile_towers else np.empty((0, 2))
    
    att_tree = cKDTree(att_coords) if len(att_coords) > 0 else None
    tmobile_tree = cKDTree(tmobile_coords) if len(tmobile_coords) > 0 else None
    print(f"    AT&T KDTree: {len(att_coords)} points")
    print(f"    T-Mobile KDTree: {len(tmobile_coords)} points")

    # 4. Compute coverage for each campground
    print("\n[4] Computing tower-based coverage...")
    
    for i, cg in enumerate(campgrounds):
        lat = cg.get("latitude")
        lon = cg.get("longitude")
        
        if lat is None or lon is None:
            continue
        
        radius_km = get_coverage_radius_km(cg)
        radius_deg = km_to_deg(radius_km)
        
        # Determine if we need multi-point sampling
        use_buffer = is_backcountry(cg)
        
        if use_buffer:
            sample_points = generate_buffer_points(lat, lon, BACKCOUNTRY_BUFFER_M)
        else:
            sample_points = [(lat, lon)]
        
        # AT&T coverage check
        att_found = False
        if att_tree is not None:
            for plat, plon in sample_points:
                neighbors = att_tree.query_ball_point([plat, plon], radius_deg)
                if len(neighbors) > 0:
                    att_found = True
                    break
        cg["att_coverage"] = att_found
        
        # T-Mobile coverage check
        tmobile_found = False
        if tmobile_tree is not None:
            for plat, plon in sample_points:
                neighbors = tmobile_tree.query_ball_point([plat, plon], radius_deg)
                if len(neighbors) > 0:
                    tmobile_found = True
                    break
        cg["tmobile_coverage"] = tmobile_found
        
        # Preserve existing Verizon coverage (do not change)
        vz = cg.get("verizon_coverage", False)
        if vz == "True":
            vz = True
        elif vz == "False":
            vz = False
        cg["verizon_coverage"] = bool(vz)
        
        # Recompute carrier count and signal score
        carrier_count = sum([
            1 if cg["verizon_coverage"] else 0,
            1 if cg["att_coverage"] else 0,
            1 if cg["tmobile_coverage"] else 0,
        ])
        cg["carrier_count"] = carrier_count
        cg["signal_score"] = SIGNAL_SCORE_MAP.get(carrier_count, 10)
        
        # Recompute remote work score
        cg["remote_work_score"] = compute_remote_work_score(
            cg["signal_score"],
            cg.get("distance_to_town_miles"),
            cg.get("distance_to_highway_miles"),
        )
        
        if (i + 1) % 500 == 0:
            print(f"    Processed {i + 1}/{len(campgrounds)}...")
    
    print(f"    Processed all {len(campgrounds)} campgrounds")

    # 5. Save updated dataset
    print("\n[5] Saving updated datasets...")
    
    with open("datasets/campgrounds_signal_scored.json", "w") as f:
        json.dump(campgrounds, f, indent=2)
    print("    Saved: datasets/campgrounds_signal_scored.json")
    
    # Also update the clean version (used by frontend ranking pages)
    with open("datasets/campgrounds_signal_scored_clean.json", "w") as f:
        json.dump(campgrounds, f, indent=2)
    print("    Saved: datasets/campgrounds_signal_scored_clean.json")

    # Also update the client-side data file
    # Check if client/src/data/campgrounds.json exists and update it
    try:
        with open("client/src/data/campgrounds.json") as f:
            client_data = json.load(f)
        
        # Build lookup by slug
        enriched_lookup = {}
        for cg in campgrounds:
            slug = cg.get("slug", "")
            if slug:
                enriched_lookup[slug] = cg
        
        updated_count = 0
        for ccg in client_data:
            slug = ccg.get("slug", "")
            if slug in enriched_lookup:
                src = enriched_lookup[slug]
                ccg["att_coverage"] = src["att_coverage"]
                ccg["tmobile_coverage"] = src["tmobile_coverage"]
                ccg["verizon_coverage"] = src["verizon_coverage"]
                ccg["carrier_count"] = src["carrier_count"]
                ccg["signal_score"] = src["signal_score"]
                ccg["remote_work_score"] = src["remote_work_score"]
                updated_count += 1
        
        with open("client/src/data/campgrounds.json", "w") as f:
            json.dump(client_data, f, indent=2)
        print(f"    Updated client/src/data/campgrounds.json ({updated_count} records matched)")
    except FileNotFoundError:
        print("    client/src/data/campgrounds.json not found, skipping")

    # 6. Summary statistics
    print("\n" + "=" * 60)
    print("ENRICHMENT SUMMARY")
    print("=" * 60)
    
    total = len(campgrounds)
    vz_count = sum(1 for c in campgrounds if c.get("verizon_coverage"))
    att_count = sum(1 for c in campgrounds if c.get("att_coverage"))
    tm_count = sum(1 for c in campgrounds if c.get("tmobile_coverage"))
    
    scores = [c.get("signal_score", 0) for c in campgrounds]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    cc_dist = Counter(c.get("carrier_count", 0) for c in campgrounds)
    
    rw_scores = [c.get("remote_work_score", 0) for c in campgrounds]
    avg_rw = sum(rw_scores) / len(rw_scores) if rw_scores else 0
    
    print(f"\nTotal campgrounds processed: {total}")
    print(f"\nCarrier coverage:")
    print(f"  Verizon:  {vz_count:>5} ({vz_count/total*100:.1f}%) [PRESERVED]")
    print(f"  AT&T:     {att_count:>5} ({att_count/total*100:.1f}%) [UPDATED from real towers]")
    print(f"  T-Mobile: {tm_count:>5} ({tm_count/total*100:.1f}%) [UPDATED from real towers]")
    print(f"\nCarrier count distribution:")
    for k in sorted(cc_dist.keys()):
        print(f"  {k} carriers: {cc_dist[k]:>5} ({cc_dist[k]/total*100:.1f}%)")
    print(f"\nAverage signal score: {avg_score:.1f}")
    print(f"Average remote work score: {avg_rw:.1f}")

    # 7. Validation — check 20 random campgrounds
    print("\n" + "=" * 60)
    print("VALIDATION — 20 Random Campground Checks")
    print("=" * 60)
    
    sample = random.sample(campgrounds, min(20, len(campgrounds)))
    for cg in sample:
        name = cg.get("campground_name", "Unknown")[:40]
        state = cg.get("state", "??")
        town_dist = cg.get("distance_to_town_miles", "?")
        vz = "Y" if cg.get("verizon_coverage") else "N"
        att = "Y" if cg.get("att_coverage") else "N"
        tm = "Y" if cg.get("tmobile_coverage") else "N"
        cc = cg.get("carrier_count", 0)
        ss = cg.get("signal_score", 0)
        rw = cg.get("remote_work_score", 0)
        bc = "BC" if is_backcountry(cg) else "  "
        print(f"  {bc} {name:<42} {state} | Town:{town_dist:>6.1f}mi | VZ:{vz} ATT:{att} TM:{tm} | CC:{cc} SS:{ss:>2} RW:{rw:>5.1f}")

    print("\n[DONE] Enrichment complete.")
    
    return {
        "total": total,
        "verizon": vz_count,
        "att": att_count,
        "tmobile": tm_count,
        "avg_signal": avg_score,
        "avg_rw": avg_rw,
        "carrier_dist": dict(sorted(cc_dist.items())),
    }

if __name__ == "__main__":
    main()
