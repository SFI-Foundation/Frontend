---
layout: sfi
title: SFI Foundation — 2026–27 repository setup
description: Repository ownership, local setup, spec import, and delivery evidence for Frontend issue 7.
permalink: /capstone/sfi-repo-setup/
---

## Team and ownership

Ruhaan (@ruhaanb622), Ishan J (@Jupiterian), Arya (@aRYA622-y),
Deyar (@DrDeyar), Ishan K (@Grazer01LA), and Vayun Shekhar (@Droidsector23)
contribute development. Two Scrum Master assignments await team confirmation.
Ruhaan is accountable for this setup issue (Medium priority).

[Frontend repository](https://github.com/SFI-Foundation/Frontend) ·
[Backend repository](https://github.com/SFI-Foundation/Backend) ·
[KanBan board](https://github.com/orgs/SFI-Foundation/projects/1) ·
[Issue #7](https://github.com/SFI-Foundation/Frontend/issues/7)

## Teammate setup and system flow

Follow the [README quick start](https://github.com/SFI-Foundation/Frontend#quick-start-clone--install--run).
The diagram describes Backend main `31ad1151c2140aa77d2a45d7c6561920ef360317`;
[Backend #8](https://github.com/SFI-Foundation/Backend/issues/8) is still open.

```mermaid
flowchart TD
    DEV["Teammate: clone sibling Frontend and Backend repositories"] --> FE["Frontend: bundle install; Jekyll preview localhost:4500 at /"]
    DEV --> BE["Backend: venv; pip install; db_init.py; main.py on localhost:8423"]
    JSON["Frontend/_data/sfi_specs.json"] --> ALIAS["Temporary sibling greppers symlink to Frontend"]
    ALIAS --> IMPORT["Backend spec importer and classifier: hardcoded legacy path"]
    IMPORT --> DB[("Backend/instance/volumes SQLite")]
    BE --> DB
    FE -->|"Local API requests; Flask adds local CORS headers"| BE
    FE --> BUILD["Jekyll production build: baseurl /Frontend"]
    BUILD --> PR["Feature branch PR; review and acceptance pending"]
    PR -->|"After approved merge; main workflow"| PAGES["GitHub Pages /Frontend/"]
    PAGES --> LEGACY["Legacy API host still configured; replacement and production CORS pending Backend 8"]
```

The backend reads the frontend JSON, then stores specs in SQLite. It does not
serve the JSON directly from Jekyll. No spec-path environment variable is
implemented in the inspected backend. The temporary alias is needed until #8
lands; do not create it over an existing directory. Database initialization is
for a disposable local database because it can drop existing tables.

## Delivery and review

Quick Issue stages on the current board map to **Progress** (In Progress),
**Integration (PR)** (In Review), then deployment/system-test evidence. Retain
commands, logs, Key Commits, and the PR in issue #7. The site workflow deploys
main, so production deployment of this feature requires later review and merge.

Presentation, stakeholder acceptance, a teammate's fresh-clone walkthrough,
production API/CORS integration, and production delivery are pending. This page
does not claim those requirements are complete. The original
[Greppers prototype review]({{ '/capstone/greppers/' | relative_url }}) is kept
as historical capstone documentation.
