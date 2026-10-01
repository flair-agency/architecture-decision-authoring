# Bind a Proposal revision to committed repository bytes

- **Status:** Adopted
- **Decision date:** 2026-09-30
- **Decision owner:** Repository owner
- **Authorization evidence:** [explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5902266341)
- **Target artifact:** [`docs/architecture.md`](../architecture.md), Proposal revision validation

## Context

The adoption record identifies a Proposal path, immutable revision, and digest. Checking only that the digest matches the packaged Proposal does not establish that those bytes belong to the identified repository revision.

## Decision

Use the repository root supplied for validation to resolve the package's Proposal to its repository-relative placement path. At the recorded full 40- or 64-character commit ID, require the Proposal blob to be locally available at that path and compare its bytes with the packaged Proposal. Continue checking that the adoption record's SHA-256 matches the packaged Proposal bytes.

Do not fetch missing Git objects. A missing commit or Proposal blob, or a byte or digest mismatch, fails validation.

## Consequences

- The recorded revision is checked against the exact Proposal bytes packaged for review.
- Recomputing a digest for different Proposal bytes cannot make those bytes match an unrelated recorded revision.
- Validation can proceed only when the required commit and Proposal blob are locally available.
- This is a structural integrity check; it does not authenticate the repository, owner, or authorization evidence.
