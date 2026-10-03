# Architecture Decision Proposal: Integrate adopted decisions into consumer canonical authority

> **Document status:** Proposed  
> **Prepared:** 2026-10-04  
> **Decision owner:** Repository owner  
> **Review by / time bound:** None known

## Decision question and scope

- **Question:** Should ADA support integrating exact owner-adopted content into an existing consumer canonical architecture and make the Gatekeeper package an optional generated export, while retaining the exact Proposal and existing adoption record as durable inputs?
- **Scope:** ADA product boundary, canonical integration, durable artifact layout, and optional export for one decision in one identified consumer repository.
- **Applicability:** The consumer owner has explicitly adopted/amended exact Proposal content; the canonical target and base are identified; and the consumer's existing process authorizes the integration.
- **Exceptions:** Pending, Defer, Reject, missing evidence/bytes, unavailable Git objects, ambiguous adopted scope, or meaning-changing conflict means no integration. Gatekeeper selection and activation remain separate.
- **Time bound:** Proposed for experimental v0.4.0, subject to the owner outcome and release gates; no release commitment is made here.

## Context and classified inputs

### Facts and constraints

- Adopted ADA authority permits an Authority Set after an explicit owner outcome, while leaving consumer canonical updates and activation separately owned. See [`docs/architecture.md`](../architecture.md), “Purpose and boundary,” “Output contract,” “Lifecycle and adoption boundary,” and “Downstream boundary”; decisions [0001](../decisions/0001-markdown-first-proposal-contract.md)–[0004](../decisions/0004-bind-proposal-revision-to-committed-bytes.md).
- The v0.3.0 exact Git binding remains correct: the committed Proposal blob at its package placement must match packaged bytes and digest. Trial #65 found a missing authorized preparation/resumption path, not a reason to weaken validation. ([#65](https://github.com/flair-agency/architecture-decision-authoring/issues/65).)
- Trial #66 found that the adopted fragment was not integrated into canonical authority. It calls for an exact target/base, clause mapping, duplicate/conflict handling, and preservation of unrelated decisions. ([#66](https://github.com/flair-agency/architecture-decision-authoring/issues/66).)
- Trial #67 calls for reviewing duplication and a smaller durable record. It treats optional export and migration as design candidates, not adopted requirements. ([#67](https://github.com/flair-agency/architecture-decision-authoring/issues/67).)
- The actual AGK #259 package at commit [`3641064`](https://github.com/flair-agency/architecture-gatekeeper/tree/3641064e782706afaa430178dbe65c855325eeec/docs/decisions/agk-259/decision-package) contains eight files. Its validation result does not establish canonical integration or activation.
- ADA's read-only checker validates package mechanics, not owner/evidence authenticity, semantic fidelity, canonical placement, or activation. Gatekeeper remains an artifact target, not a core runtime dependency.

### Existing decisions and assumptions

Decisions 0001–0004 and `docs/architecture.md` are adopted ADA authority. They do not authorize canonical-integration responsibility. A status label, commit, merge, or generated artifact is not adoption evidence.

This proposal assumes the consumer can identify its canonical file and exact base and can authorize/review a diff through its existing process. If not, report the blocker and do not claim integration. Keep the Proposal exact and immutable; use the existing `adoption-record.json` fields and package placement where possible. Capture owner evidence in a separate file only when the applicable process supplies no precise, durable URI or record ID.

## Drivers and options

Complete the authorized decision path, preserve exact provenance, avoid inferred semantic changes, reduce duplicate durable files, and keep existing v0.3 packages usable.

| Option | Benefits | Costs / risks | Trade-off |
| --- | --- | --- | --- |
| Keep export-only endpoint and eight durable files | No new integration responsibility. | Adopted content may remain disconnected; duplication and manual Git handoff remain. | Keep if owner declines integration or prefers the package as endpoint. |
| Add integration and keep eight files durable | Integrates canonical authority while retaining all artifacts. | Preserves the duplication reported in #67. | Reconsider if a smaller record cannot preserve needed evidence. |
| **Integrate; retain Proposal plus adoption record; generate export on request (recommended)** | Consumer canonical file becomes current normative source; exact decision inputs remain; export/checker stay available. | Requires reviewed integration and reproducible export. | Generate the existing minimum six-file package at its bound package path; no checker weakening. |
| Replace package/checker with a new schema | Could support later automation. | New schema and migration costs without trial evidence. | Defer. |

## Proposed decision — exact wording for owner review

The following is proposed, not adopted:

> **Canonical integration.** After an authorized owner adopts or amends exact normative content, ADA may prepare a clause-mapped integration into the consumer's identified existing canonical architecture. Record the exact canonical target and base, adopted Proposal locators, owner outcome/evidence, and resulting consumer pull request or commit reference in a human-readable integration record linked from the adoption record. Keep that link optional so existing v0.3 adoption records and the checker remain compatible. Preserve adopted scope, conditions, exceptions, and unrelated canonical content. Identify matching, duplicate, conflicting, and apparently superseded clauses with source locators. An exact duplicate may be recorded as already represented. Do not infer precedence, resolve a conflict, or broaden, narrow, omit, or replace adopted meaning. Return a meaning-changing conflict to the authorized owner with concrete alternatives; apply no integration until resolved. Under explicit authorization and the consumer's existing process, ADA may prepare, review, apply, commit, and read back the exact approved diff. That process determines whether the change becomes canonical. Integration, placement, export, validation, Gatekeeper selection, and activation are distinct states.
>
> **Durable record and export.** Keep the exact Proposal at the existing package placement `proposal.md` and retain the existing `adoption-record.json` with its current schema and fields as the durable outcome/provenance record. Its existing Proposal commit/blob/digest binding remains mandatory. The consumer's existing canonical architecture is the current normative source after its process accepts the integration; the Proposal and adoption record preserve history. When Gatekeeper export is requested, generate the existing minimum six-file package—`proposal.md`, `adoption-record.json`, `authority-set/authority.md`, `authority-set/manifest.json`, `traceability.md`, and `validation-result.json`—at that same package placement and run the unchanged checker. Optional `owner-evidence.md` is needed only when no precise durable evidence URI/record ID is available; `README.md` is explanatory and optional. No new mandatory schema is introduced. Core authoring and integration do not invoke Gatekeeper.
>
> **Git preparation under current contract.** For #65, when the Proposal and owner intent are clear and repository permissions allow, prepare the unchanged Proposal at the required package path, complete applicable precommit review, commit it, and resume existing validation without asking the owner to repeat an outcome solely to obtain the binding. If authorization, bytes, access, review, or Git objects are unavailable, report the specific blocker. Do not retarget the outcome, change Proposal bytes, fetch missing objects as a substitute, or weaken validation. This is implementation of the existing exact-binding contract, not a new owner decision.

## Concrete AGK #259 inventory and proposed layout

| Existing file | Current role | Proposed treatment |
| --- | --- | --- |
| `proposal.md` | Exact decision; adopted paragraph is repeated in Authority member. | Durable at the same path; bind its committed blob and digest in existing adoption record. |
| `adoption-record.json` | Outcome, Proposal identity, owner, scope/conditions, adopted locator. | Durable at the same path; retain current fields/schema. |
| `owner-evidence.md` | Transcription referenced by adoption record. | Conditional only when no precise durable external evidence URI/record ID exists. |
| `authority-set/authority.md` | Repeats adopted text; was not canonically integrated. | Generate on export; consumer canonical document is current authority. |
| `authority-set/manifest.json` | Gatekeeper selector. | Generate on export. |
| `traceability.md` | Maps normative text to sources/outcome. | Generate on export from Proposal locators and adoption record. |
| `validation-result.json` | Point-in-time package checks. | Generate on export/check; retain only if consumer process needs that run record. |
| `README.md` | Package explanation. | Optional generated explanation; maintain guidance in ADA docs. |

**Before:** eight files in the AGK #259 trial package; canonical `docs/architecture.md` unchanged. **After, proposed:** two durable files at the same `decision-package/proposal.md` and `decision-package/adoption-record.json` paths; four required export files are generated on request; evidence capture and README are conditional. Legacy packages remain unchanged.

## Proposed canonical contract delta

If adopted, record a new decision and amend these exact `docs/architecture.md` locators; preserve unrelated content:

| Current locator | Proposed replacement/addition |
| --- | --- |
| “Purpose and boundary,” product-responsibility paragraph, sentence beginning “It does not choose…” | Replace with: “It does not choose architecture on the owner's behalf, turn constraints or evidence into owner decisions, approve a Proposal, enforce or activate policy, or update a consumer's canonical architecture without explicit authorization under that consumer's existing process. When authorized, it may support integration of exact adopted content into that consumer's identified canonical architecture. Architecture Gatekeeper is an artifact-compatibility target, not a runtime dependency.” |
| “Output contract,” paragraph beginning “After an explicit owner outcome…” | Replace its lead with: “The durable outcome is the exact Proposal and existing adoption record at their package placement. When requested and the finalization gates pass, produce the bounded Gatekeeper-compatible export containing:” Retain the existing six member/content requirements that follow. |
| “Lifecycle and adoption boundary,” step 7 | Replace with: “Where authorized, prepare and review a clause-mapped integration against the identified canonical target/base and apply it through the consumer's existing process; record the resulting reference/readback. Export the bounded package when requested. Report canonical integration, structural compatibility, semantic fidelity, Gatekeeper selection, and activation separately. The consumer controls acceptance, selection, and activation.” |
| “Downstream boundary,” final boundary sentence | Clarify that an authorized integration may be prepared/applied under the consumer's existing process; retain no core Gatekeeper invocation and separate selection/activation. |

## Compatibility, migration, and limits

Keep v0.3.0 source/assets and existing packages byte-identical. Keep the checker unchanged. Export uses the same committed Proposal placement and existing adoption fields, then generates the four required companions; it cannot export against an arbitrary uncommitted or differently placed Proposal. Record the canonical integration target/base, clause mappings, PR/commit, and readback in a human-readable consumer integration record; the existing adoption record may link to it through an optional reference, without a new mandatory schema. Migration is opt-in and non-destructive: verify the Proposal commit/blob/digest and evidence locator; retain old files; do not synthesize missing provenance. This proposal uses one qualitative trial, not the comparative evaluation in ADA #3/#6. No integration fixture or consumer canonical readback has yet been run for this Proposal.

## Owner decision requested

Adopt the exact proposed canonical-integration and two-durable-file/optional-export contract above, amend it with exact replacement wording, defer, or reject. This decision is needed before implementing #66/#67 responsibility or changing the artifact contract. The #65 preparation/resumption correction is compatible with existing authority and may proceed independently under its existing permissions and review requirements.

## Source map

| Claim | Class | Source and locator | Limitation |
| --- | --- | --- | --- |
| Current ADA boundary and package contract | Existing decision | [`docs/architecture.md`](../architecture.md), sections named above; decisions 0001–0004 | Current authority; proposal does not amend it. |
| #65 Git handoff gap | Evidence | [ADA #65](https://github.com/flair-agency/architecture-decision-authoring/issues/65) | Does not weaken exact binding or grant per-repository authorization. |
| #66 canonical integration gap | Evidence | [ADA #66](https://github.com/flair-agency/architecture-decision-authoring/issues/66) | One trial; no canonical integration completed. |
| #67 artifact burden/design candidates | Evidence | [ADA #67](https://github.com/flair-agency/architecture-decision-authoring/issues/67) | One eight-file package; no repeated-decision measurement. |
| Exact eight-file inventory | Fact | [AGK #259 package at `3641064`](https://github.com/flair-agency/architecture-gatekeeper/tree/3641064e782706afaa430178dbe65c855325eeec/docs/decisions/agk-259/decision-package) | Does not prove integration or activation. |
| v0.4.0 work sequence and scope | Planning input | [ADA #69](https://github.com/flair-agency/architecture-decision-authoring/issues/69) | Planning agreement does not adopt this contract. |

## Adoption record

- **Owner outcome:** Pending
- **Target artifact:** This Proposal. Record its exact commit and digest after the final bytes are fixed; do not update this file with its own digest.
- **Authorized owner/authority:** Repository owner under the ADA bootstrap rule.
- **Authorization evidence:** Pending
- **Date and adopted scope:** Pending; proposed scope is the exact wording above, one decision and one consumer repository.
- **Applicability/exceptions:** Pending owner action; proposed bounds and stop cases are stated above.
- **Canonical disposition:** ADA canonical architecture remains unchanged pending adoption. No AGK canonical update is proposed here.
- **Downstream artifacts:** None; no export, consumer integration, selection, or activation is performed by this Proposal.
