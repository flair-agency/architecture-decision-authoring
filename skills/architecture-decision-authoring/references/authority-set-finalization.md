# Authority Set finalization

Use this workflow only after an authorized owner has acted on one exact Proposal revision. The outcome must be explicit: `Adopt`, `Amend`, `Defer`, or `Reject`.

## Finalization gate

Before producing an Authority Set, require all of:

- the Proposal artifact and its exact immutable revision or content identity;
- the authorized owner or authority under the applicable process;
- an authorization evidence URL or record ID;
- the decision date, adopted scope, applicability conditions, and exceptions; and
- unambiguous normative content covered by the outcome.

For `Adopt`, use only proposed content explicitly identified by the owner. For `Amend`, require the exact resulting normative content supplied or explicitly approved by the owner, preserve its content snapshot, and record its SHA-256 digest. Never invent an amendment or promote rationale, assumptions, options, unresolved choices, or generated wording into Authority.

For `Defer`, `Reject`, `Pending`, a missing gate field, or ambiguous adopted content, record the supported outcome and blockers but produce no `authority-set/manifest.json` or Authority member.

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

Use JSON with these fields:

- `schemaVersion`: `1`
- `outcome`: `Adopt` or `Amend`
- `proposal.path`, `proposal.revision`, and `proposal.sha256`
- `owner`, `authorizationEvidence`, and `decisionDate`
- `scope`, `applicabilityConditions`, and `exceptions`
- `adoptedContent`: a non-empty list of stable clause IDs and exact Proposal locators for `Adopt`
- `amendedContent`: `null` for `Adopt`; for `Amend`, the snapshot path and SHA-256 digest of the exact owner-approved normative content

Do not claim to authenticate the owner or evidence unless a separate trusted mechanism establishes that assurance.

### Authority member

`authority.md` carries the normative meaning. Give every normative clause a stable ID using a standalone marker immediately before its clause, for example `<!-- clause-id: network-timeout -->`. IDs must be unique and stable across revisions. Include scope, conditions, exceptions, and review or expiry bounds when adopted. Exclude proposal rationale and alternatives unless the owner explicitly adopted them as normative content.

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

### Traceability

`traceability.md` must contain one row for every Authority clause ID and no other IDs, using this exact header and column order:

```markdown
| Clause ID | Authority locator | Owner outcome | Authorization evidence | Proposal revision | Proposal locator | Source evidence locator(s) |
| --- | --- | --- | --- | --- | --- | --- |
| network-timeout | clause-id:network-timeout | Adopt | https://example.invalid/decision/1 | abc123 | Proposed decision, “Timeout” | input/operations.md#timeout |
```

For each row, the Authority locator is `clause-id:<ID>`. Owner outcome, authorization evidence, and Proposal revision must exactly match the adoption record. For `Adopt`, the Proposal locator must exactly match that clause's `adoptedContent` locator. For either exportable outcome, Proposal and source-evidence locators must appear in the exact `proposal.md` bytes; list multiple source locators separated by semicolons, with each locator present in the Proposal. These checks establish a deterministic reference chain, not source authenticity or semantic equivalence.

For every Authority clause, map:

- stable clause ID and exact Authority locator;
- owner outcome and authorization-evidence locator;
- exact Proposal revision and adopted-content locator; and
- supporting source locators carried by the Proposal.

If any normative clause lacks the complete chain, finalization fails and no consumable Authority Set is returned.

### Validation result

Report these statuses separately; never collapse them into one `valid` claim:

- package and selector structure;
- reference bounds and file existence;
- clause-level traceability;
- compatibility with an exact pinned Gatekeeper parser/materializer revision, or `Not run`;
- semantic fidelity review, or `Pending`; and
- consumer selection/activation, normally `Not performed`.

Gatekeeper compatibility is a development check over committed fixture snapshots. Do not invoke Gatekeeper as part of authoring or imply that successful generation activates policy.

## Final check

Before returning a successful package, verify the exact Proposal bytes, all recorded digests, amended-member byte equality where applicable, JSON parsing, exact selector keys, referenced paths, outcome-specific fields, and the traceability chain. Write the consumable manifest only after these gates pass. State limitations without converting them into success claims.

Run `node scripts/validate-decision-package.mjs <decision-package-directory> [repository-root]` as the deterministic package-structure and fail-closed check. It also requires a unique stable-ID marker for each traceable Authority clause, exact coverage between Authority IDs and traceability rows, matching owner/evidence/revision references, and Proposal/source locators carried by the Proposal bytes. When omitted, `repository-root` defaults to the package directory's parent. Selector member paths are resolved from that repository root, while adoption-record paths are resolved inside the package. A successful result does not replace semantic fidelity review or a pinned Gatekeeper compatibility check.
