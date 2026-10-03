# Development workflow

This guide describes implementation and verification in this repository. The
normative product and artifact boundary is in the [architecture contract](architecture.md);
this guide does not amend it.

## Repository layout and distribution boundary

The product is a standalone Codex Skill in
[`skills/architecture-decision-authoring/`](../skills/architecture-decision-authoring/).
Its distributed files are `SKILL.md`, `agents/openai.yaml`, the bundled proposal
template under `assets/`, the finalization reference, the read-only package
validator and its tests, and the Skill-local `LICENSE`. Keep the bundled
template byte-identical to the canonical
[`docs/templates/architecture-decision-proposal.md`](templates/architecture-decision-proposal.md).

The root `package.json` is private development tooling. It is not the Skill's
runtime package and is not part of the Skill archive. Do not use `npm publish`
or `npm pack` to distribute this product. A release archive contains the
complete Skill directory, including its own `LICENSE`.

## Focused verification

Use Node.js 22 or newer. From a clean source checkout, run:

```sh
npm test
npm run codeql
npm run archive:smoke
```

`npm test` runs the repository development tests and the Skill validator tests.
`npm run codeql` runs the official CodeQL CLI when installed. Install the
[official CodeQL bundle](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/scan-from-the-command-line/set-up-codeql-cli)
for your OS, including the standard query packs, and add its `codeql`
directory to `PATH` (`codeql.exe` on Windows). If the CLI is missing, the
command exits with installation guidance before creating a scan directory.
It analyzes JavaScript/TypeScript and GitHub Actions with the default suites
and local threat model. SARIF, database logs, and `summary.json` are retained
under `~/.local/share/architecture-decision-authoring/codeql/scan-*`, outside
the checkout. A successful scan means analysis completed, not that findings
are absent. Review findings and compare with CI, recording CLI/query versions
when comparing results.

`npm run archive:smoke` creates an ephemeral ZIP of only the seven-file Skill
layout in an operating-system temporary directory, tests and extracts it, then
runs the validator tests from the extracted files. It does not publish or tag
anything. The command prints the temporary workspace path for inspection.
This mechanical check covers archive paths and extraction; it does not test
model-authored Proposal quality, owner adoption, semantic fidelity, or consumer
activation.

For changes, run the focused tests first, then the relevant full checks above.
Changes to the packaged Skill, template, or archive layout require the archive
smoke. Changes to validator behavior require its focused tests. Keep generated
archives and scan artifacts out of commits unless a specifically scoped
evidence record calls for them.

## Review and evidence

Before committing a source change, freeze the exact staged diff and run the
host-native Architecture Review using the installed review workflow described
in [Local Architecture Gatekeeper review](gatekeeper-local-review.md). Record
the reviewed source revision, selected authority, exact input, and validated
result. A completed semantic result is development feedback; unavailable
authority, failed preparation, malformed output, or failed validation is an
incomplete review. Do not use that review to make an owner decision or change
the product contract.

For a pull request, run Codex `/review` against the exact proposed commit and
inspect its actual findings. Fix actionable findings on a new reviewed diff;
do not describe an unstarted, skipped, or still-running review as a pass.
Tests, archive checks, semantic reviews, owner adoption, and downstream
activation are separate evidence. State only what each performed check shows.

Model-authored smoke tests are useful when a change affects prompts, authoring
instructions, source mapping, or finalization semantics. Keep their inputs
synthetic or otherwise authorized for the task, identify the model and effort,
and retain the exact input and output needed to review source fidelity. Reuse a
recent smoke result when the Skill files, referenced material, input, model,
and execution context have not changed in a way relevant to the claim. Do not
repeat an expensive model call solely to make a new commit appear tested.
Mechanical unit, validator, and archive checks remain separately reportable.

Use only credentials and external model or network services already authorized
for the active task. Do not put credentials in repository files, logs, prompts,
or release assets. The Skill archive itself has no Gatekeeper runtime
dependency; pinned Gatekeeper materialization is a compatibility check, not a
consumer runtime requirement. See the architecture contract for the limits of
structural validation, semantic fidelity, and activation evidence.

## Changes to architecture or responsibility

Record an authorized owner decision in `docs/architecture.md` before adding a
new responsibility or assurance rule. Implementation notes, test outcomes,
review feedback, package contents, and release metadata do not amend canonical
authority. Routine release timing does not require a new owner decision; a
change to the product boundary or consumer activation remains subject to the
existing authority and consumer-owned process.

For a frozen candidate and publication steps, follow the
[release runbook](release.md).
