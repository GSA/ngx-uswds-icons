#!/usr/bin/env node
/**
 * Ratcheting warning-baseline gate for ESLint (run via `npm run lint:baseline`,
 * which invokes `eslint . --format json` once to produce the report this
 * script reads — this repo has a single workspace, unlike sam-ui-elements'
 * root/test-app split).
 *
 * `eslint`'s own `--max-warnings` option only supports a single fixed
 * number, which can't ratchet down as debt is paid off without editing CI
 * config on every cleanup PR. This script enforces a *ceiling*, recorded in
 * `eslint-baseline.json` at the repo root:
 *
 *   - New warnings above the recorded baseline fail the gate.
 *   - Any ESLint error fails the gate, regardless of the warning count.
 *   - Reducing warnings does NOT fail the gate; run with `--bump` to lock the
 *     improvement in as the new (lower) baseline.
 *
 * The baseline is a ratchet — `--bump` only ever lowers it. It never raises
 * it, so an accidental regression can't be "fixed" by re-bumping.
 *
 * Usage:
 *   node scripts/check-lint-baseline.mjs <workspace> <path/to/eslint-report.json>
 *   node scripts/check-lint-baseline.mjs --bump <workspace> <path/to/eslint-report.json>
 *
 * Where <workspace> is a key in eslint-baseline.json (currently just "root")
 * and the ESLint report is produced with `--format json --output-file <path>`.
 *
 * The repo-root baseline path can be overridden via the ESLINT_BASELINE_PATH
 * env var (used by the test suite so it exercises the real CLI against a
 * disposable temp file instead of mutating the committed baseline).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const baselinePath = process.env.ESLINT_BASELINE_PATH
  ? resolve(process.env.ESLINT_BASELINE_PATH)
  : resolve(scriptDir, '..', 'eslint-baseline.json');

const args = process.argv.slice(2);
const bump = args.includes('--bump');
const positional = args.filter((arg) => !arg.startsWith('--'));
const [workspace, reportArg] = positional;

if (!workspace || !reportArg) {
  console.error('Usage: node scripts/check-lint-baseline.mjs [--bump] <workspace> <path/to/eslint-report.json>');
  process.exit(1);
}

const reportPath = resolve(reportArg);

let report;
try {
  report = JSON.parse(readFileSync(reportPath, 'utf8'));
} catch (error) {
  console.error(`✖ Could not read ESLint report at ${reportPath}`);
  console.error(`  ${error.message}`);
  console.error('  Run `eslint . --format json --output-file <path>` first to generate it.');
  process.exit(1);
}

if (!Array.isArray(report)) {
  console.error(`✖ Could not read ESLint report at ${reportPath}`);
  console.error(`  Expected an array of per-file results (the shape produced by \`eslint --format json\`), got ${typeof report}.`);
  console.error('  Run `eslint . --format json --output-file <path>` to regenerate a well-formed report.');
  process.exit(1);
}

let baselines;
try {
  baselines = JSON.parse(readFileSync(baselinePath, 'utf8'));
} catch (error) {
  console.error(`✖ Could not read lint baselines at ${baselinePath}`);
  console.error(`  ${error.message}`);
  process.exit(1);
}

const totals = report.reduce(
  (acc, result) => {
    acc.errors += result.errorCount ?? 0;
    acc.warnings += result.warningCount ?? 0;
    return acc;
  },
  { errors: 0, warnings: 0 },
);

if (bump) {
  const current = baselines[workspace];
  if (!Number.isFinite(current)) {
    console.error(`✖ ${workspace}: missing or invalid entry in ${baselinePath}`);
    process.exit(1);
  }

  if (totals.errors > 0) {
    console.error(`✖ ${workspace}: ${totals.errors} ESLint error(s) found; fix errors before bumping the baseline.`);
    process.exit(1);
  }

  // Ratchet only ever moves down.
  const next = Math.min(current, totals.warnings);

  if (next === current) {
    console.log(`= ${workspace}: baseline already at or below current warnings (${current}); nothing to bump.`);
    process.exit(0);
  }

  baselines[workspace] = next;
  writeFileSync(baselinePath, `${JSON.stringify(baselines, null, 2)}\n`);
  console.log(`↓ ${workspace}: baseline lowered ${current} → ${next} (measured ${totals.warnings}). Commit this change on its own.`);
  process.exit(0);
}

const baseline = baselines[workspace];
if (!Number.isFinite(baseline)) {
  console.error(`✖ ${workspace}: missing or invalid entry in ${baselinePath}`);
  process.exit(1);
}

if (totals.errors > 0) {
  console.error(`✖ ${workspace}: ${totals.errors} ESLint error(s) found. Errors are never allowed, regardless of the warning baseline.`);
  process.exit(1);
}

if (totals.warnings > baseline) {
  console.error(`✖ ${workspace}: ESLint warning baseline exceeded.`);
  console.error(`  expected: <= ${baseline} warnings`);
  console.error(`  actual:   ${totals.warnings} warnings`);
  console.error(
    '\n  This change introduced new ESLint warnings beyond the accepted baseline.\n' +
      '  Fix the new findings, or if you intentionally reduced warnings elsewhere,\n' +
      `  run \`node scripts/check-lint-baseline.mjs --bump ${workspace} ${reportArg}\` and commit\n` +
      '  the lowered baseline as its own change.',
  );
  process.exit(1);
}

console.log(`✓ ${workspace}: ${totals.warnings} warnings (baseline ${baseline}), ${totals.errors} errors. Lint baseline gate passed.`);
