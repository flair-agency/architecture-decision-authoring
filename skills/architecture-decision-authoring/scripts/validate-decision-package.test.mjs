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

test("accepts a bounded Adopt package", async () => {
  const dir = await root();
  const proposal = Buffer.from("# Proposal\n\nAdopt clause A.\n");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "proposal.md"), proposal);
  await writeFile(join(dir, "authority-set", "authority.md"), "# Authority\n\n## A\n\nClause A.\n");
  await writeFile(join(dir, "authority-set", "manifest.json"), JSON.stringify({
    version: 1,
    authorities: [{ id: "decision-a", repository: "self", revision: "authority-revision", path: "decision-package/authority-set/authority.md" }]
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
  await writeFile(join(dir, "traceability.md"), "| Clause | Source |\n| --- | --- |\n| A | proposal.md |\n");
  await writeFile(join(dir, "validation-result.json"), JSON.stringify({ structure: "pass" }));
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
  const proposal = Buffer.from("proposal");
  const snapshot = Buffer.from("approved authority");
  await mkdir(join(dir, "authority-set"));
  await writeFile(join(dir, "proposal.md"), proposal);
  await writeFile(join(dir, "approved.md"), snapshot);
  await writeFile(join(dir, "authority-set", "authority.md"), "rewritten authority");
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
  await writeFile(join(dir, "traceability.md"), "trace");
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
