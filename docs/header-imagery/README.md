# SFI header imagery

Historical SVG implementation at `d72acaf94`, superseded by [real racing photography](../header-photography/README.md).

Baseline: `3fb4d6eab`. Implemented on `feature/sfi-final-ui-polish`.

Added one original, local SVG containing a helmet outline and checkered flag. The two elements share a muted neutral color and line weight. The SVG is 424 bytes, uses only paths, and has no external resources, fonts, scripts, or embedded raster data. No third-party artwork was used.

The existing SFI logo file and its displayed dimensions are unchanged. The decorative grouping sits after the logo and organization name within the existing home link; its empty `alt` and `aria-hidden="true"` keep it out of the accessible name. No interactive elements, navigation destinations, authentication logic, or application behavior were added or changed.

The grouping has an explicit 80×32px box and appears from 1024px upward. Below that width, the existing logo/name and mobile navigation remain unchanged. The header stays 68px tall. Checks at 1023px, 960px and 801px also confirm that the transition does not crowd the desktop links before the mobile menu breakpoint.

## Before / after

| Width | Before | After |
| --- | --- | --- |
| 1440px | [Header](screenshots/before-1440.png) | [Header](screenshots/after-1440.png) |
| 1024px | [Header](screenshots/before-1024.png) | [Header](screenshots/after-1024.png) |
| 768px | [Header](screenshots/before-768.png) | [Header](screenshots/after-768.png) |
| 390px | [Header](screenshots/before-390.png) | [Header](screenshots/after-390.png) |
| 320px | [Header](screenshots/before-320.png) | [Header](screenshots/after-320.png) |

Desktop before:

![Desktop header before](screenshots/before-1440.png)

Desktop after:

![Desktop header after](screenshots/after-1440.png)

[Mobile menu open](screenshots/after-mobile-open.png). Captures were reviewed at desktop and mobile sizes.

## Actual validation

- Production-mode Jekyll build of the public SFI page subset: passed, exit 0. This focused build uses the real layouts, configuration, assets and Sass; the repository's unrelated legacy educational pages were not rebuilt. [Build log](checks/build.log).
- `npm test`: 22 passed. [Log](checks/unit.log).
- `npm run test:phase1`: 16 passed, 2 build-artifact checks skipped in this source-only invocation. [Log](checks/phase1.log).
- Existing search/account-route suite: 20 passed. [Log](checks/search-account.log).
- `npm run test:styles -- /tmp/sfi-header-preview`: passed. [Log](checks/styles.log).
- Existing rendered-client/Flask integration suite: 7 passed against disposable SQLite fixtures. [Log](checks/auth-integration.log).
- Existing public link checker: 177 targets/fragments, no errors. [Log](checks/links.log).
- Existing browser regression suite: all 35 layouts across the six destinations and Create Account passed; all 111 canonical specification identities, filters, pagination, verified/unapproved PDF actions, redirects and member/admin separation passed. No page exceptions. [Log](checks/browser.log), [results](browser-results.json).
- Accessibility: 21 existing WCAG A/AA axe scans passed, plus one scan with the mobile menu open. Keyboard opening and Escape focus return passed. [Header checks](checks/header.log), [results](header-results.json).
- Additional header measurements: 1440, 1024, 1023, 960, 801, 768, 390 and 320px; no overflow, unchanged height/logo dimensions, aligned artwork and at least 24px clearance before desktop links. [Results](header-results.json).
- SVG validation and byte-identical original logo: passed. [Log](checks/assets.log).

Browser regression ran with the existing isolated local-catalog API, not production data. Its full-page regression screenshots are temporary local QA artifacts; the delivered captures above focus on the requested header comparison. Chromium was tested; automated accessibility checks do not replace manual screen-reader testing. Existing Sass deprecation warnings remain.

Changed implementation: `_includes/nav/ocs-menu.html`, `_sass/sfi/components/_navigation.scss`, `images/sfi/motorsports-mark.svg`. No new dependency or framework. No merge into `main`.
