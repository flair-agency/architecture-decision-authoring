# Distinguish pending adoption from a decided outcome

- **Status:** Adopted
- **Decision date:** 2026-09-29
- **Decision owner:** Repository owner
- **Authorization evidence:** [explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5891751901)
- **Target artifact:** [`docs/architecture.md`](../architecture.md), adoption-record lifecycle

## Context

The adoption record must distinguish an owner process that is still pending from an explicit `Defer` outcome. The earlier contract required an explicit owner outcome before producing an Authority Set, but did not specify how a pending record is represented or how existing records remain compatible.

## Decision

Represent a pending adoption record with `status: "Pending"` and `outcome: null`. Preserve the Proposal reference in the record and do not invent owner or decision metadata while the process is pending.

After an explicit owner action, represent the record with `status: "Decided"` and one outcome: `Adopt`, `Amend`, `Defer`, or `Reject`.

For compatibility, a record without `status` is a valid legacy decided record only when it has one of those four outcomes and passes the prior validation requirements.

## Consequences

- A pending process is distinct from an owner's explicit decision to defer.
- The Proposal reference remains available while adoption is pending.
- Existing valid decided records can continue to be read without changing their outcomes.
- The record represents supplied owner information; it does not authenticate the owner or authorization evidence.
