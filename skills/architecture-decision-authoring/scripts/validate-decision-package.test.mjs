import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const validator = fileURLToPath(new URL("./validate-decision-package.mjs", import.meta.url));
const digest = (value) => createHash("sha256").update(value).digest("hex");

async function root() {
  const container = await mkdtemp(join(tmpdir(), "decision-package-test-"));
  const dir = join(container, "decision-package");
  await mkdir(dir);
  return dir;
}

function run(path) {
  return spawnSync(process.execPath, [validator, path], { encoding: "utf8" });
}

async function writeValidAdoptPackage(dir, { memberId = "decision-a", validationResult } = {}) {
  const proposal = Buffer.from("# Proposal\n\n## Proposed decision\n\nAdopt clause A, based on source:input.md#rule.\n");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "proposal.md"), proposal);
  await writeFile(join(dir, "authority-set", "authority.md"), "# Authority\n\n<!-- clause-id: A -->\n## A\n\nClause A.\n");
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: memberId, repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
  }));
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1,
    outcome: "Adopt",
    proposal: { path: "proposal.md", revision: "abc123", sha256: digest(proposal) },
    owner: "owner",
    authorizationEvidence: "record:1",
    decisionDate: "2026-09-29",
    scope: "decision A",
    applicabilityConditions: [],
    exceptions: [],
    adoptedContent: [{ clauseId: "A", proposalLocator: "Proposed decision" }],
    amendedContent: null
  }));
  await writeFile(join(dir, "traceability.md"), [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    "| A | clause-id:A | Adopt | record:1 | abc123 | Proposed decision | source:input.md#rule |"
  ].join("\n"));
  await writeFile(join(dir, "validation-result.json"), JSON.stringify(validationResult === undefined ? {
    schemaVersion: 1,
    packageStructure: "pass",
    referenceBounds: "pass",
    clauseTraceability: "pass",
    gatekeeperCompatibility: { status: "not-run", pinnedRevision: null },
    semanticFidelity: { status: "pending" },
    consumerActivation: { status: "not-performed" }
  } : validationResult));
}

test("accepts a bounded Adopt package", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects stale consumable output for Defer", async () => {
  const dir = await root();
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "authority-set", "manifest.json"), "{}");
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({ outcome: "Defer" }));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must not leave a consumable Authority Set/);
});

test("rejects Amend output that differs from the approved snapshot", async () => {
  const dir = await root();
  const proposal = Buffer.from("# Proposal\n\n## Owner-approved amendment\n\nApproved clause from source:input.md#rule.\n");
  const snapshot = Buffer.from("# Authority\n\n<!-- clause-id: amended-a -->\nApproved clause.\n");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "proposal.md"), proposal);
  await writeFile(join(dir, "approved.md"), snapshot);
  await writeFile(join(dir, "authority-set", "authority.md"), "# Authority\n\n<!-- clause-id: amended-a -->\nRewritten clause.\n");
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: "decision-a", repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
  }));
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1,
    outcome: "Amend",
    proposal: { path: "proposal.md", revision: "abc123", sha256: digest(proposal) },
    owner: "owner",
    authorizationEvidence: "record:1",
    decisionDate: "2026-09-29",
    scope: "decision A",
    applicabilityConditions: [], exceptions: [], adoptedContent: [],
    amendedContent: { path: "approved.md", sha256: digest(snapshot) }
  }));
  await writeFile(join(dir, "traceability.md"), [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    "| amended-a | clause-id:amended-a | Amend | record:1 | abc123 | Owner-approved amendment | source:input.md#rule |"
  ].join("\n"));
  await writeFile(join(dir, "validation-result.json"), "{}");
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /exactly match/);
});

test("rejects a proposal path that does not select proposal.md", async () => {
  const dir = await root();
  const authority = Buffer.from("authority");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "authority-set", "authority.md"), authority);
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: "decision-a", repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
  }));
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1, outcome: "Adopt",
    proposal: { path: "authority-set/authority.md", revision: "abc", sha256: digest(authority) },
    owner: "owner", authorizationEvidence: "record:1", decisionDate: "2026-09-29", scope: "A",
    applicabilityConditions: [], exceptions: [],
    adoptedContent: [{ clauseId: "A", proposalLocator: "section A" }], amendedContent: null
  }));
  await writeFile(join(dir, "traceability.md"), "trace");
  await writeFile(join(dir, "validation-result.json"), "{}");
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must select the package proposal\.md/);
});

test("rejects ambiguous adoptedContent entries", async () => {
  const dir = await root();
  const proposal = Buffer.from("proposal");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "proposal.md"), proposal);
  await writeFile(join(dir, "authority-set", "authority.md"), "authority");
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: "decision-a", repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
  }));
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1, outcome: "Adopt",
    proposal: { path: "proposal.md", revision: "abc", sha256: digest(proposal) },
    owner: "owner", authorizationEvidence: "record:1", decisionDate: "2026-09-29", scope: "A",
    applicabilityConditions: [], exceptions: [], adoptedContent: [{}], amendedContent: null
  }));
  await writeFile(join(dir, "traceability.md"), "trace");
  await writeFile(join(dir, "validation-result.json"), "{}");
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /clauseId must be a non-empty string/);
  assert.match(result.stderr, /proposalLocator must be a non-empty string/);
});

test("rejects an Authority clause missing its complete traceability chain", async () => {
  const dir = await root();
  const proposal = Buffer.from("# Proposal\n\n## Proposed decision\n\nClause A from source:input.md#rule.\n");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "proposal.md"), proposal);
  await writeFile(join(dir, "authority-set", "authority.md"), "# Authority\n\n<!-- clause-id: A -->\n## A\n\nClause A.\n");
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: "decision-a", repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
  }));
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1, outcome: "Adopt",
    proposal: { path: "proposal.md", revision: "abc123", sha256: digest(proposal) },
    owner: "owner", authorizationEvidence: "record:1", decisionDate: "2026-09-29", scope: "A",
    applicabilityConditions: [], exceptions: [],
    adoptedContent: [{ clauseId: "A", proposalLocator: "Proposed decision" }], amendedContent: null
  }));
  await writeFile(join(dir, "traceability.md"), [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    "| A | clause-id:A | Adopt | wrong-record | abc123 | absent locator | missing source |"
  ].join("\n"));
  await writeFile(join(dir, "validation-result.json"), "{}");
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /authorizationEvidence must match/);
  assert.match(result.stderr, /proposalLocator must match adoptedContent/);
  assert.match(result.stderr, /sourceEvidenceLocator\(s\) must each occur/);
});

test("rejects a clause omitted from traceability.md", async () => {
  const dir = await root();
  const proposal = Buffer.from("# Proposal\n\n## Proposed decision\n\nClauses A and B from source:input.md#rules.\n");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "proposal.md"), proposal);
  await writeFile(join(dir, "authority-set", "authority.md"), "# Authority\n\n<!-- clause-id: A -->\nA.\n\n<!-- clause-id: B -->\nB.\n");
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: "decision-a", repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
  }));
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1, outcome: "Adopt",
    proposal: { path: "proposal.md", revision: "abc123", sha256: digest(proposal) },
    owner: "owner", authorizationEvidence: "record:1", decisionDate: "2026-09-29", scope: "A",
    applicabilityConditions: [], exceptions: [],
    adoptedContent: [
      { clauseId: "A", proposalLocator: "Proposed decision" },
      { clauseId: "B", proposalLocator: "Proposed decision" }
    ], amendedContent: null
  }));
  await writeFile(join(dir, "traceability.md"), [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    "| A | clause-id:A | Adopt | record:1 | abc123 | Proposed decision | source:input.md#rules |"
  ].join("\n"));
  await writeFile(join(dir, "validation-result.json"), "{}");
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Authority clause B is missing from traceability\.md/);
});

test("rejects manifest member IDs outside Gatekeeper's stable-ID syntax", async () => {
  for (const memberId of ["", "Decision-A", "decision_a", `a${"b".repeat(64)}`]) {
    const dir = await root();
    await writeValidAdoptPackage(dir, { memberId });
    const result = run(dir);
    assert.equal(result.status, 1, `expected ${JSON.stringify(memberId)} to fail`);
    assert.match(result.stderr, /manifest member id must be a Gatekeeper stable ID/);
  }
});

test("requires every validation result dimension and explicit unevaluated states", async () => {
  const cases = [
    {
      mutate: (result) => { delete result.gatekeeperCompatibility; },
      expected: /validation-result keys must be exactly:/
    },
    {
      mutate: (result) => { result.gatekeeperCompatibility.status = "pending"; },
      expected: /gatekeeperCompatibility\.status must be "pass", "fail", or "not-run"/
    },
    {
      mutate: (result) => { result.semanticFidelity = {}; },
      expected: /semanticFidelity\.status must be "pass", "fail", or "pending"/
    },
    {
      mutate: (result) => { result.consumerActivation.status = "unknown"; },
      expected: /consumerActivation\.status must be "performed" or "not-performed"/
    }
  ];

  for (const { mutate, expected } of cases) {
    const dir = await root();
    const validationResult = {
      schemaVersion: 1,
      packageStructure: "pass",
      referenceBounds: "pass",
      clauseTraceability: "pass",
      gatekeeperCompatibility: { status: "not-run", pinnedRevision: null },
      semanticFidelity: { status: "pending" },
      consumerActivation: { status: "not-performed" }
    };
    mutate(validationResult);
    await writeValidAdoptPackage(dir, { validationResult });
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, expected);
  }
});

test("rejects a non-object validation result", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir, { validationResult: null });
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /validation-result must be an object/);
});
