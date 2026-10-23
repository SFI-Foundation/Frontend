# SFI handwritten CSS migration audit — 2026-10-21

This report supersedes historical status statements in the earlier theme reports.
The task began on `main` at `e3f4ed3f6` (the Sass branch was already merged).
Only the existing Makefile change was present. No checkout, reset, stash mutation,
commit, push, merge or deployment was performed by this task.

## Method and scope

Inspected the [OCS Sass guide](https://pages.opencodingsociety.com/sass/guide)
(downloaded successfully with curl) and the [upstream repository](https://github.com/Open-Coding-Society/pages).
Followed existing CSS → partial → import hub → front-matter entry → compiled CSS,
then removed original blocks/attributes and checked actual generated output.
Public SFI retains its existing tokens/mixins and `.sfi-site` scope. There is no
visual redesign or visual defect correction in this pass.

Audited all public SFI layout consumers, inherited document/redirect layouts,
`_includes/sfi/`, the three SFI project write-ups, `assets/js/sfi/`, and the SFI
classroom prototype. Reviewed tracked standalone CSS separately from generated
CSS and the excluded WordPress snapshot. Public SFI has no standalone handwritten
`.css` stylesheet to delete; its historical migration primarily removed inline
blocks. No standalone `.css` file was deleted in this pass.

## Source inventory, consumers and destinations

| Source | Consumers | SCSS destination and disposition |
| --- | --- | --- |
| Former `_includes/sfi/styles.html` block | All public SFI pages | Already removed in merged refactor; `base/{properties,foundation,layout}`, `components/{header,navigation,buttons,footer,data}`, `pages/{hero,content,admin}` |
| Former `_includes/sfi/nav.html` block and presentation attribute | Public navigation/account links | Already migrated to `components/_nav-account.scss` and `_navigation.scss` |
| Former `_includes/sfi/chatbot.html` block | Shared Chatbot | Already migrated to `components/_chatbot.scss`, including keyframes |
| Former `navigation/login.md` block | Login and signup | Already migrated to `pages/_auth.scss` |
| Former `navigation/sfi-profile.html` block | Profile and interest quiz | Already migrated to `pages/_profile.scss` |
| Former `_layouts/sfi.html` body presentation | All public pages | Already migrated to `base/_foundation.scss` |
| Two `display:none` attributes in `navigation/login.md` | Register fields and signed-in profile card | Removed this pass; `.auth-initially-hidden` in `pages/_auth.scss`; existing runtime display overrides preserved |
| Two `video.style.objectFit` assignments in `assets/js/sfi/detect-input.js` | Detect camera start/stop | Removed this pass; class add/remove selects `video.sfi-camera-live` in `pages/_detect.scss` |
| 837-line inline block in `navigation/classroom/sfi-prototype.md` | Archived SFI classroom prototype only | Removed this pass; `legacy/_prototype.scss`, registered in `legacy/_main.scss` |
| Two prototype presentation attributes | Contact submit button and footer note | Removed this pass; `#contactSubmit` and `.sfi-prototype-footer-note` in `legacy/_prototype.scss` |
| Existing `pages/_detect.scss`, `_gear.scss`, `_specs.scss` | Detect, My Gear, Spec Search/classifier | Existing imports retained; no declarations dropped |
| Dynamic widths, category accents, canvas height, SVG progress and pointer state | Spec Search, classifier, Detect and quiz | Intentionally retained as runtime data/state; no embedded static stylesheet |
| Runtime `display` changes in auth/prototype scripts | Tabs, session state, loading/message state | Retained to preserve current state machines |
| OCS/Minima imports and classroom account forms | Classroom pages | Retained framework/application styling; these are upstream classroom consumers, not public SFI pages |

Public pages audited: `/`, `/about/`, `/history/`, `/specs/`, `/services/`,
`/contact/`, `/quiz/`, `/detect/`, `/sfi-specs/`, `/login/`, `/signup/`,
`/sfi-profile/`, `/admin/`, `/404.html`, the SFI project documents, and account
aliases under `/authentication/`. All share or inherit the SFI shell.

## Final import chains

Public: `assets/css/sfi.scss` → `_sass/sfi/_main.scss` → tokens/mixins →
29 existing public partials (including the hub/tokens/mixins), with component
imports scoped inside `.sfi-site` → generated `/assets/css/sfi.css` →
`_layouts/sfi.html`, loaded once per rendered public SFI document.
The complete compiler-confirmed public partial list remains in
[sfi-sass-architecture.md](sfi-sass-architecture.md).

Prototype: `assets/css/sfi-prototype.scss` → `_sass/sfi/legacy/_main.scss` →
`_prototype.scss` → generated `/assets/css/sfi-prototype.css`, linked at the former
inline block's position in the prototype. Its existing dark `:root` rules and
global selectors require separate compilation to preserve that archived page
without changing public blue-and-white pages. It also continues to load its
original classroom framework and Google Fonts. The inherited `_layouts/post.html`
header style block is retained as shared upstream framework styling; it is not
SFI-owned. The output check limits its inline-style assertion to the prototype
article body and ignores HTML comments. No public page loads this entry.

OCS/Minima: remote Minima `assets/css/style.scss` → skin/initialize → local
`_sass/minima/custom-styles.scss` → `_sass/open-coding/_main.scss` and existing
classroom hooks. This chain remains untouched and is compiled in the full build.
Browsers still receive generated CSS, never raw Sass.

Added SCSS: `legacy/_main.scss`, `legacy/_prototype.scss` and the front-matter
entry `assets/css/sfi-prototype.scss`. Changed SCSS: `pages/_auth.scss` and
`pages/_detect.scss`. The public import hub needs no change because those two
partials are already imported exactly once. The compiler proof now verifies both
independent entries and rejects static inline presentation in both page sets.

## Retained standalone CSS inventory

These are not redundant SFI-maintained public stylesheets. No public SFI rendered
page loads them. The WordPress snapshot is excluded from the Jekyll source build;
rewriting its archived theme/plugin files would alter an external site snapshot.

| Retained file | Reason |
| --- | --- |
| `assets/Bathroom/bathroom.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/Bathroom/profile.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/Bathroom/queue.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/Bathroom/report-issues.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/aesthetihawk/charts.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/aesthetihawk/shake.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/aesthetihawk/tabs.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/certificate_overview.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/crypto.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/csp_home.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/custom-styles.css` | Upstream placeholder; no public SFI consumer. |
| `assets/css/leaderboard.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/marketEvents.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/css/pause-menu.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/js/GameEnginev1/platformer/css/style.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/js/mini-lesson/stack-clicker.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/screenQueue/style/call.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/screenQueue/style/groups.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/screenQueue/style/init.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/screenQueue/style/navbar.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `assets/screenQueue/style/queue.css` | Upstream classroom/game/application stylesheet; no public SFI consumer; preserve its existing consumers. |
| `login.css` | Upstream classroom legacy CSS; no public SFI consumer; preserve upstream asset. |
| `sfifoundation.com/wp-content/plugins/revslider/sr6/assets/css/rs6.css?ver=6.7.35.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/plugins/wp-pagenavi/wp-pagenavi.min.css?ver=2.70.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design-child/u-design-style-orig.min.css?ver=2.13.16.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/scripts/superfish-menu/css/u-design-superfish_menu.min.css?ver=1.7.2.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/styles/common-css/font-awesome/css/font-awesome.min.css?ver=2.13.16.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/styles/common-css/u-design-grid-960.min.css?ver=1.0.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/styles/common-css/u-design-reset.min.css?ver=1.0.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/styles/common-css/u-design-responsive.min.css?ver=2.13.16.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/styles/custom/u-design-custom-style.min.css?ver=2.13.16.1770841974.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/styles/style1/css/u-design-style.min.css?ver=2.13.16.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |
| `sfifoundation.com/wp-content/themes/u-design/styles/style1/css/u-design-text.min.css?ver=1.0.css` | Archived WordPress theme/plugin snapshot; excluded by Jekyll; preserve vendor/archive fidelity. |

## Verification

Evidence and screenshots: `/tmp/sfi-sass-migration/`. The original approved
Contact screenshot is not attached in this conversation. Exact comparison to
that unavailable screenshot cannot be claimed; before/after Chromium captures of
the existing Contact page provide the local visual reference.

| Check | Result |
| --- | --- |
| Normal-config Jekyll build | PASS, initial 291.012 seconds and final 486.419 seconds; normal `_config.yml`, remote Minima, no fallback |
| Final compiler/output proof | PASS, all 29 public Sass files imported; 21 rendered public documents load exactly the compiled SFI stylesheet; isolated legacy entry and both Jekyll outputs match standalone compilation |
| Public CSS preservation | PASS, all original compiled CSS byte-identical after excluding only the two new state rules and source-map comment |
| Prototype declaration preservation | PASS, original block compiles identically, plus the two migrated attribute rules |
| Frontend | PASS, 10 account/profile/auth/quiz tests |
| Flask backend | PASS, 13 isolated SFI auth/profile/authorization tests |
| Rendered client → Flask integration | PASS, 7 tests; real Flask WSGI over pipes in sandbox |
| Public Chromium | PASS, 17 routes at 1440px and 390px; computed palette, fonts, stylesheet isolation, navigation, focus, overflow and JS errors |
| Authenticated Chromium → Flask HTTP | PASS at 1440, 1024, 768, 390 and 320px; cookies, signup/login/logout, profile edits, quiz save/reload/clear, My Gear persistence/removal, spec search/CRUD, role controls and Chatbot surface |
| Public screenshot comparison | 29 of 35 PNGs byte-identical, including Contact, Login/Signup and homepage at both sizes; six differences limited to animated dots and canvas showcase, with identical page dimensions and unchanged compiled rules |
| Contact visual inspection | Desktop/mobile inspected; blue gradient, white header/logo, blue navigation, gold accents, white/gray sections, cards, typography and spacing preserved |

The six nonidentical images are Detect and Quiz (tiny pulsing status regions) and
Spec Search (animated canvas car zones), each at desktop and mobile widths.
Their difference bounds are recorded in the task evidence; no style-rule changes
were made to those animations. The comparison does not claim pixel identity for
live animation frames. Some original emoji icons render as missing glyphs in the
minimal browser environment; this occurs in both baseline and final captures.
No font or icon change was made.

External AI/model providers and physical camera hardware are outside isolated
browser coverage. The camera fit start/stop transition is checked with a synthetic
MediaStream separately. Existing Sass import deprecations, post-link/duplicate
output warnings and SQLAlchemy relationship warnings remain. No dependencies,
backend sources, production data or configuration were changed.


The synthetic camera check passed at desktop/mobile: start selects `contain`,
stop restores `cover`, using the actual Detect input JavaScript and a canvas
MediaStream. The prototype's original/final screenshots have identical dimensions;
its random particle canvas produces expected differences. At 390px the archived
prototype has pre-existing 450px document width in both captures; this pass
preserves it rather than redesigning the archive. Public pages have no overflow.

## Git safety and status

The existing Makefile diff is byte-identical to task start. All five stash object
IDs are unchanged. Branch remains `main` because the refactor branch was already
merged before this task began. No commit, push, merge, deployment, branch deletion
or backend modification was performed. The old branch remains intact.

Exact final `git status --short`:

```text
 M Makefile
 M _sass/sfi/pages/_auth.scss
 M _sass/sfi/pages/_detect.scss
 M assets/js/sfi/detect-input.js
 M navigation/classroom/sfi-prototype.md
 M navigation/login.md
 M scripts/test-sfi-sass.rb
?? _sass/sfi/legacy/
?? assets/css/sfi-prototype.scss
?? docs/sfi-css-migration.md
```

## Final disposition

COMPLETE: all safe maintained SFI static styling is in SCSS and verified.
No standalone SFI `.css` file required deletion. One remaining SFI inline block
(the archived prototype), four static presentation attributes and two JavaScript
appearance assignments were migrated in this pass; the earlier public inline
blocks were already migrated in the merged branch.

Final prototype comparison: after masking the random particle canvas, all
remaining pixel differences are bounded by the existing animated Chatbot shadow.
Excluding that pulsing region gives identical desktop/mobile static content.
`legacy-comparison.json` records those bounds. No layout or declaration was lost.

No implementation/test blocker remains. Direct comparison with the user's approved
Contact screenshot remains unavailable because that image was not attached; the
current Contact page is pixel-identical to its local desktop/mobile baseline.
Evidence logs and screenshots are under `/tmp/sfi-sass-migration/` (temporary,
not committed). `git diff --check` passes. All five stashes and the Makefile
modification remain preserved.
