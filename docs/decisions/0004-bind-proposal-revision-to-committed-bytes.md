# Bind Proposal revisions to committed repository bytes

- **Status:** Adopted
- **Decision date:** 2026-09-30
- **Decision owner:** Repository owner
- **Authorization evidence:** [explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/pull/36#issuecomment-5902266341)
- **Target artifact:** [`docs/architecture.md`](../architecture.md), adoption-record lifecycle and validator contract

## Context

The adoption record already carries a Proposal path, immutable Git revision, and SHA-256 digest. The package validator checked that the digest matched the bundled `proposal.md`, but it did not establish that the bundled bytes existed at the recorded revision. A different Proposal could therefore be supplied with a recomputed digest while retaining an unrelated revision.

## Decision

The validator's repository-root argument identifies the Git top-level directory and must be checked against Git's reported top-level directory. Resolve the package's `proposal.md` to its repository-root-relative path. At the recorded full 40- or 64-character commit ID, require a locally available commit and a regular file blob at that path, then compare the blob bytes byte-for-byte with the bundled Proposal. Continue checking the declared SHA-256 against the bundled bytes. Do not fetch missing objects; missing commits, missing blobs, non-commit objects, and byte mismatches fail validation.

Use argument-array Git invocations and pass the selected path after `--`, so Proposal content and paths are never interpreted as shell commands or Git options.

## Consequences

- The revision identifies the exact source Proposal that was bundled for owner review.
- Recomputing the package digest cannot disguise a changed Proposal under an unrelated revision.
- Validation depends on the required commit and blob being present in the local repository; it performs no network fetch.
- The package repository must be supplied as its exact Git top-level root.

## Conditions and exceptions

This rule applies to pending and decided adoption records because both bind an exact Proposal revision. The validator remains a structural integrity check; it does not authenticate the Git remote, owner, or adoption evidence.
