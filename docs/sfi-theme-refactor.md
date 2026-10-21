# SFI public theme refactor

Status: implementation and functional checks available for review; visual and
production-theme verification remain blocked by the environment. No commit,
push, PR, merge, or deployment was performed.

## Architecture

`_layouts/sfi.html` loads `/assets/css/sfi.css` once. Jekyll compiles the
front-matter-enabled `assets/css/sfi.scss`, which imports `sfi/main` from `_sass`.
`_sass/sfi/_main.scss` imports tokens and mixins, then scopes the shared foundation,
header/navigation/footer, components, authentication, profile, admin, and existing
Gear/Detect/Spec Search partials under `.sfi-site`. The body owns that class.

This follows the installed OCS import convention and existing SFI Jekyll entry
point. The merged `_sass/minima/custom-styles.scss` imports `root-color-map`,
`nav`, `open-coding/main`, lesson, footer, and project styles. That bundle remains
available to classroom/project layouts; importing it into SFI would introduce
classroom visuals and preference overrides. SFI needs no Minima visual reset.
The local OCS checkout and cached `upstream/main` were inspected, along with
`_posts/Foundation/D-sass_aesthetihawk-guides/2025-12-11-css-to-sass-guide.md`.
The requested online Sass learning page was unavailable.

Installed versions: Jekyll 4.4.1, jekyll-sass-converter 3.1.0, local Minima 2.5.2.
Production still selects unpinned `remote_theme: jekyll/minima`. Sass `@import`
is deliberately compatible with this repository's current pipeline; Dart Sass
reports deprecation warnings. No production config or dependency changes.

## Migrated sources

- `_includes/sfi/styles.html`: entire 1,133-line style include removed after
  migration to `base/{properties,foundation,layout}`, `components/{header,
  navigation,buttons,footer,data}`, and `pages/{hero,content,admin}` partials.
- `_includes/sfi/nav.html`: account/avatar style block to
  `components/_nav-account.scss`; active Spec Search shadow to navigation Sass.
- `_includes/sfi/chatbot.html`: style block and keyframes to
  `components/_chatbot.scss`. The existing self-contained chat appearance remains.
- `navigation/login.md`: login/Create Account styles to `pages/_auth.scss`.
- `navigation/sfi-profile.html`: profile and nonprofit quiz styles to
  `pages/_profile.scss`.
- `_layouts/sfi.html`: body appearance attributes moved to the foundation.

No standalone CSS was removed: public SFI pages already loaded `sfi.scss` plus
inline rules, rather than a standalone SFI-authored CSS file. `login.css` is an
unreferenced legacy upstream stylesheet; `assets/css/custom-styles.css` is an
upstream placeholder. Vendor, classroom, game, notebook, archived WordPress,
ScreenQueue, and other application styles remain untouched. None is linked by
the public SFI layout. The old dark landing/review prototype is preserved,
including its independent inline styles and interactive features, under
`/classroom/sfi-prototype/`; its former public URL now redirects to the SFI
homepage. This prevents the prototype from acting as a competing public theme.

Inline login `display:none` attributes and JavaScript display changes remain
because the authentication state machine controls them. The Spec Search meter's
calculated width remains inline because it represents runtime data.

Existing colors, dimensions, typography declarations, logo, cards, nav order,
shadows, and media queries were retained. Fixed undefined `--sfi-gold` and
`--sfi-gold-dim` using existing chat accent values. Account headings now use the
existing dark text color on white, and account/profile links use SFI blue for
readability. Added visible keyboard focus and reduced-motion support. The logo
now links to the actual `/` homepage; shared links use `relative_url` for Pages
subpaths. Mobile menu `aria-expanded` tracks its existing open state.

## Verification of the continuation

Final full-source command (no documents or pages excluded beyond the project's
own configuration):

```sh
bundle exec jekyll build --config _config.yml,/tmp/sfi-sass-final/offline.yml \
  --destination /tmp/sfi-sass-final/site-final --disable-disk-cache
```

The temporary override only sets `remote_theme: false`, `theme: minima`, and
`incremental: false`. It does not disable feed generation, bound classroom
navigation, or exclude any content. The production configuration remains
unchanged. Final full-source build: **PASS**, exit code 0, 231.0 seconds. All repository
content was processed using the normal project exclusions, with incremental
building disabled. An earlier complete run also passed in 504.241 seconds.
Neither result substitutes a focused build for the complete repository build.

Tracing `Jekyll::Renderer#run` showed steady progress through the existing 752
posts. Liquid loops in the classroom lesson layouts repeatedly inspect the
site's documents. The earlier runs were interrupted while processing these
layouts, rather than failing a Sass import. The diagnostic wrapper is outside
the repository; the final command above uses ordinary Jekyll with no renderer
patches.

- Frontend: **PASS**, 10 tests, including the original six login/profile/quiz
  tests plus signup routing and sign-out success, expired session, network error,
  failed logout, retry, and GitHub Pages baseurl behavior.
- Backend: **PASS**, 13 tests, using the existing isolated runner and disposable
  databases. The preexisting real database modification remains untouched; its
  mtime predates this work. Backend source and auth settings were not modified.
- Integration against the **final** complete output: **PASS**, 7 tests using real
  Flask WSGI over pipes (socket binding is prohibited). This verifies rendered
  client JavaScript against real Flask authentication and persistent disposable
  SQLite records. It is not a browser or live HTTP visual test.
- Final generated-output checks: **PASS**, 16 public SFI pages and 93 references,
  public account aliases, and all four preserved classroom account pages.
- CSS tokens, import resolution, responsive queries, single public stylesheet,
  nav order, and asset references pass generated-output checks. The new focus
  rule uses `:is`, giving specificity `(0,3,0)`; it follows and beats all five
  component `outline:none` rules. All 548 parsed rules are valid and scoped;
  original 480/600/800/900px responsive queries remain. This corrects the earlier `:where` precedence
  defect without `!important`.
- Production-config build: **FAIL due to environment**. The remote theme download
  fails resolving `codeload.github.com`. This is distinct from a repository
  compilation failure. No remote-theme compatibility pass is claimed.
  The complete local-theme fallback build passes; this does not establish the
  result of the production remote-theme build.
- Browser visuals: **UNVERIFIED**. No installed Chromium/Chrome, Firefox, WebKit,
  PhantomJS, or wkhtmltoimage alternative was found. Both cached Chromium builds
  depend on absent `libnspr4.so`, `libnss3.so`, `libnssutil3.so`, and
  `libasound.so.2`. Launch was attempted and failed before rendering. No system
  packages or project dependencies were changed. DNS prevents obtaining the
  missing libraries. No browser screenshots, rendered desktop/mobile comparison,
  measured overflow, or rendered focus checks passed. No reference screenshot was
  attached to the task.

Final logs and generated output: `/tmp/sfi-sass-final/`:

- `full-build-final.log`: successful complete build; output in `site-final/`.
- `production-build.log`: remote-theme download DNS failure.
- `frontend-tests.log`, `backend-tests.log`, `integration-tests-final.log`: passing test runs.
- `theme-tests-final.log`: generated HTML/CSS/assets/alias checks.
- `focus-precedence.log`, `css-inspection.json`: static CSS checks.
- `preservation.log`, `final-integrity.log`, `final-app-sha.json`: source/feature preservation.
- `browser-launch.log`, `browser-libraries.log`: browser environment failure.

The final generated CSS is byte-identical to the inspected CSS, and application
source hashes remained unchanged throughout the final build. Existing warnings
about missing `base` layouts and duplicate destinations remain in unrelated
classroom/project content. None of the duplicate destinations involves a public
SFI page or classroom account route. No unrelated project content was deleted
or rewritten to silence those warnings.

 Earlier inline-source
backups, declaration comparison, and before/after focused builds remain at
`/tmp/sfi-sass-verification/`. The original declaration comparison confirms the
layout declarations were preserved; intended differences are token definitions,
readable account text colors, scoping, and accessibility rules. Static inspection
is not visual verification.

## Public and classroom account routes

| Public URL | SFI behavior |
| --- | --- |
| `/sfifoundation/` | Redirect to the blue-and-white public homepage; original review prototype preserved at `/classroom/sfi-prototype/` |
| `/login` | SFI-themed redirect to canonical `/login/` |
| `/login/` | Existing SFI Sign In / Create Account screen |
| `/signup/` (also extensionless `/signup`) | Redirect to `/login/#register`, selecting the existing Create Account tab |
| `/profile/` (also extensionless `/profile`) | Redirect to `/sfi-profile/` |
| `/logout/` (also extensionless `/logout`) | Delete the SFI Python cookie session; return to SFI login on success or 401; show retry on failure |

**Legacy routes: RESOLVED.** The original classroom login, signup, profile and
logout pages are preserved at `/classroom/{login,signup,profile,logout}/`.
Their forms, school OAuth, Java/Python requests, role behavior, profile layout,
and combined logout helper remain in place. Only permalinks and navigation
references were updated to keep classroom users within that flow. The classroom
menus, profile sidebar, specialized Java/guest login callbacks, and shared
classroom login helper now link to those URLs. No backend API
endpoint, credential, OAuth setting, or auth configuration was changed.
Public redirect metadata and fallback links use `relative_url`. The SFI logout
script preserves Pages subpaths. Classroom CSS and widgets remain outside the
scoped SFI theme. A source comparison confirms that all four moved classroom account pages and
the review prototype are unchanged except for permalinks and navigation targets.
The official SFI logo is byte-for-byte unchanged. No SFI logo, content, gear classifier, Spec Search, quiz,
profile editor, role controls, or other SFI feature was removed.

Git safety: review branch `sfi-unified-sass-theme` starts at cached `origin/main`
`421dd2405`. Fetch was attempted but GitHub DNS failed; current remote freshness
is unverified. The original Makefile change and all five stashes are preserved.
The configured origin is `ruhaanb622/SFI-Frontend`, rather than the organization
URL in the task; it was not silently changed.

## Definitive result

| Check | Result |
| --- | --- |
| Full Jekyll build | **PASS**, complete repository with explicit local Minima fallback |
| Production remote-theme build | **FAIL**, environment DNS resolution at theme download |
| SFI visual consistency | **UNVERIFIED**, browser failed before rendering |
| Frontend tests | **PASS**, 10 tests plus generated-output checks |
| Backend tests | **PASS**, 13 isolated tests |
| Integration tests | **PASS**, 7 tests against final full build output |
| Legacy routes | **RESOLVED**, SFI public destinations and preserved classroom flows |
| Ready for approval | **NO**, rendered visual and production-theme verification remain blocked |

No commit, push, PR, merge, or deployment occurred. `main` still points to
`421dd2405`, and work remains uncommitted on `sfi-unified-sass-theme`.
The original Makefile modification, five stashes, and preexisting backend
database modification are preserved.

## Changed-file inventory

49 refactor files: 26 added, 22 modified, 1 removed. The original Makefile edit
is preserved and excluded from this count. Large apparent removals from account
and prototype pages are relocations; the original implementations are retained
in the new classroom files and verified by source comparison.

- `README.md` (modified).
- `_data/aesthetihawk_sidebar.yml` (modified).
- `_includes/aesthetihawk/header.html` (modified).
- `_includes/nav/homejava.html` (modified).
- `_includes/sfi/chatbot.html` (modified).
- `_includes/sfi/footer.html` (modified).
- `_includes/sfi/nav.html` (modified).
- `_includes/sfi/styles.html` (removed).
- `_includes/themes/minima/header.html` (modified).
- `_layouts/sfi.html` (modified).
- `_sass/sfi/_main.scss` (modified).
- `_sass/sfi/_tokens.scss` (modified).
- `assets/css/sfi.scss` (modified).
- `assets/js/api/login.js` (modified).
- `navigation/authentication/guestlogin.md` (modified).
- `navigation/authentication/login.md` (modified).
- `navigation/authentication/loginJava.md` (modified).
- `navigation/authentication/logout.md` (modified).
- `navigation/authentication/profile.md` (modified).
- `navigation/login.md` (modified).
- `navigation/sfi-profile.html` (modified).
- `navigation/sfifoundation.md` (modified).
- `navigation/signup.md` (modified).
- `_layouts/sfi-redirect.html` (added).
- `_sass/sfi/base/_accessibility.scss` (added).
- `_sass/sfi/base/_foundation.scss` (added).
- `_sass/sfi/base/_layout.scss` (added).
- `_sass/sfi/base/_properties.scss` (added).
- `_sass/sfi/components/_buttons.scss` (added).
- `_sass/sfi/components/_chatbot.scss` (added).
- `_sass/sfi/components/_data.scss` (added).
- `_sass/sfi/components/_footer.scss` (added).
- `_sass/sfi/components/_header.scss` (added).
- `_sass/sfi/components/_nav-account.scss` (added).
- `_sass/sfi/components/_navigation.scss` (added).
- `_sass/sfi/pages/_admin.scss` (added).
- `_sass/sfi/pages/_auth.scss` (added).
- `_sass/sfi/pages/_content.scss` (added).
- `_sass/sfi/pages/_hero.scss` (added).
- `_sass/sfi/pages/_profile.scss` (added).
- `assets/js/sfi/logout.js` (added).
- `docs/sfi-theme-refactor.md` (added).
- `navigation/classroom/login.md` (added).
- `navigation/classroom/logout.md` (added).
- `navigation/classroom/profile.md` (added).
- `navigation/classroom/sfi-prototype.md` (added).
- `navigation/classroom/signup.md` (added).
- `scripts/test-sfi-account-routes.mjs` (added).
- `scripts/test-sfi-theme.mjs` (added).
