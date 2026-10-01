# Issue #72 native controls conversion trial

## Result and boundary

This is a bounded conversion and compatibility trial for the exact second option selected by the Architecture Gatekeeper owner in public Issue #72 on 2026-09-24. The trial preserves the historical outcome; it is not a new adoption, a canonical-authority change, or policy activation. The source issue body has no original Git commit/blob revision. The fixture's commit `09bab04e792cf956194da268bfcc17bcacee01e6` is a new package-placement byte anchor for the exact source snapshot only. The owner's public outcome comment is preserved byte-for-byte; its `Adopt` value is a normalized representation of the explicit selection, not a claim that the comment literally contains the word “Adopt”. Source/owner authenticity remains `not-verified`.

The package contains one exact adopted bullet as one Authority member, with all clauses preserved in their original order. It is a development compatibility artifact for one historical decision; it does not represent a full current Authority Set, consumer configuration, protected-CI acceptance, implementation acceptance, or policy selection/activation.

## Evidence

- Public proposal snapshot and owner outcome comment: exact raw bytes under `source/`; byte lengths, URLs, hashes, source dates, original revision availability, and comparison-source identity are in `source-identities.json`.
- The bundle contains a committed, self-contained fixture repository at `fixture/issue-72-native-controls.bundle`. Fixture branch head: `499a07c1d594152ef4375f6042ad15c83c660e21`. Proposal byte anchor: `09bab04e792cf956194da268bfcc17bcacee01e6`. The Gatekeeper v1 selector/member are present at the recorded package placement path. Bundle SHA-256: `48ed322f95f6b888c1d6c36f39fcfe4b0123f0a88eae2e9a30e8838796eeea44`.
- Exact selected member: `eb69510c74f3e34229fa1b76020d5e90e9386113e06f27849da1580da63a21e3`; 587 bytes. Selector SHA-256: `9d644fa79dce9de8e84a6f2fc881f1db6ce82db3a2791d71842184ed48e35f42`.
- Focused package checker on a fresh clone of the bundle: exit 0; report `reports/package-checker.json` says `packageValidation: pass`, with traceability `not-verified`, semantic fidelity `pending`, owner evidence authenticity `not-verified`, consumer activation `not-performed`, and no errors.
- Pinned Gatekeeper compatibility: `@flair-agency/architecture-gatekeeper` 0.5.1, source revision `58bbdbb3119736e53a849388a025e74589ab8664`; materializer exit 0 against committed fixture authority revision `c440fdae1399bd5a08ad1c03a84f01b8a817ac5d`. `reports/gatekeeper-provenance.json` records one member, 587 bytes, matching SHA-256. The materialized prompt envelope was parsed and its selected member content compared byte-for-byte with the committed Authority member.

These checks establish mechanical package consistency, Proposal byte binding, selector structure, and the pinned parser/materializer result only. They do not establish semantic acceptance or authenticity. The separate manual clause mapping is in `comparison-report.md`; it identifies the final clause's under-specified counterpart in current Authority. Owner semantic review remains pending.

## Reproduce the focused checks

Use a clean checkout of this ADA repository for `ADA_ROOT`; commands below use a fresh temporary clone of the self-contained fixture bundle and a separate Gatekeeper clone pinned to the published runtime source revision. They do not alter consumer configuration.

```sh
test -n "$ADA_ROOT"
cd "$ADA_ROOT"
trial_tmp=$(mktemp -d)
git clone --quiet --branch trial-final ./examples/issue-35-gatekeeper-native-controls/2026-10-01/fixture/issue-72-native-controls.bundle "$trial_tmp/fixture"
node "$ADA_ROOT/skills/architecture-decision-authoring/scripts/validate-decision-package.mjs" \
  "$trial_tmp/fixture/decision-package" "$trial_tmp/fixture" > "$trial_tmp/checker.json"
node -e 'const r=require(process.argv[1]); if (r.packageValidation !== "pass" || r.errors.length !== 0) process.exit(1)' "$trial_tmp/checker.json"
git clone --quiet --no-checkout https://github.com/flair-agency/architecture-gatekeeper.git "$trial_tmp/gatekeeper"
git -C "$trial_tmp/gatekeeper" checkout --quiet --detach 58bbdbb3119736e53a849388a025e74589ab8664
node "$trial_tmp/gatekeeper/src/prepare-authority-set.mjs" \
  --manifest "$trial_tmp/fixture/decision-package/authority-set/manifest.json" \
  --self-repository flair-agency/architecture-decision-authoring \
  --self-root "$trial_tmp/fixture" \
  --authority-sha c440fdae1399bd5a08ad1c03a84f01b8a817ac5d \
  --limits "$trial_tmp/fixture/reports/gatekeeper-limits.json" \
  --output-dir "$trial_tmp/materialized"
node --input-type=module - "$trial_tmp/fixture/decision-package/authority-set/authority.md" "$trial_tmp/materialized/authority-prompt.md" <<'JS'
import fs from 'node:fs';
const member = fs.readFileSync(process.argv[2], 'utf8');
const prompt = fs.readFileSync(process.argv[3], 'utf8');
const selected = JSON.parse(prompt.slice(prompt.indexOf('\n[') + 1));
if (selected.length !== 1 || selected[0].content !== member) process.exit(1);
JS
```

`$trial_tmp/materialized` must not exist before the materializer call. The captured reports here were generated on a fresh bundle clone; the exact raw checker JSON and provenance are preserved under `reports/`.

## Scope and limits

The trial scope is exactly the single Issue #72 native Skill policy option and its source/outcome mapping. It preserves the selected option's conditions and exclusions: apply the separate review-only, non-mutating reviewer and exact prepared prompt/schema/model/effort; record host read-only enforcement when available without treating task text as enforcement; use native task lifecycle policy for timeout/cancellation; and keep Hook/CLI and CI safeguards. It neither imports an owner-comment-only clause nor evaluates the entire current policy as a complete Authority Set.

The selector is used only to exercise development-time compatibility. No consumer configuration was changed and no policy was activated. Protected CI was not run. Current canonical authority was read only as a comparison snapshot at the immutable identity recorded in `source-identities.json`.

Private live inputs or outputs are not included. No public verification claim is made about any separate private execution.
