import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflow = readFileSync(join(root, '.github/workflows/architecture-gate-observe.yml'), 'utf8');
const filterMatch = workflow.match(/gate_json="\$\(jq -er '\n([\s\S]*?)\n\s*' "\$GITHUB_EVENT_PATH"\)"/);
assert.ok(filterMatch, 'workflow must keep the authorization jq filter in the protected-base caller');

const temp = mkdtempSync(join(tmpdir(), 'ada-fork-preflight-'));
const filterPath = join(temp, 'preflight.jq');
writeFileSync(filterPath, filterMatch[1]);
const diagnoseSection = workflow.split('  diagnose-authorization:\n')[1]?.split('\n  architecture-gate-observe:')[0];
const diagnoseMatch = diagnoseSection?.match(/        run: \|\n([\s\S]*)$/);
assert.ok(diagnoseMatch, 'workflow must keep the authorization diagnostic in the protected-base caller');
const diagnoseScript = diagnoseMatch[1]
  .split('\n')
  .map((line) => line.startsWith('          ') ? line.slice(10) : line)
  .join('\n');

function event({ headId = 1379218762, baseId = 1379218762, repositoryId = 1379218762, association = 'MEMBER', draft = false, baseRef = 'main' } = {}) {
  return {
    action: 'opened',
    repository: { id: repositoryId },
    pull_request: {
      base: { ref: baseRef, repo: { id: baseId } },
      head: { repo: { id: headId } },
      draft,
      author_association: association,
    },
  };
}

function evaluate(value, expectedRepositoryId = '1379218762') {
  const inputPath = join(temp, 'event.json');
  writeFileSync(inputPath, JSON.stringify(value));
  const output = execFileSync('jq', ['-er', '-f', filterPath, inputPath], {
    encoding: 'utf8',
    env: { ...process.env, EXPECTED_REPOSITORY_ID: expectedRepositoryId },
  });
  return JSON.parse(output);
}

test('same-repository admission is independent of author association', () => {
  for (const association of ['OWNER', 'MEMBER', 'COLLABORATOR', 'CONTRIBUTOR', 'FIRST_TIMER', 'FIRST_TIME_CONTRIBUTOR', 'MANNEQUIN', 'NONE', 'unrecognized', null, 42]) {
    const result = evaluate(event({ association }));
    assert.equal(result.allowed, 'true');
    assert.equal(result.reason, 'eligible');
    assert.ok(['OWNER', 'MEMBER', 'COLLABORATOR', 'CONTRIBUTOR', 'FIRST_TIMER', 'FIRST_TIME_CONTRIBUTOR', 'MANNEQUIN', 'NONE', 'UNKNOWN'].includes(result.association));
  }
  const missingAssociation = event();
  delete missingAssociation.pull_request.author_association;
  assert.equal(evaluate(missingAssociation).association, 'UNKNOWN');
  assert.equal(evaluate(missingAssociation).allowed, 'true');
  assert.equal(evaluate(event({ draft: true })).reason, 'draft');
  assert.equal(evaluate(event({ baseRef: 'release' })).reason, 'wrong_base');
});

test('an original Fork is denied even when its author association is allowlisted', () => {
  for (const association of ['OWNER', 'MEMBER', 'COLLABORATOR', 'CONTRIBUTOR', 'unrecognized', null]) {
    const result = evaluate(event({ headId: 987654321, association }));
    assert.equal(result.allowed, 'false');
    assert.equal(result.reason, 'fork');
  }
});

test('missing, malformed, or contradictory numeric repository identities fail closed', () => {
  const invalidEvents = [
    event({ repositoryId: '1379218762' }),
    event({ repositoryId: 0 }),
    event({ repositoryId: 1.5 }),
    event({ repositoryId: 9007199254740992 }),
    event({ baseId: 987654321 }),
    event({ headId: null }),
    { action: 'opened', pull_request: event().pull_request },
  ];
  for (const invalid of invalidEvents) {
    const inputPath = join(temp, 'invalid-event.json');
    writeFileSync(inputPath, JSON.stringify(invalid));
    const result = spawnSync('jq', ['-er', '-f', filterPath, inputPath], {
      encoding: 'utf8',
      env: { ...process.env, EXPECTED_REPOSITORY_ID: '1379218762' },
    });
    assert.notEqual(result.status, 0, JSON.stringify(invalid));
  }
  const missingExpectedEventPath = join(temp, 'missing-expected-id.json');
  writeFileSync(missingExpectedEventPath, JSON.stringify(event()));
  const missingExpectedId = spawnSync('jq', ['-er', '-f', filterPath, missingExpectedEventPath], {
    encoding: 'utf8',
    env: { ...process.env, EXPECTED_REPOSITORY_ID: '' },
  });
  assert.notEqual(missingExpectedId.status, 0);
});

test('the actual diagnostic step accepts explicit denials and fails closed on bad propagation', () => {
  function diagnose({ result = 'success', allowed = 'false', reason = 'fork' } = {}) {
    const summaryPath = join(temp, 'summary.md');
    const run = spawnSync('bash', ['-s'], {
      input: diagnoseScript,
      encoding: 'utf8',
      env: { ...process.env, AUTH_RESULT: result, ALLOWED: allowed, REASON: reason, GITHUB_STEP_SUMMARY: summaryPath },
    });
    return run;
  }

  assert.equal(diagnose().status, 0);
  assert.equal(diagnose({ allowed: 'true', reason: 'eligible' }).status, 0);
  assert.notEqual(diagnose({ reason: '' }).status, 0);
  assert.notEqual(diagnose({ result: 'failure', allowed: '', reason: '' }).status, 0);
  assert.notEqual(diagnose({ allowed: 'true', reason: 'fork' }).status, 0);
  assert.notEqual(diagnose({ reason: 'author_association' }).status, 0);
  assert.match(workflow, /architecture-gate-observe:\s+needs: \[authorize, diagnose-authorization\]/);
  assert.match(workflow, /needs\.authorize\.outputs\.allowed == 'true' && needs\.diagnose-authorization\.result == 'success'/);
});

test.after(() => rmSync(temp, { recursive: true, force: true }));
