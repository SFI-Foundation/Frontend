# Phase 1 UI cleanup acceptance — 2026-11-11

The public specification page contains search, three catalog statistics, category filters, responsive cards and pagination. It emits no interactive safety showcase, car zones/details/buttons, classifier form, classifier loading/error state or ML Accuracy card. No classifier/model resources are requested by public searches. Manufacturer navigation and homepage entry points are absent from the complete production artifact.

## Git and reuse

Both `Frontend/` and `Backend/` are on `feature/sfi-phase1-ui-cleanup`. Their initially clean Phase 1 worktrees were inspected before edits. The requested branch did not already exist. The new branches preserve accepted Phase 1 commits and reuse the existing cleanup commits rather than reproducing them:

- Frontend accepted base `77915a71106e82a215ac3da54fab129290d221bc`; reused cleanup `e8f7ade7e`.
- Backend accepted base `b134c76fa75cdac857975d306cd7fc75780c85b3`; reused cleanup `6d37486`.
- Frontend `main` remains `a22a2f296abc07790060efb7933a91066b2274af`.
- Backend `main` remains `23981acd4dff77dc587a3d2eba9ca01367ae0643`.

The existing `feature/sfi-phase1-spec-search` and `feature/sfi-phase1-public-cleanup` branches remain intact. No reset, rebase, merge, push or deployment was performed. The older cleanup worktrees remain available. Original sibling servers at 8423 and 4500 belong to `SFI-Backend/` and `SFI-Frontend/`; they were identified and left alone. No Phase 1 server was already running on the requested ports.

## Retained research and access boundary

`_internal/specification-research.md` preserves the car diagram and classifier UI. Backend classifier models, training and API source remain. `_internal/manufacturer-demo.md` and `.js` preserve only explicitly fictional browser-memory records. They never read real manufacturers, contact a manufacturer API, persist changes, schedule work or send messages. All reminder-preview intervals now default off, including overdue message previews when no intervals are enabled.

The normal static build excludes `_internal/`, the demo route and dataset. Only `JEKYLL_ENV=development` together with `_config.development.yml` emits the prototype. An actual build with `JEKYLL_ENV=production` and that overlay failed with `Manufacturer demo requires JEKYLL_ENV=development`. A request, browser toggle or query parameter cannot change build configuration. The public manufacturer route/dataset return 404. The 404 page offers working home/search links. Backend manufacturer routes do not exist; default and production-like Flask configurations return 404 for GET/POST, including requests with demo/development query flags. Classifier research is disabled by default and prohibited in production; unrelated detector/profile/gear source was not changed in this follow-up.

Implementation follow-up commits: Frontend `ee9164082`; Backend `0c2ab67`. The final documentation commit in each repository is the branch HEAD reported by `git log -1`.

## Executed checks

| Check | Result |
|---|---|
| `PYTHON_DOTENV_DISABLED=1 SFI_QA_MYSQL_URI=mysql+pymysql://root@127.0.0.1:13367/sfi_phase1_qa_ui_cleanup ../../SFI-Backend/venv/bin/python -m unittest discover -s tests -v` | 58 passed, no skips; separate disposable schema |
| Backend `unittest discover -s testing -p test_sfi_config.py -v` | 7 passed |
| Backend `unittest discover -s testing -p test_sfi_pdf_ingest.py -v` | 7 passed; missing fixture model registration repaired |
| Backend `testing/test_sfi_profile.py` | 13 passed in isolated temporary application/database |
| Frontend profile, gear, search, manufacturer and public-cleanup Node suites with `SFI_BUILT_SITE` | 38 passed, no skips |
| Rendered client/Flask authentication integration | 7 passed |
| Rendered gear/Flask moderation integration | 1 passed |
| Sass compilation and API/baseurl script checks | Passed |
| `ruby scripts/test-sfi-demo-gates.rb` | Passed default-off, strict boolean and production rejection checks |
| Production Jekyll build via `make public-review-build` | Passed; inherited duplicate-route/post-link/Sass deprecation warnings |
| Actual production build with development overlay | Rejected as expected |
| Chromium localhost acceptance (`scripts/test-sfi-public-browser.cjs`) | 13 check groups passed, 20 screenshot captures; no page exceptions, unexpected console errors or failed requests |
| Git whitespace, explicit staging and private-file checks | Passed before commits |

The initial backend run had three optional MySQL skips; the final MySQL run had none. The initial frontend run had two build-dependent skips; final artifact tests had none. The PDF-ingestion test initially failed when run alone because it had not registered the User model; that test fixture was corrected and all seven cases then passed. Initial sandbox socket/theme/browser restrictions were resolved through execution approvals. Two helper-script invocations initially omitted the required build-directory argument; corrected invocations passed. These initial failures are not reported as passes.

## Localhost evidence

Chromium ran at 1440×1000 and 390×844 against real Flask/Jekyll servers without mocked application requests. It verified `16.1` by Enter key, `20.1/1`, `20.1/2`, product keywords, every category, All, six-page next/previous navigation and all 111 unique identities. It opened the existing verified `16.1` official PDF in a new tab and fetched HTTP 200 bytes beginning `%PDF-`. Rejected/needs-review cards have warnings and no PDF action. Public navigation links resolve. The default manufacturer page, dataset, research and local QA files are unavailable. Development opt-in shows five labeled fictional records and working filters, with reminder previews off and no notification requests. CORS, anonymous/member/admin permissions, ordinary password login and logout pass.

The disposable `/tmp/sfi-ui-cleanup-20261111.db` was made with SQLite backup from the prior accepted local review fixture, preserving existing PDF evidence. It was not re-imported or reverified. Before/after SHA-256 snapshots of every row in `sfi_specs`, `sfi_spec_chunks` and `sfi_catalog_entries` match in both source and disposable copy. There are 108 imported entries and 111 public canonical results: 63 verified current, 16 rejected, 29 needing review and 3 legacy not checked. Only a disposable synthetic user's credential is changed to exercise password authentication.

Evidence directory (Git-ignored and excluded from Jekyll):
`/home/ruhaanb622/sfi-foundation/phase1/Frontend/qa-evidence/ui-cleanup-20261111/`.

The actual PNGs were opened and visually reviewed for whitespace, alignment, button/card wrapping, clipped text, horizontal overflow and exposed experimental UI. Screenshot scrolling was changed to instant to avoid mid-scroll captures beneath the sticky navigation; final captures were reviewed. Evidence includes:

- `desktop-specification-page.png`, `mobile-specification-page.png`, `mobile-search-controls.png`.
- Desktop/mobile `search-16.1.png`, `search-20.1-1.png`, `search-20.1-2.png`.
- Desktop/mobile `all-categories.png`, `pdf-unavailable.png`, `public-navigation.png`, `manufacturer-demo-blocked.png`.
- `verified-pdf-action.png`, `development-only-manufacturer-demo.png`.
- `browser-results.json`, `catalog-before.json`, `catalog-after.json`.

The existing harness also prints the prior discrepancy report to an ignored local PDF. No screenshots, PDFs, databases, environments or credentials are staged. Runtime/test logs are `/tmp/sfi-ui-cleanup-*.log`.

## Exact review URLs and startup

The following servers are left running for review:

- Public search: http://localhost:4000/sfi-specs/
- Default-disabled demo: http://localhost:4000/sfi-manufacturer-demo/ (404)
- Explicit development-only prototype: http://localhost:4100/sfi-manufacturer-demo/
- Backend health: http://localhost:8605/api/sfi/health
- Optional disposable QA role selector: http://localhost:8605/local-demo/

From `phase1/Backend/`:

```bash
PYTHON_DOTENV_DISABLED=1 ../../SFI-Backend/venv/bin/python scripts/phase1_local.py \
  --database sqlite:////tmp/sfi-ui-cleanup-20261111.db --port 8605 --demo-accounts
```

From `phase1/Frontend/`:

```bash
JEKYLL_ENV=production BUNDLE_PATH=/tmp/sfi-phase1-gems bundle exec jekyll serve \
  --host 127.0.0.1 --port 4000 --baseurl "" \
  --destination /tmp/sfi-phase1-repair-preview --disable-disk-cache
```

Development-only preview, from the same Frontend directory:

```bash
JEKYLL_ENV=development BUNDLE_PATH=/tmp/sfi-phase1-gems bundle exec jekyll serve \
  --config _config.yml,_config.development.yml --host 127.0.0.1 --port 4100 --baseurl "" \
  --destination /tmp/sfi-ui-cleanup-demo-preview --disable-disk-cache
```

Browser acceptance, with those servers running:

```bash
LD_LIBRARY_PATH=/tmp/sfi-phase1-browser-libs/root/usr/lib/x86_64-linux-gnu \
PLAYWRIGHT_MODULE=/tmp/sfi-phase1-browser/node_modules/playwright \
CHROME_PATH=/home/ruhaanb622/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome \
SFI_QA_PYTHON=/home/ruhaanb622/sfi-foundation/SFI-Backend/venv/bin/python \
SFI_QA_DATABASE=/tmp/sfi-ui-cleanup-20261111.db \
SFI_QA_EVIDENCE=qa-evidence/ui-cleanup-20261111 \
SFI_QA_DEMO_URL=http://localhost:4100 node scripts/test-sfi-public-browser.cjs
```

For a different disposable database, preserve accepted review evidence via SQLite backup or follow Backend's documented prepare/migrate/import/verify flow. Never approve missing or mismatched PDFs merely to populate the UI.

## Remaining issues

No cleanup acceptance failure remains. Existing disputed PDFs/category assignments remain restricted and need SFI review. Inherited Jekyll duplicate-route/post-link and Sass/SQLAlchemy deprecation warnings remain outside this cleanup. Historical credential-owner actions documented in the prior security review remain release work; no new secrets were introduced. Localhost acceptance does not deploy or approve the site for release.

## Files changed in this follow-up

Frontend: `_internal/manufacturer-demo.js`, `_internal/manufacturer-demo.md`, `docs/sfi-phase1.md`, `docs/sfi-ui-cleanup-verification.md`, `scripts/test-sfi-manufacturer-demo.mjs`, `scripts/test-sfi-public-browser.cjs`, `scripts/test-sfi-public-cleanup.mjs`.

Backend: `testing/test_sfi_pdf_ingest.py`, `tests/test_public_security.py`, `docs/sfi-ui-cleanup-verification.md`.

## Complete branch file manifest, including reused cleanup

The following compares each resulting branch to the accepted Phase 1 commit, with renames detected. `D` means an earlier cleanup removed an unsafe tracked local artifact; no private artifact is added.

### Frontend

```text
D	.env
A	.env.example
M	.gitignore
M	Makefile
A	_config.development.yml
M	_config.yml
M	_includes/slim_sidebar.html
R089	assets/js/sfi/manufacturer-demo.js	_internal/manufacturer-demo.js
R089	navigation/sfi-manufacturer-demo.md	_internal/manufacturer-demo.md
A	_internal/specification-research.md
M	_layouts/base_chatadpt.html
M	_layouts/base_chatog.html
M	_layouts/certchatbot.html
M	_layouts/chatbot.html
M	_layouts/lessonbase.html
M	_layouts/lessonbasecapture.html
M	_layouts/sfi.html
A	_plugins/internal_demos.rb
A	_plugins/public_output_guard.rb
M	_posts/CSP/flask/2023-10-22-flask-debug-walk.md
M	_posts/CSP/flask/2023-10-22-flocker_api.md
M	_posts/Foundation/B-tools_and_equipment/2025-08-06-flask-api.md
M	_posts/Foundation/C-github_pages/2023-08-24-github_pages-anatomy.md
M	_posts/Foundation/C-github_pages/2023-08-25-github_pages-utterances.md
M	_posts/Foundation/C-github_pages/2023-08-26-github-pages-jekyll.md
M	_posts/Foundation/C-github_pages/2025-08-18-nbfilemanagement.md
M	_sass/sfi/base/_page.scss
M	docs/sfi-phase1.md
A	docs/sfi-public-cleanup.md
M	hacks/cs-portfolio-quest/analytics/submodule_1.md
M	hacks/cs-portfolio-quest/resume/submodule_5.md
M	navigation/sfi-specs.md
M	package.json
A	scripts/test-sfi-demo-gates.rb
M	scripts/test-sfi-manufacturer-demo.mjs
A	scripts/test-sfi-public-browser.cjs
A	scripts/test-sfi-public-cleanup.mjs
M	scripts/test-sfi-spec-search.mjs
A	docs/sfi-ui-cleanup-verification.md
```

### Backend

```text
M	.env.example
M	.gitignore
M	__init__.py
M	api/sfi_classifier.py
M	api/sfi_spec.py
M	api/user.py
A	docs/sfi-pdf-discrepancies-for-jennifer.html
A	docs/sfi-pdf-discrepancies-for-jennifer.md
A	docs/sfi-public-cleanup.md
A	docs/sfi-public-security.md
D	instance/volumes/sfi_specs.db
D	instance/volumes/sfi_specs.db.bak
D	instance/volumes/user_management.db
D	instance/volumes/user_management_bak.db
M	main.py
M	scripts/old/rds_init.py
M	scripts/old/update_data.py
M	scripts/phase1_local.py
A	security_config.py
M	testing/test_sfi_pdf_ingest.py
M	testing/test_sfi_profile.py
A	tests/test_public_security.py
A	docs/sfi-ui-cleanup-verification.md
```
