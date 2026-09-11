# NgxUswdsIcons

![Coverage](.github/badges/coverage.svg)

This project uses Angular 21 and Node 24.

## Prerequisites

Use the Node version pinned in `.nvmrc` before installing dependencies or running project commands.

```bash
nvm use
npm ci
```

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the demo application. The build artifacts will be stored in the `dist/` directory.

Run `npm run build-prod` to build the publishable `ngx-uswds-icons` library package.

## Linting

This project uses [ESLint 9](https://eslint.org/) with flat config (`eslint.config.mjs`), replacing the legacy TSLint/codelyzer setup.

```bash
npm run lint
```

The config file is `eslint.config.mjs`. Generated files in `projects/icons/src/lib/uswds-icons/` and `scripts/` are excluded from linting. Angular templates are checked with both the recommended and accessibility rule sets from `@angular-eslint/eslint-plugin-template`.

### Accessibility scope

Template accessibility linting (`@angular-eslint/eslint-plugin-template`'s accessibility rule set) catches static template issues at lint time. On top of that, a runtime WCAG 2.1 AA gate walks every Storybook story with axe-core (`npm run test:a11y`) — see [Storybook and the accessibility gate](#storybook-and-the-accessibility-gate) below. Together these are the accepted WCAG 2.1 AA posture for this repository: lint catches static template defects, and the axe-core gate catches rendered violations (color contrast, computed ARIA state, etc.) across the icon components' actual DOM output. The demo's Playwright suite remains a smoke test and is not itself a WCAG audit.

## Formatting

This project uses [Prettier](https://prettier.io/) for code style enforcement. Config is in `.prettierrc`.

```bash
# Format all files in place
npm run format

# Check formatting without modifying files (also runs in CI)
npm run format:check
```

Generated files in `projects/icons/src/lib/uswds-icons/` and `scripts/` are excluded via `.prettierignore`.

## Running unit tests

Run `npm test` to execute the unit tests via [Vitest](https://vitest.dev/).

## Running end-to-end tests

Run `npm run e2e` to execute the Playwright smoke test against the demo application in Chromium. On a fresh local checkout, run `npx playwright install chromium` once before the first e2e run.

The current e2e scope is intentionally narrow: Playwright starts the Angular demo app, loads the root page, fails on browser console errors, and verifies that expected demo content and at least one rendered SVG icon are present. This provides upgrade confidence without introducing a broad, high-maintenance browser test suite.

## Storybook and the accessibility gate

Storybook (`.storybook/`) hosts stories for `usa-icon` (`IconComponent`) and `usa-stacked-icon` (`StackedIconComponent`) in `src/stories/`, exercising icons from all three sources this library ships: USWDS icons, the bundled custom "SDS" icons, and the underlying Bootstrap Icons set that `ngx-bootstrap-icons` provides.

```bash
# Run Storybook locally
npm run storybook

# Build the static Storybook site (used by the a11y gate and CI)
npm run build-storybook
```

`npm run test:a11y` runs a dedicated Playwright config (`playwright.a11y.config.ts`) against the built Storybook static output. It walks every published story, runs [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm) with the WCAG 2.1 A/AA tag set, and compares the rendered violations against a committed baseline (`tests/accessibility/wcag-2.1-aa-baseline.json`). New violations fail the gate; resolved violations must be pruned from the baseline. Stories that fail to render are tracked separately in `tests/accessibility/storybook-render-failures.json` (also a ratchet). Regenerate either file intentionally with:

```bash
UPDATE_A11Y_BASELINE=1 npm run test:a11y
```

## Contributing

This repository does not currently accept external pull requests. It is maintained by the GSA SAM design-library team as part of an internal Angular upgrade effort, and outside PRs will be closed without merging, regardless of quality.

If you've found a bug or have a feature request, please [open an issue](../../issues) describing it — issues are welcome and help inform our roadmap, even though we can't accept code contributions directly at this time.

For internal team members, PR guidelines remain:

- Branch names follow the convention `gh-<issue-number>-<short-slug>` (e.g. `gh-38-add-pull-request-template`).
- Every PR should reference a GitHub issue — include `Closes #<number>` in the PR description.
- All PRs use the repository's pull request template (`.github/pull_request_template.md`), which GitHub loads automatically when you open a PR.
- Ensure `npm run lint`, `npm run format:check`, `npm run build-prod`, and `npm run test` all pass before requesting review.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
