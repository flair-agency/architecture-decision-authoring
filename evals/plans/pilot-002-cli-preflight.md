# Pilot 002 — CLI preflight and minimum public rehearsal

**Status: Non-generating preparation evidence and a proposed procedure.** Observed on 2026-10-04 UTC on macOS. No held-out material was created or used; no authoring output, owner observation or comparison result exists. This does not adopt [Pilot 002](pilot-002-preparation.md), freeze Phase A/B or relax the existing proposed protocol.

## Performed checks

`codex --version` returned `codex-cli 0.159.3`. Node returned `v22.22.0`. `codex exec --help` lists `--strict-config`, `--ephemeral`, `--ignore-user-config`, `--ignore-rules`, `--skip-git-repo-check`, `--sandbox` and `--json`; help text alone does not prove backend settings or tool/network enforcement.

The following exact command was attempted. It contained no evaluation/rehearsal packet, proposal, expected judgments or organization data:

```sh
codex exec --strict-config --ignore-user-config --ignore-rules \
  --ephemeral --skip-git-repo-check -C /tmp --sandbox read-only \
  -c model_max_output_tokens=8192 \
  'Reply with exactly NON_CASE_CONTROL_CHECK.'
```

Observed exit: **1**. Safe error:

```text
Error loading config.toml: unknown configuration field `model_max_output_tokens` in -c/--config override
```

Configuration loading rejected the key before model dispatch. The synthetic instruction was not answered. A separate local PATH-alias creation warning reflected this shell's filesystem restriction; it does not establish a model or provider failure. No credential or hidden instruction was inspected or published.

This verifies rejection of this particular output-cap key in this CLI version. It does not show that all possible cap mechanisms are absent, that an instruction-only length request is a hard cap, or that the original 8,192-token output target is met. No successful non-case transport smoke has occurred.

Separate read-only `codex features list` checks accepted the six feature-disable overrides used below and reported those features false. `codex -c web_search='"disabled"' features list` also accepted the explicit hosted-search override without model dispatch. Hosted web search is a separate setting from `browser_use`; both controls are specified below. Configuration inventory is not proof of generation-time enforcement or backend limits.

Input assembly was separately performed without a model call, using the exact published source `4421e05b48b67963bc95ecb2c86590fd4c1a0252`. Only the four public Cedar Cart revision `input/` files were read. The baseline prompt body is the bytes between its two standalone `---` delimiter lines. Each bundle contains that body, the same labelled source snapshots and the canonical template once; the Skill arm appends only the frozen Skill instructions once. No `expected.md`, protocol, rubric, plan, earlier output or owner note is supplied.

| Prepared input | UTF-8 bytes | SHA-256 |
| --- | ---: | --- |
| Extracted shared prompt body | 1,516 | `69204ddfbef7461cb8486e66dfd4afc0196c5337406949304fac5fc6cfbfba44` |
| Baseline bundle | 8,003 | `5eae136d6bf707297e9d930526b0daa1c209ec9cd904626c9e0ef8f7639058e4` |
| Skill bundle | 30,405 | `e98d0794ba1999f1563c6566e075fa5a5fff46d9056f8f8386d354661472181e` |

Byte sizes are not token measurements or runtime caps. The raw public-input-only bundles are private preparation artifacts, not model outputs or new case data. Their shared prefix is byte-identical and the appended Skill bytes match the proposed candidate.

## Reproduce assembly without generation

From a checkout with the published Git objects locally available, this reads only those Git blobs and writes to a fresh operating-system temporary directory. It does not fetch, invoke a model, execute checkout hooks, use expectations or alter the checkout. Missing objects are a blocker, not a reason to substitute another source.

```sh
prepared_dir="$(mktemp -d "${TMPDIR:-/tmp}/ada-public-rehearsal.XXXXXX")" || exit 1
python3 - "$prepared_dir" <<'PY'
from pathlib import Path
import hashlib, re, subprocess, sys
revision = '4421e05b48b67963bc95ecb2c86590fd4c1a0252'
output = Path(sys.argv[1])
def blob(name):
    return subprocess.check_output(['git', 'show', revision + ':' + name])
raw = blob('evals/baseline-prompt.md')
delimiters = list(re.finditer(rb'^---\r?\n', raw, flags=re.M))
assert len(delimiters) == 2
body = raw[delimiters[0].end():delimiters[1].start()]
shared = body + b'\n## Supplied source snapshots\n'
for name in ['request.md', 'adopted-decision.md', 'current-context.md', 'load-test-note.md']:
    source = 'evals/cases/cedar-cart-revision/input/' + name
    shared += b'\n### ' + source.encode() + b'\n' + blob(source)
template = blob('docs/templates/architecture-decision-proposal.md')
shared += b'\n## Shared Architecture Decision Proposal template\n' + template
skill = blob('skills/architecture-decision-authoring/SKILL.md')
candidate = shared + b'\n## Additional Architecture Decision Authoring Skill instructions\n' + skill
assert shared.count(body) == shared.count(template) == 1
assert candidate.count(skill) == 1 and candidate[:len(shared)] == shared
for name, data in [('baseline-input.txt', shared), ('skill-input.txt', candidate)]:
    (output / name).write_bytes(data)
    print(name, len(data), hashlib.sha256(data).hexdigest())
PY
```

The recorded hashes above are the comparison target. An unexpected difference must be investigated before dispatch. Keep generated inputs and later results outside the repository; do not commit private arm mappings or owner records.

## Minimum later rehearsal — proposed, not run

Use only already authorized execution/authentication and billing arrangements. If the selected route requires a new paid model API, new credentials or expanded access, stop and report that dependency before running it. No such addition is authorized by this preparation. Do not switch providers merely to get a passing result.

1. **One non-case transport call.** Use a fresh empty working directory and a dummy marker request with no case sources or expectations. Record CLI/version, accepted model/effort settings, exact visible input, safe event metadata, observed tool activity and raw output. This call confirms delivery and observable configuration only; it cannot prove opaque backend revision, complete hidden-instruction exclusion or a provider hard cap. If the requested features/settings fail, preserve that failure and do not dispatch the paired case under changed conditions without recording a new preparation target.
2. **One public pair: baseline, then Skill.** Use the two verified bundles, fresh empty directories and identical accepted configuration. Preserve exact input hashes, raw outputs, exit/events, observed settings and interruptions. No follow-up or external sources in either generation arm. This is two model calls on an already exposed case, not a held-out comparison. Its useful result is evidence about transport, assembly, source fidelity and the scoring procedure; it cannot satisfy the six-pair continuation threshold.
3. **Actual-owner observation.** Give neutral output IDs and the source packet to the human, record initial scoring before arm disclosure, then follow the separate observation procedure. Keep outputs unchanged. If the human is unavailable, report owner observations as not performed; do not substitute model scoring for the required measurements.

The proposed first two steps total **three model calls**, with no additional pair planned for a poor answer or ordinary truncation. Control-invalid diagnostics may be repaired separately with both originals preserved. No successful delivery, token count, elapsed time, owner correction or outcome has been inferred from preparing these commands.

A later generation command has this shape; its model/feature options still require the non-case check. It is shown as a procedure, not executed evidence:

```sh
codex exec --strict-config --ignore-user-config --ignore-rules \
  --ephemeral --skip-git-repo-check -C "$empty_session_dir" --sandbox read-only \
  --disable shell_tool --disable browser_use --disable computer_use \
  --disable apps --disable plugins --disable multi_agent \
  -m gpt-6.1-sol -c model_reasoning_effort='"xhigh"' -c web_search='"disabled"' --json \
  --output-last-message "$output_file" - < "$verified_input_file" \
  > "$event_file" 2> "$private_error_file"
```

The operator supplies new empty directories and private output/event paths for each call. Do not copy raw CLI telemetry, account identifiers, hidden instructions or credentials into a public report; retain only authorized source/output content and safe configuration observations. The successful syntax/control-parser checks above do not establish this complete command's supported tool policy.

Phase A's original strict controls remain unsatisfied, even if a public rehearsal later succeeds. Any proposal to change those conditions must be explicit and reviewed before owner adoption. Phase B still does not exist. Keep API transport, model tool/network behavior, mechanical input checks, actual human observations, decision-grade comparison and product continuation separate.
