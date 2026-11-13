# Real racing photography in the SFI header

Historical implementation at `4bae7bd93`, superseded by [photography in page content](../SFI_SITE_PHOTOGRAPHY_REPORT.md). The navbar photo and its thumbnails have been removed.

Branch: `feature/sfi-final-ui-polish`. Baseline: `d72acaf94`.

Replaced the helmet/checkered-flag SVG with one real drag-racing photograph. Removed the SVG file, its CSS class and runtime references. The original SFI logo, six navigation destinations, authentication and specification-search logic are unchanged.

## Image source and permission

The selected photograph is **“Dragster” by Ozzy Delaney**, dated 27 October 2012, available under **Creative Commons Attribution 2.0 Generic**:

- [Source, author and license record on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dragster_(8128576328).jpg)
- [Reviewed Commons revision](https://commons.wikimedia.org/w/index.php?title=File:Dragster_(8128576328).jpg&oldid=1286983973)
- [Original photographer's Flickr page](https://www.flickr.com/photos/24931020@N02/8128576328/)
- [CC BY 2.0 license](https://creativecommons.org/licenses/by/2.0/)

The Commons record includes a Flickr license review confirming CC BY 2.0. Attribution, source and license links, and the crop/resize notice appear in the shared site footer. The derivatives retain the photograph's CC BY 2.0 license separately from the site code. [Asset attribution](../../images/sfi/PHOTOGRAPHY.md) records the source and processing details; [image-processing.json](image-processing.json) records hashes and dimensions.

Research included the official SFI site, Google Images and Commons. [SFI's published terms](https://sfifoundation.com/website-terms-of-use/) limit copying and public display; no additional permission for those photographs was established, so they were not copied. Google Images returned a traffic-verification page and was not bypassed. Commons candidates included event staging, government event photography, and track action. The selected single-car photograph provides an authentic racing scene with silver/blue equipment that suits the existing palette. Flickr could not be loaded directly by the browser tool; the Commons license record and recorded Flickr review supplied the reuse evidence.

No claim is made that the depicted vehicle, driver or equipment is SFI-certified, or that the photographer endorses SFI. The photograph was cropped and resized without generative editing, compositing, or recoloring. Scene signage remains part of the original photograph; no text overlay was added.

## Layout and optimization

- One 120×42px rectangular crop beside the existing logo/name, with 4px corners and no border, shadow or animation.
- Header remains 68px tall. Photography hides below 1024px; logo/name and navigation remain available.
- Explicit width/height and a 1x/2x `srcset` prevent resizing during loading and support Retina screens.
- Local WebP derivatives: **2,288 bytes** (120×42) and **6,614 bytes** (240×84). The 842,325-byte original and rejected candidates are not shipped.
- Empty `alt` and `aria-hidden="true"` keep the decorative photograph out of the existing home link's accessible name.
- A wider homepage image could show more racing detail, but would add another visual section and page height. This change keeps the requested photograph beside the logo and preserves the existing homepage structure.

## Screenshots

| Width | Before | After |
| --- | --- | --- |
| 1440px | [Header](screenshots/before-1440.png) | [Header](screenshots/after-1440.png) |
| 1024px | [Header](screenshots/before-1024.png) | [Header](screenshots/after-1024.png) |
| 768px | [Header](screenshots/before-768.png) | [Header](screenshots/after-768.png) |
| 390px | [Header](screenshots/before-390.png) | [Header](screenshots/after-390.png) |
| 320px | [Header](screenshots/before-320.png) | [Header](screenshots/after-320.png) |

![Updated desktop header](screenshots/after-1440.png)

[Mobile menu open](screenshots/after-mobile-open.png) · [Mobile photo credit](screenshots/after-footer-390.png) · [Full homepage and photo credit](screenshots/after-home-1x.png) · [Retina capture](screenshots/after-home-2x.png).

## Actual validation

| Check | Result | Evidence |
| --- | --- | --- |
| Production-mode Jekyll build of public SFI pages, using real configuration/layouts/Sass/assets | Passed, exit 0; unrelated legacy educational pages not rebuilt | [Build](checks/build.log) |
| `npm test` | 22 passed | [Unit tests](checks/unit.log) |
| `npm run test:phase1` | 16 passed; 2 complete-production-artifact checks skipped in this source-only run | [Phase 1](checks/phase1.log) |
| Existing search/account-route suite | 20 passed | [Search/account](checks/search-account.log) |
| Existing Sass compilation/scoping check | Passed | [Styles](checks/styles.log) |
| Rendered-client/Flask authentication integration | 7 passed using disposable SQLite fixtures | [Integration](checks/auth-integration.log) |
| Public internal link/fragment check | 177 targets, no errors | [Links](checks/links.log) |
| Existing browser regression | 35 layouts, all six destinations plus Create Account, all 111 specification identities, categories, pagination, PDF gating, redirects and member/admin separation passed; zero page exceptions | [Browser log](checks/browser.log), [results](browser-results.json) |
| Accessibility | 21 page axe scans plus one open-mobile-menu scan; zero violations; keyboard menu/Escape checks passed | [Header checks](checks/header.log), [results](header-results.json) |
| Header geometry and overflow | Passed at 1440, 1024, 1023, 960, 801, 768, 390 and 320px; unchanged logo/header dimensions; desktop navigation clearance ≥24px | [Header results](header-results.json) |
| Image loading and layout stability | 1x/2x local WebP selection and decoding passed; delayed-image tests retained identical header/navigation boxes and measured layout-shift score 0 | [Loading log](checks/loading.log), [results](loading-results.json) |
| Original logo, removal and asset/source checks | Passed | [Assets](checks/assets.log) |

Screenshots were reviewed in Chromium at desktop and mobile widths, including the footer credit. The browser regression's full-page screenshots are temporary QA artifacts; the requested updated screenshots are delivered above. Automated accessibility checks are not manual screen-reader or cross-browser certification. Existing Sass deprecation warnings remain. No backend source, production data, credentials or secret settings were changed. No PR or merge.
