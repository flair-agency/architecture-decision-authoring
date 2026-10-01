# Synthetic Defer stale-output quarantine rehearsal

> SIMULATION ONLY. The owner, decision, evidence ID, Proposal use, and input are fictional. This is not real owner approval, a consumer trial, Gatekeeper compatibility evidence, or policy activation.

## Provenance

- The host agent followed the checked-in finalization Skill workflow directly; this was not a Codex CLI run, nested `codex exec`, or registered UI Skill invocation. The bounded worker was `/root/minimal_slice_plan`, using inherited `gpt-6-luna` / low settings.
- The authoring source under test was commit `59b78e6178e57d8c89ef187fa998a18997b97191`. Its `SKILL.md`, finalization reference, and checker SHA-256 digests were `3455d42a1dd31526a878af6074a09ee1bf837ed68e2b7c352570feaa471a5330`, `241bcbeda9c2f4c45c2f5cf4e5a499f721ff93c057bfa3e36c57b18b0098adc4`, and `6a512fba251b49e5f38c4b9075bed7b3ba9d834aca685582d9a811d3e241a5de` respectively.
- The temporary run directory was `/private/tmp/ada-issue35-stale-defer-hostskill.SreGBZ`. No network, live consumer data, Gatekeeper materializer, or real owner evidence was used.

## Fixture and observed steps

The fixture was a fresh clone of the retained synthetic Proposal bundle at commit `e9c69a7cb9309688d395270b3a027db5c56f9c9d`. The Proposal blob was 1,308 bytes with SHA-256 `39b269ceb0fd967a85c7da7b5fd1e7ce9bc74d0516798bfe12fb36e78fe83105`. A complete package from the [retained synthetic Adopt example](../repeated-adopt/decision-package/) was placed at the expected package path with an unrelated operator-note sentinel; its inventory is retained in [`inventories/before.tsv`](inventories/before.tsv).

The synthetic owner outcome records `Defer` because age calculation and display semantics remain unresolved. The exact input and package adoption record are retained in [`source/synthetic-owner-outcome.md`](source/synthetic-owner-outcome.md) and [`source/adoption-record.json`](source/adoption-record.json). The four known generated files—`authority-set/authority.md`, `authority-set/manifest.json`, `traceability.md`, and `validation-result.json`—were manually moved outside the active package to quarantine. They were preserved byte-for-byte. The unrelated sentinel remained in the active package and matches [`sentinel-before.txt`](sentinel-before.txt).

The checker was run against the successful seed and again after quarantine and the Defer record. The exact command used for each run was:

```sh
node /private/tmp/ada-issue35-stale-defer-hostskill.SreGBZ/source-under-test/skills/architecture-decision-authoring/scripts/validate-decision-package.mjs /private/tmp/ada-issue35-stale-defer-hostskill.SreGBZ/fixture/repo/decision-package /private/tmp/ada-issue35-stale-defer-hostskill.SreGBZ/fixture/repo
```

Both invocations exited `0` and returned `packageValidation: pass` with no errors. Raw JSON reports and exit codes are retained under [`reports/`](reports/). The checker pass is only its reported package-level result. The after-inventory at [`inventories/after.tsv`](inventories/after.tsv) shows that the active package has the updated Defer record, unchanged Proposal, and sentinel, with no Authority member or selector; the four quarantined outputs retain their original sizes and SHA-256 digests. The sentinel before and after has SHA-256 `ac95b897dc74d81172d21d92d95523a6b1c80a95b67737663461f1f539ec5d6b`.

## Reproduce the recorded package states

From the repository root, make a fresh temporary clone of the retained bundle and seed it with the committed synthetic Adopt package and unrelated sentinel:

```sh
REHEARSAL_DIR=$(mktemp -d)
git clone --no-checkout examples/issue-35-finalization-rehearsals/2026-10-01/evidence/synthetic-proposal-fixture.bundle "$REHEARSAL_DIR/repo"
git -C "$REHEARSAL_DIR/repo" checkout --detach e9c69a7cb9309688d395270b3a027db5c56f9c9d
mkdir -p "$REHEARSAL_DIR/repo/decision-package" "$REHEARSAL_DIR/repo/source"
cp -R examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/. "$REHEARSAL_DIR/repo/decision-package/"
cp examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/source/synthetic-owner-outcome.md "$REHEARSAL_DIR/repo/source/synthetic-owner-outcome.md"
cp examples/issue-35-finalization-rehearsals/2026-10-01/evidence/defer-stale-output/sentinel-before.txt "$REHEARSAL_DIR/repo/decision-package/unrelated-operator-note.txt"
node skills/architecture-decision-authoring/scripts/validate-decision-package.mjs "$REHEARSAL_DIR/repo/decision-package" "$REHEARSAL_DIR/repo"
```

Next, copy the retained Defer adoption record to `decision-package/adoption-record.json` and the synthetic owner outcome to `source/synthetic-owner-outcome.md`. Manually move the four known generated files out of the active package—`authority-set/authority.md`, `authority-set/manifest.json`, `traceability.md`, and `validation-result.json`—preserving them under a separate quarantine directory. Leave `proposal.md`, the Defer adoption record, and `unrelated-operator-note.txt` in place, then run the same checker command again. The exact observed inventories and reports are retained above. This reproduction is a manual quarantine procedure; it does not test automatic cleanup or publisher behavior.

## Limits

This records one manual synthetic workflow run using the documented quarantine procedure. It does not prove that the checker detects stale output, authenticate an owner, verify semantic fidelity or clause traceability, establish Gatekeeper compatibility, or show consumer selection or activation. The checker reports leave traceability and validation-result claims unverified, semantic fidelity pending, owner/evidence authenticity unverified, Gatekeeper compatibility not run, and activation not performed.
