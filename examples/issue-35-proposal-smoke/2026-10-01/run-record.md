# ZIP-installed Proposal CLI smoke — 2026-10-01

## Result

A successful Codex CLI run read the Skill and bundled Proposal template from the extracted-and-installed candidate archive and wrote [`proposal.md`](proposal.md). This is a bounded regression smoke using the four existing synthetic inputs linked below. It does not establish general quality, owner adoption, policy correctness, or release readiness. No Authority Set or consumer policy artifact was produced; the Proposal’s adoption section remains Pending.

## Candidate and source identity

- Candidate source revision: `b4437abbfb17a4d4053c5e5a700e797388be87fa`.
- Candidate ZIP: `architecture-decision-authoring-v0.2.0-candidate.zip`; SHA-256 `359aef94d7677347d064c91de369d598468603c80d570f4709ab87b35cb00ef6`.
- Archive contents: the seven Skill files (`LICENSE`, `SKILL.md`, `agents/openai.yaml`, bundled Proposal template, finalization reference, package checker, and package-checker tests). Extraction and installation were compared recursively and had no differences. The installed Skill tree also matches the Skill tree at current source `6ef49bb6adfffd88b3c2acfdbd8c7b1265b5caab`; the only source diff between those revisions is the separate Issue 33 rehearsal evidence record.
- ZIP is the packaging choice used for this test candidate, not an adopted distribution format. No release or tag was created.

## Inputs and execution

The four exact input files are the repository's synthetic bounded-decision inputs: [`request.md`](../../bounded-decision/input/request.md), [`reporting-brief.md`](../../bounded-decision/input/reporting-brief.md), [`operating-rule.md`](../../bounded-decision/input/operating-rule.md), and [`field-guide.md`](../../bounded-decision/input/field-guide.md). The copies supplied to the run matched those repository files byte-for-byte. SHA-256 values, in the same order:

- `f595a0ea697a66ffc58e1540aaa28e34d73840a4473b7ca16babd47b95f1f278`
- `19374988192ea51580483829629da39b3a2dd1e736f0d4695bf494cce811b2fe`
- `6d06fa85ad59597754e91ec59a05587a03d73e1dc99d3bfcc98c257378aac0c3`
- `eff079589185eea3b37b855d2442f8d841f7f2a0edc2591fca63e298c45a0ede`

The command ran from `/private/tmp/ada-issue35-candidate.YW6Pkz/run`:

```sh
codex exec --skip-git-repo-check \
  --cd /private/tmp/ada-issue35-candidate.YW6Pkz/run \
  --model gpt-5.6-sol \
  -c 'model_reasoning_effort="low"' \
  --sandbox workspace-write \
  --output-last-message output/final-message.txt - \
  < proposal-smoke-prompt.md \
  > codex-proposal.stdout 2> codex-proposal.stderr
```

Codex CLI was `0.159.2`; model was `gpt-5.6-sol`, effort `low`, provider `openai`; the command exited `0`. The run wrote the complete Proposal at `output/proposal.md` and a brief summary at `output/final-message.txt`. The exact task prompt, raw stdout/stderr, summary, and CLI session record remain in the private temporary run directory; they are not included in this repository.

- Proposal SHA-256: `b925c5afb6170c8d2c08b687b114f1e9e221656de1b61b2aceedabe73e6dca78`.
- Task-prompt SHA-256: `438ef69c71c86d1ae78a4f2358fec4b832eb9868bbdaa61b10478eab12996b45`.
- Summary SHA-256: `d25af4a7c61f421aa491bd3310097db6a6ad8ee65eb1ce544cad1a577bc6922b`.

## Bounded review

The Proposal follows the bundled structure, treats `OPS-14` as the supplied existing decision, maps material source claims to the linked inputs, leaves adoption Pending, identifies unresolved owner choices, and does not claim that age-based ranking or escalation is authorized. The cited source lines match the linked synthetic inputs. This limited developer review found no factual or source-fidelity defect in the generated Proposal; it is not an owner review or a general semantic-quality assessment.

The raw output still contains several template-guidance paragraphs as literal prose, including the instruction under “Options considered” to include alternatives and similar guidance under “Source map” and “Adoption record.” These remnants reduce polish and should be removed before using the draft as a finished deliverable. They are recorded here as an observed output limitation; this evidence record does not revise the raw Proposal.
