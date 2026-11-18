# Selective Frontend upstream synchronization — 2026-11-18

Origin repository: `SFI-Foundation/Frontend`. Origin base: `223545b45136ce1d14afc60d17326bccc9fabafd`.
Upstream repository: `Open-Coding-Society/pages`. Audited tip: `fcb48d146cafa2a468578ce92b47b4d6eaebfbe3`.
Prior upstream integration/merge base: `a813a336f04dc4cca7a6520dbe09055344420e12`. New reachable upstream commits: **1133**, including merges.
Branch: `chore/selective-upstream-sync-frontend` from the pinned `origin/main`.

[Every upstream file decision](classification.tsv) was recorded before integration: 1239 paths including intermediate changes; classes {'C': 134, 'D': 1102, 'B': 2, 'A': 1}. Endpoint counts use no rename detection (a rename is a separate delete/add). Historical shared ancestors were selectively merged previously, so ancestry alone never authorizes template replacement.

## Imported/adapted changes

- `scripts/convert_docx.py`: targeted patch from `b4afcffb1b233a43fbd978d91918f5147ba46a86`; group diagnostics per document, summarize warnings by default, always display errors/other messages, support `--verbose` and explicit `--force`. Preserve existing SFI fallback-front-matter whitespace and conversion logic.
- `Makefile`: manually adapt only the same commit's DOCX goal flags and three command arguments. Explicit `make convert`/`make convert-docx` show detailed warnings; normal build paths show summaries. SFI preview host/port/baseurl/destination, project distribution, themes, workflows and other targets remain unchanged.
- `tests/test_convert_docx.py`: import five upstream behavioral tests; use `sys.executable` instead of a hard-coded repository venv. Synthetic DOCX fixtures prove generated content is unchanged, errors stay visible, parallel diagnostics stay grouped, unchanged inputs skip and explicit force/verbose works.

## Excluded, deferred and already present

OCS lessons/notebooks, classroom projects, games, capstone/sample datasets/assets, profile/login systems, user-preference systems, navigation/layout/theme changes, setup agents, project cleanup/distribution changes, assignment/board automation and unrelated tests are excluded. Keep SFI authentication assets even when upstream deletes/moves them. No upstream `Gemfile`, workflow, `_config.yml`, `.gitignore`, README, AGENTS policy or LICENSE replacement is applied. The Makefile locale change belongs to a different upstream setup and is deferred; SFI builds already pass in this environment.

Two new upstream commits have empty diffs and are reported equivalent by `git cherry`: `d027efc9d8b53207d898d964d5a87520910b3ca0` and `614f714dd47fd26a107274b3ec754060ce1e68ff`. They are not replayed. Exact endpoint blobs and no-net intermediate paths are marked C in the classification; newer OCS preference/login behavior is excluded in favor of SFI's existing equivalent feature set.

## Validation against the same baseline

| Check | Baseline | Proposed branches |
|---|---|---|
| Backend `unittest discover -s tests -v`, isolated SQLite | 77 tests, 3 MySQL-only skips, pass | 84 tests, same 3 skips, pass |
| Isolated profile/auth/onboarding/preferences regression | 22 pass | 22 pass |
| Config and PDF-ingestion `testing/test_sfi_*.py` | 18, 1 intentional direct-run profile skip, pass | Same, pass |
| Disposable MySQL 8.4 account/preferences regression | 22 pass | 22 pass |
| Disposable MySQL catalog migration/import/concurrency | 3 pass | 3 pass |
| New guard regression tests against original code | Reproduce errors/failures | 7 pass; final test isolates each session/Bearer/cookie identity |
| Frontend `npm test` | 5 script files pass | Same, pass |
| New upstream DOCX regressions against original code | Reproduce failures | 5 pass |
| Frontend phase1 tests | Pass | Pass |
| Full production Jekyll build | Pass | Pass |
| Public artifact / assets / search-index suite | 7 pass | 7 pass |
| Scoped Sass and redesign/photography checks | Pass | Pass |
| Internal links/assets | 15 pages, 489 targets pass | Same, pass |
| Paired Chromium integration, real Flask HTTP and disposable DB | Pass | Pass |
| Responsive layout widths | 1440, 1024, 768, 390, 320 px pass | Same, pass |
| Browser theme checks | 286 cases | Same, pass |
| Accessibility / Spanish localization | 13 routes, zero violations / untranslated known strings | Same |
| Browser JavaScript errors | Zero | Zero |
| Flask route map | Recorded | Identical |
| Generated output preservation | 2,110 files | Identical paths; only feed build timestamp and CSS-map temporary paths differ |

## Preservation and data safety

All SFI-specific route handlers, schemas, migrations, catalogs, canonical reconciliation/deduplication, PDF verification/approval/revocation, role/group policies, account/profile/onboarding/preferences, English/Spanish data contracts and production validation remain unchanged. Existing gear tracking/reviewer moderation, research boundaries, chat/PDF-summary APIs and other retained features are also preserved.

All frontend runtime JavaScript, content/pages, navigation, layouts, includes, Sass, images/data, localization resources, themes, dependencies, API configuration, custom domain and workflows match the pinned origin base. No classroom pages or assets are added. The two generated builds have no added/removed paths; all HTML and runtime assets are byte-identical. Only the feed's build timestamp and a CSS source map's temporary remote-theme paths differ, verified by normalization.

The original backend checkout remains on main with its pre-existing `.env.example`/`.gitignore` edits, deleted tracked log/DS_Store files and untracked feedback files intact. The original frontend checkout stays on main and clean. All initial tracked/untracked file hashes plus `.env` hashes match; original HEADs/statuses are unchanged. Existing worktrees are retained. Real/customer data and production databases were never used by the applications or tests. Tests use memory SQLite, temporary source copies and newly created explicitly named localhost MySQL QA schemas. Private data remains local; no contents enter these commits.

## Security, configuration and limitations

- No dependency or deployment changes. Existing ignored `Gemfile.lock` and installed dependencies were reused for local builds; no new lockfile is committed.
- Existing SQLAlchemy relationship and datetime deprecation warnings remain. Existing Jekyll Sass/post-link and duplicate classroom-destination warnings match baseline; the SFI output remains unchanged.
- Initial sandbox runs failed on remote-theme DNS, nested Bundler process permissions and the browser's Unix socket. Matching reruns with the required execution access passed. One redesign invocation lacked its required built-site argument; the corrected baseline/proposed invocations passed. These were environment/invocation failures, not product regressions.
- Browser tests block external services and use disposable synthetic records. Official public PDF download/network availability and production credentials/data were not exercised. PDF approval/rejection/revocation and unapproved-link restrictions are covered by regression tests; the browser verifies unapproved actions remain unavailable.
- Authentication now gates the legacy code runners. Their existing subprocess isolation is unchanged and is not a complete sandbox; evaluate stronger isolation separately. No OCS account expiry/activation semantics are imposed on SFI.
- This is a selective audit through the recorded tips, not an ancestry merge or acceptance of every commit. Next sync must read this classification and the named source commits, inspect remaining changes, and avoid replaying these hunks. Merge bases intentionally remain the earlier recorded integration points.

## File-by-file final diff review

Each changed file was reviewed against the pinned origin base. No SFI functionality was removed.

| File | Why needed | What changed | SFI impact/removal | Dependency/configuration/security risk | Verification |
|---|---|---|---|---|---|
| Makefile | Expose upstream DOCX diagnostics controls | Two variables, three DOCX calls | SFI preview and targets retained | Explicit force only; no dependencies/config changes | Five upstream tests; build/static/browser checks |
| scripts/convert_docx.py | Build logs repeated low-value warnings | Per-document summaries and verbose/force CLI | Preserve conversion behavior and SFI whitespace | Only requested local document conversion; no added dependencies | Content equivalence, error visibility, parallel/skip/force tests |
| tests/test_convert_docx.py | Protect utility and converted content | Five upstream tests; portable interpreter | No runtime behavior | Temporary synthetic Word files only | Five pass; original code fails |
| docs/upstream-sync/2026-11-18/classification.tsv | Prevent duplicate/risky future imports | Complete pre-integration A/B/C/D decisions and blob evidence | Documentation only; no SFI removal | No private data or credentials | Compared inventory to Git history and endpoints |
| docs/upstream-sync/2026-11-18/README.md | Make selective patch reviewable | Source pins, decisions, verification and preservation receipt | Documentation only; no SFI removal | No runtime/config changes; docs excluded from site | Reviewed against logs and final diff |
