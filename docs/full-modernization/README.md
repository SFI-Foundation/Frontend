# SFI Foundation modernization review — 2026-11-19

Implementation is prepared for review on isolated feature branches. No merge or deployment was performed.

## 1. Architecture and inspected repositories

The original checkouts are `/home/ruhaanb622/sfi-foundation/SFI-Frontend` and `SFI-Backend`. Work is isolated under `worktrees/full-modernization/Frontend` and `Backend`.

The frontend uses Jekyll/Liquid, vanilla JavaScript, a single compiled Sass stylesheet scoped to `.sfi-site`, local i18next, and English/Spanish dictionaries. Public pages share `_layouts/sfi.html`, `sfi/nav.html`, the footer, photography includes and component/page partials. Runtime preferences, account sync, localization, authentication, onboarding and canonical search already have separate modules. Existing jsdom/Sass dependencies were reused; no framework, library, font download or dependency was added.

The backend uses Flask, Flask-RESTful, Flask-Login, JWT, SQLAlchemy and dedicated additive migrations. SFI profile/settings/groups/gear/catalog APIs have independent authorization. SQLite and MySQL are covered. No backend Python, model, API, schema, migration or production configuration was changed.

The frontend starts from current SFI main `24d4fc5bc` (merged #41, including #39 preferences/localization and #40 selective upstream update). The original frontend checkout remains on its earlier clean main `b6151edbb`. Backend starts from `75d0306` (merged #48, including #47 preferences). Recent commits, merged PRs, remotes and all worktrees were inspected. Original backend environment/ignore edits, existing log/metadata deletions and untracked feedback implementation remain untouched. No old worktree was removed or repointed.

[Source route inventory](source-routes.tsv) identifies 556 source pages and their layouts; [built route inventory](built-routes.tsv) records 550 generated HTML routes. Public SFI pages, compatibility redirects, and inherited classroom content are distinguished. The public navigation has five real SFI routes. The supported SFI review matrix covers Home, About, History, Services, News, Contact, Spec Search, Login, Profile, Settings, Admin, My Gear (`/quiz/`), Detect and photo credits. Historical classroom pages are not presented as public SFI capabilities.

## 2. OCS patterns studied and adapted

[Pattern-by-pattern decisions and pinned source links](ocs-patterns.md) cover both OCS repositories. Adapted ideas include one shared header, configured route-derived navigation, separate session/rendering responsibilities, modular Sass and section-based preference forms. The account dropdown, classroom branding, arbitrary theme formats, Spring/school account policy, unsolicited toasts and broad global styles were rejected. No upstream merge was performed.

## 3. Visual improvements by page

- Home: balanced text/photograph hero, red emphasis, direct specification action, six photo/content cards and a compact purpose section. All organization copy, approved images, attribution and photograph hashes are preserved.
- Settings: a bordered section rail, active indication, selected-section workspace, unified appearance tiles and restrained preview/status feedback. Mobile uses a native expandable section chooser.
- Specification Search: a composed search/filter surface, labelled hint, distinct specification-number tokens, technical titles, category metadata, readable document status/actions and consistent result spacing.
- Profile/onboarding: shared type, surfaces, borders, selectable choices, focus and spacing. Existing conditional questions and privileges remain intact.
- Login/registration: consistent cards, fields and tabs; semantic forms support Enter from all fields. Validation marks/focuses the invalid input and associates its message. Cookie verification and password handling are preserved.
- Admin: standard shared typography, readable tabs/table headings, consistent cards/buttons and bounded mobile table scrolling. Counts come from existing APIs; no analytics or records were invented.
- About, News, Contact, History, Services and other supported SFI pages receive the common header, neutral surfaces, consistent page heading treatment, focus and appearance tokens. Authentic page copy/contact details/news remain unchanged.

## 4. Desktop and mobile navigation

First row: SFI logo, Home, Spec Search, About SFI, News & Events, Contact; guests have Sign In. Verified accounts receive a compact second row with their display name, My Profile, Preferences and Sign Out. Admin Dashboard is added only when the verified server profile returns `can_manage_roles === true`.

Desktop has no account trigger, menu roles or dropdown. Links use normal tab order and active-page `aria-current`. Mobile has one button controlling the in-flow public/account navigation, correctly labelled expansion state, Escape-to-close and focus return. Account links never become a second desktop-style dropdown. Long names truncate within the identity region without overflowing; full names remain available as text/title.

The duplicate header/Settings retry-button ID was fixed. Backend guards remain the authority, including when a user self-selects SFI staff/manufacturer involvement.

## 5. Settings and persistence

All ten existing sections and all validated settings remain. Appearance is selected initially; deep links select the requested section. Search reveals matching sections, announces their count, keeps personal values out of the index, supports Enter-to-first-result and Escape-to-clear. Section links preserve keyboard focus and active state. Guest confirmations remain in Settings while successful background guest/account synchronization consumes no persistent site-wide banner space. Loading, save failure, offline and stale-device retry feedback remain.

Verified guest reloads, account reloads, two independent device contexts, reverse synchronization, optimistic revision conflicts, failed saves/retry, account/guest storage separation, language, all accents, system theme, accessibility settings and logout restoration. No cosmetic-only controls were substituted for working preference logic.

## 6. Specification Search and document safety

Search keeps the existing canonical API, deterministic ordering/ranking, debounce/race protection, categories, clear/reset, pagination, metadata and preferences. The number/title presentation changed without changing identifiers or records. Safe highlighting preserves the number's visual hierarchy.

No catalog JSON, search-term data, document verification state or PDF approval/revocation implementation changed. Existing `verifiedUrl` restrictions remain. Unapproved/missing documents have no PDF action. Backend tests cover verification, approval/rejection/revocation, canonical archive history, import rollback and concurrency. Browser tests cover no-results, clear, unavailable API/retry, pagination, filtering and unavailable document actions.

Review screenshots use explicitly labelled **Synthetic QA equipment** in disposable databases. These are test fixtures, never client data or seeded production records. No production catalog was rewritten, and no current client PDF/canonical discrepancies were inferred from synthetic fixtures.

## 7. Account and administrator behavior

Verified real browser cookies with guest, User and Admin accounts; role-restricted API responses; registration and optional manufacturer onboarding remain unprivileged; profile editing persists to the disposable database. Dedicated checks cover cross-tab name/session changes, legacy stale UI events, temporary profile-service failures, HttpOnly cookie expiry, reauthentication, successful/failed logout and signed-out reloads. Administrative users/groups/gear-review tabs still use their existing protected APIs.

## 8. Removed and consolidated files

[Frontend cleanup manifest](cleanup-manifest.md) records each path, evidence, replacement, verification and risk. Removed the unreferenced 910-line `_includes/sfi/styles.html`; moved the disconnected assistant include/stylesheet into excluded `_internal/`; consolidated appearance and repeated Settings rules; removed the old dropdown and obsolete photo-card arrow/overlay rules with their markup.

Backend cleanup removes only tracked `instance/.DS_Store` and consolidates `.gitignore`, with audit documentation. No runtime change was needed. The paired backend manifest records the evidence and retained security concern.

## 9. Files intentionally retained

Retained private databases/backups/uploads, unfinished feedback work, migration history and old migration scripts, development-only manufacturer/reminder/research sources, the documented classroom SFI review prototype, project/build registry tooling, inherited classroom routes, useful historical reports and photo license/provenance data. Frontend inventory found 165 exact duplicate groups; backend found one. Hash duplication alone was not treated as safe deletion evidence. No image or dependency was removed without proof of non-use.

A tracked historical backend log contains private-looking markers. It is retained for a separate confidential owner security review; no contents were copied into reports or PRs. The new ignore rule does not untrack or sanitize historical Git content.

## 10. Exact verification commands and results

See [reproduction commands and test results](verification.md). Production build, frontend units, public-artifact/photo/search checks, scoped Sass, link audit, notebook/DOCX tests, backend regressions, SQLite/MySQL account tests and catalog concurrency tests pass. The default backend suite skips three explicitly MySQL-only cases; the separate disposable MySQL run executes all three successfully. Intentional invalid-input/database-error tests may log handled errors while passing.

## 11. Browser and accessibility verification

Chromium used rendered Jekyll files and real cookie-bearing HTTP requests through a Unix socket to a temporary Flask source copy and disposable database. External services are blocked in this reproducible harness. The matrix passes 210 checks (14 routes × five requested widths × three session types), 84 axe scans (light English and dark Spanish for each route/session), with no violations or uncaught JavaScript errors.

The separate full integration suite passes 286 theme/accent cases, five widths including 320px, 13 Spanish route checks with zero known untranslated UI strings, 13 additional axe scans and eight end-to-end workflows. Another 56 axe contrast scans cover gear/detector status presentation across light/dark, seven accents and high contrast. Dedicated account/settings suites add keyboard, import/export, failure/expiry and reset coverage.

Screenshots were visually inspected, including desktop/mobile account rows, Home, Settings, Spec Search and Admin. Automated checks cover headings, labels, focus, announcements, unique IDs, overflow, reduced motion and enlarged text. Manual NVDA/VoiceOver/TalkBack reading, physical touch devices and camera/model inference with external services remain manual follow-up; automated axe is not a complete assistive-technology certification.

## 12. Before/after screenshots and preview

[Comparison gallery](screenshots.md) includes all seven requested views and mobile Settings, plus dark/Spanish examples. Committed images and sanitized JSON evidence are under `docs/full-modernization/`; the complete local captures are `/home/ruhaanb622/sfi-foundation/reports/full-modernization/{before,after,integration,account-details,settings-details}`.

Port 4500 was inspected and serves `worktrees/account-navigation/Frontend`, not this branch. Its existing server was preserved. A temporary static preview of the exact production artifact was checked at port 4600 (HTTP 200), with build outputs under `/tmp/sfi-modern-{before,after}-site`. It is a frontend preview; authenticated QA uses the isolated Flask harness, not the existing real backend on port 8605.

## 13. Branches, commits and draft PRs

Frontend branch: `feature/sfi-full-site-modernization`, based on current SFI main. Backend branch: `feature/sfi-repository-hygiene-backend`, based on current backend main. Visual changes, refactoring and removal decisions are separate commits. [Publication receipt](publication.md) records the commits, preservation state and draft PR links: [Frontend #42](https://github.com/SFI-Foundation/Frontend/pull/42) and [Backend #49](https://github.com/SFI-Foundation/Backend/pull/49). No auto-merge, merge or deployment is enabled.

## 14. Remaining risks and client decisions

- Client approval of the final visual direction and manual assistive-technology/device review.
- A separate confidential review of the retained historical backend log and previously documented sensitive-history concerns; no destructive history rewrite or credential operation was attempted.
- Production credentials, customer records, real databases, official live PDF availability, live email/news refresh and camera inference were not exercised.
- The documented classroom prototype and inherited OCS routes remain intentionally supported. Removing them requires a separate product/deprecation decision because CI/tests/history still use them.
- Existing Sass `@import`, Jekyll post-link/duplicate classroom destination, SQLAlchemy relationship and datetime deprecation warnings remain. They were present in the baseline. No broad framework/build-tool migration was introduced.
