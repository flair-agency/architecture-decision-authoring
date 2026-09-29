# Issue #6 public rehearsal pair

Status: diagnostic rehearsal only. These outputs are not scored, are not protocol-compliant Phase A evidence, and do not support a decision-grade conclusion.

## Source and run setup

- Release tag `v0.1.0` and fetched `origin/main` both resolved to `1f3cb0f31dfa197a9c468686d31615fbb98467a2` before the runs. The branch `codex/first-v010-rehearsal-pair` started at that commit.
- The exact released Skill package was copied from that clean source tree into only the Skill workspace's `.codex/skills/architecture-decision-authoring/` directory. `git diff --quiet v0.1.0 -- skills/architecture-decision-authoring` succeeded.
- Each arm used a fresh temporary workspace and a new `codex exec` context. Baseline workspace: `/private/tmp/adr-rehearsal-baseline-new.cAuzSM`. Skill workspace: `/private/tmp/adr-rehearsal-skill-new.jSvd9v`.
- Both workspaces contained the same `request.md`, `template.md`, and `input/*.md`. Baseline had no authoring Skill files; Skill had only the released authoring Skill package installed under `.codex/skills/`.
- Both runs used Codex CLI `0.153.2`, requested model `gpt-5.6-sol`, configured reasoning effort `low`, and the same CLI options: `--approve-for-me --ephemeral --skip-git-repo-check --ignore-user-config --json`. The CLI event stream does not independently confirm the served model or backend revision; only the requested model/configuration is recorded here.
- Both received the same short workspace-reading preamble and the shared baseline prompt body from `evals/baseline-prompt.md` (SHA-256 `4e67cadd714398fa674b3c9d490ca257b81284cdc76d97c7a81b84b70174be83`). The only arm-specific prompt addition was the explicit `$architecture-decision-authoring` invocation in the Skill arm.
- Each event stream recorded one `turn.started` and one `turn.completed`. Both final-message captures were non-empty and the CLI processes exited `0`.

## Model substitution limitation

The initial requested `gpt-6-sol` baseline startup attempt failed with exit code `1` before producing a proposal. Codex CLI reported: `The 'gpt-6-sol' model is not supported when using Codex with a ChatGPT account.` Per coordinator direction, both fresh-context runs then used `gpt-5.6-sol` at low reasoning. This substitution is a material deviation and must remain visible in any later comparison.

No expected outputs, prior proposals, reviews, scoring rubric, or case commentary were supplied to either generation context. No scoring was performed here. The prompt requested no external sources or tools; `--ignore-user-config` was used and the observed run events show local workspace reads. This record does not claim network isolation, hidden-prompt visibility, or backend/model-serving verification.

## File hashes

All hashes use SHA-256. The same input files were staged in both workspaces; hashes below identify their common content.

| File | SHA-256 |
| --- | --- |
| Shared prompt body (`evals/baseline-prompt.md`, extracted body) | `4e67cadd714398fa674b3c9d490ca257b81284cdc76d97c7a81b84b70174be83` |
| `template.md` | `34bf6d7166c972ae46b55b7de8c0f8ebf0d90a9e276f4a5be6c502dc23f076e1` |
| `request.md` | `39889a5c470d5a70332a25d9b1aeb73f3bf3e8a3e2969678a08be78fc0eb098e` |
| `input/adopted-decision.md` | `a841be0cbb3f4600489f860216281b5fa01ad4aa5eb3a7f1b1a7e8908045c6de` |
| `input/current-context.md` | `941c5e2756b15576c8152a10c82053fb43e6e0b7ff6cd7564b1ee5275af0b118` |
| `input/load-test-note.md` | `1fbc840a45ae61a8531e40e0f5639a8c11933d3315b08de3fe512652cb610756` |
| `input/request.md` | `39889a5c470d5a70332a25d9b1aeb73f3bf3e8a3e2969678a08be78fc0eb098e` |
| Released Skill `LICENSE` | `26a7c29b2db5f34e2e65ed3e5bb1c047566f92ab911d879dff34c9bc09daf99b` |
| Released Skill `SKILL.md` | `a8703a377e7a1244001e45d90863623e0d248c5dc74a87715c8cb1331ffd4b4a` |
| Released Skill `agents/openai.yaml` | `9b0ed77fda8aa1cbb0f8aa5e0d01dfb1dfb5b055ca8a80c54cf4a6399144390e` |
| Released Skill `assets/architecture-decision-proposal.md` | `34bf6d7166c972ae46b55b7de8c0f8ebf0d90a9e276f4a5be6c502dc23f076e1` |

## Raw outputs

| Arm | Exit | Captured final message bytes / SHA-256 | Repository artifact bytes / SHA-256 |
| --- | ---: | --- | --- |
| Baseline: [baseline.md](baseline.md) | 0 | 10,649 / `f3edf0e4a8c16f8d01a8f620f0f3fa87f944ff53f6a61cf86f99015c84468f95` | 10,650 / `48e905702856db56479782f91b900a4436bd7be2094b4d4b6298b466b28b712f` |
| Skill: [skill.md](skill.md) | 0 | 12,809 / `53fd9ed8479d80e86c0c442287c5b2042d3f381f6c52fa2ae4d96b1dcb19838e` | 12,810 / `68140f077f83841ee3eda1f55264fafc6aa1827682bd3a7606bf29f77fe4fd62` |

`codex exec -o` wrote each final message to a distinct capture file under `/private/tmp/adr-rehearsal-capture-new.LiL362/`. The repository text artifacts preserve the complete final-message content; `apply_patch` added one terminal newline to each copy, so the byte hashes differ as shown. Temporary event streams and stderr logs were used to verify turn counts and exit status but are not included in this minimal public artifact set.
