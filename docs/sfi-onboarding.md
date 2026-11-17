# Optional motorsports onboarding

New registrations enter **Tell Us About Yourself** after the existing login-cookie
verification. Existing members can open **Edit Preferences** on `/sfi-profile/`.
All eight questions are optional:

1. Motorsports involvement, including manufacturer, driver, team, sanctioning
   body, inspector, distributor, organizer, engineer, staff, enthusiast, and other.
2. Reasons for visiting SFI Foundation.
3. Motorsport disciplines, described as interests rather than official programs.
4. Optional organization name, website, and position.
5. SFI resource interests.
6. One primary goal, with an unanswered option.
7. Update interests, explicitly separate from email subscription consent.
8. Plain-text additional information, limited to 500 characters.

Native checkbox cards support multiple selections. The explicit unanswered and
not-applicable options are exclusive. Save sends changed fields only; skip writes
nothing, and asks before discarding edits. A dirty form has browser navigation
protection. Loading, saving, success, validation, and authentication-expiry states
retain usable controls and preserve unsaved input where appropriate.

The form uses the existing SFI Sass tokens, two-column cards on wider screens,
one column on phones, visible keyboard focus, fieldsets/legends, associated labels
and errors, and live status feedback. It adds no framework, package, or animations.
The legacy community-interest summary/editor remains available in collapsed sections.
Saving a display name or legacy interests preserves unsaved onboarding edits.

Recommendations use saved preferences to order links to existing specification
search/document discovery, programs/services, About, and news/events pages. They
do not filter public access or link to excluded prototype manufacturer data.
Organization fields are unverified, and editable classifications never determine
permissions. The existing role display and administrator controls continue to use
trusted backend authorization data. Update interests do not start notifications.

## Backend dependency

Release this frontend only with the compatible Foundation Backend profile API:

- `GET /api/sfi/profile` includes `preferences` while retaining existing fields.
- `PATCH /api/sfi/profile/preferences` accepts validated partial JSON updates and
  returns the refreshed profile.
- Prepare the additive `sfi_onboarding_preferences` table using backend
  `scripts/migrate_sfi_onboarding.py` before serving the updated API.

The browser sends existing cookie credentials with caching disabled. Preference
text is assigned through safe form values/text nodes and never inserted as HTML.
No preferences are put into authentication tokens.

## Verification

```sh
npm test
node --test --test-isolation=none scripts/test-sfi-profile.mjs scripts/test-sfi-onboarding.mjs scripts/test-sfi-gear.mjs
JEKYLL_ENV=production bundle exec jekyll build --destination /tmp/sfi-onboarding-site
npm run test:styles -- /tmp/sfi-onboarding-site
npm run test:redesign -- /tmp/sfi-onboarding-site
SFI_BUILT_SITE=/tmp/sfi-onboarding-site npm run test:public-build
node scripts/test-sfi-integration.mjs <backend-python> <backend-checkout> /tmp/sfi-onboarding-site
```

`scripts/test-sfi-onboarding-browser.mjs` accepts the backend Python executable,
backend checkout, built site, and screenshot output directory. Supply a locally
available Playwright module through `PLAYWRIGHT_MODULE`, and optionally a Chromium
binary through `CHROME_PATH` and system libraries through `LD_LIBRARY_PATH`.
It requires permission to launch Chromium and bind the disposable Flask Unix socket.
It never connects to a live database and aborts external website requests.

The browser checks the real registration/save/reload/edit flow, cookie auth, API
enum compatibility, skip without a write, keyboard controls, focus, text contrast,
unsaved-navigation guards, safe rendering, public destinations, denied privilege
claims, and retained administrator access at 1440, 1024, 768, 390, and 320 pixels.
Automated checks do not replace a complete manual screen-reader review. Concurrent
edits have no conflict-resolution UI; update preferences are not mailing-list consent.
