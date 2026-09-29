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
    if (member.repository !== "self") errors.push('manifest member repository must be "self"');
    if (member.revision !== "authority-revision") errors.push('manifest member revision must be "authority-revision"');
    const selected = insideBase(repositoryRoot, member.path, "manifest member path");
    if (selected && resolve(selected) !== authorityPath) errors.push("manifest must select authority-set/authority.md");
  }
}

const authority = await bytes(authorityPath);
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
      }
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

await bytes(resolve(root, "traceability.md"));
await json(resolve(root, "validation-result.json"));
finish("decision package structure is valid");

function finish(successMessage) {
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exit(1);
  }
  console.log(successMessage);
  process.exit(0);
}
