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

test("does not treat fenced tables inside list or blockquote containers as the package table", async () => {
  const table = [
    "| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    `| A | clause-id:A | Adopt | record:1 | ${proposalRevision} | Proposed decision | source:input.md#rule |`
  ];
  for (const embedded of [
    ["- ```markdown", ...table.map((line) => `  ${line}`), "  ```"],
    ["> ```markdown", ...table.map((line) => `> ${line}`), "> ```"],
    ["> - ```markdown", ...table.map((line) => `>   ${line}`), ">   ```"]
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "traceability.md"), embedded.join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1, `expected embedded example to be ignored: ${embedded[0]}`);
    assert.match(result.stderr, /must contain the required traceability table header/);
  }
});

test("keeps nested blockquote depth when closing a fenced Authority example", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), [
    "# Authority", "", "<!-- clause-id: A -->", "## A", "Clause A.",
    "> > ```markdown", "> > hidden example", "> > ```", "> > ### Hidden requirement"
  ].join("\n"));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must not place headings inside Markdown blockquote or list containers/);
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

test("does not count empty Markdown list and blockquote containers as Authority clause text", async () => {
  for (const emptyContainer of ["-", ">", "1.", "> -"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), [
      "# Authority", "", "<!-- clause-id: A -->", "## A", emptyContainer
    ].join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1, `${JSON.stringify(emptyContainer)} cannot supply normative clause text`);
    assert.match(result.stderr, /must not use an empty Markdown blockquote or list container as clause content/);
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

test("requires Defer and Reject records to have no adopted or amended content", async () => {
  for (const outcome of ["Defer", "Reject"]) {
    for (const [recordOverrides, expected] of [
      [{ adoptedContent: [{ clauseId: "A", proposalLocator: "Proposed decision" }] }, /requires adoptedContent: \[\]/],
      [{ amendedContent: { path: "amended-content.md", sha256: "0".repeat(64) } }, /requires amendedContent: null/]
    ]) {
      const dir = await root();
      await writeValidAdoptPackage(dir, { outcome, recordOverrides });
      await unlink(join(dir, "authority-set", "authority.md"));
      await unlink(join(dir, "authority-set", "manifest.json"));
      const result = run(dir);
      assert.equal(result.status, 1, `${outcome} must reject fabricated content`);
      assert.match(result.stderr, expected);
    }
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

test("rejects GFM table rows that would silently discard or pad columns", async () => {
  for (const change of [
    (row) => row + " extra |",
    (row) => row.slice(0, row.lastIndexOf("|", row.length - 2)) + "|"
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, "traceability.md");
    const lines = (await readFile(path, "utf8")).split("\n");
    lines[2] = change(lines[2]);
    await writeFile(path, lines.join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /row 3 must have 7 columns/);
  }
});

test("reads escaped GFM pipes as cell content without changing evidence strings", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir, { recordOverrides: { authorizationEvidence: "record:1|approved" } });
  const path = join(dir, "traceability.md");
  await writeFile(path, (await readFile(path, "utf8")).replace("record:1", "record:1\\|approved"));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("ignores container tables rather than flattening them into package data", async () => {
  for (const container of [
    (lines) => lines.map((line) => `> ${line}`),
    (lines) => ["- Evidence example", "", ...lines.map((line) => `  ${line}`)]
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, "traceability.md");
    await writeFile(path, container((await readFile(path, "utf8")).split("\n")).join("\n"));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /must contain the required traceability table header/);
  }
});

test("rejects two matching package tables instead of choosing one silently", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const path = join(dir, "traceability.md");
  const table = await readFile(path, "utf8");
  await writeFile(path, `${table}\n\n${table}\n`);
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must contain exactly one required traceability table/);
});

test("does not count fenced, indented, or comment-only clause bodies as visible text", async () => {
  for (const body of ["```\nexample only\n```", "    example only", "<!-- explanation only -->", "> <!-- explanation only -->"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), `# Authority\n\n<!-- clause-id: A -->\n## A\n\n${body}\n`);
    const result = run(dir);
    assert.equal(result.status, 1, body);
    assert.match(result.stderr, /Authority clause A must contain Markdown clause content/);
  }
});

test("rejects nested Setext and ATX headings after mixed list/quote code examples", async () => {
  for (const body of [
    "> - item\n>   > ```\n>   > example\n>   > ```\n>   > ### Requirement",
    "- item\n\n  Subsection\n  ---"
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), `# Authority\n\n<!-- clause-id: A -->\n## A\nClause A.\n\n${body}\n`);
    const result = run(dir);
    assert.equal(result.status, 1, body);
    assert.match(result.stderr, /must not place headings inside Markdown blockquote or list containers/);
  }
});

test("does not reinterpret literal code-span or escaped markers as real clause markers", async () => {
  for (const body of ["`<!-- clause-id: example -->`", "\\<!-- clause-id: example -->"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), `# Authority\n\n<!-- clause-id: A -->\n## A\nClause A.\n\n${body}\n`);
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
  }
});

test("validates an exact approved Amend snapshot without reserializing CRLF or Markdown", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir, { outcome: "Amend" });
  const authority = Buffer.from("# Authority\r\n\r\n<!-- clause-id: A -->\r\n## A\r\n\r\n**Requests** must use `TLS`.\r\n\r\n- Preserve human status.\r\n\r\n| Field | Value |\r\n| --- | --- |\r\n| status | manual |\r\n");
  await writeFile(join(dir, "authority-set", "authority.md"), authority);
  await writeFile(join(dir, "approved.md"), authority);
  const recordPath = join(dir, "adoption-record.json");
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  record.amendedContent = { path: "approved.md", sha256: digest(authority) };
  await writeFile(recordPath, JSON.stringify(record));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readFile(join(dir, "authority-set", "authority.md")), authority);
  assert.deepEqual(await readFile(join(dir, "approved.md")), authority);
});

test("fails closed when parser nesting limits would omit untraced headings", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const authorityPath = join(dir, "authority-set", "authority.md");
  const original = await readFile(authorityPath, "utf8");
  await writeFile(authorityPath, `${original}\n${"> ".repeat(101)}## Hidden\n${"> ".repeat(101)}Must obey this untraced rule.\n`);
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /reaches the Markdown parser nesting limit/);
});

test("does not count reference titles spanning multiple lines as normative body", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  await writeFile(join(dir, "authority-set", "authority.md"), '# Authority\n\n<!-- clause-id: A -->\n## A\n[rule]: /example "First line\nsecond line"\n');
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Authority clause A must contain Markdown clause content/);
});

test("rejects illustrative code outside the bounded Authority clauses", async () => {
  for (const code of ["```\nexample only\n```", "    example only"]) {
    for (const beforeTitle of [true, false]) {
      const dir = await root();
      await writeValidAdoptPackage(dir);
      const path = join(dir, "authority-set", "authority.md");
      const original = await readFile(path, "utf8");
      await writeFile(path, beforeTitle ? `${code}\n\n${original}` : original.replace("# Authority\n", `# Authority\n\n${code}\n`));
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, beforeTitle ? /must begin with the neutral title/ : /content outside a marked clause block/);
    }
  }
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const path = join(dir, "authority-set", "authority.md");
  await writeFile(path, (await readFile(path, "utf8")) + "\n```\nillustrative example\n```\n");
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("requires Amend to assert only its approved snapshot with empty adoptedContent", async () => {
  for (const adoptedContent of [null, {}, "unused", [{ clauseId: "FAKE", proposalLocator: "fabricated" }]]) {
    const dir = await root();
    await writeValidAdoptPackage(dir, { outcome: "Amend" });
    const authority = await readFile(join(dir, "authority-set", "authority.md"));
    await writeFile(join(dir, "approved.md"), authority);
    const path = join(dir, "adoption-record.json");
    const record = JSON.parse(await readFile(path, "utf8"));
    record.amendedContent = { path: "approved.md", sha256: digest(authority) };
    record.adoptedContent = adoptedContent;
    await writeFile(path, JSON.stringify(record));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Amend requires adoptedContent: \[\]/);
  }
});

test("rejects non-delimited GFM rows without skipping subsequent rendered clauses", async () => {
  for (const suffix of [
    "\nprose",
    "\nprose\n| FAKE | clause-id:FAKE | Reject | fabricated | unrelated | fabricated | fabricated |"
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, "traceability.md");
    await writeFile(path, (await readFile(path, "utf8")) + suffix);
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /row 4 must have 7 columns/);
    if (suffix.includes("FAKE")) assert.match(result.stderr, /unknown Authority clause ID: FAKE/);
  }
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const path = join(dir, "traceability.md");
  await writeFile(path, (await readFile(path, "utf8")) + "\n\nExplanatory prose outside the table.\n");
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("does not count image alternative text alone as a normative text body", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const path = join(dir, "authority-set", "authority.md");
  await writeFile(path, '# Authority\n\n<!-- clause-id: A -->\n## A\n\n![Rule in alternative text only](diagram.png)\n');
  const invalid = run(dir);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Authority clause A must contain Markdown clause content/);
  await writeFile(path, '# Authority\n\n<!-- clause-id: A -->\n## A\n\nRequests must use TLS.\n\n![Supporting diagram](diagram.png)\n');
  const valid = run(dir);
  assert.equal(valid.status, 0, valid.stderr);
});

test("rejects default-ignorable-only bodies without rewriting meaningful Unicode text", async () => {
  for (const body of ["\u200b", "\u200c\u200d", "\u2060", "\ufe0f", "\u{e0100}", "&#x200b;", "`\u200b`", " \u200b \u2060 ", "\u0007", "\u001b"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), `# Authority\n\n<!-- clause-id: A -->\n## A\n\n${body}\n`);
    const result = run(dir);
    assert.equal(result.status, 1, JSON.stringify(body));
    assert.match(result.stderr, /Authority clause A must contain Markdown clause content/);
  }
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const authority = Buffer.from('# Authority\n\n<!-- clause-id: A -->\n## A\n\nRequests must preserve the joiner in क्\u200dष.\n');
  const path = join(dir, "authority-set", "authority.md");
  await writeFile(path, authority);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readFile(path), authority);
});

test("follows the pinned parser's table escaping for multiple backslashes before pipes", async () => {
  for (const count of [2, 3, 4]) {
    const dir = await root();
    const evidence = "record:1" + "\\".repeat(count - 1) + "|approved";
    await writeValidAdoptPackage(dir, { recordOverrides: { authorizationEvidence: evidence } });
    const path = join(dir, "traceability.md");
    const sourceCell = "record:1" + "\\".repeat(count) + "|approved";
    await writeFile(path, (await readFile(path, "utf8")).replace("record:1", sourceCell));
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
  }
});

test("rejects missing promisor objects without lazily fetching from the available remote", async () => {
  for (const object of ["commit", "blob"]) {
    const dir = await root();
    await writePendingPackage(dir);
    const repositoryRoot = join(dir, "..");
    const record = JSON.parse(await readFile(join(dir, "adoption-record.json"), "utf8"));
    const git = (args) => {
      const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
      return result.stdout.trim();
    };
    const objectId = object === "commit" ? record.proposal.revision
      : git(["rev-parse", `${record.proposal.revision}:decision-package/proposal.md`]);
    const remote = await mkdtemp(join(tmpdir(), "proposal-promisor-"));
    git(["clone", "--bare", "--quiet", "--no-hardlinks", repositoryRoot, remote]);
    git(["remote", "add", "origin", remote]);
    git(["config", "remote.origin.promisor", "true"]);
    git(["config", "remote.origin.partialclonefilter", "blob:none"]);
    const localObject = join(repositoryRoot, ".git", "objects", objectId.slice(0, 2), objectId.slice(2));
    await unlink(localObject);
    // The remote contains the missing object; even an inherited opt-in must not allow retrieval.
    const result = spawnSync(process.execPath, [validator, dir, repositoryRoot], {
      encoding: "utf8", env: { ...process.env, GIT_NO_LAZY_FETCH: "0" }
    });
    assert.equal(result.status, 1, `${object}: ${result.stdout}\n${result.stderr}`);
    assert.match(result.stderr, /locally available Git commit|missing from the local Git object database/);
    await assert.rejects(readFile(localObject), { code: "ENOENT" });
  }
});

test("rejects invisible-only decided metadata and applicability bounds", async () => {
  for (const invisible of ["\u200b", "\u200d", "\u2060", "\u0001", " \u200b\t"]) {
    for (const key of ["owner", "authorizationEvidence", "scope", "applicabilityConditions", "exceptions"]) {
      const dir = await root();
      await writeValidAdoptPackage(dir);
      const path = join(dir, "adoption-record.json");
      const record = JSON.parse(await readFile(path, "utf8"));
      record[key] = ["applicabilityConditions", "exceptions"].includes(key) ? [invisible] : invisible;
      await writeFile(path, JSON.stringify(record));
      if (key === "authorizationEvidence") {
        const table = join(dir, "traceability.md");
        await writeFile(table, (await readFile(table, "utf8")).replace("record:1", invisible));
      }
      const result = run(dir);
      assert.equal(result.status, 1, `${key}: ${JSON.stringify(invisible)} accepted`);
      assert.match(result.stderr, new RegExp(`${key}.*non-empty string`));
    }
  }
});

test("preserves meaningful decision metadata with embedded joiners", async () => {
  const dir = await root();
  const owner = "owner\u200dname";
  await writeValidAdoptPackage(dir, {
    recordOverrides: { owner, scope: "scope\u200bA" },
    applicabilityConditions: ["applies\u200dhere"], exceptions: ["except\u200bthere"]
  });
  const path = join(dir, "adoption-record.json");
  const before = await readFile(path);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readFile(path), before);
});

test("rejects conflicting and escaped duplicate JSON keys at every artifact level", async () => {
  const cases = [
    ["adoption-record.json", '"outcome":"Adopt"', '"outcome":"Reject","outcome":"Adopt"'],
    ["adoption-record.json", '"owner":"owner"', '"owner":"other","ow\\u006eer":"owner"'],
    ["adoption-record.json", '"path":"proposal.md"', '"path":"other.md","path":"proposal.md"'],
    ["adoption-record.json", '"proposal":', '"proposal":null,"proposal":'],
    ["authority-set/manifest.json", '"version":1', '"version":2,"version":1'],
    ["authority-set/manifest.json", '"repository":"self"', '"repository":"other","repository":"self"'],
    ["validation-result.json", '"packageStructure":"pass"', '"packageStructure":"fail","packageStructure":"pass"'],
    ["validation-result.json", '"status":"not-run"', '"status":"pass","status":"not-run"']
  ];
  for (const [artifact, original, duplicate] of cases) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, artifact);
    const content = await readFile(path, "utf8");
    assert.ok(content.includes(original));
    await writeFile(path, content.replace(original, duplicate));
    const result = run(dir);
    assert.equal(result.status, 1, `${artifact}: ${duplicate} accepted`);
    assert.match(result.stderr, /duplicate JSON key/);
  }
});

test("rejects JSON comments and trailing commas while allowing key-like string values", async () => {
  for (const transform of [
    (s) => s.replace('{', '{/* outcome: Reject */'),
    (s) => s.replace(/}$/, ',}')
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, "adoption-record.json");
    await writeFile(path, transform(await readFile(path, "utf8")));
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /invalid JSON/);
  }
  const dir = await root();
  await writeValidAdoptPackage(dir, { recordOverrides: { owner: 'Owner mentions "outcome":"Reject", "outcome":"Adopt"' } });
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects inline HTML that can hide Authority text while preserving literal examples", async () => {
  for (const body of [
    '<span hidden>Invisible rule</span>',
    '<span style="display:none">Invisible rule</span>',
    'Visible words <span hidden>Another rule</span>',
    'Words <style>h2, p { display:none }</style>',
    '<a href="/rule">Rule</a>'
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), `# Authority\n\n<!-- clause-id: A -->\n## A\n\n${body}\n`);
    const result = run(dir);
    assert.equal(result.status, 1, `${body} accepted`);
    assert.match(result.stderr, /must not contain raw HTML/);
  }
  for (const body of [
    'Rule. <!-- explanatory comment -->',
    '`<span hidden>literal example</span>`',
    '&lt;span hidden&gt;literal example&lt;/span&gt;',
    'Rule.\n\n```html\n<span hidden>example</span>\n```'
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    await writeFile(join(dir, "authority-set", "authority.md"), `# Authority\n\n<!-- clause-id: A -->\n## A\n\n${body}\n`);
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
  }
});

test("rejects raw HTML enclosing traceability across Markdown block boundaries", async () => {
  for (const [open, close] of [
    ['<div hidden>', '</div>'],
    ['<div style="display:none">', '</div>'],
    ['<details>', '</details>'],
    ['Before <span hidden>', '</span>'],
    ['<!-- note --><div hidden>', '</div>']
  ]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, "traceability.md");
    const table = await readFile(path, "utf8");
    await writeFile(path, `${open}\n\n${table}\n\n${close}\n`);
    const result = run(dir);
    assert.equal(result.status, 1, `${open} accepted`);
    assert.match(result.stderr, /raw HTML|content after a line-leading HTML comment/);
  }
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const path = join(dir, "traceability.md");
  const table = await readFile(path, "utf8");
  await writeFile(path, `<!-- explanation -->\n\n${table}\n\n\`<div hidden>\`\n\n\`\`\`html\n<div hidden>example</div>\n\`\`\`\n`);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects FIFO and directory inputs promptly at every package artifact boundary", async () => {
  for (const artifact of ["adoption-record.json", "proposal.md", "authority-set/authority.md", "authority-set/manifest.json", "traceability.md", "validation-result.json"]) {
    for (const type of ["fifo", "directory", "symlink-fifo"]) {
      const dir = await root();
      await writeValidAdoptPackage(dir);
      const path = join(dir, artifact);
      await unlink(path);
      if (type === "directory") await mkdir(path);
      else {
        const target = type === "symlink-fifo" ? join(dir, "input-fifo") : path;
        const result = spawnSync("mkfifo", [target], { encoding: "utf8" });
        assert.equal(result.status, 0, result.stderr);
        if (type === "symlink-fifo") await symlink(target, path);
      }
      const result = spawnSync(process.execPath, [validator, dir, join(dir, "..")], {
        encoding: "utf8", timeout: 2000
      });
      assert.equal(result.error, undefined, `${artifact} ${type}: ${result.error?.message}`);
      assert.equal(result.status, 1, result.stdout);
      assert.match(result.stderr, /must be a regular file/);
    }
  }
});

test("retains bounded symlinks to regular Authority inputs", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const path = join(dir, "authority-set", "authority.md");
  const target = join(dir, "authority-set", "approved-authority.md");
  const before = await readFile(path);
  await writeFile(target, before);
  await unlink(path);
  await symlink(target, path);
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readFile(path), before);
});

async function writePackageWithTraceValues(dir, {
  evidence = "record:1", proposalLocator = "Proposed decision", sourceLocator = "source:input.md#rule"
} = {}) {
  await writeValidAdoptPackage(dir);
  const proposal = Buffer.concat([
    await readFile(join(dir, "proposal.md")), Buffer.from(`\n${proposalLocator}\n${sourceLocator}\n`)
  ]);
  const revision = await commitProposal(dir, proposal);
  const path = join(dir, "adoption-record.json");
  const record = JSON.parse(await readFile(path, "utf8"));
  record.authorizationEvidence = evidence;
  record.proposal.revision = revision;
  record.proposal.sha256 = digest(proposal);
  record.adoptedContent[0].proposalLocator = proposalLocator;
  await writeFile(path, JSON.stringify(record));
  const tablePath = join(dir, "traceability.md");
  const header = (await readFile(tablePath, "utf8")).split("\n").slice(0, 2);
  await writeFile(tablePath, [...header,
    `| A | clause-id:A | Adopt | ${evidence} | ${revision} | ${proposalLocator} | ${sourceLocator} |`
  ].join("\n"));
}

test("rejects comment-only required traceability values even with matching raw bindings", async () => {
  for (const key of ["evidence", "proposalLocator", "sourceLocator"]) {
    const dir = await root();
    await writePackageWithTraceValues(dir, { [key]: "<!-- hidden-reference -->" });
    const result = run(dir);
    assert.equal(result.status, 1, `${key} accepted`);
    assert.match(result.stderr, /must contain text-bearing Markdown content/);
    assert.doesNotMatch(result.stderr, /must match|must occur|must each occur/);
  }
});

test("preserves traceability annotations and literal comment references with text-bearing values", async () => {
  for (const value of [
    'reference <!-- explanatory annotation -->',
    '`<!-- literal-reference -->`',
    '\\<!-- literal-reference -->'
  ]) {
    const dir = await root();
    await writePackageWithTraceValues(dir, { evidence: value, proposalLocator: value, sourceLocator: value });
    const proposalBefore = await readFile(join(dir, "proposal.md"));
    const traceBefore = await readFile(join(dir, "traceability.md"));
    const result = run(dir);
    assert.equal(result.status, 0, `${value}: ${result.stderr}`);
    assert.deepEqual(await readFile(join(dir, "proposal.md")), proposalBefore);
    assert.deepEqual(await readFile(join(dir, "traceability.md")), traceBefore);
  }
});

test("rejects malformed UTF-8 in JSON instead of silently replacing owner bytes", async () => {
  for (const invalid of [[0x80], [0xc3], [0xc0, 0x80], [0xed, 0xa0, 0x80]]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, "adoption-record.json");
    const original = await readFile(path);
    const needle = Buffer.from('"owner":"owner"');
    const at = original.indexOf(needle);
    assert.ok(at >= 0);
    await writeFile(path, Buffer.concat([
      original.subarray(0, at), Buffer.from('"owner":"'), Buffer.from(invalid),
      Buffer.from('"'), original.subarray(at + needle.length)
    ]));
    const result = run(dir);
    assert.equal(result.status, 1, `${invalid} accepted`);
    assert.match(result.stderr, /invalid UTF-8/);
  }
});

test("rejects malformed UTF-8 at every artifact read boundary", async () => {
  for (const artifact of ["proposal.md", "authority-set/authority.md", "authority-set/manifest.json", "traceability.md", "validation-result.json"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, artifact);
    const malformed = Buffer.concat([await readFile(path), Buffer.from([0x80])]);
    if (artifact === "proposal.md") {
      const revision = await commitProposal(dir, malformed);
      const recordPath = join(dir, "adoption-record.json");
      const record = JSON.parse(await readFile(recordPath, "utf8"));
      const oldRevision = record.proposal.revision;
      record.proposal.revision = revision;
      record.proposal.sha256 = digest(malformed);
      await writeFile(recordPath, JSON.stringify(record));
      const table = join(dir, "traceability.md");
      await writeFile(table, (await readFile(table, "utf8")).replace(oldRevision, revision));
    } else await writeFile(path, malformed);
    const result = run(dir);
    assert.equal(result.status, 1, `${artifact} accepted`);
    assert.match(result.stderr, /invalid UTF-8/);
  }
});

test("rejects malformed UTF-8 in an approved amendment snapshot", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const snapshotPath = join(dir, "approved-amendment.md");
  const snapshot = await readFile(join(dir, "authority-set", "authority.md"));
  await writeFile(snapshotPath, snapshot);
  const recordPath = join(dir, "adoption-record.json");
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  record.outcome = "Amend";
  record.adoptedContent = [];
  record.amendedContent = { path: "approved-amendment.md", sha256: digest(snapshot) };
  await writeFile(recordPath, JSON.stringify(record));
  const table = join(dir, "traceability.md");
  await writeFile(table, (await readFile(table, "utf8")).replace("| Adopt |", "| Amend |"));
  const valid = run(dir);
  assert.equal(valid.status, 0, valid.stderr);
  const malformed = Buffer.concat([snapshot, Buffer.from([0x80])]);
  await writeFile(snapshotPath, malformed);
  record.amendedContent.sha256 = digest(malformed);
  await writeFile(recordPath, JSON.stringify(record));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid UTF-8: approved-amendment.md/);
});

test("rejects Markdown NUL before it can equal a different recorded replacement character", async () => {
  const dir = await root();
  await writePackageWithTraceValues(dir, { evidence: "record:\ufffd1" });
  const table = join(dir, "traceability.md");
  await writeFile(table, (await readFile(table, "utf8")).replace("record:\ufffd1", "record:\u00001"));
  const result = run(dir);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, /must not contain NUL/);
  const authorityDir = await root();
  await writeValidAdoptPackage(authorityDir);
  const authority = join(authorityDir, "authority-set", "authority.md");
  await writeFile(authority, (await readFile(authority, "utf8")).replace("Clause A.", "Clause\u0000 A."));
  const invalidAuthority = run(authorityDir);
  assert.equal(invalidAuthority.status, 1);
  assert.match(invalidAuthority.stderr, /authority.md must not contain NUL/);
});

test("preserves legitimate encoded replacement characters without loss or rewriting", async () => {
  const dir = await root();
  await writePackageWithTraceValues(dir, {
    evidence: "record:\ufffd1", proposalLocator: "Proposed \ufffd decision", sourceLocator: "source:\ufffd.md#rule"
  });
  const paths = ["adoption-record.json", "proposal.md", "traceability.md"].map((p) => join(dir, p));
  const before = await Promise.all(paths.map((p) => readFile(p)));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  for (const [i, path] of paths.entries()) assert.deepEqual(await readFile(path), before[i]);
});

test("retains Proposal NUL bytes and escaped JSON controls outside Markdown parser inputs", async () => {
  const dir = await root();
  const proposal = Buffer.from("# Proposal\r\n\r\nAn illustrative embedded NUL: \u0000\r\n");
  const revision = await commitProposal(dir, proposal);
  await writeFile(join(dir, "adoption-record.json"), JSON.stringify({
    schemaVersion: 1, status: "Pending", outcome: null,
    proposal: { path: "proposal.md", revision, sha256: digest(proposal) }
  }));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(await readFile(join(dir, "proposal.md")), proposal);
  const decidedDir = await root();
  await writeValidAdoptPackage(decidedDir, { recordOverrides: { owner: "owner\u0000name" } });
  const decided = run(decidedDir);
  assert.equal(decided.status, 0, decided.stderr);
});

test("does not silently strip a JSON BOM during strict decoding", async () => {
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const path = join(dir, "adoption-record.json");
  await writeFile(path, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), await readFile(path)]));
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid JSON/);
});

test("rejects HTML comment terminators that expose hidden tags to consumers", async () => {
  for (const artifact of ["authority-set/authority.md", "traceability.md"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, artifact);
    const original = await readFile(path, "utf8");
    const payload = "<!-- note --!><div hidden>-->";
    const altered = artifact === "traceability.md"
      ? `${payload}\n\n${original}\n\n<!-- note --!></div>-->\n`
      : original.replace("Clause A.", `Clause A.\n\n${payload}\n\nUntraced rendered rule.\n\n<!-- note --!></div>-->`);
    await writeFile(path, altered);
    const result = run(dir);
    assert.equal(result.status, 1, `${artifact}: ${result.stdout}`);
    assert.match(result.stderr, /HTML comment/);
  }
});

test("rejects malformed comments only on parser HTML tokens", async () => {
  for (const comment of ["<!-->", "<!--->", "<!-- nested <!-- opener -->", "<!-- unfinished", "<!-- tail <!--->"]) {
    for (const artifact of ["authority-set/authority.md", "traceability.md"]) {
      for (const prefix of comment === "<!-- unfinished" ? [""] : ["", "Words "]) {
        const dir = await root();
        await writeValidAdoptPackage(dir);
        const path = join(dir, artifact);
        const original = await readFile(path, "utf8");
        await writeFile(path, `${original}\n\n${prefix}${comment}\n`);
        const result = run(dir);
        assert.equal(result.status, 1, `${artifact}: ${prefix}${comment} accepted`);
        assert.match(result.stderr, /malformed HTML comment/);
      }
    }
  }
});

test("preserves conforming comments and literal malformed-comment examples", async () => {
  for (const artifact of ["authority-set/authority.md", "traceability.md"]) {
    const dir = await root();
    await writeValidAdoptPackage(dir);
    const path = join(dir, artifact);
    const original = await readFile(path, "utf8");
    const examples = [
      "Words <!-- unfinished",
      "<!-- first --> <!-- second -->", "<!-- multiple\nlines -->", "<!-- foo--bar -->",
      "`<!-- note --!><div hidden>-->`", "\\<!-- note --!>&lt;div hidden&gt;--&gt;",
      "```html\n<!-- note --!><div hidden>-->\n```"
    ].join("\n\n");
    const content = Buffer.from(`${original}\n\n${examples}\n`);
    await writeFile(path, content);
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await readFile(path), content);
  }
  const dir = await root();
  await writeValidAdoptPackage(dir);
  const authority = join(dir, "authority-set/authority.md");
  await writeFile(authority, (await readFile(authority, "utf8")).replace("clause-id: A", "clause-id: foo--bar"));
  const trace = join(dir, "traceability.md");
  await writeFile(trace, (await readFile(trace, "utf8")).replace("| A | clause-id:A |", "| foo--bar | clause-id:foo--bar |"));
  const recordPath = join(dir, "adoption-record.json");
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  record.adoptedContent[0].clauseId = "foo--bar";
  await writeFile(recordPath, JSON.stringify(record));
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
});
