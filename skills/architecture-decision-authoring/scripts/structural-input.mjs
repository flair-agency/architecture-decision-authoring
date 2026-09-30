import { parseTree } from "./vendor/jsonc-parser.mjs";

// Preserve BOM characters so strict JSON retains its existing syntax rules.
export function utf8(content) {
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(content);
}

// Inspection only: never normalize, rewrite, or authenticate supplied content.
export function visibleText(value) {
  return typeof value === "string"
    && value.replace(/[\p{Default_Ignorable_Code_Point}\p{Cc}]/gu, "").trim() !== "";
}

export function strictJson(source) {
  const errors = [];
  const tree = parseTree(source, errors, {
    disallowComments: true, allowTrailingComma: false, allowEmptyContent: false
  });
  if (!tree || errors.length) throw new Error("invalid JSON");
  const pending = [tree];
  while (pending.length) {
    const node = pending.pop();
    if (node.type === "object") {
      const keys = new Set();
      for (const property of node.children ?? []) {
        const key = property.children[0].value;
        if (keys.has(key)) throw new Error(`duplicate JSON key ${JSON.stringify(key)} on offset ${property.offset}`);
        keys.add(key);
      }
    }
    pending.push(...(node.children ?? []));
  }
  // Retain native strict JSON semantics after checking the syntax tree for
  // duplicate decoded member names, including nested objects and escapes.
  return JSON.parse(source);
}
