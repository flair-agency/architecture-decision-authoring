## Problem
v0.5.0 G0 requires the entire protected Authority Set to contain exactly one self member (`src/owner-addition-ci.mjs`). LIVE Agency #106/#112 is governed by multiple canonical documents: domain knowledge ownership, domain model, migration status, and clean-v2 baseline. Selecting only the B file would silently omit existing rules and let B-specific review miss contradictions; adding the other members currently fails G0. Separately, its `docs/migration/status.md` is 153,943 bytes, above v0.5 maxFileBytes 131,072.

## Required design
Provide a reviewed protected-base route that binds exact B to its modified authority while preserving and materializing every other governing authority member for ordinary and B-specific review. Keep strict authority-only B scope, decision-ID match, protected previous-policy selection, and fail-closed behavior. Define explicit bounded handling for legitimately large canonical documents or an owner-approved migration path. Do not weaken v0.5 G0 checks or infer that links/prompt text add protected authority.

## Acceptance
Focused negative tests for omitted/mismatched authority, contradictions in unchanged members, large-file limits, stale B/tag/base, and a real LIVE Agency E2E. Existing #112 also independently contains migration-completion claims and an existing-rule conflict, so this issue alone does not make that PR eligible. Consumer tracking: flair-agency/live-agency#113.
