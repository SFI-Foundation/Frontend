# Actual localhost account-navigation fix

## URL and identified processes

Open **http://localhost:4500/**, or http://localhost:4500/login/ to sign in.

The actual running frontend was Jekyll PID **2623**, serving `/home/ruhaanb622/sfi-foundation/SFI-Frontend` on branch **main**, commit `b6151edbb`. It used host `localhost`, port `4500`, empty base URL, destination `_site_preview/4500`, disabled disk cache and automatic regeneration. The original notebook/file watcher processes also ran from this original checkout.

The actual backend is the existing `python main.py` process, PID **2647**, on **http://localhost:8605**, from `/home/ruhaanb622/sfi-foundation/SFI-Backend` on main. It remains running, with its existing SQLite database, environment and credentials.

The original port-4500 HTML contained the static Sign In anchor and no account control. Its shared `auth.js` asset returned 404. Its API configuration already correctly selected localhost:8605, and backend responses allowed credentialed requests from localhost:4500.

The exact localhost problem was therefore **the running server's source checkout**. Earlier PR-build browser tests did not establish what this independently running port-4500 Jekyll process served. PR #41 was in a different worktree. Public deployment status does not explain this localhost mismatch.

## What changed locally

The frontend alone was restarted, keeping the same URL and port. The old Jekyll PID was identified through its listening socket, command line, current directory and shared Git repository before sending SIGTERM. It was replaced by Jekyll PID **38186**, serving:

```text
/home/ruhaanb622/sfi-foundation/worktrees/account-navigation/Frontend
branch: fix/sfi-authenticated-account-navigation
URL: http://localhost:4500/
API: http://localhost:8605
destination: _site_preview/4500, relative to this selected source
```

The host, port, empty base URL, preview-destination convention, disabled disk cache, log location and normal Jekyll source watching are preserved. No application source files were copied into main and no branch was switched, reset or merged. The old generated output was not deleted. Backend PID 2647 and the original watcher processes were not stopped.

## Persistent normal startup

The normal command, from the original checkout, now selects the PR worktree automatically:

```sh
cd /home/ruhaanb622/sfi-foundation/SFI-Frontend
make
```

No worktree switch or application-file copying is required on each restart. Jekyll watches the selected source and regenerates changed HTML, JavaScript, styles and data normally.

The one-time local configuration consists of:

- Local Git setting `sfi.previewWorktree`, pointing to the existing account-navigation worktree.
- An ignored `GNUmakefile` adapter in the original checkout. GNU Make loads it before `Makefile`; it delegates to the selected worktree's preview launcher. It contains no credentials and is not committed.
- The preview launcher and Make fragment in this PR. Startup does not run the old broad process-killing or content-cleaning targets. It checks port ownership and only stops a Jekyll process in this same Git repository. Other listeners are refused.

Useful normal commands:

```sh
make preview-status  # URL, selected source/branch, listening PID and command
make                # start, or report that the correct server is already running
make reload         # restart only this selected frontend preview
make stop           # stop only the selected frontend; leave the backend alone
```

Explicit build/conversion commands still delegate to the selected source's existing Makefile. To view and edit the previewed application source, use the directory printed by `make preview-status`; main's application files remain unchanged.

For another local checkout, configure the same workflow once using the already existing PR worktree:

```sh
python3 /path/to/account-navigation/Frontend/scripts/sfi-local-preview.py configure \
  --source /path/to/account-navigation/Frontend \
  --checkout /path/to/your/normal/SFI-Frontend
```

The setup preserves an unrelated existing GNUmakefile by refusing to overwrite it. `GNUmakefile` is excluded from Jekyll output so local source-selection configuration cannot enter a published artifact. Selection is local to this Git repository, not a committed machine-specific path.

## Verification on the actual server

This run did not start an isolated Flask fixture, database or replacement test origin. Chromium connected directly to **localhost:4500** and its requests reached the already running **localhost:8605** backend without request interception.

1. Before changing the server, the existing administrator credentials were read privately from local configuration, never printed, and used in the normal sign-in form. The existing account card showed Admin/@admin while the actual header showed Sign In. A screenshot captured the mismatch.
2. That browser context and HTTP-only cookie stayed open during the frontend-only restart.
3. After the same origin began serving the PR source, a normal reload showed **Admin** in both the account card and visible navbar, with Sign In hidden. No second administrator account or database was created.
4. Home, Spec Search, About, News, Contact and Profile retained Admin through navigation and refresh on the actual server.
5. At 375px, Admin remained visible while public links were collapsed. The actual profile and account dropdown showed Admin and the backend-authorized Admin Dashboard item.
6. Sign Out restored Sign In, and a subsequent refresh remained signed out. This affected only the verification browser's cookie.
7. Running normal `make` again from the original checkout selected the same worktree and reported the same live Jekyll process without another restart.
8. HTTP inspection confirmed the real port-4500 auth asset now returns 200. The API base remains localhost:8605, and the unchanged backend returns the correct credentialed CORS headers for localhost:4500.

**Verified:** existing Admin account, same origin, same browser cookie across the frontend restart, desktop/mobile, navigation, refresh and logout.

**Unverified:** the existing configured regular account could not be authenticated: its locally configured UID/password returned HTTP 401. No alternative passwords were tried and no account, password or database was changed to bypass this. A manual regular-account sign-in with valid credentials is still needed to verify that account on this actual server. Earlier disposable-account tests are not presented as that verification.

The verification browser is separate from the user's already-open browser profile. The user only needs to reload the existing localhost:4500 tab once to fetch the corrected HTML; their browser was not remotely controlled or logged out. Backend continuity and cookie survival were verified in the browser used for this run.

Local-only evidence, kept outside the frontend repository to avoid publishing actual-account screenshots or runtime data:

```text
/home/ruhaanb622/sfi-foundation/reports/localhost-navigation/
  before-admin-1440.png
  after-admin-1440.png
  after-admin-profile-menu-1440.png
  after-admin-profile-375.png
  after-admin-profile-menu-375.png
  actual-localhost-results.json  # initial run includes the regular-account 401
  verification-summary.json     # Admin verified; regular verification blocked
```

Database and backend-environment digests were compared locally and remain unchanged. Hash values, credentials, cookies, profile responses and actual-account screenshots are not committed. The original frontend checkout's tracked files remain clean, and existing backend feedback changes remain untouched. Nothing was merged or deployed.

## Files in this follow-up

- `scripts/sfi-local-preview.py`: configure and run the selected frontend on the normal port; inspect and scope process restarts.
- `scripts/sfi-local-preview.mk`: route normal make/start/status/stop commands to that launcher.
- `_config.yml`: exclude local GNUmakefile configuration from generated output.
- `docs/sfi-localhost-preview.md`: this actual-localhost diagnosis, persistence setup and verification record.
