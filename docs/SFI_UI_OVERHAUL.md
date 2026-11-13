# SFI UI overhaul maintenance

The public site uses the SFI layout, a white content background, blue navigation
and headings, and yellow text accents. The six navigation destinations are Home,
Spec Search, History, News & Events, Contact, and Sign In. Home contains the
organization overview and Services & Programs; Sign In includes Create Account.

## Templates and styling

- [`_config.yml`](../_config.yml) orders navigation through `minima.nav_pages`.
  [`ocs-menu.html`](../_includes/nav/ocs-menu.html) renders these links.
- [`sfi.html`](../_layouts/sfi.html) loads the SFI stylesheet and
  [`navigation.js`](../assets/js/sfi/navigation.js). The mobile menu supports
  keyboard opening, Escape with focus return, and outside-click closing.
  Navigation links remain available without JavaScript.
- [`_tokens.scss`](../_sass/sfi/_tokens.scss) centralizes colors, spacing and
  breakpoints. [`_main.scss`](../_sass/sfi/_main.scss) assembles scoped styles.
  Keep public pages on the SFI stylesheet and preserve account/admin styles.
- The shared layout provides a skip link and main landmark. Preserve visible
  focus, reduced-motion handling, form labels, and live status/error feedback.

[`sfi-redirect.html`](../_layouts/sfi-redirect.html) preserves legacy routes,
queries and section bookmarks. `/about/` reaches Home, `/services/` reaches
`/#services`, and `/specs/` and `/search/` reach `/sfi-specs/`. Old home and blog
entry points also redirect to Home. Preserve these aliases when editing pages.

## Search, accounts and content

[`spec-search.js`](../assets/js/sfi/spec-search.js) renders the canonical Flask
catalog with query/category filtering, pagination, and loading/error/retry/empty
states. PDF actions require verified current documents on approved official
HTTPS URLs. Keep canonical identities, approval/revocation rules, and member/admin
separation intact. The UI does not replace backend authorization.

[`login.md`](../navigation/login.md) retains Sign In, Create Account and profile
flows. The footer updates the profile link through the existing authentication
API. API origin selection remains in the existing API configuration modules;
credentialed requests and deployment safeguards must be preserved. See the
[Phase 1 guide](sfi-phase1.md) for catalog and backend validation.

[`sfi_updates.json`](../_data/sfi_updates.json) supplies sourced announcements and
meeting dates. News & Events displays three announcements and filters meetings
against the build date. Update source data rather than hardcoding event dates.

## Photography

Home contains the racing hero and safety photograph; Spec Search, History and
News & Events each contain one supporting photograph. The navbar uses the
original SFI logo. All five photographs remain visible on mobile.

[`photograph.html`](../_includes/sfi/photograph.html) renders local responsive
WebP sources and JPEG fallbacks from
[`sfi_photography.yml`](../_data/sfi_photography.yml). Keep every width listed in
the data, the fallback JPEG, meaningful alt text and intrinsic dimensions. The
hero loads eagerly with high priority; other photographs load lazily.

The [license notice](../images/sfi/PHOTOGRAPHY.md) and
[image manifest](site-photography/image-manifest.json) retain source attribution,
original hashes, crop rectangles, dimensions and derivative hashes. The shared
data contains source and permanent license evidence links. When replacing an
image, update these records and the data together. Preserve the public
[credits page](../navigation/photo-credits.md), caption/footer links and exact
image licenses, including share-alike terms separately from the code license.

## Validation

Install the Gemfile dependencies and Node dev dependencies. With a supported
Node version (the commands below use `--test-isolation=none`), run from the repo:

```sh
JEKYLL_ENV=production bundle exec jekyll build --disable-disk-cache --destination /tmp/sfi-ui-build
npm test
SFI_BUILT_SITE=/tmp/sfi-ui-build npm run test:phase1
SFI_BUILT_SITE=/tmp/sfi-ui-build npm run test:public-build
node --test --test-isolation=none scripts/test-sfi-spec-search.mjs scripts/test-sfi-account-routes.mjs
npm run test:styles -- /tmp/sfi-ui-build
node scripts/test-sfi-api-config.mjs /tmp/sfi-ui-build
python3 scripts/test-sfi-paths.py /tmp/sfi-ui-build
python3 scripts/check-sfi-public-links.py /tmp/sfi-ui-build
git diff --check
```

Optional Chromium acceptance uses Playwright and axe installed as local QA tools.
Serve the build at `SFI_UI_URL` (default `http://localhost:4600`). Set
`SFI_PLAYWRIGHT_MODULE`, `SFI_CHROMIUM`, and `SFI_AXE_SOURCE` to the installed
module, browser and axe script. For the main suite, set `SFI_UI_API` (default
`http://localhost:8427`) to the backend's disposable `scripts/phase1_local.py`
catalog with demo accounts. It must return the `isolated-local-catalog` health
marker. Use disposable fixtures for account and administrative checks.
The photography and form-state suites use the built site's normal API origin
(locally `http://localhost:8605`); `SFI_UI_API` overrides only the main suite.

```sh
node scripts/test-sfi-ui-overhaul.cjs
node scripts/test-sfi-ui-polish-states.cjs
node scripts/test-sfi-site-photography.cjs
node scripts/test-sfi-integration.mjs BACKEND_PYTHON BACKEND_DIRECTORY /tmp/sfi-ui-build
```

The browser suites cover responsive navigation, search and document actions,
account form states, photography/loading and automated accessibility. Check
1440, 1024, 768, 390 and 320px layouts. Automated scans supplement manual keyboard,
screen-reader and cross-browser review.

Browser suites create their output directories automatically under ignored
`qa-evidence/ui-overhaul/`, `qa-evidence/ui-polish/`, and
`qa-evidence/site-photography/`. `SFI_UI_OUTPUT` overrides the first two;
`SFI_PHOTO_OUTPUT` overrides photography output. Keep logs, screenshots, traces
and temporary reports there or in `/tmp`; do not commit them under `docs/`.
The existing Jekyll configuration excludes `qa-evidence/` and `docs/` from
publication. Keep the provenance manifest tracked.
