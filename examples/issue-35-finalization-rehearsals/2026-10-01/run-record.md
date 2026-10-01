# Synthetic finalization rehearsal observations

This record captures retained artifacts from temporary synthetic Adopt and
Amend rehearsals. It does not establish real owner approval, semantic fidelity,
consumer compatibility, or activation. The input repositories were synthetic
fixtures at Proposal commit `e9c69a7cb9309688d395270b3a027db5c56f9c9d`.

## Repeated Adopt artifacts

The two temporary Adopt package directories and checker reports were
byte-identical when compared. This repository keeps one representative package
and report under `evidence/repeated-adopt/` so reviewers can inspect the raw
content. The second run's duplicate files are not copied. The four outputs
compared across both runs have these SHA-256 digests:

| File | SHA-256 |
| --- | --- |
| `authority-set/authority.md` | `8ec8539e33c3727222e0d471f65b444b202aea6d681a1f587b150629c1d80e41` |
| `authority-set/manifest.json` | `aa5d4a2248384b90d19dcdfc54a39904e2c0babce3f602d755aa4e7faf108dd8` |
| `traceability.md` | `062e428179bb557e1243ec706bac1a0bc13f135c149f3843085ac8c070bc2805` |
| `validation-result.json` | `b2c173c141f4d1c07e71b3008d3a213a6cad9c6938d8d897db940d4c4d2ebd97` |

Both retained checker reports say `packageValidation: pass`. They leave clause
traceability and validation-result claims unverified, semantic fidelity pending,
owner-evidence authenticity unverified, Gatekeeper compatibility not run, and
consumer activation not performed. This is equality of retained artifacts, not
a captured independent replay: per-run prompts and transcripts were not
retained. The representative raw output is `evidence/repeated-adopt/decision-package/`
plus `evidence/repeated-adopt/validator-report.json`; the source outcome fixture
is `evidence/repeated-adopt/source/synthetic-owner-outcome.md`.

## Amend artifacts

The retained synthetic amendment fixture and emitted
`authority-set/authority.md` have the same SHA-256 digest:
`4c09ad7ca651b636e564955563a63e7fabf20afc4522818772fed59824bad7d5`.
The emitted manifest digest is
`debbab9ce231c544a12f52a8e543d94e5f97ed8784efb3ec6e650e02ccbd6ddf`.
The checker report says `packageValidation: pass`, but the package's
`validation-result.json` says `packageValidation: pending` (SHA-256
`609e5ed89c5100296047cb845dc3a1026272b8df3388edd6eeecf392f4a4a7a2`). This
retained state is internally inconsistent; the later staging replay below
records a separate reconciliation without overwriting this original evidence.
This record does not claim end-to-end acceptance. The raw candidate package,
checker report, and its source outcome are retained under `evidence/amend-candidate/`
and `evidence/amend-source/`. The report also leaves traceability unverified,
semantic fidelity
pending, owner-evidence authenticity unverified, Gatekeeper compatibility not
run, and consumer activation not performed.

## Fresh Amend staging replay

A later manual replay used the same synthetic Proposal commit and the
validator script from authoring revision
`a0aa072301461b6c12d3ac30274ea3135a6969da` (script SHA-256
`6a512fba251b49e5f38c4b9075bed7b3ba9d834aca685582d9a811d3e241a5de`). The
committed Proposal blob and packaged Proposal were both 1,308 bytes with SHA-256
`39b269ceb0fd967a85c7da7b5fd1e7ce9bc74d0516798bfe12fb36e78fe83105`.

The fresh candidate retained the original pending `validation-result.json`
(SHA-256
`609e5ed89c5100296047cb845dc3a1026272b8df3388edd6eeecf392f4a4a7a2`); its
checker report nevertheless said `packageValidation: pass` (report SHA-256
`5a170df6bc03f58a8511d3efc857ba1426e0d2818ecc1a8618f329a0d1dd1308`). In a
separate fresh clone, the same Amend member, manifest, and snapshot were copied
unchanged, the validation result was updated to `pass`, and the manifest was
copied last after its absence was checked. The final validation-result SHA-256
is `b2c173c141f4d1c07e71b3008d3a213a6cad9c6938d8d897db940d4c4d2ebd97`; the
final checker report has the same SHA-256 as the candidate report and also says
`packageValidation: pass`. The member and manifest remained byte-identical to
the candidate (`4c09ad7ca651b636e564955563a63e7fabf20afc4522818772fed59824bad7d5`
and
`debbab9ce231c544a12f52a8e543d94e5f97ed8784efb3ec6e650e02ccbd6ddf`,
respectively). This is a manual staging replay, not a Skill invocation,
Gatekeeper run, or automatic publisher. The final checker report still leaves
traceability unverified, semantic fidelity pending, owner-evidence authenticity
unverified, Gatekeeper compatibility not run, and consumer activation not
performed. The final package and raw checker report are retained under
`evidence/amend-final/`; its synthetic source outcome is the shared
`evidence/amend-source/synthetic-owner-outcome.md`.

## Durable evidence and reproduction

The retained synthetic Proposal commit is available in
`evidence/synthetic-proposal-fixture.bundle` (SHA-256
`b7c3943da36f9cda6db2de7985992a4a963e071f129ccc413d1fab85dac6fa09`). The
bundle verifies as a complete history and exposes
`refs/heads/archive/synthetic-proposal` at
`e9c69a7cb9309688d395270b3a027db5c56f9c9d`. A fresh clone checked out that exact
commit and its tree contains `decision-package/proposal.md` and
`source/synthetic-source.md`; the Proposal blob is 1,308 bytes with SHA-256
`39b269ceb0fd967a85c7da7b5fd1e7ce9bc74d0516798bfe12fb36e78fe83105`. The raw
Adopt and Amend outcomes are explicitly synthetic and stored in the paths named
above. All 26 files in the evidence inventory below are synthetic fixture
materials or their checker outputs; prompts, sessions, and credentials are not
included.

To inspect a stored package with the checker from this repository, run these
steps from the repository root with a fresh temporary directory for each
variant:

```sh
FIXTURE_BUNDLE=examples/issue-35-finalization-rehearsals/2026-10-01/evidence/synthetic-proposal-fixture.bundle
REHEARSAL_DIR=$(mktemp -d)
git clone --no-checkout "$FIXTURE_BUNDLE" "$REHEARSAL_DIR/repo"
git -C "$REHEARSAL_DIR/repo" checkout --detach e9c69a7cb9309688d395270b3a027db5c56f9c9d
```

Copy one variant into that clone while preserving the package path and its
synthetic owner-outcome input, then run the checker from this repository:

```sh
cp -R examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/. "$REHEARSAL_DIR/repo/decision-package/"
cp examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/source/synthetic-owner-outcome.md "$REHEARSAL_DIR/repo/source/synthetic-owner-outcome.md"
node skills/architecture-decision-authoring/scripts/validate-decision-package.mjs "$REHEARSAL_DIR/repo/decision-package" "$REHEARSAL_DIR/repo"
```

For either Amend variant, use the corresponding `evidence/amend-candidate/decision-package/`
or `evidence/amend-final/decision-package/` path and copy
`evidence/amend-source/synthetic-owner-outcome.md` into the clone's `source/`
directory. The candidate retains a pending result and the final variant records
pass. This procedure checks the stored package using the repository checker; it
does not recreate a Skill run or the manual manifest-last sequence. The recorded
checker source was authoring revision
`a0aa072301461b6c12d3ac30274ea3135a6969da` with script SHA-256
`6a512fba251b49e5f38c4b9075bed7b3ba9d834aca685582d9a811d3e241a5de`. The
per-run prompts and transcripts were not retained, and the fixtures do not
authenticate an actual owner's decision.

The following SHA-256 inventory covers the 26 retained evidence files (not this
run record):

| SHA-256 | Repository-relative path |
| --- | --- |
| `76f5673abce5d6056f9c7262a183b037205e09ec7a4730f74fb3b4c00d4b34e4` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/decision-package/adoption-record.json` |
| `4c09ad7ca651b636e564955563a63e7fabf20afc4522818772fed59824bad7d5` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/decision-package/authority-set/authority.md` |
| `debbab9ce231c544a12f52a8e543d94e5f97ed8784efb3ec6e650e02ccbd6ddf` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/decision-package/authority-set/manifest.json` |
| `4c09ad7ca651b636e564955563a63e7fabf20afc4522818772fed59824bad7d5` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/decision-package/owner-approved-amendment.md` |
| `39b269ceb0fd967a85c7da7b5fd1e7ce9bc74d0516798bfe12fb36e78fe83105` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/decision-package/proposal.md` |
| `49e618c9b44d4ff2136ad85286cbf4d6a0fd5353c604056905502c55893d74e9` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/decision-package/traceability.md` |
| `609e5ed89c5100296047cb845dc3a1026272b8df3388edd6eeecf392f4a4a7a2` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/decision-package/validation-result.json` |
| `5a170df6bc03f58a8511d3efc857ba1426e0d2818ecc1a8618f329a0d1dd1308` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-candidate/validator-report.json` |
| `76f5673abce5d6056f9c7262a183b037205e09ec7a4730f74fb3b4c00d4b34e4` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/decision-package/adoption-record.json` |
| `4c09ad7ca651b636e564955563a63e7fabf20afc4522818772fed59824bad7d5` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/decision-package/authority-set/authority.md` |
| `debbab9ce231c544a12f52a8e543d94e5f97ed8784efb3ec6e650e02ccbd6ddf` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/decision-package/authority-set/manifest.json` |
| `4c09ad7ca651b636e564955563a63e7fabf20afc4522818772fed59824bad7d5` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/decision-package/owner-approved-amendment.md` |
| `39b269ceb0fd967a85c7da7b5fd1e7ce9bc74d0516798bfe12fb36e78fe83105` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/decision-package/proposal.md` |
| `49e618c9b44d4ff2136ad85286cbf4d6a0fd5353c604056905502c55893d74e9` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/decision-package/traceability.md` |
| `b2c173c141f4d1c07e71b3008d3a213a6cad9c6938d8d897db940d4c4d2ebd97` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/decision-package/validation-result.json` |
| `5a170df6bc03f58a8511d3efc857ba1426e0d2818ecc1a8618f329a0d1dd1308` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-final/validator-report.json` |
| `f55e46bcfd3d46130615d5e1ce2f7a1a593f4c360b2aa5de3a8d7480e2919cd8` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/amend-source/synthetic-owner-outcome.md` |
| `79a6db157ed4e5944438680d62cde2db452ddf3f4685bc7cfd2c57b6401017d7` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/adoption-record.json` |
| `8ec8539e33c3727222e0d471f65b444b202aea6d681a1f587b150629c1d80e41` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/authority-set/authority.md` |
| `aa5d4a2248384b90d19dcdfc54a39904e2c0babce3f602d755aa4e7faf108dd8` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/authority-set/manifest.json` |
| `39b269ceb0fd967a85c7da7b5fd1e7ce9bc74d0516798bfe12fb36e78fe83105` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/proposal.md` |
| `062e428179bb557e1243ec706bac1a0bc13f135c149f3843085ac8c070bc2805` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/traceability.md` |
| `b2c173c141f4d1c07e71b3008d3a213a6cad9c6938d8d897db940d4c4d2ebd97` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/decision-package/validation-result.json` |
| `a46cf285f8ff07102f2f664bad433333657aa480342e45b9b013a93b7875b251` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/source/synthetic-owner-outcome.md` |
| `5a170df6bc03f58a8511d3efc857ba1426e0d2818ecc1a8618f329a0d1dd1308` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/repeated-adopt/validator-report.json` |
| `b7c3943da36f9cda6db2de7985992a4a963e071f129ccc413d1fab85dac6fa09` | `examples/issue-35-finalization-rehearsals/2026-10-01/evidence/synthetic-proposal-fixture.bundle` |
