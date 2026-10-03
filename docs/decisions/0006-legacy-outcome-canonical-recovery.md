# Recover a valid prior-process pre-Git Adopt

- **Status:** Adopted
- **Decision date:** 2026-10-04
- **Decision owner:** Repository owner
- **Outcome:** Adopt Proposal 0006 Option A without amendment
- **Authorization evidence record ID:** `ADA-0006-OWNER-20261004; Codex chat 01a10366-9527-73f0-a545-cd9cbdce8ff5; explicit owner message adopting Option A without amendment`
- **Exact Proposal review target:** commit `ba70d713f487c9e3cf6d0956fa8340f1ef772e55`, path `docs/proposals/0006-legacy-outcome-canonical-recovery.md`, blob `76fc81e0a70d3917be76696ae450d5d19f9153cd`, SHA-256 `11001fdede63f1f375db7a03e6d4fefa506b10bb30e59ca2aff6631cf58dae35`.
- **Adopted content locator:** “Proposed decision for owner review”, the complete “Narrow recovery of an existing outcome” paragraph under Option A, including its applicability and stop conditions.
- **Historical Proposal:** [exact committed Proposal 0006](https://github.com/flair-agency/architecture-decision-authoring/blob/ba70d713f487c9e3cf6d0956fa8340f1ef772e55/docs/proposals/0006-legacy-outcome-canonical-recovery.md).
- **Canonical target:** [`docs/architecture.md`](../architecture.md), “Narrow recovery of an existing outcome”.

## Explicit owner outcome

The repository owner supplied the following direct instruction in the identified Codex chat after reviewing the committed Proposal. This transcription records the supplied outcome; it is not independent owner authentication.

> Proposal0006は **Option A をAdopt** します。Amendはありません。
> 旧プロセス下で有効に記録されたAdoptについて、Adopt対象のexact contentを永続的な証拠から特定でき、その同一bytesを取得でき、必要なrepository authorizationとprecommit reviewを満たせる場合に限り、後からGit bindingを確立して再Adoptなしでcanonical integrationを継続できる、という限定例外を採択します。
> 後発commitは、過去にownerがreviewしたrevisionだったとは扱わず、すでに特定されたcontentにGit identityを追加するものとして扱ってください。
> 新しいdecisionについては、引き続き `Proposal commit → owner outcome` の順序を維持してください。

## Adopted decision

**Narrow recovery of an existing outcome.** This exception applies only when an explicit `Adopt` was recorded under the consumer process applicable at the time, the durable outcome evidence identifies the exact Proposal content, and those exact bytes remain available. With authorization under the consumer's existing repository process, prepare those bytes unchanged, complete the required precommit reviews, commit them, and read back the full commit, repository-relative path, blob, and digest. The later commit establishes the Git binding for the already-identified content; it is not represented as the revision the owner reviewed or as a new owner outcome. Only after the binding and required reviews pass may ADA continue the authorized canonical integration on that branch, preserving the adopted scope, conditions, exceptions, and unrelated canonical content. Record provenance using the consumer's existing process; do not introduce a mandatory schema or evidence-file format. If exact identity, bytes, authorization, access, or required review cannot be verified, stop and report the specific blocker. A missing or inaccessible canonical target is a concrete blocker; a meaning-changing conflict remains an owner decision. The consumer owns PR creation, merge, Gatekeeper selection, and activation. This exception does not change the commit-before-outcome sequence for new decisions or the existing package-export binding and checker.

## Scope and relationship to existing decisions

This decision adopts Option A only, without amended wording. Option B is not adopted. The original Proposal at the identified commit remains the review target; the current Proposal status/outcome annotation does not replace its identity.

Decision 0005 retains the normal commit-before-outcome sequence for new decisions. Decision 0006 provides an explicit, narrow exception for an already-valid prior-process `Adopt`, not an inference that a later commit existed when the owner acted. The earlier exact-content identity and owner evidence are preserved; the later commit adds Git identity only. This is not a new adoption, a recovery path for ambiguous or unavailable bytes, or a general exception for pre-Git `Amend` outcomes.

Existing repository authorization, required precommit reviews, exact-content checks, same-branch canonical integration, clause mapping, scope/conditions/exceptions, unrelated canonical content, and concrete blocker/owner-conflict handling remain required. Optional export and the unchanged package checker retain decisions 0002 and 0004. No mandatory schema, evidence-file format, file count, Gatekeeper runtime dependency, consumer PR/merge action, selection, activation, or new assurance guarantee is adopted.

## Clause mapping

| Adopted Proposal clause | Canonical location and preserved boundary |
| --- | --- |
| Valid prior-process Adopt, durable exact content and available identical bytes | “Narrow recovery of an existing outcome”; exact eligibility is retained. |
| Authorized unchanged preparation, required precommit review, commit and full readback | Same section; commit/path/blob/digest remain required. |
| Later Git identity distinct from original owner review identity; no new outcome | Same section; no retroactive revision claim or repeated adoption. |
| Same-branch adopted-only integration and preservation | Same section and existing lifecycle step 7; no inferred semantic changes. |
| Concrete blockers and unresolved meaning-changing conflicts | Same section and existing Purpose and boundary; owner judgment remains required for new conflicts. |
| Consumer PR/merge/selection/activation; unchanged new-decision and optional-export rules | Same section and existing downstream/output contract; consumer ownership and checker remain unchanged. |

## Evidence and limits

The explicit owner outcome resolves the recovery-rule choice. It does not validate a particular consumer's prior process, evidence, bytes, authorization, Git preparation, integration, export, or activation. Those remain case-specific checks. No time bound or expiry was supplied. Implementation and release readiness are separate from adoption.
