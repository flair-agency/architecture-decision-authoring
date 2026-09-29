import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const validator = fileURLToPath(new URL("./validate-decision-package.mjs", import.meta.url));
const digest = (value) => createHash("sha256").update(value).digest("hex");
const proposalRevision = "0123456789abcdef0123456789abcdef01234567";

async function root() {
  const container = await mkdtemp(join(tmpdir(), "decision-package-test-"));
  const dir = join(container, "decision-package");
  await mkdir(dir);
  return dir;
}

function run(path) {
  return spawnSync(process.execPath, [validator, path], { encoding: "utf8" });
}

async function writeValidAdoptPackage(dir, {
  memberId = "decision-a", validationResult, revision = proposalRevision, outcome = "Adopt",
  applicabilityConditions = [], exceptions = [], recordOverrides = {}
} = {}) {
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
    outcome,
    proposal: { path: "proposal.md", revision, sha256: digest(proposal) },
    owner: "owner",
    authorizationEvidence: "record:1",
    decisionDate: "2026-09-29",
    scope: "decision A",
    applicabilityConditions,
    exceptions,
    adoptedContent: outcome === "Adopt" ? [{ clauseId: "A", proposalLocator: "Proposed decision" }] : [],
    amendedContent: null,
    ...recordOverrides
  }));
  await writeFile(join(dir, "traceability.md"), [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | ${outcome} | record:1 | ${revision} | Proposed decision | source:input.md#rule |`
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
    proposal: { path: "proposal.md", revision: proposalRevision, sha256: digest(proposal) },
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
    `| amended-a | clause-id:amended-a | Amend | record:1 | ${proposalRevision} | Owner-approved amendment | source:input.md#rule |`
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
    proposal: { path: "authority-set/authority.md", revision: proposalRevision, sha256: digest(authority) },
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
    proposal: { path: "proposal.md", revision: proposalRevision, sha256: digest(proposal) },
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
    proposal: { path: "proposal.md", revision: proposalRevision, sha256: digest(proposal) },
    owner: "owner", authorizationEvidence: "record:1", decisionDate: "2026-09-29", scope: "A",
    applicabilityConditions: [], exceptions: [],
    adoptedContent: [{ clauseId: "A", proposalLocator: "Proposed decision" }], amendedContent: null
  }));
  await writeFile(join(dir, "traceability.md"), [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | wrong-record | ${proposalRevision} | absent locator | missing source |`
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
    proposal: { path: "proposal.md", revision: proposalRevision, sha256: digest(proposal) },
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
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rules |`
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

test("rejects manifest roots that are not JSON objects", async () => {
  for (const invalidManifest of [false, 0, "", [], null]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify(invalidManifest));
    const result = run(dir);
    assert.equal(result.status, 1, `expected ${JSON.stringify(invalidManifest)} to fail`);
    assert.match(result.stderr, /manifest must be an object/);
  }
});

test("requires proposal.revision to be an immutable full Git commit ID", async () => {
  for (const revision of ["", "main", "abc123", "g".repeat(40)]) {
    const dir = await root();
    await writeValidAdoptPackage(dir, { revision });
    const result = run(dir);
    assert.equal(result.status, 1, `expected ${JSON.stringify(revision)} to fail`);
    assert.match(result.stderr, /proposal\.revision must be a full 40- or 64-character immutable Git commit ID/);
  }
});

test("rejects unknown owner outcomes", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir, { outcome: "Approve" });
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /outcome must be one of "Adopt", "Amend", "Defer", or "Reject"/);
});

test("rejects a package file symlink that resolves outside the package", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const externalProposal = join(dir, "..", "outside-proposal.md");
  await writeFile(externalProposal, "external proposal");
  await unlink(join(dir, "proposal.md"));
  await symlink(externalProposal, join(dir, "proposal.md"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /proposal\.path resolves outside its allowed root/);
});

test("rejects a selector member symlink that resolves outside the repository", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const externalAuthority = join(dir, "..", "..", "outside-authority.md");
  await writeFile(externalAuthority, "external authority");
  await unlink(join(dir, "authority-set", "authority.md"));
  await symlink(externalAuthority, join(dir, "authority-set", "authority.md"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /resolves outside its allowed root/);
});

test("does not count clause ID examples inside fenced code", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority",
    "",
    "```markdown",
    "<!-- clause-id: A -->",
    "Clause A in an example only.",
    "```"
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /authority\.md must identify every normative clause/);
});

test("rejects clause-id-like HTML comments outside fenced code when the marker grammar is invalid", async () => {
  for (const malformedMarker of ["<!-- clause-id: -->", "<!-- clause-id: A B -->", "<!-- clause-id A -->"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      malformedMarker,
      "## A",
      "Clause A."
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1, `expected ${malformedMarker} to fail`);
    assert.match(result.stderr, /authority clause ID comment must match the standalone/);
  }
});

test("requires every clause marker to be immediately followed by a Markdown clause", async () => {
  const invalidAuthority = [
    "# Authority\n\n<!-- clause-id: A -->",
    "# Authority\n\n<!-- clause-id: A -->\n\n## A\n\nClause A.",
    "# Authority\n\n<!-- clause-id: A -->\n```markdown\nClause A.\n```",
    "# Authority\n\n<!-- clause-id: A -->\n## A\n"
  ];
  for (const authority of invalidAuthority) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), authority);
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /must be a standalone marker immediately before a normative Markdown clause/);
  }
});

test("requires applicability conditions and exceptions to use the adopted array-of-strings representation", async () => {
  for (const key of ["applicabilityConditions", "exceptions"]) {
    for (const value of [null, 7, {}, "none", [" ", "valid"], [{}]]) {
      const dir = await root();
      await writeValidAdoptPackage(dir, { [key]: value });
      const result = run(dir);
      assert.equal(result.status, 1, `expected ${key}=${JSON.stringify(value)} to fail`);
      assert.match(result.stderr, new RegExp(`${key}(?: must be an array of non-empty strings|\\[0\\] must be a non-empty string)`));
    }
  }
});

test("valid Defer and Reject records pass common checks without producing a package", async () => {
  for (const outcome of ["Defer", "Reject"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir, { outcome });
    await unlink(join(dir, "authority-set", "authority.md"));
    await unlink(join(dir, "authority-set", "manifest.json"));
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /no-export outcome is fail-closed/);
  }
});

test("rejects invalid common adoption-record fields for Defer and Reject", async () => {
  const cases = [
    [{ schemaVersion: null }, /schemaVersion must be 1/],
    [{ owner: null }, /owner must be a non-empty string/],
    [{ authorizationEvidence: 0 }, /authorizationEvidence must be a non-empty string/],
    [{ proposal: null }, /proposal must be an object/],
    [{ scope: {} }, /scope must be a non-empty string/],
    [{ decisionDate: "2026-02-30" }, /decisionDate must be a valid YYYY-MM-DD date/],
    [{ applicabilityConditions: null }, /applicabilityConditions must be an array of non-empty strings/],
    [{ exceptions: 3 }, /exceptions must be an array of non-empty strings/]
  ];

  for (const outcome of ["Defer", "Reject"]) {
    for (const [recordOverrides, expected] of cases) {
      const dir = await root();
      await writeValidAdoptPackage(dir, { outcome, recordOverrides });
      await unlink(join(dir, "authority-set", "authority.md"));
      await unlink(join(dir, "authority-set", "manifest.json"));
      const result = run(dir);
      assert.equal(result.status, 1, `${outcome} should reject ${Object.keys(recordOverrides)[0]}`);
      assert.match(result.stderr, expected);
    }
  }
});
