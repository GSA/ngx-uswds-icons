# npm Publish Runbook

This document describes the security model and approval flow for publishing
`@gsa-sam/ngx-uswds-icons` to the public npm registry.

See also: `.github/workflows/publish.yml` for the full workflow source.

---

## Security layers (defence-in-depth)

Three independent guardrails must all be satisfied before a live publish can
reach npm. An attacker would need to defeat all three simultaneously.

| Layer                 | What it guards                                                                                                                 | Where it lives                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| 1 — CODEOWNERS        | Merge-time: any change to `/.github/` requires `@GSA/sam-shared-frontend-admin` review                                         | `.github/CODEOWNERS`                                |
| 2 — Branch protection | Merge-time: `master` requires a passing PR review, code-owner approval, and forbids direct pushes                              | GitHub repo Settings → Branches                     |
| 3 — Environment gate  | Run-time: the `npm-publish` environment pauses every publish job for a named human approver **before** OIDC mints a credential | GitHub repo Settings → Environments → `npm-publish` |

Layers 1 and 2 prevent an unauthorized workflow change from landing on
`master`. Layer 3 catches anything that somehow slips through — even a
legitimately-merged change cannot actually publish until a human explicitly
approves the pending deployment.

---

## How the approval flow works at runtime

1. A GitHub Release is published (or a maintainer triggers `workflow_dispatch`
   with `dry-run: true`).
2. The `quality-gates` job runs first (format check, lint, Vitest coverage,
   Playwright smoke test, Angular package build).
3. On success, the `publish` job is queued **but paused** at the
   `environment: npm-publish` gate.
4. GitHub sends a notification to the required reviewers configured on the
   `npm-publish` environment.
5. A named DevSecOps approver reviews the pending deployment in
   **Actions → the workflow run → Review deployments** and clicks **Approve**.
6. Only after approval does the job continue — at which point GitHub mints a
   short-lived OIDC credential that npm trusts because this repo + workflow
   filename are registered as the package's Trusted Publisher.
7. `npm publish` (or `npm publish --dry-run`) runs from `dist/icons` with that
   credential. No long-lived token is stored anywhere in the repo or in GitHub
   Secrets.

If the approver clicks **Reject**, the job is cancelled and nothing is
published.

---

## One-time setup checklist (DevSecOps / repo admin)

These steps must be completed once before the first live publish. Check each
off as done and record the date.

### Layer 2 — Branch protection on `master`

- [ ] **Required status checks** — add the PR quality-gate check run so a PR
      can't merge until it passes. In this repo the relevant Actions check is
      `CI / build`, which runs formatting, lint, Vitest coverage, Playwright,
      and `npm run build-prod`.
- [ ] **Require a pull request before merging** — at least 1 approving review
- [ ] **Require review from Code Owners** — ensures `.github/CODEOWNERS` is
      enforced
- [ ] **Restrict pushes** — no direct pushes to `master`; only PRs
- [ ] **Do not allow bypassing** — admins also subject to these rules

Location: `https://github.com/GSA/ngx-uswds-icons/settings/branches`

### Layer 3 — `npm-publish` environment

- [ ] **Required reviewers** — add `@GSA/sam-shared-frontend-admin` (and/or
      specific individuals); at least one approval required
- [ ] **Deployment branches** — restrict to the `master` branch only (prevents
      the environment from being triggered by a feature branch)
- [ ] **Wait timer** (optional) — add a short wait (e.g. 5 min) as an extra
      speed-bump if desired

Location: `https://github.com/GSA/ngx-uswds-icons/settings/environments`

### npm Trusted Publisher registration

- [ ] Log in to npmjs.com as the `@gsa-sam` org owner
- [ ] Navigate to the `@gsa-sam/ngx-uswds-icons` package → **Settings** →
      **Trusted Publishers**
- [ ] Add a GitHub Actions publisher:
  - **Organization**: `GSA`
  - **Repository**: `ngx-uswds-icons`
  - **Workflow filename**: `publish.yml`
  - **Environment name**: `npm-publish`
- [ ] Once registered, flip `DRY_RUN` to `false`:
  - Go to `https://github.com/GSA/ngx-uswds-icons/settings/variables/actions`
  - Set the `DRY_RUN` repository variable (or environment variable on
    `npm-publish`) to `false`
  - Alternatively, edit the default in `publish.yml` — but prefer the variable
    so it can be toggled without a code change

---

## Verifying the gate is active (smoke test)

1. Trigger a manual dry-run: **Actions → Publish to npm → Run workflow** →
   leave `dry-run: true` → **Run workflow**.
2. Watch the run. After `quality-gates` passes, the `publish` job should show
   **"Waiting for review"** under the `npm-publish` environment.
3. Approve it. The job should proceed, run `npm publish --dry-run` from
   `dist/icons`, and exit 0.
4. Confirm in the job logs that `npm publish --dry-run` ran (look for
   `npm notice` tarball output and the "dry-run" notice).

If the job does **not** pause for review, the environment gate is misconfigured
— stop and fix before registering the Trusted Publisher.

---

## Related files

- `.github/workflows/publish.yml` — the publish workflow
- `.github/CODEOWNERS` — enforces DevSecOps review on `/.github/` changes
- `docs/npm-publish-runbook.md` — this file
