# Architecture Decision Proposal: Rehearsal Cue-List Delivery

> **Document status:** Proposed and Incomplete — outage delivery requirements and decision authority remain unresolved.
> **Prepared:** 2026-09-28
> **Decision owner:** Unknown; the director’s release authority does not establish architecture decision authority.
> **Review by / time bound:** Before the production begins on 2026-11-02; confirm offline readiness before December 10–11 dress rehearsals.

## Decision question and scope

- **Question:** How should director-released cue lists reach both projection desks reliably within the available setup effort?
- **Scope and affected context:** Delivery, identification, and local retention of cue-list files for Tern Community Theatre’s two home rehearsal rooms. Cue lists contain text and image filenames; distributing images is excluded. [P1]
- **Applicability conditions:** Applies to lists released by the director for this winter production. Performer suggestions remain outside the release path. [P3]
- **Exceptions:** Touring rehearsals on November 14 and 21 retain the current USB handoff. Lighting, fire alarms, emergency announcements, and the safety interlock must remain separate from this prototype. [D4, P4]
- **Time bounds:** Production runs from 2026-11-02 through 2026-12-12. Offline continuation is explicitly required for December 10–11 dress rehearsals. No approval or applicability beyond this production is established. [P3, D3]

## Context and classified inputs

### Facts

- The show has two rehearsal rooms, each with a projection workstation. [P1]
- The director currently emails revised lists. In four observed rehearsals, one desk used yesterday’s list on two occasions; resulting delay is unknown. These observations do not establish a general error rate. [P2]
- Both desks can read cue-list files from USB. No automated application has been implemented. [D2]
- Room East has wired network access. Room West experienced one 14-minute network outage during its only test, on 2026-09-23; this is not an availability forecast. [D1]

### Assumptions

- **A manual release check can fit the setup budget.** This supports considering a small procedural change; effort has not been estimated or tested. If false, the recommendation needs simplification or additional capacity. [D2]
- **A designated person can carry files to both home desks before use.** Staffing and transfer time are unknown. If unavailable, manual USB delivery is not a sufficient primary path.
- **Lists can carry an unambiguous release identifier and intended rehearsal.** This is a proposed convention, not an existing capability or director commitment.

### Existing decisions

- **Director-only release authority:** The brief states that only the director releases a rehearsal cue list; performer suggestions are not releases. Stated source authority: Mira, production coordinator. Scope: winter production, 2026-11-02 through 2026-12-12; no exceptions stated. Recorded in revision 2, 2026-09-20. A separate authorization record is not supplied. [P3]
- **Touring USB exception:** November 14 and 21 rehearsals retain the current USB handoff regardless of the home-room choice. Recorded by Sal, volunteer desk operator, on 2026-09-24; deciding authority and approval record are unknown. Scope is those two rehearsals in the borrowed room without network access. [D4]

These source-recorded decisions are preserved; they do not establish adoption of this proposal.

### Constraints and evidence

- A volunteer can spend at most two evenings setting up the workflow. This limits justified implementation complexity; no option has a measured setup estimate. [D2]
- During December 10–11 dress rehearsals, operators must continue the last released list without a network connection. Whether a new release must arrive during an outage remains undecided. [D3]
- Safety-related systems must not connect to this prototype. [P4]
- Image distribution is outside this decision. The completeness or availability of referenced images is not established. [P1]
- The observed stale-list incidents justify explicit release identification and desk confirmation, but their cause and operational cost are unknown. [P2]

## Decision drivers

- **Correct release at each desk:** Reduce ambiguity between a director release, an old list, and a suggestion. [P2, P3]
- **Offline continuity:** Retain a usable local list for dress rehearsals. [D3]
- **Limited setup effort:** Prefer a workflow supportable within two evenings. [D2]
- **Visible delivery state:** Make a missed handoff detectable; file availability alone does not show which list an operator is using. This is a design inference from P2.
- **Narrow boundary and duration:** Keep the workflow limited to cue lists for this production and preserve the touring exception. [P1, P3, P4, D4]

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| **A. Standardized manual USB delivery with local retention and desk confirmation** | Uses demonstrated desk capability; can operate without a network; requires no automated application. | Repeated carrying and checking; human errors remain possible; delivery speed and staffing are unverified. | Requires a designated carrier, recognizable director release, and confirmation at both desks. Touring USB remains unchanged. |
| **B. Shared network release location with explicit local copying and USB fallback** | Could reduce routine carrying and give both desks one place to obtain releases. | Hosting, permissions, access, and copying procedures are unspecified; a stale local copy remains possible; fallback adds work. | Viable only if existing infrastructure and setup effort are confirmed. Local retention is required for dress rehearsals. New releases during outages need a separate delivery path. |
| **C. Defer change; continue the current email workflow** | No new system or setup commitment. | Leaves the observed stale-list problem unaddressed; offline operation and receipt confirmation are not demonstrated. | Reasonable only as a temporary baseline while ownership is resolved. Dress-rehearsal continuity still requires verification. |

A custom automated application is not advanced as a current option: none exists, and the supplied evidence does not establish that building and supporting one fits two evenings. [D2]

## Proposed decision

**Conditionally recommend Option A for the home rooms for this production.** It uses a demonstrated transfer capability and can support offline operation with limited implementation complexity. This is a proposal for owner review, not an adopted decision.

The proposed workflow is:

1. The director releases a file identified by its intended rehearsal and an unambiguous release identifier.
2. A designated person transfers that file by USB to each home desk.
3. Each operator saves a local copy, checks that it opens, and confirms its identifier against the director’s release.
4. Each desk retains the last released list locally for continued offline use.

The workflow does not itself resolve when a later release takes effect or what happens if only one desk receives it. Those remain owner choices. Retaining the touring USB handoff does not authorize changing its procedure.

If new releases must reach both home desks during an outage, Option A remains suitable only if the required transfer time and staffing can be demonstrated. Otherwise, revisit the comparison before adoption.

## Consequences and conditional analysis

- **Expected consequences:** Network access would cease to be necessary for reading an already delivered local list. Release checks would make mismatches more visible, but would not guarantee their elimination. Manual work recurs for each release.
- **Applicable analysis included:** The options above compare the observed delivery problem, available USB capability, network evidence, and setup constraint. This is qualitative analysis based on [P2, D1–D3]; no prototype or operational validation was supplied.
- **Applicable analysis missing or deferred:** Setup effort, home-room transfer time, staffing, usable local storage, and offline file opening remain unverified. A rehearsal exercise should test delivery to both desks and offline use before reliance; its result could change the recommendation.
- **Trade-offs accepted by this proposal:** Manual handling and operator checks in exchange for a small implementation scope. The proposal makes no commitment to instantaneous delivery, simultaneous activation, or delivery of new releases during an outage.
- **Boundary consequence:** Referenced images remain a separate dependency. Successful cue-list delivery alone does not establish projection readiness. [P1]

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Who may approve this architecture and own its operating procedure? | The supplied roles do not establish decision authority. | Adoption and accountability. | Before adoption; proposed review before 2026-11-02. |
| Must new releases arrive during outages, and within what time? | D3 explicitly leaves this undecided. | Whether manual transfer is sufficient and what fallback is required. | Before adoption; essential before December 10–11. |
| When does a release take effect, and what happens if desks hold different releases? | Release authority does not define activation or missed-handoff policy. | Operator behavior after late or partial delivery. | Before first use. |
| Who performs delivery and confirmation, and is the effort acceptable? | Carrier availability and recurrent workload are unknown. | Practical viability of Option A. | Before adoption. |

## Source map

All listed materials were readable as supplied text. No external originals, authenticity checks, or additional authorization records were available. No direct contradiction was identified; the differing offline obligations concern different circumstances.

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Two desks; cue-list contents; image exclusion | Fact; Constraint or evidence | `input/production.md`, P1 | 2026-09-20, revision 2 | Author: Mira, production coordinator. Applies to winter production; image readiness unknown. |
| Email workflow; observed stale lists; unknown delay | Fact; Constraint or evidence | `input/production.md`, P2 | 2026-09-20, revision 2 | Four observed rehearsals; observation dates and causes unspecified. |
| Production dates; director-only releases | Fact; Existing decision | `input/production.md`, P3 | 2026-09-20, revision 2 | Mira is the stated author; architecture approval authority and separate authorization evidence absent. |
| Separation from safety systems | Constraint or evidence | `input/production.md`, P4 | 2026-09-20, revision 2 | Applies to this prototype; no exceptions stated. |
| Home-room network evidence | Fact; Constraint or evidence | `input/desk-notes.md`, D1 | Note: 2026-09-24; test: 2026-09-23; no revision ID | Author: Sal, volunteer desk operator. One West-room test; East availability unmeasured. |
| USB capability; no application; setup limit | Fact; Constraint or evidence | `input/desk-notes.md`, D2 | 2026-09-24; no revision ID | Transfer performance, staffing, and implementation estimates absent. |
| Dress-rehearsal offline requirement; new-release uncertainty | Constraint or evidence; Unresolved owner choice | `input/desk-notes.md`, D3 | 2026-09-24; no revision ID | December dates interpreted within the winter production described by P3; requirement owner unspecified. |
| Touring USB exception | Existing decision; Constraint or evidence | `input/desk-notes.md`, D4 | 2026-09-24; no revision ID | Limited to November 14 and 21; deciding authority unknown. |
| Task scope, planning date, single-response draft | Constraint or evidence | `input/request.md`, complete request | Planning date: 2026-09-28; revision unknown | User-supplied request; no architecture adoption action. |
| Setup feasibility, carrier availability, release convention | Assumption | This proposal, “Assumptions”; informed by D2 and P3 | 2026-09-28 draft | Proposed premises requiring confirmation. |
| Options and conditional USB recommendation | Option; Proposed decision | This proposal, “Options considered” and “Proposed decision”; derived from P1–P4 and D1–D4 | 2026-09-28 draft | Analytical conclusions, not source-recorded owner decisions. |
| Classification, status, and adoption rules; document structure | Constraint or evidence | `skills/architecture-decision-authoring/SKILL.md`, “Work the decision,” “Status and adoption,” “Final semantic check”; `skills/architecture-decision-authoring/assets/architecture-decision-proposal.md`, complete template | Dates, revisions, and authors unknown | Supplied authoring instructions and template; confer no decision authority. |

## Adoption record

- **Owner outcome:** Pending.
- **Target artifact(s) and revision(s):** This proposal dated 2026-09-28; canonical target and revision identifier unknown.
- **Authorized owner/authority:** Unknown; director release authority alone is insufficient evidence.
- **Authorization evidence URL or record ID:** Pending.
- **Date and adopted scope:** Pending; no adopted scope established.
- **Applicability conditions:** Pending; proposed conditions appear above.
- **Exceptions:** Pending for this proposal; preserve the source-recorded touring USB exception and safety-system separation.
- **Current canonical architecture updated at:** Pending; location unknown.
- **Downstream artifacts explicitly adopted/derived:** None established.