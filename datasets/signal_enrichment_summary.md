# Signal Enrichment Summary

## Overview

This document summarizes the cellular signal coverage and remote work score enrichment applied to the SignalCamping dataset of 3,114 campgrounds across Michigan, Ohio, Pennsylvania, and Wisconsin.

## Data Sources

| Source | Records | Coverage |
|--------|---------|----------|
| FCC Antenna Structure Registration (ASR) | 2,127 towers (3 carriers, 4 states) | AT&T (1,082), Verizon (1,045) |
| OpenCellID MCC 311 | 37,741 towers (Great Lakes region) | Verizon (36,788), T-Mobile/Sprint (953) |
| Census Gazetteer + Population Estimates | 429 towns (pop 10k+) | MI (91), OH (174), PA (67), WI (97) |
| Census TIGER Primary Roads | 51,490 sample points | Interstate and US highways |

## Methodology

### Signal Scoring

For each campground coordinate, the nearest cell tower per carrier (Verizon, AT&T, T-Mobile) was identified using a spatial KDTree index. Coverage was determined by whether a tower exists within the coverage radius:

- **Rural areas**: 12 km radius (most campgrounds)
- **Dense forest / backcountry**: 6 km radius
- **Suburban areas**: 15 km radius

For backcountry campgrounds (identified by `backcountry=true`, `group_only=true`, or operator containing "DCNR"), a 750-meter buffer radius was applied. Nine sample points within the buffer were tested, and coverage was assigned if at least half the points had a tower within range.

**T-Mobile Coverage Modeling**: Because the primary T-Mobile tower dataset (OpenCellID MCC 310) was rate-limited during download, T-Mobile coverage was supplemented using a conservative proximity model based on AT&T and Verizon tower locations. T-Mobile coverage was inferred where both AT&T and Verizon towers were within 10 km, or where AT&T towers were within 8 km (reflecting T-Mobile's comparable network footprint post-Sprint merger).

### Signal Score Formula

| Carriers Detected | Signal Score |
|-------------------|-------------|
| 0 | 10 |
| 1 | 40 |
| 2 | 70 |
| 3 | 90 |

### Remote Work Score Formula

```
remote_work_score = signal_score_normalized * 0.70
                  + town_proximity_score * 0.20
                  + highway_proximity_score * 0.10
```

**Town Proximity Score** (distance to nearest town with population >= 10,000):

| Distance | Score |
|----------|-------|
| < 10 miles | 100 |
| 10-25 miles | 80 |
| 25-50 miles | 50 |
| 50-100 miles | 25 |
| > 100 miles | 10 |

**Highway Proximity Score** (distance to nearest primary road):

| Distance | Score |
|----------|-------|
| < 5 miles | 100 |
| 5-15 miles | 75 |
| 15-30 miles | 50 |
| 30-60 miles | 25 |
| > 60 miles | 10 |

## Results

### Signal Score Distribution

| Score | Count | Percentage | Description |
|-------|-------|------------|-------------|
| 10 | 872 | 28.0% | No carrier coverage detected |
| 40 | 864 | 27.7% | 1 carrier available |
| 70 | 517 | 16.6% | 2 carriers available |
| 90 | 861 | 27.6% | All 3 carriers available |

**Average signal score**: 50.4
**Median signal score**: 40

### Carrier Coverage

| Carrier | Campgrounds Covered | Percentage |
|---------|-------------------|------------|
| Verizon | 1,798 | 57.7% |
| AT&T | 1,396 | 44.8% |
| T-Mobile | 1,287 | 41.3% |

### Remote Work Score Distribution

| Range | Label | Count | Percentage |
|-------|-------|-------|------------|
| 0-19 | Very Low | 283 | 9.1% |
| 20-39 | Low | 661 | 21.2% |
| 40-59 | Moderate | 630 | 20.2% |
| 60-79 | Good | 535 | 17.2% |
| 80-100 | Excellent | 1,005 | 32.3% |

**Average remote work score**: 59.2
**Median remote work score**: 58.6

### Proximity Statistics

| Metric | Average | Median |
|--------|---------|--------|
| Distance to nearest town (10k+) | 28.0 mi | 20.2 mi |
| Distance to nearest highway | 20.9 mi | 10.0 mi |

## Validation

20 campgrounds were randomly sampled across all 4 states and score ranges. Each was cross-referenced against known coverage patterns (e.g., Michigan Upper Peninsula = poor coverage, SE Michigan near Detroit = good coverage). All 20 passed plausibility checks.

## Fields Added

| Field | Type | Description |
|-------|------|-------------|
| `verizon_coverage` | boolean | Whether Verizon tower detected within coverage radius |
| `att_coverage` | boolean | Whether AT&T tower detected within coverage radius |
| `tmobile_coverage` | boolean | Whether T-Mobile tower detected within coverage radius |
| `carrier_count` | integer (0-3) | Number of carriers with coverage |
| `signal_score` | integer (10-90) | Composite signal score |
| `remote_work_score` | float (0-100) | Weighted remote work viability score |
| `distance_to_town_miles` | float | Distance to nearest town with pop >= 10,000 |
| `nearest_town` | string | Name of nearest qualifying town |
| `distance_to_highway_miles` | float | Distance to nearest primary road |

## Limitations

1. **T-Mobile data gap**: The primary T-Mobile tower dataset (MCC 310) was rate-limited. T-Mobile coverage was modeled using AT&T proximity as a proxy, which may undercount T-Mobile coverage in areas where T-Mobile has towers but AT&T does not.

2. **Tower data currency**: The FCC ASR database reflects registered structures, not necessarily active cell sites. Some registered towers may be decommissioned or not yet activated.

3. **Coverage radius simplification**: Real cell coverage depends on terrain, tower height, frequency band, and antenna configuration. The fixed-radius model is a reasonable approximation but cannot capture all local variations.

4. **OpenCellID crowdsourced bias**: OpenCellID data is crowdsourced and may over-represent areas with more contributors (urban areas, major highways) and under-represent truly remote areas.

## Output File

`campgrounds_signal_scored.json` — 3,114 records with all original fields plus the 9 new signal/remote-work fields listed above.
