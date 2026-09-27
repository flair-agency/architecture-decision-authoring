# Use a Markdown-first, source-mapped proposal contract

- **Status:** Adopted
- **Date:** 2026-09-28
- **Decision owner:** Repository owner
- **Authorization evidence:** [Public owner decision record](https://github.com/flair-agency/architecture-decision-authoring/pull/8#issuecomment-5857199038)
- **Adopted target:** Initial pilot contract in `docs/architecture.md` and this decision record, at revision [`70a892c`](https://github.com/flair-agency/architecture-decision-authoring/commit/70a892c59c2b5031842a64ad6b7797ca4365054a)

## Context and project facts

This is a standalone project in design and pre-pilot. Its initial scope is to help prepare one architectural decision proposal from scattered evidence, constraints, alternatives, and unresolved questions. Issue [#2](https://github.com/flair-agency/architecture-decision-authoring/issues/2) asks for a concise product contract, the first decision record, and a Markdown-first proposal template compatible with an existing format such as MADR.

The adopted scope is that this product prepares decision-ready proposals but does not decide or adopt architecture for owners. The initial pilot uses Markdown-first artifacts with source mapping. Automatic architecture selection and approval enforcement are out of scope; Architecture Gatekeeper remains optional downstream. The public authorization evidence is a coordinator transcription, not independent owner authentication.

## Decision drivers

- Keep the first authoring product independently useful and easy to inspect in review.
- Preserve traceability from claims to source material.
- Distinguish evidence and constraints from owner decisions.
- Make the minimum useful result possible even when owner choices remain open.
- Avoid presenting generated or stored content as an approval or adoption event.
- Leave room for consumers to use their own architecture language and downstream process.
- Keep the initial design small enough to evaluate in the planned pilot.

## Options considered

1. **Define a new structured ADR standard now.** This could make machine processing more uniform, but would require premature agreement on a broad schema and could imply universal concepts before the pilot establishes a need.
2. **Require a full existing ADR format unchanged.** This would inherit familiar sections, but would not by itself meet the project's source-mapping, classification, incompleteness, and adoption-boundary needs.
3. **Use a Markdown-first, source-mapped minimum contract with familiar MADR-style sections.** This supports direct human review while making this project's additional distinctions explicit; machine-readable conventions can be considered later if evidence justifies them.

## Decision

Adopt option 3 for the initial product contract and pilot. Use ordinary Markdown and a small set of familiar decision-record sections (context/problem, drivers, options, outcome/proposal, and consequences), supplemented by explicit fields for classification, source mapping, scope and applicability, conditions and exceptions, time bounds, unresolved owner choices, and adoption evidence.

Treat the MADR project as a format reference, not as a new dependency, endorsement, or wholesale adoption of its rules. The template may be incomplete when the source material or owner decision is incomplete, provided it marks gaps and remains useful for review. Keep this proposal contract independent from downstream schemas and runtime systems.

## Consequences and trade-offs

**Benefits:** proposals stay readable in ordinary repository review; sources and unknowns remain visible; the authoring workflow can finish usefully without inventing owner choices; consumers can adopt their own downstream mapping.

**Costs and limits:** Markdown is less constrained than a schema and may vary between authors; source maps and classification require careful authoring and review; an incomplete proposal can still need substantial human follow-up. This contract alone does not validate source authority or decision quality.

## Conditions, exceptions, and time bounds

This adoption applies to the initial pilot, not as a permanent format mandate. Conditional analyses (for example, quantitative evaluation, diagrams, prototypes, migration plans, or security/privacy analysis) are included when the decision context calls for them; applicable missing analysis must be disclosed. Reassess the contract after the comparative pilot or sooner if review shows that Markdown cannot preserve the necessary distinctions. For decisions in this repository, no mandatory reviewer is required during the pilot.

## Follow-up questions

- Which conditional analyses provide enough value across different decision contexts to merit guidance in the minimum contract?
- What comparative-pilot findings should trigger a change to the minimum Markdown-first contract?
- Does the pilot demonstrate a need for machine-readable structure, and if so, what is the smallest useful addition?

These questions do not suspend the adopted initial pilot contract. Consumer-specific governance and maintenance of current canonical architecture remain outside this repository's authority.

## Source mapping

- [Issue #2](https://github.com/flair-agency/architecture-decision-authoring/issues/2): scope, deliverables, and acceptance criteria for the initial product contract.
- [Repository README](../../README.md): project stage, intended scope, and human-review boundary.
- [MADR project](https://github.com/adr/madr): external reference for a familiar decision-record format family. Only the general section pattern is referenced; no third-party text or license is reproduced here.
- [Public owner decision record](https://github.com/flair-agency/architecture-decision-authoring/pull/8#issuecomment-5857199038): adoption outcome and pilot limits, transcribed by the coordinator.
