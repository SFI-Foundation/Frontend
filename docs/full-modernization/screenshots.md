# Before and after comparisons

Captured from the pinned baseline and proposed production builds using isolated Chromium/Flask fixtures. Catalog rows and accounts are explicitly synthetic QA data, never client records. Photos and organization content are unchanged.

## Home

| Before | After |
|---|---|
| ![Before Home](screenshots/before-guest-home-1440.png) | ![After Home](screenshots/after-guest-home-1440.png) |

## Specification Search (synthetic QA catalog)

| Before | After |
|---|---|
| ![Before Specification Search (synthetic QA catalog)](screenshots/before-guest-sfi-specs-1440.png) | ![After Specification Search (synthetic QA catalog)](screenshots/after-guest-sfi-specs-1440.png) |

## Settings

| Before | After |
|---|---|
| ![Before Settings](screenshots/before-admin-settings-1440.png) | ![After Settings](screenshots/after-admin-settings-1440.png) |

## Profile (synthetic account)

| Before | After |
|---|---|
| ![Before Profile (synthetic account)](screenshots/before-admin-sfi-profile-1440.png) | ![After Profile (synthetic account)](screenshots/after-admin-sfi-profile-1440.png) |

## Admin Dashboard (synthetic accounts/counts)

| Before | After |
|---|---|
| ![Before Admin Dashboard (synthetic accounts/counts)](screenshots/before-admin-admin-1440.png) | ![After Admin Dashboard (synthetic accounts/counts)](screenshots/after-admin-admin-1440.png) |

## Desktop navigation

| Before | After |
|---|---|
| ![Before Desktop navigation](screenshots/before-navigation-1440.png) | ![After Desktop navigation](screenshots/after-navigation-1440.png) |

## Mobile navigation

| Before | After |
|---|---|
| ![Before Mobile navigation](screenshots/before-navigation-375.png) | ![After Mobile navigation](screenshots/after-navigation-375.png) |

## Mobile Settings

| Before | After |
|---|---|
| ![Before Mobile Settings](screenshots/before-guest-settings-375.png) | ![After Mobile Settings](screenshots/after-guest-settings-375.png) |

## Dark theme and Spanish

![Settings in dark Spanish](screenshots/after-admin-settings-dark-es.png)

![Search in dark Spanish with synthetic catalog](screenshots/after-guest-sfi-specs-dark-es.png)

All five requested widths were exercised; complete captures are retained locally under `reports/full-modernization/`. The committed subset keeps this review focused. Automated rendering evidence is in `after-browser-results.json`, `integrated-results.json`, `account-results.json` and `console-results.json`.
