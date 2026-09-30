#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { resolve, relative, sep, isAbsolute, win32 } from "node:path";

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

function markdownTableRows(content, expectedHeader, label) {
  const lines = content.toString("utf8").split(/\r?\n/);
  const { codeLines, visibleLines, htmlCommentLines, ambiguousHtmlCommentLines } = markdownContext(lines);
  if (ambiguousHtmlCommentLines.size > 0) errors.push(`${label} must not place content after a line-leading HTML comment`);
  const headerIndex = visibleLines.findIndex((line, index) => !codeLines.has(index)
    && !htmlCommentLines.has(index)
    && tableCells(line)?.join("|") === expectedHeader.join("|"));
  if (headerIndex < 0) {
    errors.push(`${label} must contain the required traceability table header`);
    return [];
  }
  if (codeLines.has(headerIndex + 1) || htmlCommentLines.has(headerIndex + 1)) {
    errors.push(`${label} must have a Markdown separator row after the header`);
    return [];
  }
  const separator = tableCells(visibleLines[headerIndex + 1]);
  if (!separator || separator.length !== expectedHeader.length || separator.some((cell) => !/^:?-{3,}:?$/.test(cell))) {
    errors.push(`${label} must have a Markdown separator row after the header`);
    return [];
  }
  const rows = [];
  for (let index = headerIndex + 2; index < visibleLines.length; index += 1) {
    const line = visibleLines[index];
    if (codeLines.has(index) || htmlCommentLines.has(index) || line.trim() === "") break;
    const cells = tableCells(line);
    if (!cells) break;
    if (cells.length !== expectedHeader.length) {
      errors.push(`${label} row ${index + 1} must have ${expectedHeader.length} columns`);
      break;
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
  const lines = content.toString("utf8").split(/\r?\n/);
  const { codeLines, visibleLines, comments, incompleteComment, rawHtmlBlockLines, htmlCommentLines, ambiguousHtmlCommentLines } = markdownContext(lines);

  const markerPattern = /^<!--\s*clause-id:\s*([A-Za-z0-9][A-Za-z0-9._:-]*)\s*-->$/;
  const markersByHeading = new Map();
  const markerLines = new Set();
  for (const current of comments) {
    if (!/^\s*clause-id\b/i.test(current.body)) continue;
    const match = current.start === current.end && lines[current.start].match(markerPattern);
    if (!match) {
      errors.push("authority clause ID comment must match the standalone `<!-- clause-id: ID -->` marker grammar");
      continue;
    }
    const index = current.start;
    markerLines.add(index);
    ids.push(match[1]);
    if (!markerImmediatelyPrecedesClause(lines, codeLines, index)) {
      errors.push(`authority clause marker ${match[1]} must be a standalone marker immediately before a normative Markdown clause`);
    } else {
      markersByHeading.set(index + 1, match[1]);
    }
  }
  if (incompleteComment && /^\s*clause-id\b/i.test(incompleteComment.body)) {
    errors.push("authority clause ID comment must match the standalone `<!-- clause-id: ID -->` marker grammar");
  }
  if (rawHtmlBlockLines.size > 0) {
    errors.push("authority.md must not contain raw HTML blocks because their rendered content cannot be clause-traced");
  }
  if (ambiguousHtmlCommentLines.size > 0) {
    errors.push("authority.md must not place content after a line-leading HTML comment");
  }
  const linkReferenceDefinitionLines = markdownLinkReferenceDefinitionLines(visibleLines, codeLines);
  validateAuthorityBlocks(visibleLines, codeLines, markerLines, markersByHeading, linkReferenceDefinitionLines, htmlCommentLines);
  return ids;
}

function markerImmediatelyPrecedesClause(lines, codeLines, markerIndex) {
  const nextIndex = markerIndex + 1;
  if (nextIndex >= lines.length || codeLines.has(nextIndex)) return false;
  const next = lines[nextIndex].trim();
  return /^##\s+\S/.test(next);
}

function validateAuthorityBlocks(lines, codeLines, markerLines, markersByHeading, linkReferenceDefinitionLines, htmlCommentLines) {
  let titleSeen = false;
  let activeClause = null;
  let activeClauseHasBody = false;

  for (let index = 0; index < lines.length; index += 1) {
    if (codeLines.has(index) || markerLines.has(index)) continue;
    const line = lines[index].trim();
    if (!line) continue;

    if (!titleSeen) {
      if (line !== "# Authority") errors.push('authority.md must begin with the neutral title "# Authority"');
      else titleSeen = true;
      continue;
    }
    if (line === "# Authority") {
      errors.push('authority.md may contain only one "# Authority" title');
      continue;
    }

    if (!htmlCommentLines.has(index) && isThematicBreak(line)) {
      errors.push(`authority.md must not use Markdown thematic breaks as clause content on line ${index + 1}`);
      continue;
    }

    if (!htmlCommentLines.has(index) && /^=+$/.test(line)) {
      errors.push(`authority.md must not use Setext headings or ambiguous horizontal rules on line ${index + 1}`);
      continue;
    }

    if (!htmlCommentLines.has(index) && markdownContainerHeading(line)) {
      errors.push(`authority.md must not place headings inside Markdown blockquote or list containers on line ${index + 1}`);
      continue;
    }

    const heading = htmlCommentLines.has(index) ? null : line.match(/^(#{1,6})\s+\S/);
    if (heading) {
      if (activeClause && !activeClauseHasBody) {
        errors.push(`Authority clause ${activeClause} must contain Markdown clause content before the next heading`);
      }
      if (heading[1].length !== 2) {
        errors.push("authority.md supports only marked level-two clause headings; nested or unmarked headings are not allowed");
        activeClause = null;
        activeClauseHasBody = false;
        continue;
      }
      activeClause = markersByHeading.get(index) ?? null;
      activeClauseHasBody = false;
      if (!activeClause) errors.push(`Authority heading on line ${index + 1} must be immediately preceded by a clause-id marker`);
      continue;
    }

    if (!activeClause) {
      errors.push(`authority.md has content outside a marked clause block on line ${index + 1}`);
    } else if (!linkReferenceDefinitionLines.has(index)) {
      activeClauseHasBody = true;
    }
  }

  if (!titleSeen) errors.push('authority.md must begin with the neutral title "# Authority"');
  if (activeClause && !activeClauseHasBody) {
    errors.push(`Authority clause ${activeClause} must contain Markdown clause content`);
  }
}

function isThematicBreak(line) {
  const value = line.trim();
  return /^(?:\*[ \t]*){3,}$/.test(value)
    || /^(?:_[ \t]*){3,}$/.test(value)
    || /^(?:-[ \t]*){3,}$/.test(value);
}

function markdownContainerHeading(line) {
  let value = line;
  let strippedContainer = false;
  while (true) {
    const blockquote = value.match(/^ {0,3}>[ \t]?/);
    if (blockquote) {
      value = value.slice(blockquote[0].length);
      strippedContainer = true;
      continue;
    }
    const listItem = value.match(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/);
    if (listItem) {
      value = value.slice(listItem[0].length);
      strippedContainer = true;
      continue;
    }
    break;
  }
  return strippedContainer && /^#{1,6}\s+\S/.test(value);
}

function markdownLinkReferenceDefinitionLines(lines, codeLines) {
  const ignored = new Set();
  for (let index = 0; index < lines.length; index += 1) {
    if (codeLines.has(index)) continue;
    const match = lines[index].match(/^ {0,3}\[((?:\\.|[^\[\]\\])+)\]:[ \t]*(.*)$/);
    if (!match) continue;

    const sameLine = parseLinkReferenceTail(match[2]);
    if (sameLine) {
      ignored.add(index);
      if (!sameLine.hasTitle && isLinkReferenceTitleLine(lines[index + 1], codeLines, index + 1)) ignored.add(index + 1);
      continue;
    }

    if (match[2].trim() !== "") continue;
    const destination = lines[index + 1]?.match(/^( {0,3})\S(.*)$/);
    if (!destination || codeLines.has(index + 1)) continue;
    const nextLine = lines[index + 1].slice(destination[1].length);
    const parsedDestination = parseLinkReferenceTail(nextLine);
    if (!parsedDestination) continue;
    ignored.add(index);
    ignored.add(index + 1);
    if (!parsedDestination.hasTitle && isLinkReferenceTitleLine(lines[index + 2], codeLines, index + 2)) ignored.add(index + 2);
  }
  return ignored;
}

function parseLinkReferenceTail(value) {
  const match = value.match(/^(<[^<>\s]*>|(?:\\.|[^\s])+)(?:[ \t]+("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?[ \t]*$/);
  return match ? { hasTitle: Boolean(match[2]) } : null;
}

function isLinkReferenceTitleLine(line, codeLines, index) {
  if (typeof line !== "string" || codeLines.has(index)) return false;
  const match = line.match(/^ {0,3}("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))[ \t]*$/);
  return Boolean(match);
}

function markdownContext(lines) {
  const codeLines = new Set();
  const rawHtmlBlockLines = new Set();
  const visibleLines = [];
  const comments = [];
  let fence = null;
  let comment = null;
  let rawHtmlBlock = null;
  const htmlCommentLines = new Set();
  const ambiguousHtmlCommentLines = new Set();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (fence) {
      codeLines.add(index);
      visibleLines.push("");
      const close = line.match(/^ {0,3}(`+|~+)\s*$/);
      if (close && close[1][0] === fence.character && close[1].length >= fence.length) fence = null;
      continue;
    }
    if (rawHtmlBlock) {
      codeLines.add(index);
      rawHtmlBlockLines.add(index);
      visibleLines.push("");
      if (rawHtmlBlock.blankTerminated ? line.trim() === "" : rawHtmlBlock.end.test(line)) rawHtmlBlock = null;
      continue;
    }
    if (comment?.lineLeading) htmlCommentLines.add(index);
    const lineLeadingComment = /^ {0,3}<!--/.test(line)
      && !/^<!--\s*clause-id:\s*[A-Za-z0-9][A-Za-z0-9._:-]*\s*-->$/.test(line);
    if (lineLeadingComment) htmlCommentLines.add(index);
    if (!comment && isIndentedCodeLine(line)) {
      codeLines.add(index);
      visibleLines.push("");
      continue;
    }
    if (!comment) {
      rawHtmlBlock = rawHtmlBlockStart(line);
      if (rawHtmlBlock) {
        codeLines.add(index);
        rawHtmlBlockLines.add(index);
        visibleLines.push("");
        if (!rawHtmlBlock.blankTerminated && rawHtmlBlock.end.test(line)) rawHtmlBlock = null;
        continue;
      }
    }
    let remainder = line;
    let visible = "";
    while (remainder.length > 0) {
      if (comment) {
        comment.end = index;
        const lineLeadingCommentBlock = comment.lineLeading;
        const commentEnd = remainder.indexOf("-->");
        if (commentEnd < 0) {
          comment.body += `\n${remainder}`;
          remainder = "";
          break;
        }
        comment.body += `\n${remainder.slice(0, commentEnd)}`;
        comments.push(comment);
        comment = null;
        remainder = remainder.slice(commentEnd + 3);
        if (lineLeadingCommentBlock && remainder.trim() !== "") ambiguousHtmlCommentLines.add(index);
        continue;
      }
      const commentStart = remainder.indexOf("<!--");
      if (commentStart < 0) {
        visible += remainder;
        remainder = "";
        break;
      }
      visible += remainder.slice(0, commentStart);
      const commentEnd = remainder.indexOf("-->", commentStart + 4);
      if (commentEnd >= 0) {
        comments.push({ start: index, end: index, body: remainder.slice(commentStart + 4, commentEnd) });
        remainder = remainder.slice(commentEnd + 3);
        if (lineLeadingComment && remainder.trim() !== "") ambiguousHtmlCommentLines.add(index);
      } else {
        comment = {
          start: index,
          end: index,
          body: remainder.slice(commentStart + 4),
          lineLeading: lineLeadingComment && visible.trim() === ""
        };
        remainder = "";
      }
    }

    visibleLines.push(visible);
    const fenceMatch = visible.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!htmlCommentLines.has(index) && fenceMatch && (fenceMatch[1][0] !== "`" || !fenceMatch[2].includes("`"))) {
      codeLines.add(index);
      fence = { character: fenceMatch[1][0], length: fenceMatch[1].length };
    }
  }
  return { codeLines, visibleLines, comments, incompleteComment: comment, rawHtmlBlockLines, htmlCommentLines, ambiguousHtmlCommentLines };
}

function rawHtmlBlockStart(line) {
  const openingTag = line.match(/^ {0,3}<(script|pre|style|textarea)(?:[\s/>]|$)/i);
  if (openingTag) return { end: new RegExp(`</${openingTag[1]}\\s*>`, "i") };
  if (/^ {0,3}<\?/.test(line)) return { end: /\?>/ };
  if (/^ {0,3}<!\[CDATA\[/i.test(line)) return { end: /\]\]>/ };
  if (/^ {0,3}<![A-Z]/.test(line)) return { end: />/ };
  if (/^ {0,3}<!--/.test(line)) return null;

  const blockTags = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
  if (new RegExp(`^ {0,3}</?(?:${blockTags})(?:[\\s/>]|$)[^>]*>`, "i").test(line)) {
    return { blankTerminated: true };
  }
  if (/^ {0,3}<\/?[A-Za-z][A-Za-z0-9-]*(?:\s+[^<>]*|\/?)>\s*$/.test(line)) {
    return { blankTerminated: true };
  }
  return null;
}

function isIndentedCodeLine(line) {
  if (line.trim() === "") return false;
  let columns = 0;
  for (const character of line) {
    if (character === " ") columns += 1;
    else if (character === "\t") columns += 4 - (columns % 4);
    else break;
  }
  return columns >= 4;
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
    if (typeof record[key] !== "string" || record[key].trim() === "") {
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
        if (typeof item !== "string" || item.trim() === "") {
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

const exportable = record.outcome === "Adopt" || record.outcome === "Amend";
const authorityPath = resolve(root, "authority-set", "authority.md");
const manifestPath = resolve(root, "authority-set", "manifest.json");

if (isPending || !exportable) {
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
