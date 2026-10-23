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

## Styling follow-up: confirmed cause and team correction

The owner confirmed the 2026–27 team: Scrum Masters Ruhaan Bansal and Ishan Jha;
developers Arya Taghavi Zargar, Ishan Khandelwal, Deyar Raissadat, and Vayun
Shekhar. README and current capstone documentation now reflect those roles.
This supersedes the earlier unconfirmed team assignment noted in the initial PR.

The live main deployment generated root-relative stylesheet URLs with an empty
baseurl even though Pages serves the repository at `/Frontend/`. HTTP checks
confirmed `/assets/css/sfi.css` = 404 and `/Frontend/assets/css/sfi.css` = 200.
The feature branch retains its existing production baseurl correction; no Sass
redesign or reversal of Jupiterian's commits was needed.

The local preview had a separate output-collision problem. Its actual address
was `http://localhost:4500/`, but its shared `_site/index.html` contained
`/Frontend/assets/css/sfi.css`. Production builds also wrote `_site`, overwriting
HTML served by the root-path preview, and incremental startup could retain that
production-prefixed output when no source changed. Local HTTP checks returned root CSS 200
and prefixed CSS 404. Browser inspection found navigation/header backgrounds
`rgba(0, 0, 0, 0)`, Times New Roman, and a logo with natural width 0; the prefixed
CSS, logo, and API-config script each returned 404.

The Make preview now uses `_site_preview/4500` (port-specific), cleans that
generated output/cache before startup, and explicitly serves baseurl `""`.
Production output remains `_site` with `/Frontend`. The ignored preview directory
cannot overwrite or be overwritten by the normal production build. Startup also
truncates the old preview log before waiting for the new server address, avoiding
a stale readiness message. The README quick start uses `make jekyll-serve`.

The old preview and its notebook/log watcher process trees were verified by PID,
command line, and repository cwd before receiving SIGTERM. The backend and other
processes were left alone. `make clean` was deliberately not used because it also
deletes converted source content. Jekyll's cleaner only removed generated
production output/cache; Make cleaned its separate generated preview output.

### Styling follow-up commands and results

```bash
bundle exec jekyll clean --destination _site
make jekyll-serve
bundle exec jekyll build --disable-disk-cache
python3 scripts/test-sfi-paths.py _site_preview/4500
python3 scripts/test-sfi-paths.py _site /Frontend
```

All exited 0. Make's clean preview generation completed in **518.295s**; its
readiness check printed `Server address: http://localhost:4500/`. The concurrent
production build completed in **441.159s**. Existing unrelated build warnings
remain. Both static checks passed **15 pages / 313 internal link and asset targets**.

The tool runner cleaned up Make's background server after the parent command
exited, so the first HTTP browser attempt failed with connection refused. The
same freshly generated Make output was then kept available in a foreground tool
session, without another build:

```bash
bundle exec jekyll serve --skip-initial-build --host localhost --port 4500 --baseurl "" --destination _site_preview/4500 --incremental
```

A temporary production-artifact server used a `Frontend` symlink to `_site`
under `/tmp/sfi-style/http`:

```bash
python3 -m http.server 4501 --bind 127.0.0.1 --directory /tmp/sfi-style/http
LD_LIBRARY_PATH=/tmp/sfi-final/libs/extracted/usr/lib/x86_64-linux-gnu PLAYWRIGHT_MODULE=/tmp/sfi-final/browser/node_modules/playwright SFI_SMOKE_ORIGIN=http://localhost:4500 node scripts/test-sfi-setup-browser.mjs _site_preview/4500 "" /tmp/sfi-style/local-after.png
LD_LIBRARY_PATH=/tmp/sfi-final/libs/extracted/usr/lib/x86_64-linux-gnu PLAYWRIGHT_MODULE=/tmp/sfi-final/browser/node_modules/playwright SFI_SMOKE_ORIGIN=http://127.0.0.1:4501 node scripts/test-sfi-setup-browser.mjs _site /Frontend /tmp/sfi-style/production-after.png
```

Both final browser commands exited 0 and passed **13 pages**: homepage, About,
History, Specs, Services, Contact, My Gear, Detect, Spec Search, Login, Admin,
Profile, and current capstone. The About navigation click worked at each base
path. CSS and logo HTTP status were **200**; there were **zero missing local
requests and zero page errors**. Computed navigation was `rgb(26, 95, 168)`,
header `rgb(255, 255, 255)`, and font stack `Inter, Arial, sans-serif`.
The local homepage logo's natural width was **404**. Browser screenshots were
retained under `/tmp/sfi-style/`; the production screenshot was visually checked.
External services were blocked during these browser tests; API behavior and
external font delivery are outside this styling check.

After the production build completed, curls to local `/`, `/assets/css/sfi.css`,
and `/images/sfi/SFI-Logo.png` all returned **200**, and local HTML still linked
`/assets/css/sfi.css`. The production artifact's
`/Frontend/assets/css/sfi.css` returned **200**. Preview and production generated
outputs coexist without changing each other's asset prefixes.

The pre-fix CSS and both regenerated CSS files have identical SHA-256:
`542a85c608babed2026befaddc48324ae2191ede32036885b33ab10927093254`.
No theme/Sass source or Jupiterian commit was reverted. `git diff --check` passed.
The unrelated Makefile timeout edit remains local and is excluded from the
follow-up commit. PR #16 remains unmerged; this tests a local production artifact,
not a deployed feature. Presentation, stakeholder acceptance, fresh-clone
walkthrough, production delivery, and live API/CORS integration remain pending.

## Startup timeout inclusion follow-up

The owner explicitly authorized including the previously local Makefile
`300→600` startup timeout edit in PR #16. This supersedes earlier notes saying
that the timeout was excluded. The latest remote feature branch was fetched and
fast-forwarded to `7a1337c4d649a6e90812941ca98402e684492b6c`, preserving its
README GitHub-link changes and the exact uncommitted timeout edit.

The prior preview/watchers were identified by repository cwd and command and
stopped before running the **default `make` workflow**, without `make clean` or
source deletion. Registered project builds, conversion/splitting, and docs
preparation completed; Jekyll cleaned `_site_preview/4500` and regenerated it.

```bash
make > /tmp/sfi-timeout/make.log 2>&1
python3 scripts/test-sfi-paths.py _site_preview/4500
LD_LIBRARY_PATH=/tmp/sfi-final/libs/extracted/usr/lib/x86_64-linux-gnu PLAYWRIGHT_MODULE=/tmp/sfi-final/browser/node_modules/playwright SFI_SMOKE_ORIGIN=http://localhost:4500 node scripts/test-sfi-setup-browser.mjs _site_preview/4500 "" /tmp/sfi-timeout/preview.png
curl -sS -o /dev/null -w 'homepage %{http_code}\n' http://localhost:4500/
curl -sS -o /dev/null -w 'CSS %{http_code}\n' http://localhost:4500/assets/css/sfi.css
curl -sS -o /dev/null -w 'logo %{http_code}\n' http://localhost:4500/images/sfi/SFI-Logo.png
git diff --check
```

All commands exited 0. Jekyll reported **235.723s** generation; Make printed
**Server started in 240 seconds** and `http://localhost:4500/`. The static check
passed **15 pages / 313 link and asset targets**. The HTTP browser check passed
**13 pages**, About navigation, CSS/logo 200, correct blue navigation and white
header, with zero missing local requests and zero page errors. All curls
returned **200**. External services were blocked in the browser check, so this
does not claim API acceptance. The tool's parent shell was kept alive after
Make completed, preserving its background server and watchers for validation.

Make warned that a generated notebook had a modification time 21 seconds in the
future, followed by its clock-skew warning; existing Jekyll warnings also remain.
The successful runtime and generated-page checks are reported alongside those
warnings. Default Make introduced no additional tracked source changes.

At inspection, GitHub reported the PR mergeable with clean merge status, no
review threads or pending review requests, no required checks/reviews, and no
branch protection/rules for main. This does not constitute reviewer or
stakeholder acceptance. Requested PR linkage is now `Refs #7`; do not auto-close
the issue, merge the PR, or mark Done. The broader fresh-clone walkthrough,
Backend #8/production integration, deployment, presentation, and stakeholder
acceptance gates remain pending.
