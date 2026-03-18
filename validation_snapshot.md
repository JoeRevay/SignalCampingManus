# Signal Dataset Validation Snapshot

**Source:** `datasets/campgrounds_signal_scored.json`
**Date:** March 17, 2026
**Mode:** Read-only (no modifications)

## Summary Stats

| Metric | Value |
|--------|-------|
| Total campgrounds | 3,114 |
| AT&T coverage | 1,444 (46.4%) |
| T-Mobile coverage | 1,433 (46.0%) |
| Verizon coverage | 1,798 (57.7%) |
| Average signal score | 51.9 |

## Carrier Count Distribution

| Carriers Available | Count | Percentage |
|-------------------|-------|------------|
| 0 carriers | 907 | 29.1% |
| 1 carrier | 708 | 22.7% |
| 2 carriers | 530 | 17.0% |
| 3 carriers | 969 | 31.1% |

## Specific Validation: Roundup Lake Campground

| Field | Value |
|-------|-------|
| State | OH |
| verizon_coverage | true |
| att_coverage | true |
| tmobile_coverage | true |
| carrier_count | 3 |
| signal_score | 90 |
| remote_work_score | 89.5 |

## Random Sample (10 Campgrounds)

| Campground | State | Verizon | AT&T | T-Mobile | Signal Score |
|-----------|-------|---------|------|----------|-------------|
| South Manistique Lake State Forest Campground | MI | N | Y | Y | 70 |
| C4 | MI | Y | Y | Y | 90 |
| 28E | WI | N | Y | Y | 70 |
| Willow River State Park Campground | WI | N | N | N | 10 |
| Fred C. Andersen Scout Camp | WI | N | N | N | 10 |
| Eastwood Recreation Area Campground | WI | N | N | N | 10 |
| Deer Meadow Campground | PA | N | N | N | 10 |
| Camp Lavigne | PA | Y | N | N | 40 |
| Wild Goose City Park | WI | Y | Y | Y | 90 |
| Brule River State Forest Backcountry Camping | WI | N | N | N | 10 |
