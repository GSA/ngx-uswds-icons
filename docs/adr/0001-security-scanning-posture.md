# ADR 0001: Security scanning posture (SAST, DAST, and dependency hygiene)

- Status: Accepted
- Date: 2026-08-20
- Deciders: ngx-uswds-icons maintainers
- Related: [#102](https://github.com/GSA/ngx-uswds-icons/issues/102), PR [#101](https://github.com/GSA/ngx-uswds-icons/pull/101), reference [GSA/sam-styles#812](https://github.com/GSA/sam-styles/pull/812)

## Context

A sibling repository (`GSA/sam-styles`) added layered security scanning in
sam-styles#812: dependency hygiene (Dependabot), SAST (CodeQL default setup),
and DAST (OWASP ZAP against its Storybook docs site). We were asked to align
this repository with that posture where it makes sense.

The two repositories are materially different in what they ship:

- **`sam-styles`** publishes **SCSS only**. Its Storybook site is documentation
  tooling and is never delivered to package consumers. sam-styles#812 itself
  notes that its DAST scan targets "docs tooling, not the published package."
- **`ngx-uswds-icons`** publishes an **Angular library** — real JavaScript,
  TypeScript, HTML, and CSS that is downloaded and executed inside consuming
  applications. The repository's `src/` demo app, by contrast, is internal
  tooling: it is never published (the package built from `projects/icons/` is
  what ships).

This means the two scan types have inverted value here relative to sam-styles:

- **SAST is more valuable here**, because we ship executable code to consumers.
- **DAST is less valuable here**, because the only runtime surface available to
  scan is the unpublished demo app — the same "scan the docs tooling" caveat
  that applies to sam-styles, but without a hosted public site.

Current state at the time of this decision:

- Dependabot is configured (npm + github-actions, grouped).
- CodeQL **default setup** is already enabled and running
  (`javascript-typescript` and `actions`); no committed CodeQL workflow exists,
  and none should be added — advanced and default setup conflict and fail at
  startup.
- PR #101 already merged a DAST scan (`security.yml`) that builds and serves the
  production Angular demo and runs an OWASP ZAP baseline against it, with a
  severity gate (`scripts/check-zap-severity.mjs`), a reviewed baseline
  (`.zap/rules.tsv`), a policy validator (`scripts/validate-security-workflow.mjs`),
  and documentation (`docs/security-scanning.md`).
- CodeQL had one open medium-severity finding
  (`actions/missing-workflow-permissions`) on `.github/workflows/ci.yml`: the
  workflow declared no `permissions` block, so `GITHUB_TOKEN` inherited more
  privilege than it needs.

## Decision

1. **SAST via CodeQL default setup.** Keep CodeQL default setup as the SAST
   control. Do not commit a CodeQL workflow file (it would conflict with default
   setup). This is the primary, highest-value control because we ship executable
   code.

2. **Fix the real finding first.** Add an explicit least-privilege `permissions`
   block to `ci.yml`. The workflow defaults to `contents: read`, and the `build`
   job — which runs PR-controlled code (checkout, `npm` scripts) — stays
   read-only. Coverage-badge publication is isolated in a dedicated
   `publish-badge` job that runs no PR-controlled code (it only downloads the
   badge artifact and commits it), is gated to pushes on `master`, and is the
   sole holder of `contents: write`. This keeps a push credential out of any job
   that executes untrusted pull-request code.

3. **Retain the demo-app DAST scan (from PR #101), with eyes open.** We keep the
   OWASP ZAP scan of the demo app for parity with the sam-styles pattern and
   because it is already merged, green, and low-cost to run. We explicitly record
   that its security value is **limited**: it scans internal demo tooling, not
   the published library, and no consumer ever loads the scanned surface. It is
   retained as defense-in-depth on the demo, not as a control that protects the
   shipped package.

4. **Retain Dependabot** as the dependency-hygiene control, complementary to
   SAST and DAST.

## Consequences

- **Positive:** The one genuine, tool-surfaced security gap (unscoped
  `GITHUB_TOKEN` in `ci.yml`) is closed. The posture is documented honestly, so
  a reviewer can see what each control does and does not protect. We stay aligned
  with the sam-styles#812 pattern (Dependabot + CodeQL SAST + ZAP DAST) without
  adding controls that do not fit this package.
- **Negative / accepted:** The demo-app DAST scan spends CI time on a surface
  that is not shipped to consumers, so a portion of its findings are inherently
  about tooling rather than the product. We accept this cost for parity and
  defense-in-depth rather than removing it days after PR #101 merged.
- **Deliberately not done:** We do not add a second, product-facing DAST target,
  because the published artifact is a component library with no standalone
  runtime surface to host and scan. If a hosted, consumer-facing surface is ever
  introduced, revisit this decision and point DAST at that surface instead of
  (or in addition to) the demo.
- **Follow-up owned by admins:** Branch protection / required status checks and
  CodeQL new-alert merge protection must be configured by a repository
  administrator; they cannot be set by a repository change alone. See
  `docs/security-scanning.md`.
