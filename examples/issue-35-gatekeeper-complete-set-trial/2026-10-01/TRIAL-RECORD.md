# Issue #119 complete-set subset trial

This is a partial, source-grounded representation of three exact sentences from the historical Gatekeeper Issue #119 Proposal. The public owner comment records `Adopt` for the proposed route on 2026-09-26. The package keeps that outcome and date. The 2026-10-01 trial authorization permits this bounded evidence exercise; it is not a new owner outcome or re-adoption.

This evidence does not represent all of Issue #119, replace a consumer's complete Authority Set, amend canonical architecture, select consumer policy, or activate enforcement. It contains only public Issue #119 source material and a synthetic one-member compatibility fixture. No private consumer inputs or outputs are included.

## Preserved public sources

- [`source/issue-119-proposal-snapshot.md`](source/issue-119-proposal-snapshot.md) preserves the complete public Issue #119 body byte-for-byte (SHA-256 `5f340c1038c230f1ae04da4a6a9ab9d0d0af42ade832a2e5678f3fe3d1a94606`). The same bytes appear in `decision-package/proposal.md`.
- [`source/owner-outcome-comment.md`](source/owner-outcome-comment.md) preserves the complete public owner comment #5844031460 byte-for-byte (SHA-256 `e971430d18445451e9479804f1702e5c441aa3b520bf1dd785cd806575574e8a`). The comment identifies the proposal as adopted. Owner identity and source authenticity are not independently verified here.
- The proposal byte-anchor commit is `a585445816b86f0dc556cd806a7bfb6c7d4eec65`. It records only the preserved Proposal and owner-comment bytes at their fixture paths; it is a content anchor, not evidence of owner action. Its fixture author and commit time do not identify the historical owner or decision date.

## Adopted subset and exclusions

The Authority member contains only the exact Required design paragraph 1 sentences 1–2 and sentence 4 listed in `decision-package/adoption-record.json`. These clauses concern preserving every governing authority member for ordinary and B-specific review, the protected scope and fail-closed constraints, and retaining v0.5 G0 meanings. The member does not include the intervening proposal sentence on bounded handling for large documents or migration.

The historical `Adopt` applies by reference to the single proposed route in Issue #119. The adoption record identifies the original owner comment, date, and exact Proposal sentence locators for this bounded excerpt; the excerpt is a trial selection from the adopted route, not a separately itemized owner action. The trial's partial scope is separately stated as an evidence boundary. It does not change the adopted outcome. The packaged proposal commit anchor contains only source bytes; it records byte preservation for the 2026 trial and does not claim a new proposal or adoption. The historical owner action it preserves is dated 2026-09-26.

The related current canonical source is Gatekeeper `docs/architecture.md` at commit `c00f1d3091a398b8c1c25ab8f2247a6936a39992`, section “Target multi-document OWNER_ADDITION route (Issue #119 owner decision),” lines 256–330. That adopted contract states the complete previous-base-selected set requirement, exact affected-member scope, exact IDs/provenance, fail-closed conditions, and preservation of historical G0 semantics. It is cited for source comparison only; this trial does not edit it or package it as an alternate complete Authority Set.

Explicitly outside this subset are the maximum-file-size change, large-document migration handling, the proposal's Acceptance section, tests, any actual B eligibility decision, a real consumer's multi-member materialization, consumer policy selection, canonical replacement, enforcement, and activation. The one-member v1 materialization below is parser/materializer compatibility evidence only; it does not prove that a real multi-member review loaded or checked every consumer authority.

## Mechanical observations

- The authoring package checker reported `packageValidation: pass`; its raw output is [`materializer/initial-checker-report.json`](materializer/initial-checker-report.json). The result leaves traceability and validation-result claims unverified, semantic fidelity pending, owner/evidence authenticity unverified, and consumer activation not performed.
- The exact pinned Gatekeeper 0.5.1 materializer at commit `58bbdbb3119736e53a849388a025e74589ab8664` reported `pass` for the committed one-member fixture using profile `v1` and explicit test-only development limits within the published v1 bounds. The raw report and returned provenance are [`materializer/materializer-report.json`](materializer/materializer-report.json) and [`materializer/pinned-provenance.json`](materializer/pinned-provenance.json). The manifest digest is `fc5d6be5e3fba54bd216f37aa40ca9e4b45b02d909d82de161680457a4ad504c`; the single 399-byte member digest is `9fc3c8138a8916e9a8a1291c59d6a294964b1b0d46e66fd926789d8b97b898aa`.
- This compatibility result does not execute a semantic reviewer, validate a consumer's complete multi-member review, test an acceptance route, prove policy selection, or demonstrate enforcement or activation. [`decision-package/validation-result.json`](decision-package/validation-result.json) reports these dimensions separately.

## Separate private-trial aggregate (metadata only)

A separate private trial mechanically selected one already-adopted private decision by comparing its original Proposal, explicitly recorded owner outcome, and current canonical Authority. Its private package checker, bounded independent scope/fidelity/source-bytes review, and pinned Gatekeeper 0.5.1 v1 materialization each reported `PASS`. No source, canonical authority, configuration, selection, or activation changed. Authenticity was not verified and owner semantic acceptance remains pending. The owner's acceptance or correction assessment is unconfirmed; this record makes no claim about whether the owner accepted or corrected the trial. Full artifacts remain in the private environment accessible to the owner. This aggregate includes no private inputs, outputs, paths, commit IDs, hashes, business rules, member text, or report contents. It does not establish general effectiveness or Authority Set replacement.

## Independent bounded comparison

A separate read-only review task, `/root/public_trial_comparison` (`gpt-6-luna`, low), returned `PASS` for the stated partial source identity, clause-fidelity, semantic-scope, and canonical-comparison review. It concluded that the owner's by-reference adoption identifies the singular Issue #119 route and that the selected exact Proposal sentences are within that route; the authoring contract does not require sentence-number enumeration in the owner comment. This review is independent of the package checker and materializer. It does not authenticate owner identity or source authenticity, establish owner semantic acceptance, or change the machine-reported semantic-fidelity status (`pending`).

## Reproduction

The bundle [`fixture/issue-119-complete-set-data.bundle`](fixture/issue-119-complete-set-data.bundle) contains only public source and package fixture data, with a source-only byte-anchor commit and the committed one-member package snapshot; it contains no runtime source or private consumer material. From a fresh temporary directory:

```sh
set -eu
ROOT=/path/to/architecture-decision-authoring
EVIDENCE="$ROOT/examples/issue-35-gatekeeper-complete-set-trial/2026-10-01"
TRIAL_DIR=/private/tmp/gk119-complete-set-repro
FIXTURE="$TRIAL_DIR/fixture"
RUNTIME="$TRIAL_DIR/gatekeeper-0.5.1"
GK_REPO=/path/to/architecture-gatekeeper
mkdir -p "$TRIAL_DIR" "$RUNTIME"
git clone -q --branch trial-final "$EVIDENCE/fixture/issue-119-complete-set-data.bundle" "$FIXTURE"
node "$ROOT/skills/architecture-decision-authoring/scripts/validate-decision-package.mjs" \
  "$FIXTURE/examples/issue-35-gatekeeper-complete-set-trial/2026-10-01/decision-package" "$FIXTURE"
git -C "$GK_REPO" archive 58bbdbb3119736e53a849388a025e74589ab8664 package.json src | tar -x -C "$RUNTIME"
node "$RUNTIME/src/prepare-authority-set.mjs" \
  --manifest "$FIXTURE/examples/issue-35-gatekeeper-complete-set-trial/2026-10-01/decision-package/authority-set/manifest.json" \
  --self-repository flair-agency/architecture-decision-authoring \
  --self-root "$FIXTURE" \
  --authority-sha b93cee8429d7959d9b51518fa5ea65522e8c9d4e \
  --limits "$EVIDENCE/materializer/test-limits.json" \
  --output-dir "$TRIAL_DIR/materialized" \
  --profile v1
```

The fixture history separates the immutable source-byte anchor, `a585445816b86f0dc556cd806a7bfb6c7d4eec65`, from the member/manifest snapshot used by the materializer, `b93cee8429d7959d9b51518fa5ea65522e8c9d4e`. The final bundle branch `trial-final` points to `31ee4113fbd89bc2af0d9583a601e8da326ffe96`, which adds only clarified traceability narrative; it does not change the member, manifest, adoption outcome, source bytes, or materializer input. None of these fixture commits is an owner action. The materializer reads the `b93cee8` snapshot, while the adoption record binds the Proposal bytes at the `a585445` source anchor.
