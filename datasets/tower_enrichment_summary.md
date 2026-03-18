# Tower-Based Coverage Enrichment Summary

**Date:** March 17, 2026
**Input:** 108,705 real cell tower records (AT&T + T-Mobile)
**Campgrounds processed:** 3,114

## Overview

This enrichment replaced modeled AT&T and T-Mobile coverage estimates with real tower-based coverage computed from the OpenCelliD tower dataset. Verizon coverage was preserved unchanged. Signal scores and remote work scores were recomputed based on the updated carrier counts.

## Tower Data

| Carrier | MNC Codes | Towers Loaded |
|---------|-----------|---------------|
| AT&T | 410, 560 | 48,269 |
| T-Mobile | 260, 250, 240 | 60,436 |
| **Total** | | **108,705** |

## Coverage Rules Applied

| Environment | Detection Criteria | Radius |
|-------------|-------------------|--------|
| Suburban | Distance to town < 5 miles | 15 km |
| Rural (default) | Standard campground | 12 km |
| Forest/Backcountry | backcountry=true, group_only=true, or operator contains "DCNR" | 6 km |

Backcountry campgrounds used 750m buffer multi-point sampling (9 sample points) for more accurate coverage assessment.

## Before vs After Comparison

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Verizon coverage | 1,798 (57.7%) | 1,798 (57.7%) | +0 (preserved) |
| AT&T coverage | 1,396 (44.8%) | 1,444 (46.4%) | +48 |
| T-Mobile coverage | 1,287 (41.3%) | 1,433 (46.0%) | +146 |
| Avg signal score | 50.4 | 51.9 | +1.5 |

## Carrier Count Distribution

| Carriers Available | Count | Percentage |
|-------------------|-------|------------|
| 0 carriers | 907 | 29.1% |
| 1 carrier | 708 | 22.7% |
| 2 carriers | 530 | 17.0% |
| 3 carriers | 969 | 31.1% |

## State-Level Coverage

| State | Total | Verizon | AT&T | T-Mobile |
|-------|-------|---------|------|----------|
| Michigan | 958 | 459 (48%) | 335 (35%) | 300 (31%) |
| Ohio | 387 | 336 (87%) | 251 (65%) | 250 (65%) |
| Pennsylvania | 766 | 578 (75%) | 531 (69%) | 505 (66%) |
| Wisconsin | 1,003 | 425 (42%) | 327 (33%) | 378 (38%) |

## Urban vs Remote Validation

| Category | Count | Avg Carriers | Avg Signal Score |
|----------|-------|-------------|-----------------|
| Urban (< 5mi to town) | 275 | 2.73 | 83.5 |
| Remote (> 50mi to town) | 504 | 0.81 | 33.4 |

The results confirm expected patterns: urban campgrounds near towns have significantly higher carrier counts and signal scores, while remote campgrounds show lower coverage as expected.

## Signal Score Mapping

| Carrier Count | Signal Score |
|--------------|-------------|
| 0 | 10 |
| 1 | 40 |
| 2 | 70 |
| 3 | 90 |

## Files Updated

- `datasets/campgrounds_signal_scored.json` — Full enriched dataset (3,114 records)
- `datasets/campgrounds_signal_scored_clean.json` — Clean copy for ranking pages
- `client/src/data/campgrounds.json` — Frontend data file (2,913 records matched and updated)
