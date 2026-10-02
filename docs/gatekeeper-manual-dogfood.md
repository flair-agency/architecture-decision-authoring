# Manual Architecture Gatekeeper dogfood

**Purpose:** development feedback on whether a pinned, manual-only semantic review helps surface possible contract conflicts. These local results are not product acceptance, owner adoption, merge approval, or evidence that the contract itself is correct.

## Fixed runtime and configuration

This guide pins the runtime to `@flair-agency/architecture-gatekeeper@0.6.0-preview.2`, published from source commit `c6c45da24d755ddd51b3a595e614242f869ec3ad`. Use only this exact release for this dogfood; do not use a floating version or an unpinned registry fallback. The exact package is a repository-scoped development tool under `tools/gatekeeper-preview/`, with `package-lock.json` locking the GitHub Packages tarball and integrity. Install it with:

```sh
npm ci --prefix tools/gatekeeper-preview --registry=https://npm.pkg.github.com
```

This keeps the shared host-level Gatekeeper installation unchanged. The runtime is configured for local/manual version 2 and one self authority: `authoring-product-contract` at the committed `docs/architecture.md` revision. The manifest identifies the self authority at the reviewed Git revision; no external authority is selected.

The consumer-owned prompt, output schema, deterministic decision validation, reviewer model/effort, limits, and timeout are in `.codex/gatekeeper/`. Their selection does not make the review an acceptance gate. The reviewer is configured as `gpt-6-sol` with `low` reasoning and a 180,000 ms review timeout.

Use the project-scoped exact package entry point `tools/gatekeeper-preview/node_modules/.bin/architecture-review` with a focused change description, for example:

```sh
tools/gatekeeper-preview/node_modules/.bin/architecture-review "Review the proposed change to [briefly identify changed files and intended responsibility]."
```

The manual CLI runs a model review and validates its structured decision against the committed consumer configuration. It does not implement changes. Keep the input focused and identify the exact proposal/revision being examined.

For a native Skill review, use the same project-scoped installation's `architecture-review-native` entry point. Prepare a private request with `prepare`, give its exact prompt, schema, model, and reasoning effort to a separate host-native review-only reviewer, save only the returned JSON decision, then pass it to `validate`:

```sh
review_dir="$(mktemp -d /private/tmp/ada-architecture-review.XXXXXX)"
request_path="$review_dir/request.json"
decision_path="$review_dir/decision.json"
tools/gatekeeper-preview/node_modules/.bin/architecture-review-native prepare "$request_path" "Review the proposed change to [briefly identify changed files and intended responsibility]."
# Have the host-native review-only reviewer save its returned JSON to "$decision_path".
tools/gatekeeper-preview/node_modules/.bin/architecture-review-native validate "$request_path" "$decision_path"
rm -rf "$review_dir"
```

Remove both private files after validation. Do not substitute the manual CLI for the native Skill reviewer. The host-installed `architecture-review` Skill's SHA-256 is `2fab19f48d022fd57d94fc7b3494c03aebb2a7d9f38ed022f58835a98e008a5a`; it byte-matches `skills/architecture-review/SKILL.md` at the pinned preview source commit. Both that Skill and `src/native-review.mjs` are unchanged between Gatekeeper v0.5.1 source `58bbdbb3119736e53a849388a025e74589ab8664` and preview source `c6c45da24d755ddd51b3a595e614242f869ec3ad`; the preview does not claim to correct the historical native-review nonresponse.

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
