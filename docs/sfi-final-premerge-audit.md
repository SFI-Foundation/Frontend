# SFI final premerge audit

Final review: November 16, 2026 (America/Los_Angeles); checks began November 15. Frontend:
`feature/sfi-photographic-redesign`. Base and fetched `sfi/main`:
`c4eb6e08c1eb63ad20ed550c3141541f55afddd7` (Frontend PR #32).
Backend remains on `main`, `17a1e7ac7acd4bd1677c4d2fcf4ec2f9ce845aa9`.

## A. Executive summary

**READY WITH DOCUMENTED LIMITATIONS**. No confirmed release-blocking regression remains. Fresh builds, required npm checks and real-browser verification pass; the two reproduced legacy test issues and unconfigured MySQL cases remain noncritical limitations.

The photographic redesign, six homepage cards, Contact page, responsive images,
navigation repairs, and Phase 1 search/security behavior have been reviewed.
All 25 cleanup deletions are SAFE; none requires restoration. Backend's existing
modified/untracked/deleted files were preserved without edits or staging.

This audit repaired an existing malformed site-wide search JSON index using
Jekyll's JSON serializer, added two regression checks, and corrected outdated
README statements about administration APIs and specification permissions.
No API contract, specification data, styling, dependency, or test expectation was
changed to hide a failure. No unresolved release-blocking frontend defect remains.

Two pre-existing test issues remain: an empty-catalog assumption in Backend's
profile fixture, and an older Sass audit's requirement that disconnected retained
chatbot styles be publicly imported. MySQL tests require explicitly configured
disposable infrastructure and remain skipped. These limitations are detailed below.

## B. Deleted files review

Each original blob was read from Git HEAD and matched against its cleanup hash.
References were checked across current source, Liquid/configuration, workflows,
Sass compiler imports, tests and deployment entry points. Historical documentation
references to removed styles are history, not active imports.

| Repository / deleted file | Original purpose | Dependencies and documentation review | Classification |
| --- | --- | --- | --- |
| SFI-Frontend/`_sass/sfi/components/_experience.scss` | Superseded four-card homepage styles | Absent from actual SFI/prototype/Minima compiler loaded URLs; no import edge; historical docs only; public CSS unchanged in cleanup comparison; references: `docs/sfi-sass-architecture.md`, `docs/sfi-style-polish.md` | **SAFE** |
| SFI-Frontend/`_sass/sfi/components/_header.scss` | Superseded SFI logo and utility header styles | Absent from actual SFI/prototype/Minima compiler loaded URLs; no import edge; historical docs only; public CSS unchanged in cleanup comparison; references: `docs/sfi-sass-architecture.md`, `docs/sfi-theme-refactor.md` | **SAFE** |
| SFI-Frontend/`_sass/sfi/components/_nav-account.scss` | Superseded account navigation styles | Absent from actual SFI/prototype/Minima compiler loaded URLs; no import edge; historical docs only; public CSS unchanged in cleanup comparison; references: `docs/sfi-sass-architecture.md`, `docs/sfi-theme-refactor.md` | **SAFE** |
| SFI-Frontend/`_sass/sfi/pages/_hero.scss` | Superseded split homepage hero styles | Absent from actual SFI/prototype/Minima compiler loaded URLs; no import edge; historical docs only; public CSS unchanged in cleanup comparison; references: `docs/sfi-sass-architecture.md`, `docs/sfi-theme-refactor.md`, `docs/sfi-style-polish.md` | **SAFE** |
| SFI-Frontend/`_sass/sfi/pages/_home-responsive.scss` | Responsive adjustments for obsolete homepage markup | Absent from actual SFI/prototype/Minima compiler loaded URLs; no import edge; historical docs only; public CSS unchanged in cleanup comparison | **SAFE** |
| SFI-Frontend/`graphify-out/.graphify_detect.json` | Generated corpus discovery/cache | Machine corpus scan includes obsolete _site paths; excluded by _config.yml; no source, CI, runtime or test consumer. | **SAFE** |
| SFI-Frontend/`graphify-out/.graphify_python` | Local Graphify interpreter locator | Contains another developer's absolute venv path; no source/CI/test consumer, excluded from publication. | **SAFE** |
| SFI-Frontend/`graphify-out/converted/CSA-Period 2-Comp-Sci-Quest-Frontend-Module_6d41d9a7.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/Quests/CSA-Period 2-Comp-Sci-Quest-Frontend-Module.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/CSA-Period 2-Comp-Sci-Quest-Outline_e251bce7.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/Quests/CSA-Period 2-Comp-Sci-Quest-Outline.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/Design-for-Whole-Child-WGU-E-learning_c4200192.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D296/Design-for-Whole-Child-WGU-E-learning.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/Flask-Server-Crash-Course-WGU-E-learning_1736e742.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D296/Flask-Server-Crash-Course-WGU-E-learning.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/GameBuilder-Capstone-Report_8797fb1b.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/Quests/GameBuilder-Capstone-Report.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/Plagiarism-WGU-SGM2-Task1-Ideation-Higher-Level-Education_8d92b34e.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D292/Plagiarism-WGU-SGM2-Task1-Ideation-Higher-Level-Education.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/Plagiarism-WGU-SGM2-Task2-Storyboard-Higher-Level-Education_5b6bf7b2.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D292/Plagiarism-WGU-SGM2-Task2-Storyboard-Higher-Level-Education.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/Plagiarism-WGU-SGM2-Task3-Mockup-Higher-Level-Education_415d28ad.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D292/Plagiarism-WGU-SGM2-Task3-Mockup-Higher-Level-Education.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/Plagiarism-WGU-SGM2-Task4-Test-Plan-Higher-Level-Education_63a27c1e.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D292/Plagiarism-WGU-SGM2-Task4-Test-Plan-Higher-Level-Education.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/QuestOfCode-AIUsage-Thinkers_e328b7bf.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/Quests/QuestOfCode-AIUsage-Thinkers.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/QuestOfCode-WGU-Assessments-E-Learning_89ab6a69.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D295/QuestOfCode-WGU-Assessments-E-Learning.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/QuestOfCode-WGU-Collaborative-E-Learning_a507ab73.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D295/QuestOfCode-WGU-Collaborative-E-Learning.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/QuestOfCode-WGU-Demonstrating-Essential-Concepts_b5425c76.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D295/QuestOfCode-WGU-Demonstrating-Essential-Concepts.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/QuestOfCode-WGU-Digital-Citizenship_d6e7d68d.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/D295/QuestOfCode-WGU-Digital-Citizenship.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/QuestOfSpook-Game-Development_b1bee769.md` | Generated DOCX text; original document retained | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `_docx/Quests/QuestOfSpook-Game-Development.docx` | **SAFE** |
| SFI-Frontend/`graphify-out/converted/usability-test-plan-response_b2ad659b.md` | Duplicate generated usability-plan text | Excluded by Jekyll; workflows convert original DOCX; no active page/test/deployment consumer; retained: `graphify-out/converted/usability-test-plan-response_22c28eb8.md` | **SAFE** |
| SFI-Backend/`backend.log` | Old local development process output | Tracked October log; startup scripts do not read it as input. check_status.sh only optionally tails it with a missing-file fallback. Not a redesign verification report.; references: `check_status.sh` | **SAFE** |
| SFI-Backend/`instance/.DS_Store` | macOS Finder directory metadata | Binary platform metadata, not used by Flask, upload handlers, tests, database migration or Docker startup. | **SAFE** |

Restorations: none. All 23 Frontend deletions can be included in this release.
The two Backend deletions predate this audit and remain unchanged and uncommitted;
they are not included in the Frontend change set. No uncertain file was deleted
or automatically restored. Planned manufacturer/research features, prototype
styles, source documents, photo credits, licenses and security reports remain.

## C. Test results and failure analysis

All logs and temporary build/browser artifacts are under
`/tmp/sfi-final-premerge-20261115/`. Previous baseline evidence remains under
`/tmp/sfi-repository-cleanup-20261115/`. Artifact checks use the freshly built
destination through `SFI_BUILT_SITE` or the script's documented argument.

| Check executed | Current result | Comparison with cleanup baseline |
| --- | --- | --- |
| Fresh production Jekyll build; new destination, disk cache disabled | PASS | Main SFI output identical; metadata and intended rendered README/index wording differ |
| Source-only deployment-generation rehearsal and fresh Jekyll build | PASS | Additional protection against ignored local dependency artifacts |
| `npm test` | PASS, 22 tests across 2 files | Same checks; earlier runner summarized by file |
| `npm run test:styles -- <site>` | PASS, 29 imported partials | Same |
| `SFI_BUILT_SITE=<site> npm run test:phase1` | PASS, 18 tests across 3 files | Same checks; earlier runner summarized by file |
| `SFI_BUILT_SITE=<site> npm run test:public-build` | PASS, 7 tests, no skips | Original 5 checks plus 2 new search-index regressions |
| `npm run test:redesign -- <site>` | PASS, 13 unique licensed photo placements and 6 cards | Same |
| Combined profile/gear/account/search/manufacturer source regressions | PASS, 42 tests | Same |
| Demo gate, public links, paths and API configuration | PASS; 289 links and 368 targets across 15 pages | Same |
| Responsive Playwright/axe review | PASS; 52 layouts, 32 page scans plus open-menu scan | Same; 0 unexpected page/console/asset errors |
| Admin and gear browser fixtures | PASS; 12 admin and 12 gear states | Same |
| Backend unittest discovery | PASS; 69 tests, 3 MySQL skips | Same |
| Backend configuration and PDF-ingestion checks | PASS; 8 + 7 tests | Same |
| Isolated Backend profile suite | 13 tests, 3 failed subtests | Same named failures, diagnosed below |
| Older all-partials Sass script | FAIL, retained chatbot partial | Same post-cleanup failure; no test weakened |
| `git diff --check` | PASS | Same |

### Repaired existing frontend defect: malformed site-wide search JSON

The baseline and fresh pre-fix `assets/js/search-data.json` contain a raw U+001B
escape character at line 6454, column 34027. Standard JSON parsing fails there;
`assets/js/search.js` uses `JSON.parse(request.responseText)`, so the inherited
site-wide search could not initialize. This predates the release; the template
was unchanged from main before this audit. API-backed SFI specification search
is independent and remained functional.

Classification: **existing production defect, repaired**. Severity: medium.
All emitted string fields now use Jekyll `jsonify`; field names, string types and
existing content transforms are preserved. Tests render the actual template
through Jekyll with quoted post/page titles and ANSI controls, then parse the full
production index. The new artifact regression failed against the pre-fix build,
while the repaired template passed its focused fixture. The complete fresh final
artifact and real browser JSON parsing were verified after rebuilding. No Backend
code or test expectation was changed.

### Reproduced failure: Backend profile catalog smoke test

`testing/test_sfi_profile.py::ProfileTests.test_existing_sfi_gear_moderation_and_public_endpoints`
fails three subtests for `/api/sfi/specs`, `/api/sfi/categories`, and `/api/sfi/stats`:
expected 200, actual 503. The isolated fixture imports `main.py` without populating
the Phase 1 catalog. `catalog.canonical_specs()` deliberately raises
`CatalogNotInitialized` for an empty database; API handling returns
`catalog_not_initialized`, HTTP 503 and `Cache-Control: no-store`.
`tests/test_catalog_initialization.py` explicitly verifies this safeguard and
also verifies successful initialized-catalog search and document revocation.

Classification: **test infrastructure/environment issue (outdated fixture)**.
Severity: medium for maintaining this smoke suite; not a frontend merge blocker.
The guard was committed in Backend `5666976` before this branch; the profile test
last changed in `6d37486`. The relevant implementation and test files equal
committed Backend main byte-for-byte. The same three failures were reproduced
before and after cleanup and again in this audit. Authentication, profile and
permission cases otherwise pass. Recommendation: update and seed the Backend
fixture in a separate Backend change, retaining the empty-catalog 503 assertions.
No Backend source or expected result was changed here.

### Reproduced failure: older Sass import audit

`bundle exec ruby scripts/test-sfi-sass.rb <site>` reports unused
`_sass/sfi/components/_chatbot.scss`. The public shell does not include the chatbot;
the retained backend API/include and old documentation preserve a feature decision
for later work. The script assumes every non-legacy SFI partial is publicly loaded.
At the unchanged base, this same test already failed for six disconnected partials.
Five were verified obsolete and removed; the chatbot remains intentionally retained.

Classification: **obsolete test assumption**. Severity: low; not a merge blocker.
Current Sass checks compile the actual public entry, verify scoped selectors and
rendered pages, and compare generated CSS to the compiler. They pass. Importing
the chatbot or deleting its implementation solely to make the old test green
would change scope. Recommendation: resolve feature ownership and then update
the older audit with explicit separate entry ownership. Older theme/visual
scripts with removed header/card selectors were inspected, not represented as
executed passing checks.

### MySQL skips

`tests/test_phase1_mysql.py::DisposableMySQLTests` skips exactly three tests when
`SFI_QA_MYSQL_URI` is unset, as it is here. Tests cover additive migrations and
rollback/Unicode, canonical archival with foreign-key preservation, and concurrent
identity reservation. They require localhost/127.0.0.1 and a database name starting
with `sfi_phase1_qa`; setup drops/recreates only fixture tables in that explicit
schema. No credentials were invented and no production database was opened.

Classification: **unverified due to missing disposable database configuration**.
Severity: medium backend coverage limitation, unchanged from baseline. This
Frontend release does not modify database logic or API contracts. The 69-test
Backend suite, configuration tests and PDF-ingestion tests still cover the
unchanged implementation using isolated fixtures. A backend-affecting release
should run the MySQL cases with approved disposable infrastructure.

## D. Deployment readiness

Fresh working-tree build: `/tmp/sfi-final-premerge-20261115/site-final`. A separate source-only copy started with 4,282 reviewable files and no ignored dependencies or generated assets. The workflow's project distribution, notebook conversion, DOCX conversion (15 originals), course splitting and full Jekyll build were exercised there. Its output is `/tmp/sfi-final-premerge-20261115/review-site-final`. Public SFI HTML, CSS, JavaScript and photographic asset hashes match the working-tree artifact across 98 checked files. Runtime browser checks used the fresh working-tree artifact; the source-only artifact has identical checked public bytes.

Browser coverage: Home, Spec Search, Contact, About, History, News, Services, Login/Profile, Gear, Admin, Detector and Photo Credits at 375/768/1024/1440px. All six card clicks/fragments, image decoding, 42 responsive/fallback candidates, JPEG fallback, active navigation, keyboard/Escape/focus, no-JavaScript navigation, overflow and accessible names passed. Real local API checks exercised 111 unique paginated identities, category filtering, exact and qualified specification searches, no-results/reset, approved links and suppressed unapproved links. The approved 16.1 PDF was fetched separately and validated as PDF bytes.

The public-build credential/QA/prototype guard passed. Added source/assets/docs and the staged diff were reviewed for provider keys, private-key markers, credential files, databases, generated output and unnecessary large files; no sensitive file was included. Only responsive photo derivatives and their provenance are added. GitHub-hosted deployment, dependency installation on a new machine, and live production auth writes were not executed; the local rehearsal reuses installed tooling. These practical limits are not described as hosted CI success.

The existing runtime contract remains: public JavaScript resolves the configured
API base, sends credentials for account/admin calls, renders canonical catalog
items and deterministic pagination, and exposes only approved official PDF links.
Negative revalidation/revocation, changed-document invalidation, role restrictions,
rollback and archive confirmation are exercised by unchanged Backend tests.
Live anonymous account/admin reads return 401; no real account/admin/catalog
write was used for verification. Admin and gear browser checks use synthetic
fixtures. Physical cameras/devices, external model providers and live authenticated
production writes were not exercised.

Sass review follows the existing SFI scoped import hub and
[OCS Sass guide](https://pages.opencodingsociety.com/sass/guide), linked from the
requested [topics index](https://pages.opencodingsociety.com/topics/?category=sass).
Palette, typography, spacing and breakpoints use shared tokens/mixins, with
component geometry in SCSS. No handwritten CSS, generated CSS or inline styling
was added. The public entry and separately compiled classroom prototype remain
independent. The current public dependency tree has 29 imported partials; the
compiler trace includes the entry as its 30th source URL.

Photography resolves `site.data.sfi_photography[include.key]`, including the renamed
loop argument that previously collided with Liquid's outer data. `_config.yml`
sets `incremental: false`; Makefile's preview performs a clean/full regeneration
and passes `--disable-disk-cache`, without `--incremental`. Current photo/navigation
data changes therefore regenerate dependent pages rather than reuse incremental
lookups. Asset checks reject empty photo IDs and missing unselected srcset
candidates. Existing Jekyll/Sass and classroom duplicate-post warnings are retained
and documented; no unrelated educational content was reorganized.

## E. Repository cleanup verification

| Metric | Verified result |
| --- | ---: |
| Tracked deletions | 25 total: 23 Frontend, 2 Backend |
| Tracked file bytes | 659,323 |
| Ignored old `_site/` files | 2,683 |
| Ignored generated file bytes | 931,500,973 |
| Total files removed | 2,708 |
| Gross logical bytes removed | 932,160,296 (888.98 MiB) |
| Exact duplicate files eliminated | 1 generated Markdown copy (30,678 bytes) |
| Dead Sass source removed | 5 partials / 355 lines |
| Photography/media duplicates removed | 0 |

The tracked count is independently visible in both Git diffs; byte totals match
original Git blobs. Generated-file totals rely on the recorded per-file inventory
and absence of the old output directory; the deleted directory cannot be recounted
from the current filesystem. Thus the recorded history supports, rather than a
new disk-space benchmark remeasures, the 889 MiB figure. Current audit output is
outside the source checkout. Deleting working files does not reduce Git history.

Frontend `.gitignore` adds `/graphify-out/`. Existing ignores keep QA screenshots,
build output, caches, dependencies, credentials and databases out of the PR.
Backend's previous `/backend.log`, `.DS_Store`, and `/.ruff_cache/` rules are left
unchanged. The original cleanup report and duplicate ledger are included for
review; their historical observations are not substituted for current checks.

Remaining review candidates are retained: the last unique generated usability
plan without its DOCX source; optional chatbot; old visual tests and legacy OCS
styles/apps; optional services/admin tools; data/model/upload state; duplicate
post outputs; and the empty `_themes/minima_alt` gitlink without `.gitmodules`.
No broader cleanup or Git-history rewrite was performed. Licenses, historical
extraction inputs, Phase 1 reports, all current photos and review evidence remain.

## F. Pull request preparation

Reviewed local commits:

- `e5c023a72c1cddb4fd948c21cb56675df10d3914` — feat: refresh SFI public photography and navigation
- `f697fea423b4fea6f8ccd676e77dde3eb91a7a14` — fix: serialize site search data as valid JSON
- `e90387161bcb62d74395cb184701a26b7816196b` — chore: remove verified obsolete frontend files

The final documentation commit contains this audit, the local PR draft and exact file manifest. Its hash is available as branch HEAD after commit. The comparison target remains fetched `sfi/main`; all included paths have been reviewed. Before that documentation commit, the only remaining Frontend status entries were those three untracked audit documents; no application changes remained unstaged. The final clean-status check, all four hashes and unchanged Backend status are recorded in the workspace-level `docs/sfi-final-premerge-git-receipt.json` and the local evidence folder. Backend retains its original two modified tracked paths, two deletions and four untracked feedback files, with nothing staged.

The precise inclusion list covers 92 unique Frontend paths and is [sfi-premerge-files.tsv](sfi-premerge-files.tsv).
It separates source/configuration, licensed responsive images, SCSS, tests,
documentation and tracked cleanup deletions. A local draft title/description is
in [sfi-photographic-redesign-pr.md](sfi-photographic-redesign-pr.md).

Excluded: `_site/`, `_site_preview/`, `qa-evidence/`, screenshots, temporary logs,
browser packages, node_modules, Python environments, caches, local databases and
credential files. Useful original QA evidence remains locally. No Backend paths
are staged or committed. No push, remote PR creation, merge, or deployment was
performed. Original Frontend implementation was retained; search-index serialization
and its regression test, README corrections, and the audit package are the additions
from this audit. One extra EOF blank line in the original home-image repair report was normalized without changing its text; staged-diff whitespace checks include the previously untracked files.

## G. Final recommendation

**READY WITH DOCUMENTED LIMITATIONS**

The evidence supports merging the reviewed Frontend change set after normal human review and explicitly approved publication. No confirmed critical regression, unsafe deletion, broken public image, API contract change or permission bypass remains. The isolated Backend fixture, retained-chatbot import audit, MySQL coverage and hosted-CI/physical-device limits above remain visible follow-up work. Backend must remain outside this PR; publication is still pending user approval.
