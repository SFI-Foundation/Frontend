# Frontend #7 — setup and path verification

Validation date: 2026-10-22. Accountable owner: @ruhaanb622. Priority: Medium.
Branch: `feature/7-sfi-repo-setup-docs`, based on origin/main
`53758c135213af1ae797d674c5e8d918e3192f30` (also organization main when inspected).
Backend code inspected at `31ad1151c2140aa77d2a45d7c6561920ef360317`.

## Exact build commands and results

Environment: Ruby 3.2.3, Jekyll 4.4.1, Python 3.12.3. Pages CI specifies Ruby 3.4;
this local validation does not claim a Ruby 3.4 CI run. `bundle check` passed
using already-installed dependencies; a fresh dependency install was not tested.

```bash
bundle exec jekyll build --disable-disk-cache > /tmp/sfi-7/build-final.log 2>&1
bundle exec jekyll build --baseurl "" --destination /tmp/sfi-local --disable-disk-cache > /tmp/sfi-7/build-local.log 2>&1
bundle exec jekyll build --destination /tmp/sfi-7/site --disable-disk-cache > /tmp/sfi-7/build-isolated.log 2>&1
```

All exited 0. Reported build times respectively: 460.512s, 489.961s, 697.599s.
These full builds ran concurrently. Each log contains 98 warning/deprecation
lines, including existing Sass import deprecations, post_url matching warnings,
and conflicting classroom outputs. Successful build does not imply those
unrelated warnings were fixed. An existing root-path Jekyll preview can overwrite
`_site`; final smoke tests used the isolated destinations and left that preview
running.

Earlier attempts: the sandbox could not resolve codeload.github.com, so the
remote-theme build was rerun with approved network access. That initial build
passed in 227.285s before final metadata changes. A subsequent attempt to use
`--no-incremental` failed with an invalid-option error; Jekyll's supported
`incremental: false` configuration is used instead. An early browser test of the
shared `_site` failed its prefix assertion while the existing preview regenerated
root-path files; final browser checks use isolated completed outputs.

## Generated-page and browser system smoke tests

```bash
python3 scripts/test-sfi-paths.py /tmp/sfi-7/site /Frontend
python3 scripts/test-sfi-paths.py /tmp/sfi-local
LD_LIBRARY_PATH=/tmp/sfi-final/libs/extracted/usr/lib/x86_64-linux-gnu PLAYWRIGHT_MODULE=/tmp/sfi-final/browser/node_modules/playwright node scripts/test-sfi-setup-browser.mjs /tmp/sfi-7/site /Frontend /tmp/sfi-7/about-project.png > /tmp/sfi-7/browser-final-project.log 2>&1
LD_LIBRARY_PATH=/tmp/sfi-final/libs/extracted/usr/lib/x86_64-linux-gnu PLAYWRIGHT_MODULE=/tmp/sfi-final/browser/node_modules/playwright node scripts/test-sfi-setup-browser.mjs /tmp/sfi-local "" /tmp/sfi-7/about-local.png > /tmp/sfi-7/browser-final-local.log 2>&1
git diff --check
```

All exited 0. Static checks: **15 pages, 313 internal navigation/asset targets**
passed for each base URL. Browser checks: **13 pages** passed for each base URL,
including the new capstone page; About navigation click worked, blue navigation
and the compiled SFI stylesheet loaded, with **zero missing local requests and
zero page errors**. Browser requests were served from generated artifacts through
Playwright interception. External services were blocked, so this browser check
does not establish backend integration or production network delivery. The local
Playwright/library paths above are this environment's dependencies; on another
machine set `PLAYWRIGHT_MODULE` to an installed Playwright package.

## Read-only checks of the already-running local backend

```bash
curl --silent --show-error --max-time 20 --dump-header /tmp/sfi-7/api-specs.headers --output /tmp/sfi-7/api-specs.json --write-out '%{http_code}\n' -H 'Origin: http://localhost:4500' http://localhost:8423/api/sfi/specs
curl --silent --show-error --max-time 20 --dump-header /tmp/sfi-7/api-classifier.headers --output /tmp/sfi-7/api-classifier.json --write-out '%{http_code}\n' http://localhost:8423/api/sfi/classifier/status
```

Both curl commands exited 0 and printed 200. Specs returned a JSON list of 140
records. Its response included `Access-Control-Allow-Origin: http://localhost:4500`
and `Access-Control-Allow-Credentials: true`. Classifier status returned
`trained: true`, 7 category classes, 103 spec classes, 2150 training samples,
and reported accuracy 0.5395. This checks the existing running backend only;
no database initializer, training operation, or mutation was performed.

## Remaining acceptance and delivery gates

- Confirm the two individual Scrum Master assignments; the six development
  contributors are documented without assigning unverified leadership roles.
- Have a teammate execute the fresh-clone/dependency-install walkthrough and
  confirm setup time and both apps' behavior. The compatibility symlink documents
  the current backend path; Backend #8's configurable path is still unimplemented.
- Confirm a replacement production backend URL and production nginx CORS under
  Backend #8. Existing legacy API hosts are deliberately retained and documented.
- Review the PR, then deploy through the main-only Pages workflow after an
  approved merge. No feature-branch production deployment was performed.
- System test the delivered Pages site with the approved production API.
- Present the result and obtain stakeholder acceptance; retain delivery evidence
  before moving the issue to Done. Do not merge automatically.

Issue #7 retains the updated Mermaid system diagram, Key Commits, PR link, and
lifecycle transitions. The original Greppers capstone/authorship, legacy route
and filenames, and upstream merge audit records are intentionally historical.
The unrelated local Makefile timeout change from 300 to 600 is excluded from the
feature commit and preserved in the working tree.
