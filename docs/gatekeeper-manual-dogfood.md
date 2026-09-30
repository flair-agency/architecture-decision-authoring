# Manual Architecture Gatekeeper dogfood

**Purpose:** development feedback on whether a pinned, manual-only semantic review helps surface possible contract conflicts. These local results are not product acceptance, owner adoption, merge approval, or evidence that the contract itself is correct.

## Fixed runtime and configuration

This guide pins the runtime to `@flair-agency/architecture-gatekeeper@0.5.1`. The release tag `v0.5.1` was verified in the sibling `architecture-gatekeeper` repository at source commit `58bbdbb3119736e53a849388a025e74589ab8664`. Use only that exact release for this dogfood; do not use a floating version or an unpinned registry fallback. The runtime is configured for local/manual version 2 and one self authority: `authoring-product-contract` at the committed `docs/architecture.md` revision. The manifest identifies the self authority at the reviewed Git revision; no external authority is selected.

The consumer-owned prompt, output schema, deterministic decision validation, reviewer model/effort, limits, and timeout are in `.codex/gatekeeper/`. Their selection does not make the review an acceptance gate. The reviewer is configured as `gpt-6.1-sol` with `low` reasoning and a 180,000 ms review timeout.

Use the already-installed exact package entry point `architecture-review` with a focused change description, for example:

```sh
architecture-review "Review the proposed change to [briefly identify changed files and intended responsibility]."
```

The manual CLI runs a model review and validates its structured decision against the committed consumer configuration. It does not implement changes. Keep the input focused and identify the exact proposal/revision being examined.

## Representative procedure

Use a small, non-sensitive, reviewable proposal or change description and record its exact repository revision and input. Examples of useful probes include:

1. A clearly bounded edit that preserves the standalone authoring responsibility and leaves adoption with the authorized owner. Record the returned semantic decision and authority provenance.
2. A proposal to make proposal generation automatically update the canonical architecture record or to treat a merge/status label as adoption. Check whether the review identifies a conflict with the adoption boundary.
3. An ambiguous proposal that would make the core depend on a downstream Gatekeeper schema or runtime. Check whether it distinguishes the consumer-owned optional handoff from a new core dependency, and routes insufficient authority to `OWNER_DECISION` rather than inventing an owner choice.
4. A material expansion of product scope that the adopted contract does not settle. Check whether the review returns `OWNER_DECISION` and states the unresolved choice without selecting it.
5. An isolated copy of the configuration with a missing or invalid authority selection. Check only the preparation/materialization path and confirm that execution remains incomplete rather than producing a semantic decision. Do not alter the committed authority selection merely to create this probe.

These are suggested manual probes, not claims that any review has been executed. Do not modify the Skill, evaluation cases, expectations, or pilot artifacts as part of this dogfood.

## Interpret results carefully

After a successful prepare, reviewer invocation, and validation, `PASS`, `BLOCK`, and `OWNER_DECISION` are semantic review outcomes against the selected authority at a recorded commit. They are development feedback only. A reviewer response alone is not a successful review: unavailable authority, preparation/configuration/schema errors, reviewer timeout or failure, malformed output, or deterministic validation failure means **incomplete execution**. Do not translate incomplete execution into PASS, BLOCK, or OWNER_DECISION, and do not treat it as a semantic judgment.

Record the reviewed commit, exact pinned runtime version, selected authority ID and revision, task/input, structured outcome, and any incomplete-execution reason. Preserve that record as diagnostic evidence; do not change adoption status or make a merge/check requirement from it.

## Explicit non-scope

This is manual-only, local dogfood. It adds no CI workflow, required check, hook, `OWNER_*` route, merge enforcement, or automatic follow-up. It does not amend `docs/architecture.md`, authorize architecture changes, adopt proposals, or change the standalone product contract. A later proposal to expand these boundaries requires owner review and canonical authority updates before implementation.
