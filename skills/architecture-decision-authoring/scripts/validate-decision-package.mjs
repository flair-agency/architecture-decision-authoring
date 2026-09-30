#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { lstat, open, realpath, stat } from "node:fs/promises";
import { resolve, relative, sep, isAbsolute, win32 } from "node:path";
import { authorityClauseIds, markdownTableRows } from "./markdown-structure.mjs";
import { strictJson, utf8, visibleText } from "./structural-input.mjs";

const root = resolve(process.argv[2] ?? "decision-package");
const repositoryRootArgument = process.argv[3];
const repositoryRoot = resolve(repositoryRootArgument ?? ".");
const errors = [];

function git(args) {
  const environment = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key)));
  environment.GIT_NO_REPLACE_OBJECTS = "1";
  environment.GIT_NO_LAZY_FETCH = "1";
  const result = spawnSync("git", ["--no-replace-objects", ...args], {
    cwd: repositoryRoot, encoding: "buffer", env: environment, maxBuffer: 64 * 1024 * 1024
  });
  if (result.error || result.status !== 0) return null;
  return result.stdout;
}

async function exactGitRoot() {
  if (!repositoryRootArgument) {
    errors.push("repositoryRoot argument is required and must be the Git top-level directory");
    return null;
  }
  const reported = git(["rev-parse", "--show-toplevel"]);
  if (!reported) {
    errors.push("repositoryRoot must be the top-level directory of a local Git repository");
    return null;
  }
  try {
    const [actualRoot, requestedRoot] = await Promise.all([
      realpath(reported.toString("utf8").trim()),
      realpath(repositoryRoot)
    ]);
    if (actualRoot !== requestedRoot) {
      errors.push("repositoryRoot must be the exact Git top-level directory");
      return null;
    }
    return actualRoot;
  } catch {
    errors.push("repositoryRoot must resolve to the Git top-level directory");
    return null;
  }
}

async function proposalBlobAtRevision(proposalPath, revision) {
  const gitRoot = await exactGitRoot();
  if (!gitRoot || typeof revision !== "string" || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(revision)) return null;

  let packageReal;
  let proposalReal;
  try {
    packageReal = await realpath(root);
    proposalReal = await realpath(proposalPath);
  } catch {
    errors.push("proposal.path must resolve to an existing file in the Git repository");
    return null;
  }
  const proposalInfo = await lstat(proposalPath).catch(() => null);
  const expectedProposalPath = resolve(packageReal, "proposal.md");
  if (!proposalInfo?.isFile() || proposalInfo.isSymbolicLink() || proposalReal !== expectedProposalPath) {
    errors.push("package proposal.md must be a regular file at its repository placement path");
    return null;
  }
  const repositoryPath = relative(gitRoot, expectedProposalPath);
  if (repositoryPath === "" || repositoryPath === ".." || repositoryPath.startsWith(`..${sep}`) || isAbsolute(repositoryPath)) {
    errors.push("proposal.path must resolve inside repositoryRoot");
    return null;
  }

  const resolved = git(["rev-parse", "--verify", "--end-of-options", `${revision}^{commit}`]);
  const resolvedId = resolved?.toString("utf8").trim();
  if (!resolvedId || resolvedId.toLowerCase() !== revision.toLowerCase()) {
    errors.push("proposal.revision must identify a locally available Git commit");
    return null;
  }

  const pathspec = `:(literal)${repositoryPath.split(sep).join("/")}`;
  const tree = git(["ls-tree", "-z", "--full-tree", revision, "--", pathspec]);
  if (!tree) {
    errors.push("proposal.revision must contain a readable tree and Proposal blob in the local Git object database");
    return null;
  }
  const entries = tree.toString("utf8").split("\0").filter(Boolean).map((entry) => {
    const separatorIndex = entry.indexOf("\t");
    if (separatorIndex < 0) return null;
    const [mode, type, objectId] = entry.slice(0, separatorIndex).split(" ");
    return { mode, type, objectId, path: entry.slice(separatorIndex + 1) };
  });
  const selected = entries.filter((entry) => entry?.path === repositoryPath.split(sep).join("/"));
  if (selected.length !== 1 || !["100644", "100755"].includes(selected[0]?.mode) || selected[0]?.type !== "blob") {
    errors.push("proposal.revision must contain proposal.md as a regular file blob at the recorded path");
    return null;
  }
  const blob = git(["cat-file", "blob", selected[0].objectId]);
  if (!blob) errors.push("proposal.revision Proposal blob is missing from the local Git object database");
  return blob;
}

async function bytes(path) {
  let handle;
  try {
    if (!(await stat(path)).isFile()) {
      errors.push(`${relative(root, path)} must be a regular file`);
      return null;
    }
    // Nonblocking open plus descriptor inspection also protects against a
    // regular file being replaced by a FIFO between the path check and open.
    handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
    if (!(await handle.stat()).isFile()) {
      errors.push(`${relative(root, path)} must be a regular file`);
      return null;
    }
    const content = await handle.readFile();
    try {
      utf8(content);
    } catch {
      errors.push(`invalid UTF-8: ${relative(root, path)}`);
      return null;
    }
    return content;
  } catch {
    errors.push(`missing file: ${relative(root, path)}`);
    return null;
  } finally {
    await handle?.close();
  }
}

async function json(path) {
  const content = await bytes(path);
  if (!content) return null;
  try {
    return strictJson(utf8(content));
  } catch (error) {
    const detail = error.message.startsWith("duplicate JSON key") ? ` (${error.message})` : "";
    errors.push(`invalid JSON: ${relative(root, path)}${detail}`);
    return null;
  }
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function validDate(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year < 1 || month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

function validateValidationResult(result) {
  exactKeys(result, [
    "schemaVersion", "packageStructure", "referenceBounds", "clauseTraceability",
    "gatekeeperCompatibility", "semanticFidelity", "consumerActivation"
  ], "validation-result");
  if (!result || typeof result !== "object" || Array.isArray(result)) return;
  if (result.schemaVersion !== 1) errors.push("validation-result.schemaVersion must be 1");
  for (const key of ["packageStructure", "referenceBounds", "clauseTraceability"]) {
    if (result[key] !== "pass") errors.push(`validation-result.${key} must be pass when the package validator succeeds`);
  }

  exactKeys(result.gatekeeperCompatibility, ["status", "pinnedRevision"], "validation-result.gatekeeperCompatibility");
  const compatibilityStatus = result.gatekeeperCompatibility?.status;
  if (!["pass", "fail", "not-run"].includes(compatibilityStatus)) {
    errors.push('validation-result.gatekeeperCompatibility.status must be "pass", "fail", or "not-run"');
  }
  const pinnedRevision = result.gatekeeperCompatibility?.pinnedRevision;
  if (compatibilityStatus === "not-run") {
    if (pinnedRevision !== null) errors.push("validation-result.gatekeeperCompatibility.pinnedRevision must be null when not-run");
  } else if (typeof pinnedRevision !== "string" || !/^[a-f0-9]{40}$/i.test(pinnedRevision)) {
    errors.push("validation-result.gatekeeperCompatibility.pinnedRevision must be a full 40-character commit SHA when run");
  }

  exactKeys(result.semanticFidelity, ["status"], "validation-result.semanticFidelity");
  if (!["pass", "fail", "pending"].includes(result.semanticFidelity?.status)) {
    errors.push('validation-result.semanticFidelity.status must be "pass", "fail", or "pending"');
  }

  exactKeys(result.consumerActivation, ["status"], "validation-result.consumerActivation");
  if (!["performed", "not-performed"].includes(result.consumerActivation?.status)) {
    errors.push('validation-result.consumerActivation.status must be "performed" or "not-performed"');
  }
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${label} must be an object`);
    return;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    errors.push(`${label} keys must be exactly: ${wanted.join(", ")}`);
  }
}

async function inside(path, label) {
  return insideBase(root, path, label);
}

async function insideBase(base, path, label) {
  if (typeof path !== "string" || path.trim() === "") {
    errors.push(`${label} must be a non-empty path`);
    return null;
  }
  if (isAbsolute(path) || win32.isAbsolute(path)) {
    errors.push(`${label} must be relative to its allowed root`);
    return null;
  }
  const target = resolve(base, path);
  const rel = relative(base, target);
  if (rel === "" || rel.startsWith(`..${sep}`) || rel === "..") {
    errors.push(`${label} must stay inside its allowed root`);
    return null;
  }
  try {
    const [baseReal, targetReal] = await Promise.all([realpath(base), realpath(target)]);
    const realRel = relative(baseReal, targetReal);
    if (realRel === "" || realRel === ".." || realRel.startsWith(`..${sep}`)) {
      errors.push(`${label} resolves outside its allowed root`);
      return null;
    }
  } catch {
    errors.push(`${label} must resolve to an existing path`);
    return null;
  }
  return target;
}

async function exists(path) {
  try {
    const info = await lstat(path);
    return info.isFile() || info.isSymbolicLink();
  } catch {
    return false;
  }
}

const recordPath = await inside("adoption-record.json", "adoption record path");
const record = recordPath && await json(recordPath);
if (!record || typeof record !== "object" || Array.isArray(record)) {
  if (recordPath) errors.push("adoption record must be an object");
  finish("decision package is invalid");
}

const statusPresent = Object.hasOwn(record, "status");
const isPending = statusPresent && record.status === "Pending";
const validOutcomes = ["Adopt", "Amend", "Defer", "Reject"];
if (record.schemaVersion !== 1) errors.push("schemaVersion must be 1");

if (isPending) {
  exactKeys(record, ["schemaVersion", "status", "outcome", "proposal"], "pending adoption record");
  if (record.outcome !== null) errors.push('Pending adoption record outcome must be null; Pending is a lifecycle status, not an owner outcome');
} else {
  if (statusPresent && record.status !== "Decided") {
    errors.push('adoption record status must be "Pending" or "Decided"');
  }
  if (statusPresent && record.status === "Decided" && !validOutcomes.includes(record.outcome)) {
    errors.push('Decided adoption record outcome must be one of "Adopt", "Amend", "Defer", or "Reject"');
  } else if (!validOutcomes.includes(record.outcome)) {
    errors.push('outcome must be one of "Adopt", "Amend", "Defer", or "Reject"; use status "Pending" with outcome null before an owner decision');
  }

  const required = [
    "schemaVersion", "outcome", "proposal", "owner", "authorizationEvidence",
    "decisionDate", "scope", "applicabilityConditions", "exceptions",
    "adoptedContent", "amendedContent"
  ];
  if (statusPresent) required.push("status");
  for (const key of required) {
    if (!(key in record)) errors.push(`adoption record missing: ${key}`);
  }

  for (const key of ["owner", "authorizationEvidence", "decisionDate", "scope"]) {
    if (!visibleText(record[key])) {
      errors.push(`${key} must be a non-empty string`);
    }
  }
  if (typeof record.decisionDate === "string" && !validDate(record.decisionDate)) {
    errors.push("decisionDate must be a valid YYYY-MM-DD date");
  }
  for (const key of ["applicabilityConditions", "exceptions"]) {
    if (!Array.isArray(record[key])) {
      errors.push(`${key} must be an array of non-empty strings`);
    } else {
      for (const [index, item] of record[key].entries()) {
        if (!visibleText(item)) {
          errors.push(`${key}[${index}] must be a non-empty string`);
        }
      }
    }
  }
}

exactKeys(record.proposal, ["path", "revision", "sha256"], "proposal");
const proposalPath = record.proposal && await inside(record.proposal.path, "proposal.path");
if (proposalPath && proposalPath !== resolve(root, "proposal.md")) {
  errors.push("proposal.path must select the package proposal.md");
}
if (record.proposal && (typeof record.proposal.revision !== "string" || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(record.proposal.revision))) {
  errors.push("proposal.revision must be a full 40- or 64-character immutable Git commit ID");
}
const proposal = proposalPath && await bytes(proposalPath);
if (proposal && sha256(proposal) !== record.proposal.sha256) {
  errors.push("proposal bytes do not match proposal.sha256");
}
if (proposal && proposalPath && typeof record.proposal?.revision === "string") {
  const committedProposal = await proposalBlobAtRevision(proposalPath, record.proposal.revision);
  if (committedProposal && !committedProposal.equals(proposal)) {
    errors.push("bundled Proposal bytes do not match proposal.md at proposal.revision");
  }
}

const exportable = record.outcome === "Adopt" || record.outcome === "Amend";
const authorityPath = resolve(root, "authority-set", "authority.md");
const manifestPath = resolve(root, "authority-set", "manifest.json");

if (isPending || !exportable) {
  if (record.outcome === "Defer" || record.outcome === "Reject") {
    if (!Array.isArray(record.adoptedContent) || record.adoptedContent.length !== 0) {
      errors.push(`${record.outcome} requires adoptedContent: []`);
    }
    if (record.amendedContent !== null) errors.push(`${record.outcome} requires amendedContent: null`);
  }
  if (await exists(authorityPath) || await exists(manifestPath)) {
    errors.push(`${isPending ? "Pending adoption" : `outcome ${record.outcome ?? "Unknown"}`} must not leave a consumable Authority Set`);
  }
  finish(isPending ? "pending adoption is fail-closed" : "no-export outcome is fail-closed");
}

const boundedAuthorityPath = await inside("authority-set/authority.md", "Authority member path");
const boundedManifestPath = await inside("authority-set/manifest.json", "manifest path");

const manifest = boundedManifestPath && await json(boundedManifestPath);
if (manifest && typeof manifest === "object" && !Array.isArray(manifest)) {
  exactKeys(manifest, ["version", "authorities"], "manifest");
  if (manifest.version !== 1) errors.push("manifest.version must be 1");
  if (!Array.isArray(manifest.authorities) || manifest.authorities.length !== 1) {
    errors.push("manifest.authorities must contain exactly one member");
  } else {
    const member = manifest.authorities[0];
    exactKeys(member, ["id", "repository", "revision", "path"], "manifest member");
    if (member && typeof member === "object" && !Array.isArray(member)) {
      if (typeof member.id !== "string" || !/^[a-z][a-z0-9-]{0,63}$/.test(member.id)) {
        errors.push("manifest member id must be a Gatekeeper stable ID (lowercase letter followed by up to 63 lowercase letters, digits, or hyphens)");
      }
      if (member.repository !== "self") errors.push('manifest member repository must be "self"');
      if (member.revision !== "authority-revision") errors.push('manifest member revision must be "authority-revision"');
      const selected = await insideBase(repositoryRoot, member.path, "manifest member path");
      if (selected && resolve(selected) !== authorityPath) errors.push("manifest must select authority-set/authority.md");
    }
  }
} else {
  errors.push("manifest must be an object");
}

const authority = boundedAuthorityPath && await bytes(boundedAuthorityPath);
const traceabilityPath = await inside("traceability.md", "traceability path");
const traceability = traceabilityPath && await bytes(traceabilityPath);
const clauseIds = authority ? authorityClauseIds(authority, errors) : [];
if (authority && clauseIds.length === 0) {
  errors.push('authority.md must identify every normative clause with a stable `<!-- clause-id: ID -->` marker');
}
const authorityIds = new Set(clauseIds);
if (authorityIds.size !== clauseIds.length) errors.push("authority.md must not repeat a clause ID");

const traceRows = traceability ? markdownTableRows(traceability, [
  "Clause ID", "Authority locator", "Owner outcome", "Authorization evidence",
  "Proposal revision", "Proposal locator", "Source evidence locator(s)"
], "traceability.md", errors) : [];
const traceIds = new Set();
for (const [index, row] of traceRows.entries()) {
  const [clauseId, authorityLocator, ownerOutcome, authorizationEvidence, proposalRevision, proposalLocator, sourceLocators] = row;
  const label = `traceability row ${index + 1}`;
  if (!clauseId) errors.push(`${label}.clauseId must be non-empty`);
  else if (traceIds.has(clauseId)) errors.push(`duplicate traceability clause ID: ${clauseId}`);
  else traceIds.add(clauseId);
  if (!authorityIds.has(clauseId)) errors.push(`${label} references unknown Authority clause ID: ${clauseId}`);
  if (authorityLocator !== `clause-id:${clauseId}`) errors.push(`${label}.authorityLocator must be clause-id:${clauseId}`);
  if (ownerOutcome !== record.outcome) errors.push(`${label}.ownerOutcome must match adoption-record outcome`);
  if (authorizationEvidence !== record.authorizationEvidence) errors.push(`${label}.authorizationEvidence must match adoption-record evidence`);
  if (proposalRevision !== record.proposal?.revision) errors.push(`${label}.proposalRevision must match adoption-record revision`);
  if (!visibleText(proposalLocator)) errors.push(`${label}.proposalLocator must be non-empty`);
  if (!visibleText(sourceLocators)) errors.push(`${label}.sourceEvidenceLocator(s) must be non-empty`);
  if (proposal && proposalLocator && !proposal.toString("utf8").includes(proposalLocator)) {
    errors.push(`${label}.proposalLocator must occur in the exact Proposal bytes`);
  }
  if (proposal && sourceLocators && sourceLocators.split(";").some((locator) => {
    const value = locator.trim();
    return !visibleText(value) || !proposal.toString("utf8").includes(value);
  })) {
    errors.push(`${label}.sourceEvidenceLocator(s) must each occur in the exact Proposal bytes`);
  }
}
for (const clauseId of authorityIds) {
  if (!traceIds.has(clauseId)) errors.push(`Authority clause ${clauseId} is missing from traceability.md`);
}
for (const clauseId of traceIds) {
  if (!authorityIds.has(clauseId)) errors.push(`traceability.md contains a clause absent from authority.md: ${clauseId}`);
}

if (record.outcome === "Adopt") {
  if (!Array.isArray(record.adoptedContent) || record.adoptedContent.length === 0) {
    errors.push("Adopt requires non-empty adoptedContent");
  } else {
    const ids = new Set();
    for (const [index, entry] of record.adoptedContent.entries()) {
      exactKeys(entry, ["clauseId", "proposalLocator"], `adoptedContent[${index}]`);
      if (!visibleText(entry?.clauseId)) {
        errors.push(`adoptedContent[${index}].clauseId must be a non-empty string`);
      } else if (ids.has(entry.clauseId)) {
        errors.push(`duplicate adoptedContent clauseId: ${entry.clauseId}`);
      } else {
        ids.add(entry.clauseId);
      }
      if (!visibleText(entry?.proposalLocator)) {
        errors.push(`adoptedContent[${index}].proposalLocator must be a non-empty string`);
      } else if (proposal && !proposal.toString("utf8").includes(entry.proposalLocator)) {
        errors.push(`adoptedContent[${index}].proposalLocator must occur in the exact Proposal bytes`);
      }
    }
    for (const id of ids) {
      if (!authorityIds.has(id)) errors.push(`adoptedContent clause is absent from authority.md: ${id}`);
    }
    for (const id of authorityIds) {
      if (!ids.has(id)) errors.push(`authority.md clause is absent from adoptedContent: ${id}`);
    }
    for (const [index, row] of traceRows.entries()) {
      const adoptedEntry = record.adoptedContent.find((entry) => entry?.clauseId === row[0]);
      if (adoptedEntry && row[5] !== adoptedEntry.proposalLocator) {
        errors.push(`traceability row ${index + 1}.proposalLocator must match adoptedContent for ${row[0]}`);
      }
      if (!adoptedEntry) errors.push(`traceability row ${index + 1} is not identified in adoptedContent: ${row[0]}`);
    }
  }
  if (record.amendedContent !== null) errors.push("Adopt requires amendedContent: null");
}

if (record.outcome === "Amend") {
  if (!Array.isArray(record.adoptedContent) || record.adoptedContent.length !== 0) {
    errors.push("Amend requires adoptedContent: []");
  }
  exactKeys(record.amendedContent, ["path", "sha256"], "amendedContent");
  const snapshotPath = record.amendedContent && await inside(record.amendedContent.path, "amendedContent.path");
  const snapshot = snapshotPath && await bytes(snapshotPath);
  if (snapshot && sha256(snapshot) !== record.amendedContent.sha256) errors.push("amended snapshot digest mismatch");
  if (snapshot && authority && !snapshot.equals(authority)) errors.push("authority.md must exactly match the approved amended snapshot bytes");
}

const validationResultPath = await inside("validation-result.json", "validation-result path");
const validationResult = validationResultPath && await json(validationResultPath);
if (!validationResult || typeof validationResult !== "object" || Array.isArray(validationResult)) {
  if (validationResultPath) errors.push("validation-result must be an object");
} else validateValidationResult(validationResult);
finish("decision package structure is valid");

function finish(successMessage) {
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exit(1);
  }
  console.log(successMessage);
  process.exit(0);
}
