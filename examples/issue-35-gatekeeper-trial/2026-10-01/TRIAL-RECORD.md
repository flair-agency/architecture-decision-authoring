# Gatekeeper Issue #119 `maxFileBytes` bounded trial

This directory preserves one bounded representation trial of the public Gatekeeper Issue #119 owner outcome. It does not change canonical authority, replace a consumer's complete Authority Set, select or activate policy, authenticate the historical owner action, or verify the other Issue #119 decisions.

## Source bytes and identities

- Public sources: [Issue #119](https://github.com/flair-agency/architecture-gatekeeper/issues/119) and [owner comment #5844031460](https://github.com/flair-agency/architecture-gatekeeper/issues/119#issuecomment-5844031460). [`source/issue-119-proposal-snapshot.md`](source/issue-119-proposal-snapshot.md) preserves the complete public Issue #119 body unchanged (SHA-256 `5f340c1038c230f1ae04da4a6a9ab9d0d0af42ade832a2e5678f3fe3d1a94606`). The exact same bytes appear as the package Proposal. The fixture commit `6501d2d55e2a083c8cb91645b274e16b73ea297b` binds those bytes at the package path for this trial; it is a source-byte anchor, not the historical owner action revision or a re-adoption.
- [`source/owner-outcome-comment.md`](source/owner-outcome-comment.md) preserves the complete public owner comment #5844031460 unchanged (SHA-256 `e971430d18445451e9479804f1702e5c441aa3b520bf1dd785cd806575574e8a`). The historical comment records `Adopt` for the proposed route. The package's `Amend` is a trial-only encoding of the exact 162-byte `maxFileBytes` sentence from that same comment; it does not rewrite the historical action.
- [`source/current-authority-issue-119-excerpt.md`](source/current-authority-issue-119-excerpt.md) is the relevant excerpt from Gatekeeper `docs/architecture.md` at main commit `c00f1d3091a398b8c1c25ab8f2247a6936a39992`; its full source file SHA-256 is `75e72a6b3b52f997277ce50bdfd775c5323d5ffea049d970814ac24309d33a51`. The excerpt ends at the relevant paragraph boundary. The coordinator compared the exact 162-byte owner sentence with the current canonical route: both specify 262,144 bytes for this new route while retaining the other ceilings and lower selected limits. This is a one-clause source comparison, not owner semantic acceptance; broader route decisions are not assessed, and clause-level traceability remains unverified.
- The 2026-10-01 trial-representation authorization was relayed to the coordinator and is not a public GitHub artifact. It permits preserving an immutable source snapshot and trying this one clause only; it is separate from the historical owner action and does not authorize canonical edits, policy selection, or activation. No identity-authentication claim is made.

## Trial package

[`decision-package/`](decision-package/) contains the package and its source mapping. `owner-approved-amendment.md` and `authority-set/authority.md` contain the exact same 162 bytes from the original owner comment (SHA-256 `ba7f59945d6c403a4c08067ae1f61876ebb21d2e8b595d137dba2bacd300d39b`). The exact sentence is limited to the new versioned multi-document `OWNER_ADDITION` route's per-file ceiling. Other ceilings and explicit consumer-selected limits remain binding. Route context is retained in the Proposal, historical comment, and package metadata; the 162-byte member is not a standalone replacement for a complete consumer Authority Set.

The package outcome label `Amend` is used only to serialize the exact resulting bytes because the Issue body does not itself contain the 262,144-byte result. This is not a claim that the historical owner changed the comment's `Adopt` outcome. The trial also does not assess the remaining Issue #119 decisions.

## Observations

- The producer host task (`minimal_slice_plan`, routed `gpt-6-luna`/`low`) followed the authoring Skill and staged package files manually, including writing the manifest last; the separate materializer action’s exact model/effort is not recorded here; it was not a Codex CLI run, nested `codex exec`, or registered UI Skill invocation. The authoring package checker reported `packageValidation: pass` and no structural errors. Its raw result is [`materializer/initial-checker-report.json`](materializer/initial-checker-report.json). A final reproduction from a fresh clone of the fixture bundle, after copying this directory’s package into the matching fixture path, produced the same report bytes and SHA-256 `5a170df6bc03f58a8511d3efc857ba1426e0d2818ecc1a8618f329a0d1dd1308`. The result explicitly leaves clause traceability and validation-result claims not verified, semantic fidelity pending, owner/evidence authenticity not verified, and consumer activation not performed.
- The separate pinned Gatekeeper check used exact source commit `58bbdbb3119736e53a849388a025e74589ab8664`; [`materializer/materializer-report.json`](materializer/materializer-report.json) records its version, inputs, limits, and output provenance. It successfully materialized the committed one-member fixture at `5031c055d2851a9572de36a3fe923b7e0fcaf848` with explicit test-only compatibility limits. The raw returned provenance is [`materializer/pinned-provenance.json`](materializer/pinned-provenance.json); the summarized invocation and output hashes are in [`materializer/materializer-report.json`](materializer/materializer-report.json). This is a focused materialization result, not proof that a 262,144-byte file boundary is enforced, not the consumer's production configuration, and not policy activation or semantic acceptance.

## Reproduction inputs

[`fixture/issue-119-trial.bundle`](fixture/issue-119-trial.bundle) is a Git bundle with only `refs/heads/trial-proposal-snapshot`, pointing at `5031c055d2851a9572de36a3fe923b7e0fcaf848`; its history contains proposal/source commit `6501d2d55e2a083c8cb91645b274e16b73ea297b` and the member/manifest snapshot. No ambient Git refs are included. The bundle records public Issue material and the relevant canonical source snapshot; it contains no private consumer input.

To reproduce in a fresh temporary directory from a checkout of this repository:

```sh
set -eu
ROOT=$(git rev-parse --show-toplevel)
EVIDENCE="$ROOT/examples/issue-35-gatekeeper-trial/2026-10-01"
GK_REPO=/path/to/flair-agency/architecture-gatekeeper
TRIAL_DIR=/private/tmp/gk119-trial-repro
FIXTURE="$TRIAL_DIR/fixture"
RUNTIME="$TRIAL_DIR/gatekeeper-0.5.1"
mkdir -p "$TRIAL_DIR" "$RUNTIME"
git clone -q -b trial-proposal-snapshot "$EVIDENCE/fixture/issue-119-trial.bundle" "$FIXTURE"
rm -rf "$FIXTURE/issue-35/gatekeeper-119-maxfile/decision-package"
cp -R "$EVIDENCE/decision-package" "$FIXTURE/issue-35/gatekeeper-119-maxfile/decision-package"
cp -R "$EVIDENCE/source" "$FIXTURE/issue-35/gatekeeper-119-maxfile/source"
cp "$EVIDENCE/TRIAL-RECORD.md" "$FIXTURE/issue-35/gatekeeper-119-maxfile/TRIAL-RECORD.md"
node "$ROOT/skills/architecture-decision-authoring/scripts/validate-decision-package.mjs" \
  "$FIXTURE/issue-35/gatekeeper-119-maxfile/decision-package" "$FIXTURE"
git -C "$GK_REPO" archive 58bbdbb3119736e53a849388a025e74589ab8664 package.json src | tar -x -C "$RUNTIME"
node "$RUNTIME/src/prepare-authority-set.mjs" \
  --manifest "$FIXTURE/issue-35/gatekeeper-119-maxfile/decision-package/authority-set/manifest.json" \
  --self-repository flair-agency/architecture-gatekeeper \
  --self-root "$FIXTURE" \
  --authority-sha 5031c055d2851a9572de36a3fe923b7e0fcaf848 \
  --limits "$EVIDENCE/materializer/test-limits.json" \
  --output-dir "$TRIAL_DIR/materialized" \
  --profile owner-addition-v2 \
  --affected-id issue-119-maxfile \
  --affected-path issue-35/gatekeeper-119-maxfile/decision-package/authority-set/authority.md
```

The five explicit values in `materializer/test-limits.json` are test-only compatibility inputs: `maxManifestBytes` 65,536; `maxMembers` 32; `maxFileBytes` 262,144; `maxTotalBytes` 524,288; and `maxPromptBytes` 1,048,576. They are not consumer settings. The trial never tests the 262,144-byte boundary itself.
