# Architecture Decision Proposal: Display age without age-based ranking in the weekly exception report

> **Document status:** Proposed and Incomplete
> **Prepared:** Date unknown; prepared from the supplied source packet
> **Decision owner:** Operations owner for operational policy; the supplied sources do not name the individual
> **Review by / time bound:** Not specified for this proposal. `OPS-14` is scheduled for review on 2026-12-31; that date is not established as a deadline for this proposal.

## Decision question and scope

- **Question:** Should the internal weekly exception report display the age of open exceptions only, or may it also use age to rank them?
- **Scope and affected context:** The production internal weekly exception report, specifically presentation of exception rows and the boundary between reporting and operational status management. This proposal does not change source records or operational status.
- **Applicability conditions:** Applies when exception rows covered by `OPS-14` are included in the weekly report and have a usable ISO-8601 UTC `created_on` value. Which human-assigned statuses count as “open” is not defined in the supplied sources and requires owner resolution before implementation.
- **Exceptions:** Rows without a usable `created_on` value and statuses whose inclusion as “open” is unresolved cannot be given a reliable open-item age under this proposal. No other exceptions are established by the sources.
- **Time bounds:** The sources provide no effective date, expiry date, or owner-review deadline for this proposal. `OPS-14` has its own review date of 2026-12-31; whether this proposal should be reviewed by then is an owner choice.

## Context and classified inputs

Keep the classes separate. A source's stated authority and status are reported as evidence from the supplied packet, not independently authenticated.

### Facts

- Each exception row has a `created_on` value represented as an ISO-8601 UTC timestamp and a human-assigned `status`. — `../input/field-guide.md:9`
- The operations team wants the age of open exceptions to be visible in the weekly report. — `../input/reporting-brief.md:9`
- The product coordinator asks whether age should also determine rank or escalation; the brief itself chooses no ordering and defines no urgency. — `../input/reporting-brief.md:5,9`
- The field guide defines no priority, urgency, escalation, or age threshold. — `../input/field-guide.md:5,9`

### Assumptions

- **Age can be derived from `created_on` and an as-of time for a report.** This premise makes an age display possible, but neither the as-of time, unit, rounding, nor timezone presentation is specified. If the operations owner does not accept this derivation, the proposed display cannot be implemented as written. — basis: `../input/field-guide.md:9`; unresolved details: no supplied source
- **Displaying a derived age is report presentation and does not itself change status or close an item.** This is used to keep the proposal within the reporting boundary. If the operations owner interprets derived fields differently, explicit approval or a boundary amendment is needed. — basis: `../input/operating-rule.md:9`
- **Using age as the primary sort key would make age determine rank.** This interpretation is used to distinguish the options. If “rank” has a different owner-defined meaning, the options and recommendation require revision. — basis: `../input/request.md:3` and `../input/reporting-brief.md:9`

### Existing decisions

- `OPS-14` states that exception statuses are assigned by a human; the weekly report may group by current status but must not change status or close an item. The supplied record identifies the Operations owner as authority, marks the rule Adopted, dates the decision 2026-08-15, schedules review for 2026-12-31, and applies it to production weekly exception reports. It specifies no age-based ordering, ranking, or escalation. No exceptions are stated. The adoption marker and authority are claims in the supplied synthetic record and are not independently authenticated. — `../input/operating-rule.md:3-9`

### Constraints and evidence

- Any implementation must preserve human control of status and must not change status or close an item from the report. — production weekly exception reports — `../input/operating-rule.md:6,9` — limitation: the record does not define display-derived fields.
- Grouping by current status is expressly permitted. — production weekly exception reports — `../input/operating-rule.md:9` — limitation: permission to group does not establish permission or prohibition for age ranking.
- Available row fields documented by the packet are `created_on` and `status`. — exception rows included in the weekly report — `../input/field-guide.md:6,9` — limitation: the source does not document missing/invalid-value handling or status vocabulary.
- The request is to preserve current report boundaries and identify remaining owner choice. — this proposal — `../input/request.md:3` — limitation: the request does not itself adopt policy.
- No supplied source authorizes age-based priority, urgency, escalation, thresholding, or ordering. — `../input/field-guide.md:9`; `../input/operating-rule.md:9`; `../input/reporting-brief.md:9` — limitation: absence of a rule is not evidence that ranking is prohibited.

## Decision drivers

- Make the age of open exceptions visible, because that is the stated operations-team need. — `../input/reporting-brief.md:9`
- Preserve the adopted human-status and reporting boundary: the report must not change status or close items. — `../input/operating-rule.md:9`
- Avoid implying urgency, priority, or escalation where the supplied sources define none. — `../input/field-guide.md:9`; `../input/reporting-brief.md:9`
- Keep any choice about age-based rank explicit and owner-controlled because the current adopted rule neither authorizes nor prohibits it. — `../input/operating-rule.md:9`; `../input/request.md:3`

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| **A. Display age without introducing age-based ranking** | Meets the stated visibility need while minimizing change and avoiding a new implied age-based priority policy. | Requires definition of “open,” age calculation/display, handling of unusable timestamps, and inspection of the report's current ordering; if it already ranks by age, preserving it would continue age-based ranking. | Must not change status or close items. Current ordering is not documented. Before implementation, the owner must decide what to do if the current report already uses age to rank rows; this proposal does not assume the current order is age-neutral. |
| **B. Display age and rank open items by age** | Makes older open items more prominent and may aid review. | Could be read as assigning priority or urgency even though none is defined; tie-breaking and interaction with status grouping are unknown. | Requires an explicit owner choice on whether age may determine rank, whether ranking is within each current-status group or across groups, direction, ties, and treatment of unusable timestamps. Ranking must not change status, close items, or become escalation without a separate decision. |
| **C. Defer/no change** | Preserves the current report without introducing undefined calculation or ordering behavior. | Does not meet the stated desire to make open-item age visible. | Appropriate only until the definition of “open” and age-display semantics are resolved, or if the owner declines the change. |

## Proposed decision

For owner review, choose **Option A**: add a clearly labeled age display for rows that the operations owner defines as open and that have a usable `created_on` timestamp, without introducing age-based ranking. Preserve any current-status grouping. The current ordering is unknown; inspect it before implementation and ask the owner whether to retain or change it if it already ranks rows by age. Do not use age to prioritize, trigger urgency, or escalate items in this proposal.

This is a proposed outcome, not an existing or adopted decision. Whether to permit age-based ranking, including whether to retain it if the current report already uses it, remains an unresolved owner choice because the supplied adopted rule is silent about ranking and the reporting brief does not choose an ordering. Implementation remains incomplete until the owner defines “open” and the age calculation/display rules and resolves any existing age-based ordering.

## Consequences and conditional analysis

- **Expected consequences:** Reviewers can see age without the report changing human-assigned status or closing items. The proposal introduces no new age-based ranking or adopted priority/escalation rule. The effect of retaining the current order is unknown until that order is inspected; if it ranks by age, the owner must resolve whether to keep or change it.
- **Applicable analysis included:** Source inventory and traceability, classification of claims, report-boundary analysis, and a comparison of display-only, age-ranking, and defer/no-change options are contained in this proposal.
- **Applicable analysis missing or deferred:** No sample data, current report layout, current ordering specification, status vocabulary, age formula, display format, threshold, escalation process, or owner authorization record is supplied. Consequently, implementation detail and any assessment of ranking behavior are deferred pending owner choices.
- **Trade-offs accepted by this proposal:** It favors visibility and boundary preservation over introducing age-based ranking. Depending on the existing order, reviewers may need to scan or use grouping to find older exceptions; the packet does not establish how the current order behaves.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Which human-assigned statuses count as “open”? | The sources use “open exceptions” but do not define the status vocabulary or membership. | Row eligibility for age display. | Before implementation. |
| What as-of time, unit, rounding, label, and timezone presentation define displayed age, and how are unusable timestamps shown? | The field guide provides only a UTC creation timestamp and no age semantics. | Correct, consistent calculation and presentation. | Before implementation. |
| Does the current report already use age to rank rows, and if so, should that ordering be retained or changed? May a later revision introduce or keep age-based ranking? | The packet does not describe the current order; the existing decision is silent and the analysis request has no adoption authority. | Whether the proposed display-only change can preserve current behavior without continuing age-based ranking, and whether Option B may replace or amend the proposal. | Before implementation or any age-ranked release; no source-defined deadline. |
| Does age ever imply urgency, priority, thresholding, or escalation? | All supplied sources explicitly leave these concepts undefined. | Labels, visual treatment, alerts, thresholds, and operational follow-up. | Before introducing any such behavior; no source-defined deadline. |
| Who is the named authorized Operations owner and what process records adoption? | The supplied record names only a role and provides no authorization mechanism. | Adoption evidence and canonical architecture update. | Before adoption. |

## Source map

All four Markdown sources were readable in full. Identity, revision, date, applicability, and stated authority below are claims within the synthetic packet; authenticity is not independently established. File modification metadata is not used as decision evidence.

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| The task asks for one proposal choosing display-only or possible age ranking while preserving report boundaries. | Constraint | `../input/request.md:1-3` | No date or version stated | Author, authority, applicability metadata, and formal decision status are unknown; readable in full. |
| Rows have ISO-8601 UTC `created_on` and human-assigned `status`. | Fact | `../input/field-guide.md:1-9` | 2026-09-01; revision 3 | Applies to report exception rows; stated author is Reporting-system maintainer, who describes fields but does not set policy; readable in full. It does not define status vocabulary or data-quality behavior. |
| No priority, urgency, escalation, or age threshold is defined by the field guide. | Constraint/evidence | `../input/field-guide.md:5,9` | 2026-09-01; revision 3 | Field-definition authority only; absence does not establish a prohibition. |
| `OPS-14` preserves human-assigned status, permits grouping by status, and prohibits the report from changing status or closing items. | Existing decision | `../input/operating-rule.md:1-9` | Decision 2026-08-15; revision 1.2; review 2026-12-31 | Applies to production weekly exception reports; stated authority is Operations owner and record says Adopted; readable in full. Authenticity and adoption are not independently verified. No exceptions stated. |
| `OPS-14` specifies no age-based ordering, ranking, or escalation. | Constraint/evidence | `../input/operating-rule.md:9` | Decision 2026-08-15; revision 1.2; review 2026-12-31 | Silence neither authorizes nor prohibits ranking. |
| Operations wants open-item age visible; the coordinator asks about rank/escalation but chooses no ordering or urgency. | Fact/constraint | `../input/reporting-brief.md:1-9` | 2026-09-10; revision 1 | Applies to internal weekly exception report; stated author is Product coordinator with analysis-request authority only, not policy-adoption authority; readable in full. “Open” is undefined. |
| Display age without age ranking, pending owner decisions. | Proposed decision | This proposal, `## Proposed decision` | Current proposal; preparation date unknown | Not an existing decision and not adopted. Depends on owner definitions and authorization. |
| Display-only, age-ranked, and defer/no-change approaches. | Options | This proposal, `## Options considered`; derived from `../input/request.md:3`, `../input/reporting-brief.md:9`, and the boundaries in `../input/operating-rule.md:9` | Current proposal | Comparative analysis is limited by the absence of report layout, current ordering, sample data, and owner-defined age semantics. |

## Adoption record

Leave pending until the authorized owner acts through the applicable process. Generation, saving, commit, merge, or a status label alone does not adopt this proposal.

- **Owner outcome:** Pending
- **Target artifact(s) and revision(s):** Production internal weekly exception report; exact artifact and revision Pending
- **Authorized owner/authority:** Operations owner role is stated in `../input/operating-rule.md:5`; named owner and applicable authorization process Pending
- **Authorization evidence URL or record ID:** Pending
- **Date and adopted scope:** Pending
- **Applicability conditions:** Pending owner action; proposed conditions are stated under `Decision question and scope`
- **Exceptions:** Pending owner action; proposed exceptions are stated under `Decision question and scope`
- **Current canonical architecture updated at:** Pending
- **Downstream artifacts explicitly adopted/derived:** None/Pending

If adopted, preserve this record as rationale and history. Update the consumer's current canonical architecture through its own process; this proposal does not establish that current state.
