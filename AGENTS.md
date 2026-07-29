# Agent Notes

## Setup and command order

- Use Node 24 from `.nvmrc` (`nvm use` or equivalent) before `npm ci`; `package.json` requires `>=24.0.0 <25`.
- Install with `npm ci`. The repo pins the public npm registry in `.npmrc` so installs do not inherit a contributor's private/global registry.
- CI's effective check order is: `npm run format:check` → `npm run lint` → `npm run validate:publish-workflow` → `npm run test:coverage` → `npx playwright install --with-deps chromium` → `npm run e2e` → `npm run build-prod`.
- Local shorthand checks:
  - `npm test` runs Vitest without coverage.
  - `npm run test:coverage` also regenerates `.github/badges/coverage.svg`.
  - `npm run e2e` starts the Angular demo app through Playwright; install Chromium once with `npx playwright install chromium` if missing.

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

## Linting, formatting, and tests

- ESLint uses flat config in `eslint.config.mjs`; `scripts/`, `test/`, generated USWDS icons, `dist/`, and coverage output are ignored.
- Prettier ignores generated USWDS icons and `scripts/` via `.prettierignore`.
- Vitest runs `projects/**/*.spec.ts` in a Node environment. `vitest.config.ts` aliases `@angular/core` to `test/__mocks__/@angular/core.ts` so component classes can be tested as plain TypeScript.
- Coverage thresholds are 80% for statements, branches, functions, and lines.
- The Playwright suite is intentionally a narrow smoke test: it loads the demo, fails on browser/page errors, and verifies visible icon output.

## Publishing workflow

- `npm run validate:publish-workflow` guards `.github/workflows/publish.yml`; run it after any workflow/publish-path change.
- Live npm publish is release-gated: full GitHub Releases only, `release` environment approval, npm Trusted Publishing/OIDC, and no long-lived npm token fallback.
- Manual `workflow_dispatch` publish runs are rehearsal-only and must stay dry-run.
- Release tags must match `projects/icons/package.json` exactly, with an optional leading `v`.

## Repo workflow conventions

- Branches for GitHub issues use `gh-<issue-number>-<short-slug>`.
- PRs should use `.github/pull_request_template.md`, reference an issue with `Closes #<number>`, and pass format, lint, build, and tests before review.
- Changes under `/.github/` require CODEOWNERS review from `@GSA/sam-shared-frontend-admin` / `@christyhermansen` in addition to the default repo owners.
