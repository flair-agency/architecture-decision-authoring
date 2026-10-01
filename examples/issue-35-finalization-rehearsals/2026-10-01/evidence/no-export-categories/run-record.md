# Four synthetic no-export category rehearsals

> SIMULATION ONLY. All owner identities, decisions, evidence references, and source inputs below are fictional. These rehearsals are not real owner approval, consumer trials, Gatekeeper compatibility evidence, or policy activation.

## Provenance

- The bounded host worker was `/root/minimal_slice_plan`, using inherited `gpt-6-luna` / low settings. It followed the checked-in Skill and reference directly as a host subagent. These were not Codex CLI runs, nested `codex exec` calls, registered UI Skill invocations, automatic cleanup, or Gatekeeper runs.
- The Skill, finalization reference, and package checker were read from authoring revision `59b78e6178e57d8c89ef187fa998a18997b97191`; their full SHA-256 digests are in [`shared/source-hashes.txt`](shared/source-hashes.txt).
- Each case used an isolated clone of the retained synthetic Proposal fixture at commit `e9c69a7cb9309688d395270b3a027db5c56f9c9d`, seeded with the existing [synthetic Adopt package](../repeated-adopt/decision-package/) and the same unrelated sentinel. The bundle and seed package are not duplicated here.

## Observed cases

Each successful seed passed the checker before the case-specific outcome was applied. The host agent then manually moved the four known generated files—`authority-set/authority.md`, `authority-set/manifest.json`, `traceability.md`, and `validation-result.json`—outside the active package to quarantine. No files were deleted. Each case retained the Proposal, its case-specific adoption record, and the unrelated sentinel in the active package. The before/after inventories preserve the sizes and hashes of active and quarantined files; the sentinel SHA-256 is `7615d86d2e5fd4486360795b7a46fc9798a0c6e20c9b8cafb0ec96817e2ac430` in all four cases.

Each case folder retains its fictional owner-outcome input and package adoption record, before/after inventories, final raw checker report, and exit code. The successful seed's raw report and exit code are shared under [`shared/`](shared/). Checker stderr was empty for every run.

| Input category | Final checker result | Recorded blocker or observation |
| --- | --- | --- |
| `Pending` | Exit 0; `packageValidation: pass` | No export files remain in the active package. |
| `Reject` | Exit 0; `packageValidation: pass` | No export files remain in the active package. |
| `Adopt` missing `authorizationEvidence` | Exit 1; `packageValidation: fail` | Reports `decided adoption requires authorizationEvidence` and missing quarantined output files. |
| `Adopt` without `adoptedContent` locator | Exit 1; `packageValidation: fail` | Reports `Adopt requires adoptedContent identifying the adopted Proposal content` and missing quarantined output files. |

The incomplete `Adopt` cases are recorded as checker failures, not successful package validations. Across the raw reports, clause traceability and validation-result claims remain unverified, semantic fidelity is pending, owner/evidence authenticity is unverified, Gatekeeper compatibility is not run, and consumer activation is not performed.

## Reproduce the recorded states

From the repository root, create one fresh clone per case and seed it from the committed synthetic fixture and existing successful package:

```sh
REHEARSAL_DIR=$(mktemp -d)
git clone --no-checkout examples/issue-35-finalization-rehearsals/2026-10-01/evidence/synthetic-proposal-fixture.bundle "$REHEARSAL_DIR/repo"
git -C "$REHEARSAL_DIR/repo" checkout --detach e9c69a7cb9309688d395270b3a027db5c56f9c9d
mkdir -p "$REHEARSAL_DIR/repo/decision-package" "$REHEARSAL_DIR/repo/source"
cp -R examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/. "$REHEARSAL_DIR/repo/decision-package/"
cp examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/source/synthetic-owner-outcome.md "$REHEARSAL_DIR/repo/source/synthetic-owner-outcome.md"
cp examples/issue-35-finalization-rehearsals/2026-10-01/evidence/no-export-categories/shared/unrelated-sentinel.txt "$REHEARSAL_DIR/repo/decision-package/unrelated-operator-note.txt"
node skills/architecture-decision-authoring/scripts/validate-decision-package.mjs "$REHEARSAL_DIR/repo/decision-package" "$REHEARSAL_DIR/repo"
```

For one case, replace `decision-package/adoption-record.json` with that case's `input/adoption-record.json` and `source/synthetic-owner-outcome.md` with its `input/synthetic-owner-outcome.md`. Manually move only the four generated files named above into a separate quarantine directory, preserving their paths and bytes. Run the same checker command again; compare its result with the case table and verify the inventories and sentinel digest. Repeat in a fresh clone for each category.

This records four manual synthetic package states after quarantine. It does not establish automatic cleanup, general fail-closed behavior beyond these recorded inputs and checker results, owner authenticity, semantic fidelity, Gatekeeper compatibility, consumer selection, or activation.
