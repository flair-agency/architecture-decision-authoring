# Represent a pending adoption process without inventing an owner outcome

- **Status:** Adopted
- **Decision date:** 2026-09-29
- **Decision owner:** Repository owner
- **Authorization evidence:** [explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5891751901)
- **Target artifact:** [`docs/architecture.md`](../architecture.md), adoption-record lifecycle and schema

## Context

The adoption workflow must distinguish an owner who has not yet decided from an owner who explicitly chose `Defer`. Treating a pending process as the `Defer` outcome would record an owner decision that did not happen. Decision record 0002 already says pending adoption produces no consumable Authority Set, but did not define the pending record's exact representation or legacy compatibility.

## Decision

New adoption records use `schemaVersion: 1`, `status: "Pending"`, and `outcome: null` before the owner acts. A pending record contains only those fields and a `proposal` object with the exact package-relative path, full immutable Git revision, and SHA-256 digest of the Proposal bytes. It contains no owner, authorization evidence, decision date, scope, applicability conditions, exceptions, adopted content, or amended content. It must not include or leave an Authority member or selector.

After an explicit owner action, the record uses `status: "Decided"` and exactly one `outcome` from `Adopt`, `Amend`, `Defer`, or `Reject`, with the existing common evidence and outcome-specific fields. `Pending` with a non-null outcome, `Decided` with a null or unknown outcome, and `outcome: "Pending"` are invalid.

For backward compatibility, a record without `status` is accepted only as a legacy decided record when it has one of the four existing outcomes and passes all prior validation. A legacy `Defer` remains `Defer`; it is never migrated or interpreted as `Pending` automatically.

## Consequences

- The record preserves the difference between no owner decision and an explicit deferral.
- Pending records can be validated against the exact Proposal bytes without fabricating decision metadata.
- No Authority Set can be emitted while the record is pending.
- Existing valid records remain readable without changing their recorded outcomes.
