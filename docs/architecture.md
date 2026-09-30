# Product and artifact contract

**Document status: Adopted, with the product endpoint amended, the adoption-record state clarified on 2026-09-29, and the committed-Proposal binding adopted on 2026-09-30.** The initial Markdown-first, source-mapped Proposal contract was adopted on 2026-09-28 ([initial owner decision](https://github.com/flair-agency/architecture-decision-authoring/pull/8#issuecomment-5857199038)). The post-adoption Authority Set endpoint was adopted on 2026-09-29 for the bounded v0.2 slice ([explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/issues/30#issuecomment-5887904872); [decision record 0002](decisions/0002-authority-set-final-outcome.md)). The distinction between a pending process state and an owner outcome was explicitly adopted on 2026-09-29 ([decision record 0003](decisions/0003-pending-adoption-record.md); [owner outcome](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5891751901)). The Proposal revision binding to locally available committed bytes was adopted on 2026-09-30 ([decision record 0004](decisions/0004-bind-proposal-revision-to-committed-bytes.md); [owner outcome](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5902266341)). Owner: repository owner.

## Purpose and boundary

Architecture Decision Authoring is a standalone aid for taking one architectural decision from source-grounded authoring through an explicit owner outcome to a usable artifact. It helps an author organize source material, constraints, alternatives, trade-offs, and unresolved owner choices into a reviewable Proposal. After the owner acts, it may finalize the exact adopted result into a source-grounded Authority Set selectable by Architecture Gatekeeper.

The product is responsible for making those inputs distinguishable, producing a useful Proposal for human review, recording an explicit owner outcome, and—only where that outcome and the adopted content are unambiguous—producing the bounded Authority Set package defined below. It does not choose an architecture on the owner's behalf, turn constraints or evidence into owner decisions, approve a Proposal, enforce or activate policy, or update a consumer's canonical architecture automatically. Architecture Gatekeeper is an artifact-compatibility target, not a runtime dependency.

The v0.1.0 implementation is an experimental Proposal-authoring prototype. Authority Set finalization is an adopted product responsibility for v0.2.0, but is not yet implemented or validated. No general effectiveness claim follows from the adoption of this contract.

## Status of statements in this contract

- **Project facts:** this is a standalone early-stage project; v0.1.0 implements the Proposal-authoring stage for one decision at a time; the adopted Authority Set finalization stage remains unimplemented and unvalidated.
- **Adopted initial pilot contract:** the product prepares decision-ready Proposals but does not decide or adopt architecture for owners; it uses Markdown-first artifacts with source mapping, subject to reassessment after the comparative pilot. See the [initial owner decision](https://github.com/flair-agency/architecture-decision-authoring/pull/8#issuecomment-5857199038).
- **Adopted endpoint amendment:** after an explicit owner outcome, the product may finalize exact adopted content into the bounded Gatekeeper-compatible Authority Set package defined here. See [decision record 0002](decisions/0002-authority-set-final-outcome.md) and its [owner evidence](https://github.com/flair-agency/architecture-decision-authoring/issues/30#issuecomment-5887904872).
- **Adopted adoption-record state:** `Pending` is a process state, not an owner outcome. New records use `status: "Pending"` with `outcome: null` until an owner acts, then `status: "Decided"` with one of the four owner outcomes. See [decision record 0003](decisions/0003-pending-adoption-record.md) and its [owner evidence](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5891751901).
- **Adopted Proposal revision binding:** the validator checks an explicit Git top-level root and locally available full commit ID, requiring a regular Proposal blob at the package placement path to match the bundled bytes and SHA-256 without fetching objects. See [decision record 0004](decisions/0004-bind-proposal-revision-to-committed-bytes.md) and its [owner evidence](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5902266341).
- **Adopted non-goals and boundaries:** automatic architecture selection or approval enforcement; a Gatekeeper-specific core domain model or runtime; and treating generation, commit, merge, or a status label as adoption. Architecture Gatekeeper remains optional downstream.
- **Assumptions:** owners and proposers can provide or identify relevant source material; the intended reviewer can resolve or route unresolved choices. These assumptions need evaluation during the pilot.
- **Follow-up questions:** which conditional analyses provide enough value for different decision contexts and whether concrete conversion evidence justifies expanding beyond the one-decision, one-member v0.2 bounds. Consumer-specific canonical architecture, Gatekeeper configuration, and policy activation remain each consumer's responsibility.

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

The required intermediate output is a Markdown-first Architecture Decision Proposal. Its minimum useful content is:

- decision question, scope, affected context, applicability conditions, and known exceptions;
- relevant facts, assumptions, existing decisions, constraints, and source map;
- considered options and their material trade-offs;
- proposed decision and rationale, clearly distinguished from an adopted decision;
- unresolved owner choices and missing evidence;
- time bounds, review/expiry conditions, or an explicit statement that none are known.

Unknown information must be marked unknown, not invented. When a required choice or source is missing, the workflow may finish with an explicitly incomplete proposal if the remaining content still helps reviewers understand the question, evidence, options, and next owner decisions. Completeness does not require a recommendation when the evidence does not support one.

Additional artifacts are conditional on the decision's scope, risk, and evidence needs. Examples include diagrams, quantitative comparisons, prototypes, dependency or data-flow maps, migration and rollout plans, and security, privacy, or operational analyses. The proposal must say when a material analysis is applicable but absent; these examples are not a universal mandatory checklist.

The proposal structure borrows a small set of familiar decision-record sections compatible with the general MADR style. It does not define a new ADR standard or require a consumer to adopt a particular architecture vocabulary. See [the MADR project](https://github.com/adr/madr) for the referenced format family.

After an explicit owner outcome, the bounded finalization output is a decision package containing:

- the exact Proposal revision and an adoption record identifying the owner outcome, date, scope, applicability conditions, exceptions, and authorization evidence;
- for `Adopt`, only the exact proposed content identified by the owner; for `Amend`, only exact resulting normative wording supplied or explicitly approved by the owner and bound to an immutable content identity, with the exported member matching that approved snapshot;
- one Markdown Authority member containing the normative meaning;
- one Gatekeeper version 1 JSON selector containing one local `self` member with exactly `id`, `repository`, `revision`, and `path`;
- clause-level traceability from normative content to the owner outcome, Proposal, and source evidence; and
- validation results that distinguish selector structure, pinned Gatekeeper parser/materializer compatibility, semantic fidelity review, and consumer activation.

The selector is a compatibility artifact. It does not prove adoption, semantic fidelity, precedence, selection by a consumer, or policy activation. This contract does not introduce a generic authority ontology or per-rule YAML/JSON language.

## Lifecycle and adoption boundary

1. Gather materials and classify statements, constraints, existing decisions, and open questions.
2. Map material claims to sources and identify gaps or conflicts.
3. Develop options and compare their consequences, conditions, exceptions, and trade-offs.
4. Produce a proposal, complete or explicitly incomplete, for human review.
5. The authorized owner reviews it, resolves or routes owner choices, and decides whether to adopt, amend, defer, or reject it through the consumer's process. Review roles, if any, belong to the consumer's process.
6. Before the owner acts, record the state as `status: "Pending"` and `outcome: null`, bound to the exact Proposal path, full Git revision, and SHA-256 of its bytes. The package validator receives the package directory and an explicit repository root, which must be the Git top-level directory. It resolves the Proposal's repository-root-relative path at the recorded full commit ID, requires that the commit and regular-file blob exist in the local object database, and requires the blob bytes to equal the bundled Proposal bytes. The validator does not fetch objects; absent commits or blobs and mismatches fail validation. Do not populate owner, authorization evidence, decision date, scope, conditions, exceptions, or adopted/amended content in this pending record. A pending record contains no Authority member or selector. After the owner acts, record `status: "Decided"` and exactly one of `Adopt`, `Amend`, `Defer`, or `Reject`, with the required evidence and outcome-specific content. For `Adopt`, finalize only the identified proposed content. For `Amend`, require exact owner-supplied or explicitly approved resulting normative content. For `Defer`, `Reject`, missing adoption, missing evidence, or ambiguous adopted content, produce no consumable Authority Set.
7. Where export is allowed, produce the bounded decision package and report structural compatibility, semantic fidelity, and activation separately. The consumer separately decides whether to update canonical architecture, configure Gatekeeper, or activate the selected policy.

Generation, saving, committing, merging, or changing a document's status label does not by itself mean a proposal was approved or adopted. For each consumer, adoption remains unresolved until the owner and evidence are recorded through that consumer's process. New adoption records express this as `Pending` plus a null outcome; legacy records with no `status` remain readable only when they contain one of the four explicit outcomes and satisfy the prior record requirements. Never reinterpret a legacy `Defer` as pending. This repository's own bootstrap process is documented in [Decision records](decisions/README.md); it does not govern consumer decisions.

An adopted decision record is historical evidence of a decision in its stated scope and at its stated time. A consumer's current canonical architecture describes the currently adopted state. A generated Authority Set is a traceable representation of exact adopted content, but its selection and activation remain separately consumer-owned. These artifacts may link to one another, but they are not interchangeable.

## Downstream boundary

The core product does not invoke Gatekeeper while authoring or require its runtime services. It targets Gatekeeper's published Authority Set artifact contract and verifies development compatibility against an exact pinned parser/materializer revision by materializing committed Markdown fixture snapshots, not uncommitted working-tree content. Consumers choose whether and how to place the generated package in their repository, select it in Gatekeeper configuration, update canonical architecture, or activate enforcement. This repository does not authenticate downstream adoption or enforcement outcomes.

Related downstream discussions: [Architecture Gatekeeper #162](https://github.com/flair-agency/architecture-gatekeeper/issues/162) and [#167](https://github.com/flair-agency/architecture-gatekeeper/issues/167). These links track downstream work only; they do not establish a dependency or expand this product's core contract.
