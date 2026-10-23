# SFI Responsive Audit

## Coverage

Audited the generated site at 375px, 768px, and 1280px:

- Main routes: `/specs/`, `/sfi-specs/`, `/detect/`, `/quiz/`, `/login/`, `/signup/`
- Content routes: `/`, `/about/`, `/history/`, `/services/`, `/contact/`

## Issues found

- [ ] **Signup route does not resolve at `/signup/`** at any tested width. The page is emitted as `signup.html`, while its front matter sets `permalink: /signup` (without the trailing slash). The requested `/signup/` URL returned a 404 in the local preview.
- [ ] **Shared navigation link has poor contrast and looks unstyled** at all tested widths: the “SFI Foundation” link renders browser-default blue underlined text on the blue navigation bar.
- [ ] **Spec database table causes horizontal page overflow on mobile** at 375px only. The table extends 2px past the document viewport (table right edge 362px; document client width 360px). No document-level horizontal overflow was observed at 768px or 1280px.

## Other observations

- No document-level horizontal overflow was found on the other audited routes at the tested widths.
- `/sfi-specs/` displayed placeholder statistics and no database rows because its API at `localhost:8423` was unavailable in the local preview. Dynamic data and API-dependent behavior therefore remain unverified.
- The local Jekyll preview did not finish starting; screenshots and measurements were taken from the existing generated `_site` output served statically. No GitHub issue number was provided, so screenshots were not posted to issue comments.
