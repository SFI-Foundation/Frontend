# SFI frontend — revised four-page scope

The latest requested structure replaces the earlier consolidated design. The existing draft PR #31 was closed at the user's request. No new PR is being created.

## Public pages

| Menu entry | Route | Content |
| --- | --- | --- |
| Home | `/` | About SFI: purpose, how specification programs work, and one spec-search action |
| Spec Search | `/sfi-specs/` | Existing canonical specification search and authorized administration |
| History | `/history/` | A short, separate history of SFI |
| Contact & Location | `/contact/` | Verified email, phone, fax, address, and a map link |

`/about/`, `/services/`, `/news-events/`, `/search/`, `/navigation/blogs/`, and the old home aliases redirect to the appropriate remaining page. They no longer present separate About, Services, News, generic Search, or Blog interfaces. Existing account, gear, and administration functionality remains available outside the public menu.

## Menu and colors

The public shell uses an OCS-style horizontal top navigation bar in `_includes/nav/ocs-menu.html`. Its four visible links come from `_config.yml` and remain in one row at desktop widths. Narrow windows wrap the same links below the brand. There is no side drawer, modal, hamburger button, or navigation JavaScript; the obsolete drawer script was removed.

The earlier SFI appearance is restored: the original blue `#1a5fa8` navigation, blue page banners with white text, white content, and yellow `#f0a500` active-link accents. Public pages load only `/assets/css/sfi.css`, without Minima's header, stylesheet, or theme-switching scripts. The remote theme dependency remains available to inherited non-SFI layouts during the Jekyll build.

The white page background and horizontal navigation remain. Yellow text `#ffe082` now highlights page-title words, the active navigation link, and headings/links in blue information panels. The lighter text yellow contrasts 5.00:1 against SFI blue and 7.84:1 against dark blue; the existing `#f0a500` remains the border/accent color.

Content is now moderately expanded: Home explains the roles of manufacturers, technical committees, and racing organizations, plus testing and quality assurance. History adds context before and after its short timeline. Contact adds practical guidance for specification, testing, and product/label questions. Spec Search remains immediately accessible, without extra material above its controls. No extra pages, statistics, news feed, chatbot, or decorative hero were restored.

At 1440×900 the document heights are 1133px for Home, 1078px for History, and 978px for Contact: a short scroll beyond the first screen rather than the former long landing page. [Full Home screenshot](ui-overhaul/screenshots/after-home-full-1440.png), [full History](ui-overhaul/screenshots/after-history-full-1440.png), [full Contact](ui-overhaul/screenshots/after-contact-full-1440.png).

## Preserved functionality

The specification API, canonical identities, category relationships, pagination, search ranking, loading/empty/error feedback, PDF approval guard, and admin authorization remain intact. A document URL alone cannot enable a PDF action. No backend source, specification records, credentials, environment files, production URL, or deployment workflow was changed.

## Validation

See [current validation results](ui-overhaul/VALIDATION.md) and [browser results](ui-overhaul/browser-results.json). The complete production build passed, and its four pages, account page, and CSS exactly matched the browser-reviewed output.

Five viewport sizes were checked: 1440×900, 1024×768, 768×1024, 390×844, and 320×720. All passed without horizontal overflow. Fifteen axe scans found no WCAG A/AA violations. Browser checks verify that only the SFI stylesheet loads, desktop links are visible in one top row, and no drawer or menu script is present. Search, all 111 canonical records, all categories, pagination, PDF gating, error recovery, redirects, and member/admin view separation passed against the disposable local API.

The existing preview on port 4500 had cached the former navigation configuration. It was restarted with the verified output and refreshed configuration, preserving its host, port, destination, and incremental watching.

## Screenshots

Current: [desktop home](ui-overhaul/screenshots/after-home-1440.png), [mobile home](ui-overhaul/screenshots/after-home-390.png), [desktop spec search](ui-overhaul/screenshots/after-specifications-1440.png), [mobile spec search](ui-overhaul/screenshots/after-specifications-390.png), [1024px desktop home](ui-overhaul/screenshots/after-home-1024.png), [desktop history](ui-overhaul/screenshots/after-history-1440.png), [desktop contact](ui-overhaul/screenshots/after-contact-1440.png).

The `before-*` images show the original main-branch UI. Reports and screenshots are excluded from the published site.

## Limits

Tests use Chromium and a disposable API/database; production account writes and manual screen-reader testing were not performed. Existing unrelated legacy Jekyll post/permalink and Sass deprecation warnings remain. Historical educational source content is retained; its former public Blog and Search entry pages now redirect.
