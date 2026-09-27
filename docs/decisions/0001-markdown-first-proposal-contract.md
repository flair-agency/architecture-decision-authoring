# Use a Markdown-first, source-mapped proposal contract

- **Status:** Proposed
- **Date:** 2026-09-27
- **Decision owner:** Unresolved; adoption authority and its evidence process have not yet been established.

## Context and project facts

This is a standalone project in design and pre-pilot. Its initial scope is to help prepare one architectural decision proposal from scattered evidence, constraints, alternatives, and unresolved questions. Issue [#2](https://github.com/flair-agency/architecture-decision-authoring/issues/2) asks for a concise product contract, the first decision record, and a Markdown-first proposal template compatible with an existing format such as MADR.

The current project boundary already excludes automatic architecture selection and approval enforcement, and excludes a Gatekeeper-specific core model or runtime. Proposals are for human review. These are project-scope facts and existing boundaries; this record does not claim the proposed artifact structure is already adopted.

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

## Proposed decision

Choose option 3 for the initial product contract and pilot. Use ordinary Markdown and a small set of familiar decision-record sections (context/problem, drivers, options, outcome/proposal, and consequences), supplemented by explicit fields for classification, source mapping, scope and applicability, conditions and exceptions, time bounds, unresolved owner choices, and adoption evidence.

Treat the MADR project as a format reference, not as a new dependency, endorsement, or wholesale adoption of its rules. The template may be incomplete when the source material or owner decision is incomplete, provided it marks gaps and remains useful for review. Keep this proposal contract independent from downstream schemas and runtime systems.

## Consequences and trade-offs

**Benefits:** proposals stay readable in ordinary repository review; sources and unknowns remain visible; the authoring workflow can finish usefully without inventing owner choices; consumers can adopt their own downstream mapping.

**Costs and limits:** Markdown is less constrained than a schema and may vary between authors; source maps and classification require careful authoring and review; an incomplete proposal can still need substantial human follow-up. This contract alone does not validate source authority or decision quality.

## Conditions, exceptions, and time bounds

This is a proposal for the initial pilot, not a permanent format mandate. Conditional analyses (for example, quantitative evaluation, diagrams, prototypes, migration plans, or security/privacy analysis) are included when the decision context calls for them; applicable missing analysis must be disclosed. No fixed expiry date is proposed. Revisit the choice after the comparative pilot or sooner if review shows that Markdown cannot preserve the necessary distinctions.

## Unresolved owner choices

- Who is authorized to adopt product-level decisions, and what evidence records that authorization?
- What review roles or minimum review process, if any, should the project require?
- Which parts of the proposed minimum contract should be evaluated as fixed pilot criteria versus exploratory questions?
- What consumer-specific process should maintain the current canonical architecture after an adopted decision?

Until these are resolved, this record remains Proposed. A future adopted decision must identify the authorized owner and authorization evidence; the status label alone is not proof.

## Source mapping

- [Issue #2](https://github.com/flair-agency/architecture-decision-authoring/issues/2): scope, deliverables, and acceptance criteria for this proposal.
- [Repository README](../../README.md): project stage, intended scope, and human-review boundary.
- [MADR project](https://github.com/adr/madr): external reference for a familiar decision-record format family. Only the general section pattern is referenced; no third-party text or license is reproduced here.
