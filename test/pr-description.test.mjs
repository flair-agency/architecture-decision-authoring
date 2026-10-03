// Adapted from flair-agency/architecture-gatekeeper test/pr-description.test.mjs
// Source commit: 38e56232a7ce06ee431a5a2e25e85ddccb837daa.
// Copyright (c) 2026 Flair Agency; MIT License (see repository LICENSE).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const workflow = readFileSync(new URL('../.github/workflows/pr-description.yml', import.meta.url), 'utf8');
const script = workflow.match(/node --input-type=module <<'JS'\n([\s\S]*?)          JS/)[1]
  .split('\n').map(line => line.replace(/^          /, '')).join('\n');
const valid = `## Outcome
Summarizes the proposal-authoring change.
## Issue coverage
Refs #42. Covers package development checks and PR metadata validation.
## Verification
Focused tests pass; no owner adoption or downstream acceptance is claimed.
## Remaining work
#42 owns any remaining development workflow follow-up.
## Authority and assurance
No architecture or adoption contract change.
`;
function run(body) {
  const directory = mkdtempSync(join(tmpdir(), 'pr-description-'));
  try {
    const event = join(directory, 'event.json');
    const summary = join(directory, 'summary.md');
    writeFileSync(event, JSON.stringify({ pull_request: { body } }));
    const result = spawnSync(process.execPath, ['--input-type=module', '-'], {
      input: script, encoding: 'utf8',
      env: { ...process.env, GITHUB_EVENT_PATH: event, GITHUB_STEP_SUMMARY: summary },
    });
    return { ...result, summary: readFileSync(summary, 'utf8') };
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
test('accepts partial delivery with owned remaining work', () => {
  const result = run(valid);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.summary, /does not verify claims/);
});
test('accepts explained non-applicable issue, no remaining work, and optional third-party None', () => {
  const body = valid.replace('Refs #42. Covers package development checks and PR metadata validation.', 'N/A — no issue was opened for this internal maintenance change.')
    .replace('#42 owns any remaining development workflow follow-up.', 'None — this PR completes the bounded workflow change.')
    + '\n## Third-party material\nNone.\n';
  assert.equal(run(body).status, 0);
});
test('optional third-party material may be omitted but placeholders fail', () => {
  assert.equal(run(valid).status, 0);
  assert.equal(run(valid + '\n## Third-party material\nTBD\n').status, 1);
  assert.equal(run(valid + '\n## Third-party material\nAdapted MIT-licensed code; source attribution retained.\n').status, 0);
});
test('accepts explained N/A and None markers in common list and emphasis forms', () => {
  const body = valid
    .replace('Refs #42. Covers package development checks and PR metadata validation.', '- **N/A** — no issue was opened because this is an internal workflow change.')
    .replace('#42 owns any remaining development workflow follow-up.', '* _None_ — no follow-up remains for this bounded change.');
  assert.equal(run(body).status, 0);
});
test('rejects bare N/A or None even when decorated as a list or emphasis', () => {
  assert.equal(run(valid.replace('Refs #42. Covers package development checks and PR metadata validation.', '- **N/A**')).status, 1);
  assert.equal(run(valid.replace('#42 owns any remaining development workflow follow-up.', '* _None_')).status, 1);
});
test('rejects missing or duplicate required sections', () => {
  assert.equal(run(valid.replace('## Verification', '## Checks')).status, 1);
  assert.equal(run(valid + '\n## Verification\nPassed.').status, 1);
});
test('rejects reordered populated sections', () => {
  const reordered = valid.replace(/(## Issue coverage[\s\S]*?)(## Verification[\s\S]*?)(?=## Remaining work)/, '$2$1');
  const result = run(reordered);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /template order/);
});
test('ignores template instructions and rejects placeholders', () => {
  assert.equal(run(valid.replace('Summarizes the proposal-authoring change.', '<!-- describe outcome -->')).status, 1);
  assert.equal(run(valid.replace('Summarizes the proposal-authoring change.', 'TBD')).status, 1);
  assert.equal(run(valid.replace('Summarizes the proposal-authoring change.', '- [ ]')).status, 1);
});
test('does not accept headings hidden in a fenced example', () => {
  for (const [opening, closing] of [['```md', '```'], ['```md', '````'], ['~~~md', '~~~~'], ['````md', '```'], ['```md', '']]) {
    assert.equal(run(opening + '\n' + valid + closing).status, 1);
  }
  assert.equal(run('<!-- unclosed comment\n' + valid).status, 1);
});
test('rejects unowned remaining work and bare N/A', () => {
  assert.equal(run(valid.replace('#42 owns any remaining development workflow follow-up.', 'Later work remains.')).status, 1);
  assert.equal(run(valid.replace('Refs #42. Covers package development checks and PR metadata validation.', 'N/A')).status, 1);
});
test('handles absent body and treats shell/workflow commands as inert text', () => {
  assert.equal(run(null).status, 1);
  const result = run(valid.replace('Summarizes the proposal-authoring change.', '$(exit 91) `exit 92` ::error::untrusted'));
  assert.equal(result.status, 0);
  assert.doesNotMatch(result.summary, /untrusted|exit 91/);
});
test('metadata workflow has no checkout, secrets, write permission or PR interpolation', () => {
  assert.match(workflow, /pull_request_target:/);
  assert.match(workflow, /permissions: \{\}/);
  assert.doesNotMatch(workflow, /uses:|secrets\.|\$\{\{ github\.event\.pull_request\.body/);
});
