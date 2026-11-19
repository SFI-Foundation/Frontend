# Remove the persistent account-saved status

After successful account preference loading or saving, the shared status row is
removed from the DOM. Its message, Retry placeholder, margins and padding no
longer occupy space below the navbar. This applies to every page using the shared
SFI layout; the navbar and page-specific spacing are unchanged.

Loading, saving, errors, conflicts and offline recovery still render the existing
feedback. A later failure recreates the row with a working Retry button, and a
successful retry removes it again. The Settings page also omits its persistent
saved-status echo while preserving explicit confirmations for actions such as
resets and imports. No preference-saving, authentication, permission, theme or
localization logic was changed.

## Files changed

- `assets/js/sfi/preference-sync.js`: remove the status container on successful
  sync and recreate it when feedback is needed.
- `assets/js/sfi/settings.js`: suppress the persistent saved-status echo; retain
  action confirmations and error feedback.
- `scripts/test-sfi-preference-sync.mjs`: verify successful saves remove the row,
  failed saves recreate it, and Retry still saves the pending edit.
- `scripts/test-sfi-settings.mjs`: verify persistent success text is absent while
  action confirmations, errors and language switching remain functional.
- `docs/sfi-preference-status-cleanup.md`: this verification record.

The shared `.sfi-sync-status` CSS remains because error feedback and partial-language
notices still use it. Removing the successful-sync element removes all of its
spacing without changing those other components.

## Actual localhost verification

Chromium used **http://localhost:4500/** and the existing backend at
**http://localhost:8605**, with the existing local Admin account and database.
Normal login, layout, navigation and preference-read checks used real endpoints.

- Admin remains visible; its existing four-item dropdown, Edit Preferences,
  My Profile, Admin Dashboard and Sign Out work.
- The gear remains absent. No persistent account-saved message, status wrapper,
  Retry placeholder or extra navbar/main gap remains after successful sync.
- Home, Spec Search, About, News, Contact, Profile, Settings, Admin and Login were
  checked at 1440px and 375px. Account-menu/settings layouts also pass at 1024,
  768 and 320px, without horizontal overflow.
- Desktop and mobile screenshots were inspected: the home hero starts directly
  below the navbar, with no leftover white status strip.
- Guest theme, language and accessibility controls still apply and persist;
  existing Admin preferences hydrate from the real API and survive refresh.
- A separate read-only failure check intercepted only the settings GET to return
  HTTP 503. The existing Admin session remained valid, the error and Retry button
  appeared, and retrying against the real API succeeded and removed the row.
- No browser JavaScript errors. Sign Out restores Sign In after refresh.
- Live database and backend `.env` digests are unchanged. Existing frontend PID
  38186 and backend PID 2647 remain running. Unrelated changes are untouched.

Real-account screenshots and JSON results remain local, outside this repository,
under `reports/sync-status-cleanup/` in the enclosing workspace.

## Preference-saving regression checks

Actual account writes were exercised separately with generated accounts in
disposable Flask/SQLite copies, preserving the user's live database.

- `npm test`: all six configured test files pass, including the new feedback
  lifecycle assertions.
- The existing integrated Chromium suite passes with `SFI_SKIP_MATRIX=1`: real
  preference saves, cross-device retrieval, conflicts, failed-save recovery via
  the recreated Retry control, member/admin permissions, Spanish UI, keyboard
  account-menu access, registration and guest outage recovery. No JavaScript
  errors were recorded. The broad theme/layout matrix was not rerun in this suite.
- The existing Jekyll watcher rebuilt the changed scripts on localhost:4500.
  `git diff --check` passes.

The earlier gear cleanup and its regular-user verification limitation are recorded
in [sfi-navbar-settings-cleanup.md](sfi-navbar-settings-cleanup.md). Nothing was
merged or deployed.
