# Parser runtime bundles

The package validator uses **markdown-it 15.0.2**, with CommonMark blocks and
the default GFM table/strikethrough extensions. HTML parsing is enabled so
the validator can distinguish comments and raw HTML. Linkification and
typographic rewriting are disabled. This is not a claim of complete GFM
conformance (for example, no task-list plugin is included).

The Skill ships the parser at
`skills/architecture-decision-authoring/scripts/vendor/markdown-it.mjs`.
Copy the complete Skill directory as documented in the repository README;
running its validator requires Node.js and Git, but no npm installation or
network access. Node.js 24.19.0 was used for this rework's validation.

To rebuild from the repository root:

```sh
npm ci --prefix tools/markdown-parser --no-audit --no-fund
npm run build --prefix tools/markdown-parser
node --test skills/architecture-decision-authoring/scripts/validate-decision-package.test.mjs
```

Use an accessible npm cache (`npm --cache /workspace/scratch/npm-cache ...`)
if the cloud machine's default cache is read-only. The checked-in lockfile
pins the transitive dependencies and npm verifies their integrity. esbuild
0.28.2 produces the ESM runtime bundle; the generated full third-party
notices travel beside it. Review and commit the generated bundles and notices when
updating the build. Rebuilding from a frozen install must leave their bytes
unchanged.

**jsonc-parser 3.3.1** is bundled as `scripts/vendor/jsonc-parser.mjs` using
its ESM entry. JSON comments and trailing commas are disabled. The validator
checks each object's decoded keys for duplicates before native `JSON.parse`,
including nested objects and escaped names; keys in distinct objects remain
independent. Original JSON bytes are never rewritten.

`scripts/markdown-structure.mjs` consumes parser hierarchy and source maps.
Product checks require root-level marked ATX clauses and one root-level
traceability table. They exclude illustrative code and non-rendering
reference definitions, reject raw HTML tags outside code/comments throughout
Authority and traceability documents (including inline tags or HTML containers
that span parser block boundaries), reject invalid clause boundaries, and reject
GFM's silent padding or truncation of traceability columns. Only these
bounded format checks inspect source lines; they do not implement Markdown
block parsing. Reaching the parser's nesting limit fails closed because
the parser can omit deeper blocks. The validator never renders or serializes the approved
Proposal, Authority member, or amendment snapshot.

Regression fixtures are structural checks, not Skill end-to-end finalization
or Gatekeeper compatibility evidence. Those workflows remain separately
required by Issue #33; the parser does not introduce a Gatekeeper runtime
dependency or activate policy.
