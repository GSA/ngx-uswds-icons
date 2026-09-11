#!/usr/bin/env node
/**
 * Tests for the ESLint warning-baseline gate script
 * (scripts/check-lint-baseline.mjs).
 *
 * These run on the Node built-in test runner (no extra deps) by invoking the
 * script as a child process against temp fixture files, so we exercise the
 * real CLI surface (exit codes, --bump, error precedence, malformed
 * baselines) rather than internals.
 *
 * Run: node --test scripts/check-lint-baseline.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const script = join(scriptDir, 'check-lint-baseline.mjs');

/** Run the gate, returning { status, stdout, stderr }. */
function run(args, { baselinePath: overridePath } = {}) {
  try {
    const stdout = execFileSync('node', [script, ...args], {
      encoding: 'utf8',
      env: { ...process.env, ...(overridePath ? { ESLINT_BASELINE_PATH: overridePath } : {}) },
    });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      status: error.status ?? 1,
      stdout: error.stdout?.toString() ?? '',
      stderr: error.stderr?.toString() ?? '',
    };
  }
}

/** Writes a minimal ESLint JSON-formatter report with the given totals. */
function writeReport(dir, { errors = 0, warnings = 0 } = {}) {
  const path = join(dir, 'eslint-report.json');
  const results = [
    {
      filePath: join(dir, 'fixture.ts'),
      messages: [],
      errorCount: errors,
      warningCount: warnings,
    },
  ];
  writeFileSync(path, JSON.stringify(results));
  return path;
}

function withTempDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'lintgate-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Runs `fn` with a disposable baseline file (containing `baselines`) at a
 * temp path, passed to the script via ESLINT_BASELINE_PATH so tests never
 * touch the committed repo-root eslint-baseline.json.
 */
function withBaselines(baselines, fn) {
  return withTempDir((dir) => {
    const path = join(dir, 'eslint-baseline.json');
    writeFileSync(path, `${JSON.stringify(baselines, null, 2)}\n`);
    return fn(path);
  });
}

test('passes when warnings are at the baseline', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 10 });
      const { status, stdout } = run(['root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 0);
      assert.match(stdout, /Lint baseline gate passed/);
    });
  });
});

test('passes when warnings are below the baseline', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 3 });
      const { status } = run(['root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 0);
    });
  });
});

test('fails and reports expected vs. actual when warnings exceed the baseline', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 11 });
      const { status, stderr } = run(['root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /baseline exceeded/);
      assert.match(stderr, /expected:\s*<=\s*10/);
      assert.match(stderr, /actual:\s*11/);
    });
  });
});

test('fails on any error regardless of the warning count', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { errors: 1, warnings: 0 });
      const { status, stderr } = run(['root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /1 ESLint error/);
    });
  });
});

test('fails on errors even when warnings are within baseline', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { errors: 2, warnings: 5 });
      const { status, stderr } = run(['root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /2 ESLint error/);
    });
  });
});

test('--bump lowers the baseline to the measured warning count', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 6 });
      const { status } = run(['--bump', 'root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 0);
      const written = JSON.parse(readFileSync(tempBaselinePath, 'utf8'));
      assert.equal(written.root, 6);
    });
  });
});

test('--bump never raises a baseline (ratchet-only)', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 15 });
      const { status, stdout } = run(['--bump', 'root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 0);
      assert.match(stdout, /nothing to bump/);
      const written = JSON.parse(readFileSync(tempBaselinePath, 'utf8'));
      assert.equal(written.root, 10);
    });
  });
});

test('--bump refuses to run when there are errors', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { errors: 1, warnings: 2 });
      const { status, stderr } = run(['--bump', 'root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /fix errors before bumping/);
      const written = JSON.parse(readFileSync(tempBaselinePath, 'utf8'));
      assert.equal(written.root, 10);
    });
  });
});

test('--bump on an unknown workspace fails loudly instead of silently reporting nothing to bump', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 3 });
      const { status, stderr } = run(['--bump', 'roots', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /missing or invalid entry/);
      const written = JSON.parse(readFileSync(tempBaselinePath, 'utf8'));
      assert.ok(!('roots' in written));
    });
  });
});

test('a missing workspace entry in the baseline file fails loudly', () => {
  withBaselines({ other: 4 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 1 });
      const { status, stderr } = run(['root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /missing or invalid entry/);
    });
  });
});

test('a malformed (non-numeric) baseline entry fails loudly', () => {
  withBaselines({ root: 'ten' }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const report = writeReport(dir, { warnings: 1 });
      const { status, stderr } = run(['root', report], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /missing or invalid entry/);
    });
  });
});

test('exits non-zero when the ESLint report is missing', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    const { status, stderr } = run(['root', join(tmpdir(), 'does-not-exist-lintgate.json')], { baselinePath: tempBaselinePath });
    assert.equal(status, 1);
    assert.match(stderr, /Could not read ESLint report/);
  });
});

test('fails loudly when the ESLint report is not an array (unexpected shape)', () => {
  withBaselines({ root: 10 }, (tempBaselinePath) => {
    withTempDir((dir) => {
      const path = join(dir, 'eslint-report.json');
      writeFileSync(path, JSON.stringify({}));
      const { status, stderr } = run(['root', path], { baselinePath: tempBaselinePath });
      assert.equal(status, 1);
      assert.match(stderr, /Could not read ESLint report/);
      assert.match(stderr, /Expected an array/);
    });
  });
});

test('exits non-zero with usage when arguments are missing', () => {
  const { status, stderr } = run([]);
  assert.equal(status, 1);
  assert.match(stderr, /Usage:/);
});
