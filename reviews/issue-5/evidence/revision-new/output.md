# Architecture Decision Proposal: Rehearsal Cue-List Delivery

> **Document status:** Proposed and Incomplete — decision authority, operating responsibilities, and implementation feasibility remain unresolved.
> **Prepared:** 2026-09-28; revised draft incorporating `director-update.md`, revision 1.
> **Decision owner:** Unknown; the director’s cue-list release authority does not establish architecture decision authority.
> **Review by / time bound:** Proposed review before production begins on 2026-11-02; verify offline readiness before first use and specifically for December 10–11 dress rehearsals.

## Decision question and scope

- **Question:** How should director-released cue lists reach both home projection desks, with clear local acknowledgment and offline continuation, within the available setup effort?
- **Scope and affected context:** Cue-list delivery, release identification, local acknowledgment, and retention at Tern Community Theatre’s two home rehearsal rooms. Each room has one projection workstation. Cue lists contain text and image filenames; image distribution is excluded. [`input/production.md`, P1]
- **Applicability conditions:** Applies to director-released lists for the winter production. Performer suggestions are not releases. Incoming versions must not be treated as released locally before acknowledgment. [`input/production.md`, P3; `director-update.md`, U1]
- **Exceptions:** The November 14 and 21 touring rehearsals retain their current USB handoff. Lighting, fire alarms, emergency announcements, and the safety interlock remain separate and must not connect to this prototype. [`input/desk-notes.md`, D4; `input/production.md`, P4; `director-update.md`, U2]
- **Time bounds:** Production runs from 2026-11-02 through 2026-12-12. The director’s update permits newly released lists to wait until network service resumes and requires offline continuation; it states no narrower rehearsal restriction. No applicability beyond this production is established. [`input/production.md`, P3; `director-update.md`, U1]

## Context and classified inputs

### Facts

- There are two home rehearsal rooms, each with a projection workstation. [`input/production.md`, P1]
- The director currently emails revised lists. In four observed rehearsals, one desk used yesterday’s list on two occasions. Causes and resulting delay are unknown; this is not an established general error rate. [`input/production.md`, P2]
- Both desks can read cue-list files from USB. No automated application has been implemented. [`input/desk-notes.md`, D2]
- Room East has wired network access. Room West experienced a 14-minute outage in its only test, on 2026-09-23. That observation does not forecast availability. [`input/desk-notes.md`, D1]
- No workflow option has been selected, and no owner adoption has occurred. The earlier proposal is a generated draft, not an adopted decision. [`director-update.md`, U2; updated request accompanying that source]

### Assumptions

- **Release identification and acknowledgment can be implemented with a small manual procedure.** This supports the options below, but neither effort nor operator usability has been measured. If false, simplify the procedure or revisit the setup allowance. [Inference from `input/desk-notes.md`, D2]
- **Each workstation can retain and open a usable local cue-list copy.** USB reading is established; persistent local storage and offline opening have not been demonstrated. If false, all options need a different verified retention method.
- **For Option A, someone can carry each release to both home desks within an acceptable time.** Staffing and transfer time are unknown. If false, USB is unsuitable as the primary home-room delivery path.
- **For Option B, a suitable shared network location may already exist.** Its existence, permissions, and usability are unknown. If new infrastructure is necessary, the two-evening limit may make this option impractical.

### Existing decisions

These are source-recorded operating decisions and boundaries, not adoption of a delivery architecture.

- **Director-only release authority:** Only the director releases rehearsal cue lists; performer suggestions are not releases. Recorded by Mira, production coordinator, in revision 2 dated 2026-09-20. Applies to the winter production; no exceptions stated. A separate authorization record is not supplied. [`input/production.md`, P3]
- **Outage and local-release policy:** Newly released lists may wait until network service resumes. Operators must continue the last released list offline and must not treat an unacknowledged incoming version as released locally. Stated authority: Lena, director; dated 2026-09-28, revision 1. Applies to this production; no exceptions stated. The note records the policy but does not select a workflow or specify the acknowledgment mechanism. [`director-update.md`, U1–U2]
- **Touring USB exception:** The November 14 and 21 rehearsals in the borrowed room retain the current USB handoff. Initially recorded by Sal, volunteer desk operator, on 2026-09-24 and reaffirmed by Lena on 2026-09-28. Applies only to those touring rehearsals; the home-room choice does not amend their procedure. [`input/desk-notes.md`, D4; `director-update.md`, U2]

### Constraints and evidence

- Setup capacity is at most two volunteer evenings. No option has a measured setup estimate. [`input/desk-notes.md`, D2]
- Offline continuation is explicitly required for December 10–11 dress rehearsals. The earlier notebook left arrival of new releases during outages undecided; the later director note expressly permits waiting for network restoration. The earlier uncertainty remains part of the history but is no longer an open requirement. [`input/desk-notes.md`, D3; `director-update.md`, U1]
- Image distribution and all safety-system exclusions remain unchanged. [`input/production.md`, P1, P4; `director-update.md`, U2]
- The stale-list observations support making the intended release and acknowledgment visible. They do not establish that USB, email, or a shared location caused the incidents, or that changing transport alone will prevent recurrence. [`input/production.md`, P2; design inference]
- The previous draft’s conditional USB recommendation was analytical advice. It provides no evidence of selection, approval, or tested feasibility. [`previous-proposal.md`, “Proposed decision”; updated request]

## Decision drivers

- **Recognizable local release state:** Distinguish a director release, an incoming but unacknowledged version, and the list currently in use. [P3, U1]
- **Offline continuation:** Preserve a usable last released list at each desk. New-release delivery need not continue during an outage. [D3, U1]
- **Low setup and operating effort:** Fit the two-evening setup limit while accounting for repeated volunteer work. [D2]
- **Detectable missed handoffs:** Make delivery and acknowledgment failures visible without assuming receipt means use. [P2, U1; design inference]
- **Narrow scope:** Preserve the touring handoff, image exclusion, safety separation, and production time bounds. [P1, P3–P4, D4, U2]

## Options considered

The alternatives use existing USB capability, a possible shared network location, or the current email channel. Each viable operating workflow needs local retention and an explicit acknowledgment procedure.

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| **A. Standardized USB delivery with local retention and acknowledgment** | Uses demonstrated desk capability; requires no network service or automated application. | Repeated carrying and checking; staffing and delivery time are unverified; human errors remain possible. | Requires a designated carrier and acceptable recurring effort. Its ability to transfer during outages is useful but is no longer a requirement or a decisive advantage. Touring procedure remains unchanged. |
| **B. Shared network release location with local retention and acknowledgment** | Gives both desks one release location; could reduce routine carrying. Waiting through outages is expressly allowed. | Infrastructure, access, permissions, and setup effort are unknown; operators can still retain stale copies or miss updates. | Viable if existing infrastructure fits the setup budget. Desks continue their retained list during outages and acknowledge an incoming version before local release. No home-room outage delivery fallback is required by U1. |
| **C. Standardized email delivery with local retention and acknowledgment** | Retains the existing delivery channel; could minimize setup and infrastructure work. | Attachments and message threads can obscure versions; receipt does not establish acknowledgment or correct use. | Requires an unambiguous release identifier, saving the file locally, and a defined acknowledgment step. Offline readiness must be demonstrated. |
| **D. Defer selection and retain the current workflow unchanged** | Avoids an immediate implementation commitment. | Leaves the observed stale-list problem and compliance with local acknowledgment and offline requirements unverified. | Suitable only as a temporary baseline while ownership and feasibility are resolved; not established as ready for production. |

A custom application is not advanced as a current option: none exists, and the supplied materials do not show that building and supporting one fits two evenings. [D2]

## Proposed decision

**No transport recommendation yet.** The director’s update removes the need to deliver new releases during network outages, weakening the previous draft’s preference for USB. USB remains viable, but there is insufficient evidence about staffing, existing network infrastructure, or email procedure effort to rank Options A–C confidently.

For owner review, propose the following common operating design whichever transport is chosen:

1. Identify each director-released file with its intended rehearsal and an unambiguous release identifier.
2. Deliver it to each home desk through the selected channel.
3. Have the operator save a local copy, verify that it opens, and check its identifier against the director’s release.
4. Record acknowledgment before treating the incoming version as released locally, using an owner-defined acknowledgment and activation procedure.
5. Retain the last locally released list for offline continuation. An arriving, unacknowledged version must not automatically replace the active list.
6. When network delivery is unavailable, continue the retained list; new releases may wait for service restoration.

The identifiers, verification steps, and acknowledgment record are proposed mechanisms. The director-only release rule and the offline/local-acknowledgment policy are already stated in the sources.

This revises the earlier draft’s recommendation for review. It changes no adopted artifact, and no option is selected by this document.

## Consequences and conditional analysis

- **Expected consequences:** Separating incoming files from locally released files should make release state clearer. Retaining a usable local copy supports offline continuation. These are expected effects, not validated results.
- **Applicable analysis included:** The qualitative comparison in “Options considered” accounts for the observed stale-list incidents, demonstrated USB reading, limited network evidence, setup allowance, and the updated outage policy. [P2, D1–D3, U1]
- **Applicable analysis missing or deferred:** No prototype, effort estimate, transfer-time measurement, acknowledgment trial, or offline-opening test is supplied. Before reliance, exercise the chosen workflow at both desks, including a network outage and receipt of a new but unacknowledged file. Image readiness remains a separate dependency.
- **Conditional comparison:** Existing usable network infrastructure would strengthen Option B. A workable email identification and acknowledgment procedure would strengthen Option C. Available carrier staffing with low recurring burden would strengthen Option A. None is established.
- **Trade-offs accepted by this proposal:** Explicit operator checks add work. Keeping a locally released version active can delay use of a newer incoming file. Waiting for network restoration is permitted by U1; this does not establish permission for indefinite delay after restoration or resolve whether the desks may activate different versions.
- **Boundary consequence:** Successful cue-list delivery does not establish projection readiness because image distribution remains excluded. [P1, U2]

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Who can approve the architecture and own its operating procedure? | Source roles establish cue-list release authority, not architecture adoption authority. | Selection, adoption, and accountability. | Before adoption; proposed review before 2026-11-02. |
| Which of Options A–C best fits available people and infrastructure? | Setup effort, recurring workload, and infrastructure readiness are unmeasured. | Primary delivery channel and implementation scope. | Before setup and first use. |
| Who acknowledges a version, how is acknowledgment recorded, and when does it become active? | U1 requires acknowledgment but leaves its mechanism and activation procedure unspecified. | Operator actions and observable local release state. | Before first use. |
| May desks activate different versions, and what happens after a missed handoff? | Local acknowledgment does not define coordination between rooms. | Cross-room consistency and rehearsal handling. | Before first use. |
| Who monitors pending releases and completes delivery after service resumes? | U1 permits waiting but sets no recovery deadline or responsibility. | Recovery procedure and acceptable post-outage delay. | Before first use. |

Delivery of new releases during an outage is **not** an unresolved requirement: U1 permits those releases to wait.

## Source map

All sources below were readable as supplied text. External originals and independent authenticity checks were unavailable. No source is established as stale for this planning date; D3’s earlier uncertainty is addressed by U1, and the previous proposal remains draft history. The supplied notes state their authors’ roles but do not independently prove authority.

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Two workstations; cue-list contents | Fact | `input/production.md`, P1 | 2026-09-20, revision 2 | Mira, production coordinator; winter production scope. |
| Image-distribution exclusion | Constraint or evidence | `input/production.md`, P1; `director-update.md`, U2 | 2026-09-20, rev. 2; 2026-09-28, rev. 1 | Mira; reaffirmed by Lena, director. Image readiness unknown. |
| Current email delivery and stale-list observations | Fact | `input/production.md`, P2 | 2026-09-20, revision 2 | Mira; four observed rehearsals, observation dates and causes unknown. |
| Production dates | Fact | `input/production.md`, P3 | 2026-09-20, revision 2 | Mira; 2026-11-02 through 2026-12-12. |
| Director-only cue-list release authority | Existing decision | `input/production.md`, P3 | 2026-09-20, revision 2 | Mira records the rule; no separate authorization record or architecture authority established. |
| Safety-system separation | Constraint or evidence | `input/production.md`, P4; `director-update.md`, U2 | 2026-09-20, rev. 2; 2026-09-28, rev. 1 | Mira; reaffirmed by Lena. Applies to prototype; no exceptions stated. |
| Network access and one West-room outage | Fact | `input/desk-notes.md`, D1 | 2026-09-24; test 2026-09-23; no revision ID | Sal, volunteer desk operator; one observation, no availability forecast. |
| USB reading and absence of an automated application | Fact | `input/desk-notes.md`, D2 | 2026-09-24; no revision ID | Sal; storage, transfer performance, and setup feasibility untested. |
| Two-evening setup allowance | Constraint or evidence | `input/desk-notes.md`, D2 | 2026-09-24; no revision ID | Sal; no measured option estimates. |
| Dress-rehearsal offline requirement | Constraint or evidence | `input/desk-notes.md`, D3 | 2026-09-24; no revision ID | Sal; December 10–11 interpreted within P3’s production dates. |
| Earlier new-release outage uncertainty | Constraint or evidence | `input/desk-notes.md`, D3 | 2026-09-24; no revision ID | Historically undecided; U1 now expressly permits waiting. |
| Outage waiting, offline continuation, acknowledgment rule | Existing decision | `director-update.md`, U1 | 2026-09-28, revision 1 | Lena, director; operating policy, not workflow selection. Mechanism unspecified. |
| Touring USB exception | Existing decision | `input/desk-notes.md`, D4; `director-update.md`, U2 | 2026-09-24, no revision ID; 2026-09-28, rev. 1 | Sal; reaffirmed by Lena. Limited to November 14 and 21 touring rehearsals. |
| No option selected; no adoption | Fact | `director-update.md`, U2; updated request, opening paragraph | 2026-09-28; note rev. 1; request unversioned | Lena states no selection; user explicitly states no owner adoption. |
| Earlier conditional USB recommendation | Proposed decision | `previous-proposal.md`, “Proposed decision” | Prepared 2026-09-28; no revision ID | Generated draft, not owner action; reconsidered with U1. |
| Decision scope, planning date, revision task | Constraint or evidence | `input/request.md`, complete request; updated request, opening paragraph | Planning date 2026-09-28; request revisions unspecified | User instructions; no architecture approval. |
| Feasibility premises | Assumption | This proposal, “Assumptions” | 2026-09-28 revised draft | Analytical premises; not verified capabilities. |
| Transport alternatives and conditional comparison | Option | This proposal, “Options considered”; derived from P2, D1–D2, U1 | 2026-09-28 revised draft | Qualitative comparison; no measured ranking. |
| Common operating design; transport recommendation withheld | Proposed decision | This proposal, “Proposed decision” | 2026-09-28 revised draft | For owner review only. |
| Authority, selection, acknowledgment, coordination, recovery responsibility | Unresolved owner choice | This proposal, “Unresolved owner choices”; gaps in P3 and U1–U2 | 2026-09-28 revised draft | No answers or owner commitments supplied. |
| Authoring rules and structure | Constraint or evidence | `skills/architecture-decision-authoring/SKILL.md`, “Work the decision,” “Status and adoption,” “Final semantic check”; `skills/architecture-decision-authoring/assets/architecture-decision-proposal.md`, complete template | Authors, dates, and revisions unknown | Supplied instructions and template; confer no architecture authority. |

## Adoption record

- **Owner outcome:** Pending.
- **Target artifact(s) and revision(s):** This revised proposal dated 2026-09-28, incorporating `director-update.md` revision 1; proposal filename, canonical target, and revision identifier unspecified.
- **Authorized owner/authority:** Unknown; director cue-list release authority alone does not establish architecture adoption authority.
- **Authorization evidence URL or record ID:** Pending; the updated request explicitly states that no adoption has occurred.
- **Date and adopted scope:** Pending; no adopted proposal scope established.
- **Applicability conditions:** Pending for this proposal; proposed applicability appears above.
- **Exceptions:** Pending for this proposal; the source-recorded touring exception, image exclusion, and safety-system exclusions remain preserved.
- **Current canonical architecture updated at:** Pending; location unknown.
- **Downstream artifacts explicitly adopted/derived:** None established.