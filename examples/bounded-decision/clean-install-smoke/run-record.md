# Clean-install smoke run record

**Run:** 2026-09-29 (Asia/Tokyo), Codex CLI `0.153.2`; model `gpt-5.6-sol`, reasoning effort `low`. This records one fresh, bounded clean-install smoke. It is not a comparative evaluation, an independent evaluation, or evidence of validated capability.

## Setup and inputs

- **Source revision:** `5654231059b48a7019a1e01f0f27a42a32c1bcad` (`main`, after PR #26). The Skill package and the four Markdown inputs were copied from this revision; no repository content beyond those files was supplied to the model.
- **Temporary workspace pattern:** `/private/tmp/ada-v010-smoke.XXXXXX/`, created with `mktemp -d`. This run used a unique temporary directory; its generated artifact was copied into this example afterward.
- **Clean installation:** Copied `skills/architecture-decision-authoring/` to `<temp>/.codex/skills/architecture-decision-authoring/`. Installed files: `SKILL.md`, `LICENSE`, `agents/openai.yaml`, and `assets/architecture-decision-proposal.md`.
- **Input packet:** copied `examples/bounded-decision/input/{request,reporting-brief,operating-rule,field-guide}.md` into `<temp>/input/`.
- **Template check:** the installed bundled `assets/architecture-decision-proposal.md` was byte-identical to canonical `docs/templates/architecture-decision-proposal.md` (`cmp` succeeded).

## Invocation and result

The prompt explicitly invoked `$architecture-decision-authoring`, asked it to read the four inputs and installed Skill, write a complete proposal to `output/proposal.md`, preserve source locators and separate claim classes, leave owner/adoption outcome Pending, and return only a short completion summary as the final message. CLI final-message capture was directed to `output/final-message.txt` so it could not overwrite the proposal.

```sh
codex exec --approve-for-me --ephemeral --skip-git-repo-check \
  -C /private/tmp/ada-v010-smoke.uKmh6i \
  -o /private/tmp/ada-v010-smoke.uKmh6i/output/final-message.txt \
  'Use $architecture-decision-authoring explicitly. Read the four Markdown sources under input/ and the installed Skill. Write one complete, reviewable proposal to output/proposal.md based only on those sources. Use the Skill bundled template, preserve source locators, separate facts, assumptions, existing decisions, constraints/evidence, options, proposed outcome, and unresolved owner choices, and leave the owner/adoption outcome Pending. Do not put a completion note in proposal.md; return a short completion summary as your final message.'
```

The first invocation attempt, before the supported outer execution approval, failed to initialize the CLI state database/app-server under the restricted shell and produced no proposal. The successful invocation used the same command through the approved execution flow; Codex reported `workspace-write` for the isolated temporary workspace and completed successfully. The transcript showed explicit Skill invocation and a completion message naming `output/proposal.md`.

The resulting [proposal](proposal.md) is a 112-line, reviewable artifact. It separates facts, assumptions, existing decisions, constraints/evidence, options, proposed outcome, and unresolved owner choices; includes source locators; and records **Owner outcome: Pending**. Its recommendation is Proposed and Incomplete pending owner choices about the definition of “open,” age calculation/display, and ranking policy.

## Limits

This run demonstrates that the packaged Skill could be explicitly invoked from a clean, temporary install and produce a reviewable artifact from the supplied example packet. It does not compare model arms, score quality, establish an independent baseline, authenticate the synthetic packet's authority, or validate a product capability. The generated artifact is preserved at [proposal.md](proposal.md); source links resolve to the canonical packet at `../input/`.
