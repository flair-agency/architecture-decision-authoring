#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

const [packageArgument, repositoryArgument] = process.argv.slice(2);

if (!packageArgument || !repositoryArgument) {
  console.error("Usage: node validate-decision-package.mjs <decision-package> <repository-root>");
  process.exit(2);
}

const errors = [];
const packageRoot = resolve(packageArgument);
const repositoryRoot = resolve(repositoryArgument);
const GATEKEEPER_ID = /^[a-z][a-z0-9-]{0,63}$/;

function isGatekeeperMarkdownPath(value) {
  return typeof value === "string" && value.length <= 240 && value.endsWith(".md") &&
    value.split("/").every((segment) => segment.length > 0 && segment !== "." && segment !== ".." && /^[A-Za-z0-9._-]+$/.test(segment));
}

function fail(message) {
  errors.push(message);
}

function git(args) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key)));
  env.GIT_NO_LAZY_FETCH = "1";
  env.GIT_NO_REPLACE_OBJECTS = "1";
  const result = spawnSync("git", ["--no-replace-objects", ...args], {
    cwd: repositoryRoot,
    env,
    encoding: "buffer",
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.error || result.status !== 0) return null;
  return result.stdout;
}

async function readJson(path, label) {
  try {
    const bytes = await readFileRequired(path, label);
    if (!bytes) return null;
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    fail(`${label} must be readable JSON`);
    return null;
  }
}

async function readFileRequired(path, label) {
  let handle;
  try {
    const packageReal = await realpath(packageRoot);
    const fileReal = await realpath(path);
    if (!isWithin(packageReal, fileReal)) {
      fail(`${label} resolves outside the package`);
      return null;
    }
    const info = await lstat(fileReal);
    if (!info.isFile()) {
      fail(`${label} must resolve to a regular file`);
      return null;
    }
    handle = await open(fileReal, constants.O_RDONLY | constants.O_NONBLOCK);
    if (!(await handle.stat()).isFile()) {
      fail(`${label} must be a regular file`);
      return null;
    }
    return await handle.readFile();
  } catch {
    fail(`${label} must exist and be readable`);
    return null;
  } finally {
    await handle?.close();
  }
}

async function exists(path, label) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    fail(`${label} could not be checked`);
    return true;
  }
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isWithin(root, target) {
  const rel = relative(root, target);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, i) => key !== expected[i])) {
    fail(`${label} must contain exactly: ${keys.join(", ")}`);
    return false;
  }
  return true;
}

function packageFile(relativePath, label) {
  if (typeof relativePath !== "string" || relativePath.length === 0 || isAbsolute(relativePath)) {
    fail(`${label} must be a package-relative path`);
    return null;
  }
  const path = resolve(packageRoot, relativePath);
  const rel = relative(packageRoot, path);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    fail(`${label} must resolve within the package`);
    return null;
  }
  return path;
}

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function validateProposalReference(record, proposalBytes) {
  const proposal = record.proposal;
  if (!proposal || typeof proposal !== "object" || Array.isArray(proposal)) {
    fail("proposal must contain path, revision, and sha256");
    return;
  }
  if (proposal.path !== "proposal.md") fail('proposal.path must be "proposal.md"');
  if (typeof proposal.revision !== "string" || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(proposal.revision)) {
    fail("proposal.revision must be a full 40- or 64-character Git commit ID");
  }
  if (typeof proposal.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(proposal.sha256)) {
    fail("proposal.sha256 must be a SHA-256 digest");
  } else if (proposalBytes && digest(proposalBytes) !== proposal.sha256.toLowerCase()) {
    fail("packaged Proposal bytes do not match proposal.sha256");
  }

  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(proposal.revision ?? "")) return;
  const revision = proposal.revision.toLowerCase();
  const commit = git(["rev-parse", "--verify", "--end-of-options", `${revision}^{commit}`]);
  if (!commit || commit.toString("utf8").trim().toLowerCase() !== revision) {
    fail("proposal.revision must identify a locally available Git commit");
    return;
  }

  let packageReal;
  let proposalReal;
  let gitTop;
  try {
    [packageReal, proposalReal] = await Promise.all([
      realpath(packageRoot),
      realpath(resolve(packageRoot, "proposal.md"))
    ]);
    const gitTopBytes = git(["rev-parse", "--show-toplevel"]);
    if (!gitTopBytes) throw new Error("Git repository root unavailable");
    gitTop = await realpath(gitTopBytes.toString("utf8").trim());
  } catch {
    fail("package/proposal path or Git repository root must resolve locally");
    return;
  }
  if (!isWithin(packageReal, proposalReal)) {
    fail("proposal.md must resolve within the package");
    return;
  }
  const repositoryPath = relative(gitTop, resolve(packageReal, "proposal.md")).split(sep).join("/");
  if (!repositoryPath || repositoryPath === ".." || repositoryPath.startsWith("../") || isAbsolute(repositoryPath)) {
    fail("proposal.md must be located within the Git repository");
    return;
  }

  const tree = git(["ls-tree", "-z", "--full-tree", revision, "--", `:(literal)${repositoryPath}`]);
  if (!tree) {
    fail("Proposal blob is unavailable in the locally available commit");
    return;
  }
  const entries = tree.toString("utf8").split("\0").filter(Boolean).map((entry) => {
    const tab = entry.indexOf("\t");
    if (tab < 0) return null;
    const [mode, type, objectId] = entry.slice(0, tab).split(" ");
    return { mode, type, objectId, path: entry.slice(tab + 1) };
  }).filter((entry) => entry?.path === repositoryPath);
  if (entries.length !== 1 || entries[0].type !== "blob") {
    fail("proposal.revision must contain a Proposal blob at the package placement path");
    return;
  }
  const blob = git(["cat-file", "blob", entries[0].objectId]);
  if (!blob || (proposalBytes && !blob.equals(proposalBytes))) {
    fail("packaged Proposal bytes do not match proposal.md at proposal.revision");
  }
}

async function main() {
  const adoptionPath = resolve(packageRoot, "adoption-record.json");
  const record = await readJson(adoptionPath, "adoption-record.json");
  const proposalBytes = await readFileRequired(resolve(packageRoot, "proposal.md"), "proposal.md");
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    fail("adoption record must be an object");
    return finish();
  }

  if (record.schemaVersion !== 1) fail("schemaVersion must be 1");
  const statusPresent = Object.hasOwn(record, "status");
  const pending = statusPresent && record.status === "Pending";
  const outcomes = ["Adopt", "Amend", "Defer", "Reject"];
  if (pending) {
    if (record.outcome !== null) fail('Pending adoption requires outcome: null');
  } else {
    if (statusPresent && record.status !== "Decided") fail('status must be "Pending" or "Decided"');
    if (!outcomes.includes(record.outcome)) fail("a decided adoption requires Adopt, Amend, Defer, or Reject");
    for (const key of ["owner", "authorizationEvidence", "decisionDate", "scope"]) {
      if (!hasText(record[key])) {
        fail(`decided adoption requires ${key}`);
      }
    }
    for (const key of ["applicabilityConditions", "exceptions"]) {
      if (!Object.hasOwn(record, key) || record[key] === null) fail(`decided adoption requires ${key}`);
    }
  }

  await validateProposalReference(record, proposalBytes);

  const authorityPath = resolve(packageRoot, "authority-set", "authority.md");
  const manifestPath = resolve(packageRoot, "authority-set", "manifest.json");
  const authorityExists = await exists(authorityPath, "Authority member path");
  const manifestExists = await exists(manifestPath, "manifest path");
  const exportable = !pending && ["Adopt", "Amend"].includes(record.outcome);

  if (!exportable) {
    if (authorityExists || manifestExists) fail("Pending, Defer, and Reject outcomes must not include an Authority member or manifest");
    return finish();
  }

  const authorityBytes = await readFileRequired(authorityPath, "authority-set/authority.md");
  const manifest = await readJson(manifestPath, "authority-set/manifest.json");
  const traceabilityBytes = await readFileRequired(resolve(packageRoot, "traceability.md"), "traceability.md");
  const result = await readJson(resolve(packageRoot, "validation-result.json"), "validation-result.json");
  if (!result || typeof result !== "object" || Array.isArray(result)) fail("validation-result.json must contain a JSON object");
  if (traceabilityBytes && traceabilityBytes.toString("utf8").trim().length === 0) fail("traceability.md must not be empty");

  if (manifest) {
    if (exactKeys(manifest, ["version", "authorities"], "manifest")) {
      if (manifest.version !== 1 || !Array.isArray(manifest.authorities) || manifest.authorities.length !== 1) {
        fail("manifest must select exactly one authority using version 1");
      } else {
        const member = manifest.authorities[0];
        if (exactKeys(member, ["id", "repository", "revision", "path"], "manifest authority")) {
          const expectedMemberPath = relative(repositoryRoot, authorityPath).split(sep).join("/");
          if (typeof member.id !== "string" || !GATEKEEPER_ID.test(member.id) || member.repository !== "self" ||
              member.revision !== "authority-revision" || !isGatekeeperMarkdownPath(member.path) || member.path !== expectedMemberPath) {
            fail("manifest authority must use a Gatekeeper v1 ID, self repository, authority-revision, and this package's canonical Markdown path");
          }
          const authorityReal = await realpath(authorityPath).catch(() => null);
          let selectedReal = null;
          if (typeof member.path === "string" && !isAbsolute(member.path)) {
            selectedReal = await realpath(resolve(repositoryRoot, member.path)).catch(() => null);
          }
          const packageReal = await realpath(packageRoot).catch(() => null);
          if (!authorityReal || !packageReal || !isWithin(packageReal, authorityReal) || selectedReal !== authorityReal) {
            fail("manifest path must select this package's Authority member");
          }
        }
      }
    }
  }

  const adopted = record.adoptedContent;
  if (record.outcome === "Adopt") {
    if (!Array.isArray(adopted) || adopted.length === 0) {
      fail("Adopt requires adoptedContent identifying the adopted Proposal content");
    } else {
      for (const [index, item] of adopted.entries()) {
        const locator = typeof item === "string" ? item : item?.proposalLocator;
        if (!hasText(locator)) {
          fail(`adoptedContent[${index}] must identify an exact Proposal locator`);
        }
      }
    }
    if (record.amendedContent !== null) fail("Adopt requires amendedContent: null");
  }

  if (record.outcome === "Amend") {
    if (!record.amendedContent || typeof record.amendedContent !== "object" || Array.isArray(record.amendedContent)) {
      fail("Amend requires the owner-approved amendedContent snapshot and digest");
    } else {
      const amendedPath = packageFile(record.amendedContent.path, "amendedContent.path");
      const snapshot = amendedPath ? await readFileRequired(amendedPath, "amendedContent snapshot") : null;
      if (!/^[a-f0-9]{64}$/i.test(record.amendedContent.sha256 ?? "")) {
        fail("amendedContent.sha256 must be a SHA-256 digest");
      } else if (snapshot && digest(snapshot) !== record.amendedContent.sha256.toLowerCase()) {
        fail("amendedContent snapshot does not match its SHA-256 digest");
      }
      if (snapshot && authorityBytes && !snapshot.equals(authorityBytes)) {
        fail("Authority member bytes must exactly match the approved amendedContent snapshot");
      }
    }
  }

  finish();
}

function finish() {
  const report = {
    packageValidation: errors.length ? "fail" : "pass",
    clauseTraceability: "not-verified",
    validationResultClaims: "not-verified",
    semanticFidelity: "pending",
    ownerEvidenceAuthenticity: "not-verified",
    gatekeeperCompatibility: { status: "not-run", pinnedRevision: null },
    consumerActivation: "not-performed",
    errors
  };
  console.log(JSON.stringify(report, null, 2));
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});
