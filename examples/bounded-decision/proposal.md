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

- The brief requests visibility into the age of open exceptions but does not choose rank or escalation — `examples/bounded-decision/input/reporting-brief.md`, final paragraph.
- Each row has an ISO-8601 UTC `created_on` timestamp and a human-assigned status — `examples/bounded-decision/input/field-guide.md`, final paragraph.

### Assumptions

- Showing age as a neutral field may help readers notice older items without implying that age itself determines urgency. This is a presentation assumption, not source policy; if readers interpret it as priority, the display needs clarification.

### Existing decisions

- The supplied record `OPS-14` is marked Adopted by the Operations owner. Its decision date is 2026-08-15, it applies to production weekly exception reports, and its review date is 2026-12-31 — `examples/bounded-decision/input/operating-rule.md`, metadata bullets. The behavioral rule permits grouping by current status but forbids changing status or closing an item — same file, final paragraph. It does not decide age-based ordering or escalation.

### Constraints and evidence

- Grouping by current human-assigned status is permitted, but the sources do not establish that it is the current layout or require it. The report must not change status or close items — `examples/bounded-decision/input/operating-rule.md`, final paragraph.
- A timestamp is available as a basis for displaying elapsed age, but the field guide establishes no priority rule or threshold — `examples/bounded-decision/input/field-guide.md`, final paragraph.
- The brief asks whether age should determine rank or escalation but leaves that choice open — `examples/bounded-decision/input/reporting-brief.md`, final paragraph.
- The supplied materials do not describe the current report layout or say that status grouping is required — `examples/bounded-decision/input/reporting-brief.md`, full document; `examples/bounded-decision/input/operating-rule.md`, final paragraph.

## Decision drivers

- Make aging visible while preserving the existing human authority over status and closure.
- Avoid implying an urgency or escalation policy that the sources do not establish.
- Keep the report useful when a timestamp is missing or unreadable.

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| A. Show age as a neutral field, with or without optional status grouping | Makes aging visible without assuming a particular current layout | Readers may still infer priority from age or presentation order | If grouping is used, group by current human-assigned status; grouping is permitted but neither known to be current nor required. Display age only where `created_on` is readable; otherwise show unknown. Do not alter status, close, rank, or escalate rows. |
| B. Rank or escalate by age | Could direct attention to older items | Adds a priority/escalation rule unsupported by the packet and may imply authority not established | Requires an explicit owner decision, defined thresholds, exceptions, and review bounds before use. |
| C. Defer an age display | Avoids implying a policy before owner review | Does not meet the brief's request to make aging visible | Revisit after the owner clarifies whether neutral display is acceptable. |

## Proposed decision

For review, prefer Option A for the weekly report: show elapsed age as a neutral informational field, with or without optional grouping by current human-assigned status. The packet permits that grouping but does not show that it is the current layout or require it. Do not use age to rank or escalate, or change status or close an item. Leave missing or unreadable age as unknown. This is a proposed presentation boundary, not an adopted policy. Confirm with the authorized report-policy owner that a neutral age display will not be treated as an urgency rule.

## Consequences and conditional analysis

- **Expected consequences:** Readers can see age whether rows are shown ungrouped or optionally grouped by current status. The proposal does not change human-assigned status, close items, or establish an escalation order.
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
| OPS-14 identity/revision, owner/status, decision date, applicability, and review date | Existing decision metadata | `examples/bounded-decision/input/operating-rule.md`, metadata bullets | 2026-08-15 / rev 1.2 | Record is marked Adopted; authenticity is not independently verified. Review due 2026-12-31. |
| Human-assigned status; grouping permitted; no status changes or closure | Existing decision behavior | `examples/bounded-decision/input/operating-rule.md`, final paragraph | 2026-08-15 / rev 1.2 | The source permits grouping but does not make it required or identify the current report layout. It does not specify age-based rank or escalation. |
| `created_on` is ISO-8601 UTC; field guide sets no priority rule | Constraint/evidence | `examples/bounded-decision/input/field-guide.md`, final paragraph | 2026-09-01 / rev 3 | Field description does not establish policy or escalation authority. |
| Current report layout/grouping | Unknown from supplied sources | `examples/bounded-decision/input/reporting-brief.md`, full document; `examples/bounded-decision/input/operating-rule.md`, final paragraph | Sources dated 2026-09-10 and 2026-08-15 | Optional status grouping is permitted, but current use and requirement are unstated. |

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
