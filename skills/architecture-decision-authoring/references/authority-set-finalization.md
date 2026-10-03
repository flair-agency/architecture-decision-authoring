# Authority Set finalization

Use this workflow only after an authorized owner has acted on one exact Proposal revision. The outcome must be explicit: `Adopt`, `Amend`, `Defer`, or `Reject`.

## Exact outcome handoff

During the active review, keep the exact Proposal revision and its scope identifiable. When the owner gives an outcome, use the revision and scope clearly addressed in that conversation; do not require a redundant confirmation or repeated identifier when there is one unambiguous target and clear intent. If more than one revision or scope is active, the response is ambiguous, or it is unclear whether the owner means an older or newer revision, ask only for the missing target, scope, or intent. If the owner clearly names an older revision, retain that target. Never retarget a response about an older revision to a newer draft.

A brief, source-grounded explanation, question, or request to draft a change is not an outcome. For an amendment, draft a separate revision, preserve the prior Proposal bytes, show the exact resulting normative text and its scope/condition/exception changes, and keep it Proposed until the owner explicitly approves that exact text. Do not treat the natural-language request itself as approval. Explanations and draft presentation do not mutate the prior Proposal, adoption record, or Authority. A new draft is a separate Proposal revision, and an explicit owner outcome is recorded under the existing gate below. These steps introduce no additional identity or approval layer.

## Finalization gate

Before producing an Authority Set, require all of:

- the Proposal artifact and its exact immutable revision or content identity;
- the authorized owner or authority under the applicable process;
- an authorization evidence URL or record ID;
- the decision date, adopted scope, applicability conditions, and exceptions; and
- unambiguous normative content covered by the outcome.

For `Adopt`, use only proposed content explicitly identified by the owner. For `Amend`, require the exact resulting normative content supplied or explicitly approved by the owner, preserve its content snapshot, and record its SHA-256 digest. Never invent an amendment or promote rationale, assumptions, options, unresolved choices, or generated wording into Authority.

For `Defer`, `Reject`, `Pending`, a missing gate field, or ambiguous adopted content, record the supported outcome and blockers but produce no `authority-set/manifest.json` or Authority member.

The safest place to prepare a candidate is a fresh package directory. If a
reused directory already contains output from an earlier successful run, stop
and do not report the no-export result as complete while those artifacts remain
in the active package. Move the known generated files
(`authority-set/authority.md`, `authority-set/manifest.json`, `traceability.md`,
and `validation-result.json`) outside that package directory, preserving
unrelated or unidentified files. Then verify that no Authority member or
manifest remains before reporting no-export. This is explicit manual
quarantine, not an automatic cleanup mechanism; the read-only checker does not
modify prior artifacts. Report any blocking or cleanup issue clearly.

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
- `adoptedContent`: for `Adopt`, a non-empty list identifying the exact Proposal locators for content the owner adopted
- `amendedContent`: `null` for `Adopt`; for `Amend`, the snapshot path and SHA-256 digest of the exact owner-approved normative content

Do not claim to authenticate the owner or evidence unless a separate trusted mechanism establishes that assurance.

### Authority member

`authority.md` carries the normative meaning. Include scope, conditions, exceptions, and review or expiry bounds when adopted. Exclude proposal rationale and alternatives unless the owner explicitly adopted them as normative content.

For `Amend`, the exported Authority member bytes must exactly match the owner-approved content snapshot and its recorded SHA-256 digest. Do not rewrite, normalize, annotate, or add clause wording inside that member. If required context is absent from the approved snapshot, stop and request an owner-approved replacement snapshot rather than modifying it. Verify byte equality before writing the consumable manifest.

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

For every normative Authority clause, map:

- exact Authority locator;
- owner outcome and authorization-evidence locator;
- exact Proposal revision and Proposal locator identifying adopted content; and
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

The bundled read-only package checker can be run from the Skill directory with `node scripts/validate-decision-package.mjs <decision-package-directory> <repository-root>`. Its JSON report separates package validation from clause-level traceability, semantic fidelity, owner/evidence authenticity, Gatekeeper compatibility, and consumer activation. A package-validation pass does not establish those separately reported properties.
