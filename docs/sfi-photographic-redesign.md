# SFI photographic redesign

Follow-up: [Homepage image and navigation repair](sfi-home-image-navigation-repair.md)
corrects the stale incremental preview on port 4500 and the permanent blue Spec
Search navigation style. The original checks below used a separate full-build
destination; they did not establish that the still-running preview was current.

Implemented on November 15, 2026 (America/Los_Angeles). This is a local review implementation; it has not been committed, pushed, merged, or deployed.

## Result

- A full-width photographic homepage hero, clear specification-search action, and six whole-card photographic navigation links.
- A 3-column desktop grid, 2-column tablet grid, and single-column phone layout, with larger photographic cards, numbered markers, and restrained hover movement.
- A substantially shorter homepage: substantially less explanatory text, with detailed program information moved to dedicated destinations. The detailed mission, manufacturer, technical committee, sanctioning-body, testing, and training information is preserved on About and Services.
- A photographic Contact banner, verified contact cards, office map link, and inquiry guidance. Email links open the visitor's email application; there is no submission form or new endpoint.
- A white official-logo header, prominent blue Spec Search action, clear active-page underline, keyboard-operable mobile menu, consistent page headings, and organized charcoal footer across all SFI layouts.
- The official logo, existing blue brand palette, and restrained gold accent are retained. One charcoal token was added for photographic overlays and footer surfaces.

## Files by purpose

Content and destinations:

- `index.md` — concise photographic navigation homepage.
- `navigation/about.md` — replaces the homepage redirect with preserved organizational and specification-program content.
- `navigation/services.md` — replaces the homepage-section redirect with testing, participation, and training content; destination anchors for the homepage cards.
- `navigation/contact.md` — complete contact presentation and direct actions.
- `navigation/sfi-specs.md` — About link destination and presentation-only migration of inherited inline styles into SCSS. Canonical search and administrative logic are preserved.
- `_data/sfi_home_navigation.yml` — six titles, descriptions, routes, and photography keys.
- `_data/sfi_photography.yml` — thirteen licensed source records, including eight additional photographs with unique placement assignments.
- `docs/site-photography/image-manifest.json` — original/downloaded dimensions, crop coordinates, file sizes, and SHA-256 provenance for every derivative.
- `images/sfi/PHOTOGRAPHY.md` — updated license inventory and uniqueness policy.
- `images/sfi/photography/card-{specifications,certification,testing,news,about,contact}-*` — distinct responsive WebP images and JPEG fallbacks for each card.
- `images/sfi/photography/{contact-banner,services-banner}-*` — distinct responsive banner images and fallbacks.
- `_config.yml` — adds the useful About destination to primary navigation; History remains accessible from About and the footer.

Reusable templates:

- `_includes/sfi/feature-grid.html` — whole-card anchors with heading-based accessible names, decorative photographs, and noninteractive arrows.
- `_includes/sfi/photograph.html` — optional decorative mode with empty image alternatives; informative photographs retain their existing alternatives and captions.
- `_includes/sfi/nav.html` — SFI header using the existing configured navigation tree and unchanged menu controller.
- `_includes/sfi/footer.html` — grouped links and verified contact details; existing sign-in/profile state script is retained.

SCSS foundations and shared presentation:

- `_sass/sfi/_tokens.scss` — charcoal token and consistent photograph radius.
- `_sass/sfi/_main.scss` — connects four new partials to the existing scoped import hub.
- `_sass/sfi/base/_layout.scss` — heading hierarchy, reading widths, and page spacing.
- `_sass/sfi/base/_accessibility.scss` — allows visible blue keyboard outlines on the new white header.
- `_sass/sfi/components/_navigation.scss` — header, primary action, active states, and progressive mobile menu presentation.
- `_sass/sfi/components/_footer.scss` — responsive grouped footer.
- `_sass/sfi/pages/_content.scss` — removes the unused old feature-card rules that conflicted with photographic cards; applies preserved program spacing to About.
- `_sass/sfi/pages/_photography.scss` — retains editorial photography, news, and compact search imagery; removes the old split homepage hero rules.
- `_sass/sfi/pages/_specs.scss` — migrated admin sort indicators, admin heading alignment, and suggestion cursor styling.

New reusable SCSS:

- `_sass/sfi/components/_image-banner.scss` — responsive decorative `<picture>` backgrounds, dark overlays, shared typography, and light focus indicators. Used by Home, About, Services, and Contact.
- `_sass/sfi/components/_feature-grid.scss` — responsive card grid, image crops, readable overlays, heading/description styles, arrow affordance, hover, and focus states.
- `_sass/sfi/pages/_home.scss` — large hero, actions, exploration section, and concise purpose section.
- The hero now has a gold headline accent and a blue/gold track-edge detail; cards expose more of their photographs and add numbered markers; the purpose section uses a contrasting deep-blue surface. All effects remain in SCSS and respect reduced-motion settings.
- `_sass/sfi/pages/_contact.scss` — information cards, two-column guidance layout, and specification-search prompt.

Verification and documentation:

- `scripts/test-sfi-redesign.mjs` — checks actual generated links/fragments, six accessible cards, decorative/lazy images, preserved content, contact actions, no inline presentation on major public pages, and equality with actual Sass compilation.
- `scripts/test-sfi-redesign-browser.cjs` — responsive Chromium review, axe checks, focus/menu checks, live API search, pagination, image fallback, and no-JavaScript navigation.
- `package.json` — adds `test:redesign`; no dependency changes.
- `README.md` — current visual architecture and review instructions.
- `docs/sfi-photographic-redesign.md` — this report.

All authored visual rules are SCSS. The existing front-matter entry `assets/css/sfi.scss` still compiles through `_sass/sfi/_main.scss` to `assets/css/sfi.css`, loaded once by `_layouts/sfi.html`. New partials use existing spacing, colors, radii, container/focus mixins, and short selector nesting. No framework, handwritten CSS file, inline style, or runtime styling system was added.

The [OCS Sass guide](https://pages.opencodingsociety.com/sass/guide?context=topics) was retrieved and reviewed for variables, mixins, partial organization, central imports, and compiler verification. The supplied `/topics/view/sass/guide/` URL forwards to that reader. The supplied `/navigation/sass/containers/` URL returned HTTP 404 during this task. SFI's own container mixin remains in use; the OCS framework was not imported.

## Photography

Eight additional licensed photographs give each of the thirteen public photo placements its own source. All derivatives remain local under `images/sfi/photography/`. Existing source/license data in `_data/sfi_photography.yml`, byte/hash records in `docs/site-photography/image-manifest.json`, and public `/photo-credits/` attribution remain intact.

| Existing key | Source and photographer | License | Uses |
| --- | --- | --- | --- |
| `hero` | [NHRA Winter Nationals (6925152129)](https://commons.wikimedia.org/wiki/File:NHRA_Winter_Nationals_(6925152129).jpg), Scott cutler | CC BY-SA 2.0 | Homepage hero |
| `safety` | [Ken SchraderHANSdevice](https://commons.wikimedia.org/wiki/File:Ken_SchraderHANSdevice.jpg), Bo Nash | CC BY-SA 2.0 | About banner |
| `specs` | [Racers Helmet (6234927568)](https://commons.wikimedia.org/wiki/File:Racers_Helmet_(6234927568).jpg), Bryce Walker | CC BY 2.0 | Compact specification-search image |
| `history` | [Racing in San Antonio, Texas 1968 (3949605466)](https://commons.wikimedia.org/wiki/File:Racing_in_San_Antonio,_Texas_1968_(3949605466).jpg), JOHN LLOYD | CC BY 2.0 | History editorial image |
| `news` | [Drag Racing Cars](https://commons.wikimedia.org/wiki/File:Drag_Racing_Cars.jpg), JoseE1471 | CC BY-SA 4.0 | News editorial image |
| `services-banner` | [McLaren mechanic on 2010 Canadian GP.jpg](https://commons.wikimedia.org/wiki/File:McLaren_mechanic_on_2010_Canadian_GP.jpg), Mark McArdle | CC BY-SA 2.0 | Services banner |
| `card-contact` | [2012 Italian GP - Mechanic.jpg](https://commons.wikimedia.org/wiki/File:2012_Italian_GP_-_Mechanic.jpg), Francesco Crippa | CC BY 2.0 | Contact SFI card |
| `card-news` | [NASCAR-LasVegas-2012.jpg](https://commons.wikimedia.org/wiki/File:NASCAR-LasVegas-2012.jpg), Todd Ellis | CC0 | News & Updates card |
| `card-about` | [NASCAR-LasVegas-2008.jpg](https://commons.wikimedia.org/wiki/File:NASCAR-LasVegas-2008.jpg), WikiImages (Pixabay) | CC0 | About SFI card |
| `card-specifications` | [Chip Ganassi Racing helmets - Carb Day 2015 - Sarah Stierch.jpg](https://commons.wikimedia.org/wiki/File:Chip_Ganassi_Racing_helmets_-_Carb_Day_2015_-_Sarah_Stierch.jpg), Sarah Stierch | CC BY 4.0 | Find Specifications card |
| `card-certification` | [No. 22 pit crew member (40564671273).jpg](https://commons.wikimedia.org/wiki/File:No._22_pit_crew_member_(40564671273).jpg), Zach Catanzareti Photo | CC BY 2.0 | Certification Programs card |
| `contact-banner` | [Front row pit crew (53698604971).jpg](https://commons.wikimedia.org/wiki/File:Front_row_pit_crew_(53698604971).jpg), Zach Catanzareti Photo | CC BY 2.0 | Contact banner |
| `card-testing` | [Inside the cockpit of a race car (6051590642).jpg](https://commons.wikimedia.org/wiki/File:Inside_the_cockpit_of_a_race_car_(6051590642).jpg), Chris Waits | CC BY 2.0 | Testing & Services card |

These are illustrative motorsports photographs, not representations of SFI laboratory activities or proof of equipment certification. A link to source, photographer, license, and modification records is available in every footer.

The hero is eager with high fetch priority. Card photographs are lazy. Responsive WebP sources and JPEG fallbacks use the same include, with no duplicate CSS background downloads. Photos use `object-fit: cover`; they are not stretched. No photograph is reused between cards, heroes, or destination pages. The regression check audits all thirteen placements and checks source identities, asset hashes, and public license credits. Original-source downloads that were rate-limited were replaced with Wikimedia-provided 1280px thumbnails; exact download URLs and crop dimensions are recorded in the manifest, and derivatives were never enlarged.

SFI could improve the specificity of the imagery by providing approved photographs of laboratory tests, equipment inspection, training, and its team. These are optional future replacements; no unlicensed or fabricated substitutes were introduced. The referenced SRFSC screenshot was not attached in this session, so this follows the written structural inspiration rather than a pixel comparison.

## Local visual evidence

Disposable captures and browser reports are Git-ignored under `qa-evidence/redesign-v2/`; no screenshots or generated site output are proposed for commit.

| Page | Before, 1440px | After, 1440px | Before, 375px | After, 375px |
| --- | --- | --- | --- | --- |
| Homepage | [Before](../qa-evidence/redesign/screenshots/before-home-1440.png) | [After](../qa-evidence/redesign-v2/screenshots/after-home-1440.png) | [Before](../qa-evidence/redesign/screenshots/before-home-375.png) | [After](../qa-evidence/redesign-v2/screenshots/after-home-375.png) |
| Contact | [Before](../qa-evidence/redesign/screenshots/before-contact-1440.png) | [After](../qa-evidence/redesign-v2/screenshots/after-contact-1440.png) | [Before](../qa-evidence/redesign/screenshots/before-contact-375.png) | [After](../qa-evidence/redesign-v2/screenshots/after-contact-375.png) |

Before: split homepage introduction and photograph followed by detailed program explanations; plain contact columns and guidance. After: photographic hero and navigation cards with preserved detail on dedicated destinations; photographic Contact introduction and structured contact/guidance columns. Tablet and laptop versions are saved alongside these files.

Desktop/mobile homepage, Contact, About, Services, and mobile specification results were opened for visual inspection. Automated scans complement that inspection: gradients make automated photo contrast analysis incomplete, so card text color and overlay placement were also checked directly.

## Verification

All results below were executed successfully against the final source/build. Current refinement evidence is under `qa-evidence/redesign-v2/`. The full build, all four requested npm checks, 42 regression tests, thirteen-photo uniqueness/provenance checks, and link checks passed. The final browser run passed 52 layouts at four widths, 32 page accessibility scans plus the open-menu check, live search across 111 records, image fallbacks, and keyboard navigation, with no unexpected page, console, or asset errors.

| Check | Result |
| --- | --- |
| Full Jekyll build, actual configured remote Minima theme | PASS; final output `/tmp/sfi-redesign-v2/site`, 319.117 seconds |
| `npm test` | PASS; profile and gear test files |
| `SFI_BUILT_SITE=/tmp/sfi-redesign-v2/site npm run test:phase1` | PASS; canonical search, demo restrictions, and public cleanup |
| `npm run test:styles -- /tmp/sfi-redesign-v2/site` | PASS; actual Sass entry, 29 active imports, scoped output, single stylesheet on quiz/admin |
| `SFI_BUILT_SITE=/tmp/sfi-redesign-v2/site npm run test:public-build` | PASS; 3 tests, no skips; 2,728 generated files scanned for known exposed values, private files, and fabricated manufacturer data |
| `npm run test:redesign -- /tmp/sfi-redesign-v2/site` | PASS; thirteen unique source photographs, hashes and credits, six cards, destination fragments, contact actions, no inline presentation on major public pages, and compiled CSS equality |
| Expanded `node --test --test-isolation=none` run of profile, gear, spec search, manufacturer demo, and account-route suites | PASS; 42 tests, zero failures/skips |
| `python3 scripts/check-sfi-public-links.py /tmp/sfi-redesign-v2/site` | PASS; 289 links/assets/fragments, no errors |
| `python3 scripts/test-sfi-paths.py /tmp/sfi-redesign-v2/site` | PASS; 15 routes and 368 internal navigation/asset targets |
| `node scripts/test-sfi-api-config.mjs /tmp/sfi-redesign-v2/site` | PASS; local/hosted API resolution, credentials, quiz requests, and generated script references |
| `bundle exec ruby scripts/test-sfi-demo-gates.rb` | PASS; default-off, strict boolean validation, production opt-in rejection |
| Final Chromium browser script | PASS; 52 route/viewport combinations at 375, 768, 1024, and 1440px; no horizontal overflow |
| Accessibility | PASS; 32 page axe scans plus open mobile-menu scan; no violations of tested WCAG A/AA rules; visible photo-card focus and readable white photo text asserted separately |
| Keyboard and fallback behavior | PASS; Space opens menu, Tab reaches links, Escape closes/returns focus, skip link reaches main, navigation available without JavaScript, WebP and JPEG fallback images decode |
| Real local API search | PASS; canonical `16.1`, separate `20.1/1` and `20.1/2`, verified PDF action, restricted documents without PDF actions, empty/reset state, and 111 distinct paginated results |
| Browser errors/assets | PASS; zero page exceptions, missing image/script/style responses, or unexpected console errors; 76 expected anonymous authentication probes returned 401 |
| JavaScript syntax and `git diff --check` | PASS |

The first browser review exposed inherited card styling that left headings and descriptions dark on photographs. That conflicting unused card block was removed, white text was asserted explicitly, and the final suite passed. Test harness fixes handled JSDOM's loading attribute, axe's explicit browser-context requirement, and the authoritative PDF URL's `www` hostname. Initial preview attempts before server/build readiness and sandbox failures are not counted as successful runs. Remote-theme fetching and Chromium/socket access succeeded with the required execution permissions; temporary Chromium libraries and QA packages are under `/tmp`.

Inherited classroom duplicate-output/post-link warnings and Sass `@import` deprecation warnings remain. They also occur in the baseline build; no build error remains. The final browser review used anonymous, read-only API access. Authenticated administrative writes, PDF approval/revocation mutations, email delivery, and physical-device testing were not performed. Existing regression suites cover preserved role/authentication and PDF-status behavior; the application logic was not changed.

No unresolved redesign-blocking visual issue was observed at the requested screen widths. Additional SFI-owned photography remains an optional content improvement. The audit covers public SFI pages and shared account/administrative layout presentation, not a redesign of inherited classroom lessons or isolated prototypes.

## Git and preservation

- Feature branch: `feature/sfi-photographic-redesign`.
- Baseline and current HEAD: `c4eb6e08c1eb63ad20ed550c3141541f55afddd7`, fetched from `sfi/main` before branch creation (merge of Frontend PR #32).
- The worktree contains the original redesign changes plus the new photography, provenance, and visual refinements. Changes remain unstaged and uncommitted. No push, merge, or deployment occurred.
- The actual sibling repositories are `SFI-Frontend/` (Jekyll) and `SFI-Backend/` (Flask), beneath `/home/ruhaanb622/sfi-foundation/`.
- Backend HEAD: `17a1e7ac7acd4bd1677c4d2fcf4ec2f9ce845aa9`. Existing modified `.env.example` and untracked feedback API/model/test/documentation files remain untouched.
- No specification dataset, PDF authority record, backend source, authentication controller, navigation controller, or specification-search module was modified. Browser API checks only read existing data.

## Preview and repeat verification

From `SFI-Frontend`, with the repository's Ruby bundle and npm dependencies installed:

```sh
bundle exec jekyll serve --host 127.0.0.1 --port 4600 \
  --destination /tmp/sfi-redesign-preview --disable-disk-cache
```

Open `http://localhost:4600/`, `/contact/`, `/about/`, `/services/`, and `/sfi-specs/`. The existing local backend at `http://localhost:8605` is needed for live catalog/account behavior. Jekyll needs network access for its configured remote Minima theme. Static presentation does not require an AI provider or a database initialization step.

For a static build and required checks:

```sh
bundle exec jekyll build --destination /tmp/sfi-redesign-build --disable-disk-cache
npm test
npm run test:phase1
npm run test:styles -- /tmp/sfi-redesign-build
npm run test:redesign -- /tmp/sfi-redesign-build
SFI_BUILT_SITE=/tmp/sfi-redesign-build npm run test:public-build
python3 scripts/check-sfi-public-links.py /tmp/sfi-redesign-build
python3 scripts/test-sfi-paths.py /tmp/sfi-redesign-build
```

The browser review uses Playwright and `@axe-core/playwright`, installed as temporary QA tooling rather than website dependencies. Set `SFI_PLAYWRIGHT_MODULE`, `SFI_AXE_MODULE`, and `SFI_CHROMIUM` if those are outside normal module/browser discovery; set `SFI_UI_URL` for another preview URL. The existing API must allow that localhost origin. Then run `node scripts/test-sfi-redesign-browser.cjs`.
