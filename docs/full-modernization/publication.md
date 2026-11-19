# Publication and preservation receipt

- Frontend draft: [SFI-Foundation/Frontend #42](https://github.com/SFI-Foundation/Frontend/pull/42), targeting `main` from `feature/sfi-full-site-modernization`.
- Backend draft: [SFI-Foundation/Backend #49](https://github.com/SFI-Foundation/Backend/pull/49), targeting `main` from `feature/sfi-repository-hygiene-backend`.
- Both feature branches were pushed directly to their SFI repositories. Draft descriptions cross-link the changes and include the report, OCS decisions, cleanup manifest, evidence, exact commands and limitations.
- Frontend runtime source validated by the final production build and browser suites is at `18bf66e2f`; subsequent commits change tests, documentation/evidence and whitespace only.
- Backend application Python is byte-identical to base `75d0306`; final hygiene/documentation head before this receipt is `ec6d082d0a0234fa8ec4b974f24f99fe3d25b8ab`.
- No auto-merge was enabled; neither PR was merged; no deployment was run. The existing main-only frontend Pages workflow does not deploy these feature pushes. The backend has no tracked `.github` workflow.

## Separated frontend commits

```text
03180c483 refactor: centralize shared appearance and accessibility styles
19b0e6930 feat: modernize SFI pages and replace account dropdown with two-level navigation
022320c5e refactor: consolidate settings workspace styles
3578f4b08 chore: remove unused inline theme and isolate disconnected assistant sources
18bf66e2f feat: improve account form validation and keyboard submission
1e80525c7 test: verify two-level navigation and selected settings sections
a0610af7a docs: record modernization audit, screenshots and verification results
```

The receipt/evidence finalization is a later documentation commit; the PR head is the authoritative full branch receipt.

## Original work retained

Original frontend: still clean on local `main` at `b6151edbb`. Original backend: still on `main` at `75d0306` with the pre-existing changes below. No original worktree was removed, repointed, reset or committed by this task.

```text
 M .env.example
 M .gitignore
 D backend.log
 D instance/.DS_Store
?? api/sfi_feedback.py
?? docs/sfi-feedback.md
?? model/sfi_feedback.py
?? tests/test_sfi_feedback.py
```

The copied hygiene worktree removes only Finder metadata; the original checkout's prior deletions remain its own work. Customer databases, uploads, private backups, credentials and environment files were not changed. The existing older preview on 4500 and backend service on 8605 were not stopped or reconfigured. The task-owned temporary preview and disposable MySQL container are stopped at final teardown. All screenshot/JSON artifacts remain available locally and selected copies are in this branch.
