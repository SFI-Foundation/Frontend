# SFI frontend UI overhaul

Implemented on `feature/sfi-ui-navigation-overhaul`, based on organization `main` at `3e946491e0a1e7c5362eb619642330b9d4fec3e3`. Main and deployment workflows are unchanged.

## Original problems and resulting interface

The public layout had a separate logo masthead plus a ten-link navigation bar. Navigation configuration listed unrelated educational pages while SFI's include hardcoded a different list. The homepage repeated its introduction, statistics, category browsing, prototype shortcuts, and search calls to action. Search followed a large page header and statistics; every result repeated revision, document, and recertification explanations. Shared and homepage-specific CSS disagreed on navbar sizes and breakpoints.

The new header combines the logo and organization name with a single navigation tree. The homepage has one mission statement, the primary specification action, a GET search shortcut, three concise service summaries, and a source-linked update. Search opens immediately below a compact heading; filters precede results, category browsing follows results, and statistics/help are secondary. Result rows retain category and document status; native disclosures preserve detailed revision and recertification information.

Measured homepage document heights using the same catalog and viewport heights:

| Viewport | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| 1440px homepage | 3219px | 1057px | 67% |
| 390px homepage | 6134px | 2071px | 66% |

These are page-height measurements, not performance benchmarks. No content was clipped to obtain them.

## Navigation and configuration

Before: About · History · Specs · Services · News & Events · Contact · My Gear · Detect · Spec Search · Sign In.

After: **About · Specifications · Services · News & Contact · Sign In**. The logo links to `/`. Authenticated visitors retain their existing profile entry.

Both SFI and the inherited Minima header now read the same ordered `minima.nav_pages` source paths. The SFI include resolves each page from `site.pages`, uses `page.url`, and displays its `nav_title`. Active destinations receive `aria-current`. Sign In remains a separate session-aware entry, matching the reference architecture.

The audit inspected `_config.yml`, the development overlay, layouts, includes, SFI Sass, CSS entry points, SFI JS, navigation front matter, and route generation. The OCS reference was examined at `bb2d8a291337bf9bcfab782679cbf71c76d1e2b3`, specifically its configuration, Minima base layout, and header. Its useful convention is ordered source paths resolved through front matter; its course/authentication configuration and branding were not imported.

Production URL, empty base URL, CNAME, API resolution, plugin list, prototype flags, credential exclusions, and deployment workflow are preserved. Unrelated OCS social links and obsolete navigation entries were removed. `_config.development.yml` remains unchanged.

References: [OCS configuration](https://github.com/Open-Coding-Society/pages/blob/bb2d8a291337bf9bcfab782679cbf71c76d1e2b3/_config.yml), [OCS header](https://github.com/Open-Coding-Society/pages/blob/bb2d8a291337bf9bcfab782679cbf71c76d1e2b3/_includes/themes/minima/header.html), [teacher-approved SRFSC example](https://srfsc-organization.github.io/capstone2pages/capstone/srfsc/app/). The SRFSC example informed mission/action grouping and a compact functional panel, without copying its branding.

## Consolidated routes

| Route | Behavior |
| --- | --- |
| `/` | New homepage and safely encoded GET search shortcut |
| `/about/` | Mission, programs, and history |
| `/history/` | Redirect to `/about/#history` |
| `/sfi-specs/` | Single Specifications destination and existing authorized administration |
| `/specs/` | Redirect to `/sfi-specs/` |
| `/services/` | Four concise program summaries and contact action |
| `/news-events/` | News, confirmed events, and contact information |
| `/contact/` | Redirect to `/news-events/#contact` |
| `/login/` | Existing authentication, with compact spacing and a semantic heading |

Redirect pages provide canonical URLs, noindex metadata, a fallback link, a static refresh, and JavaScript replacement preserving query strings and applicable fragments. Browser tests verify final destinations without loops. Existing account aliases are preserved.

Organization facts and contact details were checked against [About SFI](https://sfifoundation.com/about-sfi-foundation/), [History](https://sfifoundation.com/our-history/), [Test Lab](https://sfifoundation.com/test-lab/), and [Contact](https://sfifoundation.com/contact/). The unsupported decade for independence from SEMA was removed. News and event data remain the existing sourced feed; dates are filtered at build time. No unconfirmed events or invented statistics were added.

## Styling and cleanup

- Existing SFI blue, restrained gold accents, white surfaces, dark text, and muted borders; no new framework or font dependency.
- Contrast ratios: body text 16.88:1, muted text 6.31:1, links 6.47:1, input boundaries 3.65:1, header text 10.14:1, and primary gold action 6.86:1. Assistant focus indicators adapt to its light panel and dark header.
- Shared content width of 1200px and spacing based on 4, 8, 12, 16, 24, 32, and 48px.
- Desktop header is 68px; mobile header is 64px. It remains in document flow so it cannot cover content.
- Category browsing uses four columns on wide screens, two on tablets/phones, and one on the narrowest phones. Tiles use backend names and counts, with a wider last tile when appropriate.
- The same native category disclosure opens on desktop and starts closed on narrow phones, keeping initial results closer to search.
- Removed repeated home sections, hardcoded headline counts, duplicate category lists, decorative icon blocks, and public My Gear/Detect promotion. Underlying routes, profile access, scripts, and authorized workflows remain.
- Conflicting masthead, account-nav, experience, and homepage override partials are retired from the public bundle; their source is retained. Buttons/forms/footer share the theme tokens.
- The existing assistant is a footer action rather than a floating control over PDF links. Its closed panel is hidden from keyboard navigation; it has an accessible input label, close button, Escape handling, and focus return. Reply text is escaped before safe emphasis formatting.

## Preserved functionality and data

The backend search endpoint, ranking, 20-item page size, canonical identity deduplication, stale-response suppression, pagination focus management, category relationships, loading/empty/error feedback, approval guard, and admin authorization are retained. No underlying specification data, backend source, `.env`, or credentials were modified.

PDF actions still require `verified_current` and an HTTPS PDF on the approved official host/path. A URL alone cannot create an approved action. Revision, recertification, and source-review details remain available in each row's disclosure. All eight actual backend categories are shown, including `Needs category review`; none are substituted with a hardcoded seven-category catalog.

## Accessibility and validation

See [validation results and reproduction](ui-overhaul/VALIDATION.md) and [browser evidence](ui-overhaul/browser-results.json).

The final complete production artifact passed 21 browser acceptance checks. The completed browser run checks six public pages at 1440×900, 1024×768, 768×1024, 390×844, and 320×720; no horizontal overflow was found. Eighteen axe scans across desktop, 390px, and 320px report zero WCAG A/AA violations. Keyboard checks cover the skip link, mobile toggle, Tab order, Escape/focus return, pagination, category browsing, and assistant. Navigation also works without JavaScript. Shared styles respect reduced motion.

Automated scans do not establish full WCAG conformance. NVDA/VoiceOver and native browser-toolbar zoom were not exercised. The 200% check uses a 720×450 CSS viewport with device scale 2, matching the reflow dimensions of a 1440×900 viewport at 200% zoom.

## Screenshots

All screenshots are committed under `docs/`, which Jekyll excludes from publication. Baselines are built from a separate unchanged source snapshot of main, avoiding mixed source during implementation.

| View | Before | After |
| --- | --- | --- |
| Desktop homepage | [Before](ui-overhaul/screenshots/before-home-1440.png) | [After](ui-overhaul/screenshots/after-home-1440.png) |
| Mobile homepage | [Before](ui-overhaul/screenshots/before-home-390.png) | [After](ui-overhaul/screenshots/after-home-390.png) |
| Desktop specifications | [Before](ui-overhaul/screenshots/before-specifications-1440.png) | [After](ui-overhaul/screenshots/after-specifications-1440.png) |
| Mobile specifications | [Before](ui-overhaul/screenshots/before-specifications-390.png) | [After](ui-overhaul/screenshots/after-specifications-390.png) |
| Mobile navigation | [Before](ui-overhaul/screenshots/before-mobile-navigation.png) | [After](ui-overhaul/screenshots/after-mobile-navigation.png) |

[Compact category grid](ui-overhaul/screenshots/after-categories-1440.png).

## Limitations

The inherited classroom content tree still ships through the existing build pipeline. Full builds emit pre-existing Sass/post-url deprecations and duplicate-permalink warnings for unrelated legacy posts. Broad deletion of educational content and workflow changes are outside this UI change. Legacy HTML aliases use client/static redirects because GitHub Pages does not provide configurable server-side 301s. Feed freshness depends on the existing sync workflow and a rebuild. Production authentication and writes were not tested; all admin changes used fictional records in a disposable localhost database. Live assistant service behavior was not tested; its UI and escaping use a controlled response.

## Changed files

- `_config.yml`
- `_includes/sfi/chatbot.html`
- `_includes/sfi/footer.html`
- `_includes/sfi/nav.html`
- `_includes/themes/minima/header.html`
- `_layouts/sfi-redirect.html`
- `_layouts/sfi.html`
- `_sass/sfi/_main.scss`
- `_sass/sfi/_tokens.scss`
- `_sass/sfi/base/_accessibility.scss`
- `_sass/sfi/base/_layout.scss`
- `_sass/sfi/base/_page.scss`
- `_sass/sfi/components/_buttons.scss`
- `_sass/sfi/components/_chatbot.scss`
- `_sass/sfi/components/_footer.scss`
- `_sass/sfi/components/_navigation.scss`
- `_sass/sfi/elements/_button.scss`
- `_sass/sfi/elements/_form.scss`
- `_sass/sfi/pages/_auth.scss`
- `_sass/sfi/pages/_hero.scss`
- `_sass/sfi/pages/_specs.scss`
- `assets/js/sfi/spec-search.js`
- `index.md`
- `navigation/about.md`
- `navigation/contact.md`
- `navigation/history.md`
- `navigation/login.md`
- `navigation/news-events.md`
- `navigation/services.md`
- `navigation/sfi-specs.md`
- `navigation/specs.md`
- `scripts/test-sfi-spec-search.mjs`
- `scripts/check-sfi-public-links.py` — reproducible built-route link/anchor check.
- `scripts/test-sfi-ui-overhaul.cjs` — optional Playwright acceptance runner.
- `docs/SFI_UI_OVERHAUL_REPORT.md` and `docs/ui-overhaul/` — report, validation evidence, and screenshots.
