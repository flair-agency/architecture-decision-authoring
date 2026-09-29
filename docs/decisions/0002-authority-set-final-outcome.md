# Produce a Gatekeeper-compatible Authority Set after owner adoption

- **Status:** Adopted
- **Decision date:** 2026-09-29
- **Decision owner:** Repository owner
- **Authorization evidence:** [explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/issues/30#issuecomment-5887904872)
- **Target proposal:** [`docs/proposals/0002-authority-set-final-outcome.md`](../proposals/0002-authority-set-final-outcome.md) at `cb3a16b1e98a99cc54f075d67c253ac7cc944676`

## Context

Decision record 0001 established a Markdown-first, source-mapped Architecture Decision Proposal as the initial pilot output. The v0.1.0 prototype made that intermediate artifact concrete and exposed a product gap: after an owner acts on a proposal, the user still has to translate the adopted result into an Authority Set that Architecture Gatekeeper can select.

## Decision

Amend the product endpoint while preserving the owner boundary. Architecture Decision Authoring prepares a reviewable Proposal and, only after an explicit owner outcome, may finalize it into a source-grounded Authority Set selectable by Architecture Gatekeeper.

The first implementation slice is deliberately bounded to:

- one decision and its exact Proposal revision;
- an explicit `Adopt`, `Amend`, `Defer`, or `Reject` owner outcome with authorization evidence;
- for `Adopt`, only the exact proposed content identified by the owner;
- for `Amend`, only exact resulting normative content supplied or explicitly approved by the owner and bound to an immutable content identity;
- one local Markdown Authority member and one Gatekeeper version 1 JSON selector;
- clause-level traceability to the owner outcome, Proposal, and source evidence; and
- separate reporting of structural compatibility, semantic fidelity, and consumer activation.

`Defer`, `Reject`, a pending outcome, missing evidence, or ambiguous adopted content produces no consumable Authority Set. Generation does not activate policy. Consumers separately choose whether to configure and use the artifact with Gatekeeper.

Gatekeeper is an artifact-compatibility target, not an authoring runtime dependency. The first slice does not introduce a generic authority ontology, a per-rule YAML/JSON language, multiple members, or external repositories.

## Relationship to decision record 0001

This decision amends the product endpoint established by [decision record 0001](0001-markdown-first-proposal-contract.md). It does not rewrite or invalidate 0001's historical rationale, source-mapped Proposal contract, or owner-adoption boundary. The Proposal remains the required intermediate artifact.

## Consequences

- Users can complete the intended path from evidence to an owner-controlled, Gatekeeper-selectable Authority Set.
- The product must validate conversion fidelity and compatibility in addition to Proposal quality.
- The implementation must stop rather than infer adoption or normative wording.
- Compatibility with Gatekeeper must be tested against an exact pinned parser/materializer revision without invoking Gatekeeper during authoring.
- v0.1.0 remains a Proposal-authoring prototype; this adopted responsibility is not implemented or validated merely by adopting this decision.

## Conditions and exceptions

This decision applies to the v0.2.0 vertical slice described above and must be reassessed after one complete example and conversion evaluation. The exceptions and stop conditions in the target proposal are adopted without expansion.
