# Verification and reproduction

Run frontend commands from `worktrees/full-modernization/Frontend` and backend commands from its sibling `Backend` unless shown otherwise. Existing frontend `node_modules`, ignored `Gemfile.lock`, installed Ruby gems and Python environments were reused. No dependency inputs changed.

## Build and frontend checks

```bash
JEKYLL_ENV=production bundle exec jekyll build --destination /tmp/sfi-modern-after-site
npm test
node --test --test-isolation=none scripts/test-sfi-profile.mjs scripts/test-sfi-onboarding.mjs scripts/test-sfi-gear.mjs scripts/test-sfi-settings.mjs scripts/test-sfi-preference-sync.mjs scripts/test-sfi-account-menu.mjs
npm run test:phase1
node --test --test-isolation=none scripts/test-sfi-spec-search.mjs scripts/test-sfi-settings.mjs scripts/test-sfi-preference-sync.mjs scripts/test-sfi-account-menu.mjs
SFI_BUILT_SITE=/tmp/sfi-modern-after-site npm run test:public-build
npm run test:redesign -- /tmp/sfi-modern-after-site
node scripts/test-sfi-gear-sass.mjs /tmp/sfi-modern-after-site
bundle exec ruby scripts/test-sfi-sass.rb /tmp/sfi-modern-after-site
node scripts/test-sfi-theme.mjs /tmp/sfi-modern-after-site
python3 scripts/check-sfi-public-links.py /tmp/sfi-modern-after-site
ruby scripts/test-sfi-demo-gates.rb
/home/ruhaanb622/sfi-foundation/SFI-Frontend/venv/bin/python -m unittest discover -s tests -v
```

| Check | Result |
|---|---|
| Full production Jekyll build | Pass; 41.468 seconds; baseline build also passed |
| `npm test` | Six test script files pass |
| Expanded primary unit invocation | 63 individual tests pass |
| Search/settings/sync/account detailed invocation | 48 tests pass |
| Phase 1 | Three script files pass; expanded 20 tests: 18 pass, two artifact tests skipped without `SFI_BUILT_SITE`; corresponding artifact checks run separately below |
| Public built artifact, photo variants/provenance, production search index | Seven tests pass; zero skips with `SFI_BUILT_SITE` |
| Redesign/photograph checks | 13 unique licensed photographs, six accessible linked cards, correct assets/destinations and compiled Sass pass |
| Scoped Sass JS and Ruby checks | All 31 current partials consumed, matching generated CSS, isolated legacy imports, 26 SFI documents pass |
| Current theme/route contract | 20 SFI pages, 328 asset references, 410 internal destinations pass |
| Additional public link/anchor audit | 446 targets; zero errors |
| Development demo gates | Default-off, boolean validation and production rejection pass |
| Notebook/DOCX | Six tests pass using the existing frontend Python environment |

## Backend checks

```bash
PYTHON_DOTENV_DISABLED=1 SFI_DATABASE_URI=sqlite:// MPLCONFIGDIR=/tmp/sfi-modern-matplotlib \
  /home/ruhaanb622/sfi-foundation/SFI-Backend/venv/bin/python -m unittest discover -s tests -v
PYTHON_DOTENV_DISABLED=1 SFI_DATABASE_URI=sqlite:// MPLCONFIGDIR=/tmp/sfi-modern-matplotlib \
  /home/ruhaanb622/sfi-foundation/SFI-Backend/venv/bin/python -m unittest discover -s testing -p 'test_sfi_*.py' -v
/home/ruhaanb622/sfi-foundation/SFI-Backend/venv/bin/python testing/test_sfi_profile.py
```

84 regression tests pass, with three explicitly MySQL-only skips in the SQLite run. The config/PDF suite runs 18 tests: 17 pass and one intentionally skips the profile module because it must be run directly. The direct isolated profile/account/onboarding/settings runner passes all 22 tests. Final hygiene-branch reruns also pass; backend runtime files are identical to main.

Disposable MySQL 8.4 verification used a **new** `sfi-modern-qa-20261119` container bound only to localhost port 13376, without existing volumes. A random generated password was kept in a mode-600 temporary env file and never printed or committed. A local orchestration script created only `sfi_preferences_qa_modernization` and `sfi_phase1_qa_modernization`.

```bash
/home/ruhaanb622/sfi-foundation/SFI-Backend/venv/bin/python /tmp/sfi-modern-mysql-check.py
```

The script supplies each test child with `SFI_QA_MYSQL_URI` through its environment. Do not copy production database settings. The profile runner's explicit localhost/port/schema guards and catalog test's QA schema guards remain enabled. Results: **22 account tests pass on MySQL; all three catalog migration/import/archive/concurrency tests pass.** The temporary orchestration file is local QA infrastructure, not an application dependency. The container is stopped after verification.

## Browser commands

The runner reads the built files, blocks external services, and forwards browser cookie-bearing requests to real Flask HTTP over a Unix socket. Flask runs only in a temporary source copy with disposable synthetic data. No application `.env` or existing database is loaded. The baseline uses `/tmp/sfi-modern-before-site` and `--baseline`; the final run uses `/tmp/sfi-modern-after-site`.

The existing environment requires these local browser package/library paths:

```bash
export LD_LIBRARY_PATH=/tmp/sfi-account-libs/usr/lib/x86_64-linux-gnu
export PLAYWRIGHT_MODULE=/tmp/sfi-account-tools/node_modules/playwright
export AXE_MODULE=/tmp/sfi-account-tools/node_modules/@axe-core/playwright
export CHROME_PATH=/home/ruhaanb622/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome
BACKEND_PY=/home/ruhaanb622/sfi-foundation/SFI-Backend/venv/bin/python
EVIDENCE=/home/ruhaanb622/sfi-foundation/reports/full-modernization
node scripts/test-sfi-modernization-browser.mjs "$BACKEND_PY" ../Backend /tmp/sfi-modern-before-site "$EVIDENCE/before" --baseline
node scripts/test-sfi-modernization-browser.mjs "$BACKEND_PY" ../Backend /tmp/sfi-modern-after-site "$EVIDENCE/after"
node scripts/test-sfi-integrated-browser.mjs "$BACKEND_PY" ../Backend /tmp/sfi-modern-after-site "$EVIDENCE/integration"
SFI_ACCOUNT_SMOKE=responsive node scripts/test-sfi-account-browser.mjs "$BACKEND_PY" ../Backend /tmp/sfi-modern-after-site "$EVIDENCE/account-details"
SFI_SETTINGS_WIDTHS=1440,320 node scripts/test-sfi-settings-browser.mjs "$BACKEND_PY" ../Backend /tmp/sfi-modern-after-site "$EVIDENCE/settings-details"
node scripts/test-sfi-console-browser.mjs "$BACKEND_PY" ../Backend /tmp/sfi-modern-after-site "$EVIDENCE/console"
SFI_AXE_CORE=/tmp/sfi-account-tools/node_modules/axe-core/axe.min.js \
  node scripts/test-sfi-theme-contrast-browser.mjs /tmp/sfi-modern-after-site
```

| Browser check | Result |
|---|---|
| Baseline | 210 responsive checks across three roles; zero uncaught JS errors; comparison screenshots |
| Final guest/member/admin matrix | 210 responsive checks at 375, 768, 1024, 1440, 1920px; zero overflow; role visibility and unique IDs pass |
| axe WCAG 2 A/AA and 2.1 AA | 84 route/session/light-English/dark-Spanish scans; zero violations |
| Complete integration | Eight workflows; 286 theme/accent cases; 13 localization checks with zero known untranslated strings; 13 additional axe scans with zero violations; five widths including 320px |
| Account detail suite | 1440 and 375px; real cookie login/logout/expiry, retries, cross-tab updates, profile/onboarding guards and eight header theme/language scans per width pass |
| Settings detail suite | 1440 and 320px; all accents/themes, readability/focus, search, safe import/export, guest reset and real member/admin flows pass |
| Gear/detector status contrast | 56 axe color-contrast scans pass |
| Browser console | 42 role/route checks; zero unexpected console errors and zero uncaught page errors. 66 expected handled resource/auth/offline-model diagnostics recorded separately because external services are intentionally blocked. |

## Failures investigated and limitations

- Restricted execution initially blocked remote-theme DNS and browser Unix sockets; the same commands passed with appropriate environment access. Chromium needed its already available local shared-library directory.
- A first style invocation omitted its required build path, and a first public-build invocation used a positional path instead of `SFI_BUILT_SITE`; corrected invocations pass.
- Browser tests were adapted to the real new section/secondary navigation without dropping authentication, revision, role or PDF assertions. The focused contrast helper now correctly reads CSS `color(srgb ...)` emitted by `color-mix`; its 4.5 contrast threshold is unchanged.
- The old theme assertion expected a blue/yellow navbar, absent components and no dark mode. It now checks the requested design's runtime accent tokens, actual shared components, dark theme, five links and all its existing destination/alias/classroom preservation checks. Ruby scope checks recognize the existing `html[data-sfi-*] .sfi-site` preference scopes. Sass comparison still compares the whole generated CSS after normalizing only font-family quote serialization differences.
- A system-Python notebook run lacked `progress`; the existing frontend environment contains the declared dependencies and passes. No application dependency was added.
- Parallel Python startup briefly exceeded a 30-second fixture timeout; the Settings runner now permits 90 seconds for startup. This does not relax behavior/security assertions.
- Automated axe/keyboard checks do not substitute for manual screen-reader or physical-device testing. Camera hardware/inference, live third-party model loading, official external PDF availability and production credentials/data were not exercised.
- Existing Jekyll/Sass and SQLAlchemy/datetime warnings remain. Deliberate failure-injection tests log handled errors. No failed product regression is being presented as a pass.

Raw logs remain under `/tmp/sfi-modern-*.log`; selected sanitized JSON results and screenshots are committed alongside this file. No credentials, real customer records or raw application log contents are included.
