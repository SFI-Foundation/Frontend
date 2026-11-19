# Authenticated SFI account navigation

The current [OCS-style navigation and deployment report](sfi-account-navigation-ocs.md) verifies the visible account name, including when mobile navigation is collapsed, and identifies the failed Pages build that keeps the public site on older code.

The [Admin/profile consistency follow-up](sfi-account-navigation-follow-up.md) documents the reproduced mismatch, its fix, and screenshots showing Admin in the account/profile page and header together.

## Investigation

The SFI header rendered `/login/` as an unconditional link in `_includes/sfi/nav.html`. Its `navigation.js` only controlled the mobile navigation. Login and profile controllers already emitted `sfi-auth`, but only the footer subscribed; the SFI header did not validate or follow the session. The footer also performed its own independent lookup. The retained OCS login module targets `#loginArea` in legacy classroom layouts, rather than this header. In addition, the login page treated every initial lookup failure as logout, including temporary server/network failures.

The backend already supplies everything this change needs. `/api/authenticate` creates/deletes the existing HTTP-only JWT cookie; protected APIs also support Flask-Login sessions. `/api/sfi/profile` returns the authenticated user's current name, username, role, onboarding preferences, interests, and `can_manage_roles`. Its responses are `no-store`. The User model stores a single editable full display name (`_name`), username (`_uid`), and email (`_email`); it does not have separate first/last-name columns. Onboarding answers are optional data, not authorization. Administrator permission comes from the current database role or administrators-group membership.

Frontend main started at `b6151edbb`; backend main at `75d0306`. Origin, SFI, and upstream references were fetched. Separate worktrees/branches preserve the original checkouts, local feedback work, environment files, databases, and user accounts. The backend needs no source change or paired PR.

## Session behavior

`auth.js` maintains UI state in memory and validates the existing cookie with credentialed, uncached requests to `/api/sfi/profile`. The account slot starts in a neutral loading state. A 401 shows Sign In; timeouts, malformed responses, 403s, server failures, and network failures do not declare logout. A known identity remains displayed during temporary failures. An initial failure exposes Retry. Validation has a ten-second timeout and repeats on focus, visibility, reconnect, back/forward restoration, and every minute while visible.

Login validates the cookie after authentication before updating the header, without reloading. The existing profile controller supplies its successful server response immediately after edits. Request generations and account epochs prevent older responses from restoring a previous identity. Logout uses the existing DELETE endpoint and clears the account control and account preferences only on success or a confirmed 401.

Tabs broadcast only a non-personal invalidation message through BroadcastChannel. Each receiving tab verifies its own current cookie. Existing private pages reload on another tab's account/profile change so old account forms cannot remain visible. Guest preferences stay separate. Account details and authentication tokens never enter localStorage or tab messages.

## Menu and routes

The control shows first/last name when present, then SFI's full `name`, username, an email-derived name, or a localized generic label. Names use textContent and are excluded from translation. Long names retain their complete accessible text and tooltip while narrow layouts may ellipsize them.

| Menu item | Existing destination / authorization |
| --- | --- |
| My Profile / Mi perfil | `/sfi-profile/` |
| Edit Preferences / Editar preferencias | `/settings/` |
| Admin Dashboard / Panel de administración | `/admin/`, only when the authenticated profile returns `can_manage_roles: true` |
| Sign Out / Cerrar sesión | Existing credentialed `DELETE /api/authenticate` |

The general OCS classroom dashboard is not an SFI account dashboard, so no unrelated Dashboard link is added. Existing backend authorization still protects administrator APIs independently of menu visibility.

The authenticated name uses the same text-link styling as the other navigation destinations, with native menu-button semantics and no Sign In button border. It remains visible when the mobile public-links panel is collapsed. The menu uses existing theme/accent tokens, an in-flow mobile layout, an account SVG icon, menu/menuitem semantics, visible focus, arrow keys, Home/End, Tab exit, Escape, and outside-click dismissal. A real-browser regression check covers restoring window focus while clicking an item; a null focus target must not cause the menu to disappear before the click arrives.

## Changed files

| File | Purpose |
| --- | --- |
| `_includes/sfi/nav.html` | Neutral, signed-out, authenticated, and menu markup |
| `_includes/sfi/footer.html` | Follow the same verified session without an independent lookup or stale account link |
| `_layouts/sfi.html` | Load the shared session and account-menu scripts |
| `_sass/sfi/components/_navigation.scss` | Account layout, theme styling, responsive menu and focus indicators |
| `assets/js/sfi/auth.js` | Existing-cookie validation, state, expiry, race protection, tab synchronization and logout |
| `assets/js/sfi/account-menu.js` | Safe name rendering, keyboard/pointer behavior and menu actions |
| `assets/js/sfi/locales.js` | English/Spanish menu strings |
| `assets/js/sfi/preference-sync.js` | Follow verified shared session state |
| `assets/js/sfi/profile.js` | Immediate name notification, stale-account guard and tab invalidation |
| `assets/js/sfi/logout.js` | Reuse shared logout while preserving the existing standalone route |
| `navigation/login.md` | Shared session validation, immediate updates, registration/logout synchronization, distinguish 401 from failures |
| `package.json` | Include account-menu tests in npm test |
| `scripts/test-sfi-account-menu.mjs` | DOM/session failure, race, localization, authorization and interaction tests |
| `scripts/test-sfi-account-browser.mjs` | Real Chromium → isolated Flask → disposable SQLite integration and axe checks |
| `scripts/sfi-settings-fixture.py` | Optional, disposable Admin/@admin and member accounts for the exact profile/header regression |
| `scripts/test-sfi-photo-assets.mjs` | Check primary links separately from nested account-menu/noscript destinations |
| `docs/sfi-account-navigation.md` | Investigation, verification and limitations |
| `docs/account-navigation/` | Synthetic-account screenshots and browser results |

## Verification

Backend: the existing isolated profile/settings/authentication suite passes **22 tests on SQLite and 22 on MySQL 8.4**, including registration, role escalation rejection, administrator access, account isolation, expired/invalid authentication, profile edits, logout, preference persistence and rollback. Only disposable databases were used. No backend change is required.

Frontend: `npm test` passes. Running its suites together with existing account-route and specification-search tests without subprocess isolation passes **79 tests**. The production Jekyll build, generated API configuration checks, scoped Sass checks, photographic redesign checks, and **7 production-artifact/search/photo tests** pass. The existing registration/onboarding Chromium suite passes at 320, 390, 768, 1024 and 1440px.

The account browser suite passes at **320, 375, 768, 1024 and 1440px**, using real browser cookies and the existing isolated Flask HTTP fixture with disposable accounts. It covers login without a manual refresh, neutral refresh loading, profile edits, settings links, keyboard and touch-sized menus, logout, cross-tab name/logout/account changes, member 403/admin 200 permissions, onboarding staff claims, HTTP-only cookie expiry, 503/network failures and identity isolation. Admin and member headers, both themes, both languages and all seven accents pass **280 axe WCAG A/AA header audits with zero violations**. `results.json` records the completed runs and audit results.

To reproduce the browser suite, supply installed Playwright and axe-core/playwright modules, Chromium and any required system libraries, then run:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright AXE_MODULE=/path/to/@axe-core/playwright \
  node scripts/test-sfi-account-browser.mjs /path/to/backend/venv/bin/python \
  /path/to/backend /path/to/production-site /path/to/evidence
```

`SFI_ACCOUNT_SMOKE=1` restricts the test to 1440px and the default accent for a faster diagnostic. `SFI_ACCOUNT_SMOKE=responsive` tests 1440px and 375px, including the full Admin sign-out path. These focused runs do not replace the default full matrix.

## Screenshots

All identities are disposable test accounts retrieved from Flask.

![Signed out, desktop](account-navigation/signed-out-1440.png)
![Signed in, desktop](account-navigation/signed-in-1440.png)
![Desktop account menu, Spanish and dark theme](account-navigation/dropdown-dark-es-1440.png)
![Mobile account menu](account-navigation/dropdown-375.png)

## Limits

Production and deployment are untouched. Browser verification uses Chromium with local-development cookies; production authentication continues to depend on the existing HTTPS cookie policy, CORS allowlist and browser cookie availability. Only a confirmed 401 expires the UI; while a tab is continuously visible, expiry detection can take up to one minute between checks. Browsers without BroadcastChannel revalidate on focus/visibility and the periodic check. Cross-tab account changes reload private pages and may discard unsaved edits there.

The existing production build reports Sass deprecations and duplicate legacy capstone destinations. They are outside this authentication change. Automated axe coverage is scoped to the modified header and account menu, rather than a complete audit of the legacy site.
