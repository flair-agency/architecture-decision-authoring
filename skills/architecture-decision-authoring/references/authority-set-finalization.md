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

Preserve the supplied Proposal bytes in `proposal.md` when possible; otherwise record that it is a faithful copy and retain its immutable identity.

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

`authority.md` carries the normative meaning. Give every normative clause a stable ID. Include scope, conditions, exceptions, and review or expiry bounds when adopted. Exclude proposal rationale and alternatives unless the owner explicitly adopted them as normative content.

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

Before returning a successful package, verify digests, JSON parsing, exact selector keys, referenced paths, outcome-specific fields, and the traceability chain. State limitations without converting them into success claims.
