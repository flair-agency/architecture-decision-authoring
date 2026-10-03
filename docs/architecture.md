# Product and artifact contract

**Document status: Adopted, with the product endpoint amended on 2026-10-04.** The initial Markdown-first, source-mapped Proposal contract was adopted on 2026-09-28 ([initial owner decision](https://github.com/flair-agency/architecture-decision-authoring/pull/8#issuecomment-5857199038)). The bounded Authority Set endpoint was adopted on 2026-09-29 ([explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/issues/30#issuecomment-5887904872); [decision record 0002](decisions/0002-authority-set-final-outcome.md)) and is retained as an optional interoperability path. On 2026-10-04 the repository owner amended the normal endpoint to canonical integration and a PR-ready Skill handoff ([owner outcome](https://github.com/flair-agency/architecture-decision-authoring/issues/69#issuecomment-5972202033); [decision record 0005](decisions/0005-canonical-integration-handoff.md)). Owner: repository owner.

## Purpose and boundary

Architecture Decision Authoring is a standalone aid for taking one architectural decision from source-grounded authoring through an explicit owner outcome to a review-ready change in a consumer's existing canonical architecture. For an existing canonical authority, the normal path commits the exact Proposal at a consumer-repository path chosen under its existing conventions before the owner outcome, then integrates the adopted content into that same working branch after the outcome. The Skill hands off the reviewed, PR-ready repository change; the consumer owns PR creation, merge, Gatekeeper selection, and activation. A Gatekeeper-compatible Authority Set remains an optional interoperability export, including when canonical authority cannot be selected directly.

The product is responsible for making inputs distinguishable, preserving the exact Proposal and owner outcome, and preparing a clause-mapped integration that preserves adopted meaning. It does not choose architecture on the owner's behalf, turn constraints or evidence into owner decisions, or apply a canonical change without explicit authorization under the consumer's existing process. If the canonical target is missing or inaccessible, it reports that concrete blocker and does not infer a target. If conflicting authority leaves adopted meaning unresolved, it presents the concrete alternatives to the authorized owner and does not resolve the conflict. It does not create or merge a PR, select Gatekeeper policy, or activate enforcement. Architecture Gatekeeper remains an optional artifact-compatibility target, not a runtime dependency.

The v0.1.0 implementation remains an experimental Proposal-authoring prototype. Current source also contains an experimental minimal v0.2.0 Authority Set finalization workflow and read-only package checker. A [synthetic walkthrough](../examples/issue-33-finalization-rehearsal/rehearsal-record.md), one bounded synthetic-content assessment, and compatibility materialization against pinned Gatekeeper 0.5.1 exercise the mechanics. They do not authenticate real owner actions, verify consumer activation, or establish general effectiveness.

## Status of statements in this contract

- **Project facts:** this is a standalone early-stage project; v0.1.0 is an experimental Proposal-authoring prototype; current source also contains an experimental minimal v0.2.0 finalization workflow and package checker, exercised with synthetic inputs and pinned Gatekeeper compatibility evidence only.
- **Adopted initial pilot contract:** the product prepares decision-ready Proposals but does not decide or adopt architecture for owners; it uses Markdown-first artifacts with source mapping, subject to reassessment after the comparative pilot. See the [initial owner decision](https://github.com/flair-agency/architecture-decision-authoring/pull/8#issuecomment-5857199038).
- **Adopted endpoint amendments:** decision record [0002](decisions/0002-authority-set-final-outcome.md) defines the bounded Authority Set package, now an optional interoperability export. Decision record [0005](decisions/0005-canonical-integration-handoff.md) defines the normal canonical-integration handoff after an exact Proposal commit and explicit owner outcome.
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

For a consumer with an existing canonical architecture, the normal completion path commits the exact Proposal at a repository-relative path chosen under the consumer's existing conventions before the owner outcome. Record its full commit, path, blob, and digest. After the explicit outcome, produce a reviewed, clause-mapped integration into that same working branch and hand off the PR-ready repository change to the consumer. Preserve the existing adoption record, exact Proposal-byte/commit binding, adopted-content rules, and stop conditions in this contract. The consumer owns PR creation, merge, and any subsequent Gatekeeper selection or activation.

When requested for interoperability or when canonical authority cannot be selected directly, the optional Gatekeeper export remains the bounded decision package defined here:

- the exact Proposal revision and an adoption record identifying the owner outcome, date, scope, applicability conditions, exceptions, and authorization evidence;
- for `Adopt`, only the exact proposed content identified by the owner; for `Amend`, only exact resulting normative wording supplied or explicitly approved by the owner and bound to an immutable content identity, with the exported member matching that approved snapshot;
- one Markdown Authority member containing the normative meaning;
- one Gatekeeper version 1 JSON selector containing one local `self` member with exactly `id`, `repository`, `revision`, and `path`;
- clause-level traceability from normative content to the owner outcome, Proposal, and source evidence; and
- validation results that distinguish selector structure, pinned Gatekeeper parser/materializer compatibility, semantic fidelity review, and consumer activation.

The selector is a compatibility artifact. It does not prove adoption, semantic fidelity, precedence, selection by a consumer, or policy activation. This contract does not introduce a generic authority ontology or per-rule YAML/JSON language.

The adoption record distinguishes a pending owner process from a decided outcome. A pending record has `status: "Pending"` and `outcome: null`; after an explicit owner action it has `status: "Decided"` and one outcome: `Adopt`, `Amend`, `Defer`, or `Reject`. A pending record preserves its Proposal reference and does not invent owner or decision metadata. For compatibility, a record without `status` may be treated as a legacy decided record only when it has one of those four outcomes and satisfies the prior validation requirements. A status label does not authenticate an owner outcome. See [decision record 0003](decisions/0003-pending-adoption-record.md).

For an optional package export, the packaged Proposal must match the Proposal blob at its package placement path in the locally available full 40- or 64-character Git commit identified by the adoption record, and its SHA-256 must match the packaged Proposal bytes. This package-specific placement requirement does not prescribe the Proposal path for the normal canonical-integration path. Validation uses the repository root supplied for the package and does not fetch missing Git objects. Missing or mismatched commits, blobs, or Proposal bytes fail validation. See [decision record 0004](decisions/0004-bind-proposal-revision-to-committed-bytes.md).

## Lifecycle and adoption boundary

1. Gather materials and classify statements, constraints, existing decisions, and open questions.
2. Map material claims to sources and identify gaps or conflicts.
3. Develop options and compare their consequences, conditions, exceptions, and trade-offs.
4. Produce a proposal, complete or explicitly incomplete, for human review. Where the consumer repository is available and authorized, commit the exact Proposal at a repository-relative path chosen under the consumer's existing conventions before the owner outcome; identify its full commit/path/blob/digest.
5. The authorized owner reviews that exact committed Proposal and decides whether to adopt, amend, defer, or reject it through the consumer's process. Review roles, if any, belong to the consumer's process.
6. Record the exact outcome and evidence. For `Adopt`, integrate only the identified proposed content; for `Amend`, require exact owner-supplied or explicitly approved resulting normative wording. For `Defer`, `Reject`, pending or missing adoption, missing evidence, or ambiguous adopted content, do not integrate or export.
7. For an existing canonical authority, prepare the clause-mapped change on the same working branch, preserving adopted scope/conditions/exceptions and unrelated content. If the target is missing or inaccessible, report that blocker; if conflict leaves meaning unresolved, present the concrete alternatives to the authorized owner and stop integration. Review the exact diff and hand off the PR-ready repository change; the consumer creates and merges any PR.
8. Produce the optional bounded package when requested or needed for interoperability. When the consumer Proposal path differs from the package's required `proposal.md` placement, perform the package-path Git preparation as separately authorized work and retain the full commit/blob/digest binding; run the existing checker unchanged. Report integration/readback, structural compatibility, semantic fidelity, Gatekeeper selection, and activation separately. The consumer controls PR merge, selection, and activation.

Generation, saving, committing, merging, or changing a document's status label does not by itself mean a proposal was approved or adopted. For each consumer, adoption remains unresolved until the owner and evidence are recorded through that consumer's process. The product must leave an adoption record blank or explicitly pending rather than fabricate one. This repository's own bootstrap process is documented in [Decision records](decisions/README.md); it does not govern consumer decisions.

An adopted decision record is historical evidence of a decision in its stated scope and at its stated time. A consumer's current canonical architecture describes the currently adopted state. A generated Authority Set is a traceable representation of exact adopted content, but its selection and activation remain separately consumer-owned. These artifacts may link to one another, but they are not interchangeable.

## Downstream boundary

The core product does not invoke Gatekeeper while authoring or require its runtime services. It targets Gatekeeper's published Authority Set artifact contract and verifies development compatibility against an exact pinned parser/materializer revision by materializing committed Markdown fixture snapshots, not uncommitted working-tree content. Canonical integration is prepared only under explicit consumer authorization and through its existing process; the Skill handoff does not create or merge a PR. Consumers control PR creation/merge, Gatekeeper selection, and activation. This repository does not authenticate downstream adoption or enforcement outcomes.

Related downstream discussions: [Architecture Gatekeeper #162](https://github.com/flair-agency/architecture-gatekeeper/issues/162) and [#167](https://github.com/flair-agency/architecture-gatekeeper/issues/167). These links track downstream work only; they do not establish a dependency or expand this product's core contract.
