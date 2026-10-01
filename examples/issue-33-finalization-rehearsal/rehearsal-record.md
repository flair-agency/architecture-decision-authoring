# Issue 33 synthetic finalization rehearsal

> **SIMULATION ONLY.** This fixture does not represent a real owner action,
> approval, authorization, or consumer policy. Its identity, decision, dates,
> Proposal, evidence ID, and Authority text are fictional. Do not use its
> manifest to activate policy.

## Execution

This is an actual agent execution of the repository Skill workflow against
synthetic inputs in the current host task, rather than a hand-built
validator-only fixture. It did not invoke a separate Codex CLI or UI Skill
registration. The agent task is `/root/minimal_slice_plan`; model and effort
were `gpt-6-luna`, `low`.

The task instruction was to perform one Skill-driven finalization walkthrough
with one clearly synthetic owner outcome and actual pinned Gatekeeper evidence,
without claiming real adoption. The agent read
[`SKILL.md`](../../skills/architecture-decision-authoring/SKILL.md) and its
[Authority Set finalization reference](../../skills/architecture-decision-authoring/references/authority-set-finalization.md),
then followed the finalization mode using the two fixture sources below. The
synthetic outcome explicitly identifies `Adopt`, the Proposal content locator,
scope, applicability, exceptions, date, and a simulation-only evidence ID.
It is test data, not an assertion that an authorized human acted.

## Inputs and output

The synthetic input snapshots are [`source/proposal.md`](source/proposal.md),
[`source/synthetic-source.md`](source/synthetic-source.md), and
[`source/synthetic-owner-outcome.md`](source/synthetic-owner-outcome.md).
The Proposal and synthetic source packet are committed in the temporary Git
fixture at the exact final package placement path `decision-package/proposal.md`.
The exact Proposal commit is
`e9c69a7cb9309688d395270b3a027db5c56f9c9d`; its SHA-256 is
`39b269ceb0fd967a85c7da7b5fd1e7ce9bc74d0516798bfe12fb36e78fe83105`.

The Skill workflow copied only the identified Proposed-decision paragraph,
byte-for-byte, into `authority-set/authority.md`. The member SHA-256 is
`8ec8539e33c3727222e0d471f65b444b202aea6d681a1f587b150629c1d80e41`; it
matches the paragraph selected by the synthetic outcome. The completed
package snapshots are in [`decision-package/`](decision-package/). The package
snapshot is committed in the temporary fixture at
`749a4adae1e7f5779b007f9cf85b1fdd26ef5a02`. The exact Authority member was
already committed at the Gatekeeper compatibility revision
`8ee13a13106dfd4c9e105cd5fe3a224bc1500421`.

The temporary fixture repository is `/private/tmp/ada-issue33-rehearsal.KdeTdz`.
The package was validated against that fixture root; its Proposal revision
does not exist in this authoring repository. This example package is therefore
not a live, source-repository-bound Authority Set.

## Verification

The package was first assembled as a complete candidate under the private
`decision-package/` staging path in the isolated fixture repository. The
candidate manifest was present for its checks because the validator consumes
a complete package. After candidate validation and the pinned Gatekeeper
materialization succeeded, the candidate package files were copied into a
separate final-package destination; the final manifest was copied last. This
is an observed, one-run staging sequence, not a general publication helper or
security guarantee. The final manifest was not exposed in the final-package
destination before the private candidate checks passed.

The checker was also run on the final package after its manifest was written:

```sh
node skills/architecture-decision-authoring/scripts/validate-decision-package.mjs \
  /private/tmp/ada-issue33-rehearsal.KdeTdz/decision-package \
  /private/tmp/ada-issue33-rehearsal.KdeTdz
```

[`validator-report.json`](validator-report.json) records `packageValidation:
pass`, no errors, and these separate limits: clause traceability and validator
claims remain `not-verified`; semantic fidelity is `pending`; owner/evidence
authenticity is `not-verified`; consumer activation is `not-performed`. Its
Gatekeeper field says `not-run` because this checker does not invoke Gatekeeper.
The package's [`validation-result.json`](decision-package/validation-result.json)
records the separate pinned compatibility check below. Its checker fields
remain `clauseTraceability: not-verified` and `semanticFidelity: pending`. A
separate bounded agent review passed traceability coverage and semantic
fidelity for this synthetic example only. See
[`independent-review.md`](independent-review.md) for the reviewer task,
model/effort, supplied source set, scope, and exact assessment. The review does
not authenticate a real owner action or establish a general guarantee.

The Gatekeeper source was archived from exact commit
`58bbdbb3119736e53a849388a025e74589ab8664`, whose package version is `0.5.1`,
into `/private/tmp/ada-issue33-rehearsal.KdeTdz/gatekeeper-58bbdbb`. The exact
limits file passed to the CLI was
`/private/tmp/ada-issue33-rehearsal.KdeTdz/limits.json`:

```json
{
  "maxManifestBytes": 65536,
  "maxMembers": 32,
  "maxFileBytes": 131072,
  "maxTotalBytes": 524288,
  "maxPromptBytes": 1048576
}
```

The successful command used the candidate selector whose bytes are identical
to the final package manifest:

```sh
node /private/tmp/ada-issue33-rehearsal.KdeTdz/gatekeeper-58bbdbb/src/prepare-authority-set.mjs \
  --manifest /private/tmp/ada-issue33-rehearsal.KdeTdz/candidate-manifest.json \
  --self-repository flair-agency/architecture-decision-authoring \
  --self-root /private/tmp/ada-issue33-rehearsal.KdeTdz \
  --authority-sha 8ee13a13106dfd4c9e105cd5fe3a224bc1500421 \
  --limits /private/tmp/ada-issue33-rehearsal.KdeTdz/limits.json \
  --output-dir /private/tmp/ada-issue33-rehearsal.KdeTdz/gatekeeper-output
```

The v1 one-member local selector materialized the committed fixture member; no
external source was selected or fetched. The output directory did not exist
before the successful call. [`gatekeeper-provenance.json`](gatekeeper-provenance.json)
records the resulting pinned revision, resolved member, 296-byte length, and
digests: selector SHA-256 `aa5d4a2248384b90d19dcdfc54a39904e2c0babce3f602d755aa4e7faf108dd8`,
member SHA-256 as above, and set digest
`482dc0776be7cb93ca05a79501f42f4f0f3f7a8a59f15e59273961c7a1db241f`.

The first CLI attempt returned its generic failure because I had created its
output directory in advance. The pinned entrypoint requires a fresh,
nonexistent destination. Repeating the same invocation with a fresh output
directory succeeded; the failure was test setup, not a rejected selector or
member.

A separate staging replay used `/private/tmp/ada-issue33-stage-replay3.20424`.
Both candidate and final fixture clones started at committed synthetic member
`8ee13a13106dfd4c9e105cd5fe3a224bc1500421`; the candidate received the
complete package and its manifest, then the checker passed. The pinned
Gatekeeper materializer also passed against that candidate selector with a
fresh output directory. The final clone's package directory was assembled by
copying `adoption-record.json`, `proposal.md`, `traceability.md`,
`validation-result.json`, and `authority.md`; an explicit check confirmed
`authority-set/manifest.json` was absent in the final clone before candidate
validation, and a second check confirmed it remained absent before promotion. Only after
those checks was the manifest copied as the last package file. The checker then passed against the final package. Candidate and
final checker reports both record package pass and the same explicitly
unverified/pending semantic fields.

The replay's Gatekeeper invocation was:

```sh
node /private/tmp/ada-issue33-rehearsal.KdeTdz/gatekeeper-58bbdbb/src/prepare-authority-set.mjs \
  --manifest /private/tmp/ada-issue33-rehearsal.KdeTdz/candidate-manifest.json \
  --self-repository flair-agency/architecture-decision-authoring \
  --self-root /private/tmp/ada-issue33-stage-replay3.20424/candidate \
  --authority-sha 8ee13a13106dfd4c9e105cd5fe3a224bc1500421 \
  --limits /private/tmp/ada-issue33-rehearsal.KdeTdz/limits.json \
  --output-dir /private/tmp/ada-issue33-stage-replay3.20424/gatekeeper-output
```

Its provenance output records the same selector SHA, member SHA, and set digest
listed above. This is one manual staging demonstration; it is not a generic
publisher, does not prove a broader visibility or security property, and does
not make checker pass equivalent to finalization acceptance.

The focused Skill package test suite also passed: 19 tests, 0 failures. It
includes exact Amend snapshot-byte equality, plain Markdown Amend content
without clause IDs, legacy records without IDs, no-export outcomes, Proposal
blob binding, and selector/path negatives. Those tests are separate from this
single synthetic Adopt walkthrough.

### Synthetic Skill negative rehearsals

Two additional host-native agent executions followed this repository's Skill
and finalization reference using fresh private clones at the exact Proposal
commit. The agent task was `/root/minimal_slice_plan` (inherited model/effort:
`gpt-6-luna`, `low`); neither run used a separate Codex CLI or registered UI
Skill invocation. Full synthetic inputs and observed results are recorded at
`/private/tmp/ada-issue33-skill-negative.H2fRd7/skill-result.md`.

- With a fictional `Adopt` outcome, exact Proposal locator, and all other
  decision fields but an empty `authorizationEvidence`, the Skill stopped
  because the required evidence URL or record ID was absent. No Authority
  member or manifest existed after the attempt.
- With a fictional `Adopt` outcome but no `adoptedContent` locator, the Skill
  stopped because the exact Proposal content was not identified. No Authority
  member or manifest existed after the attempt.

These inputs are synthetic and do not test owner authenticity. The retained
agent report states that neither attempt had prior consumable artifacts; no
separate pre-run snapshot was retained, so this could not be independently
verified. They do not test stale-output cleanup or establish general publisher
behavior.

Five additional synthetic no-export trials started from a previously
successful package in isolated copies of the fixture repository. The retained
`trial-results.json` reports Skill dispositions for `Pending`, `Defer`,
`Reject`, missing `authorizationEvidence`, and `Adopt` without an exact
`adoptedContent` locator. In each trial, the prior `authority.md`, selector manifest,
traceability file, and validation result were manually quarantined before the
checker ran; this was operator cleanup, not automatic Skill or validator
behavior. No Authority member or manifest remained in any trial package.
The checker passed the three supported no-export outcomes and failed the two
incomplete `Adopt` packages with errors identifying missing required evidence
or the exact adopted-content locator, along with the absent export files.
Trial inputs, quarantine snapshots, and checker reports
are retained under `/private/tmp/ada-issue35-skill-verification.gGdEEY/stale-trials/`.
These trials show the documented no-export disposition when stale outputs are
manually removed; they do not demonstrate automatic stale-output cleanup.

## Scope limits and recreation

The package validator command above ran after the fixture manifest was
present. It is a package consistency check, not a validation-before-publish
gate or real finalization acceptance. This run does not verify clause-to-source
semantics, owner authenticity, real-world fitness, consumer activation, or a
real adoption. A package validator pass and pinned Gatekeeper materialization
establish only their reported mechanical checks. Traceability is shown as a
human-readable mapping in `traceability.md` and remains explicitly unverified.

To recreate the committed fixture, make a fresh temporary Git repository with
the same `decision-package/` and `source/` paths, copy the three source
snapshots here, then commit `proposal.md` first using fixture identity
`Synthetic Fixture <fixture@example.invalid>` and timestamp
`2026-10-01T00:00:00Z`. If this produces a different Proposal commit, update
`adoption-record.json` to that full commit ID; update any exact-revision
reference in the synthetic outcome evidence if one is added. Copy the
remaining package snapshots and synthetic owner evidence, commit the member
snapshot, and use that new full commit ID as `--authority-sha`. Rerun the
pinned materializer and update the validation/provenance snapshots from its
result. Write the final manifest after the other package files, then run the
checker from the authoring repository with the fixture paths:

```sh
node skills/architecture-decision-authoring/scripts/validate-decision-package.mjs \
  /private/tmp/ada-issue33-rehearsal.KdeTdz/decision-package \
  /private/tmp/ada-issue33-rehearsal.KdeTdz
```

To repeat the staging replay, make separate candidate and final clones of the
fixture at the committed member revision. Confirm the final clone has no
`decision-package/authority-set/manifest.json`. Copy the complete candidate
package (including its manifest) into the candidate clone, run the package
checker there, and materialize its selector with the pinned Gatekeeper command
above using a new nonexistent output directory. Then copy the candidate
package files except the manifest into the final clone, copy the manifest last,
and run the checker against the final package. This demonstrates the recorded
sequence for this fixture; it does not establish a general
no-publication-before-validation property.

The exact selector bytes are in
`decision-package/authority-set/manifest.json`. The named limits are
`maxManifestBytes=65536`, `maxMembers=32`, `maxFileBytes=131072`,
`maxTotalBytes=524288`, and `maxPromptBytes=1048576`. The recorded commit IDs
identify this execution; do not assume newly initialized fixture commits have
the same IDs if their trees or commit metadata differ.
