# Architecture Decision Proposal: Catalog search deployment boundary review

> **Document status:** Incomplete  
> **Prepared:** 2026-09-29  
> **Decision owner:** Cedar Cart product owner; individual unknown  
> **Review by / time bound:** Before catalog search launches; launch date is not recorded

## Decision question and scope

- **Question:** Should CC-ADR-014’s single-deployable-unit boundary be amended before catalog search launches?
- **Scope and affected context:** The deployment boundary between the existing web application and planned catalog search. Checkout’s PostgreSQL transaction and inventory-reservation behavior are not proposed for change.
- **Applicability conditions:** Applies to the planned internal beta and any subsequent catalog-search launch governed by CC-ADR-014.
- **Exceptions:** None recorded in CC-ADR-014. Whether search lies outside its original scope is unresolved.
- **Time bounds:** CC-ADR-014 applies through the first catalog release. Search has no recorded launch date.

## Context and classified inputs

### Facts

- Cedar Cart has a four-person engineering team. — `input/current-context.md`, first bullet
- The web application and product catalog currently form one PostgreSQL-backed deployable application. — `input/current-context.md`, second bullet
- Catalog search is planned for internal beta, but no implementation or launch date has been selected. — `input/current-context.md`, third bullet
- Checkout reserves inventory within the order-commit transaction and checks current stock at purchase time. — `input/current-context.md`, fourth bullet
- A 20-minute staging test recorded 36 catalog reads/second and 7 order writes/second. — `input/load-test-note.md`, first bullet

### Assumptions

- The phrase “first catalog release” may include the planned search launch. This is used to identify a possible overlap with CC-ADR-014; if false, the existing deployment-boundary decision may not govern search.
- The case request initiates assessment but is not treated as an explicit owner request or authorization. If it came from the recorded owner through an applicable process, CC-ADR-014’s alternative review condition may have been met, but amendment would still require an explicit owner outcome.

### Existing decisions

- CC-ADR-014 requires checkout and inventory reservation to remain in the same PostgreSQL transaction and the web application to remain one deployable unit through the first catalog release. It was adopted by the fictional Cedar Cart product owner on 2025-11-03. Its scope is checkout writes and the first catalog release; it does not specify a search index or query boundary. Review is conditioned on measured order writes exceeding 20/second for at least 10 consecutive minutes or a separate owner request. No exceptions are recorded. — `input/adopted-decision.md`, all bullets
- The supplied decision snapshot is the only evidence of adoption; no independent owner record is available. — `input/adopted-decision.md`, authorization-source bullet

### Constraints and evidence

- The existing decision must remain unchanged unless the owner explicitly changes it. — `request.md`, final paragraph
- The staging test does not satisfy the recorded load trigger: it reports no interval above 7 order writes/second, while CC-ADR-014 requires more than 20/second for at least 10 consecutive minutes. — `input/load-test-note.md`, first and third bullets; `input/adopted-decision.md`, review-condition bullet
- Production relevance is unknown because staging-to-production equivalence is undocumented and no production measurement was supplied. — `input/load-test-note.md`, second and third bullets
- The 36 catalog reads/second measurement shows observed staging read load, but does not establish a need for a separate search deployable, a suitable implementation, production capacity, or launch readiness.
- The load-test note explicitly provides no authorization to change CC-ADR-014. — `input/load-test-note.md`, fourth bullet

## Decision drivers

- Preserve the adopted checkout transaction boundary unless explicitly reconsidered.
- Determine whether search is governed by the existing first-catalog-release deployment boundary.
- Avoid interpreting non-equivalent staging measurements as production-capacity evidence.
- Balance possible search isolation against the operational cost imposed on a four-person team.
- Reach an explicit owner outcome before treating any amendment as adopted.

## Options considered

| Option | Benefits | Costs / risks | Conditions, exceptions, and trade-offs |
| --- | --- | --- | --- |
| Preserve CC-ADR-014 without amendment | Maintains the adopted boundary; adds no new deployment complexity | Search remains coupled to the existing deployable if it falls within “first catalog release”; suitability is not established | Does not change the checkout transaction rule; does not mean the staging test proves the boundary adequate |
| Amend CC-ADR-014 to permit or require a separate search deployable | Could isolate search deployment or scaling concerns | Adds operational and interface complexity; supplied evidence does not demonstrate necessity or define an implementation | Owner must decide search’s boundary and whether separation is optional or mandatory; checkout and inventory reservation remain transactional unless separately amended |
| Defer amendment pending scope clarification and relevant evidence | Avoids an unsupported architecture choice while preserving the adopted decision | May constrain beta planning or delay a boundary change | Requires owner clarification of whether search is part of the first catalog release and what evidence is needed; current decision remains in force meanwhile |

## Proposed decision

No recommendation yet.

The new evidence does not meet CC-ADR-014’s quantitative review trigger, establish production capacity, or justify either a combined or separate search deployment. The decision’s applicability to search is also ambiguous because it covers the first catalog release but does not specify a search index or query boundary. The authorized owner must resolve that scope and decide whether to preserve, clarify, or amend the deployment boundary.

Until an explicit owner outcome is recorded, CC-ADR-014 remains unchanged.

## Consequences and conditional analysis

- **Expected consequences:** The existing single-unit decision continues to govern its recorded scope. Search architecture remains unresolved. Checkout and inventory reservation continue in the same PostgreSQL transaction.
- **Applicable analysis included:** Comparison of the staging measurement with CC-ADR-014’s order-write review threshold.
- **Applicable analysis missing or deferred:** Production-equivalent capacity evidence; production measurements; search implementation and interface design; failure-isolation, operational, migration, security, and privacy analysis; clarification of whether search belongs to the first catalog release.
- **Trade-offs accepted by this proposal:** Continued uncertainty and possible planning delay in exchange for avoiding an owner decision unsupported by the packet.

## Unresolved owner choices

| Question | Why owner judgment is needed | What depends on it | Needed by / time bound |
| --- | --- | --- | --- |
| Is planned catalog search within CC-ADR-014’s “first catalog release” and single-deployable-unit scope? | The adopted record mentions the release but does not specify search boundaries | Whether an amendment or only a separate search decision is required | Before search launch |
| Should CC-ADR-014 be preserved, clarified, or amended for search? | The load evidence neither triggers review nor selects an architecture | Search deployment boundary and subsequent design work | Before search launch |
| What additional evidence, if any, is required before deciding? | Production equivalence and relevant non-load analyses are missing | Confidence and timing of the owner outcome | No date recorded |
| Does the case request constitute the owner’s separate request for review? | Requester and authorization process are not identified | Whether the alternative review condition has formally occurred | During owner review |

## Source map

| Item / claim | Class | Source and locator | Date / version | Limitations or conflict |
| --- | --- | --- | --- | --- |
| Existing application and catalog are one PostgreSQL-backed deployable | Fact | `input/current-context.md`, second bullet | Undated snapshot | Currency beyond the snapshot is unverified |
| Search is planned for internal beta; implementation and date are unselected | Fact | `input/current-context.md`, third bullet | Undated snapshot | No launch plan supplied |
| Checkout reservation behavior | Fact | `input/current-context.md`, fourth bullet | Undated snapshot | No implementation verification supplied |
| Existing transaction and deployment decision | Existing decision | `input/adopted-decision.md`, status through exceptions bullets | Adopted 2025-11-03 | Only supplied authorization evidence; search applicability is ambiguous |
| Review threshold | Existing decision | `input/adopted-decision.md`, review-condition bullet | 2025-11-03 | “Measured” environment is not specified |
| 36 reads/second and 7 writes/second | Evidence | `input/load-test-note.md`, first bullet | 2026-08-20 | Single 20-minute staging test |
| No qualifying write interval or production measurement | Evidence | `input/load-test-note.md`, second and third bullets | 2026-08-20 | Production equivalence undocumented |
| Test note does not authorize change | Constraint | `input/load-test-note.md`, fourth bullet | 2026-08-20 | None stated |
| Preserve the decision absent explicit owner change | Constraint | `request.md`, final paragraph | Undated | Requester/owner identity not supplied |
| Four-person engineering team | Fact | `input/current-context.md`, first bullet | Undated snapshot | No operational-capacity detail supplied |

## Adoption record

- **Owner outcome:** Pending
- **Target artifact(s) and revision(s):** CC-ADR-014 and any separate catalog-search decision record; revisions pending
- **Authorized owner/authority:** Cedar Cart product owner, as identified by the supplied decision snapshot
- **Authorization evidence URL or record ID:** Pending
- **Date and adopted scope:** Pending
- **Applicability conditions:** Pending
- **Exceptions:** Pending
- **Current canonical architecture updated at:** Pending
- **Downstream artifacts explicitly adopted/derived:** None

This proposal and its status do not amend or adopt architecture.
