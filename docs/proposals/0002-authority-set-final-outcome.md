# Architecture Decision Proposal: Make a Gatekeeper-compatible Authority Set the final product outcome

> **Document status:** Proposed
> **Prepared:** 2026-09-29
> **Decision owner:** Repository owner
> **Review by / time bound:** None known

## Decision question and scope

- **Question:** Should the product contract established by decision record 0001 be amended so that Architecture Decision Proposal is an intermediate artifact and the product's final outcome is a source-grounded Authority Set that Architecture Gatekeeper can select?
- **Scope and affected context:** Architecture Decision Authoring's product boundary, owner-outcome handoff, output artifacts, Gatekeeper compatibility target, and evaluation target. This proposal concerns this repository's product only.
- **Applicability conditions:** The proposed export follows an explicit owner outcome for one exact proposal revision. It applies to the first end-to-end vertical slice after v0.1.0.
- **Exceptions:** No export is produced when adoption is absent or pending, the outcome is Defer or Reject, required evidence is missing, or the adopted content cannot be isolated unambiguously.
- **Time bounds:** The recommended implementation scope is v0.2.0. Reassess after one complete example and the corresponding conversion evaluation; no permanent format mandate is proposed.

## Context and classified inputs

### Facts

- The v0.1.0 Skill produces a reviewable Architecture Decision Proposal. The release describes it as an experimental Proposal-authoring prototype. [v0.1.0 release](https://github.com/flair-agency/architecture-decision-authoring/releases/tag/v0.1.0)
- The public rehearsal in [Issue #29](https://github.com/flair-agency/architecture-decision-authoring/pull/29) measured the intermediate Proposal stage and recorded unfavorable findings and limitations; it did not evaluate Authority Set generation.
- The repository owner directed that Proposal is an intermediate artifact and that the desired final outcome is an Authority Set usable by Architecture Gatekeeper. [Issue #30](https://github.com/flair-agency/architecture-decision-authoring/issues/30) records this direction. This proposal has not yet amended the canonical product contract.
- Gatekeeper's distributed Authority Set contract selects Markdown documents using a version 1 JSON manifest. The selector identifies sources; it does not establish adoption, semantic correctness, precedence, or activation.
- Gatekeeper's current contract does not define a generic per-rule YAML/JSON ontology. Its parser requires the manifest keys `version` and `authorities`, and each member's keys `id`, `repository`, `revision`, and `path`. A local member uses `repository: "self"`, `revision: "authority-revision"`, and a `.md` path.

### Assumptions

- A user can supply an explicit owner outcome and authorization evidence in a form that the first version can record without authenticating the person's identity itself. If this is false, the handoff needs a consumer-specific authorization integration and the proposed self-contained slice is insufficient.
- One decision can be expressed as a coherent Markdown authority document. If it cannot, the workflow should stop and report the gap rather than split or normalize it into a new general-purpose ontology.

### Existing decisions

- Decision record [0001 — Use a Markdown-first, source-mapped proposal contract](../decisions/0001-markdown-first-proposal-contract.md) is adopted for the initial pilot. It defines reviewable Proposals as the initial output and keeps downstream artifacts separately owned. Its current target is the initial product contract in `docs/architecture.md`.
- The repository bootstrap process requires an explicit `Adopt`, `Amend`, `Defer`, or `Reject` outcome tied to an exact artifact revision and authorization evidence. A merge, status label, or generated artifact alone does not establish adoption. [Decision records](../decisions/README.md)
- Gatekeeper's selector is an input to its review route. A valid selector or compatibility result alone does not activate consumer policy or prove the meaning of the selected Markdown.

### Constraints and evidence

- The v0.1.0 final output ends at Proposal, so a user must still translate an adopted outcome into a Gatekeeper-selectable Authority Set. That missing handoff is the product gap identified by Issue #30.
- For a local `self` member, Gatekeeper resolves `authority-revision` at the recorded commit. Its selector requires valid stable IDs and `.md` paths and applies explicit size bounds. The development compatibility check must use a pinned Gatekeeper parser/materializer revision; a floating `main` reference cannot make a reproducible compatibility claim.
- Gatekeeper's compatibility parser validates selector structure and source resolution. It does not score whether the Markdown faithfully expresses the owner's decision. Structural compatibility and semantic fidelity therefore require separate evidence.

## Decision drivers

- The final delivered artifact should meet the user's stated outcome: an Authority Set that can be selected by Gatekeeper.
- No recommendation, assumption, generated wording, commit, or merge may be presented as an owner-adopted rule.
- The first implementation should be small enough to run end to end and evaluate against real output.
- Every normative statement in the Authority member must trace to explicit owner action, the exact Proposal revision, and supporting source material.
- Gatekeeper compatibility should be reproducible without making Gatekeeper a runtime dependency.
- The output must remain understandable as Markdown and must not invent a universal rule language.

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| Keep Proposal as the final product outcome | Preserves the adopted initial boundary and minimizes implementation work. | Leaves the final conversion to the user and does not meet the stated product outcome. Repeats the gap observed after v0.1.0. | Could be retained only if the owner changes the desired product outcome. |
| Add one explicit-owner-outcome to one-member Gatekeeper export path (recommended) | Completes one end-to-end user task; keeps the output concrete; permits direct compatibility and fidelity evaluation. | Requires amending the current contract, recording owner outcome evidence, and maintaining a pinned compatibility check. A single example cannot establish general effectiveness. | Limit v0.2 to one decision, one local Markdown member, and the Gatekeeper v1 selector. Stop on missing or ambiguous adoption input. |
| Define a general authority ontology or multi-format compiler | Could support broader policy authoring and multiple consumers later. | Adds abstract schemas, semantics, and compatibility obligations before evidence from one working path exists. Risks treating Gatekeeper-specific needs as universal. | Reconsider only after the bounded slice shows repeated needs that Markdown and the v1 selector cannot express. |

## Proposed decision

Amend the product endpoint from “prepare a reviewable Architecture Decision Proposal” to “prepare a reviewable Proposal and, after an explicit owner outcome, produce a source-grounded Authority Set selectable by Architecture Gatekeeper.” The Proposal remains an important intermediate artifact.

Implement the smallest v0.2 vertical slice for one decision:

1. Produce or ingest one Proposal and identify its exact revision.
2. Record an explicit owner outcome (`Adopt`, `Amend`, `Defer`, or `Reject`) with the exact Proposal revision, owner, decision date, adopted scope, applicability conditions, exceptions, and an authorization evidence URL or record ID.
3. For `Adopt`, export only the identified proposed content the owner adopted. For `Amend`, require the owner to supply or explicitly approve the resulting normative wording; bind that exact resulting content to an immutable content identity (for example, a SHA-256 digest and the recorded content snapshot) in the adoption record. Do not treat unversioned free text as the adopted result or invent the amendment. If a partial outcome cannot be represented unambiguously from explicitly identified content, stop without an export.
4. For `Defer`, `Reject`, pending outcome, missing evidence, or ambiguous adopted content, preserve the recorded outcome and produce no consumable Authority Set.
5. When export is allowed, produce one Markdown Authority member, one version 1 JSON selector with one local `self` member, and traceability from every normative clause to the owner outcome, Proposal, and source evidence.
6. Check manifest structure, bounded references, and compatibility using an exact pinned Gatekeeper parser/materializer revision in development. Exercise materialization from committed Markdown snapshots in the pinned test fixture, rather than reading an uncommitted working-tree file. Do not invoke Gatekeeper during authoring.
7. Report structural compatibility, traceability checks, pinned parser/materializer compatibility, semantic fidelity review, and consumer activation as distinct results. A generated selector does not install or activate policy; a consumer separately chooses whether to add it to Gatekeeper configuration and activate the selected policy.
8. After adoption, add a new decision record that amends decision record 0001's product endpoint and update the canonical product contract. Preserve 0001 unchanged as historical rationale; do not rewrite or supersede it.

Use a small artifact package such as:

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

The manifest follows Gatekeeper's v1 selector shape, with no extra keys:

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

The Markdown member carries the normative meaning. For an `Amend` outcome, the adoption record must identify the exact resulting content bytes by immutable identity, and the exported member must match that snapshot. Do not add a per-rule YAML/JSON schema; Gatekeeper v1 selects Markdown and does not supply such an ontology. The version 1 selector is a compatibility artifact, not evidence of adoption, consumer policy selection, or enforcement.

Keep evaluation proportional to this slice: preserve proposal-quality checks, then measure owner-outcome handling, conversion fidelity, traceability, selector/parser compatibility, Authority Set usability, and owner effort on the concrete example. Do not claim general effectiveness from a single example or the public rehearsal in #29.

## Consequences and conditional analysis

- **Expected consequences:** Users can reach a concrete Gatekeeper-selectable artifact after recording their decision; the owner retains authority; the handoff becomes inspectable and testable. Historical decision rationale remains stable because the amended endpoint is recorded as a new decision rather than by rewriting ADR 0001.
- **Costs and limits:** The first slice covers one local Markdown member and a single Gatekeeper selector version. A schema change requires an explicit reviewed compatibility update. Markdown remains semantically reviewable rather than mechanically proving that its wording matches the owner's intent.
- **Applicable analysis included:** This proposal uses Gatekeeper's normative contract, integration reference, and current parser implementation to define the narrow compatibility target.
- **Applicable analysis missing or deferred:** The exact Gatekeeper parser/materializer commit and committed Markdown fixture snapshot to pin must be chosen and recorded when implementing the slice. No compatibility run or end-to-end v0.2 example is claimed by this proposal.
- **Trade-offs accepted by this proposal:** Optimize for one complete, reviewable vertical slice before adding multiple members, external repositories, multiple output formats, precedence automation, or a generic authority ontology.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Adopt or amend this proposal's specific v0.2 scope and authorize recording the endpoint amendment in a new decision record and updating `docs/architecture.md`? | Issue #30 and the owner's conversation establish the desired endpoint, but this proposal and its exact revision still need an explicit repository outcome under the bootstrap process. | Canonical contract revision and implementation scope. | Before changing canonical authority or implementing the new responsibility. |

The exact Gatekeeper commit is a required implementation pin, but is a compatibility input to record during implementation; it does not reopen the product endpoint or require a separate product-level decision unless the available revision fails the proposed contract.

## Source map

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Current product endpoint and separation of Proposal from adoption | Existing decision | [`docs/architecture.md`](../architecture.md), “Purpose and boundary,” “Output contract,” and “Lifecycle and adoption boundary”; [decision record 0001](../decisions/0001-markdown-first-proposal-contract.md), “Decision” | Adopted initial pilot, 2026-09-28 | This is the current adopted contract; this proposal does not amend it. |
| User's desired final outcome and one-decision v0.2 slice | Fact / decision input | [Issue #30](https://github.com/flair-agency/architecture-decision-authoring/issues/30), “Owner direction,” “Correct Gatekeeper compatibility target,” and “Target v0.2 vertical slice” | 2026-09-29 | Captures requested direction; Issue #30 does not itself amend canonical authority. |
| Amendment history must remain immutable and traceable | Constraint | [`docs/decisions/README.md`](../decisions/README.md), “Repository bootstrap adoption rule”; [decision record 0001](../decisions/0001-markdown-first-proposal-contract.md) | Current repository process | This proposal recommends creating a new decision record for the changed endpoint; decision record 0001 remains historical and unchanged. |
| v0.1.0 output and its release status | Fact | [v0.1.0 release](https://github.com/flair-agency/architecture-decision-authoring/releases/tag/v0.1.0) | v0.1.0, 2026-09-29 | Experimental Proposal-authoring prototype; not evidence of Authority Set capability. |
| Rehearsal only evaluated the Proposal stage | Evidence | [PR #29](https://github.com/flair-agency/architecture-decision-authoring/pull/29), outputs and comparison record | 2026-09-29 | Public rehearsal; unfavorable findings remain visible; not held-out or general-effectiveness evidence. |
| Adoption outcome vocabulary and evidence rule | Existing decision | [`docs/decisions/README.md`](../decisions/README.md), “Repository bootstrap adoption rule” | Current repository process | A status label, PR, or merge is not adoption evidence. |
| Authority selector semantics and self revision behavior | Constraint | [Gatekeeper `docs/architecture.md`](https://github.com/flair-agency/architecture-gatekeeper/blob/main/docs/architecture.md), “Target contract: distributed authority” and “Initial local distributed-authority bounds” | Current published source at proposal preparation | The `main` URL moves; development validation must pin a commit. |
| Operational v1 manifest fields and bounds | Constraint | [Gatekeeper `docs/integration-reference.md`](https://github.com/flair-agency/architecture-gatekeeper/blob/main/docs/integration-reference.md), local/distributed Authority Set selector description | Current published source at proposal preparation | The documented self-review may use an evolved route; the first slice targets the v1 selector only. |
| Exact parser structure, key set, ID/path checks | Constraint | [Gatekeeper `src/authority-set.mjs`](https://github.com/flair-agency/architecture-gatekeeper/blob/main/src/authority-set.mjs), `parseAuthorityManifest`, `validPath`, and `validRepository` | Current checked local source revision `0d237261e7b6e958cdad551c2645197a8f8df404` | Local checkout is on a feature branch and behind its upstream; this SHA is evidence of inspected implementation, not the compatibility pin proposed for v0.2. |

## Adoption record

Leave pending until the authorized repository owner records an outcome for this exact proposal revision under [`docs/decisions/README.md`](../decisions/README.md). The desired final outcome is supplied owner direction; the proposed canonical amendment and implementation scope remain pending. If adopted, record the amendment to ADR 0001's product endpoint in a new ADR, update `docs/architecture.md`, and leave ADR 0001 unchanged as historical rationale.

- **Owner outcome:** Pending
- **Target artifact(s) and revision(s):** `docs/proposals/0002-authority-set-final-outcome.md` at the revision explicitly acted upon
- **Authorized owner/authority:** Repository owner under the bootstrap rule
- **Authorization evidence URL or record ID:** Pending
- **Date and adopted scope:** Pending
- **Applicability conditions:** Pending
- **Exceptions:** Pending
- **Current canonical architecture updated at:** Pending
- **Downstream artifacts explicitly adopted/derived:** None; a v1 selector does not activate consumer policy
