# Synthetic finalization rehearsal observations

This record captures retained artifacts from temporary synthetic Adopt and
Amend rehearsals. It does not establish real owner approval, semantic fidelity,
consumer compatibility, or activation. The input repositories were synthetic
fixtures at Proposal commit `e9c69a7cb9309688d395270b3a027db5c56f9c9d`.

## Repeated Adopt artifacts

The two retained Adopt package directories have byte-identical
`authority-set/authority.md`, `authority-set/manifest.json`, `traceability.md`,
and `validation-result.json`. Their SHA-256 digests are:

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
retained.

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
This record does not claim end-to-end acceptance. The report also leaves traceability unverified, semantic fidelity
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
performed.

The retained temporary files were under
`/private/tmp/ada-issue35-skill-verification.gGdEEY/` and
`/private/tmp/ada-issue35-amend-reconcile.hOMl5g/` when inspected. The per-run
prompts and transcripts were not retained, and the fixtures do not authenticate
an actual owner's decision. These observations are limited to the artifacts
and reports listed above.
