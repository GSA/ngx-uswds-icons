// @ts-check
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ── Global ignores ──────────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'out-tsc/**',
      'node_modules/**',
      'coverage/**',
      'scripts/**',                            // template/codegen scripts — not linted
      'projects/icons/src/lib/uswds-icons/**', // generated — linted separately below
    ],
  },

  // ── TypeScript source files ─────────────────────────────────────────────────
  {
    files: ['**/*.ts'],
    ignores: ['projects/icons/src/lib/uswds-icons/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
    },
    rules: {
      // TypeScript recommended
      ...tsPlugin.configs['recommended'].rules,

      // Angular recommended
      ...angularPlugin.configs.recommended.rules,

      // Project-specific overrides
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['app', 'usa'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['app', 'usa'], style: 'kebab-case' },
      ],
    },
  },

  // ── Generated icon files (linted loosely — auto-generated code) ─────────────
  {
    files: ['projects/icons/src/lib/uswds-icons/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./projects/icons/tsconfig.lib.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Generated files: only flag genuine errors, not style
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },

  // ── Angular HTML templates ───────────────────────────────────────────────────
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    rules: {
      ...angularTemplatePlugin.configs.recommended.rules,
    },
  },
];
