# SFI capstone board review

Local review branch in both repositories: `demo/board-review-20261125`.
Frontend starts at fetched SFI `main` `737945f73`; Backend starts at
`75d0306`. The original checkouts are preserved. The approved board review is
published as paired draft pull requests targeting `main`; merging and deployment
remain outside this review.

## Start from the sfi-foundation root

The stable Windows and WSL URLs are:

- Home: <http://localhost:4600/>
- Public search: <http://localhost:4600/sfi-specs/>
- Dashboard/reminders: <http://localhost:4600/sfi-manufacturer-demo/>
- API health: <http://localhost:8606/api/sfi/health>

```bash
cd /home/ruhaanb622/sfi-foundation
./start-sfi-board-review.sh start
```

The workspace-root wrapper is a local convenience outside either repository. The
versioned equivalent, with the same prepared workspace and fixture, is:

```bash
python3 worktrees/board-review/Frontend/scripts/sfi-board-preview.py start \
  --workspace /home/ruhaanb622/sfi-foundation
```

This detached launcher reuses `scripts/sfi-local-preview.py` from this worktree.
It selects the current board-review sources, including uncommitted changes, and
combines `_config.yml,_config.development.yml,_config.board-review.yml` with
`JEKYLL_ENV=development`. Jekyll uses `--watch --force_polling` for WSL; the existing
local Flask sandbox uses `--reload` with its stat reloader and debugger disabled.
It watches Python sources and `sfi_search_terms.json`. No delivery/jobs are enabled.

The launcher returns when both services are ready and leaves them running after
the terminal closes. After WSL shutdown or reboot, run the same `start` command.
It does not install an automatic boot service or alter another preview's launcher.
Repeated `start` is safe; unrelated owners of 4600/8606 cause a refusal, not a kill.

For a full refresh after **Jekyll config/plugin, dependency, environment, or
backend database-URI changes**, use exactly:

```bash
cd /home/ruhaanb622/sfi-foundation
./start-sfi-board-review.sh restart
```

`refresh` is an alias of `restart`. Ordinary HTML/Markdown/JS/CSS and backend source
edits rebuild/reload automatically. Refresh the browser at the same URL after the
build finishes (the full Jekyll site typically takes 40–60 seconds). Browser
LiveReload is not enabled. A hard refresh can clear an already loaded old script.
Jekyll config/plugins are not hot-reloaded. Restart after dependency installation;
if the actual database schema changes, follow its explicit migration workflow
against the isolated fixture first. Restart does not run migrations or erase data.

Inspect or stop only this paired preview:

```bash
./start-sfi-board-review.sh status
./start-sfi-board-review.sh stop
```

The launcher owns ports 4600/8606 only. On inspection, 4500 was serving
`worktrees/restored-original/Frontend` (not account-sidebar or board-review), calling
the original Backend on 8605. Both were left untouched. The original 4600 board
process used the correct configs but `--no-watch`; its backend lacked reload.
Additionally, Jekyll excludes `_internal` from both output and its default watcher.
The existing demo plugin now removes only that watcher exclusion when BOTH demo
controls are enabled. `_internal` remains excluded from public output, and the
normal production/default-off gates remain unchanged.

The prepared fixture is preserved at
`/home/ruhaanb622/sfi-foundation/sfi-private-data/board-review/preview.db`, outside
`/tmp` and both Git repositories. The launcher copied it using SQLite backup from
`/tmp/sfi-board-review.db`, leaving the original untouched. It never overwrites an
existing fixture. If both copies are absent, it calls the existing preparation
helper against a NEW SQLite file and the supplied private source directory; live
official PDF validation then requires network access. A failed validation is not
silently turned into approval. Keep its provenance report outside Git.

Logs/state:

- Frontend: `/tmp/jekyll4600.log` (regenerations and errors).
- Backend and launcher state: `reports/board-preview-live/backend.log` and
  `backend.json` (tracks the reloader supervisor so restart stops its own children).
- Verification: `reports/board-preview-live/` (browser, Windows and reversible-edit
  evidence). The local standing instruction is in root `AGENTS.md`.

Ruby/Python dependencies are already installed; the ignored `node_modules` link
reuses the original frontend dependency installation. The source worktrees remain
`worktrees/board-review/Frontend` and `worktrees/board-review/Backend` on
`demo/board-review-20261125`. The launcher does not change Git branches or the local
Git selection used by the restored/account previews.

## Meeting walkthrough (about four minutes)

1. On Home, click **Find Specifications**. Leave **All** categories selected.
   Search `1.1`: Spec 1.1 ranks first, once. Other specifications mentioning that
   number are legitimate matches. Open its approved PDF in a new tab.
2. Search `racing gloves`: Spec 3.3 appears once through the existing product-term
   search, with its approved official PDF. Category selection is optional.
   Search `3.2A` to show **Current PDF unavailable for review** with no PDF link in
   this fixture. An unapproved local file or old path cannot become a public action.
3. On the board-review Home page, click **Manufacturer Dashboard**, or open
   <http://localhost:4600/sfi-manufacturer-demo/> directly. This homepage link
   requires development mode and the existing `sfi_manufacturer_demo: true` flag;
   it is absent from default and production builds. Explain that all five models
   belong to **Fictional Apex Safety Lab**.
   G1 is selected on load. The compact model list and detail panel show its Spec 3.3
   mapping, three test statuses (Passed, Pending, Retest required), sample retest
   `2027-02-15`, and certification expiration `2027-03-31`. Search and status
   filters remain visible. Tab to a model and press Enter/Space, or use Up/Down
   and Home/End, to change the shared details/reminder selection.
4. Explain that manufacturer renewal/retesting dates and a racer's individual-item
   recertification period are separate. Test names, mappings, statuses and dates
   are illustrative. Renewal calculation is unimplemented pending Jennifer.
5. Scroll to **Expiration reminder previews**. Keep **Apex Glove G1** selected. The three compact rows appear directly below
   its test table. Expand a row to review its full message and fictional recipient:

   | Timing | Reminder date | Manufacturer certification expiration |
   | --- | --- | --- |
   | Two calendar months before | January 31, 2027 | March 31, 2027 |
   | Two weeks before | March 17, 2027 | March 31, 2027 |
   | On expiration | March 31, 2027 | March 31, 2027 |

   Each expanded row contains the model, expiration, date, fictional recipient
   `quality@example.invalid` and reviewable wording. These are previews, with no
   delivery, jobs or testing appointments. Select G2 in the model list to show details and reminders follow the same
   selection. **Demo controls** groups the simulated date/time, timezone,
   selected model expiration, and advanced intervals. **Reset demo** restores G1,
   fixed dates, all sample edits and filters without a browser refresh.

The short **About retesting & recertification** disclosure explains the separate
manufacturer and racer requirements. The advanced interval sandbox is retained
under Demo controls in its own disclosure. Its intervals
start disabled and do not hide the three board previews. The fixed preview instant
is November 25, 2026, 20:00 UTC. Month subtraction clamps at month end; two weeks
is 14 calendar days. Expiration-day inclusivity/timezone conventions are proposed
demo behavior, not confirmed SFI policy.

## Compact dashboard review

The model list and selected details share one selection; reminder rows expand in
place. G1 is the initial selection. The list uses native buttons with pressed
state and retained focus, with Up/Down and Home/End navigation. Enter and Space
activate a focused model. Filtering selects a matching model; zero matches hide
the detail panel and disable the expiration editor.

Local verification evidence is in `reports/board-preview-live/dashboard-redesign/`
at the workspace root. Windows Edge was exercised at 1366×768 and 390×844,
including selection, message expansion, search/status filters, expiration edits,
reset, and responsive stacking. The three G1 dates fit in the desktop initial
view. The focused manufacturer tests and fresh default/production artifact
exclusion scans passed. No demo flag, production configuration, database, or
launcher selection was changed for this redesign.

## PDF revision process and Jennifer's decisions

See the paired [backend guide](https://github.com/SFI-Foundation/Backend/blob/demo/board-review-20261125/docs/sfi-board-review.md) for the
implemented revision/approval workflow. No PDF uploader was added. The existing
process reconciles reviewed source lists, keeps original PDFs privately, validates
official public PDF bytes and revisions, and exposes only fresh approved links.

Jennifer still needs to confirm:

- Who owns the authoritative revised PDF and source lists, approves the effective/
  edited/revised dates, resolves list/PDF disagreements, and publishes replacements.
- Whether official SFI links remain the publication channel; any future hosted
  copies need permission, audience/access rules, and replacement/retention policy.
- Per-model applicable specs/ratings, required tests, status meanings and whether
  models can share test evidence. The demo's test names are not requirements.
- How manufacturer retest and certification expiration dates are determined,
  which event starts each clock, renewal/grace rules and how they differ from
  racer recertification. No renewal formula is implemented.
- Whether the proposed reminder timings, recipient, wording, month-end convention,
  expiration inclusivity and timezone fit SFI's workflow. Delivery/appointments
  remain outside this prototype.

## Verification

The final local verification record is in
`/tmp/sfi-board-browser-evidence/results.json`, with desktop/mobile screenshots.
Normal homepage → public search → real catalog API → official PDFs was exercised.
All 111 specs appeared once across all result pages. The dashboard showed five
models and individual test statuses; all three reminder dates, selection changes,
month-end behavior and refresh reset passed without mutation requests.

The existing gate still requires BOTH `JEKYLL_ENV=development` and boolean
`sfi_manufacturer_demo: true`. Production rejects opt-in. Production and default-off
development artifacts returned 404 for the dashboard, reminder dataset and internal
source over HTTP (local verification ports 4601/4602). The production artifact scan
covered 2,113 files and found no fictional data or known credential values.

Persistent copies of the browser results/screenshots and test logs are in
`/home/ruhaanb622/sfi-foundation/reports/board-review-20261125/`.

Files changed, relative to each review worktree:

| Frontend | Backend |
| --- | --- |
| `_internal/manufacturer-demo.md` | `sfi_search_terms.json` |
| `_internal/manufacturer-demo.js` | `scripts/phase1_local.py` |
| `_sass/sfi/pages/_manufacturer.scss`, `_sass/sfi/_main.scss` | — |
| `index.md` (development-gated homepage link) | — |
| `_config.board-review.yml` | `scripts/prepare_board_review.py` |
| `scripts/test-sfi-manufacturer-demo.mjs` | `tests/test_phase1_catalog.py` |
| `scripts/test-sfi-board-review-browser.cjs` | `tests/test_board_review.py` |
| `docs/sfi-board-review.md` | `docs/sfi-board-review.md` |
| `_plugins/internal_demos.rb` | — |
| `scripts/sfi-local-preview.py` | — |
| `scripts/sfi-board-preview.py` | — |

Workspace-root additions: `AGENTS.md` and `start-sfi-board-review.sh`.

Checks used:

```bash
npm test
npm run test:phase1
node --test --test-isolation=none scripts/test-sfi-manufacturer-demo.mjs scripts/test-sfi-spec-search.mjs
ruby scripts/test-sfi-demo-gates.rb
SFI_BUILT_SITE=/tmp/sfi-board-public-site node --test --test-isolation=none scripts/test-sfi-public-cleanup.mjs
```

Frontend unit checks passed, including 18 focused search/manufacturer tests and
three production artifact checks. Existing unrelated Sass deprecations and Jekyll
post/route warnings remain. The sandbox registers the real authenticated profile
and settings routes so the shared header receives guest 401s rather than misleading
404 service errors. No real accounts are loaded.

Browser reproduction (serve the two gated artifacts first):

```bash
LD_LIBRARY_PATH=/tmp/sfi-board-libs/usr/lib/x86_64-linux-gnu \
PLAYWRIGHT_MODULE=/tmp/sfi-board-browser/node_modules/playwright \
CHROME_PATH=/home/ruhaanb622/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell \
SFI_PUBLIC_URL=http://localhost:4601 SFI_DEMO_OFF_URL=http://localhost:4602 \
node scripts/test-sfi-board-review-browser.cjs
```

The installed headless browser may download a PDF instead of displaying a viewer.
The check verifies the new tab, the actual requested official URL and HTTP 200 PDF
bytes. The fixture uses real PDF verification, not browser request interception.

## Preview repair verification

The stale 4500 URL was verified by listener PID, command and `/proc/PID/cwd` to be
`restored-original/Frontend`, with API origin 8605. The separate board server had
`--no-watch`. Both board worktrees include the original uncommitted capstone edits.
The root launcher now serves that exact source at 4600, calls 8606, and persists
the prepared fixture outside `/tmp`. Other preview processes/launchers stay intact.

Reversible browser probes changed Home and `_internal/manufacturer-demo.js`, saw
both changes via the running pages, restored the exact bytes, and observed the
original views. The edit/restore cycle took 58 seconds. A temporary product-term
alias in backend JSON appeared in the normal public search after stat reload,
then disappeared when restored. Probe results/backups are in
`reports/board-preview-live/live-update-results.json` and `live-update.log`.

Windows PowerShell received HTTP 200 for Home, Search and Dashboard and verified
the real 8606 API response. A separate Windows Edge headless profile rendered G1,
its three test statuses and all reminder dates. Its output is in
`reports/board-preview-live/windows-check.log`. The user's existing interactive
browser tab/profile was not inspected or modified. Visit the 4600 links above;
the preserved older preview at 4500 intentionally continues to serve its own source.

The full normal browser walkthrough (Home → Find Specifications, both search
examples, real approved PDF links/bytes, unavailable 3.2A, dashboard/reminders) is
saved under `reports/board-preview-live/browser/`. Launcher repeated-start and
full-restart checks also passed. Backend reload uses a private supervisor session;
restart validates the port owners and stops only its own parent/child processes.
The same root command works after closing a terminal or after WSL/reboot.
