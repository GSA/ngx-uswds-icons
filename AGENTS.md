# Agent Notes

## Setup and command order

- Use Node 24 from `.nvmrc` (`nvm use` or equivalent) before `npm ci`; `package.json` requires `>=24.0.0 <25`.
- Install with `npm ci`. The repo pins the public npm registry in `.npmrc` so installs do not inherit a contributor's private/global registry.
- CI's effective check order is: `npm run format:check` → `npm run lint:baseline` (single ESLint run that both fails on any error and enforces the warning ceiling) → `npm run validate:publish-workflow` → `npm run validate:security-workflow` → `npm run test:coverage` → `npx playwright install --with-deps chromium` → `npm run e2e` → `npm run build-storybook` → `npm run test:a11y` → `npm run build-prod`.
- Local shorthand checks:
  - `npm test` runs Vitest without coverage.
  - `npm run test:coverage` also regenerates `.github/badges/coverage.svg`.
  - `npm run e2e` starts the Angular demo app through Playwright; install Chromium once with `npx playwright install chromium` if missing.
  - `npm run test:a11y` runs the WCAG 2.1 AA axe-core gate against a built Storybook site (`playwright.a11y.config.ts`); it builds Storybook locally if `dist/storybook/ngx-uswds-icons-demo` isn't already present. Regenerate the baseline intentionally with `UPDATE_A11Y_BASELINE=1 npm run test:a11y`.

## Project layout

- Root `src/` is the Angular demo app.
- Publishable library source is `projects/icons/`; its public API is `projects/icons/src/public-api.ts`.
- The package that gets published is configured by `projects/icons/package.json` and `projects/icons/ng-package.json`, then built to `dist/icons` by `npm run build-prod`.
- The root `package.json` is the private demo workspace; do not use its `version` as the library release version.

## Generated files and dirty-tree traps

- `npm run build`, `npm run build-prod`, and `npm start` all run `npm run regenerateIcons` first.
- `regenerateIcons` runs `scripts/copy-svgs.sh`, which rebuilds `projects/icons/src/lib/uswds-icons/` from `node_modules/uswds/src/img/usa-icons` and uses the root `test/` directory as scratch space.
- After running build/regeneration commands, check `git status`. Restore generated/spec/test-support files unless the change intentionally updates generated icons.
- After `npm run test:coverage`, check whether `.github/badges/coverage.svg` changed; do not commit badge churn unless that is the purpose of the change.
- `npm run build-storybook` and `npm run test:a11y` generate `dist/storybook/`, `documentation.json` (Compodoc), and `test-results/`; all are gitignored. Check `git status` afterward and do not commit them.

## Linting, formatting, and tests

- ESLint uses flat config in `eslint.config.mjs`; `scripts/`, `test/`, generated USWDS icons, `dist/`, and coverage output are ignored. `eslint-plugin-storybook`'s flat recommended config is wired in for `*.stories.ts` files.
- A ratcheting warning-baseline gate sits on top of ESLint: `eslint-baseline.json` (key `root` — this repo is a single workspace, unlike `sam-ui-elements`' root/test-app split) + `scripts/check-lint-baseline.mjs` fail the build if warnings exceed the recorded baseline, or if there are _any_ errors (errors always fail regardless of the baseline). CI runs this gate (`npm run lint:baseline`, which itself invokes `eslint .` to produce the report) as its only ESLint step — there is no separate bare `npm run lint` step in CI, since that would run ESLint twice. `npm run lint` is still available for a quick local check without the baseline comparison; `npm run lint:baseline:bump` only ever lowers the baseline, never raises it.
- The `build` job in `.github/workflows/ci.yml` additionally runs `scripts/check-baseline-not-increased.mjs` (PR events only), comparing `eslint-baseline.json` on the PR branch against the base branch — this closes the hole where a contributor could raise the ceiling by hand-editing the JSON in the same PR that adds new warnings. The `--bump` script is the only sanctioned way to change the baseline file.
- `scripts/check-lint-baseline.test.mjs` and `scripts/check-baseline-not-increased.test.mjs` exist and pass but are **not** run in CI — run `node --test scripts/*.test.mjs` manually when touching either gate script.
- Prettier ignores generated USWDS icons and `scripts/` via `.prettierignore`.
- Vitest runs `projects/**/*.spec.ts` in a Node environment. `vitest.config.ts` aliases `@angular/core` to `test/__mocks__/@angular/core.ts` so component classes can be tested as plain TypeScript.
- Coverage thresholds are 80% for statements, branches, functions, and lines.
- The Playwright suite is intentionally a narrow smoke test: it loads the demo, fails on browser/page errors, and verifies visible icon output.
- A separate, dedicated Playwright config (`playwright.a11y.config.ts`) runs the WCAG 2.1 AA axe-core gate (`npm run test:a11y`) against every story in the built Storybook site (`.storybook/`, `src/stories/`). New violations fail the gate; the committed baseline (`tests/accessibility/wcag-2.1-aa-baseline.json`) and render-failure allow-list (`tests/accessibility/storybook-render-failures.json`) are both ratchets — only shrink them, and only via `UPDATE_A11Y_BASELINE=1 npm run test:a11y`.

## Security scanning

- Posture is layered and documented in `docs/security-scanning.md`, with the rationale in `docs/adr/0001-security-scanning-posture.md`: Dependabot (dependency hygiene), CodeQL **default setup** (SAST — the primary control, since this repo ships executable JS/TS), and OWASP ZAP (DAST) against the internal demo app.
- **Do not** add a committed CodeQL workflow — default setup is enabled and a committed workflow conflicts with it and fails at startup.
- The ZAP DAST scan targets the `src/` demo app, which is **not** published; treat it as defense-in-depth on tooling, not a control over the shipped library. See the ADR before expanding or removing it.
- `npm run validate:security-workflow` guards `.github/workflows/security.yml`; run it after any change to the security workflow, `.zap/rules.tsv`, or `docs/security-scanning.md` (it also runs in CI).
- Every workflow must declare an explicit least-privilege `permissions` block (CodeQL `actions/missing-workflow-permissions`). In `ci.yml` the default is `contents: read` and the PR-facing `build` job stays read-only; coverage-badge publication is isolated in a separate `publish-badge` job (gated to pushes on `master`) that runs no PR-controlled code and is the only holder of `contents: write`.

## Publishing workflow

- `npm run validate:publish-workflow` guards `.github/workflows/publish.yml`; run it after any workflow/publish-path change.
- Live npm publish is release-gated: full GitHub Releases only, `release` environment approval, npm Trusted Publishing/OIDC, and no long-lived npm token fallback.
- Manual `workflow_dispatch` publish runs are rehearsal-only and must stay dry-run.
- Release tags must match `projects/icons/package.json` exactly, with an optional leading `v`.

## Repo workflow conventions

- Branches for GitHub issues use `gh-<issue-number>-<short-slug>`.
- PRs should use `.github/pull_request_template.md`, reference an issue with `Closes #<number>`, and pass format, lint, build, and tests before review.
- Changes under `/.github/` require CODEOWNERS review from `@GSA/sam-shared-frontend-admin` / `@christyhermansen` in addition to the default repo owners.
