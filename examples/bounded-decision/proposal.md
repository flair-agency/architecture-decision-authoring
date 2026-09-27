# Weekly exception age display: proposal for review

> **Document status:** Proposed (descriptive only; not authorization)
> **Prepared:** 2026-09-28
> **Decision owner:** Unknown; the request does not identify who may set report-ranking policy.
> **Review by / time bound:** None known for this proposal. The existing operating rule is due for review on 2026-12-31.

## Decision question and scope

- **Question:** Should the production weekly exception report display item age only, or use age to rank or escalate items?
- **Scope and affected context:** Internal weekly exception report and its presentation of open exception rows.
- **Applicability conditions:** Rows with a readable `created_on` timestamp and current human-assigned status.
- **Exceptions:** None known from the supplied packet; age is unknown when its timestamp is unavailable or unreadable.
- **Time bounds:** The existing rule is scheduled for review on 2026-12-31; no effective or expiry date is established for this proposal.

## Context and classified inputs

### Facts

- The brief requests visibility into the age of open exceptions but does not choose rank or escalation — `examples/bounded-decision/input/reporting-brief.md`, opening paragraph.
- Each row has an ISO-8601 UTC `created_on` timestamp and a human-assigned status — `examples/bounded-decision/input/field-guide.md`, final paragraph.

### Assumptions

- Showing age as a neutral field may help readers notice older items without implying that age itself determines urgency. This is a presentation assumption, not source policy; if readers interpret it as priority, the display needs clarification.

### Existing decisions

- The supplied record `OPS-14` is marked Adopted by the Operations owner on 2026-08-15. It applies to production weekly exception reports: a human assigns status; the report may group by current status but must not change status or close an item. Review date is 2026-12-31; no exceptions are stated — `examples/bounded-decision/input/operating-rule.md`, final paragraph. The record does not decide age-based ordering or escalation.

### Constraints and evidence

- Keep grouping based on the current human-assigned status; do not change status or close items — `examples/bounded-decision/input/operating-rule.md`, final paragraph.
- A timestamp is available as a basis for displaying elapsed age, but the field guide establishes no priority rule or threshold — `examples/bounded-decision/input/field-guide.md`, final paragraph.
- The brief asks whether age should determine rank or escalation but leaves that choice open — `examples/bounded-decision/input/reporting-brief.md`, final paragraph.

## Decision drivers

- Make aging visible while preserving the existing human authority over status and closure.
- Avoid implying an urgency or escalation policy that the sources do not establish.
- Keep the report useful when a timestamp is missing or unreadable.

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| A. Show age as a neutral column within existing status groups | Makes aging visible while preserving the adopted status boundary | Readers may still infer priority from age or column ordering | Display age only where `created_on` is readable; otherwise show unknown. Do not alter status, close, rank, or escalate rows. |
| B. Rank or escalate by age | Could direct attention to older items | Adds a priority/escalation rule unsupported by the packet and may imply authority not established | Requires an explicit owner decision, defined thresholds, exceptions, and review bounds before use. |
| C. Defer an age display | Avoids implying a policy before owner review | Does not meet the brief's request to make aging visible | Revisit after the owner clarifies whether neutral display is acceptable. |

## Proposed decision

For review, prefer Option A for the weekly report: show elapsed age as a neutral informational field within the existing status groups, and do not use age to rank, escalate, change status, or close an item. Leave missing or unreadable age as unknown. This is a proposed presentation boundary, not an adopted policy. Confirm with the authorized report-policy owner that a neutral age display will not be treated as an urgency rule.

## Consequences and conditional analysis

- **Expected consequences:** Readers can see age while the current status remains human-assigned. No escalation order is established.
- **Applicable analysis included:** Source and authority check against the three supplied files.
- **Applicable analysis missing or deferred:** No reader interpretation test or report mock-up was supplied; assess if age display could be mistaken for priority.
- **Trade-offs accepted by this proposal:** Age visibility is gained without using age as a decision rule; readers may still infer relative urgency.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Is a neutral age column acceptable without implying rank or escalation? | The brief asks this, but does not identify who owns presentation policy. | Whether Option A can proceed or should remain deferred. | Before implementation; no date supplied. |

## Source map

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Age visibility requested; ranking/escalation left open | Fact (request content) | `examples/bounded-decision/input/reporting-brief.md`, final paragraph | 2026-09-10 / rev 1 | Coordinator may request analysis but cannot adopt policy. |
| Status is human-assigned; report may group, not change status or close | Existing decision | `examples/bounded-decision/input/operating-rule.md`, final paragraph | 2026-08-15 / rev 1.2 | Record is marked Adopted; authenticity is not independently verified. Review due 2026-12-31. |
| `created_on` is ISO-8601 UTC; field guide sets no priority rule | Constraint/evidence | `examples/bounded-decision/input/field-guide.md`, final paragraph | 2026-09-01 / rev 3 | Field description does not establish policy or escalation authority. |

The sources do not conflict on the status/closure boundary. They leave age-based ranking and the owner of report presentation unresolved.

## Adoption record

- **Owner outcome:** Pending
- **Target artifact(s) and revision(s):** This proposal, at the same repository revision as this record
- **Authorized owner/authority:** Pending identification
- **Authorization evidence URL or record ID:** Pending
- **Date and adopted scope:** Pending
- **Applicability conditions:** Pending
- **Exceptions:** Pending
- **Current canonical architecture updated at:** Pending
- **Downstream artifacts explicitly adopted/derived:** None known
