# Final UI polish validation

Run locally on 2026-11-12. Baseline `10e95f0c6`; branch `feature/sfi-final-ui-polish`.

| Check | Actual result | Evidence |
| --- | --- | --- |
| Ruby YAML safe-load of both configuration files | Passed | [yaml.log](checks/yaml.log) |
| `JEKYLL_ENV=production bundle exec jekyll build --disable-disk-cache --destination /tmp/sfi-polish-final` | Full output generated in 415.099 seconds | [build.log](checks/build.log) |
| Final Jekyll verification with `--incremental --disable-disk-cache` against the same complete destination | Passed; 337.519 seconds; explicit exit status 0 | [build-verification.log](checks/build-verification.log) |
| `npm test` | 22 tests passed | [unit.log](checks/unit.log) |
| `npm run test:phase1` | Passed; build-dependent checks skipped in this source-only invocation and run separately below | [phase1.log](checks/phase1.log) |
| `node --test --test-isolation=none scripts/test-sfi-spec-search.mjs scripts/test-sfi-account-routes.mjs` | 20 tests passed | [search-account.log](checks/search-account.log) |
| `SFI_BUILT_SITE=/tmp/sfi-polish-final npm run test:public-build` | 3 tests passed; generated artifact/security checks included | [public-build.log](checks/public-build.log) |
| `npm run test:styles -- /tmp/sfi-polish-final` | Scoped Sass compiled; 24 imports; single stylesheet and no inline presentation on feature views | [styles.log](checks/styles.log) |
| `python3 scripts/test-sfi-paths.py /tmp/sfi-polish-final` | 15 pages, 240 internal navigation/asset targets passed | [paths.log](checks/paths.log) |
| `python3 scripts/check-sfi-public-links.py /tmp/sfi-polish-final` | 166 targets/fragments, no errors | [links.log](checks/links.log) |
| `node scripts/test-sfi-api-config.mjs /tmp/sfi-polish-final` | Local, loopback, Pages and custom API selection passed | [api-config.log](checks/api-config.log) |
| `node scripts/test-sfi-integration.mjs BACKEND_PYTHON BACKEND_DIRECTORY /tmp/sfi-polish-preview` | 7 tests passed, including real Flask authentication and persistent disposable SQLite; live HTTP over a Unix socket | [auth-integration.log](checks/auth-integration.log) |
| Main Playwright browser suite | 35 layouts; search, filters, pagination, PDF gating, redirects and role separation passed; 21 axe scans with zero violations | [browser.log](checks/browser.log), [JSON](browser-results.json) |
| Additional interaction/state suite | Open-menu keyboard/focus, account errors/success, reduced motion and reflow passed; 4 more axe scans with zero violations; 7 contrast pairs passed | [states.log](checks/states.log), [JSON](state-results.json) |
| Preservation against baseline | Configuration, search JavaScript and authentication module unchanged | [preservation.log](checks/preservation.log) |
| Local preview on port 4500 | Six pages, CSS and navigation script match verified artifacts | [local-preview.log](checks/local-preview.log) |
| Focused preview vs complete production output | Six page HTML files, stylesheet and navigation script byte-identical | [artifact-parity.log](checks/artifact-parity.log) |

## Browser coverage

The six navigation destinations and Create Account were tested at 1440×900, 1024×768, 768×1024, 390×844 and 320×720. Every view has after screenshots at all five widths; desktop/mobile before screenshots show the working baseline before this polish. The screenshot review included all major pages, compact search controls, result status/actions, the footer, timelines, and the mobile dropdown.

Tests cover all 111 canonical specification identities across pagination, exact/equipment/mixed-case queries, every category, empty/error/retry states, and approved/unapproved document actions. PDF approval/revocation and unsafe-document restrictions are also covered by the unchanged Phase 1 tests. Browser admin/member checks use the isolated local catalog API on port 8427. Existing public/backend data is not edited. The account integration suite uses disposable fixtures; success feedback screenshots use stubbed responses.

Additional checks exercise Space/Tab/Escape navigation, focus return, outside-click closing, the skip link, visible focus, no-JavaScript links, reduced motion, and required/short-password validation. Axe uses WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. Main scans cover all seven views at 1440, 390 and 320px; additional scans cover the open menu, two error states and success feedback. No page exceptions were recorded.

## Reproduction

Use the repository's installed Ruby/Node dependencies and a compatible Chromium/Playwright installation. Browser tools are optional QA tooling; no new application dependency was added.

```sh
SFI_UI_URL=http://localhost:4600 \
SFI_UI_API=http://localhost:8427 \
SFI_PLAYWRIGHT_MODULE=/path/to/playwright \
SFI_CHROMIUM=/path/to/chromium \
SFI_AXE_SOURCE=/path/to/axe.min.js \
node scripts/test-sfi-ui-overhaul.cjs

SFI_UI_URL=http://localhost:4600 \
SFI_PLAYWRIGHT_MODULE=/path/to/playwright \
SFI_CHROMIUM=/path/to/chromium \
SFI_AXE_SOURCE=/path/to/axe.min.js \
node scripts/test-sfi-ui-polish-states.cjs
```

Serve the generated site on the frontend URL; the main suite requires the existing backend `scripts/phase1_local.py` isolated-catalog health marker. The local run used a disposable catalog database with 111 public records. Production authentication and data were not used for writes.

## Limits and warnings

The complete build retains pre-existing Sass import/color deprecations, legacy `post_url` warnings, and duplicate permalinks among inherited educational posts. They did not fail the final build. One earlier build process returned an interrupted status after writing its output; the complete destination was rebuilt and verified with an explicit exit status of 0. No unrelated legacy content was changed.

Chromium was tested; Firefox/Safari and manual screen readers were not. A 720 CSS pixel viewport verified the reflow equivalent of 1440px at 200%, rather than claiming native browser zoom testing. Automated scans are not a full WCAG certification.
