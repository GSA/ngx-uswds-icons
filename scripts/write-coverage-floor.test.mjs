#!/usr/bin/env node
/**
 * Tests for the coverage-floor snapshot writer (scripts/write-coverage-floor.mjs).
 *
 * Run: node --test scripts/write-coverage-floor.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const script = join(scriptDir, 'write-coverage-floor.mjs');
const floorPath = resolve(scriptDir, '..', 'coverage-floor.json');

/** Run the writer, returning { status, stdout, stderr }. */
function run(args) {
  try {
    const stdout = execFileSync('node', [script, ...args], { encoding: 'utf8' });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      status: error.status ?? 1,
      stdout: error.stdout?.toString() ?? '',
      stderr: error.stderr?.toString() ?? '',
    };
  }
}

function writeSummary(dir, pcts) {
  const total = Object.fromEntries(Object.entries(pcts).map(([k, v]) => [k, { pct: v }]));
  const path = join(dir, 'summary.json');
  writeFileSync(path, JSON.stringify({ total }));
  return path;
}

function withTempDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'covfloor-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Runs `fn` with the real coverage-floor.json backed up and restored
 * afterwards. The script always writes the repo-root floor file, so we back
 * it up rather than parameterise the path.
 */
function withFloorBackup(fn) {
  const existed = existsSync(floorPath);
  const backup = existed ? readFileSync(floorPath, 'utf8') : null;
  try {
    return fn();
  } finally {
    if (existed) {
      writeFileSync(floorPath, backup);
    } else {
      rmSync(floorPath, { force: true });
    }
  }
}

test('writes a coverage-floor.json snapshot with floored integer percentages', () => {
  withFloorBackup(() => {
    withTempDir((dir) => {
      const summary = writeSummary(dir, { statements: 87.6, branches: 82.3, functions: 90, lines: 88.9 });
      const { status, stdout } = run([summary]);
      assert.equal(status, 0);
      assert.match(stdout, /Wrote coverage-floor\.json/);
      const written = JSON.parse(readFileSync(floorPath, 'utf8'));
      assert.deepEqual(written, { statements: 87, branches: 82, functions: 90, lines: 88 });
    });
  });
});

test('overwrites a previous snapshot rather than ratcheting (not a gate)', () => {
  withFloorBackup(() => {
    withTempDir((dir) => {
      writeFileSync(floorPath, `${JSON.stringify({ statements: 99, branches: 99, functions: 99, lines: 99 }, null, 2)}\n`);
      const summary = writeSummary(dir, { statements: 80, branches: 80, functions: 80, lines: 80 });
      const { status } = run([summary]);
      assert.equal(status, 0);
      const written = JSON.parse(readFileSync(floorPath, 'utf8'));
      assert.deepEqual(written, { statements: 80, branches: 80, functions: 80, lines: 80 });
    });
  });
});

test('exits non-zero when the coverage summary is missing', () => {
  const { status, stderr } = run([join(tmpdir(), 'does-not-exist-covfloor.json')]);
  assert.equal(status, 1);
  assert.match(stderr, /Could not read coverage summary/);
});

test('exits non-zero and reports the metric when a percentage is missing from the summary', () => {
  withTempDir((dir) => {
    const path = join(dir, 'summary.json');
    writeFileSync(path, JSON.stringify({ total: { statements: { pct: 90 } } }));
    const { status, stderr } = run([path]);
    assert.equal(status, 1);
    assert.match(stderr, /branches: missing from coverage summary/);
  });
});
