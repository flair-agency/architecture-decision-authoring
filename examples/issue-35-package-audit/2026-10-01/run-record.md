# Current Skill package-content audit — 2026-10-01

This audit records the current repository-scoped Skill directory and the
installation/checks that can be reproduced from source. It does not select a
distribution archive format, establish release readiness, or extend the
consumer's acceptance policy.

## Source package

The inspected source revision is `eca87df4e602676e767cf4951476bb2ffcde2e84`.
The complete Skill directory contains these seven files:

| File | SHA-256 |
| --- | --- |
| `LICENSE` | `26a7c29b2db5f34e2e65ed3e5bb1c047566f92ab911d879dff34c9bc09daf99b` |
| `SKILL.md` | `3455d42a1dd31526a878af6074a09ee1bf837ed68e2b7c352570feaa471a5330` |
| `agents/openai.yaml` | `3b48e447ab8c4d93a59aacc63a1dc733047cfc70669a75f27605e63422131994` |
| `assets/architecture-decision-proposal.md` | `c6769f26d3cac800cecb2d5bcd97b7efc1f8cd2d52f6d71b76efde6908bc51e5` |
| `references/authority-set-finalization.md` | `241bcbeda9c2f4c45c2f5cf4e5a499f721ff93c057bfa3e36c57b18b0098adc4` |
| `scripts/validate-decision-package.mjs` | `6a512fba251b49e5f38c4b9075bed7b3ba9d834aca685582d9a811d3e241a5de` |
| `scripts/validate-decision-package.test.mjs` | `9a4d9e22a45f6396ea82fb02e10c7774aadaef3a4ad476c01bffd3bb1af677c2` |

`SKILL.md` names both the bundled Proposal template and the finalization
reference. Both are present in the directory, alongside the package checker,
its tests, the agent metadata, and license. The bundled Proposal template is
byte-identical to `docs/templates/architecture-decision-proposal.md` at this
source revision.

## Available source-copy check

The repository README documents installing the whole Skill directory with
`cp -R skills/architecture-decision-authoring .codex/skills/`. I ran that
copy into `/private/tmp/ada-skill-copy-audit-final.rkCRKi/.codex/skills/` and
compared the copied `architecture-decision-authoring` directory recursively
with the source directory. `diff -qr` returned no differences. This verifies
that documented directory-copy operation for this source tree; it does not
verify application registration or a released distribution artifact.

The available package-checker tests were run with:

```sh
node --test skills/architecture-decision-authoring/scripts/validate-decision-package.test.mjs
```

Result: 20 tests passed, 0 failed. These test the bounded decision-package
checker. They are not an archive completeness or release-package validator.
The bundled template comparison used `cmp` against the canonical template and
returned identical bytes.

## Relation to the prior Proposal smoke

[PR #45's run record](../../issue-35-proposal-smoke/2026-10-01/run-record.md)
documents a Proposal-authoring CLI smoke using a seven-file candidate archive
from source revision
`b4437abbfb17a4d4053c5e5a700e797388be87fa`. It records successful extraction
and installation comparisons and byte identity of the generated Proposal
with the raw run output. This audit did not repeat that CLI smoke.

The candidate archive source and this audit's current source differ only in
`references/authority-set-finalization.md`: 11 lines describing manual
quarantine were added after the archive source. The old and current reference
SHA-256 values are respectively
`7f9c84f907ec5a3851e552da6fa88226024668b7087e5c963b1d0f55c1d5ebc5` and
`241bcbeda9c2f4c45c2f5cf4e5a499f721ff93c057bfa3e36c57b18b0098adc4`.
The PR #45 smoke ran Proposal mode; this later reference is for the distinct
post-adoption finalization mode. The earlier smoke therefore remains evidence
for its recorded Proposal run, but its candidate archive is not byte-identical
to the current Skill directory.

## Limits

This audit does not create or validate an archive, choose ZIP or another
distribution format, establish a release checksum, verify third-party
installation routes, or claim release readiness. It does not establish owner
adoption, semantic correctness, consumer compatibility, or policy activation.
