# SFI UI validation

Validation date: November 12, 2026 (America/Los_Angeles). Feature branch based on organization main `3e946491e`.

## Executed checks

| Check | Result | Evidence |
| --- | --- | --- |
| YAML parsing: production and development configuration | Pass | [YAML output](checks/yaml.log) |
| Full production Jekyll build | Pass: completed in 230.523 seconds | [Build summary](checks/build-summary.log); existing Gemfile and remote theme |
| `npm test` | Pass: 2 test files | [Frontend output](checks/frontend.log) |
| `npm run test:phase1` | Pass: 3 test files | [Phase 1 output](checks/phase1.log) |
| Direct search/account tests with test isolation disabled | Pass: 20 individual tests | [Search/account output](checks/search-account.log) |
| `npm run test:styles -- BUILT_SITE` | Pass: scoped Sass; 26 imports; gear/admin styling preserved | [Styles output](checks/styles.log) |
| Existing API configuration checks | Pass: local, Pages/custom host, explicit override and credentialed auth | [API configuration output](checks/api-config.log) |
| Existing authentication integration | Pass: 7 tests | [Integration output](checks/auth-integration.log) |
| Production publication/secret checks | Pass: 3 checks; final complete production output | [Artifact output](checks/public-artifact.log) |
| Existing generated path checks | Pass | [Existing path output](checks/existing-paths.log) |
| New public route/asset/anchor check | Pass: 145 targets, no missing links | [Link output](checks/links.json) |
| Chromium acceptance | Pass: 21 acceptance checks, five viewports, real API search and synthetic admin workflows | [Browser log](checks/browser.log), [structured results](browser-results.json) |
| axe WCAG A/AA | Pass: 18 scans, zero violations | [Structured results](browser-results.json) |
| Official approved PDF | Pass: exact URL opens in a separate tab; HTTP 200 and `%PDF-` bytes | [PDF browser output](checks/pdf-browser.log) |
| Diff whitespace check and JS syntax | Pass | `git diff --check`; `node --check` on search/browser scripts |

The direct test invocation was:

```sh
node --test --test-isolation=none scripts/test-sfi-spec-search.mjs scripts/test-sfi-account-routes.mjs
```

The existing `test-sfi-integration.mjs` ran the generated client against actual Flask authentication and a disposable SQLite fixture. The tool sandbox prohibited that fixture's Unix socket, so its supported WSGI pipe transport was used. The separate Chromium run used real localhost HTTP with the normal authorization decorators, cookies, and credentialed CORS.

## Browser coverage

Six pages (`/`, `/sfi-specs/`, `/about/`, `/services/`, `/news-events/`, `/login/`) were exercised at 1440×900, 1024×768, 768×1024, 390×844, and 320×720. All fit the viewport. The header measured 68px on desktop and 64px on mobile.

Acceptance includes:

- Exact specification numbers including slash qualifiers, equipment names, mixed case, and partial queries.
- All 111 active canonical identities across pagination without duplicates; previous-page focus return.
- Every actual backend category, category-grid shortcuts, and full reset.
- Loading/empty/error feedback and recovery after a controlled 503.
- Approved, rejected, missing, unsafe, and newly revoked document behavior. Revocation is a controlled response using an otherwise approved URL; no real approval is changed.
- Official approved PDF bytes and separate-tab navigation.
- Anonymous write 401, member write 403, synthetic admin validation/create/edit/archive/restore, and public/admin/explore switching.
- Safe GET query handoff from the homepage and compatible redirect destinations/query strings/canonicals.
- Keyboard skip link, mobile menu/Tab/Escape, category focus, and assistant focus return.
- Navigation without JavaScript, reduced motion, closed assistant controls removed from the focus order, and escaped assistant response markup.

Only the local API origin is overridden in the browser; catalog/search/filter responses come from the real Flask API. Negative transport, revocation, and assistant formatting cases use explicit controlled responses. The API requires the existing isolated-local-catalog health marker before the runner permits synthetic write tests. Actual specification rows are copied read-only to a new disposable database; synthetic records are confined there and archived after the successful run.

## Reproduction

The full build uses the supported Jekyll path, equivalent to the recipe behind `make public-review-build`:

```sh
JEKYLL_ENV=production bundle exec jekyll build --disable-disk-cache --destination /tmp/sfi-ui-verified
SFI_BUILT_SITE=/tmp/sfi-ui-verified npm run test:public-build
npm run test:styles -- /tmp/sfi-ui-verified
node scripts/test-sfi-api-config.mjs /tmp/sfi-ui-verified
python3 scripts/test-sfi-paths.py /tmp/sfi-ui-verified
python3 scripts/check-sfi-public-links.py /tmp/sfi-ui-verified
```

Browser testing is optional tooling, with Playwright and axe installed outside the project. `scripts/test-sfi-ui-overhaul.cjs` accepts `SFI_PLAYWRIGHT_MODULE`, `SFI_CHROMIUM`, `SFI_AXE_SOURCE`, `SFI_UI_URL`, `SFI_UI_BASELINE`, and `SFI_UI_API`. Set `SFI_UI_FETCH_PDF=1` for the official PDF network check. Set `SFI_UI_FUNCTIONAL_ONLY=1` to skip already-completed layout/screenshots/axe scans during diagnosis; it writes a separate report and does not claim those scans ran.

For this run, the unchanged source baseline was served at localhost:4100. Public route review used localhost:4600, and the final production artifact uses localhost:8080. The API used the existing backend `scripts/phase1_local.py` with a newly prepared `/tmp/sfi-ui-qa.db`, fictional demo accounts, and port 8427. No backend source or environment files were edited. Playwright, Chromium, and its temporary system-library directory were already available. Axe and the formatter were installed temporarily outside the project; package files are unchanged.

## Limits

Chromium was tested; Firefox/Safari, production authentication/writes, and NVDA/VoiceOver were not. Automated checks do not prove full WCAG conformance. The 200% check emulates 720×450 CSS pixels at scale 2, representing the reflow dimensions of a 1440×900 browser at 200%; it does not manipulate browser-toolbar zoom. The live assistant model service was not called. Existing unrelated post/permalink and Sass deprecation warnings remain in the full Jekyll build.
