# Design views

**Status: Non-normative explanatory views.** These diagrams summarize the adopted contract; they do not add roles, requirements, artifacts, approval steps, or system components. [`docs/architecture.md`](architecture.md) governs whenever wording or diagrams differ.

## 1. Actors and responsibility boundary — who owns what?

```mermaid
flowchart LR
  Proposer[Proposer] -->|supplies materials and a decision question| Authoring[Architecture Decision Authoring]
  Authoring -->|prepares| Proposal[Reviewable proposal]
  Proposal -->|for owner review| Owner[Authorized owner]
  Owner -->|acts through| Process[Consumer-owned process]
  Process -->|records explicit outcome| Outcome{Owner outcome}
  Outcome -->|Adopt or explicit Amend| Finalize[Authority Set finalization]
  Outcome -->|Defer, Reject, or unresolved| NoExport[No consumable Authority Set]
  Finalize -->|produces compatible package| Authority[Gatekeeper-selectable Authority Set]
  Process -.->|may separately update| Current[Current canonical architecture or other authoritative record]
  Authority -.->|consumer may select and activate| Downstream[Architecture Gatekeeper]
  Note[Proposer and owner may be the same person]
  Proposer -.-> Note
```

**Governing contract:** [Purpose and boundary](architecture.md#purpose-and-boundary), [Lifecycle and adoption boundary](architecture.md#lifecycle-and-adoption-boundary), and [Downstream boundary](architecture.md#downstream-boundary).

**Material omissions:** This view is not an organizational chart and does not define reviewer roles, reporting lines, identity, or permissions. Proposer and owner are roles, not necessarily different people. Any review roles belong to the consumer's process; the core does not require a separate reviewer. Gatekeeper is an artifact-compatibility target, not an authoring runtime dependency. Generation does not select or activate consumer policy.

## 2. Concepts and artifacts — what is distinct?

```mermaid
flowchart LR
  Sources[Source materials] --> Classes
  subgraph Classes[Seven statement classes]
    Fact[Fact]
    Assumption[Assumption]
    Existing[Existing decision]
    Constraint[Constraint or evidence]
    Option[Option]
    Proposed[Proposed decision]
    Unresolved[Unresolved owner choice]
  end
  Classes -->|material claims mapped to locators| SourceMap[Source map]
  SourceMap -.->|preserves provenance; does not certify authenticity or authority| Classes
  Classes -->|may inform; none is required in every proposal| Proposal[Architecture Decision Proposal artifact]
  NoRecommendation[May contain no recommendation when evidence does not support one]
  Proposal -.-> NoRecommendation
  Proposal -->|may be| Complete[Complete]
  Proposal -->|may be| Incomplete[Explicitly incomplete but useful]
  Proposal -->|for owner action| Process[Authorized owner acting through consumer-owned process]
  Process -->|if adopted: records authorization| Record[Adopted decision record: historical rationale]
  Current[Current canonical architecture or other authoritative record]
  Record -.-> Distinction[Distinct artifacts; not interchangeable]
  Current -.-> Distinction
  Process -.->|if adopted, may separately update| Current
  Process -->|Adopt or explicit Amend with exact content| Package[Decision package]
  Package --> Adoption[Adoption record]
  Package --> Authority[Markdown Authority member]
  Package --> Selector[Gatekeeper v1 selector]
  Package --> Trace[Clause-level traceability and validation results]
  Package -.->|consumer may select and activate| Downstream[Architecture Gatekeeper]
  Conditional[Additional analyses or artifacts are conditional on scope, risk, and evidence needs]
  Proposal -.-> Conditional
```

**Governing contract:** [Input classification and source mapping](architecture.md#input-classification-and-source-mapping), [Output contract](architecture.md#output-contract), [Lifecycle and adoption boundary](architecture.md#lifecycle-and-adoption-boundary), and [Downstream boundary](architecture.md#downstream-boundary).

**Material omissions:** This is a concept map, not a class model, storage design, generic authority ontology, or exhaustive file inventory. The Proposal and Authority member are Markdown-first. A source map provides traceability, not proof that sources are authentic or authoritative. An adopted decision record is historical evidence and is distinct from current canonical architecture. A compatible selector does not prove semantic fidelity, consumer selection, or activation.

## 3. Authoring and adoption lifecycle — where does authoring end?

```mermaid
flowchart LR
  Gather[Gather source materials] --> Classify[Classify statements and map claims to sources]
  Classify --> Gaps[Identify missing, conflicting, stale, or inaccessible evidence]
  Gaps --> Compare[Develop options and compare trade-offs]
  Compare --> Draft[Prepare proposal]
  Draft --> Complete[Complete proposal]
  Draft --> Incomplete[Explicitly incomplete proposal]
  Complete --> Owner[Authorized owner acts through consumer process]
  Incomplete --> Owner
  Owner --> Outcome{Owner outcome}
  Outcome --> Adopt[Adopt]
  Outcome --> Amend[Amend]
  Outcome --> Defer[Defer]
  Outcome --> Reject[Reject]
  Adopt --> Record[Record authorization and exact Proposal revision]
  Amend --> Exact[Require exact owner-supplied or explicitly approved normative content]
  Record --> Finalize[Finalize bounded Authority Set package]
  Exact --> Finalize
  Finalize --> TraceCheck[Check package traceability]
  TraceCheck -.-> Consumer[Consumer separately selects or activates policy]
  DevCheck[Development compatibility check against a pinned Gatekeeper revision] -.->|validates the artifact contract; not a per-decision runtime step| Finalize
  Defer --> NoExport[No consumable Authority Set]
  Reject --> NoExport
```

**Governing contract:** [Output contract](architecture.md#output-contract) and [Lifecycle and adoption boundary](architecture.md#lifecycle-and-adoption-boundary).

**Material omissions:** The view does not prescribe a tool, approval workflow, mandatory reviewer, number of iterations, or review schedule. It does not require diagrams in individual Proposals. A complete Proposal and an explicitly incomplete but useful Proposal are both valid intermediate outputs. The authorized owner—not the authoring process—chooses whether to adopt, amend, defer, or reject. Generation, commit, merge, and status labels alone are not adoption. Finalization does not update canonical architecture or activate Gatekeeper automatically.
