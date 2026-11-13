# Four-page SFI validation

Current scope: Home/About, Spec Search, History, Contact & Location. The earlier draft PR is closed; no new PR is requested.

| Check | Actual result | Evidence |
| --- | --- | --- |
| YAML configuration | Valid production and development YAML | [YAML log](checks/yaml.log) |
| Full production build | Pass, 252.053 seconds | [Build summary](checks/build-summary.log) |
| `npm test` | 2 test files pass | [Frontend log](checks/frontend.log) |
| `npm run test:phase1` | 3 test files pass | [Phase 1 log](checks/phase1.log) |
| Direct search/account tests | 20 individual tests pass | [Search/account log](checks/search-account.log) |
| Scoped Sass and account/admin styles | Pass, 24 imports | [Styles log](checks/styles.log) |
| API origin and credential settings | Pass | [API configuration log](checks/api-config.log) |
| Authentication integration | 7 tests pass, actual Flask WSGI over supported pipe transport | [Integration log](checks/auth-integration.log) |
| Publication and credential safeguards | 3 checks pass on the complete artifact | [Artifact log](checks/public-artifact.log) |
| Existing links/assets check | 15 pages, 208 targets, pass | [Path log](checks/existing-paths.log) |
| Public links and fragments | 143 targets, zero errors | [Link results](checks/links.json) |
| Chromium responsive/menu/search/access checks | Pass at all five requested sizes | [Browser log](checks/browser.log), [structured results](browser-results.json) |
| axe WCAG A/AA | 15 scans, zero violations | [Structured results](browser-results.json) |
| Restored normal preview | Correct four-link menu, SFI CSS only, SFI 16.1 found through the real local backend | [Live preview log](checks/live-preview.log) |

The browser run covers all four public pages and account access at 1440×900, 1024×768, 768×1024, 390×844, and 320×720. It checks that only SFI CSS and the standalone OCS menu load, all four menu entries match configuration, menu Escape/focus/link behavior works, pages have no overflow, and the menu remains usable without JavaScript.

Real localhost HTTP checks cover all 111 active canonical specifications without duplicate pagination, all actual categories, exact/qualified/product/mixed-case searches, approved/unapproved/missing PDF gating, empty results, controlled 503 recovery, retired-page redirects, query preservation, and member/admin separation. Only API origin selection and the explicit negative transport case are intercepted; normal catalog responses come from Flask. Synthetic account cookies and data remain in the existing disposable QA database. Backend source and the working database were not changed.

The complete build's reviewed pages, menu JavaScript, and SFI CSS were compared byte-for-byte with the public preview artifact. The existing local preview was reloaded because its old running process retained stale navigation configuration.

Reproduction:

```sh
JEKYLL_ENV=production bundle exec jekyll build --disable-disk-cache --destination /tmp/sfi-four-final
npm test
npm run test:phase1
node --test --test-isolation=none scripts/test-sfi-spec-search.mjs scripts/test-sfi-account-routes.mjs
npm run test:styles -- /tmp/sfi-four-final
SFI_BUILT_SITE=/tmp/sfi-four-final npm run test:public-build
node scripts/test-sfi-api-config.mjs /tmp/sfi-four-final
python3 scripts/test-sfi-paths.py /tmp/sfi-four-final
python3 scripts/check-sfi-public-links.py /tmp/sfi-four-final
```

The optional browser runner is `scripts/test-sfi-ui-overhaul.cjs`. It uses `SFI_UI_URL`, `SFI_UI_API`, `SFI_PLAYWRIGHT_MODULE`, `SFI_CHROMIUM`, and `SFI_AXE_SOURCE`. The API must identify itself as the existing isolated local catalog sandbox. For this run the reviewed site was localhost:4600 and the disposable API was localhost:8427. The user's normal preview remains localhost:4500.

Limits: Chromium only; automated scans do not prove full accessibility conformance. Manual screen-reader and native browser-toolbar zoom testing were not performed. The inherited full build still emits unrelated legacy warnings. The older PDF-opening log is historical evidence from the preceding iteration; the current browser run checks the unchanged PDF approval guard rather than downloading an official PDF again.
