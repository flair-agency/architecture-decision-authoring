# Gatekeeper observation log

**Diagnostic record only.** This log tracks optional Architecture Gatekeeper
CI observations. It is not normative architecture, a required-check record,
acceptance evidence, or an owner adoption record. A completed semantic result
does not approve a PR or adopt a proposal. See the [workflow runbook](gatekeeper-observation-ci.md)
for scope, safeguards, and interpretation.

## Recorded runs

| PR / attempt | Run / job | Event / actor | Base / head / workflow revision | Configured model | Result / incomplete reason | Authority provenance / digest | Comment | Timing / provider cost | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #19 / 1 | [run 36418779734](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36418779734) / [job 108916190828](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36418779734/job/108916190828) | `pull_request_target`; action subtype unavailable; actor association `MEMBER`; non-draft | base `main` `6446adddac48763997b23a99c8a2c136c1a15022`; head `75dd7261a7cff3ecb25ab2d46d67fadc81a746fc`; workflow from protected base commit `6446adddac48763997b23a99c8a2c136c1a15022` | `gpt-6-sol` / `low` | **Skipped**, zero steps; no semantic decision produced | Not produced | Gatekeeper comment not produced | 2026-09-28T11:57:30Z–11:57:40Z; latency not applicable; provider cost unavailable/not produced | Suspected actor-expression evaluation issue; unconfirmed. See [runbook details](gatekeeper-observation-ci.md#bootstrap-and-records). |

## Record format for subsequent runs

Add one row per workflow attempt. Use exact values from GitHub run/job metadata,
the protected policy and authority artifacts, and any completed workflow
output. If a value is absent or the workflow did not reach the relevant stage,
write `Unavailable` or `Not produced` with a short reason; do not infer it.
For failed, skipped, cancelled, timed-out, or otherwise incomplete runs, record
the observed status and specific incomplete reason instead of a semantic
decision.

Each row should include:

- PR number, run attempt, run URL, and job URL;
- event and action subtype when available; actor association and draft status;
- base/head SHAs and protected workflow source revision;
- configured model and reasoning effort;
- semantic result only when a decision was actually completed, otherwise the
  incomplete status/reason and observed failure behavior;
- complete Authority Set provenance and digest only when actually produced;
- marker-comment URL only when the comment exists;
- run timestamps and measured model latency when available; and
- provider cost when available, otherwise `Unavailable`/`Not produced`.

The pull request carrying this observation-log addition is intended to be the
first eligible verification probe after the trusted-author expression fix.
Its PR number and run are unknown until that pull request is opened and GitHub
evaluates the workflow from the protected base. Do not enter a result before
then. A successful start alone verifies only trigger/gate execution, not a
valid semantic review or adoption.
