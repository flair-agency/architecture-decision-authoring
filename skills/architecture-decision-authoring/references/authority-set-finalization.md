# Optional Authority Set export

This is an optional interoperability path, used when requested or when the consumer cannot select its canonical authority directly. The normal completion path for a consumer with existing canonical authority is the [canonical integration handoff](../SKILL.md#canonical-integration-handoff). Use this export workflow only after an authorized owner has acted on one exact Proposal revision. The outcome must be explicit: `Adopt`, `Amend`, `Defer`, or `Reject`.

## Resume an interrupted export

Use the [resumption brief](../SKILL.md#resume-an-interrupted-decision) to reconcile the exact owner target, supported outcome, existing package placement, and checks actually completed. Canonical integration does not imply that an export was requested or produced. Before reusing a package, inspect its current bytes and recorded Git binding; do not report an old validation as covering changed files. Complete the existing finalization gate and checker for the current candidate. For a resumed no-export outcome with stale generated files, follow the manual quarantine instructions below; preserve unrelated files and do not claim no-export while an active Authority member or manifest remains.

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

For this package export, set `proposal.path` to exactly `proposal.md`; keep `amendedContent.path` relative to the package root. Set `proposal.revision` to the full 40- or 64-character Git commit ID that is locally available and contains the Proposal blob at this package's repository-relative `proposal.md` placement. The committed blob, packaged Proposal bytes, and recorded `proposal.sha256` must agree. A displayed revision label or content digest alone is not a substitute for this Git reference. This `proposal.md` placement is package-specific; the normal canonical-integration path uses the consumer's existing repository conventions.

Keep the owner outcome bound to the exact Proposal commit, path, blob, and digest it addressed. If that commit already places the Proposal as `proposal.md` within a directory, that directory can serve as the package root and preserve the same Git binding. If the normal Proposal path differs from the package's required `proposal.md` placement, separately authorized work may create a byte-identical copy at the package path. In that case, `proposal.revision` must identify the actual locally available commit and blob at the package placement; verify by readback that the copy's bytes and digest match the original owner-targeted Proposal. Preserve the original owner-targeted commit/path/blob/digest and its link to the outcome in the existing authorization-evidence and traceability material. Describe the package-placement revision as a binding for the byte-identical export copy, not as a new or changed adoption target. Do not rewrite the owner's target or infer adoption of another revision. Follow the user's intent and repository instructions for any such preparation and required reviews; do not impose a universal branch or worktree requirement. Before a package-placement commit, follow the [canonical handoff's commit safety instructions](../SKILL.md#canonical-integration-handoff): prevent untrusted repository-controlled hooks from running implicitly and run required consumer checks through separately trusted means. Do not silently skip required checks; if they cannot be run safely, report the concrete blocker. If the original target is unavailable or equivalence/readback cannot be verified, report the concrete blocker and produce no Authority member or manifest. Do not fetch Git objects or substitute different Proposal content. Run the bundled read-only package checker before reporting package validation as passing, and report its actual result.

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

For `Amend`, the exported Authority member bytes must exactly match the owner-approved content snapshot and its recorded SHA-256 digest. The snapshot need not be a separately supplied file: when the owner explicitly approves exact normative wording in the identified Proposal and its exact bytes and boundaries are unambiguous, preserve that byte sequence unchanged as the snapshot, compute its digest, and verify any digest the owner supplied. Do not request duplicate wording or reconfirmation solely to create a snapshot. If the approved wording, boundaries, or bytes are ambiguous, or cannot be isolated without normalization, stop and request a precise owner-approved replacement snapshot. If required context is absent from the approved snapshot, stop and request an owner-approved replacement snapshot rather than modifying it. Do not rewrite, normalize, annotate, or add clause wording inside the Authority member. Verify byte equality before writing the consumable manifest.

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
