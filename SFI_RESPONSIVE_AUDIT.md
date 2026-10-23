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

## Merge resolution — 2026-10-23

Integrated current `main` into `frontendui6` without reverting the Sass migration,
Pages base path, shared API configuration, SFI team links, or preview isolation.
The branch's navigation controls, responsive footer, homepage sizing, and form
sizes now live in the current scoped Sass components. The homepage retains the
required `sfi-site` body class alongside `sfi-home`. Navigation closes on Escape,
resize, and dynamically rendered authentication links.

The current `/signup/` redirect to `/login/#register` is retained instead of
restoring the old separate signup form. Detector container sizing uses the
current `.sfi__camera`/`.sfi__preview` classes; current video/canvas behavior is
preserved. The old `_includes/sfi/styles.html` stays deleted.

Validation in the conflict-resolution environment:
- Actual Sass entry compiled successfully; all referenced SFI CSS variables are
  defined, and homepage selectors compile as `.sfi-site.sfi-home`.
- Ten current source pages rendered with Liquid at both `/` and `/Frontend/`.
  These are template fixtures, not a full Jekyll build.
- Conflict-marker scan and diff whitespace checks against current `main` passed.
- Full Jekyll build was unavailable because Ruby/Bundler are not installed.
- Browser verification was unavailable: Chromium was absent and its download
  returned an invalid archive. No new browser pass is claimed.

Before merging, run the normal Jekyll build and review 375px/768px/1280px layouts,
menu open/close/Escape and sign-in state, `/signup/`, and the original audit's
spec-table overflow. The camera-overlay alignment review comment remains a
hardware/runtime validation item. This conflict resolution does not claim
issue #6 acceptance or deployment.
