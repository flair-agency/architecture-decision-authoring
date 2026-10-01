# Architecture Decision Proposal: Age in the weekly internal exception report

> **Document status:** Proposed / Incomplete
> **Prepared:** 2026-10-01
> **Decision owner:** Unknown. The supplied record identifies an Operations owner for existing decision `OPS-14`, but does not establish who may adopt this new choice.
> **Review by / time bound:** Before implementation; reassess alongside `OPS-14` by its 2026-12-31 review date. Whether that date governs this proposal is unknown.

## Decision question and scope

- **Question:** Should the weekly internal exception report display the age of open exceptions only, or may it also rank items by age?
- **Scope and affected context:** The internal weekly exception report, limited to exception rows already included in that report. The exact report implementation, audience, and current sort behavior are unknown.
- **Applicability conditions:** Applies when producing the internal weekly exception report and when an included row has the documented `created_on` timestamp. Handling of missing or invalid timestamps is unknown.
- **Exceptions:** None are supplied. Any exception allowing age-based ranking or escalation requires an explicit owner choice.
- **Time bounds:** Proposed for owner review before implementation. No effective or expiry date is supplied. Existing decision `OPS-14` has a review date of 2026-12-31.

## Context and classified inputs

Keep the classes separate. If a class has no known entries, say so. Do not promote evidence, constraints, assumptions, or this proposal into an existing owner decision.

### Facts

- The requested work is one proposal about whether the weekly internal exception report should merely display item age or may rank items by age — `input/request.md`, line 3.
- The operations team wants the age of open exceptions visible in the weekly report — `input/reporting-brief.md`, line 9. This is a reported desire, not adoption evidence.
- Each included exception row has `created_on` as an ISO-8601 UTC timestamp and a human-assigned `status` — `input/field-guide.md`, line 9. The source does not define an age calculation.

### Assumptions

- “Age” can be derived from `created_on` relative to an as-yet-unspecified report cutoff time. This premise makes display technically conceivable; if false, even display-only implementation must be deferred.
- Preserving current report boundaries means retaining the existing included-row population, human status assignment, and prohibition on report-driven status change or closure. This interpretation follows the request and `OPS-14`; if the owner means additional boundaries, the proposal must be revised.
- Displaying age does not itself imply priority, urgency, rank, or escalation. If users are expected to treat older items as more urgent, that operational meaning requires an owner decision.

### Existing decisions

- `OPS-14` states that exception statuses are assigned by a human and that the production weekly report may group by current status but must not change status or close an item — Operations owner; marked Adopted in the supplied synthetic record; production weekly exception reports; decision date 2026-08-15; review date 2026-12-31; no stated exceptions — `input/operating-rule.md`, lines 3-9. The supplied label and authority claim are evidence to report, not independently authenticated proof. `OPS-14` does not decide age-based ordering, ranking, or escalation.

### Constraints and evidence

- Preserve current report boundaries — applicable to this proposal — `input/request.md`, line 3. The request does not enumerate every boundary.
- The report must not change status or close an item; status is human-assigned — applicable to production weekly exception reports — `input/operating-rule.md`, lines 6 and 9. The record is complete within the packet but its authenticity is not independently established.
- The reporting brief does not choose ordering or define urgency — applicable to the internal weekly exception report — `input/reporting-brief.md`, lines 6 and 9.
- The field guide defines no priority, urgency, escalation, or age threshold — applicable to rows included in the weekly report — `input/field-guide.md`, lines 6 and 9.

## Decision drivers

- Make the age of open exceptions visible, as requested by the operations team.
- Preserve the existing human-controlled status boundary and the report’s non-mutating role.
- Avoid silently turning a descriptive field into a priority, urgency, or escalation policy.
- Keep the proposal implementable despite unknown age-display semantics, while exposing those unknowns for owner resolution.

## Options considered

Include viable alternatives and, where relevant, defer/no change. Keep options distinct from the proposed decision.

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| A. Display age only; preserve current grouping and ordering | Meets the stated visibility need without asserting that older means higher priority; stays within the supplied non-mutating boundary | Users may still infer urgency; age calculation and presentation remain undefined | Must not rank, reprioritize, change status, close items, or trigger escalation. Owner must approve calculation and display details before implementation. |
| B. Display age and rank items by age | Makes older items more prominent and may aid review | Creates an ordering signal not authorized by any supplied source; can be mistaken for priority or urgency; interactions with status grouping and ties are unknown | Requires an explicit owner choice on ascending/descending order, grouping precedence, ties, thresholds, exceptions, and whether rank has operational meaning. It must not change status or close items under `OPS-14`. |
| C. Defer/no change | Avoids introducing ambiguous semantics before the owner resolves them | Does not satisfy the reported desire for visible age | Appropriate if age calculation, display semantics, or ownership cannot be resolved safely. |

## Proposed decision

For owner review, choose **Option A: display age only** for open exceptions already included in the weekly report, while preserving current grouping and ordering. Age must remain descriptive: it must not determine rank, priority, urgency, status, closure, or escalation. Do not implement until the owner resolves the age calculation/display details below. This is a proposed outcome, not an adopted decision.

## Consequences and conditional analysis

- **Expected consequences:** Reviewers gain visibility into elapsed time for open exceptions. Existing status grouping may remain, and the report remains non-mutating. No supplied evidence supports claiming that display will improve resolution time or that older items are more urgent.
- **Applicable analysis included:** Source classification, boundary analysis, and qualitative comparison of display-only, age ranking, and defer/no-change options in this proposal.
- **Applicable analysis missing or deferred:** Current sort behavior, report schema/rendering, definition of “open,” age reference time, rounding and display unit, treatment of missing/invalid `created_on`, time-zone presentation, user research, security/privacy analysis, accessibility, and measurement or prototype evidence. These gaps block implementation detail and may affect owner choice, but do not prevent comparing the policy options.
- **Trade-offs accepted by this proposal:** It favors visibility with minimal policy implication over the stronger prominence of age ranking. It accepts that display can still influence readers informally and therefore requires clear labeling and owner-approved semantics.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Who is authorized to adopt this new reporting choice? | `OPS-14` names an Operations owner for the existing rule, but the packet does not define adoption authority for this proposal. | Valid adoption record and implementation authorization | Before adoption |
| Should the owner adopt display-only, authorize age-based ranking, or defer? | No supplied source chooses ordering or defines age as priority or urgency. | Core report behavior | Before implementation |
| How is age calculated and displayed? | The packet supplies `created_on` but no cutoff, unit, rounding, time-zone display, missing-value behavior, or label. | Correct and consistent display | Before implementation |
| What exactly are the current grouping and ordering rules? | The request says to preserve boundaries, while `OPS-14` permits status grouping but does not state the current configuration. | Verification that the change preserves existing behavior | Before implementation |
| Is age ever allowed to affect escalation? If so, under what separately adopted rule? | The brief asks about escalation but defines none, and neither `OPS-14` nor the field guide authorizes it. | Any threshold, notification, queue, or operational response | Separate owner decision before any escalation behavior |
| What review or expiry bound applies to the new choice? | Only the existing decision’s review date is supplied. | Governance and reassessment timing | At adoption |

## Source map

Map each material fact, existing decision, constraint, and evidence-based claim to its source. Identify stale, conflicting, incomplete, or inaccessible sources. A citation supports traceability; it does not by itself prove authority or authenticity.

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| The decision question is display-only versus age ranking; preserve boundaries and identify owner choices. | Fact / constraint | `input/request.md`, line 3 | Date/version unknown | Complete readable request, but owner and detailed boundaries are not identified. |
| Operations wants visible age; the coordinator asks about rank or escalation but chooses neither and defines no urgency. | Fact / evidence | `input/reporting-brief.md`, lines 3-9 | 2026-09-10; revision 1 | Product coordinator may request analysis only, not adopt operational policy. Authenticity not independently established. |
| Status is human-assigned; the report may group by status and must not change status or close an item. | Existing decision | `input/operating-rule.md`, lines 3-9 | Decision 2026-08-15; revision 1.2; review 2026-12-31 | Marked Adopted by the stated Operations owner, but supplied evidence does not independently prove authenticity. Does not specify age ordering, ranking, or escalation. |
| Each included row has `created_on` in ISO-8601 UTC and a human-assigned `status`. | Fact / evidence | `input/field-guide.md`, lines 3-9 | 2026-09-01; revision 3 | Maintainer describes fields and does not set policy. No calculation, threshold, priority, urgency, or escalation semantics. |
| Age-based ranking is not already authorized by the supplied packet. | Constraint / evidence | `input/reporting-brief.md`, line 9; `input/operating-rule.md`, line 9; `input/field-guide.md`, line 9 | Revisions 1, 1.2, and 3 | The sources consistently omit authorization; absence is not a permanent prohibition and an authorized owner may decide later. |
| Escalation is not already authorized or defined by the supplied packet. | Constraint / evidence | `input/reporting-brief.md`, line 9; `input/operating-rule.md`, line 9; `input/field-guide.md`, line 9 | Revisions 1, 1.2, and 3 | No conflict among supplied sources; owner, thresholds, actions, and exceptions remain unknown. |

## Adoption record

Leave pending until the authorized owner acts through the applicable process. Generation, saving, commit, merge, or a status label alone does not adopt this proposal. Use the outcome vocabulary and evidence rules of the applicable owner process.

- **Owner outcome:** Pending
- **Target artifact(s) and revision(s):** `output/proposal.md`; revision identifier unknown and not adopted
- **Authorized owner/authority:** Unknown; the applicable process is not supplied
- **Authorization evidence URL or record ID:** Pending
- **Date and adopted scope:** Pending
- **Applicability conditions:** Pending
- **Exceptions:** Pending
- **Current canonical architecture disposition:** Unchanged
- **Downstream artifacts explicitly adopted/derived:** None

If the decision is adopted, preserve this record as the rationale and history for the decision. The consumer separately decides whether its current canonical architecture needs an update and records that disposition through its own process; do not assume this proposal is the current-state description.
