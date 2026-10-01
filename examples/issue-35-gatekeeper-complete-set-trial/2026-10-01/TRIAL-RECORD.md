# Issue #119 complete-set subset conversion diagnostic

This is a non-consumable diagnostic record of an incomplete conversion trial using three exact sentences from the historical Gatekeeper Issue #119 Proposal. The public owner comment records `Adopt` for the proposed route on 2026-09-26; that historical outcome and date remain unchanged. The 2026-10-01 trial authorization permits this bounded evidence exercise, not a new owner outcome or re-adoption. The current diagnostic record contains no active Authority member or manifest.

This evidence does not represent all of Issue #119, replace a consumer's complete Authority Set, amend canonical architecture, select consumer policy, or activate enforcement. The `diagnostic-record/` directory at this outer repository path is an unvalidated reproduction copy because its Proposal commit is unavailable in the ADA repository object database. The bundle history preserves a prior source-bound partial-excerpt fixture and its raw checker/materializer reports. The current bundle head contains no Authority member or selector and is retained for diagnostics only. It contains only public Issue #119 source material and synthetic fixture data. No private consumer inputs or outputs are included.

## Preserved public sources

- [`source/issue-119-proposal-snapshot.md`](source/issue-119-proposal-snapshot.md) preserves the complete public Issue #119 body byte-for-byte (SHA-256 `5f340c1038c230f1ae04da4a6a9ab9d0d0af42ade832a2e5678f3fe3d1a94606`). The same bytes appear in `diagnostic-record/proposal.md`.
- [`source/owner-outcome-comment.md`](source/owner-outcome-comment.md) preserves the complete public owner comment #5844031460 byte-for-byte (SHA-256 `e971430d18445451e9479804f1702e5c441aa3b520bf1dd785cd806575574e8a`). The comment identifies the proposal as adopted. Owner identity and source authenticity are not independently verified here.
- The proposal byte-anchor commit is `a585445816b86f0dc556cd806a7bfb6c7d4eec65`. It records only the preserved Proposal and owner-comment bytes at their fixture paths; it is a content anchor, not evidence of owner action. Its fixture author and commit time do not identify the historical owner or decision date.

## Adopted route and trial subset

The historical owner outcome adopts the complete Required design paragraph 1 by reference, as recorded in `diagnostic-record/adoption-record.json`. An earlier trial fixture selected sentences 1–2 and sentence 4, but omitted the adopted sentence on bounded handling for large documents or migration. Because that excerpt did not represent the complete adopted route, the current public tree removes the Authority member and manifest and retains only a non-consumable diagnostic record.

The historical `Adopt` applies by reference to the single proposed route in Issue #119. The adoption record identifies the original owner comment, date, and complete Required design paragraph locator for the route adopted by reference; the excerpt is a separate trial selection, not a separately itemized owner action. The trial scope is an evidence boundary only and does not change or invalidate the historical outcome. The packaged proposal commit anchor contains only source bytes; it records byte preservation for the 2026 trial and does not claim a new proposal or adoption. The historical owner action it preserves is dated 2026-09-26.

The related current canonical source is Gatekeeper `docs/architecture.md` at commit `c00f1d3091a398b8c1c25ab8f2247a6936a39992`, section “Target multi-document OWNER_ADDITION route (Issue #119 owner decision),” lines 256–330. That adopted contract states the complete previous-base-selected set requirement, exact affected-member scope, exact IDs/provenance, fail-closed conditions, and preservation of historical G0 semantics. It is cited for source comparison only; this trial does not edit it or package it as an alternate complete Authority Set.

Outside this evidence subset are the proposal's bounded large-document handling sentence, Acceptance section, and tests, as well as any actual B eligibility decision, a real consumer's multi-member materialization, consumer policy selection, canonical replacement, enforcement, and activation. The owner-comment per-file-ceiling change remains part of the historical outcome but is not exercised by this trial. The one-member v1 materialization below is parser/materializer compatibility evidence only; it does not prove that a real multi-member review loaded or checked every consumer authority.

## Mechanical observations

- The earlier checker reports [`materializer/final-fixture-checker-report.json`](materializer/final-fixture-checker-report.json) and [`materializer/initial-checker-report.json`](materializer/initial-checker-report.json) are unchanged raw mechanical observations for the prior partial-excerpt fixture. They do not establish a valid complete conversion. The current checker report for the bundled diagnostic record is [`materializer/current-bundle-diagnostic-record-checker-report.json`](materializer/current-bundle-diagnostic-record-checker-report.json); it reports `fail` because the current record has no Authority member or selector. The current outer diagnostic check is [`materializer/current-outer-diagnostic-record-checker-report.json`](materializer/current-outer-diagnostic-record-checker-report.json); it reports `fail` because the source revision is unavailable locally and the record has no Authority member or selector. The historical outer-copy report [`materializer/outer-copy-checker-report.json`](materializer/outer-copy-checker-report.json) remains unchanged. [`diagnostic-record/validation-result.json`](diagnostic-record/validation-result.json) distinguishes the current failures from historical observations; traceability remains `not-verified`, semantic owner acceptance remains pending, authenticity is not verified, and activation was not performed.
- The unchanged raw report [`materializer/materializer-report.json`](materializer/materializer-report.json) records a historical pass from the earlier incomplete one-member excerpt fixture using pinned Gatekeeper 0.5.1, profile `v1`, and test-only development limits. It is parser/materializer mechanics evidence only; it is not a current run, complete adoption conversion, semantic review, or consumer decision.
- The previous excerpt-level bounded comparison report is preserved at [`materializer/bounded-comparison-report.md`](materializer/bounded-comparison-report.md). Its `PASS` covers source identity and fidelity for those selected sentences only; it does not prove conversion of the full adopted route. No consumer multi-member review, eligibility decision, policy selection, enforcement, or activation occurred.

## Separate private-trial aggregate (metadata only)

A separate private trial mechanically selected one already-adopted private decision by comparing its original Proposal, explicitly recorded owner outcome, and current canonical Authority. Its private package checker, bounded independent scope/fidelity/source-bytes review, and pinned Gatekeeper 0.5.1 v1 materialization each reported `PASS`. No source, canonical authority, configuration, selection, or activation changed. Authenticity was not verified and owner semantic acceptance remains pending. The owner's acceptance or correction assessment is unconfirmed; this record makes no claim about whether the owner accepted or corrected the trial. Full artifacts remain in the private environment accessible to the owner. This aggregate includes no private inputs, outputs, paths, commit IDs, hashes, business rules, member text, or report contents. It does not establish general effectiveness or Authority Set replacement.

## Independent bounded comparison

A separate read-only review task, `/root/public_trial_comparison` (`gpt-6-luna`, low), returned `PASS` for the selected excerpt’s source identity, clause fidelity, semantic scope, and canonical comparison. This result is limited to those three sentences; it is not a complete-conversion assessment and does not override the current checker failures or the missing adopted sentence. It does not authenticate owner identity or source authenticity, establish owner semantic acceptance, or change the machine-reported semantic-fidelity status (`pending`).

## Reproduction

The bundle [`fixture/issue-119-complete-set-data.bundle`](fixture/issue-119-complete-set-data.bundle) preserves the incomplete excerpt fixture in Git history. Its current `trial-final` branch contains public source and diagnostic records only; it has no Authority member or selector. The current diagnostic-record checker is expected to fail.

```sh
set -eu
ROOT=/path/to/architecture-decision-authoring
EVIDENCE="$ROOT/examples/issue-35-gatekeeper-complete-set-trial/2026-10-01"
TRIAL_DIR=/private/tmp/gk119-complete-set-repro
FIXTURE="$TRIAL_DIR/fixture"
mkdir -p "$TRIAL_DIR"
git clone -q --branch trial-final "$EVIDENCE/fixture/issue-119-complete-set-data.bundle" "$FIXTURE"
if node "$ROOT/skills/architecture-decision-authoring/scripts/validate-decision-package.mjs" \
  "$FIXTURE/examples/issue-35-gatekeeper-complete-set-trial/2026-10-01/diagnostic-record" "$FIXTURE"; then
  echo "Unexpected success: diagnostic record must remain non-consumable" >&2
  exit 1
else
  checker_status=$?
  test "$checker_status" -ne 0
  echo "Expected checker failure confirms the diagnostic record is non-consumable"
fi
```

To reproduce the earlier raw mechanical passes only, use a separate fixture clone and check out the prior incomplete-excerpt fixture commit `bea442cc06c394736541a898bdd0586552eeac94`. Its package checker and pinned 0.5.1 materializer observations are preserved in the linked raw reports. They are diagnostic mechanics results for an incomplete excerpt; they are not a valid conversion of the full adopted route, and they do not authorize consumer use.

The refreshed fixture bundle's `trial-final` branch is at commit `0e97608ac258ba3d96db749b8ad9cb2a5f6f6988`; the bundle is 18,706 bytes with SHA-256 `015d59415ef8781c6e6bd5f6f3843674897f1565a968a0348f49bc5676460da3`. Its current tree contains the source snapshots and diagnostic records only, with no Authority member or manifest. The original source anchor `a585445816b86f0dc556cd806a7bfb6c7d4eec65` and historical materializer-input snapshot `b93cee8` are unchanged. The earlier incomplete excerpt and its raw mechanical observations remain in bundle history at `bea442cc06c394736541a898bdd0586552eeac94`; they are preserved as historical evidence, not as the current package. The new bundle commit is a diagnostic-record update, not an owner action or re-adoption.
