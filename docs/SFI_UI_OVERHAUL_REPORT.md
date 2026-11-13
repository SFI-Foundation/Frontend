# SFI frontend — current navigation and content

The current scope preserves the white background, blue headers, readable yellow accents, and horizontal website navigation. Draft PR #31 remains closed; no new PR is being created.

## Destinations

| Top tab | Route | Content |
| --- | --- | --- |
| Home | `/` | About SFI, how its programs work, and a concise Services & Programs section |
| Spec Search | `/sfi-specs/` | Canonical specification search and authorized administration |
| History | `/history/` | SFI timeline and historical context |
| News & Events | `/news-events/` | Sourced SFI announcements and upcoming specification review meetings |
| Contact | `/contact/` | Verified contact details, address, map link, and useful enquiry guidance |
| Sign In | `/login/` | Existing sign-in, Create Account, and authenticated profile flows |

Sign In was preserved and is now an explicit top-level tab. Its forms, registration tab, authentication API, account aliases, and profile access remain intact. Contact is the tab/page name; the physical address remains useful contact information on that page.

`/about/` redirects to Home, `/services/` to `/#services`, and the generic Search/Blog and old home entry points remain compatible redirects. News & Events is now a real page rather than a redirect. No separate Services page is needed because its summary is on Home.

## Design

The OCS-style top navigation renders the ordered page paths from `_config.yml`. All six links remain visible in one row at desktop widths; narrower viewports wrap the same links. There is no side drawer, modal navigation, hamburger button, or navigation JavaScript. Public pages request only the SFI stylesheet, not Minima's header/theme bundle.

The content background stays white. SFI blue is `#1a5fa8`, text-yellow is `#ffe082`, and border/accent gold remains `#f0a500`. Yellow text has 5.00:1 contrast on SFI blue and 7.84:1 on dark blue. It highlights titles, the active navigation entry, and blue information panels.

Content remains moderately expanded and grouped: Home explains participant roles and summarizes equipment testing, quality assurance, and training. History adds context around its short timeline. Contact includes practical enquiry guidance. Spec Search remains immediately accessible without extra text above its controls. No decorative hero, chatbot, generic site-search interface, fake statistics, or unsupported events were added.

## News and service sources

News uses the existing `sfi_updates` data, limits the announcement list to three entries, and filters meetings against the build date. Each announcement links to its official source, and event entries direct visitors to confirm the official session schedule and location.

The current entries were checked against the [official SFI announcements](https://sfifoundation.com/blog/) and [meeting schedule](https://sfifoundation.com/meeting-schedule/). Home's program descriptions were checked against [Tech Inspector Certification](https://sfifoundation.com/tech-inspector-certification/) and [Incident Response Training](https://sfifoundation.com/incident-response-training/). Training is not represented as product certification.

## Preserved behavior

The specification API, canonical identities, category relationships, pagination, ranking, loading/empty/error feedback, verified-only PDF action guard, admin authorization, and all account workflows remain. A document URL alone cannot enable an approved PDF action. Backend source, specification records, credentials, environment files, production URL, and deployment workflow are unchanged.

## Verification and screenshots

[Validation](ui-overhaul/VALIDATION.md) and [structured browser results](ui-overhaul/browser-results.json) record actual checks. Six pages were exercised at 1440×900, 1024×768, 768×1024, 390×844, and 320×720. Tests cover the exact six top links, no overflow, top-row desktop layout, News & Events, Home services, Sign In/Create Account, canonical search across all 111 records, categories, pagination, PDF gating, failure recovery, redirects, and member/admin separation. Eighteen axe scans report zero WCAG A/AA violations.

Current screenshots: [Home](ui-overhaul/screenshots/after-home-1440.png), [News & Events](ui-overhaul/screenshots/after-news-events-1440.png), [Sign In](ui-overhaul/screenshots/after-sign-in-1440.png), [Contact](ui-overhaul/screenshots/after-contact-1440.png), [Spec Search](ui-overhaul/screenshots/after-specifications-1440.png). Full-page images are also available under `docs/ui-overhaul/screenshots/`. QA artifacts remain excluded from publication.

The normal preview on localhost:4500 is refreshed with the new configuration so its menu does not retain the former four-link configuration.

## Limits

Chromium and a disposable local API/database were used. Production account writes and manual screen-reader/native toolbar zoom testing were not performed. Existing unrelated Jekyll post/permalink and Sass deprecation warnings remain. News freshness depends on the existing sync-and-rebuild workflow; past meetings are omitted at build time. Historical educational source remains, while its old public Blog/Search entry pages redirect.
