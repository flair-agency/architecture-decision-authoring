import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile } from "node:fs/promises";
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
  for (const args of [
    ["init", "-q"], ["config", "user.name", "Package Validator Test"],
    ["config", "user.email", "validator-test@example.invalid"]
  ]) {
    const result = spawnSync("git", args, { cwd: container, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  return dir;
}

function run(path, repositoryRoot = join(path, "..")) {
  return spawnSync(process.execPath, [validator, path, repositoryRoot], { encoding: "utf8" });
}

async function commitProposal(dir, proposal) {
  await writeFile(join(dir, "proposal.md"), proposal);
  const repositoryRoot = join(dir, "..");
  for (const args of [["add", "--", "decision-package/proposal.md"], ["commit", "-q", "-m", "proposal snapshot"]]) {
    const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  const revision = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" });
  assert.equal(revision.status, 0, revision.stderr);
  return revision.stdout.trim();
}

async function writeValidAdoptPackage(dir, {
  memberId = "decision-a", validationResult, revision, outcome = "Adopt",
  applicabilityConditions = [], exceptions = [], recordOverrides = {}
} = {}) {
  const proposal = Buffer.from("# Proposal\n\n## Proposed decision\n\nAdopt clause A, based on source:input.md#rule.\n");
  const actualRevision = revision ?? await commitProposal(dir, proposal);
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "authority-set", "authority.md"), "# Authority\n\n<!-- clause-id: A -->\n## A\n\nClause A.\n");
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: memberId, repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
  }));
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1,
    status: "Decided",
    outcome,
    proposal: { path: "proposal.md", revision: actualRevision, sha256: digest(proposal) },
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
    `| A | clause-id:A | ${outcome} | record:1 | ${actualRevision} | Proposed decision | source:input.md#rule |`
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

async function writePendingPackage(dir, { recordOverrides = {}, staleAuthority = false } = {}) {
  const proposal = Buffer.from("# Proposal\n\nOwner decision not yet recorded.\n");
  const revision = await commitProposal(dir, proposal);
  if (staleAuthority) {
    await mkdir(join(dir, "authority-set"));
    await writeFile(join(dir, "authority-set", "authority.md"), "# stale member\n");
  }
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1,
    status: "Pending",
    outcome: null,
    proposal: { path: "proposal.md", revision, sha256: digest(proposal) },
    ...recordOverrides
  }));
}

test("accepts a minimal Pending record bound to exact Proposal bytes", async () => {
  const dir = await root();
  await writePendingPackage(dir);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /pending adoption is fail-closed/);
});

test("preserves and validates Proposal bytes containing CRLF line endings", async () => {
  const dir = await root();
  const proposal = Buffer.from("# Proposal\r\n\r\nOwner decision not yet recorded.\r\n");
  const revision = await commitProposal(dir, proposal);
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1, status: "Pending", outcome: null,
    proposal: { path: "proposal.md", revision, sha256: digest(proposal) }
  }));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readFile(join(dir, "proposal.md")), proposal);
});

test("rejects Pending records with fabricated decision fields", async () => {
  for (const field of [
    { owner: "owner" }, { authorizationEvidence: "record:1" }, { decisionDate: "2026-09-29" },
    { scope: "decision A" }, { applicabilityConditions: [] }, { exceptions: [] },
    { adoptedContent: [] }, { amendedContent: null }
  ]) {
    const dir = await root();
    await writePendingPackage(dir, { recordOverrides: field });
    const result = run(dir);
    assert.equal(result.status, 1, `expected ${Object.keys(field)[0]} to fail`);
    assert.match(result.stderr, /pending adoption record keys must be exactly:/);
  }
});

test("rejects inconsistent or unknown adoption states", async () => {
  const cases = [
    [{ outcome: "Adopt" }, /Pending adoption record outcome must be null/],
    [{ status: "Decided", outcome: null }, /Decided adoption record outcome must be one of/],
    [{ status: "Decided", outcome: "Pending" }, /Decided adoption record outcome must be one of/],
    [{ status: "Unknown", outcome: "Adopt" }, /status must be "Pending" or "Decided"/]
  ];

  for (const [recordOverrides, expected] of cases) {
    const dir = await root();
    await writePendingPackage(dir, { recordOverrides });
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, expected);
  }
});

test("rejects a stale Authority member in a Pending package", async () => {
  const dir = await root();
  await writePendingPackage(dir, { staleAuthority: true });
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Pending adoption must not leave a consumable Authority Set/);
});

test("continues to accept valid legacy decided records without status", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const recordPath = join(dir, "adoption-record.json");
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  delete record.status;
  await writeFile(recordPath, JSON.stringify(record));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("accepts a bounded Adopt package", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects absolute selector member paths across POSIX and Windows forms", async () => {
  const absolutePaths = [
    (dir) => join(dir, "authority-set", "authority.md"),
    () => "C:\\repo\\decision-package\\authority-set\\authority.md",
    () => "\\\\server\\share\\decision-package\\authority-set\\authority.md"
  ];

  for (const absolutePath of absolutePaths) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const manifestPath = join(dir, "authority-set", "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.authorities[0].path = absolutePath(dir);
    await writeFile(manifestPath, JSON.stringify(manifest));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /manifest member path must be relative to its allowed root/);
  }
});

test("rejects absolute adoption-record paths across POSIX and Windows forms", async () => {
  const absolutePaths = [
    (dir) => join(dir, "proposal.md"),
    () => "C:\\repo\\decision-package\\proposal.md",
    () => "\\\\server\\share\\decision-package\\proposal.md"
  ];

  for (const absolutePath of absolutePaths) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const recordPath = join(dir, "adoption-record.json");
    const record = JSON.parse(await readFile(recordPath, "utf8"));
    record.proposal.path = absolutePath(dir);
    await writeFile(recordPath, JSON.stringify(record));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /proposal\.path must be relative to its allowed root/);
  }
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

test("does not treat valid backtick or tilde fenced tables as the package table", async () => {
  for (const [fence, closer] of [["```markdown", "```"], ["~~~markdown", "~~~"]]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "traceability.md"), [
      fence,
      "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rules |`,
      closer
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /must contain the required traceability table header/);
  }
});

test("does not let invalid backtick fence info mask visible Authority text", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority",
    "",
    "<!-- clause-id: A -->",
    "## A",
    "```bad`",
    "Clause A remains visible text."
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("does not treat indented traceability table examples as the package table", async () => {
  const table = [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`
  ];

  for (const indent of ["    ", "\t"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "traceability.md"), table.map((line) => `${indent}${line}`).join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /must contain the required traceability table header/);
  }
});

test("does not treat a traceability table inside a raw HTML block as the package table", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "traceability.md"), [
    "<div>",
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`,
    "</div>"
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain the required traceability table header/);
});

test("does not treat a traceability table inside a list-item raw HTML block as the package table", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "traceability.md"), [
    "- <div>",
    "  | Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "  | --- | --- | --- | --- | --- | --- | --- |",
    `  | A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain the required traceability table header/);
});

test("recognizes every CommonMark type 6 tag including noframes", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "traceability.md"), [
    "<noframes>",
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain the required traceability table header/);
});

test("uses CommonMark LF, CRLF, and CR line endings when finding traceability tables", async () => {
  for (const lineEnding of ["\n", "\r\n", "\r"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const record = JSON.parse(await readFile(join(dir, "adoption-record.json"), "utf8"));
    const traceability = [
      "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      `| A | clause-id:A | Adopt | record:1 | ${record.proposal.revision} | Proposed decision | source:input.md#rule |`
    ].join(lineEnding);
    await writeFile(join(dir, "traceability.md"), traceability);
    const result = run(dir);
    assert.equal(result.status, 0, `${JSON.stringify(lineEnding)}: ${result.stderr}`);
  }
});

test("does not parse traceability tables following a complete HTML tag with a quoted greater-than sign", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "traceability.md"), [
    '<x a=">">',
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain the required traceability table header/);
});

test("recognizes CommonMark raw HTML openers without same-line closing angle brackets", async () => {
  for (const tag of ["pre", "script", "style", "textarea", "div"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "traceability.md"), [
      `<${tag}`,
      "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`,
      `</${tag}>`
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1, `${tag} opener must begin a raw HTML block`);
    assert.match(result.stderr, /must contain the required traceability table header/);
  }
});

test("recognizes incomplete type-1 raw HTML openers in Authority content", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority",
    "",
    "<!-- clause-id: A -->",
    "## A",
    "Clause A.",
    "",
    "<pre",
    "untraceable raw HTML content"
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /authority\.md must not contain raw HTML blocks/);
});

test("stops traceability row collection when the table ends", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const traceabilityPath = join(dir, "traceability.md");
  const original = await readFile(traceabilityPath, "utf8");
  await writeFile(traceabilityPath, `${original}\n\n| detached | clause-id:B | Reject | fake | fake | fake | fake |\n`);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("does not treat a commented-out traceability table as the package table", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "traceability.md"), [
    "<!--",
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`,
    "-->"
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain the required traceability table header/);
});

test("does not reinterpret a table header suffix after a line-leading HTML comment", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "traceability.md"), [
    "<!-- comment -->| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain the required traceability table header/);
});

test("does not accept traceability separators or rows after line-leading HTML comments", async () => {
  const tableHeader = "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |";
  const separator = "| --- | --- | --- | --- | --- | --- | --- |";
  const row = `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`;
  for (const table of [
    [tableHeader, "<!-- comment -->" + separator, row],
    [tableHeader, separator, "<!-- comment -->" + row]
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "traceability.md"), table.join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /(?:must have a Markdown separator row|Authority clause A is missing from traceability\.md)/);
  }
});

test("ignores a commented-out extra traceability row", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const traceabilityPath = join(dir, "traceability.md");
  const original = await readFile(traceabilityPath, "utf8");
  await writeFile(traceabilityPath, `${original}\n<!-- | B | clause-id:B | Adopt | fake | ${proposalRevision} | fake | fake | -->\n`);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
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

test("binds the Proposal bytes to the exact committed revision even when the package digest is updated", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const proposalPath = join(dir, "proposal.md");
  const changedProposal = Buffer.concat([await readFile(proposalPath), Buffer.from("\nChanged after the recorded revision.\n")]);
  await writeFile(proposalPath, changedProposal);
  const recordPath = join(dir, "adoption-record.json");
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  record.proposal.sha256 = digest(changedProposal);
  await writeFile(recordPath, JSON.stringify(record));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /bundled Proposal bytes do not match proposal\.md at proposal\.revision/);
});

test("rejects nonexistent revisions, non-commit objects, and missing Proposal blobs", async () => {
  const nonexistent = await root();
  await writeValidAdoptPackage(nonexistent);
  const nonexistentRecordPath = join(nonexistent, "adoption-record.json");
  const nonexistentRecord = JSON.parse(await readFile(nonexistentRecordPath, "utf8"));
  nonexistentRecord.proposal.revision = "f".repeat(40);
  await writeFile(nonexistentRecordPath, JSON.stringify(nonexistentRecord));
  let result = run(nonexistent);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /proposal\.revision must identify a locally available Git commit/);

  const nonCommit = await root();
  await writeValidAdoptPackage(nonCommit);
  const nonCommitRecordPath = join(nonCommit, "adoption-record.json");
  const nonCommitRecord = JSON.parse(await readFile(nonCommitRecordPath, "utf8"));
  const blobId = spawnSync("git", ["rev-parse", `${nonCommitRecord.proposal.revision}:decision-package/proposal.md`], {
    cwd: join(nonCommit, ".."), encoding: "utf8"
  }).stdout.trim();
  nonCommitRecord.proposal.revision = blobId;
  await writeFile(nonCommitRecordPath, JSON.stringify(nonCommitRecord));
  result = run(nonCommit);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /proposal\.revision must identify a locally available Git commit/);

  const missingBlob = await root();
  await writeValidAdoptPackage(missingBlob);
  const missingRecord = JSON.parse(await readFile(join(missingBlob, "adoption-record.json"), "utf8"));
  const missingBlobId = spawnSync("git", ["rev-parse", `${missingRecord.proposal.revision}:decision-package/proposal.md`], {
    cwd: join(missingBlob, ".."), encoding: "utf8"
  }).stdout.trim();
  await unlink(join(missingBlob, "..", ".git", "objects", missingBlobId.slice(0, 2), missingBlobId.slice(2)));
  result = run(missingBlob);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /(?:must contain proposal\.md as a regular file blob|readable tree and Proposal blob|Proposal blob is missing)/);
});

test("requires repositoryRoot to be the exact Git top-level directory", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const result = run(dir, dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /repositoryRoot must be the exact Git top-level directory/);
  const missing = spawnSync(process.execPath, [validator, dir], { encoding: "utf8" });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /repositoryRoot argument is required/);
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
  for (const [fence, closer] of [["```markdown", "```"], ["~~~markdown", "~~~"]]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      fence,
      "<!-- clause-id: A -->",
      "Clause A in an example only.",
      closer
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /authority\.md must identify every normative clause/);
  }
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
    assert.match(result.stderr, /(?:must be a standalone marker immediately before a normative Markdown clause|must contain Markdown clause content)/);
  }
});

test("rejects unmarked headings and content outside bounded Authority clause blocks", async () => {
  const invalidAuthority = [
    "# Authority\n\n<!-- clause-id: A -->\n## A\nClause A.\n\n## Unmarked\nNormative content.",
    "# Authority\n\n<!-- clause-id: A -->\n## A\nClause A.\n\n### Unmarked nested requirement\nMust remain covered.",
    "# Authority\n\nUnmarked normative content.\n\n<!-- clause-id: A -->\n## A\nClause A."
  ];
  for (const authority of invalidAuthority) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), authority);
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /(?:immediately preceded by a clause-id marker|content outside a marked clause block|only marked level-two clause headings)/);
  }
});

test("rejects an empty ATX heading as an unmarked nested Authority heading", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority", "", "<!-- clause-id: A -->", "## A", "Clause A.", "###", "Hidden requirement."
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /only marked level-two clause headings/);
});

test("recognizes Authority headings and clause markers separated by bare CR line endings", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority", "", "<!-- clause-id: A -->", "## A", "Clause A.", "###", "Hidden requirement."
  ].join("\r"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /only marked level-two clause headings/);
});

test("rejects headings nested in Markdown blockquote and list containers", async () => {
  for (const nestedHeading of ["> ## Quoted heading", ">  ## Quoted heading with two spaces", ">   ## Quoted heading with three spaces", "- ## List heading", "1. ## Ordered-list heading", "> - ### Nested heading", "- List item\n    ## Indented list heading", "- item\n  continuation\n    ## Continued-list heading", "- item\n\t## Tab-indented list heading"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      "<!-- clause-id: A -->",
      "## A",
      "Clause A.",
      nestedHeading,
      "Normative content."
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1, `expected ${nestedHeading} to fail`);
    assert.match(result.stderr, /must not place headings inside Markdown blockquote or list containers/);
  }
});

test("rejects Setext headings and ambiguous horizontal rules in Authority members", async () => {
  for (const underline of ["===", "---"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      "<!-- clause-id: A -->",
      "## A",
      "Clause A is normative.",
      "Unmarked subsection",
      underline
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /(?:must not use Setext headings or ambiguous horizontal rules|must not use Markdown thematic breaks)/);
  }
});

test("rejects spaced CommonMark thematic breaks instead of counting them as clause text", async () => {
  const validDir = await root();
  await writeValidAdoptPackage(validDir);
  const validResult = run(validDir);
  assert.equal(validResult.status, 0, validResult.stderr);

  for (const thematicBreak of ["* * *", "_ _ _", "- - -", "***", "___"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      "<!-- clause-id: A -->",
      "## A",
      thematicBreak
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1, `${JSON.stringify(thematicBreak)} must not satisfy the clause body`);
    assert.match(result.stderr, /must not use Markdown thematic breaks as clause content/);
  }
});

test("requires visible clause text instead of a link reference definition", async () => {
  for (const referenceDefinition of [
    "[rule]: https://example.invalid/rule",
    "[rule]: <https://example.invalid/rule> \"Reference title\""
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      "<!-- clause-id: A -->",
      "## A",
      referenceDefinition
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Authority clause A must contain Markdown clause content/);
  }

  const validDir = await root();
  await writeValidAdoptPackage(validDir);
  await writeFile(join(validDir, "authority-set", "authority.md"), [
    "# Authority",
    "",
    "<!-- clause-id: A -->",
    "## A",
    "Requests must use TLS.",
    "[tls]: https://example.invalid/tls"
  ].join("\n"));
  const validResult = run(validDir);
  assert.equal(validResult.status, 0, validResult.stderr);
});

test("rejects multiline link reference definitions as clause body by themselves", async () => {
  const definitions = [
    ["[rule]:", "  https://example.invalid/rule"],
    ["[rule]:", "  <https://example.invalid/rule>", "  \"Reference title\""],
    ["[rule]: https://example.invalid/rule", "  \"Reference title\""]
  ];

  for (const definition of definitions) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      "<!-- clause-id: A -->",
      "## A",
      ...definition
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Authority clause A must contain Markdown clause content/);
  }
});

test("accepts visible clause text followed by a multiline link reference definition", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority",
    "",
    "<!-- clause-id: A -->",
    "## A",
    "Requests must use TLS.",
    "[tls]:",
    "  https://example.invalid/tls",
    "  \"TLS reference\""
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects raw HTML blocks in Authority members outside or inside clauses", async () => {
  const invalidAuthority = [
    [
      "# Authority",
      "",
      "<div>",
      "Normative rule rendered outside all marked clauses.",
      "</div>",
      "",
      "<!-- clause-id: A -->",
      "## A",
      "Clause A."
    ],
    [
      "# Authority",
      "",
      "<!-- clause-id: A -->",
      "## A",
      "Clause A.",
      "<div>",
      "Additional normative rule in raw HTML.",
      "</div>"
    ]
  ];

  for (const lines of invalidAuthority) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), lines.join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /authority\.md must not contain raw HTML blocks/);
  }
});

test("checks visible Authority text on lines with inline HTML comments", async () => {
  for (const line of [
    "Unmarked text before <!-- ignored comment -->.",
    "<!-- ignored comment --> unmarked text after."
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority",
      "",
      line,
      "",
      "<!-- clause-id: A -->",
      "## A",
      "Clause A."
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /content outside a marked clause block/);
  }
});

test("does not let a line-leading HTML comment turn a visible fence opener into masking", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority",
    "",
    "<!-- clause-id: A -->",
    "## A",
    "Clause A.",
    "<!-- comment -->```markdown",
    "## Unmarked",
    "Unmarked normative content.",
    "```"
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /authority\.md must not place content after a line-leading HTML comment/);
  assert.match(result.stderr, /must be immediately preceded by a clause-id marker/);
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
