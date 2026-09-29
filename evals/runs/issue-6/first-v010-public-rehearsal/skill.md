# Architecture Decision Proposal: Catalog-search deployment boundary

> **Document status:** Proposed and Incomplete  
> **Prepared:** 2026-09-29  
> **Decision owner:** Fictional Cedar Cart product owner, as stated in CC-ADR-014; identity and authority are not independently evidenced  
> **Review by / time bound:** Before catalog search launches; launch date and whether “launch” means internal beta or first catalog release are unknown

## Decision question and scope

- **Question:** Should CC-ADR-014’s single-deployable-unit boundary be amended before catalog search launches?
- **Scope and affected context:** The deployment boundary among the existing web application, product catalog, proposed catalog-search capability, and PostgreSQL. Checkout and inventory reservation transaction semantics are in context but are not independently proposed for change.
- **Applicability conditions:** Applies to planning for the proposed catalog-search launch while CC-ADR-014 remains adopted.
- **Exceptions:** None are recorded in CC-ADR-014. No new exception is proposed.
- **Time bounds:** CC-ADR-014 applies through the first catalog release. Catalog search is planned for an internal beta, but neither a launch date nor the relationship between that beta and the “first catalog release” is recorded.

## Context and classified inputs

### Facts

- Cedar Cart is a fictional online stationery shop with a four-person engineering team — `input/current-context.md`, first bullet.
- The web application and product catalog currently form one deployable application backed by PostgreSQL — `input/current-context.md`, second bullet.
- Catalog search is planned for an internal beta; no implementation or launch date has been selected or recorded — `input/current-context.md`, third bullet.
- Checkout reserves inventory in the order-commit transaction and checks current stock at purchase time — `input/current-context.md`, fourth bullet.
- A 20-minute staging test on 2026-08-20 recorded 36 catalog reads/second and 7 order writes/second — `input/load-test-note.md`, heading and first bullet.

### Assumptions

- The proposed search capability may affect the deployment boundary. This is used only to frame the review; the packet does not establish a selected search architecture. If false, no deployment-boundary amendment may be necessary.
- “Before catalog search launches” may refer to the internal beta. This relationship is uncertain; if beta and first catalog release are different milestones, the applicable review deadline and CC-ADR-014’s time boundary differ.

### Existing decisions

- **CC-ADR-014:** Keep checkout and inventory reservation in the same PostgreSQL transaction, and keep the web application as one deployable unit through the first catalog release — stated owner: fictional Cedar Cart product owner; status: adopted on 2025-11-03; scope: checkout writes and first catalog release; conditions: revisit the deployment boundary if measured order writes exceed 20/second for at least 10 consecutive minutes or if the owner separately requests review; exceptions: none recorded — `input/adopted-decision.md`.
- CC-ADR-014 does not specify a search index or query boundary — `input/adopted-decision.md`, Scope.
- The supplied decision snapshot is the only evidence of adoption; no independent owner authorization record is supplied — `input/adopted-decision.md`, Authorization source.

### Constraints and evidence

- The recorded deployment-boundary review threshold is sustained measured order writes above 20/second for at least 10 consecutive minutes — applicable to CC-ADR-014’s review condition — `input/adopted-decision.md`, Review condition.
- The staging test records no order-write rate above 7/second and no production measurement. It therefore does not establish that the quantitative review condition was met — `input/load-test-note.md`, first through third bullets.
- No equivalence between the staging machine and production capacity is documented. The test cannot establish production capacity or production behavior — `input/load-test-note.md`, second and third bullets.
- The test’s 36 catalog reads/second is evidence of that staging workload only. No target search load, acceptance threshold, latency, resource-contention result, or deployment comparison is supplied.
- The load-test note expressly provides no authorization to change CC-ADR-014 — `input/load-test-note.md`, fourth bullet.
- The case request requires the existing decision to remain as recorded unless the owner explicitly changes it and requires the amendment decision to remain unresolved — `request.md`, second paragraph.

## Decision drivers

- Preserve CC-ADR-014’s adopted scope and transaction guarantees unless the authorized owner amends them.
- Determine whether search creates a reason to reconsider the deployable-unit boundary that is independent of order-write throughput.
- Avoid treating staging measurements as production-capacity evidence.
- Keep operational complexity proportionate to the recorded four-person engineering team.
- Resolve the ambiguity between internal beta, search launch, and the first catalog release.
- Obtain evidence relevant to the actual search implementation and production-like workload before comparing boundaries conclusively.

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| 1. Preserve CC-ADR-014 without amendment | Retains the adopted single-unit boundary and avoids introducing an unsupported architectural change. The supplied write measurement does not meet the recorded threshold. | Search-related scaling, availability, or operational needs could emerge that the supplied evidence does not measure. | Applies through the first catalog release under the existing decision. Does not settle an unspecified search-index or query boundary. |
| 2. Propose a narrow amendment separating catalog search from the existing deployable unit | Could permit independent search deployment or scaling while preserving checkout’s PostgreSQL transaction. | No selected implementation, production-like comparison, target load, or operational analysis supports this boundary yet; it may add disproportionate complexity. | Would require the owner to define the search boundary, conditions, exceptions, migration approach, and relationship to CC-ADR-014. |
| 3. Defer the amendment choice pending bounded search evidence | Preserves the existing decision while allowing a later comparison using a selected implementation and relevant measurements. | May compress the decision window if evidence is collected too near launch; the launch date is unknown. | Requires clarification of the launch milestone and evidence such as production-equivalent assumptions, target workload, performance criteria, and operational impact. |

## Proposed decision

**No recommendation yet.**

The new evidence does not establish that CC-ADR-014’s quantitative review condition has been met, that staging represents production capacity, or that catalog search requires a separate deployable unit. It also does not establish that the existing boundary will be adequate for the selected search design, because no design, target workload, launch date, or production-like assessment is supplied.

Accordingly, CC-ADR-014 remains unchanged. Whether to preserve it unchanged, amend it narrowly for search, or defer the amendment choice is an unresolved owner decision.

## Consequences and conditional analysis

- **Expected consequences:** Until an authorized owner acts, the existing single-deployable-unit decision remains recorded through the first catalog release, and checkout/inventory reservation remains within one PostgreSQL transaction. No search boundary is established by this proposal.
- **Applicable analysis included:** Comparison of the adopted review threshold with the 2026-08-20 staging measurement; identification of the evidence limits and milestone ambiguity.
- **Applicable analysis missing or deferred:** Selected search implementation, target and production-like workloads, latency or availability criteria, production-capacity equivalence, resource contention, operational ownership, migration analysis, and clarification of whether internal beta is the first catalog release. These gaps prevent a supported boundary recommendation.
- **Trade-offs accepted by this proposal:** None are accepted on the owner’s behalf. Deferring the recommendation preserves the current decision but retains uncertainty and possible schedule risk before launch.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Should CC-ADR-014 remain unchanged, receive a search-specific amendment, or be reviewed after additional evidence? | The recorded threshold is not met, and search-specific evidence is insufficient; choosing complexity and risk tolerance belongs to the owner. | Deployment boundary for catalog search and any amendment scope. | Before the applicable search-launch milestone. |
| Does the planned internal beta constitute “catalog search launch” or the “first catalog release”? | The supplied sources use different milestones without defining their relationship. | Review deadline and the time applicability of CC-ADR-014. | Before beta/launch planning is finalized. |
| What evidence is sufficient for the boundary decision? | No target load, production-equivalence standard, service criteria, or operational threshold is recorded. | Whether Options 1 and 2 can be compared reliably. | Before any amendment decision. |
| If amended, should checkout’s transaction boundary remain unchanged while only search is separated? | CC-ADR-014 combines a transaction decision and a deployment decision; the packet supplies no basis to alter checkout semantics. | Amendment scope, conditions, and exceptions. | At owner review. |

## Source map

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Current application, catalog, database, team, search plan, and checkout behavior | Fact | `input/current-context.md`, all four bullets | Undated snapshot | Search implementation and launch date are explicitly absent; stated facts are synthetic. |
| CC-ADR-014 decision and adoption | Existing decision | `input/adopted-decision.md`, Status and Decision | Adopted 2025-11-03 | Only supplied authorization evidence; authenticity and authority are not independently established. |
| CC-ADR-014 scope excludes a specified search boundary | Existing decision | `input/adopted-decision.md`, Scope | 2025-11-03 record | Does not determine whether search must remain inside or may sit outside the deployable unit. |
| Review threshold and separate-owner-request condition | Existing decision | `input/adopted-decision.md`, Review condition | 2025-11-03 record | The packet does not establish whether the case request itself is the owner’s separate review request. |
| No recorded exceptions | Existing decision | `input/adopted-decision.md`, Exceptions | 2025-11-03 record | Applies only to the recorded decision snapshot. |
| 36 reads/second and 7 writes/second over 20 minutes | Evidence | `input/load-test-note.md`, first bullet | 2026-08-20 | Staging only; workload shape and production equivalence are unknown. |
| No sustained writes above 7/second and no production measurement | Evidence | `input/load-test-note.md`, second and third bullets | 2026-08-20 | Does not demonstrate production capacity or search suitability. |
| Test does not authorize a decision change | Constraint | `input/load-test-note.md`, fourth bullet | 2026-08-20 | Confirms evidence is non-authorizing. |
| Preserve the decision and leave amendment unresolved | Constraint | `request.md`, second paragraph; duplicated in `input/request.md` | Undated | Request source and requestor authority are not identified. |

All supplied files were readable. The two request files contain the same visible case request. No source conflict was found in their text; material omissions and milestone ambiguity remain.

## Adoption record

- **Owner outcome:** Pending
- **Target artifact(s) and revision(s):** Any proposed amendment to CC-ADR-014; exact artifact and revision pending
- **Authorized owner/authority:** Fictional Cedar Cart product owner, as stated in CC-ADR-014; independent authority evidence not supplied
- **Authorization evidence URL or record ID:** Pending
- **Date and adopted scope:** Pending
- **Applicability conditions:** Pending
- **Exceptions:** Pending
- **Current canonical architecture updated at:** Pending
- **Downstream artifacts explicitly adopted/derived:** None/Pending
