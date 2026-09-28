# Pilot 001 — non-case transport smoke evidence

**Status:** Evidence report; no owner outcome implied. Phase A remains Proposed, not Frozen. The explicit user prompt and command arguments supplied to the smoke contained no evaluation/rehearsal case, source packet, expected answer, held-out material, or repository content. Whether ambient/effective platform context contained such material is unverified.

This report records a bounded transport/configuration smoke for the proposed Codex CLI `0.153.2` and `gpt-6-astra` / `high` target. It does not authorize Phase A or Phase B, establish the comparative protocol, or constitute an evaluation result.

**Observed at:** 2026-09-28 (Asia/Tokyo; exact time not retained). Claims below are operator observations from the command outputs seen during this session, not independently archived raw evidence. Hidden/system instructions, credentials, and raw session transcripts are intentionally not reproduced. The evidence boundary is limited to explicit command/prompt inputs and safe output observations; ambient/effective context exclusion was not verified.

## Evidence

- Operator observed `codex --version` report `codex-cli 0.153.2`.
- Operator observed `codex login status` report login using ChatGPT. No credential value was inspected or recorded.
- Operator observed one `codex exec` call complete with requested model `gpt-6-astra`, reasoning effort `high`, `model_context_window=16384`, ephemeral session mode, and read-only sandbox. It returned synthetic marker `SMOKE_OK`; usage metadata reported 11,626 input tokens and 7 output tokens. The input-token usage includes platform/runtime context, so it does not establish the count of the user-supplied body alone.
- Operator observed an attempt with `-c model_max_output_tokens=8192` and `--strict-config` fail before a model call: `unknown configuration field model_max_output_tokens`. The CLI therefore did not accept that proposed output cap.
- The successful command disabled `shell_tool`, `browser_use`, `computer_use`, `apps`, `plugins`, and `multi_agent`, omitted `--search`, and used `--sandbox read-only`. Operator observed the command return successfully. This is configuration evidence, not provider-side proof of the complete effective tool list or all network isolation. The API transport itself necessarily used network access.
- Operator observed an attempt under the default restricted shell sandbox fail to initialize the CLI state database/app-server. One isolated execution was then authorized and completed using a temporary working directory, with no explicit repository arguments or content supplied. This required relaxing only the command sandbox; the Codex agent sandbox remained read-only and tool-disabled.
- A non-case input-delivery check using a user-supplied exact prompt string was completed. No evaluation prompt, architecture sources, project files, or shared evaluation materials were explicit command/prompt inputs. Ambient/effective context exclusion is unverified. As no shared material/template was required or included in explicit inputs, one-time inclusion cannot be verified from this smoke.

## Control assessment

| Control | Result | Evidence / limit |
| --- | --- | --- |
| CLI version | Verified | CLI reported `0.153.2`. |
| Prompt-body delivery | Partially verified | A short synthetic user prompt reached the run and the exact expected sentinel was returned. Extraction/delivery of the proposed baseline body and identical cross-arm assembly were not tested. |
| Shared material included exactly once | Not tested | No shared material or template was supplied. |
| Requested model and reasoning setting | Partially verified | Requested model/effort flags and successful response demonstrate the CLI accepted the configuration. Provider/backend identity, exact model revision, and provider-side application of effort are not independently confirmed by the captured safe metadata. |
| Input/context cap | Partially verified | CLI accepted `model_context_window=16384`; reported total input usage was 11,626. The reported total includes hidden/runtime context and does not prove a hard provider-side cap or expose effective instructions. |
| Output cap | Unsupported by this CLI configuration | `model_max_output_tokens=8192` is rejected under strict config before request dispatch. No alternative enforceable output-token cap was established. |
| Tools | Partially verified | Relevant tool features were disabled, live search omitted, and read-only sandbox selected. The command completed. Complete effective provider tool availability was not independently observed without inspecting potentially hidden prompt/config contents. |
| Network behavior | Partially verified | Live web search was not enabled and model tools were disabled. The API request itself used network. No independent host-level egress audit was performed, so general network isolation is unverified. |
| Effective instructions/configuration visibility | Not verified | Hidden/system instruction contents were deliberately not inspected. The CLI does not expose safe metadata here proving the complete effective instruction set. |
| One-time shared-material assembly | Not verified | No assembly containing shared material was sent. |

## Outcome and remaining owner decision

The smoke observed that the proposed CLI returned from a small ephemeral request with the requested model/effort flags and selected restrictions, and that the requested output cap key was not accepted. It does **not** satisfy the plan's feasibility gate. In particular, output-cap enforcement, provider/backend metadata and setting application, the complete effective instructions/tool configuration, and broad network isolation remain unverified or unsupported. Phase A therefore remains blocked from owner adoption pending explicit owner decisions. The owner must choose whether to (1) defer/revise the target, (2) obtain additional verifiable controls for output cap, metadata, effective instructions/tools, and network behavior, and (3) define how the transport/network interpretation should satisfy the plan. Before later Phase A adoption, the owner must also name the mapping custodian and secure location, confirm or reject the proposed P3 deferral, and explicitly Adopt a specific revised/final Phase A target with evidence. No held-out cases may be created before that later Adopt.

No raw session transcript or hidden instruction/configuration content is included in this repository. The only model output preserved here is the synthetic marker and aggregate usage metadata above.

## Reproduction commands

These commands were run from the repository root. The model-call command used a temporary working directory, supplied no explicit repository content, and used an ephemeral session. This does not establish that ambient/effective context was free of repository content.

```sh
codex --version
codex login status
codex exec --strict-config --ephemeral --ignore-user-config --ignore-rules \
  --skip-git-repo-check -C /private/tmp --sandbox read-only \
  --disable shell_tool --disable browser_use --disable computer_use \
  --disable apps --disable plugins --disable multi_agent \
  -m gpt-6-astra -c model_reasoning_effort='"high"' \
  -c model_context_window=16384 --json \
  "Reply with exactly SMOKE_OK and nothing else."
```

The output-cap rejection was checked with the same command plus `-c model_max_output_tokens=8192`; strict config rejected the unknown field before sending a request.
