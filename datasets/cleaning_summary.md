# Dataset Cleaning Summary

## Overview

Cleaned the SignalCamping dataset to remove individual campsites, invalid records, backcountry markers, and duplicates while preserving all legitimate campgrounds.

## Results

| Metric | Count |
|--------|-------|
| Original records | 3,114 |
| **Removed (total)** | **571** |
| **Final count** | **2,543** |

## Removal Breakdown

| Reason | Count | Description |
|--------|-------|-------------|
| Individual site | 244 | Names matching "Site", "Tent Pad", "Campsite", "Loop", etc. |
| Backcountry / group | 203 | Records with backcountry=true or group_only=true |
| Invalid name | 86 | Names shorter than 4 characters or number-only identifiers |
| OSM micro type | 0 | No records matched micro-feature types after other filters |
| Duplicate | 38 | Same name within 0.5 km (kept highest signal_quality_score) |

## Protection Rules Applied

Records were preserved if any of these conditions were true, even if they matched a removal pattern:

- Name contains "Campground", "State Park", "County Park", "National Forest", "Recreation Area", "KOA", or "Camp"
- Record is verified (is_verified = true)
- Operator contains "DNR", "National Park", "USFS", or "County"

Three verified State Park records with short names (B-1, B-2, B-3) were preserved by the protection rules.

## State Distribution After Cleaning

| State | Count |
|-------|-------|
| Wisconsin | 846 |
| Michigan | 763 |
| Pennsylvania | 584 |
| Ohio | 350 |

## Files Updated

- `datasets/campgrounds_signal_scored.json` (3,114 → 2,543)
- `datasets/campgrounds_signal_scored_clean.json` (3,114 → 2,543)
- `client/src/data/campgrounds.json` (2,913 → 2,464)
- `client/src/data/top100_seo.json` (2,913 → 2,464)
- `client/src/data/mvp_campgrounds.json` (482 → 479)
- `client/src/data/shareable_lists.json` (list counts updated)
