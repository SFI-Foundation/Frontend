# Homepage photograph and navigation repair

This repair continues `feature/sfi-photographic-redesign` and preserves the pre-existing uncommitted redesign. Nothing has been committed or pushed.

## Root cause and resolution

The actual preview at `http://localhost:4500/` was serving stale incremental output, rather than the separately tested full build at `/tmp/sfi-redesign-v2/site`.

Before repair, Chromium and the served HTML confirmed that all six card pictures had an empty `data-photograph`, empty `srcset`, empty image dimensions, and `src="/images/sfi/photography/-.jpg"`. The server returned **404** for that URL, while `/images/sfi/photography/card-specifications-480.webp` returned **200**. All intended JPEG/WebP files existed with matching lowercase filenames and extensions in both the source and preview output. The served photography credits still contained only the original five entries, although the current data has thirteen entries. The preview homepage timestamp was 21:36; the updated photography data timestamp was 21:40.

The running command was `jekyll serve ... --destination _site_preview/4500 --incremental`. This Makefile flag overrode `_config.yml`'s `incremental: false`. Incremental Jekyll generation does not track data-file dependencies, leaving the homepage and photography credits stale when `_data/sfi_photography.yml` changed. The empty Liquid data lookup generated the malformed URL. This was not a case-sensitive filename, unpublished source-directory, lazy-loading, or browser image-format failure.

`Makefile` now serves with full regeneration and `--disable-disk-cache`. The existing port-4500 server was restarted with the same source, base URL, and destination, using production-mode full generation. No source work was reset or discarded. `README.md` explains the preview dependency and how to test the actual preview destination.

Image resolution remains centralized: `_data/sfi_home_navigation.yml` selects a photography key; `_includes/sfi/feature-grid.html` passes it to `_includes/sfi/photograph.html`; the latter reads the corresponding `_data/sfi_photography.yml` record and constructs `/images/sfi/photography/<id>-<width>.webp` candidates and the JPEG fallback. Jekyll's `relative_url` adds the configured base URL exactly once. These files are copied into the same `images/` paths in generated output. Photography is not referenced from Sass backgrounds or remote URLs.

## Card assignments and presentation

All six use the existing licensed, locally hosted photographs and existing provenance records. There are no new photography downloads or asset substitutions.

| Card | Photography key | Existing photograph |
| --- | --- | --- |
| Find Specifications | `card-specifications` | Chip Ganassi Racing helmets, Carb Day 2015 — Sarah Stierch |
| Certification Programs | `card-certification` | No. 22 pit-crew helmet, 2019 — Zach Catanzareti Photo |
| Testing & Services | `card-testing` | Race-car cockpit at Watkins Glen, 2011 — Chris Waits |
| News & Updates | `card-news` | NASCAR stock cars at Las Vegas, 2012 — Todd Ellis |
| About SFI | `card-about` | Las Vegas Motor Speedway pre-race ceremonies, 2008 — WikiImages |
| Contact SFI | `card-contact` | McLaren mechanic at the 2012 Italian Grand Prix — Francesco Crippa |

The cockpit remains the closest existing approved technical-equipment photograph for Testing & Services; it is illustrative, not a photograph of an SFI laboratory. All six photographs are distinct. Source/license credits remain at `/photo-credits/` and in the manifest.

Cards retain their 3/2/1-column desktop/tablet/mobile grid, consistent radii and dimensions, full-card links, heading-based accessible names, decorative empty alternatives, lazy responsive sources, JPEG fallback, and subtle arrow/focus/hover states. Number badges were removed. The overlay is nearly transparent across the upper photograph and gradually darkens toward the white text. Images use `object-fit: cover` and explicit centered positioning. Existing optimized 480/960px derivatives are retained.

## Navigation

Spec Search now uses exactly the same text-link class as the other normal links. Shared typography, weight, padding, alignment, neutral hover background, and current-page blue underline apply to every normal link. Only the link whose URL matches the current page receives `aria-current="page"`. Sign In uses an explicit account class for its subtle outline, instead of styling whichever link happens to be last. The existing mobile menu controller, keyboard behavior, and account functionality are unchanged.

All authored style changes are in `_sass/sfi/components/`. Existing SFI colors, spacing, fonts, radii, and breakpoint mixins are reused, following the [OCS Sass guide](https://pages.opencodingsociety.com/sass/guide?context=topics). No new CSS file, inline styling, framework, or `!important` rule was introduced.

## Files changed by this repair

- `Makefile` — remove the incremental preview override.
- `README.md` — explain full regeneration and actual-preview verification.
- `_includes/sfi/nav.html` — remove Spec Search's permanent CTA class; identify account links explicitly.
- `_includes/sfi/feature-grid.html` — remove number badges.
- `_sass/sfi/components/_navigation.scss` — unify normal links and active/hover states.
- `_sass/sfi/components/_feature-grid.scss` — refine gradient, image positioning, and badge removal.
- `package.json` — include generated-photo regression checks in `test:public-build`.
- `scripts/test-sfi-photo-assets.mjs` — check all thirteen placements and every JPEG/WebP URL in actual Jekyll output, including nonempty photography records, responsive descriptors, base URL handling, and navigation state. Negative fixtures cover a missing unselected responsive image and the empty Liquid record.
- `scripts/test-sfi-redesign-browser.cjs` — record image network responses, GET every responsive/fallback candidate, inspect computed navigation styles, capture header screenshots, click each card, verify contact actions, and exercise live category filtering alongside existing search/pagination checks.
- `docs/sfi-photographic-redesign.md` — link this correction to the original review.
- `docs/sfi-home-image-navigation-repair.md` — this report.

## Verification evidence

The review folder is `qa-evidence/redesign-v2/image-nav-repair/`. It contains the before screenshot and network responses, after screenshots at 375/768/1024/1440px, dedicated navigation screenshots for Home/Spec Search/Contact (with the menu expanded on smaller viewports), browser results, and test/build logs.

The added regression check was also run against the saved broken homepage with all real source image files available. It failed with `Missing photography record produced an empty ID`, demonstrating that merely having assets in the repository cannot pass the check.

| Check | Result |
| --- | --- |
| `npm test` | PASS; profile and gear suites |
| `npm run test:styles -- _site_preview/4500` | PASS; 29 scoped Sass imports and one generated stylesheet |
| `SFI_BUILT_SITE=_site_preview/4500 npm run test:phase1` | PASS; search, demo gates, production safeguards; no skipped files |
| `SFI_BUILT_SITE=_site_preview/4500 npm run test:public-build` | PASS; all 5 checks, no skips; 2,728 generated files scanned |
| `npm run test:redesign -- _site_preview/4500` | PASS; thirteen distinct licensed photographs, source/file hashes, linked cards, destinations, contact actions, compiled Sass equality |
| Expanded profile/gear/search/demo/account regression run | PASS; 42 tests, zero failures or skips |
| Actual preview full Jekyll regeneration | PASS; 375.71 seconds; serving `http://localhost:4500/` |
| `JEKYLL_ENV=production bundle exec jekyll build --destination /tmp/sfi-repair-production --disable-disk-cache` | PASS; 560.935 seconds |
| `SFI_BUILT_SITE=/tmp/sfi-repair-production npm run test:public-build` | PASS; all 5 checks, no skips |
| Preview versus production artifact comparison | PASS; 56 files identical: thirteen public HTML pages, compiled Sass, and all 42 photographic derivatives |
| Chromium responsive review | PASS; 52 route/viewport combinations at 375, 768, 1024, and 1440px; no horizontal overflow |
| Accessibility and interaction | PASS; 32 page axe scans plus expanded mobile menu scan, keyboard focus/menu/Escape/skip-link checks, and all six actual card clicks |
| Photo network and rendering | PASS; 42 distinct JPEG/WebP candidates returned HTTP 200; every observed browser image response was 200; no asset errors; every public photograph decoded; JPEG fallback also decoded |
| Navigation | PASS; identical normal-link typography/spacing, no permanent filled background, only matching current-page indicator; Home/Spec Search/Contact screenshots at all four widths |
| Real existing backend | PASS; exact `16.1`, distinct `20.1/1` and `20.1/2`, approved PDF actions and restricted PDF safeguards, empty/reset states, Auto Racing filter and clear, 111 unique paginated results |
| Contact and navigation fallbacks | PASS; visible email/phone links, mobile menu, and no-JavaScript navigation |
| Public link/path/API configuration checks | PASS; 289 links/fragments/assets, 15 routes and 368 internal targets, existing local/hosted API resolution |
| Syntax and whitespace | PASS; browser script syntax and `git diff --check` |
| Isolated Jekyll incremental reproduction | PASS; data update retained `/images/-.jpg` in incremental output; full generation produced `/images/card-specifications-960.jpg` |
| Saved broken homepage negative check | Expected FAIL; missing photography record caught even with all intended image files present |

The visual review opened the saved screenshots for all four homepage widths, the Home/Spec Search/Contact desktop headers, the expanded mobile Spec Search header, and the Contact/search pages. All six card photographs are plainly visible with intentional crops and readable text.

During development, the expanded browser harness was corrected to activate keyboard modality before checking `:focus-visible`, scope photography checks away from the detector's hidden runtime result placeholder, and allow the Contact page's two legitimate email links. These were test assumptions, and required no changes to application functionality.

Screenshot links:

| View | Screenshot |
| --- | --- |
| Home, 375px | [Mobile homepage](../qa-evidence/redesign-v2/image-nav-repair/screenshots/after-home-375.png) |
| Home, 768px | [Tablet homepage](../qa-evidence/redesign-v2/image-nav-repair/screenshots/after-home-768.png) |
| Home, 1024px | [Laptop homepage](../qa-evidence/redesign-v2/image-nav-repair/screenshots/after-home-1024.png) |
| Home, 1440px | [Desktop homepage](../qa-evidence/redesign-v2/image-nav-repair/screenshots/after-home-1440.png) |
| Home navigation | [Desktop header](../qa-evidence/redesign-v2/image-nav-repair/screenshots/navigation-home-1440.png) |
| Spec Search navigation | [Desktop header](../qa-evidence/redesign-v2/image-nav-repair/screenshots/navigation-sfi-specs-1440.png) |
| Contact navigation | [Desktop header](../qa-evidence/redesign-v2/image-nav-repair/screenshots/navigation-contact-1440.png) |

All twelve dedicated navigation screenshots (three pages at four widths), the additional public-page screenshots, expanded mobile menu screenshot, network records, and logs are in the review folder.

## Remaining issues and preservation

No unresolved image or navigation defect was found in this review. Existing unrelated classroom duplicate-output and post-link deprecation warnings remain in the Jekyll build. The cockpit image is an illustrative technical-equipment photograph; replacing it with SFI-owned laboratory photography is a future content option.

The browser review used anonymous, read-only access to the existing API. Account/role regressions passed; authenticated administrative writes and email delivery were not performed. No backend source, specification dataset, PDF record, authentication controller, security safeguard, or search module was changed. No removed demonstration feature was reintroduced.

Branch: `feature/sfi-photographic-redesign`. HEAD remains `c4eb6e08c1eb63ad20ed550c3141541f55afddd7`. The working tree contains 24 modified tracked files and 37 untracked files, including the existing redesign; nothing is staged. The existing uncommitted work remains present. No commit, push, merge, or deployment was performed. The corrected local preview remains available at `http://localhost:4500/`.
