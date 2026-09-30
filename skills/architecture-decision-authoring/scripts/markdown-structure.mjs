import markdown from "./vendor/markdown-it.mjs";

// Preserve parser hierarchy and source maps; never render/serialize approved
// content. Normalization happens only inside the parser's inspection copy.
function document(content, errors, label) {
  const source = content.toString("utf8");
  const lines = source.split(/\r\n|\n|\r/);
  const roots = [];
  const stack = [{ children: roots }];
  const tokens = markdown.parse(source, {});
  // The parser stops emitting blocks at maxNesting. Fail at that boundary
  // rather than accepting a document with potentially omitted headings.
  if (tokens.some((token) => token.nesting === 1 && token.level >= markdown.options.maxNesting - 1)) {
    errors.push(`${label} reaches the Markdown parser nesting limit; structure cannot be validated`);
  }
  for (const token of tokens) {
    if (token.nesting === -1) {
      stack.pop();
      continue;
    }
    const node = { token, children: [] };
    stack.at(-1).children.push(node);
    if (token.nesting === 1) stack.push(node);
  }
  return { roots, lines };
}

function* descendants(nodes) {
  for (const node of nodes) {
    yield node;
    yield* descendants(node.children);
  }
}

function hasVisibleText(node) {
  if (node.token.type === "fence" || node.token.type === "code_block") return false;
  if (node.token.type === "inline") {
    return node.token.children.some((token) =>
      (["text", "code_inline"].includes(token.type)
        && token.content.replace(/[\p{Default_Ignorable_Code_Point}\p{Cc}]/gu, "").trim() !== ""));
  }
  return node.children.some(hasVisibleText);
}

const commentPattern = /<!--([\s\S]*?)(?:-->|$)/g;
const markerPattern = /^<!--\s*clause-id:\s*([A-Za-z0-9][A-Za-z0-9._:-]*)\s*-->$/;

function commentSuffix(node) {
  // Only HTML tokens are inspected: code examples and escaped syntax are
  // already excluded by the established parser.
  if (node.token.type !== "html_block" || !node.token.content.trimStart().startsWith("<!--")) return "";
  return node.token.content.replace(commentPattern, "").trim();
}

export function authorityClauseIds(content, errors) {
  const { roots, lines } = document(content, errors, "authority.md");
  const markersByHeading = new Map();
  const ids = [];
  for (const node of descendants(roots)) {
    const { token } = node;
    const htmlTokens = token.type === "inline"
      ? token.children.filter((child) => child.type === "html_inline")
      : token.type === "html_block" ? [token] : [];
    for (const html of htmlTokens) {
      for (const comment of html.content.matchAll(commentPattern)) {
        if (!/^\s*clause-id\b/i.test(comment[1])) continue;
        const markerLine = token.map?.[0];
        const match = token.type === "html_block" && token.level === 0
          && token.map[1] === markerLine + 1 && lines[markerLine].match(markerPattern);
        if (!match || html.content.trim() !== match[0]) {
          errors.push("authority clause ID comment must match the standalone `<!-- clause-id: ID -->` marker grammar");
          continue;
        }
        ids.push(match[1]);
        const heading = roots.find((entry) => entry.token.type === "heading_open"
          && entry.token.map[0] === markerLine + 1 && entry.token.tag === "h2"
          && entry.token.markup === "##" && hasVisibleText(entry));
        if (!heading) {
          errors.push(`authority clause marker ${match[1]} must be a standalone marker immediately before a normative Markdown clause`);
        } else {
          markersByHeading.set(heading, match[1]);
        }
      }
    }
    if (token.type === "heading_open" && token.level !== 0) {
      errors.push(`authority.md must not place headings inside Markdown blockquote or list containers on line ${token.map[0] + 1}`);
    }
    if (token.type === "heading_open" && ["=", "-"].includes(token.markup)) {
      errors.push(`authority.md must not use Setext headings or ambiguous horizontal rules on line ${token.map[0] + 1}`);
    }
    if (token.type === "hr") {
      errors.push(`authority.md must not use Markdown thematic breaks as clause content on line ${token.map[0] + 1}`);
    }
    if (["blockquote_open", "list_item_open"].includes(token.type) && node.children.length === 0) {
      errors.push(`authority.md must not use an empty Markdown blockquote or list container as clause content on line ${token.map[0] + 1}`);
    }
    if (token.type === "html_block") {
      if (!token.content.trimStart().startsWith("<!--")) {
        errors.push("authority.md must not contain raw HTML blocks because their rendered content cannot be clause-traced");
      } else if (commentSuffix(node)) {
        errors.push("authority.md must not place content after a line-leading HTML comment");
      }
    }
  }

  let titleSeen = false;
  let activeClause = null;
  let activeClauseHasBody = false;
  const finishClause = () => {
    if (activeClause && !activeClauseHasBody) errors.push(`Authority clause ${activeClause} must contain Markdown clause content`);
  };
  for (const node of roots) {
    const { token } = node;
    if (["fence", "code_block"].includes(token.type)) {
      if (!titleSeen) errors.push('authority.md must begin with the neutral title "# Authority"');
      else if (!activeClause) errors.push(`authority.md has content outside a marked clause block on line ${token.map[0] + 1}`);
      continue;
    }
    const isTitle = token.type === "heading_open" && token.tag === "h1"
      && token.markup === "#" && lines[token.map[0]].trim() === "# Authority";
    if (!titleSeen) {
      if (isTitle) { titleSeen = true; continue; }
      errors.push('authority.md must begin with the neutral title "# Authority"');
    } else if (isTitle) {
      errors.push('authority.md may contain only one "# Authority" title');
      continue;
    }
    if (token.type === "heading_open") {
      finishClause();
      activeClause = markersByHeading.get(node) ?? null;
      activeClauseHasBody = false;
      if (token.tag !== "h2" || token.markup !== "##") {
        errors.push("authority.md supports only marked level-two clause headings; nested or unmarked headings are not allowed");
      } else if (!activeClause) {
        errors.push(`Authority heading on line ${token.map[0] + 1} must be immediately preceded by a clause-id marker`);
      }
      continue;
    }
    if (!activeClause) {
      // HTML suffixes are intentionally rejected even when the renderer
      // would absorb them into a comment block rather than a paragraph.
      if (token.type !== "html_block" || commentSuffix(node)) {
        errors.push(`authority.md has content outside a marked clause block on line ${token.map?.[0] + 1}`);
      }
    } else if (hasVisibleText(node)) {
      activeClauseHasBody = true;
    }
  }
  if (!titleSeen) errors.push('authority.md must begin with the neutral title "# Authority"');
  finishClause();
  return ids;
}

function cells(row) {
  return row.children.map((cell) => cell.children.find((entry) => entry.token.type === "inline")?.token.content.trim() ?? "");
}

// GFM pads short rows and discards surplus cells. The product's traceability
// format requires exact width, so inspect delimiters only on parser-confirmed
// table-row source lines. Escaped pipes are cell content, not delimiters.
function sourceColumns(line) {
  const value = line.trim();
  // The pinned table rule escapes a pipe whenever its immediately preceding
  // character is a backslash, including even-length runs. Do not impose
  // general Markdown backslash parity on that parser-specific table rule.
  const delimiters = [...value.matchAll(/(?<!\\)\|/g)].map((match) => match.index);
  if (delimiters.length === 0) return null;
  return delimiters.length + 1 - Number(delimiters[0] === 0)
    - Number(delimiters.at(-1) === value.length - 1);
}

export function markdownTableRows(content, expectedHeader, label, errors) {
  const { roots, lines } = document(content, errors, label);
  for (const node of descendants(roots)) {
    if (commentSuffix(node)) errors.push(`${label} must not place content after a line-leading HTML comment`);
  }
  const tables = roots.filter((node) => node.token.type === "table_open"
    && cells(node.children.find((entry) => entry.token.type === "thead_open").children[0]).join("|") === expectedHeader.join("|"));
  if (tables.length === 0) {
    errors.push(`${label} must contain the required traceability table header`);
    // Preserve the separator diagnosis when a header was parsed as prose
    // because an HTML comment interrupted the delimiter row.
    if (roots.some((node) => node.token.type === "paragraph_open"
      && node.children[0]?.token.content.includes(expectedHeader.join(" | ")))) {
      errors.push(`${label} must have a Markdown separator row after the header`);
    }
    return [];
  }
  if (tables.length !== 1) errors.push(`${label} must contain exactly one required traceability table`);
  const table = tables[0];
  const separatorLine = lines[table.token.map[0] + 1].trim().replace(/^\|/, "").replace(/\|$/, "");
  const separators = separatorLine.split("|").map((cell) => cell.trim());
  if (separators.length !== expectedHeader.length || separators.some((cell) => !/^:?-{3,}:?$/.test(cell))) {
    errors.push(`${label} must have a Markdown separator row after the header`);
    return [];
  }
  const rows = [];
  const body = table.children.find((entry) => entry.token.type === "tbody_open");
  for (const row of body?.children ?? []) {
    const columns = sourceColumns(lines[row.token.map[0]]);
    // Every parser-confirmed row belongs to the rendered table, including
    // non-delimited prose padded by GFM. Never truncate validation there.
    if (columns !== expectedHeader.length) {
      errors.push(`${label} row ${row.token.map[0] + 1} must have ${expectedHeader.length} columns`);
      continue;
    }
    rows.push(cells(row));
  }
  return rows;
}
