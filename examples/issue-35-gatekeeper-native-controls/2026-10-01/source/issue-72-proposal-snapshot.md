## Problem

Issue #69's fresh native Skill E2E is incomplete under the current contract because the available host-native subagent interface can select model and reasoning effort but does not expose per-reviewer read-only sandbox and hard-timeout settings or proof that they were applied. PR #71 correctly records that limitation under the **current** contract. Before waiting indefinitely for host controls, we should decide whether both controls belong to the native Skill's required assurance, or whether they were inherited from execution adapters with different risks.

This is an architecture owner decision, not permission to reinterpret the existing contract. Until a decision is recorded in `docs/architecture.md`, the native route remains incomplete when its required settings cannot be applied.

## Evidence and distinctions

- [#25](https://github.com/flair-agency/architecture-gatekeeper/issues/25) separated shared review semantics from Hook/CLI child-`codex exec` transport. It explicitly still called for an **independent, read-only, structured** native reviewer; read-only cannot be dismissed as merely an accidental CLI flag. It did not identify a native hard timeout as a semantic requirement.
- [PR #31](https://github.com/flair-agency/architecture-gatekeeper/pull/31) adopted the current owner-decision contract. A review comment about silently using host-default model/effort led to the explicit rule that the Skill must apply recorded model, reasoning effort and bounded reviewer settings or fail closed.
- The [current contract](https://github.com/flair-agency/architecture-gatekeeper/blob/main/docs/architecture.md) requires the native Skill to use a host-native read-only reviewer with bounded settings, while also saying host sandboxing, process approval and credentials are outside the semantic decision contract. These statements need a precise adapter boundary.
- Hook/standalone CLI enforce `--sandbox read-only` and `spawnSync(..., { timeout: reviewTimeoutMs })`. CI has a read-only review action and job timeouts. These controls serve different execution contexts.
- [PR #71](https://github.com/flair-agency/architecture-gatekeeper/pull/71) observed a separate host-native reviewer, explicit model/effort, returned decision JSON and successful validation, but correctly did **not** claim a conforming Skill E2E because host-applied read-only and timeout were unverified.

Separate the following claims:

1. The reviewer **does not modify** the reviewed project (role/behavior and recorded revision).
2. The host **prevents writes** through a read-only sandbox (execution enforcement).
3. An incomplete reviewer can be cancelled or ended within a bounded time (lifecycle safeguard).
4. The host enforces the exact `reviewTimeoutMs` on that reviewer (specific hard deadline).

A prompt instruction is not a substitute for an enforced sandbox. Conversely, completion before a deadline does not prove a hard timeout was configured. Local feedback also does not become CI merge evidence by changing these controls.

## Decision to make

Choose and document one of these native Skill assurance policies:

- **Retain current assurance:** require host-applied, observable read-only and exact bounded reviewer controls. #69 remains incomplete until a suitable native host interface exists. Record why both are essential to local review validity, not only helpful safeguards.
- **Make controls adapter-specific:** require a separate review-only, non-mutating native reviewer, exact prepared prompt/schema/model/effort, reviewer-produced decision and deterministic validation. Use and record host read-only enforcement when available; never claim that task-text instructions provide it. Treat timeout/cancellation as native host/task lifecycle policy rather than requiring an exact per-reviewer hard timeout for semantic E2E. Keep existing Hook/CLI and CI safeguards. Explicitly state the weaker native local assurance and how non-mutation is checked or reported.
- **Hybrid:** retain host-enforced read-only as mandatory for native, but move exact hard timeout to adapter lifecycle policy; #69 then still waits for read-only capability.

The second option appears proportionate for local development feedback, while the first or hybrid may be warranted if enforced write prevention is an intentional native-review trust boundary. Decide that tradeoff explicitly. Do not weaken the protected CI acceptance route.

## Acceptance criteria

- [ ] Owner selects the native Skill assurance policy and records the decision in `docs/architecture.md` before changing implementation or treating #69 as complete.
- [ ] Contract distinguishes non-mutating reviewer behavior, enforced read-only sandbox, bounded task lifecycle and exact hard timeout; it states which are required for each adapter.
- [ ] Model/effort selection and structured decision provenance remain enforced; failures remain incomplete rather than `BLOCK` or `PASS`.
- [ ] Skill, README, E2E template and #69 evidence criteria are aligned with the selected policy; prior incomplete run is not retroactively mislabeled as conforming.
- [ ] Hook/CLI hung prevention, CI job bounds and credential boundaries are preserved.
- [ ] A fresh representative native E2E is recorded under the adopted policy; local diagnostic evidence is not used as CI acceptance.

Related: #25, #69, PR #31, PR #71.

