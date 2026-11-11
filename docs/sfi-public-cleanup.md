# Public specification cleanup

Branch: `feature/sfi-phase1-public-cleanup`.
Base: `77915a71106e82a215ac3da54fab129290d221bc`.

Public specification search retains categories, deduplicated results, pagination, metadata and verified current PDF actions. The car/zone showcase, classifier controls and accuracy card are removed. Research UI is preserved in excluded `_internal/specification-research.md`. The manufacturer prototype page/dataset are excluded by default; only `JEKYLL_ENV=development` plus `_config.development.yml` emits them. Production opt-in fails. Switching the flag off removes stale output in the same destination.

`.env` is untracked and retained locally. Environment variants/private keys/QA artifacts are ignored; `.env.example` contains no credentials. Removed provider-key literals from inherited layouts, sidebar and lesson examples. The post-write guard blocks provider credentials and private local files in generated output. Credential-owner rotation/revocation is still required for historical exposures; history was not rewritten.

Full review, exact launch/test commands, PDF discrepancy report and owner-action checklist are in sibling `Backend/docs/sfi-public-cleanup.md`, `sfi-public-security.md` and `sfi-pdf-discrepancies-for-jennifer.{md,html}`. Local evidence is ignored in `qa-evidence/` and excluded from public output. No branch was pushed, merged or deployed.

```bash
BUNDLE_PATH=/tmp/sfi-phase1-gems make public-review-serve
```

Start the sibling backend's documented isolated sandbox on port 8605, then open http://localhost:4000/sfi-specs/. Stop owned servers with Ctrl+C. The focused Make targets avoid the legacy broad stop/conversion workflow.
