#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";

const root = resolve(process.argv[2] ?? "decision-package");
const repositoryRoot = resolve(process.argv[3] ?? resolve(root, ".."));
const errors = [];

async function bytes(path) {
  try {
    return await readFile(path);
  } catch {
    errors.push(`missing file: ${relative(root, path)}`);
    return null;
  }
}

async function json(path) {
  const content = await bytes(path);
  if (!content) return null;
  try {
    return JSON.parse(content.toString("utf8"));
  } catch {
    errors.push(`invalid JSON: ${relative(root, path)}`);
    return null;
  }
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function markdownTableRows(content, expectedHeader, label) {
  const lines = content.toString("utf8").split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => tableCells(line)?.join("|") === expectedHeader.join("|"));
  if (headerIndex < 0) {
    errors.push(`${label} must contain the required traceability table header`);
    return [];
  }
  const separator = tableCells(lines[headerIndex + 1]);
  if (!separator || separator.length !== expectedHeader.length || separator.some((cell) => !/^:?-{3,}:?$/.test(cell))) {
    errors.push(`${label} must have a Markdown separator row after the header`);
    return [];
  }
  const rows = [];
  for (const [offset, line] of lines.slice(headerIndex + 2).entries()) {
    if (line.trim() === "") continue;
    const cells = tableCells(line);
    if (!cells) {
      if (line.trim().startsWith("|")) errors.push(`${label} row ${headerIndex + offset + 3} must use pipe-delimited Markdown`);
      continue;
    }
    if (cells.length !== expectedHeader.length) {
      errors.push(`${label} row ${headerIndex + offset + 3} must have ${expectedHeader.length} columns`);
      continue;
    }
    rows.push(cells);
  }
  return rows;
}

function tableCells(line) {
  if (typeof line !== "string" || !line.includes("|")) return null;
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function authorityClauseIds(content) {
  const ids = [];
  const pattern = /^\s*<!--\s*clause-id:\s*([A-Za-z0-9][A-Za-z0-9._:-]*)\s*-->\s*$/gm;
  for (const match of content.toString("utf8").matchAll(pattern)) ids.push(match[1]);
  return ids;
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

function inside(path, label) {
  return insideBase(root, path, label);
}

function insideBase(base, path, label) {
  if (typeof path !== "string" || path.trim() === "") {
    errors.push(`${label} must be a non-empty path`);
    return null;
  }
  const target = resolve(base, path);
  const rel = relative(base, target);
  if (rel === "" || rel.startsWith(`..${sep}`) || rel === "..") {
    errors.push(`${label} must stay inside the package`);
    return null;
  }
  return target;
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

const record = await json(resolve(root, "adoption-record.json"));
if (!record) finish("decision package is invalid");

const required = [
  "schemaVersion", "outcome", "proposal", "owner", "authorizationEvidence",
  "decisionDate", "scope", "applicabilityConditions", "exceptions",
  "adoptedContent", "amendedContent"
];
for (const key of required) {
  if (!(key in record)) errors.push(`adoption record missing: ${key}`);
}

const exportable = record.outcome === "Adopt" || record.outcome === "Amend";
const authorityPath = resolve(root, "authority-set", "authority.md");
const manifestPath = resolve(root, "authority-set", "manifest.json");

if (!exportable) {
  if (await exists(authorityPath) || await exists(manifestPath)) {
    errors.push(`outcome ${record.outcome ?? "Unknown"} must not leave a consumable Authority Set`);
  }
  finish("no-export outcome is fail-closed");
}

if (record.schemaVersion !== 1) errors.push("schemaVersion must be 1");
for (const key of ["owner", "authorizationEvidence", "decisionDate", "scope"]) {
  if (typeof record[key] !== "string" || record[key].trim() === "") {
    errors.push(`${key} must be a non-empty string`);
  }
}

exactKeys(record.proposal, ["path", "revision", "sha256"], "proposal");
const proposalPath = record.proposal && inside(record.proposal.path, "proposal.path");
if (proposalPath && proposalPath !== resolve(root, "proposal.md")) {
  errors.push("proposal.path must select the package proposal.md");
}
const proposal = proposalPath && await bytes(proposalPath);
if (proposal && sha256(proposal) !== record.proposal.sha256) {
  errors.push("proposal bytes do not match proposal.sha256");
}

const manifest = await json(manifestPath);
if (manifest) {
  exactKeys(manifest, ["version", "authorities"], "manifest");
  if (manifest.version !== 1) errors.push("manifest.version must be 1");
  if (!Array.isArray(manifest.authorities) || manifest.authorities.length !== 1) {
    errors.push("manifest.authorities must contain exactly one member");
  } else {
    const member = manifest.authorities[0];
    exactKeys(member, ["id", "repository", "revision", "path"], "manifest member");
    if (typeof member.id !== "string" || !/^[a-z][a-z0-9-]{0,63}$/.test(member.id)) {
      errors.push("manifest member id must be a Gatekeeper stable ID (lowercase letter followed by up to 63 lowercase letters, digits, or hyphens)");
    }
    if (member.repository !== "self") errors.push('manifest member repository must be "self"');
    if (member.revision !== "authority-revision") errors.push('manifest member revision must be "authority-revision"');
    const selected = insideBase(repositoryRoot, member.path, "manifest member path");
    if (selected && resolve(selected) !== authorityPath) errors.push("manifest must select authority-set/authority.md");
  }
} else if (manifest === null && await exists(manifestPath)) {
  errors.push("manifest must be an object");
}

const authority = await bytes(authorityPath);
const traceability = await bytes(resolve(root, "traceability.md"));
const clauseIds = authority ? authorityClauseIds(authority) : [];
if (authority && clauseIds.length === 0) {
  errors.push('authority.md must identify every normative clause with a stable `<!-- clause-id: ID -->` marker');
}
const authorityIds = new Set(clauseIds);
if (authorityIds.size !== clauseIds.length) errors.push("authority.md must not repeat a clause ID");

const traceRows = traceability ? markdownTableRows(traceability, [
  "Clause ID", "Authority locator", "Owner outcome", "Authorization evidence",
  "Proposal revision", "Proposal locator", "Source evidence locator(s)"
], "traceability.md") : [];
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
  if (!proposalLocator) errors.push(`${label}.proposalLocator must be non-empty`);
  if (!sourceLocators) errors.push(`${label}.sourceEvidenceLocator(s) must be non-empty`);
  if (proposal && proposalLocator && !proposal.toString("utf8").includes(proposalLocator)) {
    errors.push(`${label}.proposalLocator must occur in the exact Proposal bytes`);
  }
  if (proposal && sourceLocators && sourceLocators.split(";").some((locator) => {
    const value = locator.trim();
    return value === "" || !proposal.toString("utf8").includes(value);
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
      if (typeof entry?.clauseId !== "string" || entry.clauseId.trim() === "") {
        errors.push(`adoptedContent[${index}].clauseId must be a non-empty string`);
      } else if (ids.has(entry.clauseId)) {
        errors.push(`duplicate adoptedContent clauseId: ${entry.clauseId}`);
      } else {
        ids.add(entry.clauseId);
      }
      if (typeof entry?.proposalLocator !== "string" || entry.proposalLocator.trim() === "") {
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
  exactKeys(record.amendedContent, ["path", "sha256"], "amendedContent");
  const snapshotPath = record.amendedContent && inside(record.amendedContent.path, "amendedContent.path");
  const snapshot = snapshotPath && await bytes(snapshotPath);
  if (snapshot && sha256(snapshot) !== record.amendedContent.sha256) errors.push("amended snapshot digest mismatch");
  if (snapshot && authority && !snapshot.equals(authority)) errors.push("authority.md must exactly match the approved amended snapshot bytes");
}

const validationResult = await json(resolve(root, "validation-result.json"));
if (validationResult === null) errors.push("validation-result must be an object");
else validateValidationResult(validationResult);
finish("decision package structure is valid");

function finish(successMessage) {
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exit(1);
  }
  console.log(successMessage);
  process.exit(0);
}
