// Adapted from flair-agency/architecture-gatekeeper test/codeql-local.test.mjs
// Source commit: 38e56232a7ce06ee431a5a2e25e85ddccb837daa.
// Copyright (c) 2026 Flair Agency; MIT License (see repository LICENSE).
import test from 'node:test';
import assert from 'node:assert/strict';
import { runCodeql } from '../scripts/codeql-local.mjs';
import path from 'node:path';

function harness({ missing = false, failure = 0, home = process.platform === 'win32' ? 'C:\\Users\\developer' : '/home/developer', redirected = false, noExistingAncestor = false } = {}) {
  const calls = [], writes = new Map(), made = [], messages = [];
  const absoluteHome = path.resolve(home);
  const root = path.parse(absoluteHome).root || path.sep;
  const repository = path.resolve(root, 'repo');
  const context = {
    fileURLToPath: () => path.join(repository, 'scripts', 'codeql-local.mjs'),
    homedir: () => absoluteHome,
    process: { platform: process.platform, exit(code) { throw new Error(`exit:${code}`); } },
    console: { log: text => messages.push(text), error: text => messages.push(text) },
    existsSync: candidate => !noExistingAncestor && (candidate === root || candidate === absoluteHome),
    realpathSync: candidate => candidate === repository ? candidate : redirected && candidate === absoluteHome ? repository : candidate,
    mkdirSync: candidate => made.push(candidate), mkdtempSync: prefix => `${prefix}unique`,
    writeFileSync: (file, text) => writes.set(file, text),
    readFileSync: () => JSON.stringify({ runs: [{ results: [{ ruleId: 'example' }, { ruleId: 'example' }] }] }),
    spawnSync(binary, args, options) {
      calls.push({ binary, args, options });
      return missing ? { error: { code: 'ENOENT' } } : { status: failure };
    },
  };
  return { calls, writes, made, messages, home: absoluteHome, run: () => runCodeql(context) };
}
test('missing PATH CLI gives installation guidance before creating output', () => {
  const h = harness({ missing: true });
  assert.throws(h.run, /exit:1/);
  assert.match(h.messages.join('\n'), /Install the official CodeQL bundle/);
  assert.match(h.messages.join('\n'), /PATH/);
  assert.equal(h.made.length, 0);
  assert.equal(h.calls[0].binary, process.platform === 'win32' ? 'codeql.exe' : 'codeql');
});
test('CLI failures stop before output creation', () => {
  const h = harness({ failure: 7 });
  assert.throws(h.run, /CodeQL failed \(7\)/);
  assert.equal(h.calls.length, 1);
  assert.equal(h.made.length, 0);
});
test('fixed home output inside the checkout is rejected before creation', () => {
  const h = harness({ home: '/repo' });
  assert.throws(h.run, /outside the repository/);
  assert.equal(h.made.length, 0);
});
test('symlinked existing ancestor into checkout is rejected before creation', () => {
  const h = harness({ redirected: true });
  assert.throws(h.run, /outside the repository/);
  assert.equal(h.made.length, 0);
});
test('root ancestor without any existing parent fails instead of looping', () => {
  const h = harness({ noExistingAncestor: true });
  assert.throws(h.run, /Could not find an existing parent/);
  assert.equal(h.made.length, 0);
});
test('both languages retain SARIF summaries and report findings without a clean claim', () => {
  const h = harness(); h.run();
  assert.equal(h.calls.length, 5);
  assert.equal(h.calls[1].args.includes('--language=javascript-typescript'), true);
  assert.equal(h.calls[3].args.includes('--language=actions'), true);
  for (const call of h.calls) assert.equal(call.options.shell, undefined);
  const summary = JSON.parse([...h.writes.values()].at(-1));
  assert.equal(summary.languages.length, 2);
  assert.equal(summary.languages[0].findings, 2);
  assert.equal(summary.languages[1].rules.example, 2);
  assert.ok(summary.completedAt);
  assert.ok(summary.scan.startsWith(path.join(h.home, '.local', 'share', 'architecture-decision-authoring', 'codeql')));
  assert.match(h.messages.at(-1), /does not mean zero findings/);
});
