# Cleanup manifest

All decisions were checked against tracked references (`rg`), Sass entry imports, Jekyll layouts/configuration, the production artifact, focused tests and file history. No private or customer data was removed.

| Original path | Purpose | Decision and evidence | Replacement | Verification | Risk |
|---|---|---|---|---|---|
| `_includes/sfi/styles.html` | 910-line historic inline theme | Remove. No Liquid include references in any layout/page; public layout links only `assets/css/sfi.css`. Last changed in old `f47ed6bb9`; fixed blue/global styles conflict with current scoped preferences. Audit script mentions are classification text, not imports. | `_sass/sfi/`, imported by `assets/css/sfi.scss` | Production artifact comparison, scoped Sass, public-page tests | Low: never loaded |
| `_includes/sfi/chatbot.html` | Disconnected assistant experiment | Move to excluded `_internal/`. No include callers; historical browser test is disconnected from the current public layout. Backend assistant APIs retained. | `_internal/chatbot.html` | Build and public-output checks; no assistant exposed | Low: preserve full source |
| `_sass/sfi/components/_chatbot.scss` | Styles for that disconnected include | Move with its source. No imports in any Sass entry; public/legacy Sass have distinct assistants. Previously unused partial confused the Sass inventory test. | `_internal/chatbot.scss` | Sass import inventory and build | Low: preserve full source |
| `_sass/sfi/pages/_settings.scss` shared appearance block | Site-wide appearance/accessibility rules in page styles | Consolidate in `base/_appearance.scss`; Settings owns workspace presentation. | `_sass/sfi/base/_appearance.scss` | Unit, light/dark/accent/contrast matrix | Low; runtime preferences unchanged |
| `_sass/sfi/pages/_settings.scss` repeated workspace selectors | Initial and later redesign declarations | Consolidate into one component definition, retaining mobile overrides. | Same file | Scoped Sass and screenshots | Low |
| `_sass/sfi/components/_navigation.scss` dropdown rules | Removed dropdown presentation | Replace with two semantic navigation rows and one mobile disclosure. | Same file; `navigation.js`/`account-menu.js` | Verified role/session, keyboard, mobile browser checks | Medium; intentional navigation change |
| `_sass/sfi/components/_feature-grid.scss` image-overlay and arrow rules | Previous homepage card presentation | Replace with photo/content cards; remove unused arrow markup/rules together. | Same file/include | Six linked cards, destination and image hash checks | Low |

# Deliberately retained

- `_internal/manufacturer-demo.*`, `_internal/specification-research.md`: explicit unfinished research/demo work. Excluded by default; manufacturer demo requires development mode AND opt-in. No fictional records enter production.
- `navigation/classroom/sfi-prototype.md`, `assets/css/sfi-prototype.scss`, `_sass/sfi/legacy/`: documented review/classroom route with explicit preservation tests and independent stylesheet. It remains outside public SFI navigation. Historical purpose prevents treating it as dead code.
- `_themes`, `_projects`, `_docx`, notebooks, inherited classroom pages and project registry: CI runs project distribution, notebook and DOCX conversion. Broad deletion would damage the OCS teaching/capstone dependency graph. Duplicate hashes alone do not establish non-use.
- Existing evidence/docs and photographic source/license manifests: review, client and licensing history. New large QA logs remain outside production; only selected comparison images are committed.
- Existing dependencies: i18next, Sass and jsdom are used. No new frontend dependencies.
- No images removed: public assets have responsive variants, provenance hashes and credit obligations; inherited assets have dynamic/classroom consumers.

`tracked-inventory.tsv`, `source-routes.tsv` and `duplicate-groups.json` are the pre-cleanup tracked-file audit. Duplicate groups are candidates, not authorization for deletion.
