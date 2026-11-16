# SFI repository cleanup report

Audit date: November 15, 2026 (America/Los_Angeles). Scope: the working checkouts
`SFI-Frontend` and `SFI-Backend` under `sfi-foundation`. This report covers both
repositories. Separate `phase1/`, `recovery/`, and private-data directories were
left untouched. No commits, pushes, merges, branch switches, resets, stashes,
deployment changes, or history rewrites were performed.

## Summary

Removed only generated output and compiler-confirmed obsolete styles: 18 tracked
Graphify analysis files, five unimported Sass partials, an old tracked backend
development log, macOS Finder metadata, and the obsolete ignored `_site/` build.
Original DOCX documents, the remaining unique usability-plan text, all photography,
licenses, redesign work, current review screenshots, and the current preview build
were retained. No JavaScript, Python application code, route, dependency, public
page, authentication controller, catalog record, or security rule was changed.

The cleanup removes a stale build copy and redundant analysis output from the
checkout and removes obsolete styling alternatives students might mistake for the
active theme. There is no claim of faster builds or runtime performance.

## Protection and baseline

Frontend branch: `feature/sfi-photographic-redesign`. Backend branch: `main`.
Neither repository had staged changes at the start. Frontend had exactly 24
modified tracked files and 37 untracked files; these are the photographic redesign,
homepage image/navigation repair, tests, and their documentation. Backend had one
modified `.env.example` and four untracked feedback implementation/test/documentation
files. All original changed and untracked files were hashed before cleanup.

The evidence folder is `/tmp/sfi-repository-cleanup-20261115/`. It contains the
original status, HEAD/branch, binary diff snapshots, full path/size/SHA-256 source
inventories, duplicate groups, compiler dependency traces, source-document matches,
and all before/after validation logs. No secret values are reproduced here.
Original documentation and ignored review evidence (282 files total) were also
hashed. Explicit clean-file checks and SHA-256 comparisons preceded each deletion.

## Repository inventory

Frontend initially had 4,269 tracked entries (4,268 regular files plus one
gitlink) and 37 ordinary untracked files. Backend had 183 tracked files and four
ordinary untracked files. Counts below cover existing tracked files plus ordinary
untracked source files at the start; ignored dependencies, caches, generated
output, and review artifacts are listed separately. The preserved gitlink
`_themes/minima_alt` points to `bf9ef989246b63536e9db61082f663f1a6d4d9ce`;
its directory is empty and `.gitmodules` is absent. This needs owner review, so it
was retained. No inventory decision relied solely on filename searches.

| Repository / source group | Files | File bytes | Role and disposition |
| --- | ---: | ---: | --- |
| SFI-Frontend/(root files) | 39 | 614,112 | Build/runtime/dependency/configuration files and history; selective cleanup only. |
| SFI-Frontend/.github | 5 | 8,825 | Deployment/content-sync workflows and issue templates: keep. |
| SFI-Frontend/_data | 79 | 320,916 | Liquid data/navigation, catalog and photo records: keep. |
| SFI-Frontend/_docx | 20 | 15,776,347 | Original document-conversion inputs: keep. |
| SFI-Frontend/_includes | 171 | 930,012 | Liquid components, auth and classroom hooks: keep. |
| SFI-Frontend/_internal | 3 | 55,459 | Gated manufacturer/research prototypes: keep. |
| SFI-Frontend/_layouts | 40 | 513,632 | SFI shell, redirects and inherited classroom layouts: keep. |
| SFI-Frontend/_notebooks | 429 | 5,677,201 | CI/Makefile notebook-conversion inputs: keep. |
| SFI-Frontend/_plugins | 2 | 1,855 | Strict demo gating and output-secret guard: keep. |
| SFI-Frontend/_posts | 251 | 2,228,209 | Jekyll pages/posts, including colliding inherited posts: review; keep. |
| SFI-Frontend/_projects | 91 | 58,275,934 | Registered project build/distribution inputs: keep. |
| SFI-Frontend/_sass | 133 | 498,506 | SFI/OCS Sass import trees: five proven obsolete partials removed. |
| SFI-Frontend/_themes | 32 | 46,922 | Makefile/switch-theme template inputs: keep. |
| SFI-Frontend/assets | 522 | 48,559,887 | Scripts, stylesheet entries, static apps and dynamically loaded modules: keep. |
| SFI-Frontend/design | 5 | 125,848 | Design diagrams and history: keep. |
| SFI-Frontend/digital-famine | 1 | 1,104 | Inherited classroom/content assets: preserve; removal needs a consumer audit. |
| SFI-Frontend/docs | 17 | 185,128 | Security, Phase 1, implementation and photo-provenance documents: keep. |
| SFI-Frontend/graphify-out | 19 | 640,448 | Excluded generated analysis; retain one unique plan requiring review. |
| SFI-Frontend/hacks | 273 | 13,171,140 | Inherited classroom/content assets: preserve; removal needs a consumer audit. |
| SFI-Frontend/images | 904 | 310,783,625 | Photos, responsive/fallback assets, licenses and classroom images: keep. |
| SFI-Frontend/media | 32 | 1,179,909 | Inherited classroom/content assets: preserve; removal needs a consumer audit. |
| SFI-Frontend/navigation | 95 | 84,621,619 | Public, account, administration, detector and classroom routes: keep. |
| SFI-Frontend/node_backend | 6 | 10,747 | Separate Socket.IO service; ownership/usage review before removal. |
| SFI-Frontend/pages | 1 | 4,946 | Inherited classroom/content assets: preserve; removal needs a consumer audit. |
| SFI-Frontend/peppamazegame | 5 | 621,047 | Inherited classroom/content assets: preserve; removal needs a consumer audit. |
| SFI-Frontend/scripts | 64 | 499,106 | Build/conversion, setup, admin and verification tools: keep. |
| SFI-Frontend/sfifoundation.com | 1,066 | 95,152,945 | Excluded historical site used by extract_sfi_specs.py: keep. |
| SFI-Backend/(root files) | 33 | 258,394 | Build/runtime/dependency/configuration files and history; selective cleanup only. |
| SFI-Backend/.devcontainer | 4 | 4,860 | Development container configuration: keep. |
| SFI-Backend/.vscode | 1 | 258 | Tracked development configuration: keep. |
| SFI-Backend/Social Media | 8 | 64,733 | Inherited classroom/content assets: preserve; removal needs a consumer audit. |
| SFI-Backend/api | 32 | 286,678 | Flask blueprints and preserved feedback work: keep. |
| SFI-Backend/datasets | 1 | 2,003 | Grade model input; retain despite disabled public feature. |
| SFI-Backend/docs | 18 | 218,221 | Security, Phase 1, implementation and photo-provenance documents: keep. |
| SFI-Backend/hacks | 4 | 2,430,488 | Inherited classroom/content assets: preserve; removal needs a consumer audit. |
| SFI-Backend/instance | 7 | 2,927,118 | Uploads, backup/data history and runtime storage: keep, except .DS_Store. |
| SFI-Backend/model | 22 | 1,464,044 | ORM/classifier/legacy models and feedback work: keep. |
| SFI-Backend/scripts | 17 | 91,148 | Build/conversion, setup, admin and verification tools: keep. |
| SFI-Backend/socket | 4 | 2,863 | Optional service source/configuration: keep pending ownership review. |
| SFI-Backend/static | 10 | 831,283 | Flask images, favicon, vendor scripts and styles: keep. |
| SFI-Backend/templates | 10 | 48,274 | Flask-rendered admin, login and classroom views: keep. |
| SFI-Backend/testing | 5 | 36,667 | Config, profile/PDF and manual infrastructure checks: keep. |
| SFI-Backend/tests | 7 | 82,563 | Isolated Phase 1, PDF/permission/security/gear regressions: keep. |
| SFI-Backend/websocket | 4 | 2,318 | Optional service source/configuration: keep pending ownership review. |

Ignored local inventories were also inspected. Frontend has a Python environment,
Node QA dependencies, generated posts/project distributions/images, Bundler
state, Jekyll caches and lockfile, `_site_preview/4500/`, and 247 review-evidence
files. Backend has its Python environment, bytecode/lint caches, and local runtime
data. These were retained; source imports and local credentials/data are not
disposable just because Git ignores them. The stale `_site/` output is the one
directory removed after a successful replacement build and before/after checks.

Dependency review followed `_config.yml`, Liquid includes/layout inheritance,
navigation data, Sass compiler `loadedUrls`, JavaScript static and dynamic loading,
Flask blueprint registrations, ORM relationships, CLI import/migration tools,
Makefile targets, GitHub Actions, Docker/nginx configuration, and existing tests.
`npm`'s `jsdom`/`sass` are used by checks; Python's broad dependencies have active
or preserved model/route consumers. No dependency was removed speculatively.

Jekyll's public entry is `assets/css/sfi.scss` -> `_sass/sfi/_main.scss` (30
compiler-loaded source URLs, including the entry). The classroom prototype
compiles separately through `sfi-prototype.scss` (3 URLs). Minima's custom entry
loads 89 URLs. Sass is not loaded dynamically by browser JavaScript. No new CSS
file or inline style was introduced, and the existing OCS import structure stays
intact.

## Classified cleanup inventory

All rows in the following table were classified **SAFE TO REMOVE**, low risk,
before deletion. Every file was tracked and clean relative to HEAD. The evidence
keys below give its dependency/reference findings; the full per-file hash and
source matches are in `safe-candidates.json` in the evidence folder.

- **E1:** Generated DOCX conversion comment identifies the original retained
  `_docx/` source; original package XML/text was inspected. No maintained code,
  workflow, test, Liquid or runtime consumer; `_config.yml` excludes `graphify-out`.
  CI converts DOCX originals independently. These are derived texts, not original
  project/security/specification-search reports.
- **E2:** Generated corpus-discovery metadata includes old `_site` paths; interpreter
  locator points to a different developer's absolute venv. No active consumer.
- **E3:** Exact SHA-256 match with retained
  `graphify-out/converted/usability-test-plan-response_22c28eb8.md`; no external
  reference to either copy. Original DOCX is absent, so the retained copy is kept.
- **E4:** Not loaded by any of the three compiled Sass trees; no import/use/forward
  or programmatic path consumer. Old markup/test selectors and historical reports
  do not load these files. Current header/cards are separate partials; prototype
  and infographic hero styling have independent retained entries. Actual generated
  CSS is compared after removal.
- **E5:** Old process output, not an application input. `check_status.sh` optionally
  tails `backend.log` and already handles its absence with `No logs found`. No
  current redesign report or screenshot is stored there.
- **E6:** Finder metadata has no Flask, migration, upload, test or deployment consumer.

| Repository | File removed | Purpose | Bytes | Evidence / action / risk |
| --- | --- | --- | ---: | --- |
| SFI-Frontend | `graphify-out/converted/CSA-Period 2-Comp-Sci-Quest-Frontend-Module_6d41d9a7.md` | Generated DOCX text for an old Graphify analysis | 3,497 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/CSA-Period 2-Comp-Sci-Quest-Outline_e251bce7.md` | Generated DOCX text for an old Graphify analysis | 7,337 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/Design-for-Whole-Child-WGU-E-learning_c4200192.md` | Generated DOCX text for an old Graphify analysis | 7,182 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/Flask-Server-Crash-Course-WGU-E-learning_1736e742.md` | Generated DOCX text for an old Graphify analysis | 10,026 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/GameBuilder-Capstone-Report_8797fb1b.md` | Generated DOCX text for an old Graphify analysis | 91,703 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/Plagiarism-WGU-SGM2-Task1-Ideation-Higher-Level-Education_8d92b34e.md` | Generated DOCX text for an old Graphify analysis | 12,654 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/Plagiarism-WGU-SGM2-Task2-Storyboard-Higher-Level-Education_5b6bf7b2.md` | Generated DOCX text for an old Graphify analysis | 10,213 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/Plagiarism-WGU-SGM2-Task3-Mockup-Higher-Level-Education_415d28ad.md` | Generated DOCX text for an old Graphify analysis | 6,337 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/Plagiarism-WGU-SGM2-Task4-Test-Plan-Higher-Level-Education_63a27c1e.md` | Generated DOCX text for an old Graphify analysis | 44,316 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/QuestOfCode-AIUsage-Thinkers_e328b7bf.md` | Generated DOCX text for an old Graphify analysis | 14,975 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/QuestOfCode-WGU-Assessments-E-Learning_89ab6a69.md` | Generated DOCX text for an old Graphify analysis | 6,445 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/QuestOfCode-WGU-Collaborative-E-Learning_a507ab73.md` | Generated DOCX text for an old Graphify analysis | 4,973 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/QuestOfCode-WGU-Demonstrating-Essential-Concepts_b5425c76.md` | Generated DOCX text for an old Graphify analysis | 23,216 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/QuestOfCode-WGU-Digital-Citizenship_d6e7d68d.md` | Generated DOCX text for an old Graphify analysis | 15,576 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/QuestOfSpook-Game-Development_b1bee769.md` | Generated DOCX text for an old Graphify analysis | 14,666 | E1; delete tracked file; low |
| SFI-Frontend | `graphify-out/.graphify_detect.json` | Generated corpus discovery/cache | 305,935 | E2; delete tracked file; low |
| SFI-Frontend | `graphify-out/.graphify_python` | Local Graphify interpreter locator | 41 | E2; delete tracked file; low |
| SFI-Frontend | `graphify-out/converted/usability-test-plan-response_b2ad659b.md` | Duplicate generated usability plan | 30,678 | E3; delete tracked file; low |
| SFI-Frontend | `_sass/sfi/components/_header.scss` | Superseded SFI logo and utility header styles | 2,043 | E4; delete tracked file; low |
| SFI-Frontend | `_sass/sfi/components/_nav-account.scss` | Superseded account navigation styles | 674 | E4; delete tracked file; low |
| SFI-Frontend | `_sass/sfi/components/_experience.scss` | Superseded four-card homepage styles | 1,135 | E4; delete tracked file; low |
| SFI-Frontend | `_sass/sfi/pages/_hero.scss` | Superseded split homepage hero styles | 2,303 | E4; delete tracked file; low |
| SFI-Frontend | `_sass/sfi/pages/_home-responsive.scss` | Responsive adjustments for obsolete homepage markup | 3,136 | E4; delete tracked file; low |
| SFI-Backend | `backend.log` | Old local development process output | 34,114 | E5; delete tracked file; low |
| SFI-Backend | `instance/.DS_Store` | macOS Finder directory metadata | 6,148 | E6; delete tracked file; low |
| Directory candidate | Purpose and why unnecessary | References / tracking | Action / risk | Evidence |
| --- | --- | --- | --- | --- |
| `SFI-Frontend/_site/` (2,683 files; 931,500,973 bytes) | Old generated static build, predating current redesign; reproducible output | Ignored; no tracked files or symlinks. Makefile clean deletes it; CI regenerates output. No running frontend server used it. | SAFE TO REMOVE; delete explicitly inventoried files, then empty directories; low | Successful fresh production build outside source, full per-file hash inventory, current preview retained, post-cleanup rebuild and browser comparison |

No ordinary untracked source file was deleted. Generated `_site` is ignored local
output, distinct from the 37 ordinary untracked redesign files. No broad Git clean
or reset command was used. Existing build directories and screenshots were not
swept by a generic pattern. Removed tracked files are recoverable from HEAD; a
small temporary backup of those 25 files also exists outside the checkout. The
old generated site was deleted rather than moved into a large archive.

### MUST KEEP

| File/directory group | Purpose / verified references | Tracking | Action / risk | Verification evidence |
| --- | --- | --- | --- | --- |
| All 61 original Frontend changed/untracked paths, listed below | Active redesign, six-card image repair and verification work | 24 modified + 37 untracked | MUST KEEP; high risk to discard | Original SHA-256 and final preservation check |
| All five original Backend changed/untracked paths | Feedback implementation work and environment example | 1 modified + 4 untracked | MUST KEEP; high | Original SHA-256 and final preservation check |
| `_data/sfi_photography.yml`, `sfi_home_navigation.yml`, `images/sfi/photography/`, manifest and `PHOTOGRAPHY.md` | 13 photo placements; Liquid picture sizes, JPEG fallbacks and public credit/licenses | Mixed tracked/untracked | MUST KEEP; high | Manifest hashes, generated-asset tests and real browser decoding |
| `_layouts/sfi.html`, `sfi/nav.html`, footer, feature grid, photograph include, public Sass hub and its imported partials | Public shell/navigation/footer and all current styling | Mixed | MUST KEEP; high | Compiler dependencies, rendered-page checks and browser widths |
| `navigation/sfi-specs.md`, `assets/js/sfi/spec-search.js`, API configuration modules | Search, filters, pagination and restricted PDF rendering | Mixed | MUST KEEP; high | 42 frontend regressions, real API and browser pagination |
| Login/account/profile/logout, quiz/gear, admin/detector pages and their JS modules | Authentication, persistence, staff tools, model loading and camera/image handlers | Tracked | MUST KEEP; high | Imports/HTML loads; source and Backend role/gear regressions |
| Backend `main.py`, `__init__.py`, `api/`, `model/`, `catalog*.py`, `sfi_config.py`, `security_config.py`, CLI migration/import tools and search terms/catalog | Blueprint registration, ORM relationships, PDF approval/revocation, CORS and permissions | Mixed | MUST KEEP; high | Isolated Backend suites, actual read-only catalog API |
| `_internal/manufacturer-demo.*`, research page, internal-demo plugin, legacy Sass and classroom SFI prototype | Intentionally gated future-phase research and review features | Tracked | MUST KEEP; high | Strict default-off/development-only tests; excluded from production |
| `sfifoundation.com/` and original `_docx/` / `_notebooks/` / `_projects/` | Historical/extraction inputs and CI conversion/distribution inputs | Tracked | MUST KEEP; medium/high | extract_sfi_specs.py, Makefile, deploy-jekyll workflow |
| `.github/`, Gemfile, requirements, package.json, Docker/nginx/domain/config files, licenses | Build, deploy, test and legal requirements | Mixed | MUST KEEP; high | Workflow/startup/config inspection and production build |
| `docs/`, design diagrams, Phase 1/security/implementation reports, provenance and upstream merge records | Project history and operating evidence | Mixed | MUST KEEP; medium/high | Document cross-references; original evidence hashes preserved |
| `qa-evidence/` and `_site_preview/4500/` | Current redesign approval screenshots/results and most recent preview | Ignored | MUST KEEP; medium/high | Snapshot of all review evidence; no writes to these paths |
| Theme templates and duplicated source/distribution game assets | Makefile theme switching and generated classroom/game paths; path names may be constructed dynamically | Tracked | MUST KEEP; medium/high | Theme targets, project builds, JS module-relative loading; hashes alone do not prove redundancy |

### REVIEW REQUIRED — retained without modification

| Candidate | Purpose / why considered | References found | Tracking | Proposed action / risk | Evidence / unresolved question |
| --- | --- | --- | --- | --- | --- |
| `graphify-out/converted/usability-test-plan-response_22c28eb8.md` | Generated classroom usability plan; original DOCX missing | Excluded from Jekyll; no active consumer | Tracked | REVIEW REQUIRED; retain; medium | Preserve unique available text; owner should locate original before removing last copy |
| `_includes/sfi/chatbot.html`, `_sass/sfi/components/_chatbot.scss` | Shared assistant code currently not included/imported by public shell | Backend chat blueprint, README/future-work and older tests still describe feature | Tracked | REVIEW REQUIRED; retain together; high | Restoring/importing or deleting would change feature scope; no such change authorized |
| Older `test-sfi-sass.rb`, `test-sfi-theme.mjs`, `test-sfi-visual.mjs`, setup/UI screenshot suites | Prior design assertions differ from photographic redesign | Historical implementation reports and current test inventory | Tracked | REVIEW REQUIRED; retain; medium | Do not remove or rewrite tests to hide baseline failures; owners should reconcile obsolete expectations separately |
| `_themes/minima_alt` | Legacy Git submodule entry; empty checkout | Gitlink is tracked; no `.gitmodules` mapping exists | Tracked gitlink | REVIEW REQUIRED; retain; medium | Owner should determine intended theme/submodule setup before removing or repairing it |
| `testing/test_sfi_profile.py` catalog expectation | Isolated auth/gear/profile tests still useful; one catalog smoke assumption fails | Source-copy fixture imports main.py but does not populate the Phase 1 catalog | Tracked | REVIEW REQUIRED; keep test and record existing failure; medium | 3 failed subtests expect 200 where initialized-catalog guard returns 503; no cleanup mutation caused it |
| All remaining exact duplicate groups | Byte-identical game, classroom, theme, logo and favicon files; some may be redundant | Many have route-relative, generated, template-copy or dynamic JS consumers | Tracked | REVIEW REQUIRED unless specifically MUST KEEP above; retain; medium/high | Complete SHA-256 groups and per-group disposition in duplicate ledger; no deletion based solely on matching bytes |
| Unimported legacy OCS Sass and old standalone CSS | Potential obsolete styles outside active SFI theme | Upstream course layouts and dynamic application consumers require ownership review | Tracked | REVIEW REQUIRED; retain; medium | No style purge/refactor of inherited framework was attempted |
| Old `index3.md`, `test_certificate.html`, `test_imports.py`, empty root `git` and `medialiteracy.md` | Legacy/demo or apparently accidental root files | Jekyll may publish root files; old educational/tool consumers unclear | Tracked | REVIEW REQUIRED; retain; medium | Removing routes/output would exceed proven dead-file boundary |
| `node_backend/`, Backend `app.py`, `host.py`, `socket/`, `websocket/`, `scripts/old/`, `testing/s3tests.py`, sample CSV/lock files | Separate examples, optional services or administration tools | Manual entry points, commented Docker service, legacy models/docs | Tracked | REVIEW REQUIRED; retain; medium/high | Lack of public homepage links does not establish abandonment; no manual external service tests executed |
| Backend `instance/backup/data.json`, uploads, databases and saved classifier model | Runtime/historical data and model state | Backup utilities, Flask upload route, model loader/retraining | Mixed tracked/ignored | REVIEW REQUIRED or MUST KEEP where actively referenced; retain; high | No data deletion, production DB write or model retrain performed |
| Inherited post duplicates/colliding permalinks | Generated/legacy content could be redundant | Jekyll warns about duplicate output and post_url matching | Mixed | REVIEW REQUIRED; retain; medium/high | Changing source precedence would alter generated pages; warnings documented before/after |

The remaining review list is deliberately smaller in scope than a wholesale
removal of inherited coursework. Public and non-homepage functions, manual admin
tools, original reports, and planned manufacturer features remain available.

## Duplicate audit

SHA-256 grouping found 164 Frontend and one Backend duplicate group. One redundant
tracked generated Markdown copy was eliminated. The remaining 164 groups are
listed in [sfi-repository-cleanup-duplicates.tsv](sfi-repository-cleanup-duplicates.tsv),
with paths, sizes, hashes, tracking and classification. No image/media duplicate
was removed. Source/distribution asset paths, theme copies and original-site
logos cannot be consolidated safely from hashes alone. The 13 current photo
manifest entries retain every responsive derivative, fallback and credit record.

## Metrics

| Measurement | Result |
| --- | ---: |
| Tracked files removed | 25 (23 Frontend, 2 Backend) |
| Ignored generated build files removed | 2,683 |
| Total files removed from checkout | 2,708 |
| Tracked file bytes removed | 659,323 |
| Stale build file bytes removed | 931,500,973 |
| Gross file bytes removed | 932,160,296 (888.98 MiB) |
| Exact duplicate tracked files eliminated | 1 (30,678 bytes) |
| Dead Sass partials / source lines removed | 5 / 355 |
| JavaScript or Python application lines removed | 0 |
| Photographic assets, licenses, or ordinary untracked source deleted | 0 |
| Build/runtime speed improvement | Not measured; none claimed |

File-byte totals sum logical file sizes, excluding directory metadata. Removal
of the old site's files accounts for 937,156,608 allocated filesystem bytes;
report/ledger and ignore additions reduce the net logical checkout saving slightly.
Temporary build/test evidence is outside the checkout and is not counted as source
savings. Git history size is unchanged by this working-tree cleanup.

## Validation before and after

The same commands ran against independent production-mode destinations:
`/tmp/sfi-repository-cleanup-20261115/site-before` and `site-after`.
For artifact-dependent npm checks, `SFI_BUILT_SITE` points at the corresponding
destination. `test:styles` and `test:redesign` receive that destination as their
documented command-line argument. Initial raw checks without these inputs were
usage-only/skipped-artifact checks and are not counted as successful validation.

| Check | Before cleanup | After cleanup |
| --- | --- | --- |
| `JEKYLL_ENV=production bundle exec jekyll build --destination <site> --disable-disk-cache` | PASS; 455.053 s | PASS; 405.45 s |
| `npm test` | PASS; 2 test files | PASS; 2 test files |
| `npm run test:styles -- <site>` | PASS; 29 imported partials | PASS; 29 imported partials; same compiled CSS |
| `SFI_BUILT_SITE=<site> npm run test:phase1` | PASS; 3 suites | PASS; 3 suites |
| `SFI_BUILT_SITE=<site> npm run test:public-build` | PASS; 5 tests, no skips; 2,728 output files scanned | PASS; 5 tests, no skips; 2,728 output files scanned |
| `npm run test:redesign -- <site>` | PASS; 13 photo placements, hashes, credits, six cards, Contact and Sass | PASS; same checks |
| Combined `node --test --test-isolation=none` profile, gear, account-route, specification-search and manufacturer-demo source tests | PASS; 42 tests | PASS; 42 tests |
| `ruby scripts/test-sfi-demo-gates.rb` | PASS | PASS |
| `python3 scripts/check-sfi-public-links.py <site>` | PASS; 289 links/assets/fragments | PASS; 289 links/assets/fragments |
| `python3 scripts/test-sfi-paths.py <site>` | PASS; 15 pages, 368 targets | PASS; 15 pages, 368 targets |
| `node scripts/test-sfi-api-config.mjs <site>` | PASS | PASS |
| `node scripts/test-sfi-redesign-browser.cjs` against static HTTP + existing local API | PASS; 52 layouts, 32 page axe scans plus open-menu scan, 111 records, zero unexpected errors | PASS; same coverage and zero unexpected errors |
| `node scripts/test-sfi-admin.mjs <site>` | PASS; 12 synthetic rendered states | PASS; 12 synthetic rendered states |
| `node scripts/test-sfi-gear-browser.mjs <site> <output>` | PASS; 12 synthetic rendered states | PASS; 12 synthetic rendered states |
| Backend `venv/bin/python -m unittest discover -s tests -v` | PASS; 69 tests, 3 skipped | PASS; 69 tests, 3 skipped |
| Backend `PYTHON_DOTENV_DISABLED=1 venv/bin/python -m unittest discover -s testing -p test_sfi_config.py -v` | PASS; 8 tests | PASS; 8 tests |
| Backend equivalent `test_sfi_pdf_ingest.py` command | PASS; 7 tests | PASS; 7 tests |
| Backend `venv/bin/python testing/test_sfi_profile.py` | Existing failure: 13 tests, 3 failed catalog smoke subtests | Identical failure names/statuses; no new failures |
| `bundle exec ruby scripts/test-sfi-sass.rb <site>` (older all-partials audit) | Existing failure: 6 unimported partials | Still fails only for retained chatbot partial; 5 dead partials removed |
| `git diff --check` in each repository | PASS | PASS |

Build times above are individual observed runs, not controlled performance
measurements. Inherited Sass deprecations, duplicate-output and post-link warnings,
and ORM deprecations also existed before cleanup. Initial remote-theme network
and Chromium sandbox restrictions were resolved using required execution
permissions; they were not counted as application failures.

### Output equality

Both full builds contain **2,728 files**. No generated route or asset was
added or lost; **2,726 files are byte-identical**. Every checked public
HTML page, the public SFI stylesheet, authentication/SFI JavaScript, and all SFI
images have identical SHA-256 hashes. Changes in the following generated files
were inspected and normalized only for nonfunctional build metadata:

- `assets/css/style.css.map`: Temporary remote-theme source directory in source map only.
- `feed.xml`: Jekyll build timestamp only.

No unexpected generated-content difference remained. Full comparison details are
in `output-comparison.json`. Screenshot comparisons are recorded in
`screenshot-comparison.json`; no original review screenshot was overwritten.

Of 48 initial screenshots, 47 were byte-identical. The only difference affected
342 pixels within the Submit rejection button in a 375px synthetic admin fixture;
the image dimensions and page geometry were unchanged. Visual inspection and
identical HTML/CSS localized this to the button's interaction/capture state.
A focused repeat of the same fixture with reduced motion and the pointer outside
the controls produced byte-identical before/after screenshots (SHA-256
`0f26c29e07bc146e4b4e3b01c7b94d44812ceb61a590a1aa2149cb06c63b674e`).
Only a temporary copy of the fixture under `/tmp` was adjusted; repository tests
and application styles were unchanged. No layout regression remained.

### Safety verification and practical limits

- Browser review exercised Home, Contact, About, Services, History, News, Spec
  Search, Login, Profile, Gear, Admin, Detector and Photo Credits at 375, 768,
  1024 and 1440 pixels. Hero and all six card photographs loaded; responsive
  candidates and JPEG fallbacks decoded; keyboard/menu/skip-link and no-JavaScript
  navigation worked; all actual card clicks reached the expected page/fragment.
- Specification search used the existing real local API: canonical `16.1`,
  distinct `20.1/1` and `20.1/2`, category filtering, clear/no-results states and
  111 unique paginated records. Approved links remained actionable; unapproved
  records did not expose PDF actions. The official approved 16.1 link returned
  HTTP 200 with `application/pdf` before and after.
- Catalog unit tests cover PDF invalidation on changed identity/document,
  failed revalidation/revocation, explicit rejection, repeat imports, auth and
  role restrictions. Gear/admin fixtures and Backend tests cover permissions,
  moderation and persistence. No real account, admin or catalog mutation was
  performed during browser verification.
- All 66 original changed/untracked files, 282 original documentation/review
  evidence files and all 2,728 current-preview files remain byte-identical.
  Branches and HEADs are unchanged; nothing is staged. All other original regular
  source files were hash-checked, excluding only explicit removals and the two
  intended ignore-file edits.
- No new unexpected browser page errors, console errors or asset failures were
  recorded. Expected anonymous 401 responses remain expected. Browser checks use
  local preview and the local API; no deployment was performed.
- Three MySQL tests remain skipped because no explicitly disposable MySQL schema
  was configured. The existing profile-fixture and chatbot import-audit failures
  remain unresolved and are recorded for review rather than hidden by test edits.
  Physical devices, live authenticated admin writes, outbound email, live model
  providers and production database changes were not exercised by this cleanup.

## Git changes and preservation

New cleanup edits are limited to Frontend `.gitignore` (`/graphify-out/`) and
Backend `.gitignore` (`/backend.log`, `.DS_Store`, `/.ruff_cache/`), plus the explicit
deletions above. This cross-repository report and its duplicate ledger live in the
workspace-level `docs/`. No application configuration or dependency reference
needed changing because the removed source files were not loaded.

Original Frontend worktree paths (all retained byte-for-byte):

### SFI-Frontend

Branch: `feature/sfi-photographic-redesign`. HEAD: `c4eb6e08c1eb63ad20ed550c3141541f55afddd7`.

Original status:

```text
 M Makefile
 M README.md
 M _config.yml
 M _data/sfi_photography.yml
 M _includes/sfi/footer.html
 M _includes/sfi/nav.html
 M _includes/sfi/photograph.html
 M _sass/sfi/_main.scss
 M _sass/sfi/_tokens.scss
 M _sass/sfi/base/_accessibility.scss
 M _sass/sfi/base/_layout.scss
 M _sass/sfi/components/_footer.scss
 M _sass/sfi/components/_navigation.scss
 M _sass/sfi/pages/_content.scss
 M _sass/sfi/pages/_photography.scss
 M _sass/sfi/pages/_specs.scss
 M docs/site-photography/image-manifest.json
 M images/sfi/PHOTOGRAPHY.md
 M index.md
 M navigation/about.md
 M navigation/contact.md
 M navigation/services.md
 M navigation/sfi-specs.md
 M package.json
?? _data/sfi_home_navigation.yml
?? _includes/sfi/feature-grid.html
?? _sass/sfi/components/_feature-grid.scss
?? _sass/sfi/components/_image-banner.scss
?? _sass/sfi/pages/_contact.scss
?? _sass/sfi/pages/_home.scss
?? docs/sfi-home-image-navigation-repair.md
?? docs/sfi-photographic-redesign.md
?? images/sfi/photography/card-about-480.webp
?? images/sfi/photography/card-about-960.jpg
?? images/sfi/photography/card-about-960.webp
?? images/sfi/photography/card-certification-480.webp
?? images/sfi/photography/card-certification-960.jpg
?? images/sfi/photography/card-certification-960.webp
?? images/sfi/photography/card-contact-480.webp
?? images/sfi/photography/card-contact-960.jpg
?? images/sfi/photography/card-contact-960.webp
?? images/sfi/photography/card-news-480.webp
?? images/sfi/photography/card-news-960.jpg
?? images/sfi/photography/card-news-960.webp
?? images/sfi/photography/card-specifications-480.webp
?? images/sfi/photography/card-specifications-960.jpg
?? images/sfi/photography/card-specifications-960.webp
?? images/sfi/photography/card-testing-480.webp
?? images/sfi/photography/card-testing-960.jpg
?? images/sfi/photography/card-testing-960.webp
?? images/sfi/photography/contact-banner-1280.jpg
?? images/sfi/photography/contact-banner-1280.webp
?? images/sfi/photography/contact-banner-480.webp
?? images/sfi/photography/contact-banner-960.webp
?? images/sfi/photography/services-banner-1280.jpg
?? images/sfi/photography/services-banner-1280.webp
?? images/sfi/photography/services-banner-480.webp
?? images/sfi/photography/services-banner-960.webp
?? scripts/test-sfi-photo-assets.mjs
?? scripts/test-sfi-redesign-browser.cjs
?? scripts/test-sfi-redesign.mjs
```

Final tracked worktree status (includes pre-existing work):

```text
 M .gitignore
 M Makefile
 M README.md
 M _config.yml
 M _data/sfi_photography.yml
 M _includes/sfi/footer.html
 M _includes/sfi/nav.html
 M _includes/sfi/photograph.html
 M _sass/sfi/_main.scss
 M _sass/sfi/_tokens.scss
 M _sass/sfi/base/_accessibility.scss
 M _sass/sfi/base/_layout.scss
 D _sass/sfi/components/_experience.scss
 M _sass/sfi/components/_footer.scss
 D _sass/sfi/components/_header.scss
 D _sass/sfi/components/_nav-account.scss
 M _sass/sfi/components/_navigation.scss
 M _sass/sfi/pages/_content.scss
 D _sass/sfi/pages/_hero.scss
 D _sass/sfi/pages/_home-responsive.scss
 M _sass/sfi/pages/_photography.scss
 M _sass/sfi/pages/_specs.scss
 M docs/site-photography/image-manifest.json
 D graphify-out/.graphify_detect.json
 D graphify-out/.graphify_python
 D "graphify-out/converted/CSA-Period 2-Comp-Sci-Quest-Frontend-Module_6d41d9a7.md"
 D "graphify-out/converted/CSA-Period 2-Comp-Sci-Quest-Outline_e251bce7.md"
 D graphify-out/converted/Design-for-Whole-Child-WGU-E-learning_c4200192.md
 D graphify-out/converted/Flask-Server-Crash-Course-WGU-E-learning_1736e742.md
 D graphify-out/converted/GameBuilder-Capstone-Report_8797fb1b.md
 D graphify-out/converted/Plagiarism-WGU-SGM2-Task1-Ideation-Higher-Level-Education_8d92b34e.md
 D graphify-out/converted/Plagiarism-WGU-SGM2-Task2-Storyboard-Higher-Level-Education_5b6bf7b2.md
 D graphify-out/converted/Plagiarism-WGU-SGM2-Task3-Mockup-Higher-Level-Education_415d28ad.md
 D graphify-out/converted/Plagiarism-WGU-SGM2-Task4-Test-Plan-Higher-Level-Education_63a27c1e.md
 D graphify-out/converted/QuestOfCode-AIUsage-Thinkers_e328b7bf.md
 D graphify-out/converted/QuestOfCode-WGU-Assessments-E-Learning_89ab6a69.md
 D graphify-out/converted/QuestOfCode-WGU-Collaborative-E-Learning_a507ab73.md
 D graphify-out/converted/QuestOfCode-WGU-Demonstrating-Essential-Concepts_b5425c76.md
 D graphify-out/converted/QuestOfCode-WGU-Digital-Citizenship_d6e7d68d.md
 D graphify-out/converted/QuestOfSpook-Game-Development_b1bee769.md
 D graphify-out/converted/usability-test-plan-response_b2ad659b.md
 M images/sfi/PHOTOGRAPHY.md
 M index.md
 M navigation/about.md
 M navigation/contact.md
 M navigation/services.md
 M navigation/sfi-specs.md
 M package.json
```

Ordinary untracked files remaining (same paths as before cleanup):

```text
_data/sfi_home_navigation.yml
_includes/sfi/feature-grid.html
_sass/sfi/components/_feature-grid.scss
_sass/sfi/components/_image-banner.scss
_sass/sfi/pages/_contact.scss
_sass/sfi/pages/_home.scss
docs/sfi-home-image-navigation-repair.md
docs/sfi-photographic-redesign.md
images/sfi/photography/card-about-480.webp
images/sfi/photography/card-about-960.jpg
images/sfi/photography/card-about-960.webp
images/sfi/photography/card-certification-480.webp
images/sfi/photography/card-certification-960.jpg
images/sfi/photography/card-certification-960.webp
images/sfi/photography/card-contact-480.webp
images/sfi/photography/card-contact-960.jpg
images/sfi/photography/card-contact-960.webp
images/sfi/photography/card-news-480.webp
images/sfi/photography/card-news-960.jpg
images/sfi/photography/card-news-960.webp
images/sfi/photography/card-specifications-480.webp
images/sfi/photography/card-specifications-960.jpg
images/sfi/photography/card-specifications-960.webp
images/sfi/photography/card-testing-480.webp
images/sfi/photography/card-testing-960.jpg
images/sfi/photography/card-testing-960.webp
images/sfi/photography/contact-banner-1280.jpg
images/sfi/photography/contact-banner-1280.webp
images/sfi/photography/contact-banner-480.webp
images/sfi/photography/contact-banner-960.webp
images/sfi/photography/services-banner-1280.jpg
images/sfi/photography/services-banner-1280.webp
images/sfi/photography/services-banner-480.webp
images/sfi/photography/services-banner-960.webp
scripts/test-sfi-photo-assets.mjs
scripts/test-sfi-redesign-browser.cjs
scripts/test-sfi-redesign.mjs
```

### SFI-Backend

Branch: `main`. HEAD: `17a1e7ac7acd4bd1677c4d2fcf4ec2f9ce845aa9`.

Original status:

```text
 M .env.example
?? api/sfi_feedback.py
?? docs/sfi-feedback.md
?? model/sfi_feedback.py
?? tests/test_sfi_feedback.py
```

Final tracked worktree status (includes pre-existing work):

```text
 M .env.example
 M .gitignore
 D backend.log
 D instance/.DS_Store
```

Ordinary untracked files remaining (same paths as before cleanup):

```text
api/sfi_feedback.py
docs/sfi-feedback.md
model/sfi_feedback.py
tests/test_sfi_feedback.py
```

### Git-history size (separate from checkout cleanup)

Frontend has approximately 1.68 GiB in packed objects (`git count-objects -v`
reports 1,759,719 KiB) plus loose objects. Backend packed objects total 16,095 KiB.
Read-only history scanning found the following large historical blobs. Multiple
versions may share a path; these values are uncompressed blob sizes, not a claim
of reclaimable packed space. No history was rewritten.

| Repository | Historical blob | Bytes |
| --- | --- | ---: |
| SFI-Frontend | `navigation/bitshift/Bitshift_0101-final-commit-1.html` | 84,064,527 |
| SFI-Frontend | `images/volunteer.gif` | 43,688,383 |
| SFI-Frontend | `.venv_wheels/playwright-1.58.0-py3-none-macosx_11_0_arm64.whl` | 41,039,625 |
| SFI-Frontend | `images/capstone/hunger_heroes_donate_hub.mp4` | 38,180,321 |
| SFI-Frontend | `images/helphub.gif` | 29,803,696 |
| SFI-Frontend | `_projects/games/mansionGame/images/main-level-ambience.mp3` | 24,011,061 |
| SFI-Backend | `instance/volumes/user_management.db` | 2,891,776 |
| SFI-Backend | `hacks/images/lassen-volcano.jpg` | 2,266,057 |
| SFI-Backend | `model/sfi_model.joblib` | 1,274,216 |
| SFI-Backend | `instance/uploads/lex/lex.png` | 1,266,491 |
| SFI-Backend | `instance/uploads/niko/niko.png` | 1,105,372 |
| SFI-Backend | `instance/uploads/toby/toby.png` | 1,031,575 |

History contains old wheels, database/model artifacts and large educational media.
Any future history reduction needs separate authorization and coordination with
repository users; deleting files now does not remove historical objects.
