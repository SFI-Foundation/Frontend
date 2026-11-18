# Preferences evidence

- `verification-summary.json`: actual test counts, environment and limitations.
- `browser-matrix.json`: 286 computed-style/responsive checks and 13 axe scans;
  all five widths passed with no JavaScript errors or reported axe violations.
- `browser-workflows.json`: final delivery-build workflows, including two contexts,
  profile persistence, save failures/conflicts, keyboard gear/dialog access,
  registration, unprivileged manufacturer onboarding and offline guest recovery.
  These workflows and the full matrix passed in the same final run.
- `source-asset-sha256.json`: all 20 non-templated SFI runtime JS assets in the tested build match checked source exactly; the API-base module is rendered by Liquid.
- `localization-coverage.json`: 778 English/Spanish keys, partial-preview counts,
  per-route static text/accessible-attribute coverage and intentional exclusions. Dynamic paths have separate
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

The color inventory contains 306 findings across SFI Sass, JavaScript, navigation pages, layout and includes. The disconnected legacy styles include remains explicitly classified.

The older Ruby Sass audit still fails on the pre-existing unused `_sass/sfi/components/_chatbot.scss`. Active scoped Sass and redesign checks pass. This failure is recorded in `verification-summary.json`, not counted as a pass.
