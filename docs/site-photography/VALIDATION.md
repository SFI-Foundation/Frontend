# Site photography validation

Baseline: `4bae7bd93`. Branch: `feature/sfi-final-ui-polish`.

The final complete production output is `/tmp/sfi-site-photo-final-verified`. A focused Jekyll build of the same public sources provides fast browser QA; final HTML, CSS and all 16 image assets were compared byte for byte with the complete build. An earlier incremental output retained stale HTML and was rejected by this comparison, so final verification uses a fresh non-incremental destination.

| Executed check | Result | Evidence |
| --- | --- | --- |
| `JEKYLL_ENV=production bundle exec jekyll build --disable-disk-cache --destination /tmp/sfi-site-photo-final-verified` | Passed, 404.094 seconds, exit 0 | [Build log](checks/build.log) |
| Focused production-mode public-page build | Passed, exit 0 | [Focused build](checks/focused-build.log) |
| `npm test` | 22 passed | [Unit log](checks/unit.log) |
| `npm run test:phase1` | 16 passed; 2 artifact-dependent checks skipped in this source-only invocation and run separately against the complete output | [Phase 1](checks/phase1.log) |
| `node --test --test-isolation=none scripts/test-sfi-spec-search.mjs scripts/test-sfi-account-routes.mjs` | 20 passed | [Search/account](checks/search-account.log) |
| `SFI_BUILT_SITE=/tmp/sfi-site-photo-final-verified npm run test:public-build` | 3 passed; complete generated output scanned for excluded/private/prototype content and known credential exposures | [Public build/security scan](checks/public-build.log) |
| `npm run test:styles -- /tmp/sfi-site-photo-final-verified` | Scoped Sass compiled, 25 imports; one stylesheet and no inline presentation on feature views | [Styles](checks/styles.log) |
| `node scripts/test-sfi-integration.mjs BACKEND_PYTHON BACKEND_DIRECTORY /tmp/sfi-site-photo-preview` | 7 passed; real Flask authentication and persistent disposable SQLite | [Auth integration](checks/auth-integration.log) |
| `python3 scripts/test-sfi-paths.py /tmp/sfi-site-photo-final-verified` | 15 pages, 261 internal navigation/asset targets passed | [Paths](checks/paths.log) |
| `python3 scripts/check-sfi-public-links.py /tmp/sfi-site-photo-final-verified` | 200 internal targets/fragments, no errors; includes photo credits | [Links](checks/links.log) |
| `node scripts/test-sfi-api-config.mjs /tmp/sfi-site-photo-final-verified` | Local/loopback/Pages/custom API selection passed | [API config](checks/api-config.log) |
| Existing browser regression | 35 layouts; functional flows passed; zero page exceptions; 21 axe scans with zero violations | [Browser log](checks/browser-regression.log), [results](browser-results.json) |
| New photography browser acceptance | 20 photo-page layouts; source selection, JPEG fallback, compact hero/search, no overlap/overflow, mobile images, credits and delayed-image loading passed | [Photography log](checks/photography.log), [results](photography-results.json) |
| Additional accessibility scans | Credits page at 1440/390/320 and Home with open mobile menu: 4 scans, zero violations | [Photography results](photography-results.json) |
| 200% equivalent layout check | Four photo pages passed at 720 CSS pixels; native browser zoom not manually tested | [Reflow](checks/reflow.log) |
| Source and asset preservation | Config/API/search/navigation/login/logo unchanged; catalog UI below introduction unchanged; retired thumbnails removed; all derivative hashes and size limits passed | [Preservation/assets](checks/preservation-assets.log) |
| Complete output vs screenshot-tested output | Seven HTML pages, CSS and all image derivatives identical | [Artifact comparison](checks/artifact-parity.log) |
| Local preview | Verified updated pages, credit page, CSS and image on port 4500 | [Preview](checks/local-preview.log) |

## What the browser checks exercised

The six navigation destinations and Create Account were tested at 1440×900, 1024×768, 768×1024, 390×844 and 320×720. Photography acceptance additionally checks the four image-bearing pages at those same sizes and decodes every visible photograph before capture. Delivered screenshots include every requested page/width combination.

The existing regression exercises all 111 canonical specification identities across pagination, number/name/mixed-case searches, each category, empty/error/retry states, approved/unapproved PDF actions, redirects and member/admin separation. Approval/revocation and unsafe-document rules are also covered by the Phase 1 tests. Browser administrative checks use the isolated local catalog on port 8427; real-backend account checks use disposable SQLite fixtures. No production writes are performed.

Photography checks assert exactly two Home photographs and one each on Spec Search, History and News; the navbar contains only the existing logo image. All five photographs remain visible on mobile. Desktop Home hero height stays between 280 and 380px. The search input remains within the first 65% of the viewport, and heading/photo rectangles never overlap. A screenshot review caught the initial 320px overlap and the layout was corrected before final captures.

JPEG fallbacks were exercised by marking WebP unsupported in a test document and decoding the selected JPEGs. Separate standard/Retina Home contexts held photo responses until layout was measured: section/header rectangles remained identical after release and the observed layout-shift score was 0. The 2x context selected the 1280px hero variant. These measurements concern the tested image-loading scenario, not a field-performance guarantee for all network/API states.

Axe uses WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. The main suite scans all seven views at 1440/390/320; the additional scans cover the credit page and open mobile menu. Total: 25 scans, zero violations. Keyboard menu opening, Escape focus return, skip links and no-JavaScript navigation are covered.

## Reproduction

Use the repository's Ruby/Node dependencies and the existing isolated backend catalog fixture. No new runtime dependency is needed. Optional browser tooling was supplied by local Playwright, Chromium and axe installations.

```sh
SFI_UI_URL=http://localhost:4600 \
SFI_UI_API=http://localhost:8427 \
SFI_PLAYWRIGHT_MODULE=/path/to/playwright \
SFI_CHROMIUM=/path/to/chromium \
SFI_AXE_SOURCE=/path/to/axe.min.js \
SFI_UI_OUTPUT=/tmp/sfi-site-photo-regression \
node scripts/test-sfi-ui-overhaul.cjs

SFI_UI_URL=http://localhost:4600 \
SFI_PLAYWRIGHT_MODULE=/path/to/playwright \
SFI_CHROMIUM=/path/to/chromium \
SFI_AXE_SOURCE=/path/to/axe.min.js \
node scripts/test-sfi-site-photography.cjs
```

Create the first suite's output/screenshots directory before running. Serve generated output at the frontend URL. The existing browser suite refuses administrative fixture use without the isolated-catalog health marker.

## Limits

Chromium was used. Firefox/Safari, native zoom and manual screen readers were not manually tested; responsive reflow and automated WCAG scans provide partial evidence. Existing inherited Sass deprecations, legacy post-link warnings and duplicate legacy permalinks are documented in the complete build log. The final site uses the current source, with no unrelated legacy content or backend changes.
