#!/usr/bin/env node
/**
 * Coverage-floor snapshot writer.
 *
 * ngx-uswds-icons doesn't commit vitest's `coverage-summary.json` (it's an
 * ephemeral CI artifact), so downstream consumers such as the
 * angular-upgrade-dashboard have no stable, non-generated source of truth for
 * this repo's measured coverage. They currently fall back to scraping the
 * number out of the coverage badge SVG's `aria-label`, which breaks silently
 * if the badge template ever changes.
 *
 * This script commits a small `coverage-floor.json` snapshot
 * (`{statements, branches, functions, lines}`, matching the shape already
 * used by `ngx-uswds` and `sam-ui-elements`) alongside the badge. Unlike
 * those repos' `check-coverage.mjs`, this is intentionally NOT a ratchet
 * gate — it does not fail CI on regression, it simply overwrites the
 * snapshot with the currently measured coverage every time `test:coverage`
 * runs.
 *
 * Usage:
 *   node scripts/write-coverage-floor.mjs [path/to/coverage-summary.json]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const METRICS = ['statements', 'branches', 'functions', 'lines'];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const floorPath = resolve(scriptDir, '..', 'coverage-floor.json');

const args = process.argv.slice(2);
const summaryArg = args.find((arg) => !arg.startsWith('--'));
const summaryPath = resolve(summaryArg ?? 'coverage/coverage-summary.json');

let total;
try {
  total = JSON.parse(readFileSync(summaryPath, 'utf8')).total;
} catch (error) {
  console.error(`✖ Could not read coverage summary at ${summaryPath}`);
  console.error(`  ${error.message}`);
  console.error('  Run `npm run test:coverage` (or `vitest run --coverage`) first to generate it.');
  process.exit(1);
}

const snapshot = {};
const failures = [];
for (const metric of METRICS) {
  const pct = total?.[metric]?.pct;
  if (typeof pct !== 'number') {
    failures.push(`${metric}: missing from coverage summary`);
    continue;
  }
  snapshot[metric] = Math.floor(pct);
}

if (failures.length > 0) {
  console.error('✖ Could not write coverage-floor.json:');
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}

writeFileSync(floorPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`✓ Wrote coverage-floor.json (${METRICS.map((metric) => `${metric}: ${snapshot[metric]}%`).join(', ')})`);
