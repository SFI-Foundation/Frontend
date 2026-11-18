# Teacher database and preferences verification

Date: 18 November 2026. Development starts at Frontend `7de38d591` (merged
PR #35) and Backend `a850ce8`. Work is isolated from the original checkouts in
`preferences-sync/Frontend` and `preferences-sync/Backend`. Existing uncommitted
backend feedback/configuration work, databases and backups were preserved.

The verified story is Settings → authenticated JSON API → current user's SQL
record → another browser's settings/theme/translated UI. Profile editing follows
its existing API and users table. Both use existing cookie/token authentication.
No production deployment, production migration, real customer account change or
physical phone verification was performed.

| Teacher requirement | Implementation location | Verification method | Status | Remaining limitations |
| --- | --- | --- | --- | --- |
| Database setup | Backend `__init__.py`, `.env.example`, `scripts/migrate_sfi_settings.py` | Real disposable SQLite and MySQL 8.4 account suites; schema repeat and rollback protection | VERIFIED | Production database is outside this task's authorized test environment |
| `.env` configuration | Backend `security_config.py`, `testing/test_sfi_settings_config.py`, README | Temporary source copy loads generated `.env` from another cwd; environment overrides; invalid port/name/credentials fail | VERIFIED | Existing `.env` was never overwritten; production secrets must be supplied by operator |
| Account login | Existing `/api/authenticate`, `/api/id`, profile suite | Member/admin cookie login, logout, protected endpoints, privilege denial; real Chromium UI | VERIFIED | Manufacturer is an onboarding interest, not a privileged account type |
| Profile editing | Existing `/api/sfi/profile`, `profile.js` | Display-name edits checked in SQL, after refresh, reconnect and login; validation and failure rollback | VERIFIED | Supported public editor changes display name and optional answers, not email/password |
| Preference functionality | `preferences.js`, `preference-sync.js`, Backend `/api/sfi/settings` | Validated settings, debounce, no-store API, guest/account precedence, reset, isolation, failed-save retry, stale-write rejection | VERIFIED | No notification delivery or unsupported search sorting/layout options |
| Theme customization | `_sass/sfi/`, static allowlisted accent palettes | Cross-page Chromium matrix: seven accents in light/dark at desktop; responsive checks; OS theme and reduced motion | VERIFIED | Real device display still requires human review |
| Language switching | `locales.js`, `localization.js` and shared shell | Actual Spanish headings/labels/status text on home/login/profile/search/settings; reload, navigation and return to English; static coverage audit | VERIFIED | Other four languages are partial previews; source documents remain unchanged |
| Accessibility preferences | Global HTML attributes/tokens, shared Sass, detector upload control | Larger text/targets, high contrast, focus, underlines, motion, responsive/keyboard checks; axe on 13 active routes | PARTIALLY VERIFIED | Automated scan/matrix passed; assistive technology and physical-device usability need human review |
| Hardcoded color audit | `scripts/audit-sfi-preferences.mjs`, `preferences-evidence/color-inventory.json` | Source inventory classifies palettes, fixed status colors, inverted photography/camera/brand assets and disconnected legacy | VERIFIED | Inventory covers SFI application sources; archived classroom/vendor projects are separate applications |
| Cross-device persistence | Backend `sfi_account_settings`, revision-checked PATCH; frontend lifecycle | Two independent Chromium contexts retrieve SQL-backed dark/purple/Spanish/large settings; reverse update, second-account isolation; SQL proof via private test IPC | VERIFIED | Consistency after login/refresh, not live push; production host cookies need deployer verification |

## Evidence

- Backend profile/account suite: **22 passed on SQLite and 22 passed on MySQL 8.4**.
  Real source copies and synthetic users only. Persistence includes a fresh backend
  process reopening the same database. Tests preserve existing credentials, roles,
  onboarding/profile data; malformed values/ownership/role injection, stale revisions,
  unapproved origins, oversized/non-JSON requests and SQL failures are rejected.
- Backend general regression suite: **77 tests run, 74 passed, 3 skipped**. The three
  skips are the separate opt-in catalog MySQL suite requiring a differently named
  fixture. These skips are not counted as passes. Catalog approval/invalidation,
  role permissions, gear moderation and protected routes remain covered.
- Configuration suite: **2 passed**, including real `.env` loading and invalid setup.
- Frontend `npm test`: **5 test files passed**; `npm run test:settings`: **36 tests passed**; `npm run test:phase1`: **3 test files passed**. The dedicated synchronization tests include offline guest persistence, failed first saves at revision zero, late responses after logout and switching accounts while a save is in flight.
- Chromium: **286 theme/responsive checks**, all 13 active routes at 1440/1024/768/390/320 pixels; all seven accents in light/dark at desktop, purple light/dark at the other widths. Computed page backgrounds, accents, enlarged font size and reduced motion are checked, alongside overflow. **13 axe scans, zero violations**, in the dark/high-contrast tested configuration. This is not a declaration of complete WCAG compliance across all possible states.
- Localization coverage: **770 English/Spanish keys each**, 14 rendered SFI routes, **zero unmatched static application strings** after explicit exclusions for official/source/identity/attribution content. Each partial-preview language has 8 keys and English fallback. Browser-native controls and validation follow the browser’s locale.
- Built paths: **15 pages, 489 internal navigation/asset targets passed**. Scoped Sass: **30 imports passed**, one generated stylesheet and no inline quiz/admin presentation. Photography/redesign checks passed; the public-build suite passed **7 tests**.
- Jekyll full build: succeeds with pre-existing upstream Sass/post warnings. Static
  build success is separate from browser behavior; the browser uses generated HTML.
- The isolated demo API starts on **8865**, returns 23 synthetic canonical entries,
  and is stopped after testing. The existing development API on 8605 is untouched.

Machine-readable results are in [preferences-evidence/README.md](preferences-evidence/README.md). Screenshots: [Spanish Settings](preferences-evidence/spanish-dark-settings.png) and [Spanish mobile homepage](preferences-evidence/spanish-home-mobile.png). The final focused smoke also verifies normal public registration, optional manufacturer onboarding without privilege escalation, keyboard access to the persistent gear, failed profile updates and offline guest recovery.
The initial report is [preferences-initial-audit.md](preferences-initial-audit.md).
Use [customer-preferences-demo.md](customer-preferences-demo.md) for the exact
customer sequence and a disposable live API.

## Security and synchronization contract

Only current-account GET/PATCH is exposed; identity cannot be supplied in JSON.
The additive table stores presentation settings and a revision, never auth secrets,
privileged roles or user names. API values are strictly allowlisted. JSON PATCH
follows existing authentication and exact-origin credentialed CORS/preflight
rules. The endpoint bounds payloads at 16 KiB. It adds no new rate limiter.

Existing server settings win at login. A first-time account uses defaults; guest
settings are not silently uploaded. The existing JSON export/import gives an
explicit transfer path. When the account service is unavailable before authentication is established, guest preferences remain local and an explicit outage/retry message is shown. Account settings stay in memory; guest settings retain a
separate localStorage record. Logout restores guest settings. Generation checks
prevent late network responses from applying an old account's state.

Changes apply locally while saving. The UI distinguishes loading, saving, saved,
error/retry and 409 conflict. Conflicts require explicitly loading the newest
server values; unsaved changes are replaced only through that action. Loading
controls are disabled to prevent edits being silently lost during hydration.
Page exit flushes pending changes with keepalive; the demonstration still waits
for saved feedback. A network/browser shutdown can prevent completion.

Remembered category values remain browser-local with opt-in; the opt-in setting
synchronizes. No search query is stored. Official specification names/numbers,
manufacturer identities, source documents, news titles, attribution/license text
and user content remain unchanged. PDFs are never automatically translated.

## Reproduce locally

From the paired Backend with its virtualenv active:

```bash
python testing/test_sfi_settings_config.py
python testing/test_sfi_profile.py
PYTHON_DOTENV_DISABLED=1 SFI_DATABASE_URI=sqlite:// python -m unittest discover -s tests -v
```

From Frontend:

```bash
npm install
npm test
npm run test:settings
npm run test:phase1
bundle exec jekyll build --baseurl '' --destination /tmp/sfi-local --disable-disk-cache
node scripts/audit-sfi-preferences.mjs /tmp/sfi-local docs/preferences-evidence
```

Install external test tools and run the browser command from the README with
`../Backend/venv/bin/python`, `../Backend`, `/tmp/sfi-local` and an evidence directory.
It refuses to substitute mocked API success for real HTTP/cookie/database checks.
`CHROME_PATH` can select an installed Chromium. Native runtime libraries and
permission to open local sockets are required.

For MySQL, use only a new localhost schema prefixed `sfi_preferences_qa` at port
13376 and provide `SFI_QA_MYSQL_URI` privately through the environment. The tests
refuse other hosts/prefixes/ports and retain their synthetic rows. MySQL and SQLite
results are recorded separately; one does not stand in for the other.

## Remaining deployment and manual checks

The deployer must supply approved production DB/network access, secrets and
HTTPS cookie/domain configuration, review the additive migration against their
schema/backup procedures, deploy the paired backend and frontend, and verify CORS
and authentication on the actual host. None of those production actions was taken.
French/German/Chinese/Japanese remain previews. Chromium emulation is not a phone.
Screen-reader pronunciation, real camera/model downloads, touch ergonomics and
customer editorial approval of Spanish should be reviewed by people. Firefox and
WebKit are not installed and are not counted as verified browsers.

## Review branches

Backend draft: [SFI-Foundation/Backend #47](https://github.com/SFI-Foundation/Backend/pull/47), commit `b5da4b4a7cb3cc2d89fd60cc822bf509ddaa4570`. Frontend branch: `feature/sfi-preferences-localization-sync`. Both target main; no merge or deployment is authorized by this report.
