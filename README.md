# SFI Foundation Prototype Frontend

This repository contains the frontend for the SFI Foundation capstone prototype. The goal is to show how the original `sfifoundation.com` experience could be modernized while preserving the value of SFI's standards, specification PDFs, and safety information.

The original site contains important motorsports safety resources, but the information is difficult to search, navigate, personalize, and update. This prototype explores a more usable SFI-run system with searchable standards, role-aware pages, gear tracking, AI assistance, image-based equipment detection, and staff/admin workflows.

This is a prototype, not a production replacement for SFI Foundation's official website.

## Project Structure

Important frontend files and directories:

| Path | Purpose |
| --- | --- |
| `_layouts/sfi.html` | Public SFI page shell with shared navigation, footer, and one compiled Sass stylesheet. |
| `_includes/sfi/nav.html` | SFI navigation bar and sign-in state display. |
| `_includes/sfi/chatbot.html` | Preserved assistant widget; currently disconnected from the public shell. |
| `assets/css/sfi.scss`, `_sass/sfi/` | Single compiled public SFI theme, organized as reusable Sass partials. |
| `_includes/sfi/footer.html` | Shared SFI footer. |
| `navigation/*.md` | Main SFI frontend pages and other site pages. |
| `assets/js/sfi/*` | JavaScript modules for gear tracking, detector, and SFI page behavior. |
| `_data/sfi_specs.json` | Extracted SFI specification data used by search/classifier imports. |
| `scripts/extract_sfi_specs.py` | Extracts structured spec data from the archived SFI pages. |
| `scripts/sfi_db_init.py` | Local database import helper for SFI spec data. |
| `sfifoundation.com/` | Archived source copy of the current SFI site used as reference/extraction input. |

## Main Routes

| Route | Description |
| --- | --- |
| `/`, `/sfifoundation/` | Public SFI homepage; the legacy URL redirects to `/`. |
| `/classroom/sfi-prototype/` | Preserved prototype landing and review page. |
| `/about/`, `/history/`, `/services/`, `/contact/` | Redesigned informational SFI content pages. |
| `/specs/` | Specification category browsing page. |
| `/sfi-specs/` | Canonical specification search, category filters, pagination, document status, and permission-protected catalog administration. Research/classifier controls are isolated from the public search. |
| `/detect/` | Client-side image/camera equipment detector using TensorFlow.js models. |
| `/quiz/` | "My Gear" tracking page with certification dates and local/backend storage behavior. |
| `/login/`, `/signup/` | SFI-styled authentication pages connected to the Flask backend. |
| `/admin/` | Permission-protected administration for users, groups, and gear review. |

## Implemented Features

- Modern SFI-themed UI, shared layout, navigation, and content pages.
- Specification-number and product-name search, category filters, and deterministic pagination on `/sfi-specs/`.
- SFI metadata and document status; PDF actions are limited to verified current official documents.
- Client-side image/camera equipment detector using COCO-SSD and MobileNet in the browser.
- Permission-protected catalog administration, including document approval invalidation safeguards.
- Authenticated gear tracking and staff review, with local fallback and sync-error states.

## Known Gaps

- A newly selected backend database requires the additive Phase 1 catalog setup. An empty catalog returns HTTP 503 rather than a misleading successful empty result; see `docs/sfi-phase1.md`.
- The retained chatbot include and its Sass are not loaded by the public shell. Reconnecting or removing them requires a separate feature decision.
- Live AI-provider behavior and PDF-summary quality are outside the photographic redesign's acceptance checks.
- Older visual/import tests retain assumptions from superseded layouts. Current build and browser checks are documented in `docs/sfi-final-premerge-audit.md`.
- The detector is browser-side image classification. It can suggest likely equipment categories, but it does not verify official SFI labels, certification status, or compliance.

## Future Work

- Continue reviewing document authority, revisions, and category assignments through the existing Phase 1 import/approval workflow.
- Evaluate PDF summaries and the retained assistant separately before exposing them in public search.
- Continue usability testing with camera hardware, live models and production APIs.
- Reconcile historical visual-test assumptions without weakening current checks or restoring removed research controls.

## 2026–27 team

| Role | Team members |
| --- | --- |
| Scrum Masters | Ruhaan Bansal ([@ruhaanb622](https://github.com/ruhaanb622)), Ishan Jha ([@Jupiterian](https://github.com/Jupiterian)) |
| Developers | Arya Taghavi Zargar ([@aRYA622-y](https://github.com/aRYA622-y)), Ishan Khandelwal ([@Grazer01LA](https://github.com/Grazer01LA)), Deyar Raissadat ([@DrDeyar](https://github.com/DrDeyar)), Vayun Shekhar ([@Droidsector23](https://github.com/Droidsector23)) |

Issue #7's accountable owner is Ruhaan Bansal; priority is Medium.

- [Current capstone setup and system diagram](https://sfi-foundation.github.io/Frontend/capstone/sfi-repo-setup/)
- [SFI KanBan](https://github.com/orgs/SFI-Foundation/projects/1)
- [Frontend](https://github.com/SFI-Foundation/Frontend) · [Backend](https://github.com/SFI-Foundation/Backend)
- [Sprint workflow, labels, diagrams, and manual setup checklist](docs/sprint-workflow.md)

## Quick start: clone → install → run

Prerequisites: Git, Ruby 3.4 with Bundler (matching Pages CI), Python 3 with
`venv` and pip, and `make`. Dependency downloads and machine setup can exceed
ten minutes; a fresh-clone walkthrough has not yet been accepted by a teammate.

```bash
mkdir sfi-foundation
cd sfi-foundation
git clone https://github.com/SFI-Foundation/Frontend.git Frontend
git clone https://github.com/SFI-Foundation/Backend.git Backend
cd Frontend
bundle install
```

Start the frontend in this terminal (no notebook conversion needed for the SFI pages):

```bash
make jekyll-serve
```

Open <http://localhost:4500/>. `make` also starts the preview at `/`, but runs
registered-project builds and notebook/document conversions first, requiring
`python3 -m venv venv` and `venv/bin/pip install -r requirements.txt`.
`make stop` stops that Makefile-managed preview.

The preview uses full regeneration because Jekyll incremental builds do not track
changes to `_data/` photography and navigation records. After changing those
records on an older preview, restart it with `make stop` and `make jekyll-serve`.
Verify that preview's output, not a separate build:
`SFI_BUILT_SITE=_site_preview/4500 npm run test:public-build`.

In a second terminal, from the shared parent directory:

```bash
cd Backend
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Replace placeholder secrets and passwords before initialization.
python scripts/db_init.py
python main.py
```

The database initializer can drop existing tables: use it only for a disposable
local database and read its confirmation prompt. The default local SQLite data
is under `Backend/instance/volumes/`. `main.py` serves
<http://localhost:8605/> by default (`FLASK_PORT` is implemented).
`GEMINI_API_KEY` is needed for chatbot generation; it is not required for static
frontend preview. Do not commit secrets. Use the backend's current README for
feature-specific dependencies and its placeholder-only `.env.example`.

Check API-connected setup without changing data:

```bash
curl -i http://localhost:8605/api/sfi/specs
curl -i http://localhost:8605/api/sfi/classifier/status
curl -i -H 'Origin: http://localhost:4500' http://localhost:8605/api/sfi/specs
```

Expect successful JSON responses and a matching local CORS origin. These are
verification instructions, not a claim that the backend checks passed.

## Folder layout and spec-data configuration

Configuration contract implemented in the companion branch for
[Backend #8](https://github.com/SFI-Foundation/Backend/issues/8):

```text
sfi-foundation/
├── Frontend/                  # this Jekyll repository
│   └── _data/sfi_specs.json    # extracted specification source
├── Backend/                   # Flask repository
│   ├── main.py
│   ├── scripts/db_init.py
│   ├── model/sfi_spec.py
│   ├── model/sfi_classifier.py
│   └── instance/volumes/      # local SQLite storage
```

With the Backend #8 companion branch, both importer and classifier JSON fallback
use `SFI_SPECS_PATH`, defaulting to sibling `Frontend/_data/sfi_specs.json`.
Relative overrides start at Backend's root regardless of cwd. For differently
named clones, set it in Backend's `.env`; no symlink is required. Missing/invalid
sources produce a clear error before import replaces data. The frontend's
`scripts/sfi_db_init.py` is not the Flask initializer.

API addresses are shared through `assets/js/sfi/api-base.js` by SFI specs, quiz,
detector, chatbot and auth configuration. Set `sfi_api_base` in `_config.yml`
(or a local Jekyll override config) to a confirmed backend base URL, without
`/api`. Rebuild after changing it. Blank preserves `http://localhost:8605`
locally and `https://sfi-api.opencodingsociety.com` elsewhere. The production backend is
served by nginx at `sfi-api.opencodingsociety.com` → Flask on port 8605.

Flask owns credentialed CORS for exact local origins,
`https://sfi.opencodingsociety.com` and `https://sfi-foundation.github.io` (origins have no path); nginx forwards OPTIONS
without duplicate headers. Deploy the companion backend before relying on this
policy. Existing production auth cookies target `.opencodingsociety.com`; a
new backend domain requires cookie and browser verification by the deployer.

## Build and deployment paths

```bash
bundle exec jekyll build --disable-disk-cache
python3 scripts/test-sfi-paths.py _site
# Optional root-path preview build, separate output:
bundle exec jekyll build --baseurl "" --destination /tmp/sfi-local --disable-disk-cache
python3 scripts/test-sfi-paths.py /tmp/sfi-local
```

Production `_config.yml` and `CNAME` match the GitHub Pages custom domain
<https://sfi.opencodingsociety.com/> with an empty base URL. The former
`/Frontend` prefix produces broken navigation and assets on that domain.
Local `make` serves isolated `_site_preview/4500/` output at the root;
`make BASEURL=/Frontend` previews the project path. Preview startup runs Jekyll
clean only on its generated output/cache, then regenerates it. Production builds
write `_site/`, so they cannot overwrite the running local preview. Do not use
`make clean` to fix styling: that target also removes converted content.
`.github/workflows/jekyll-gh-pages.yml` builds and deploys on pushes to main
or manual dispatch. A feature PR does not deploy automatically. Review and
acceptance precede merging; production delivery remains pending until deployed.

Historical Greppers capstone URLs, filenames, authorship, and upstream merge
audit records are preserved intentionally. Current repo links use SFI-Foundation.

## Handoff Checklist

Before continuing development:

- Confirm the Flask backend is running and CORS allows the frontend origin.
- Confirm `_data/sfi_specs.json` is current.
- Test `/sfi-specs/` search, classifier, PDF links, and CRUD accordion.
- Test `/quiz/` while signed out and signed in.
- Test the chatbot with and without `GEMINI_API_KEY` configured on the backend.
- Treat `/admin/` as unfinished until the backend admin/group/gear-review endpoints are added.

## Public visual theme

The public SFI layout uses the official logo, a white header with a prominent blue Spec Search action, photographic banners, a six-card homepage navigation grid with distinct photographs and numbered markers, and a charcoal footer. Each of the thirteen public photo placements has its own licensed source; regression checks reject repeats across pages. About and Services preserve the longer program information outside the homepage. Contact provides verified email, phone, address, and inquiry guidance. Edit the shared tokens and scoped partials under `_sass/sfi/`; Jekyll compiles `assets/css/sfi.scss` into `/assets/css/sfi.css`. Classroom and vendor styles remain separate.

See [the photographic redesign report](docs/sfi-photographic-redesign.md) for the file inventory, photography sources, screenshots, verification results, and preview instructions. After building, run `npm run test:styles -- /path/to/build` and `npm run test:redesign -- /path/to/build`. The browser review script is `scripts/test-sfi-redesign-browser.cjs`; it uses configurable Playwright/axe tooling and the existing local specification API.


SFI Sass architecture and approved-baseline verification:
[implementation report](docs/sfi-sass-architecture.md).
Run `bundle exec ruby scripts/test-sfi-sass.rb <built-site> [baseline.css]` to
verify the actual entry, all imported partials, scoped output and loaded stylesheet.
