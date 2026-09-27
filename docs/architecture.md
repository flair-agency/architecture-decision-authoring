# Product and artifact contract

**Document status: Proposed.** This document is the canonical place for the product contract once adopted by the authorized owner. Its location and status label do not themselves establish adoption. Until then, treat the contract below as a reviewable proposal.

## Purpose and boundary

Architecture Decision Authoring is a standalone aid for preparing a reviewable proposal about one architectural decision at a time. It helps an author organize source material, constraints, alternatives, trade-offs, and unresolved owner choices.

The product is responsible for making those inputs distinguishable and producing a useful proposal for human review. It does not choose an architecture on the owner's behalf, turn constraints or evidence into owner decisions, approve a proposal, enforce policy, or update a consumer's canonical architecture automatically. It has no runtime dependency on a downstream review or enforcement product. Consumers may use exported proposals or explicitly adopted decisions as inputs to their own processes.

The project is in design and pre-pilot. No capability or evaluation result is claimed as validated.

## Status of statements in this contract

- **Project facts:** this is a standalone, pre-pilot project; its stated purpose is to help prepare one decision proposal at a time; outputs are for human review.
- **Existing project scope statements:** the README says the project does not make decisions for owners or automatically approve/adopt proposals. It also describes a standalone product boundary. No separate evidence of formal owner adoption for these statements is recorded yet; do not treat their publication as proof of adoption.
- **Explicit non-goals in the current scope:** automatic architecture selection or approval enforcement, a Gatekeeper-specific core domain model or runtime, and treating generation, commit, merge, or a status label as adoption.
- **Assumptions:** owners and proposers can provide or identify relevant source material; the intended reviewer can resolve or route unresolved choices. These assumptions need evaluation during the pilot.
- **Proposed contract:** the input classes, minimum proposal structure, lifecycle, and downstream boundary in this document and the linked template.
- **Unresolved owner choices:** the authorized owner and evidence/recording mechanism for adoption; any required review or approval roles; how a consumer-specific canonical architecture is maintained; which conditional analyses the pilot should evaluate.

These categories must not be collapsed. In particular, an asserted fact may be unverified, an assumption is not a fact, and neither is an owner decision.

## Input classification and source mapping

Every material statement used to prepare a proposal must be classified, or explicitly marked unknown:

| Class | Meaning | Treatment |
| --- | --- | --- |
| Fact | A claim about the product, system, or environment | Record its source and the relevant passage, location, date, or other locator; qualify uncertainty rather than overstating it. |
| Assumption | A premise used because evidence is incomplete or unavailable | State why it is needed and what would change if it is false. |
| Existing decision | A decision already made by an authorized owner | Record its scope, status, owner/authority if known, date, source, conditions, and exceptions. Do not infer adoption from a file name or status label. |
| Constraint or evidence | A requirement, limit, observation, or supporting material | Preserve its source and applicability. It informs options but is not automatically an owner decision. |
| Option | A possible course of action, including deferral or no change where relevant | Present its consequences and trade-offs without representing it as selected. |
| Proposed decision | The author's recommended outcome for review | Label it as a proposal and explain its rationale and limits. |
| Unresolved owner choice | A question that requires the authorized owner's judgment or authority | State the question, why it matters, and what depends on its resolution. Do not silently fill it in. |

Use a source map that links each material fact, constraint, existing decision, and material claim to its source and locator. Identify missing, conflicting, stale, or inaccessible sources. The product should preserve provenance; it does not certify that a source is authentic or authoritative.

## Output contract

The default output is a Markdown-first Architecture Decision Proposal. Its minimum useful content is:

- decision question, scope, affected context, applicability conditions, and known exceptions;
- relevant facts, assumptions, existing decisions, constraints, and source map;
- considered options and their material trade-offs;
- proposed decision and rationale, clearly distinguished from an adopted decision;
- unresolved owner choices and missing evidence;
- time bounds, review/expiry conditions, or an explicit statement that none are known.

Unknown information must be marked unknown, not invented. When a required choice or source is missing, the workflow may finish with an explicitly incomplete proposal if the remaining content still helps reviewers understand the question, evidence, options, and next owner decisions. Completeness does not require a recommendation when the evidence does not support one.

Additional artifacts are conditional on the decision's scope, risk, and evidence needs. Examples include diagrams, quantitative comparisons, prototypes, dependency or data-flow maps, migration and rollout plans, and security, privacy, or operational analyses. The proposal must say when a material analysis is applicable but absent; these examples are not a universal mandatory checklist.

The proposal structure borrows a small set of familiar decision-record sections compatible with the general MADR style. It does not define a new ADR standard or require a consumer to adopt a particular architecture vocabulary. See [the MADR project](https://github.com/adr/madr) for the referenced format family.

## Lifecycle and adoption boundary

1. Gather materials and classify statements, constraints, existing decisions, and open questions.
2. Map material claims to sources and identify gaps or conflicts.
3. Develop options and compare their consequences, conditions, exceptions, and trade-offs.
4. Produce a proposal, complete or explicitly incomplete, for human review.
5. The authorized owner reviews it, resolves or routes owner choices, and decides whether to adopt, amend, defer, or reject it through the consumer's process.
6. If adopted, the owner records the authorization and updates the consumer's current canonical architecture or other authoritative record. A decision record explains a decision and its rationale; it is not automatically the current architecture description.

Generation, saving, committing, merging, or changing a document's status label does not by itself mean a proposal was approved or adopted. Until the owner and evidence are recorded through an agreed process, adoption is unresolved. The product must leave an adoption record blank or explicitly pending rather than fabricate one.

An adopted decision record is historical evidence of a decision in its stated scope and at its stated time. A consumer's current canonical architecture describes the currently adopted state. A downstream selected policy, contract, or authority artifact is separately owned and must be explicitly derived or adopted by that consumer. These artifacts may link to one another, but they are not interchangeable.

## Downstream boundary

The core product emits human-reviewable artifacts and does not require downstream schemas, terminology, tools, or runtime services. Consumers choose whether and how to import or translate an adopted result into their own architecture and governance systems. This repository does not authenticate downstream adoption or enforcement outcomes.

Related downstream discussions: [Architecture Gatekeeper #162](https://github.com/flair-agency/architecture-gatekeeper/issues/162) and [#167](https://github.com/flair-agency/architecture-gatekeeper/issues/167). These links track downstream work only; they do not establish a dependency or expand this product's core contract.
