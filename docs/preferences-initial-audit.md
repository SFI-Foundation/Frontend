# Initial audit — 18 November 2026

Baseline: Frontend `7de38d591` (merged PR #35, origin/main equals SFI main);
Backend `a850ce8` (origin/main). Work is isolated in `preferences-sync/` worktrees.
Original Frontend is clean. Original Backend has unrelated `.env.example`,
`.gitignore`, deleted log/metadata and untracked feedback work; none was copied,
reset or changed. No AGENTS.md was found at the workspace/repository roots.

## Working architecture (inspection, not acceptance evidence)

- Jekyll/Liquid, Sass and browser JS; vendored i18next loaded in the SFI shell.
- Flask/SQLAlchemy; PyMySQL for configured MySQL, SQLite otherwise. Existing
  secret validation fails closed for partial credentials and production SQLite.
- `.env` loads from the Backend root; environment variables take precedence.
- JWT-cookie/current-user authentication, display-name profile editing, separate
  onboarding and interest records, group-based admin authorization.
- Preferences validate an allowlist, load before CSS, use semantic theme tokens,
  and expose local import/export. Search consumes pagination/metadata preferences.

## Unmet / partial requirements

| Requirement | Finding before changes | Files needing work |
| --- | --- | --- |
| Site-wide Spanish | Only tagged settings/navigation/search fragments translate. Profile, onboarding, login, dynamic admin UI and public page copy bypass translations. HTML language remains English. | `localization.js`, `locales.js`, SFI pages/includes and JS renderers |
| Cross-device settings | No account settings table or endpoint; local storage shared by accounts. | Backend model/API/startup, frontend preferences and auth lifecycle |
| Database configuration | README supports SQLite locally and MySQL with credentials; MySQL port/name hardcoded. Destructive legacy initializer unsuitable for existing data. | Backend config, example, additive setup and README |
| Profile/account proof | Existing isolated tests available; must rerun against new main and real database. Manufacturer is an onboarding interest, not an implemented privileged account type. | Backend profile suite, frontend browser fixture |
| Theme coverage | Settings overrides several shared tokens; fixed values remain in page/components; contrast checks focus on Settings. | `_sass/sfi/`, active page inline styles, cross-page browser checks |
| Accessibility | Shared hooks exist; global responsive, keyboard and text-scaling coverage must be established. | Shared Sass and browser tests |
| Demo/compliance | Previous report explicitly states browser-only preferences and English account/editorial copy. | README and customer/teacher reports |

Official specifications, PDFs, manufacturer identities, user-provided content,
classroom projects and archived upstream reference pages must not be translated.
French/German/Chinese/Japanese already have partial-preview labels; retain them.
No production access or deployment verification has been established.
