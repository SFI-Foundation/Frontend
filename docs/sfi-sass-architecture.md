# SFI Sass architecture and approved visual baseline

This architecture verification preserves the approved SFI appearance. No SCSS,
markup, component layout, route, asset or application behavior was changed in this
continuation.

## Actual OCS source inspected

Upstream: Open-Coding-Society/pages, commit
`61abda363e67c1532cbf23c0f60cdef5701c7fbc` (2026-10-21).
The GitHub commit API and raw upstream Sass, configuration, dependency and head
files were fetched during this verification. Evidence is in `/tmp/sfi-final/`.

The [upstream Gemfile](https://github.com/Open-Coding-Society/pages/blob/61abda363e67c1532cbf23c0f60cdef5701c7fbc/Gemfile)
specifies Jekyll ~> 3.9.0, jekyll-theme-minima and jekyll-remote-theme.
Its [configuration](https://github.com/Open-Coding-Society/pages/blob/61abda363e67c1532cbf23c0f60cdef5701c7fbc/_config.yml)
selects remote Minima and incremental builds; explicit Sass settings are commented
out. SFI's installed bundle is Jekyll 4.4.1, jekyll-sass-converter 3.1.0 and
sass-embedded 1.104.0. Matching organizational conventions does not require
downgrading SFI's working compiler or copying upstream dependency patches.

The remote Minima theme supplies `assets/css/style.scss`, with YAML front matter
and imports for `minima/skins/<skin>` and `minima/initialize`. The latter imports
`minima/custom-variables`, `minima/base`, `minima/layout` and
`minima/custom-styles`. These files were inspected in the downloaded theme,
rather than assumed to exist in the OCS repository.

OCS overrides the
[custom-styles hook](https://github.com/Open-Coding-Society/pages/blob/61abda363e67c1532cbf23c0f60cdef5701c7fbc/_sass/minima/custom-styles.scss),
which imports `root-color-map`, `nav`, `open-coding/main`, lessons, footer and
project styles. The
[open-coding hub](https://github.com/Open-Coding-Society/pages/blob/61abda363e67c1532cbf23c0f60cdef5701c7fbc/_sass/open-coding/_main.scss)
imports shared variables, base rules, materials, elements and application partials.
Its mixins include responsive typography/spacing, button primitives and states;
elements are organized into their own import hubs.

OCS's deployed `/assets/css/style.css` was fetched successfully: 977,477 bytes of
compiled CSS. The Minima head and OCS custom-head reference that stylesheet.
Upstream also has broad global body/form rules and additional vendor styles;
these are deliberately not imported into the public SFI layout.

The supplied capstone URL was fetched. It is an OCS project presentation using
`/pages/assets/css/style.css`, not the SFI public homepage. It is not used to
override the approved SFI appearance. The topics URL and its [CSS to SASS guide](https://pages.opencodingsociety.com/topics/view/sass/guide/)
were fetched directly after the web reader failed. The guide recommends a central
import hub, shared variables/mixins, removing obsolete stylesheet references, and
build/browser verification. Its description calls the custom-styles hook an entry
point; the actual browser-facing compilation entry is the theme’s front-matter
`assets/css/style.scss`. SFI follows that actual compilation mechanism.

## SFI pipeline

`assets/css/sfi.scss` has Jekyll front matter and imports `sfi/main`.
`_sass/sfi/_main.scss` loads tokens and mixins, then imports visual partials
inside `.sfi-site`. Jekyll emits `assets/css/sfi.css`; `_layouts/sfi.html`
loads that asset once with `relative_url`. Document and redirect layouts inherit
the same SFI shell. The classroom theme hooks remain available to their original
layouts and are not loaded by SFI.

This adapts OCS's entry → import hub → reusable partial architecture while
retaining SFI's independently scoped palette and components. Sass variables
centralize colors, typography, spacing, widths and breakpoints. Mixins centralize
responsive containers, surface cards, focus rings, captions and tinted states.
CSS custom properties expose SFI tokens consistently to existing components.

## Complete compiler-confirmed import inventory

The entry imports the main hub; the compiler's `loaded_urls` confirms all 29
files below are consumed, with no non-SFI Sass import.

- `_sass/sfi/_main.scss`
- `_sass/sfi/_mixins.scss`
- `_sass/sfi/_tokens.scss`
- `_sass/sfi/base/_accessibility.scss`
- `_sass/sfi/base/_foundation.scss`
- `_sass/sfi/base/_layout.scss`
- `_sass/sfi/base/_page.scss`
- `_sass/sfi/base/_properties.scss`
- `_sass/sfi/components/_buttons.scss`
- `_sass/sfi/components/_chatbot.scss`
- `_sass/sfi/components/_data.scss`
- `_sass/sfi/components/_experience.scss`
- `_sass/sfi/components/_footer.scss`
- `_sass/sfi/components/_header.scss`
- `_sass/sfi/components/_nav-account.scss`
- `_sass/sfi/components/_navigation.scss`
- `_sass/sfi/elements/_button.scss`
- `_sass/sfi/elements/_card.scss`
- `_sass/sfi/elements/_form.scss`
- `_sass/sfi/elements/_table.scss`
- `_sass/sfi/pages/_admin.scss`
- `_sass/sfi/pages/_auth.scss`
- `_sass/sfi/pages/_content.scss`
- `_sass/sfi/pages/_detect.scss`
- `_sass/sfi/pages/_document.scss`
- `_sass/sfi/pages/_gear.scss`
- `_sass/sfi/pages/_hero.scss`
- `_sass/sfi/pages/_profile.scss`
- `_sass/sfi/pages/_specs.scss`

Authentication is in `pages/_auth.scss`; profile and optional interest quiz
fields are in `pages/_profile.scss`. Shared forms/buttons/cards live in
`elements/` and `components/`. Responsive rules stay with their components
and use shared breakpoint mixins where applicable. No new partial is needed
merely to rename an existing responsibility.

## Source of truth and competing styles

The compiler proof verifies that all generated SFI documents reference exactly
one stylesheet and contain no inline style blocks. Tokens for SFI blue, white,
light-gray surfaces and the retained gold accent remain in compiled CSS. All
expanded selectors are scoped to `.sfi-site`, apart from animation keyframe
steps and at-rules. No OCS palette, theme reset, navigation, preference override
or new global stylesheet is introduced.

The remaining inline declarations are runtime state/data, not visual themes:
two initial login `display:none` states, and the classifier's calculated
`width:${confPct}%` meter template. Existing JavaScript changes display and
meter values; those operations remain intact. External detection scripts also set
data-derived category `--accent` properties, progress/ring values and measured
canvas height. Camera/image switching controls media fit and pointer cursors.
These are rendering state or category data, not competing theme stylesheets;
their existing behavior is preserved. Vendor, third-party and generated assets
were preserved.

## Repeatable checks

Run the full build into a fresh destination, disabling incremental mode through
a temporary override (the production config is unchanged):

```sh
bundle exec jekyll build --config _config.yml,/tmp/sfi-architecture/full.yml \
  --destination /tmp/sfi-architecture/site --disable-disk-cache
bundle exec ruby scripts/test-sfi-sass.rb /tmp/sfi-architecture/site \
  /tmp/sfi-architecture/baseline/sfi.css
node scripts/test-sfi-theme.mjs /tmp/sfi-architecture/site
node scripts/test-sfi-account-routes.mjs
node scripts/test-sfi-integration.mjs ../SFI-Backend/venv/bin/python \
  ../SFI-Backend /tmp/sfi-architecture/site
```

`full.yml` contains only `incremental: false`.
The Sass proof compiles the actual front-matter-stripped entry using the installed
bundle, records imported URLs, checks that no SFI partial is orphaned, rejects
external Sass imports/unscoped selectors, compares actual Jekyll output, and checks
the optional approved CSS baseline. It also checks every generated SFI document
for competing stylesheets or inline appearance rules.

The visual script accepts an optional third argument containing approved
`home-1440.png` and `home-390.png` captures. It renders actual pages in Chromium
and requires byte-identical desktop/mobile homepage captures. Baseline artifacts
are external to the repository and are not new browser stylesheets.

## Results

Current session (2026-10-21):

| Check | Result |
| --- | --- |
| Full production-theme Jekyll build | PASS, 340.712 seconds, incremental disabled, remote Minima downloaded successfully after network escalation; no fallback |
| Actual entry compilation | PASS, 75,867 bytes before Jekyll source-map comment |
| Compiler dependency inventory | PASS, all 29 SFI partials consumed; no external Sass imports |
| Jekyll CSS equality | PASS, matches standalone compilation and task-start CSS |
| Rendered stylesheet isolation | PASS, 21 SFI HTML documents load exactly one compiled SFI stylesheet; no inline stylesheet blocks |
| Generated theme/routes/assets | PASS, 20 primary routes, 114 asset references, 289 internal destinations, palette tokens, scoped selectors, focus and responsive rules |
| Frontend account/profile tests | PASS, 2 account-route tests and 6 profile/auth/quiz tests |
| Isolated backend tests | PASS, 13 Flask auth/profile/authorization tests |
| Rendered JavaScript/Flask integration | PASS, 7 tests; sandbox transport is real Flask WSGI over pipes, not browser HTTP |
| Public Chromium sweep | PASS, 17 routes at 1440px and 390px; stylesheet loading, colors, focus, menu, no overflow or JS errors |
| Authenticated Chromium integration | PASS at 1440, 1024, 768, 390 and 320px; real cookies, signup/login/logout, profile editing, interest quiz save/reload/clear, My Gear persistence/removal, spec search/CRUD, role controls and chatbot surface; real Flask HTTP over isolated Unix socket and disposable SQLite |

The supplied reference screenshot is not attached to this conversation. No exact
pixel comparison against that image is possible. Styling and markup are preserved
from the working tree at task start; `/tmp/sfi-final/starting.css` records its
standalone compiled CSS before any edits and matches the final Jekyll CSS after
removing only its source-map comment. No visual redesign or style correction was
necessary.

Actual Chromium screenshots were inspected for homepage desktop/mobile, login
mobile, authenticated profile/quiz desktop, and the open chatbot desktop. The white
header, official logo, blue navigation, yellow search action, blue gradient hero,
white logo card and light content surfaces remain. The minimal test environment
lacks some emoji glyphs, so some existing emoji icons appear as missing glyphs in
captures; browser font-family declarations do not prove every named font is
installed. External hero imagery depends on network availability. These captures
are visual inspection evidence, not a pixel match to the unavailable reference.

Existing classroom post-link/duplicate-destination warnings and Sass `@import`
deprecations remain. No compiler errors occurred. External AI providers and
physical camera hardware are outside isolated integration coverage.

Evidence: `/tmp/sfi-final/` contains `build.log`, `sass-proof.log`, `theme.log`,
`frontend.log`, `profile.log`, `backend.log`, `integration.log`, `visual.log`,
`visual/`, `auth-browser.log`, and `auth-browser/`. Temporary artifacts are not
committed or deployed.

Ready for review: yes, with the visual-reference and external-service limits above.

## Files modified in this continuation

- `docs/sfi-sass-architecture.md` — refreshed upstream evidence and current test results.

**SCSS, markup and application JavaScript modified: none.** Existing uncommitted
styling work is preserved. The branch remains `sfi-unified-sass-theme`; Makefile
and all five stashes are unchanged. No backend source, production database,
credentials, authorization configuration or repository dependencies changed.
Temporary browser tooling and runtime libraries are under `/tmp/sfi-final/`.
No commit, push, merge, branch deletion or deployment occurred.

## Review publication

The user authorized committing and pushing this branch and opening a draft PR
against `main`. The verification notes above describe the pre-publication run.
The earlier branch commit included a Makefile timeout change (300 → 600 seconds).
The review commit restores the `origin/main` Makefile blob in Git’s index only,
keeping the local 600-second version untouched and unstaged. The PR therefore
contains no Makefile change. All five stash objects are preserved.
