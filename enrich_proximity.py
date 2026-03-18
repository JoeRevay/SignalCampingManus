#!/usr/bin/env python3
"""
SignalCamping — Proximity-Based Signal Quality Enrichment

Computes nearest tower distance per carrier and derives signal_quality_score
to break tied rankings among campgrounds with identical signal_score values.

READ existing fields, ADD new fields only. No modifications to existing data.
"""

import json
import csv
import math
import random
from collections import Counter
from scipy.spatial import cKDTree
import numpy as np

# ─── Configuration ───────────────────────────────────────────────────────────

# MNC codes for AT&T and T-Mobile (from OpenCelliD CSV)
ATT_MNCS = {410, 560}
TMOBILE_MNCS = {260, 250, 240}

# Earth radius in km
EARTH_RADIUS_KM = 6371.0

# Approximate conversion: 1 degree latitude ≈ 111 km
DEG_TO_KM = 111.0

# ─── Helpers ─────────────────────────────────────────────────────────────────

def build_kdtree(coords):
    """Build a KDTree from (lat, lon) coordinate pairs."""
    if len(coords) == 0:
        return None, np.empty((0, 2))
    arr = np.array(coords)
    return cKDTree(arr), arr

def nearest_distance_km(tree, lat, lon):
    """Query KDTree for nearest tower and return distance in km."""
    if tree is None:
        return None
    dist_deg, _ = tree.query([lat, lon])
    # Convert degree distance to approximate km
    # Use the latitude to adjust for longitude compression
    lat_rad = math.radians(lat)
    # Average scale factor between lat and lon at this latitude
    avg_scale = DEG_TO_KM * math.sqrt((1 + math.cos(lat_rad)**2) / 2)
    return round(dist_deg * avg_scale, 2)

def compute_signal_quality_score(carrier_count, distances):
    """
    Compute signal_quality_score based on carrier count and tower proximity.
    
    distances: list of non-None distance values for detected carriers
    """
    if carrier_count == 0:
        return 10
    
    if carrier_count == 3:
        avg_dist = sum(distances) / len(distances) if distances else 999
        if avg_dist <= 5:
            return 95
        elif avg_dist <= 10:
            return 90
        else:
            return 85
    
    if carrier_count == 2:
        avg_dist = sum(distances) / len(distances) if distances else 999
        if avg_dist <= 5:
            return 75
        elif avg_dist <= 10:
            return 70
        else:
            return 65
    
    if carrier_count == 1:
        dist = distances[0] if distances else 999
        if dist <= 5:
            return 50
        elif dist <= 10:
            return 40
        else:
            return 30
    
    return 10

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("SignalCamping — Proximity-Based Signal Quality Enrichment")
    print("=" * 60)

    # 1. Load campground dataset
    print("\n[1] Loading campground dataset...")
    with open("datasets/campgrounds_signal_scored.json") as f:
        campgrounds = json.load(f)
    print(f"    Loaded {len(campgrounds)} campgrounds")

    # 2. Load Verizon towers from towers_gl_combined.json
    print("\n[2] Loading tower datasets...")
    verizon_towers = []
    with open("/home/ubuntu/celldata/towers_gl_combined.json") as f:
        towers_data = json.load(f)
    for t in towers_data:
        if t.get("carrier") == "verizon":
            verizon_towers.append((t["lat"], t["lon"]))
    print(f"    Verizon towers: {len(verizon_towers)}")

    # 3. Load AT&T and T-Mobile towers from CSV
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

    # 4. Build spatial indices
    print("\n[3] Building KDTree spatial indices...")
    vz_tree, _ = build_kdtree(verizon_towers)
    att_tree, _ = build_kdtree(att_towers)
    tm_tree, _ = build_kdtree(tmobile_towers)
    print("    All 3 KDTrees built")

    # 5. Compute nearest distances and signal_quality_score
    print("\n[4] Computing nearest tower distances and signal_quality_score...")
    
    for i, cg in enumerate(campgrounds):
        lat = cg.get("latitude")
        lon = cg.get("longitude")
        
        if lat is None or lon is None:
            cg["nearest_verizon_distance_km"] = None
            cg["nearest_att_distance_km"] = None
            cg["nearest_tmobile_distance_km"] = None
            cg["signal_quality_score"] = 10
            continue
        
        # Compute nearest tower distance for each carrier
        # Only set distance if carrier is detected (coverage = true)
        vz_cov = cg.get("verizon_coverage") is True
        att_cov = cg.get("att_coverage") is True
        tm_cov = cg.get("tmobile_coverage") is True
        
        vz_dist = nearest_distance_km(vz_tree, lat, lon) if vz_cov else None
        att_dist = nearest_distance_km(att_tree, lat, lon) if att_cov else None
        tm_dist = nearest_distance_km(tm_tree, lat, lon) if tm_cov else None
        
        cg["nearest_verizon_distance_km"] = vz_dist
        cg["nearest_att_distance_km"] = att_dist
        cg["nearest_tmobile_distance_km"] = tm_dist
        
        # Collect non-None distances for quality score
        carrier_count = cg.get("carrier_count", 0)
        distances = [d for d in [vz_dist, att_dist, tm_dist] if d is not None]
        
        cg["signal_quality_score"] = compute_signal_quality_score(carrier_count, distances)
        
        if (i + 1) % 500 == 0:
            print(f"    Processed {i + 1}/{len(campgrounds)}...")
    
    print(f"    Processed all {len(campgrounds)} campgrounds")

    # 6. Save updated dataset
    print("\n[5] Saving updated dataset...")
    with open("datasets/campgrounds_signal_scored.json", "w") as f:
        json.dump(campgrounds, f, indent=2)
    print("    Saved: datasets/campgrounds_signal_scored.json")
    
    with open("datasets/campgrounds_signal_scored_clean.json", "w") as f:
        json.dump(campgrounds, f, indent=2)
    print("    Saved: datasets/campgrounds_signal_scored_clean.json")

    # 7. Validation
    print("\n" + "=" * 60)
    print("VALIDATION")
    print("=" * 60)
    
    # Distribution of signal_quality_score
    sq_dist = Counter(c.get("signal_quality_score", 0) for c in campgrounds)
    print("\nSignal Quality Score Distribution:")
    for k in sorted(sq_dist.keys()):
        print(f"  {k:>3}: {sq_dist[k]:>5} ({sq_dist[k]/len(campgrounds)*100:.1f}%)")
    
    # Comparison: campgrounds with signal_score=90 now vary between 85-95
    ss90 = [c for c in campgrounds if c.get("signal_score") == 90]
    print(f"\nCampgrounds with signal_score = 90: {len(ss90)}")
    sq_of_ss90 = Counter(c.get("signal_quality_score") for c in ss90)
    for k in sorted(sq_of_ss90.keys()):
        print(f"  signal_quality_score {k}: {sq_of_ss90[k]} ({sq_of_ss90[k]/len(ss90)*100:.1f}%)")
    
    # Same for signal_score=70
    ss70 = [c for c in campgrounds if c.get("signal_score") == 70]
    print(f"\nCampgrounds with signal_score = 70: {len(ss70)}")
    sq_of_ss70 = Counter(c.get("signal_quality_score") for c in ss70)
    for k in sorted(sq_of_ss70.keys()):
        print(f"  signal_quality_score {k}: {sq_of_ss70[k]} ({sq_of_ss70[k]/len(ss70)*100:.1f}%)")
    
    # Same for signal_score=40
    ss40 = [c for c in campgrounds if c.get("signal_score") == 40]
    print(f"\nCampgrounds with signal_score = 40: {len(ss40)}")
    sq_of_ss40 = Counter(c.get("signal_quality_score") for c in ss40)
    for k in sorted(sq_of_ss40.keys()):
        print(f"  signal_quality_score {k}: {sq_of_ss40[k]} ({sq_of_ss40[k]/len(ss40)*100:.1f}%)")
    
    # Random sample of 10
    print("\n" + "-" * 80)
    print("RANDOM SAMPLE (10 campgrounds)")
    print("-" * 80)
    random.seed(99)
    sample = random.sample(campgrounds, 10)
    print(f"{'Name':<42} {'CC':>2} {'SS':>3} {'SQS':>3} {'VZ_km':>7} {'ATT_km':>7} {'TM_km':>7}")
    print("-" * 80)
    for c in sample:
        name = c.get("campground_name", "?")[:41]
        cc = c.get("carrier_count", 0)
        ss = c.get("signal_score", 0)
        sqs = c.get("signal_quality_score", 0)
        vz_d = f"{c['nearest_verizon_distance_km']:.1f}" if c.get("nearest_verizon_distance_km") is not None else "null"
        att_d = f"{c['nearest_att_distance_km']:.1f}" if c.get("nearest_att_distance_km") is not None else "null"
        tm_d = f"{c['nearest_tmobile_distance_km']:.1f}" if c.get("nearest_tmobile_distance_km") is not None else "null"
        print(f"{name:<42} {cc:>2} {ss:>3} {sqs:>3} {vz_d:>7} {att_d:>7} {tm_d:>7}")
    
    print("\n[DONE] Proximity enrichment complete.")

if __name__ == "__main__":
    main()
