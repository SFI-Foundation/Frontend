# SFI Foundation Prototype Frontend

This repository contains the frontend for the Greppers SFI Foundation capstone prototype. The goal is to show how the original `sfifoundation.com` experience could be modernized while preserving the value of SFI's standards, specification PDFs, and safety information.

The original site contains important motorsports safety resources, but the information is difficult to search, navigate, personalize, and update. This prototype explores a more usable SFI-run system with searchable standards, role-aware pages, gear tracking, AI assistance, image-based equipment detection, and staff/admin workflows.

This is a prototype, not a production replacement for SFI Foundation's official website.

## Project Structure

Important frontend files and directories:

| Path | Purpose |
| --- | --- |
| `_layouts/sfi.html` | SFI-specific page shell used by the redesigned pages. Includes shared nav, footer, styles, and chatbot. |
| `_includes/sfi/nav.html` | SFI navigation bar and sign-in state display. |
| `_includes/sfi/chatbot.html` | Floating chatbot widget connected to the Flask backend. |
| `_includes/sfi/styles.html` | Shared SFI visual system and layout styles. |
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
| `/sfifoundation/` | Prototype landing and review page for presenting the project. |
| `/about/`, `/history/`, `/services/`, `/contact/` | Redesigned informational SFI content pages. |
| `/specs/` | Specification category browsing page. |
| `/sfi-specs/` | Searchable specs database, ML text classifier, interactive safety showcase, and spec CRUD accordion. |
| `/detect/` | Client-side image/camera equipment detector using TensorFlow.js models. |
| `/quiz/` | "My Gear" tracking page with certification dates and local/backend storage behavior. |
| `/login/`, `/signup/` | SFI-styled authentication pages connected to the Flask backend. |
| `/admin/` | Intended admin portal for users, groups, and gear review. This is not fully wired yet. |

## Implemented Features

- Modern SFI-themed UI, shared layout, navigation, and content pages.
- Plain-English/fuzzy spec search with typo tolerance on `/sfi-specs/`.
- SFI spec categories, metadata, and links to official PDF documents.
- Client-side image/camera equipment detector using COCO-SSD and MobileNet in the browser.
- Spec CRUD accordion on `/sfi-specs/` for adding, editing, and deleting spec records through the Flask API.

## Known Gaps

- `/admin/` calls endpoints such as `/api/sfi/me`, `/api/sfi/users`, `/api/sfi/groups`, `/api/sfi/gear/pending`, and `/api/sfi/gear/all`, but those endpoints are not currently implemented in the Flask repo.
- The `/sfi-specs/` admin accordion can create, edit, and delete specs, but it is not protected by a real admin permission check.
- Gear review states exist in frontend expectations, but the backend gear model currently stores only basic per-user gear data.
- UI polish is still needed, especially consistency, responsive behavior, spacing, and admin dashboard layout.
- The chatbot only receives a compact spec database summary. It does not yet read full website content or PDF contents.
- PDF summarization is planned but not implemented. Must be secure and not take summarize too much and lose details.
- The detector is browser-side image classification. It can suggest likely equipment categories, but it does not verify official SFI labels, certification status, or compliance.

## Future Work

- Build a PDF ingestion pipeline for the official SFI PDFs.
- Add PDF summaries beside search results.
- Give the chatbot access to indexed site pages and extracted PDF text.
- Finish admin dashboard backend endpoints and permission checks.
- Improve responsive UI polish across mobile and desktop.
- Add smoke tests for the main routes and API-connected workflows.
- "My Gear" tracking page with certification dates, expiration scoring, local fallback, and backend sync when authenticated.
- Site-wide chatbot widget connected to `POST /api/sfi/chat`.

## Backend Dependency

Most dynamic SFI features depend on the companion Flask backend:

- Local backend: `http://localhost:8423`
- Deployed backend used by the current frontend code: `https://greppers-be.opencodingsociety.com`
- Backend repo: `../flask` locally, remote `https://github.com/TheGreppers/flask`

The frontend uses this local-vs-production switch in several SFI files:

```js
const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:8423"
  : "https://greppers-be.opencodingsociety.com";
```

Run the Flask backend before testing API-connected pages like `/sfi-specs/`, `/quiz/`, `/login/`, and the chatbot.

## Local Development

Install Ruby dependencies once:

```bash
bundle install
```

Start the Jekyll/GitHub Pages preview server:

```bash
make
```

The local URL is printed by the Makefile, usually similar to:

```text
http://0.0.0.0:4500/greppers/
```

Useful commands:

```bash
make stop
make clean
make convert
```

If SFI notebook or Markdown content is changed, save the file and wait for Jekyll regeneration before refreshing the browser.

## Handoff Checklist

Before continuing development:

- Confirm the Flask backend is running and CORS allows the frontend origin.
- Confirm `_data/sfi_specs.json` is current.
- Test `/sfi-specs/` search, classifier, PDF links, and CRUD accordion.
- Test `/quiz/` while signed out and signed in.
- Test the chatbot with and without `GEMINI_API_KEY` configured on the backend.
- Treat `/admin/` as unfinished until the backend admin/group/gear-review endpoints are added.
