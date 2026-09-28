# Gatekeeper observation log

**Diagnostic record only.** This log tracks optional Architecture Gatekeeper
CI observations. It is not normative architecture, a required-check record,
acceptance evidence, or an owner adoption record. A completed semantic result
does not approve a PR or adopt a proposal. See the [workflow runbook](gatekeeper-observation-ci.md)
for scope, safeguards, and interpretation.

## Recorded runs

### PR #19 / attempt 1

| Field | Value |
| --- | --- |
| Run / job | [run 36418779734](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36418779734) / [job 108916190828](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36418779734/job/108916190828) |
| Event / action | `pull_request_target`; action subtype unavailable |
| PR author association / draft | `MEMBER`; non-draft |
| Base SHA | `6446adddac48763997b23a99c8a2c136c1a15022` (`main`) |
| Head SHA | `75dd7261a7cff3ecb25ab2d46d67fadc81a746fc` |
| Protected workflow source revision | `6446adddac48763997b23a99c8a2c136c1a15022` |
| Reviewed merge SHA | Not produced (skipped with zero steps) |
| Configured model / effort | `gpt-6-sol` / `low` |
| Result / incomplete reason | **Skipped**, zero steps; no semantic decision produced |
| Protected policy digest | Not produced (skipped with zero steps) |
| Authority provenance / digest | Not produced |
| Comment URL | Gatekeeper comment not produced |
| Run timestamps / model latency | 2026-09-28T11:57:30Z–11:57:40Z; latency not applicable |
| Provider cost | Unavailable/not produced |
| Notes | Suspected actor-expression evaluation issue; unconfirmed. See [runbook details](gatekeeper-observation-ci.md#bootstrap-and-records). |

### PR #21 / attempt 1

| Field | Value |
| --- | --- |
| Run / job | [run 36422044674](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36422044674) / [job 108926921218](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36422044674/job/108926921218) |
| Event / action | `pull_request_target`; action subtype unavailable |
| PR author association / draft | `MEMBER`; non-draft |
| Base SHA | `2120aa330a276271d45d7d356fd9f0e5ab992650` (`main`) |
| Head SHA | `a182ace51f5bd67f12ebfc2b9d0dfd5ea154020c` (run metadata) |
| Protected workflow source revision | `2120aa330a276271d45d7d356fd9f0e5ab992650` |
| Reviewed merge SHA | Not produced (skipped with zero steps) |
| Configured model / effort | `gpt-6-sol` / `low` |
| Result / incomplete reason | **Skipped**, zero steps; no semantic decision produced |
| Protected policy digest | Not produced (skipped with zero steps) |
| Authority provenance / digest | Not produced |
| Comment URL | Gatekeeper comment not produced |
| Run timestamps / model latency | 2026-09-28T12:28:23Z–12:28:24Z; latency not applicable |
| Provider cost | Unavailable/not produced |
| Notes | The protected-base caller contained the explicit equality-OR condition, but the job still skipped. Cause remains unknown; this did not verify that fix. |

### PR #22 / attempt 1

| Field | Value |
| --- | --- |
| Run / job | [run 36423392498](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36423392498) / [job 108931423179](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36423392498/job/108931423179) |
| Event / action | `pull_request_target`; action subtype unavailable |
| PR author association / draft | `MEMBER`; non-draft |
| Base SHA | `2120aa330a276271d45d7d356fd9f0e5ab992650` (`main`) |
| Head SHA | `cf734438a9818243242f40b8c1c79a78876f2335` (run metadata) |
| Protected workflow source revision | `2120aa330a276271d45d7d356fd9f0e5ab992650` |
| Reviewed merge SHA | Not produced (skipped with zero steps) |
| Configured model / effort | `gpt-6-sol` / `low` |
| Result / incomplete reason | **Skipped**, zero steps; no semantic decision produced |
| Protected policy digest | Not produced (skipped with zero steps) |
| Authority provenance / digest | Not produced |
| Comment URL | Gatekeeper comment not produced |
| Run timestamps / model latency | 2026-09-28T12:40:55Z–12:40:57Z; latency not applicable |
| Provider cost | Unavailable/not produced |
| Notes | PR #22 carried the two-stage preflight, but this run used the protected-base workflow at `2120aa3…`, which predates that preflight. This run cannot verify the new design. |

## Record format for subsequent runs

Add one separate two-column `Field` / `Value` table for each workflow attempt,
under a heading of the form `### PR #N / attempt N`. Do not add attempts as
new columns or mix multiple attempts into one table. Use exact values from
GitHub run/job metadata, the protected policy and authority artifacts, and
any completed workflow output. If a value is absent or the workflow did not
reach the relevant stage, write `Unavailable` or `Not produced` with a short
reason; do not infer it. For failed, skipped, cancelled, timed-out, or otherwise
incomplete runs, record the observed status and specific incomplete reason
instead of a semantic decision.

Each attempt table should include these fields:

- PR number, run attempt, run URL, and job URL;
- event and action subtype when available; PR author association and draft
  status;
- base SHA, head SHA, protected workflow source revision, and reviewed merge
  SHA as separate fields;
- configured model and reasoning effort;
- protected policy digest, separate from Authority Set provenance/digest;
- semantic result only when a decision was actually completed, otherwise the
  incomplete status/reason and observed failure behavior;
- complete Authority Set provenance and digest only when actually produced;
- marker-comment URL only when the comment exists;
- run timestamps and measured model latency when available; and
- provider cost when available, otherwise `Unavailable`/`Not produced`.

The pull request carrying this observation-log addition is intended to be a
post-fix verification probe. PR #21 already recorded the explicit equality-OR
condition, but its job skipped before executing any steps, so it did not verify
the fix. Record this pull request's run only after GitHub evaluates the
workflow from the protected base. A successful start alone verifies only
trigger/gate execution, not a valid semantic review or adoption.
