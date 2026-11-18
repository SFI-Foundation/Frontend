# Preferences evidence

- `verification-summary.json`: actual test counts, environment and limitations.
- `browser-matrix.json`: 286 computed-style/responsive checks and 13 axe scans;
  all five widths passed with no JavaScript errors or reported axe violations.
- `browser-workflows.json`: final delivery-build smoke, including two contexts,
  profile persistence, save failures/conflicts, keyboard gear/dialog access,
  registration, unprivileged manufacturer onboarding and offline guest recovery.
  Its matrix is intentionally skipped because the full matrix is recorded separately.
- `source-asset-sha256.json`: delivery runtime JS matches checked source exactly.
- `localization-coverage.json`: 770 English/Spanish keys, partial-preview counts,
  per-route static coverage and intentional exclusions. Dynamic paths have separate
  browser/unit evidence; this is not a percentage claim about source documents.
- `color-inventory.json`: classified SFI source color findings. Palettes, official
  branding, inverted photography/camera surfaces and fixed status hues are retained;
  focus rings, information badges and general interactive UI use semantic tokens.
- `spanish-dark-settings.png` and `spanish-home-mobile.png`: synthetic signed-in
  account, Spanish, dark/purple and accessibility preferences at mobile width.

All accounts and data are synthetic. No secrets, cookies, tokens, databases,
backups or production logs are included. Browser requests were routed to an
isolated real Flask HTTP server, never the existing local or production API.
Native file-picker/validation text follows the browser locale. Screen-reader
usability, physical phones and production host configuration require human review.
