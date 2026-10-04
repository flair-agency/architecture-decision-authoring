import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const validator = fileURLToPath(new URL("./validate-decision-package.mjs", import.meta.url));
const proposal = Buffer.from("# Decision proposal\n\n## Chosen rule\nUse the synthetic fixture rule.\n");

async function fixture(t, outcome = "Adopt") {
  const temp = await mkdtemp(path.join(os.tmpdir(), "ada-package-validator-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const repositoryRoot = path.join(temp, "repository");
  const packageRoot = path.join(repositoryRoot, "decision-package");
  await mkdir(path.join(packageRoot, "authority-set"), { recursive: true });
  const runGit = (args) => execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
  await mkdir(repositoryRoot, { recursive: true });
  runGit(["init", "--quiet"]);
  runGit(["config", "user.name", "Synthetic Fixture"]);
  runGit(["config", "user.email", "fixture@example.invalid"]);
  await writeFile(path.join(packageRoot, "proposal.md"), proposal);
  runGit(["add", "decision-package/proposal.md"]);
  runGit(["commit", "--quiet", "-m", "Add synthetic proposal fixture"]);
  const revision = runGit(["rev-parse", "HEAD"]).trim();
  const sha256 = createHash("sha256").update(proposal).digest("hex");
  const record = {
    schemaVersion: 1,
    status: "Decided",
    outcome,
    proposal: { path: "proposal.md", revision, sha256 },
    owner: "Synthetic fixture owner (test data only)",
    authorizationEvidence: "TEST-ONLY synthetic fixture evidence",
    decisionDate: "2030-01-02",
    scope: "Validator test fixture only",
    applicabilityConditions: [],
    exceptions: []
  };
  await writeFile(path.join(packageRoot, "adoption-record.json"), JSON.stringify(record, null, 2));
  await writeFile(path.join(packageRoot, "traceability.md"), [
    "Synthetic traceability fixture; not an owner adoption.",
    "Adopt", "TEST-ONLY synthetic fixture evidence", revision,
    "Chosen rule", "synthetic-source-locator"
  ].join("\n"));
  await writeFile(path.join(packageRoot, "validation-result.json"), "{}\n");
  const authorityBytes = Buffer.from("# Authority\n\nUse the synthetic fixture rule.\n");
  if (outcome === "Adopt") {
    record.adoptedContent = ["Chosen rule"];
    record.amendedContent = null;
    await writeFile(path.join(packageRoot, "authority-set", "authority.md"), authorityBytes);
    await writeFile(path.join(packageRoot, "authority-set", "manifest.json"), JSON.stringify({
      version: 1,
      authorities: [{
        id: "synthetic-authority",
        repository: "self",
        revision: "authority-revision",
        path: "decision-package/authority-set/authority.md"
      }]
    }, null, 2));
  }
  if (outcome === "Amend") {
    record.adoptedContent = [];
    record.amendedContent = {
      path: "approved-amendment.md",
      sha256: createHash("sha256").update(authorityBytes).digest("hex")
    };
    await writeFile(path.join(packageRoot, "approved-amendment.md"), authorityBytes);
    await writeFile(path.join(packageRoot, "authority-set", "authority.md"), authorityBytes);
    await writeFile(path.join(packageRoot, "authority-set", "manifest.json"), JSON.stringify({
      version: 1,
      authorities: [{
        id: "synthetic-authority",
        repository: "self",
        revision: "authority-revision",
        path: "decision-package/authority-set/authority.md"
      }]
    }, null, 2));
  }
  await writeFile(path.join(packageRoot, "adoption-record.json"), JSON.stringify(record, null, 2));
  return { repositoryRoot, packageRoot, record, runGit };
}

function runValidator({ repositoryRoot, packageRoot }) {
  return spawnSync(process.execPath, [validator, packageRoot, repositoryRoot], { encoding: "utf8" });
}

test("accepts an Adopt package and states what it did not verify", async (t) => {
  const data = await fixture(t, "Adopt");
  const result = runValidator(data);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.packageValidation, "pass");
  assert.equal(report.clauseTraceability, "not-verified");
  assert.equal(report.ownerEvidenceAuthenticity, "not-verified");
  assert.equal(report.gatekeeperCompatibility.status, "not-run");
});

test("accepts plain Markdown Amend bytes without clause IDs only when they equal the approved snapshot", async (t) => {
  const data = await fixture(t, "Amend");
  const result = runValidator(data);
  assert.equal(result.status, 0, result.stderr);
  const authority = await readFile(path.join(data.packageRoot, "authority-set", "authority.md"));
  await writeFile(path.join(data.packageRoot, "authority-set", "authority.md"), Buffer.concat([authority, Buffer.from("changed\n")]));
  assert.notEqual(runValidator(data).status, 0);
});

test("allows an Amend snapshot symlink whose resolved file remains inside the package", async (t) => {
  const data = await fixture(t, "Amend");
  const snapshot = path.join(data.packageRoot, "approved-amendment.md");
  const alias = path.join(data.packageRoot, "approved-amendment-alias.md");
  await symlink("approved-amendment.md", alias);
  data.record.amendedContent.path = "approved-amendment-alias.md";
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  assert.equal(runValidator(data).status, 0);
  assert.equal((await readFile(snapshot)).length > 0, true);
});

test("rejects an Amend snapshot symlink that resolves outside the package", async (t) => {
  const data = await fixture(t, "Amend");
  const outsidePath = path.join(path.dirname(data.packageRoot), "outside-amendment.md");
  const snapshot = await readFile(path.join(data.packageRoot, "approved-amendment.md"));
  await writeFile(outsidePath, snapshot);
  await rm(path.join(data.packageRoot, "approved-amendment.md"));
  await symlink(path.relative(data.packageRoot, outsidePath), path.join(data.packageRoot, "approved-amendment.md"));
  const result = runValidator(data);
  assert.notEqual(result.status, 0);
  assert.match(JSON.parse(result.stdout).errors.join(" "), /resolves outside the package/);
});

test("accepts a valid legacy decided record without status or a clause ID", async (t) => {
  const data = await fixture(t, "Adopt");
  delete data.record.status;
  data.record.adoptedContent = [{ proposalLocator: "proposal.md#section-one" }];
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  assert.equal(runValidator(data).status, 0);
});

test("accepts opaque line and URI Proposal locators without interpreting their syntax", async (t) => {
  const data = await fixture(t, "Adopt");
  data.record.adoptedContent = ["proposal.md#L3-L5", { proposalLocator: "https://example.invalid/proposal#decision" }];
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  const result = runValidator(data);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).clauseTraceability, "not-verified");
});

test("accepts Pending with null outcome and known supplementary fields without export files", async (t) => {
  const data = await fixture(t, "Pending");
  data.record.status = "Pending";
  data.record.outcome = null;
  data.record.scope = "Known but undecided scope";
  data.record.applicabilityConditions = ["known condition"];
  data.record.exceptions = ["known exception"];
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  assert.equal(runValidator(data).status, 0);
});

test("rejects Pending with an outcome and leaves package bytes unchanged", async (t) => {
  const data = await fixture(t, "Pending");
  data.record.status = "Pending";
  data.record.outcome = "Defer";
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  const before = await readFile(path.join(data.packageRoot, "adoption-record.json"));
  const result = runValidator(data);
  const after = await readFile(path.join(data.packageRoot, "adoption-record.json"));
  assert.notEqual(result.status, 0);
  assert.deepEqual(after, before);
});

test("rejects a dangling stale Authority symlink for a no-export outcome", async (t) => {
  const data = await fixture(t, "Defer");
  await symlink("missing-authority-target", path.join(data.packageRoot, "authority-set", "authority.md"));
  assert.notEqual(runValidator(data).status, 0);
});

for (const outcome of ["Defer", "Reject"]) {
  test(`accepts ${outcome} only when no Authority member or manifest is present`, async (t) => {
    const data = await fixture(t, outcome);
    assert.equal(runValidator(data).status, 0);
    await writeFile(path.join(data.packageRoot, "authority-set", "manifest.json"), "{}\n");
    assert.notEqual(runValidator(data).status, 0);
  });
}

test("rejects Adopt content with no explicit Proposal locator", async (t) => {
  const data = await fixture(t, "Adopt");
  data.record.adoptedContent[0] = "  ";
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  assert.notEqual(runValidator(data).status, 0);
});

test("reports traceability as unverified when no adopted locator grammar is defined", async (t) => {
  const data = await fixture(t, "Adopt");
  await writeFile(path.join(data.packageRoot, "traceability.md"), "Opaque human-reviewed mapping goes here.\n");
  const result = runValidator(data);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).clauseTraceability, "not-verified");
});

test("rejects a Proposal whose packaged bytes differ from the committed blob", async (t) => {
  const data = await fixture(t, "Adopt");
  await writeFile(path.join(data.packageRoot, "proposal.md"), Buffer.from("altered bytes\n"));
  data.record.proposal.sha256 = createHash("sha256").update("altered bytes\n").digest("hex");
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  const result = runValidator(data);
  assert.notEqual(result.status, 0);
  assert(JSON.parse(result.stdout).errors.some((message) => /do not match proposal\.md at proposal\.revision/.test(message)));
});

test("rejects a missing local commit", async (t) => {
  const data = await fixture(t, "Adopt");
  data.record.proposal.revision = "f".repeat(40);
  await writeFile(path.join(data.packageRoot, "adoption-record.json"), JSON.stringify(data.record, null, 2));
  assert.notEqual(runValidator(data).status, 0);
});

test("reports a malformed Proposal revision as JSON without coercing its type", async (t) => {
  const data = await fixture(t, "Adopt");
  data.record.proposal.revision = [data.record.proposal.revision];
  const recordPath = path.join(data.packageRoot, "adoption-record.json");
  await writeFile(recordPath, JSON.stringify(data.record, null, 2));
  const before = await readFile(recordPath);
  const result = runValidator(data);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.packageValidation, "fail");
  assert.match(report.errors.join(" "), /proposal\.revision must be a full/);
  assert.equal(result.stderr, "");
  assert.deepEqual(await readFile(recordPath), before);
});

test("reports a malformed amendment digest as JSON without coercing its type", async (t) => {
  const data = await fixture(t, "Amend");
  data.record.amendedContent.sha256 = [data.record.amendedContent.sha256];
  const recordPath = path.join(data.packageRoot, "adoption-record.json");
  await writeFile(recordPath, JSON.stringify(data.record, null, 2));
  const before = await readFile(recordPath);
  const result = runValidator(data);
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.packageValidation, "fail");
  assert.match(report.errors.join(" "), /amendedContent\.sha256 must be a SHA-256/);
  assert.equal(result.stderr, "");
  assert.deepEqual(await readFile(recordPath), before);
});

test("rejects a non-regular Proposal input without reading it", async (t) => {
  const data = await fixture(t, "Adopt");
  const proposalPath = path.join(data.packageRoot, "proposal.md");
  await rm(proposalPath);
  await mkdir(proposalPath);
  assert.notEqual(runValidator(data).status, 0);
});

test("allows proposal.md to resolve through a symlink that stays inside the package", async (t) => {
  const data = await fixture(t, "Adopt");
  const proposalPath = path.join(data.packageRoot, "proposal.md");
  await writeFile(path.join(data.packageRoot, "proposal-copy.md"), proposal);
  await rm(proposalPath);
  await symlink("proposal-copy.md", proposalPath);
  assert.equal(runValidator(data).status, 0);
});

test("rejects an Authority member reached through an outside package symlink", async (t) => {
  const data = await fixture(t, "Adopt");
  const authorityDirectory = path.join(data.packageRoot, "authority-set");
  const outsideDirectory = path.join(path.dirname(data.packageRoot), "outside-authority");
  await mkdir(outsideDirectory, { recursive: true });
  for (const file of ["authority.md", "manifest.json"]) {
    await writeFile(path.join(outsideDirectory, file), await readFile(path.join(authorityDirectory, file)));
  }
  await rm(authorityDirectory, { recursive: true, force: true });
  await symlink(outsideDirectory, authorityDirectory);
  const result = runValidator(data);
  assert.notEqual(result.status, 0);
  assert.match(JSON.parse(result.stdout).errors.join(" "), /resolves outside the package/);
});

test("rejects a selector with extra keys or a noncanonical member path", async (t) => {
  const data = await fixture(t, "Adopt");
  const manifestPath = path.join(data.packageRoot, "authority-set", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.unexpected = true;
  await writeFile(manifestPath, JSON.stringify(manifest));
  assert.notEqual(runValidator(data).status, 0);
  delete manifest.unexpected;
  manifest.authorities[0].path = "other/authority.md";
  await writeFile(manifestPath, JSON.stringify(manifest));
  assert.notEqual(runValidator(data).status, 0);
});

test("rejects v1-incompatible selector IDs, revisions, paths, and path aliases", async (t) => {
  const data = await fixture(t, "Adopt");
  const manifestPath = path.join(data.packageRoot, "authority-set", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const member = manifest.authorities[0];
  for (const [key, value] of [
    ["id", "Synthetic-Authority"],
    ["revision", "fixture-revision"],
    ["path", "decision-package/authority-set/authority.txt"]
  ]) {
    const invalid = structuredClone(manifest);
    invalid.authorities[0][key] = value;
    await writeFile(manifestPath, JSON.stringify(invalid));
    assert.notEqual(runValidator(data).status, 0, `${key}=${value} must not be accepted`);
  }

  const authorityPath = path.join(data.packageRoot, "authority-set", "authority.md");
  const aliasPath = path.join(data.packageRoot, "authority-set", "authority-alias.md");
  await symlink("authority.md", aliasPath);
  member.path = "decision-package/authority-set/authority-alias.md";
  await writeFile(manifestPath, JSON.stringify(manifest));
  assert.notEqual(runValidator(data).status, 0, "a realpath alias must not be accepted as the canonical package member");
  assert.equal((await readFile(aliasPath)).toString(), (await readFile(authorityPath)).toString());
});
