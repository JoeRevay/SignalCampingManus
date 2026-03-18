# Proximity-Based Signal Quality Enrichment Report

**Date:** March 17, 2026
**Mode:** Data enrichment only (no UI changes)

## Overview

This enrichment adds proximity-based refinement to break tied rankings among campgrounds with identical `signal_score` values. Four new fields were added to every campground record without modifying any existing fields.

## New Fields Added

| Field | Type | Description |
|-------|------|-------------|
| `nearest_verizon_distance_km` | float or null | Distance in km to nearest Verizon tower (null if no coverage) |
| `nearest_att_distance_km` | float or null | Distance in km to nearest AT&T tower (null if no coverage) |
| `nearest_tmobile_distance_km` | float or null | Distance in km to nearest T-Mobile tower (null if no coverage) |
| `signal_quality_score` | int (0-100) | Proximity-refined score that differentiates tied signal_score values |

## Tower Data Used

| Carrier | Source | Tower Count |
|---------|--------|-------------|
| Verizon | towers_gl_combined.json (FCC) | 37,833 |
| AT&T | cell_towers_att_tmobile.csv (OpenCelliD) | 48,269 |
| T-Mobile | cell_towers_att_tmobile.csv (OpenCelliD) | 60,436 |

## Signal Quality Score Distribution

| Score | Count | Percentage | Corresponding Tier |
|-------|-------|------------|-------------------|
| 95 | 675 | 21.7% | 3 carriers, avg distance ≤ 5 km |
| 90 | 292 | 9.4% | 3 carriers, avg distance ≤ 10 km |
| 85 | 2 | 0.1% | 3 carriers, avg distance > 10 km |
| 75 | 223 | 7.2% | 2 carriers, avg distance ≤ 5 km |
| 70 | 290 | 9.3% | 2 carriers, avg distance ≤ 10 km |
| 65 | 17 | 0.5% | 2 carriers, avg distance > 10 km |
| 50 | 223 | 7.2% | 1 carrier, distance ≤ 5 km |
| 40 | 335 | 10.8% | 1 carrier, distance ≤ 10 km |
| 30 | 150 | 4.8% | 1 carrier, distance > 10 km |
| 10 | 907 | 29.1% | 0 carriers |

## Tied-Ranking Breakup Analysis

The primary goal was to differentiate campgrounds that previously shared the same `signal_score`. Here is how the new `signal_quality_score` distributes within each original tier:

**signal_score = 90 (969 campgrounds, 3 carriers):**

| signal_quality_score | Count | Percentage |
|---------------------|-------|------------|
| 95 | 675 | 69.7% |
| 90 | 292 | 30.1% |
| 85 | 2 | 0.2% |

Previously all 969 campgrounds were tied at score 90. Now they are split into 3 distinct tiers based on tower proximity.

**signal_score = 70 (530 campgrounds, 2 carriers):**

| signal_quality_score | Count | Percentage |
|---------------------|-------|------------|
| 75 | 223 | 42.1% |
| 70 | 290 | 54.7% |
| 65 | 17 | 3.2% |

Previously all 530 were tied. Now split into 3 tiers.

**signal_score = 40 (708 campgrounds, 1 carrier):**

| signal_quality_score | Count | Percentage |
|---------------------|-------|------------|
| 50 | 223 | 31.5% |
| 40 | 335 | 47.3% |
| 30 | 150 | 21.2% |

Previously all 708 were tied. Now split into 3 tiers.

**signal_score = 10 (907 campgrounds, 0 carriers):**

All remain at signal_quality_score = 10 (no tower proximity data available).

## Random Sample

| Campground | CC | SS | SQS | VZ km | ATT km | TM km |
|-----------|----|----|-----|-------|--------|-------|
| Lakeside Campground | 3 | 90 | 90 | 4.7 | 7.2 | 7.3 |
| Kenosha Lake | 1 | 40 | 40 | 8.8 | null | null |
| Colwell Lake Campground | 0 | 10 | 10 | null | null | null |
| Seney Township Campground | 3 | 90 | 95 | 1.1 | 1.0 | 1.1 |
| Central WI Environmental Center | 3 | 90 | 90 | 3.4 | 6.9 | 8.5 |
| Dock #3 Primitive Campground | 0 | 10 | 10 | null | null | null |
| Elk Lick Scout Reserve | 3 | 90 | 90 | 9.2 | 5.5 | 6.8 |
| Camp Golden Pond | 1 | 40 | 40 | null | null | 8.4 |
| Zaleski Forest Horse Camp | 0 | 10 | 10 | null | null | null |
| Blind Sucker No. 2 SF Campground | 0 | 10 | 10 | null | null | null |

## Files Updated

All datasets and client-side data files now include the 4 new fields:

- `datasets/campgrounds_signal_scored.json`
- `datasets/campgrounds_signal_scored_clean.json`
- `client/src/data/campgrounds.json`
- `client/src/data/top100_seo.json`
- `client/src/data/mvp_campgrounds.json`
- `client/src/data/campgrounds_osm_normalized.json`
- `client/src/data/geojson.json`
