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
`80af024fc0f2f464d20b77635a100146b5b2be10`. The exact Authority member was
already committed at the Gatekeeper compatibility revision
`8ee13a13106dfd4c9e105cd5fe3a224bc1500421`.

The temporary fixture repository is `/private/tmp/ada-issue33-rehearsal.KdeTdz`.
The package was validated against that fixture root; its Proposal revision
does not exist in this authoring repository. This example package is therefore
not a live, source-repository-bound Authority Set.

## Verification

The package validator was run after the final manifest was written:

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
records the separate pinned compatibility check below; these reports describe
different checks.

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

The focused Skill package test suite also passed: 19 tests, 0 failures. It
includes exact Amend snapshot-byte equality, plain Markdown Amend content
without clause IDs, legacy records without IDs, no-export outcomes, Proposal
blob binding, and selector/path negatives. Those tests are separate from this
single synthetic Adopt walkthrough.

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

The exact selector bytes are in
`decision-package/authority-set/manifest.json`. The named limits are
`maxManifestBytes=65536`, `maxMembers=32`, `maxFileBytes=131072`,
`maxTotalBytes=524288`, and `maxPromptBytes=1048576`. The recorded commit IDs
identify this execution; do not assume newly initialized fixture commits have
the same IDs if their trees or commit metadata differ.
