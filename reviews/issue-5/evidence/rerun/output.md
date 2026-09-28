# Architecture Decision Proposal: Rehearsal Cue-List Delivery

> **Document status:** Proposed; Incomplete — outage-delivery requirements and decision authority remain unresolved.
> **Prepared:** 2026-09-28
> **Decision owner:** Unknown. The director controls cue-list releases; authority over the delivery architecture is not identified.
> **Review by / time bound:** Before the production begins on 2026-11-02; offline continuity must be ready for dress rehearsals on December 10 and 11.

## Decision question and scope

- **Question:** How should director-released rehearsal cue lists reach both projection desks while supporting operation without a network?
- **Scope and affected context:** Delivery from the director to the projection workstation in Room East and Room West, including release identification, receipt, and offline access. Cue lists contain text and image filenames; distributing images is excluded. [P1, P3]
- **Applicability conditions:** Tern Community Theatre’s winter production, using the two home rehearsal rooms. Only director-released lists qualify for delivery as releases. [P1, P3]
- **Exceptions:** Touring rehearsals on November 14 and 21 retain the current USB handoff. Lighting, fire alarms, emergency announcements, and the safety interlock remain separate and must not connect to the prototype. [D4, P4]
- **Time bounds:** Production runs from 2026-11-02 through 2026-12-12. This proposal makes no recommendation for subsequent productions. [P3]

## Context and classified inputs

### Facts

- Each of the two rehearsal rooms has one projection workstation. Cue lists contain text and image filenames. [P1]
- The director currently emails revised lists. In four observed rehearsals, one desk used yesterday’s list twice; resulting delay is unknown. These observations do not establish a general error rate. [P2]
- Room East has wired network access. Both desks can read cue-list files from USB drives. No automated application has been implemented. [D1, D2]
- The production dates are 2026-11-02 through 2026-12-12. [P3]

### Assumptions

- **Release identifiers and acknowledgments are practical for volunteers.** This supports a small manual workflow. If the administrative burden is too high, simplify it or reconsider automation.
- **An operator can bring an updated USB copy to each home desk before rehearsal.** USB readability is established, but staffing, travel time, and handoff timing are not. If this is false, USB cannot be relied upon for timely delivery.
- **The existing email channel remains available for routine distribution.** Current use supports considering it, but access from each workstation is unconfirmed. The workflow must allow an operator to transfer the attachment by USB.

### Existing decisions

- **Release authority:** Only the director releases a cue list for a rehearsal; performer suggestions are not releases. Recorded in Mira’s production brief, revision 2, dated 2026-09-20. Applies to this winter production; no exceptions or separate review bounds are supplied. The brief is evidence of the rule, not independently verified authorization. [P3]
- **Touring delivery exception:** The November 14 and 21 rehearsals retain USB handoff regardless of the home-room choice. Recorded by Sal on 2026-09-24; the approving authority and approval record are unknown. The stated condition is that the borrowed room has no network. [D4]

### Constraints and evidence

- **Offline continuity:** Operators must continue the last released list without a network during December 10 and 11 dress rehearsals. Whether a new release must arrive during an outage is explicitly undecided. The meaning of “last released” when a newer release has not reached a desk needs resolution. [D3]
- **Setup limit:** A volunteer can spend at most two evenings establishing the workflow. Ongoing operating capacity is not specified. [D2]
- **Network evidence:** Room West lost network access for 14 minutes in its only test, on 2026-09-23. This supports planning for interruptions but supplies no availability forecast. Wired access in Room East likewise establishes no availability guarantee. [D1]
- **Boundary constraints:** Image distribution is outside this proposal; the four separately controlled systems named above must not connect to the prototype. [P1, P4]

## Decision drivers

- **Recognizable release state:** The observed use of yesterday’s list motivates making release identity and desk receipt visible. [P2]
- **Offline operation:** Dress rehearsals require continuity without a network. [D3]
- **Small setup burden:** Existing email and USB capabilities fit the known environment; an application would add implementation work within a two-evening limit. [P2, D2]
- **Separate release and delivery authority:** Delivery must preserve the director’s exclusive release role. [P3]
- **Narrow system boundary:** Touring exceptions, image distribution, and separately controlled systems must retain their stated boundaries. [D4, P1, P4]

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| **1. No change: current email distribution, with existing USB handoffs** | Minimal setup; familiar tools. | Does not address the observed release confusion. Offline readiness at home desks remains unestablished. | Viable as an interim arrangement only if the owner accepts these gaps. Touring USB continues. |
| **2. Manual release-and-receipt workflow using email and desk-ready USB copies** | Uses established capabilities; makes release identity and receipt explicit; supports reading a delivered list offline. | Requires reliable human handoffs and acknowledgments. A desk can still miss a newer release. | Depends on staffing and a defined late-release/outage rule. Adds no application, but fit within two evenings still requires a practical check. |
| **3. Shared network distribution with an offline copy at each desk** | Could centralize release discovery and reduce routine transfers. | Hosting, workstation compatibility, offline behavior, and implementation effort are unknown. No application exists. | Consider only if an existing tool can be demonstrated within the setup limit. New-release delivery during network loss still requires another route. Touring USB remains. |

Options derive from the current email channel, proven USB readability, limited setup time, and offline requirement. [P2, D1–D4] Option 3 becomes more attractive if suitable existing tooling and support are demonstrated; Option 2 becomes weaker if volunteer handoffs cannot be staffed.

## Proposed decision

**Recommend Option 2 for owner review, conditional on an agreed outage policy and feasible handoff staffing.**

Use the existing email channel to distribute director-released cue-list files. Add a simple manual protocol:

1. Identify each release by its intended rehearsal and a unique revision identifier. Preserve the director’s release message as the release reference.
2. Prepare a clearly identified USB copy for each desk before rehearsal.
3. Have each operator open the file on the actual workstation and acknowledge its release identifier. Track the two desk receipts together so a mismatch is visible.
4. Keep the received file available from USB throughout rehearsal. Avoid replacing the active file until a replacement has been opened successfully.
5. During an outage, continue the desk’s last successfully received release. Flag any known newer, undelivered release for handling under the owner’s outage policy.

Step 5 is a **proposed interpretation**, not an established resolution of D3. If D3 requires every new director release to reach desks during an outage, the owner must define a physical delivery arrangement and acceptable delay. The supplied evidence does not establish that capability.

## Consequences and conditional analysis

- **Expected consequences:** Release identity and acknowledgment should make stale or mismatched copies easier to detect. USB access should preserve use of a delivered list without network connectivity. Neither effect has been validated.
- **Applicable analysis included:** The options table compares delivery paths against existing capabilities, setup capacity, and offline requirements. It distinguishes continuing a received list from receiving a new release during an outage.
- **Applicable analysis missing or deferred:** No workstation trial, timing measurement, staffing plan, or release-replacement test is supplied. Before operational use, demonstrate opening the same identified release at both desks without network access and handling a replacement release. This would verify the cue-list workflow only; image availability remains outside scope.
- **Trade-offs accepted by this proposal:** Manual coordination and potentially delayed receipt of new releases in exchange for low implementation burden. The acceptable delay remains an owner choice.
- **Conditional outcome:** If releases must arrive during outages faster than a staffed USB handoff can achieve, Option 2 is insufficient as specified. Option 3 alone would not resolve that requirement either.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Who may approve the delivery architecture? | The director’s release authority does not establish architecture authority. | Adoption and responsibility for exceptions. | Before adoption. |
| Must a new release reach both desks during an outage, and within what delay? | D3 explicitly leaves this undecided. | Delivery guarantees, staffing, and interpretation of offline continuity. | Before operational use; mandatory for December 10–11. |
| Who prepares USB copies, collects receipts, and resolves a missing acknowledgment? | No staffing allocation is supplied. | Feasibility of Option 2. | Before the proposed rollout on November 2. |
| When must releases arrive, and what happens if desks hold different revisions? | No deadline or mismatch rule is supplied. | Late-release handling and whether rehearsal proceeds. | Before operational use. |

## Source map

All listed materials are readable as supplied inline. Their identities and stated authors are recorded below; authenticity and authority have not been independently established. No source is demonstrably stale, but the September observations do not establish November–December operating conditions. No direct contradiction appears; D3 contains an unresolved requirement boundary.

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Draft request and planning date | Constraint or evidence | `input/request.md`, complete request | Planning date 2026-09-28; revision unknown | Requester’s name and architecture authority unknown; applies to this proposal. |
| Two workstations and cue-list contents; image exclusion | Fact; Constraint or evidence | `input/production.md`, P1 | 2026-09-20, revision 2 | Stated author: Mira, production coordinator. Applies to winter production. Image readiness not established. |
| Current email delivery and stale-list observations | Fact | `input/production.md`, P2 | 2026-09-20, revision 2 | Mira’s account; four observations, no delay estimate or general failure rate. |
| Production dates | Fact | `input/production.md`, P3 | 2026-09-20, revision 2 | Applies November 2–December 12, 2026. |
| Director-only release authority | Existing decision | `input/production.md`, P3 | 2026-09-20, revision 2 | Recorded by Mira; no separate authorization record or delivery-architecture owner supplied. |
| Prohibited connections to separately controlled systems | Constraint or evidence | `input/production.md`, P4 | 2026-09-20, revision 2 | Applies to prototype boundary; no exceptions stated. |
| Wired access and observed West outage | Fact; Constraint or evidence | `input/desk-notes.md`, D1 | Notebook 2026-09-24; test 2026-09-23; no revision identifier | Stated author: Sal, volunteer desk operator. One 14-minute interruption; no availability forecast. |
| USB readability, absent application, setup capacity | Fact; Constraint or evidence | `input/desk-notes.md`, D2 | 2026-09-24; no revision identifier | Sal’s account; ongoing staffing and workstation email access unknown. |
| Dress-rehearsal offline requirement | Constraint or evidence | `input/desk-notes.md`, D3 | 2026-09-24; no revision identifier | Applies December 10–11; new-release delivery during outages unresolved. Requirement approval record absent. |
| Touring USB arrangement | Existing decision | `input/desk-notes.md`, D4 | 2026-09-24; no revision identifier | Applies November 14 and 21 in borrowed room; approving authority unknown. |

Assumptions are explicitly identified above. The options, recommended workflow, and proposed readiness checks are analysis for review; they are not source-recorded decisions.

## Adoption record

- **Owner outcome:** Pending.
- **Target artifact(s) and revision(s):** This proposal, prepared 2026-09-28; artifact identifier and revision assignment pending.
- **Authorized owner/authority:** Unknown. Director-only cue-list release authority is recorded separately in P3.
- **Authorization evidence URL or record ID:** Pending.
- **Date and adopted scope:** Pending; no adoption evidence supplied.
- **Applicability conditions:** Pending owner action; proposed scope is the two home rooms during the 2026 winter production.
- **Exceptions:** Proposed scope preserves touring USB handoffs, image-distribution exclusion, and the prohibited system connections.
- **Current canonical architecture updated at:** Pending; consumer-owned location unknown.
- **Downstream artifacts explicitly adopted/derived:** None evidenced.

This proposal does not amend any existing decision or establish the theatre’s canonical architecture.