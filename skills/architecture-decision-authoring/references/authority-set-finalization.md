# Authority Set finalization

Use this workflow with one exact Proposal revision. Before an authorized owner acts, record a `Pending` process state. After the owner acts, record exactly one outcome: `Adopt`, `Amend`, `Defer`, or `Reject`; unknown values fail validation.

## Finalization gate

Before producing an Authority Set, require all of:

- the Proposal artifact and its exact immutable revision or content identity;
- the authorized owner or authority under the applicable process;
- an authorization evidence URL or record ID;
- the decision date, adopted scope, applicability conditions, and exceptions; and
- unambiguous normative content covered by the outcome.

For `Adopt`, use only proposed content explicitly identified by the owner. For `Amend`, require the exact resulting normative content supplied or explicitly approved by the owner, preserve its content snapshot, and record its SHA-256 digest. Never invent an amendment or promote rationale, assumptions, options, unresolved choices, or generated wording into Authority.

Before the owner has acted, record `status: "Pending"` and `outcome: null`, with only the exact Proposal reference alongside the version and state fields. Do not fill in owner, authorization evidence, date, scope, conditions, exceptions, adopted content, or amended content. A pending record must not include or leave `authority-set/manifest.json` or an Authority member. Validate its Proposal path, full Git revision, and SHA-256 against the exact Proposal bytes.

After an owner action, use `status: "Decided"` and one of the four outcome tokens. For `Defer`, `Reject`, or a decided record whose adoption gate is incomplete or ambiguous, record the supported outcome and blockers but produce no selector or Authority member. These no-export decided records still require the common evidence, including owner, authorization evidence, date, scope, applicability conditions, and exceptions. Adopt/Amend-specific content requirements apply only to those outcomes. Never use `Defer` as a substitute for a decision that has not happened.

## Successful package

Produce a self-contained package with this minimum shape:

```text
decision-package/
  proposal.md
  adoption-record.json
  authority-set/
    manifest.json
    authority.md
  traceability.md
  validation-result.json
```

Preserve the exact owner-targeted Proposal bytes in `proposal.md` and verify that their SHA-256 digest matches the adoption record before finalization. If the exact bytes cannot be obtained, stop and produce no consumable Authority Set; a normalized, reconstructed, or merely faithful copy is not an acceptable substitute.

### Adoption record

For a pending decision, use exactly this minimal JSON shape (replace the Proposal revision and digest with the exact values):

```json
{
  "schemaVersion": 1,
  "status": "Pending",
  "outcome": null,
  "proposal": {
    "path": "proposal.md",
    "revision": "0123456789abcdef0123456789abcdef01234567",
    "sha256": "<sha256-of-exact-proposal-bytes>"
  }
}
```

This pending record contains no owner-decision fields and no Authority Set. `Pending` with a non-null outcome, `status: "Decided"` with a missing/null/unknown outcome, and `outcome: "Pending"` are invalid.

After the owner acts, use JSON with these fields:

- `schemaVersion`: `1`
- `status`: `Decided`
- `outcome`: exactly one of `Adopt`, `Amend`, `Defer`, or `Reject`; `Defer` and `Reject` produce no Authority Set
- `proposal.path`, `proposal.revision`, and `proposal.sha256`; `proposal.revision` is a full immutable Git commit ID (40- or 64-character hexadecimal)
- `owner`, `authorizationEvidence`, and `decisionDate`
- `scope`, `applicabilityConditions`, and `exceptions`; conditions and exceptions are arrays of non-empty strings, with an empty array meaning none are recorded
- `adoptedContent`: a non-empty list of stable clause IDs and exact Proposal locators for `Adopt`
- `amendedContent`: `null` for `Adopt`; for `Amend`, the snapshot path and SHA-256 digest of the exact owner-approved normative content

For compatibility, a record with no `status` is treated as a legacy decided record only if it has one of the four explicit outcomes and passes every prior validation. Do not convert an existing `Defer` record to `Pending`.

Do not claim to authenticate the owner or evidence unless a separate trusted mechanism establishes that assurance.

### Authority member

`authority.md` carries the normative meaning and uses a bounded Markdown form for deterministic validation: begin with the neutral `# Authority` title, then represent each clause as a level-two (`##`) heading immediately preceded on the prior line by its standalone stable-ID marker, for example `<!-- clause-id: network-timeout -->`. Each marked heading begins a clause block that continues until the next heading or end of file and must contain clause text. Do not put normative content outside marked clause blocks or use unmarked/nested headings. Use ATX headings only; Setext headings are rejected, and standalone `---` lines are rejected because they can be read as either a Setext heading underline or a thematic break. Fenced and indented code is illustrative only: markers, headings, and text inside a code example are not clauses. Outside code, any HTML comment beginning with `clause-id` must match the exact standalone marker grammar or validation fails. IDs must be unique and stable across revisions. Include scope, conditions, exceptions, and review or expiry bounds when adopted. Exclude proposal rationale and alternatives unless the owner explicitly adopted them as normative content.

For `Amend`, the exported Authority member bytes must exactly match the owner-approved content snapshot and its recorded SHA-256 digest. Do not rewrite, normalize, annotate, or add clause wording inside that member. If stable IDs or required context are absent from the approved snapshot, stop and request an owner-approved replacement snapshot rather than modifying it. Verify byte equality before writing the consumable manifest.

### Selector

Use exactly the Gatekeeper version 1 one-member local selector shape, with no additional keys:

```json
{
  "version": 1,
  "authorities": [
    {
      "id": "adopted-decision",
      "repository": "self",
      "revision": "authority-revision",
      "path": "decision-package/authority-set/authority.md"
    }
  ]
}
```

The manifest selects Markdown. It is not adoption evidence, a semantic rule ontology, Gatekeeper configuration, or policy activation.

The member `id` must follow Gatekeeper's stable-ID syntax: 1–64 characters, starting with a lowercase ASCII letter and followed only by lowercase ASCII letters, digits, or hyphens. For example, `decision-a` is valid.

### Traceability

`traceability.md` must contain one contiguous Markdown table for every Authority clause ID and no other IDs, using this exact header and column order. Only the table whose header is followed by the required separator and contiguous rows is package data; indented-code or fenced examples are ignored. The table ends at the first blank line, prose, non-table line, or indented code block. Do not place detached pipe-delimited rows after it.

```markdown
| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |
| --- | --- | --- | --- | --- | --- | --- |
| network-timeout | clause-id:network-timeout | Adopt | https://example.invalid/decision/1 | 0123456789abcdef0123456789abcdef01234567 | Proposed decision, “Timeout” | input/operations.md#timeout |
```

For each row, the Authority locator is `clause-id:<ID>`. Owner outcome, authorization evidence, and Proposal revision must exactly match the adoption record. For `Adopt`, the Proposal locator must exactly match that clause's `adoptedContent` locator. For either exportable outcome, Proposal and source-evidence locators must appear in the exact `proposal.md` bytes; list multiple source locators separated by semicolons, with each locator present in the Proposal. These checks establish a deterministic reference chain, not source authenticity or semantic equivalence.

For every Authority clause, map:

- stable clause ID and exact Authority locator;
- owner outcome and authorization-evidence locator;
- exact Proposal revision and adopted-content locator; and
- supporting source locators carried by the Proposal.

If any normative clause lacks the complete chain, finalization fails and no consumable Authority Set is returned.

### Validation result

`validation-result.json` must use this version 1 shape and report each dimension separately; never collapse them into one `valid` claim:

```json
{
  "schemaVersion": 1,
  "packageStructure": "pass",
  "referenceBounds": "pass",
  "clauseTraceability": "pass",
  "gatekeeperCompatibility": { "status": "not-run", "pinnedRevision": null },
  "semanticFidelity": { "status": "pending" },
  "consumerActivation": { "status": "not-performed" }
}
```

The deterministic validator requires `pass` for package/selector structure, reference bounds, and clause traceability. Gatekeeper compatibility is `pass`, `fail`, or `not-run`; a run requires a full 40-character commit SHA, while `not-run` requires a null revision. Semantic fidelity is `pass`, `fail`, or `pending`. Consumer activation is `performed` or `not-performed`. These explicit states preserve the distinction between checks that passed and checks that have not been evaluated.

Gatekeeper compatibility is a development check over committed fixture snapshots. Do not invoke Gatekeeper as part of authoring or imply that successful generation activates policy.

## Final check

Before returning a successful package, verify the exact Proposal bytes, all recorded digests, amended-member byte equality where applicable, JSON parsing, exact selector keys, referenced paths, outcome-specific fields, and the traceability chain. Write the consumable manifest only after these gates pass. State limitations without converting them into success claims.

Run `node scripts/validate-decision-package.mjs <decision-package-directory> [repository-root]` as the deterministic package-structure and fail-closed check. It also requires a Gatekeeper-valid member ID, a unique stable-ID marker for each traceable Authority clause, exact coverage between Authority IDs and traceability rows, matching owner/evidence/revision references, Proposal/source locators carried by the Proposal bytes, and the complete version 1 validation-result status set. Every referenced file is checked both lexically and by its resolved filesystem path; symlinks that escape the package or repository root fail validation. When omitted, `repository-root` defaults to the package directory's parent. Selector member paths are resolved from that repository root, while adoption-record paths are resolved inside the package. A successful result does not replace semantic fidelity review or a pinned Gatekeeper compatibility check.
