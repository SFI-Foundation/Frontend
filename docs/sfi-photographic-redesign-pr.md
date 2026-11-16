# Local pull request draft

Target: `SFI-Foundation/Frontend:main`. Source: `feature/sfi-photographic-redesign`.
This is a local draft; no remote PR has been opened.

Title: Refresh SFI public photography and navigation; remove verified obsolete files

The homepage now presents a photographic hero and six linked navigation cards,
with updated About, Services and Contact content. Responsive WebP/JPEG assets,
shared Sass, consistent navigation states and full Jekyll regeneration preserve
the existing specification search, document-status safeguards and account/admin
behavior.

The existing site-wide search index now JSON-encodes string fields, repairing a baseline parse failure without changing its schema. Two added regressions cover quoted/control text and the complete artifact.

The cleanup removes 23 verified obsolete Frontend files and ignores generated
analysis output. The previously removed 889 MiB was mostly local generated site
output; it is not a Git-history or download-size reduction. No Backend change is
included. The final audit records all 25 cross-repository deletions and explains
the two existing test issues and three MySQL skips.

Validation: fresh production build, source-only workflow-generation rehearsal,
four requested npm checks, 42 source regressions, 52 responsive browser layouts,
admin/gear fixtures, live catalog search and read-only PDF checks. See
[sfi-final-premerge-audit.md](sfi-final-premerge-audit.md) for exact results,
remaining limitations and the review recommendation. Screenshots and raw logs
remain local and are excluded from this PR.
