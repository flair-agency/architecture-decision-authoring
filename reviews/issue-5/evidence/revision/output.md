# Architecture Decision Proposal: Pelagic Archive checksum processing boundary

> **Document status:** Proposed; Incomplete for approving a catalog-side amendment
> **Prepared:** 2026-09-28
> **Decision owner:** Iona, archive owner, as identified in Decision 14
> **Review by / time bound:** Decision 14’s 2026-08-01 review checkpoint has passed. Replacement review date is unresolved; the existing decision has not expired.

## Decision question and scope

- **Question:** Should Decision 14 revision 3 be amended to permit catalog-side checksum workers for accession batches up to 8 TB, given the pilot results?
- **Scope and affected context:** The checksum execution and source-image transfer boundary between Pelagic Archive’s storage account and the catalog service. This proposal is a separate review artifact and does not modify Decision 14.
- **Applicability conditions:** Accession batches received by Pelagic Archive, up to 8 TB each—the existing decision’s scope. The pilot provides evidence for only one synthetic 6 TB batch. [A1, B1–B2]
- **Exceptions:** Collections whose loan agreements require lender-appliance checksum computation remain on that workflow. The proposed amendment would preserve this exception. [A3]
- **Time bounds:** Decision 14 remains in force until an authorized replacement explicitly supersedes it. No amendment effective date or new review deadline is established. [A4]
- **Excluded decisions:** Storage vendor selection, image retention duration, and deduplication policy remain outside this proposal. Batches above 8 TB require separate consideration. [A1, A5]

## Context and classified inputs

### Facts

- The request seeks a revision proposal, not changes to the existing record, with a planning date of 2026-09-28. [R]
- The pilot report states that no signed replacement or amendment of Decision 14 appears in the supplied materials. This establishes the packet’s contents, not the absence of records elsewhere. [B4]
- The 2026-08-01 review checkpoint precedes the planning date. Passing that checkpoint does not expire Decision 14. Whether a review occurred is unknown. [A4, R]

### Assumptions

- **Potential value of faster processing:** Reduced checksum computation time could improve accession throughput. This motivates considering an amendment; its operational value depends on transfer overhead and whether checksum computation is a bottleneck.
- **Worker boundary:** The “catalog-side worker” is treated as outside the archive storage account’s approved processing boundary. The report’s comparison supports this interpretation, but account placement, access controls, and service ownership need confirmation. If this interpretation is wrong, the amendment’s technical scope could change. [A2, B1–B2]

### Existing decisions

- **Decision 14, revision 3:** The supplied record identifies Iona as archive owner and states that signed authorization record **AR-14-20260310** explicitly approved revision 3 on **2026-03-10** for accession batches up to 8 TB. Its status is recorded as Adopted. The signature is asserted by the supplied record; independent verification and a separately supplied authorization record are unavailable. [A1]
- **Processing and authority boundary:** Compute checksums within the archive storage account; send checksum results, not source images, to the catalog service; the catalog service may not delete originals. [A2]
- **Exception:** A collection requiring lender-appliance computation under its loan agreement continues that workflow. [A3]
- **Review and continuity:** Review by 2026-08-01; this is a checkpoint, not an expiry. The decision remains effective until an authorized replacement explicitly supersedes it. [A4]
- **Decision limits:** Vendor selection, image retention duration, and deduplication policy were not decided. [A5]

### Constraints and evidence

- **Performance evidence:** One synthetic 6 TB batch took 5 hours on an isolated catalog-side worker versus 8 hours within the archive storage account. Transfer time and cost were excluded, so this is computation-time evidence, not evidence of faster or cheaper end-to-end processing. [B1]
- **Data movement evidence:** The worker received complete source-image copies; originals remained in the archive account. Preserving originals does not satisfy the existing results-only transfer boundary. [A2, B2]
- **Coverage limits:** No lender collection, damaged image, or batch above 6 TB was tested. Checksum correctness comparisons and broader reliability results are not supplied. [B2]
- **Review limits:** The pilot had no confidentiality or loan-agreement review. Rui explicitly states that he cannot authorize the recommended change. [B3]

The existing decision and pilot recommendation differ materially: A2 requires archive-account computation and results-only transfer, while B3 recommends catalog-side computation using the approach tested with complete image copies. The pilot supplies evidence and an option; it does not supersede A2.

## Decision drivers

- **End-to-end benefit:** Determine whether the observed computation-time improvement survives transfer overhead and cost. [B1]
- **Source-image control:** Evaluate the consequences of placing complete image copies outside the existing boundary. [A2, B2–B3]
- **Correctness and operational reliability:** Establish behavior beyond a single synthetic batch, including damaged images and the proposed 8 TB upper bound. [B1–B2]
- **Contractual compliance:** Preserve lender-appliance obligations and establish how eligible collections are identified. [A3, B3]
- **Clear authorization:** Preserve the current decision until the archive owner explicitly authorizes a replacement. [A1, A4, B3–B4]

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| **1. Defer amendment; retain Decision 14 revision 3** | Preserves the authorized boundary and lender exception; avoids introducing source-image transfers before review. | Defers a possible processing improvement; the pilot’s archive-side run took longer. | Continue existing scope and controls. Resolve the overdue review checkpoint. New end-to-end and governance evidence could change the comparison. |
| **2. Propose a bounded amendment for an explicitly defined subset, initially no broader than 6 TB** | Allows controlled evaluation of catalog-side processing while limiting the proposed expansion relative to 8 TB. | Requires transfer, confidentiality, contractual, correctness, and operational analysis. A 6 TB ceiling alone does not establish safety or general reliability. | Owner must define eligible batches, worker controls, copy handling, stop/review criteria, and authorization. Preserve lender exceptions and the prohibition on catalog deletion of originals. This option is not permission to run further transfers. |
| **3. Amend the boundary for eligible batches up to 8 TB, as Rui recommends** | Could extend the observed computation-time improvement across the existing size scope. | Extrapolates from one 6 TB synthetic batch; transfer overhead and governance issues remain unresolved. | Requires evidence covering the intended workload and upper bound, required reviews, and explicit owner authorization. Rui’s recommendation alone cannot establish approval. [B3] |

## Proposed decision

**Recommend Option 1 for the present review: retain Decision 14 revision 3 while preparing the evidence and owner choices needed to evaluate Option 2. Do not recommend the broad 8 TB amendment on the supplied evidence.**

The pilot provides a reason to investigate catalog-side computation, but does not establish an end-to-end benefit or resolve the consequences of transferring complete source images. A bounded amendment remains a viable future proposal, subject to defined eligibility, supporting analysis, and owner authorization.

This recommendation does not renew, amend, or adopt Decision 14. Its existing force derives from the supplied authorization account and continuity clause. Any future amendment should identify the exact provisions superseded and explicitly preserve the lender exception and original-deletion restriction unless separately reconsidered by the authorized owner. [A1–A4]

## Consequences and conditional analysis

- **Expected consequences:** The current processing boundary continues. Potential catalog-side gains remain unrealized pending review; no production improvement can be quantified from the supplied measurements.
- **Applicable analysis included:** Boundary comparison against A2; qualitative option analysis; assessment of the pilot’s measurement exclusions and coverage limits. The source analysis is traceable to `input/decision-14.md` A1–A5 and `input/pilot.md` B1–B4.
- **Applicable analysis missing or deferred:** End-to-end timing and cost; checksum correctness and failure recovery; representative workloads through the intended size limit; worker placement and permissions; confidentiality and loan-agreement review; handling and cleanup of any transferred copies. These omissions prevent a supported recommendation to expand the production boundary.
- **Trade-offs accepted by this proposal:** Defer a possible speed improvement while retaining the authorized controls and resolving evidence gaps. This is a proposed trade-off for owner review.
- **What could change the recommendation:** Demonstrated end-to-end benefit, acceptable correctness and reliability results, satisfactory confidentiality and contractual review, and explicit owner acceptance of the resulting controls could support Option 2 or 3. Unacceptable transfer overhead or restrictions on image copying would favor retaining Option 1.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| What outcome and follow-up should close the overdue review checkpoint? | A4 specifies a checkpoint but the packet supplies no review outcome. | Review accountability and next deadline. | At the next owner review; date unresolved. |
| Should a bounded catalog-side amendment be pursued, and for which collections and batch sizes? | The pilot does not establish production eligibility or support an 8 TB generalization. | Amendment scope and evidence plan. | Before authorizing work outside the existing boundary. |
| What performance, correctness, reliability, and cost thresholds must be met? | No acceptance criteria are supplied. | Whether further evidence supports amendment. | Before evaluating an amendment for approval. |
| What source-copy controls and review findings are acceptable, and who is responsible for them? | Confidentiality and loan-agreement reviews were not performed; worker controls are unspecified. | Permissibility of source-image transfer and operational responsibility. | Before any authorized catalog-side use. |
| What artifact and authorization process will explicitly supersede the relevant parts of revision 3? | The packet identifies prior authority but does not provide a complete replacement procedure. | Effective date, supersession evidence, and canonical updates. | Before an amendment takes effect. |

## Source map

All five supplied texts are readable as provided. Their authenticity has not been independently established. The authoring skill and template govern preparation because the user explicitly supplied them; they do not confer architecture approval.

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Draft a separate revision proposal | Fact | `input/request.md`, sole paragraph [R] | Planning date 2026-09-28; document date/version unspecified | User-supplied task authority; no adoption authorization. |
| Existing authorization and scope | Existing decision | `input/decision-14.md`, header and A1 | Decision date 2026-03-10; revision 3 | Attributes authority to Iona and AR-14-20260310; signature assertion is not independently verified. Applies to accession batches up to 8 TB. |
| Computation, transfer, and deletion boundaries | Existing decision | `input/decision-14.md`, A2 | Same revision/date | Conflicts with the boundary change recommended in B3; no supplied supersession. |
| Lender exception | Existing decision | `input/decision-14.md`, A3 | Same revision/date | Applies when a loan agreement requires lender-appliance computation. No agreements supplied. |
| Review checkpoint and continuing force | Existing decision | `input/decision-14.md`, A4 | Checkpoint 2026-08-01; revision 3 | Checkpoint has passed; review completion unknown. Explicitly not an expiry. |
| Excluded policy choices | Existing decision | `input/decision-14.md`, A5 | Same revision/date | Vendors, retention duration, and deduplication remain undecided here. |
| Computation-time comparison | Constraint or evidence | `input/pilot.md`, header and B1 | 2026-09-22; version 1; author Rui, storage engineer | One synthetic 6 TB batch; excludes transfer time and cost. |
| Copies, originals, and test coverage | Constraint or evidence | `input/pilot.md`, B2 | Same version/date | Complete copies reached the worker; no lender, damaged-image, or above-6-TB test. |
| Proposed 8 TB allowance | Option | `input/pilot.md`, B3 | Same version/date | Rui explicitly disclaims authorization authority; proposal differs from A2. |
| Missing confidentiality and contractual reviews | Constraint or evidence | `input/pilot.md`, B3 | Same version/date | Limits the pilot’s support for production use. |
| No replacement recorded in packet | Fact | `input/pilot.md`, B4 | Same version/date | Packet-limited statement; not a registry search. |
| Classification and authorization rules | Constraint or evidence | `skills/architecture-decision-authoring/SKILL.md`, “Work the decision,” “Status and adoption,” “Final semantic check” | Date/version/author unspecified | User-supplied drafting instructions; fully readable. |
| Proposal structure | Constraint or evidence | `skills/architecture-decision-authoring/assets/architecture-decision-proposal.md`, entire template | Date/version/author unspecified | User-supplied template; fully readable; no approval authority. |

## Adoption record

- **Owner outcome:** Pending for this proposal.
- **Target artifact(s) and revision(s):** This proposal; identifier and revision unassigned. Any amendment to Decision 14 revision 3 remains to be defined.
- **Authorized owner/authority:** Iona, archive owner, according to A1; replacement-process details are not supplied.
- **Authorization evidence URL or record ID:** Pending. AR-14-20260310 concerns existing revision 3 only.
- **Date and adopted scope:** Pending; no adoption of this proposal is evidenced.
- **Applicability conditions:** Pending owner action; proposed scope and prerequisites appear above.
- **Exceptions:** Pending for any amendment; preserving A3 is proposed. A3 remains applicable under the existing decision.
- **Current canonical architecture updated at:** Pending; canonical location is unknown and no update is requested.
- **Downstream artifacts explicitly adopted/derived:** None evidenced for this proposal.