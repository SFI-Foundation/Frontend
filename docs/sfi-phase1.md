# Phase 1 frontend delivery

The existing `/sfi-specs/` Jekyll page and scoped SFI Sass remain in use.
`assets/js/sfi/spec-search.js` uses the existing Flask list/search/categories/stats
routes. Search ranking, canonical identities, category membership and counts are
owned by the backend. Cards show full specification numbers, product descriptions,
revision labels, all associated categories, and product-specific recertification
rules. Only verified current official URLs produce PDF actions. The experimental
showcase/classifier UI is retained in excluded `_internal/specification-research.md`.
Legacy admin authorization remains server-enforced; the browser does not grant roles.

Search has a labeled native search form, explicit Clear, pressed category buttons,
a live loading/count region, empty/error/retry states, race protection, and
Previous/Next pagination. API-controlled text is escaped and PDF actions have a
second client-side official-host/status check. Existing styles remain scoped.

`/sfi-manufacturer-demo/` is unavailable by default. The retained development-only
prototype in `_internal/` contains five
synthetic registrations, sample revisions, search/status filters, editable sample
expiration dates, timezone/preview-instant controls, independently enabled
calendar-month/day intervals, upcoming/overdue lists and notification previews.
Six months is a calendar interval with month-end clamping, not an assumed number
of days or a universal recertification schedule. Expiration is inclusive in the
selected timezone; overdue begins the next local day. The demo never reads
accounts, fetches manufacturer records, saves data, schedules tasks, or sends
messages. Refresh resets all sample changes. Reminder previews start disabled.
Only `JEKYLL_ENV=development` plus the explicit `_config.development.yml` overlay
emits the page and dataset. Production opt-in fails; public requests cannot enable it.

## Run

Start the migrated/imported isolated catalog server from Backend using
`python scripts/phase1_local.py --database sqlite:////tmp/sfi-phase1-local.db --port 8605`.
See the sibling Backend's `docs/sfi-phase1.md` for preparation, migration, import,
API/schema documentation, secure document options and rollback instructions.

From Frontend:

```bash
npm ci
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4000 --baseurl "" \
  --destination /tmp/sfi-phase1-preview
```

Open `http://localhost:4000/sfi-specs/`. The shared existing API config
selects localhost:8605. Full-app classifier/profile functionality requires the
normal backend with an isolated database; the focused catalog sandbox has no
real accounts or classifier endpoint unless synthetic QA accounts are explicitly requested.
See [public cleanup verification](sfi-ui-cleanup-verification.md) for the current
isolated review commands and development prototype URL.

## Verification

Executed: `npm test`, `npm run test:phase1`, `npm run test:styles -- /tmp/sfi-phase1-site`,
Node syntax/inline-script checks, and a full Jekyll build. All passed. The two new
DOM/date suites contain twelve Phase 1 cases and were also run directly. Chromium against
the real local API verified 16.1 search, public PDF action, clearing, canonical
total 111, pagination, empty state, 390 px mobile widths, demo search and disabling
the six-month interval, with zero page JavaScript errors. The broader site emits
pre-existing Jekyll duplicate-route/post-tag warnings.

Manual checks: Tab and Enter through search/category/page controls; inspect
3.2A rating rules; compare All/category counts; search harness and full spec
numbers; test no-match/offline retry; open verified PDFs; narrow the viewport;
change fictional expirations, timezone and preview instant; turn off every
interval; test a month end/leap year and local midnight; refresh to reset demo.
Do not treat demo records as real certifications.

## Git and release

Work is local on `feature/sfi-phase1-spec-search`, based on
`3273784f303993d3a535d62b41debc69786cff12`, in an isolated worktree. No pushes,
merges, deployment or production changes occurred. The existing tracked `.env`
contains API-key/password variables; credential owners must review them. Existing
mirrored PDFs, game ZIP and ~84 MB HTML asset were left unchanged. No private
source documents, databases, credentials or caches were added.

Review both repositories together, resolve/document source exceptions, finish
credential review and test the target database before opening the coordinated
PRs. Roll back application changes with normal revert commits after approval;
never force-push or remove user data. The manufacturer prototype has no durable
state or outbound notifications to roll back.

## Independent-review repairs

Slash-qualified 20.1/1 and 20.1/2 now search independently. Cards expose the five
public PDF states and suppress every non-current action. Typing invalidates old
requests immediately, including the debounce interval; category/submission changes
cancel pending timers. Mobile search no longer inherits a 240px input height.

The admin form edits the canonical current revision, preserves approval on
normalized no-op/product-only saves, and archives/restores complete identities
with explicit confirmation while preserving underlying rows. The archived toggle
uses an authorized endpoint. The existing gear-review PUT client is supported by
the backend's permission-checked compatibility route.

Every reminder checkbox and number has a separate explicit label. Numeric controls
have associated bounds/help/errors, aria-invalid feedback and visible keyboard
focus; disabling an interval disables its number field. Dashboard selects also
have explicit labels. Dashboard/reminder control alignment and mobile wrapping
were reviewed in Chromium screenshots.

Full final acceptance, commands, known release conditions and screenshot index:
[sibling Backend repair report](../../Backend/docs/sfi-phase1-repairs.md).
Screenshots remain ignored under `qa-evidence/`, also accessible from
`../qa-evidence/`. No evidence images, private sources, databases or credentials
are included in commits. The sandbox can prepare/start with `--demo-accounts`;
open `http://localhost:8605/local-demo/` to select an authorized fictional role.
