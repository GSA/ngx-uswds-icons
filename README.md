# NgxUswdsIcons

![Coverage](.github/badges/coverage.svg)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Linting

This project uses [ESLint 9](https://eslint.org/) with flat config (`eslint.config.mjs`), replacing the legacy TSLint/codelyzer setup.

```bash
npm run lint
```

The config file is `eslint.config.mjs`. Generated files in `projects/icons/src/lib/uswds-icons/` and `scripts/` are excluded from linting.

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

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
