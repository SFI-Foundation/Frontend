# SFI navigation and content validation

Current top tabs: Home, Spec Search, History, News & Events, Contact, Sign In. Home includes Services & Programs; the Sign In/Create Account page is preserved. The earlier draft PR is closed; no new PR is requested.

| Check | Actual result | Evidence |
| --- | --- | --- |
| YAML configuration | Valid production and development YAML | [YAML log](checks/yaml.log) |
| Full production build | Pass, 270.979 seconds | [Build summary](checks/build-summary.log) |
| `npm test` | 2 test files pass | [Frontend log](checks/frontend.log) |
| `npm run test:phase1` | 3 test files pass | [Phase 1 log](checks/phase1.log) |
| Direct search/account tests | 20 individual tests pass | [Search/account log](checks/search-account.log) |
| Scoped Sass and account/admin styles | Pass, 24 imports | [Styles log](checks/styles.log) |
| API origin and credential settings | Pass | [API configuration log](checks/api-config.log) |
| Authentication integration | 7 tests pass, actual Flask WSGI over supported pipe transport | [Integration log](checks/auth-integration.log) |
| Publication and credential safeguards | 3 checks pass on the current complete artifact | [Artifact log](checks/public-artifact.log) |
| Existing links/assets check | 15 pages, 225 targets, pass | [Path log](checks/existing-paths.log) |
| Public links and fragments | 155 targets, zero errors | [Link results](checks/links.json) |
| Chromium responsive/menu/search/access checks | Pass at all five requested sizes | [Browser log](checks/browser.log), [structured results](browser-results.json) |
| axe WCAG A/AA | 18 scans, zero violations | [Structured results](browser-results.json) |
| Restored normal preview | Six visible top links, SFI CSS only, and SFI 16.1 through the real local backend | [Live preview log](checks/live-preview.log) |

The browser run covers all five content pages and Sign In at 1440×900, 1024×768, 768×1024, 390×844, and 320×720. It checks that only SFI CSS loads, all six links match configuration, desktop navigation stays visible in one horizontal row, no side menu or menu script exists, keyboard navigation works, pages have no overflow, and navigation works without JavaScript.

Real localhost HTTP checks cover all 111 active canonical specifications without duplicate pagination, all actual categories, exact/qualified/product/mixed-case searches, approved/unapproved/missing PDF gating, empty results, controlled 503 recovery, retired-page redirects, query preservation, and member/admin separation. Only API origin selection and the explicit negative transport case are intercepted; normal catalog responses come from Flask. Synthetic account cookies and data remain in the existing disposable QA database. Backend source and the working database were not changed.

The complete build's reviewed pages, navigation markup, and SFI CSS were compared byte-for-byte with the public preview artifact. The existing local preview was reloaded because its old running process retained stale navigation configuration.

Reproduction:

```sh
JEKYLL_ENV=production bundle exec jekyll build --disable-disk-cache --destination /tmp/sfi-news-final
npm test
npm run test:phase1
node --test --test-isolation=none scripts/test-sfi-spec-search.mjs scripts/test-sfi-account-routes.mjs
npm run test:styles -- /tmp/sfi-news-final
SFI_BUILT_SITE=/tmp/sfi-news-final npm run test:public-build
node scripts/test-sfi-api-config.mjs /tmp/sfi-news-final
python3 scripts/test-sfi-paths.py /tmp/sfi-news-final
python3 scripts/check-sfi-public-links.py /tmp/sfi-news-final
```

The optional browser runner is `scripts/test-sfi-ui-overhaul.cjs`. It uses `SFI_UI_URL`, `SFI_UI_API`, `SFI_PLAYWRIGHT_MODULE`, `SFI_CHROMIUM`, and `SFI_AXE_SOURCE`. The API must identify itself as the existing isolated local catalog sandbox. For this run the reviewed site was localhost:4600 and the disposable API was localhost:8427. The user's normal preview remains localhost:4500.

Limits: Chromium only; automated scans do not prove full accessibility conformance. Manual screen-reader and native browser-toolbar zoom testing were not performed. The inherited full build still emits unrelated legacy warnings. The older PDF-opening log is historical evidence from the preceding iteration; the current browser run checks the unchanged PDF approval guard rather than downloading an official PDF again.

The latest content/contrast revision preserves the white background and top menu. Yellow text uses `#ffe082`, with computed contrast of 5.00:1 on `#1a5fa8` and 7.84:1 on `#124080`. The same 18 axe scans pass after the change. Content remains deliberately concise; current per-page dimensions are recorded in browser-results.json.

The new acceptance check confirms Home contains equipment testing, quality assurance, and training; News & Events renders sourced official links without redirecting; and the top Sign In entry reaches the existing username/password form and working Create Account tab. The earlier news-to-contact redirect was removed; the services alias now points to the Home services section.
