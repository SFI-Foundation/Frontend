# SFI blue-and-white styling polish

This continuation preserves the existing work on `sfi-unified-sass-theme`.
The preexisting document layout, account behavior changes, test scripts and
other uncommitted edits were retained.

## Architecture

`assets/css/sfi.scss` remains the single Jekyll entry, importing
`_sass/sfi/_main.scss`. Tokens and mixins load before component partials.
All public styles remain scoped to `.sfi-site`; classroom, vendor, notebook
and game styles are not imported or changed.

The OCS [Sass guide](https://pages.opencodingsociety.com/sass/guide) informed
variables, nested states, partial organization and reusable mixins. The
[capstone page](https://pages.opencodingsociety.com/capstone/sfi-foundation/)
informed the four-part feature presentation. Neither supplies SFI colors.

## Files changed by this continuation

SCSS:
- `_sass/sfi/_main.scss`: import the experience component, retaining document import.
- `_sass/sfi/_tokens.scss`: centralize public container width and existing hero colors.
- `_sass/sfi/_mixins.scss`: reusable responsive container and surface card.
- `_sass/sfi/base/_foundation.scss`: scoped body, heading, form and link baseline.
- `_sass/sfi/base/_layout.scss`: readable breadcrumbs and section labels.
- `_sass/sfi/base/_accessibility.scss`: white focus rings on blue surfaces and reduced-motion card/button states, retaining existing work.
- `_sass/sfi/components/_experience.scss`: four responsive cards with shared tokens and focus mixin.
- `_sass/sfi/components/_chatbot.scss`: SFI blue header, white panel, readable messages and input; retain existing gold launcher and behavior.
- `_sass/sfi/components/_navigation.scss`: bounded, scrollable mobile menu and inset yellow Spec Search action.
- `_sass/sfi/pages/_hero.scss`: centered responsive grid, official logo, white subtitle and readable Learn More action.
- `_sass/sfi/pages/_content.scss`: legible stat labels, spacing above homepage cards and overflow-safe feature columns.

Other:
- `index.md`: preserve all existing content; add the official hero logo and Core Experience.
- `scripts/test-sfi-visual.mjs`: extend existing browser checks to validate all four destinations, focus, viewport bounds, logo load and responsive hero alignment.

## Destinations

| Card | Existing destination |
| --- | --- |
| Search Standards | `/sfi-specs/#search` |
| Describe a Part | `/sfi-specs/#classify` |
| Inspect Equipment | `/detect/` |
| Track and Revisit | `/quiz/` (My Gear) |

## Verification

- **Full Jekyll build: PASS.** Configured remote Minima theme, complete repository,
  initial build 620.324 seconds, final rebuild 550.03 seconds. No fallback or
  production configuration edit needed. Both build invocations use the existing
  production incremental setting; the initial destination was empty. Existing
  classroom post-link/duplicate-destination warnings and Sass import deprecations
  remain.
- **Sass: PASS.** Standalone compilation with installed sass-embedded:
  75,867 bytes. Jekyll adds its source-map reference. Final Jekyll output is
  byte-identical to the Jekyll preview CSS used in the updated browser run.
- **Generated output: PASS.** 20 SFI pages, 114 asset references, 289 internal
  destinations, account aliases and preserved classroom account routes.
- **CSS scope: PASS.** Parsed public rules remain under .sfi-site. Caption mixins
  in existing specification components intentionally override three declarations;
  a strict duplicate-property audit flags these, but they are valid CSS and
  unchanged by this work.
- **Frontend: PASS.** 10 existing account/profile/quiz tests.
- **Backend: PASS.** 13 isolated Flask profile/auth/authorization tests.
- **Integration: PASS.** 7 tests on final rendered output against real Flask WSGI
  and disposable SQLite. Sandbox run uses pipes because sockets are restricted.
- **Authenticated Chromium: PASS.** 1440, 1024, 768, 390 and 320px. Real HTTP over
  an isolated Unix socket verifies cookies, signup/login/logout, profile editing,
  interest quiz save/reload/clear, My Gear persistence/removal, spec search/CRUD,
  role controls, chatbot open state, and its white surface/readable text.
  This final-color run used the complete first build HTML plus the final Jekyll
  preview CSS while the full rebuild ran; final stylesheet equality and unchanged
  source hashes establish the same styling in final output.
- **Visual route sweep: PASS.** 17 routes at 1440/390px; white header, blue
  navigation, no horizontal overflow, visible keyboard focus, mobile menu,
  four real feature destinations and responsive hero/logo alignment.
- **Manual screenshot inspection:** homepage desktop/mobile, login desktop,
  contact and Spec Search mobile, authenticated profile desktop, and chatbot
  desktop/mobile. The chatbot's former dark panel was corrected after inspection.
- **Document-import smoke test: PASS** in the existing frontend virtual environment.
  System Python lacks mammoth; no dependencies were installed.
- **Git whitespace check: PASS.** Existing work, all five stashes and Makefile
  retained. No commits or remote mutations.

Verification artifacts: /tmp/sfi-polish/. Final built site: site/. Public route
screenshots: visual-final/. Authenticated final-color screenshots: browser-light/.
Logs: build.log, build-refresh.log, sass.log, frontend.log, backend.log,
theme-final.log, integration-final.log, browser-light.log, visual-final.log and
import-tests.log.

**Ready for approval:** yes, subject to the test coverage limits below. No known
styling, compilation, or tested-functionality blockers remain.

The supplied-reference screenshot was not attached. Direct pixel comparison
is unavailable. Rendered screenshots and the existing SFI palette provide
the visual checks. External AI providers and physical camera hardware are
outside the isolated test coverage.

No backend source, production database, credentials, authorization settings,
production Jekyll configuration or dependencies were changed. No commit,
push, merge or deployment was performed. The existing stashes and Makefile
were not changed.
