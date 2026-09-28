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

### PR #23 / attempt 1

| Field | Value |
| --- | --- |
| Run / jobs | [run 36428196058](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36428196058) / [authorize job 108947317875](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36428196058/job/108947317875); [model job 108947355003](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36428196058/job/108947355003) |
| Event / action | `pull_request_target`; action subtype unavailable |
| PR author association / draft | `MEMBER`; non-draft |
| Base SHA | `0b3ea0be09402301e58fc64abb34c6ecdd9d9a5b` (`main`), verified from PR metadata |
| Head SHA | `ca004975279c95a4a6baf3f66a47309361afbd6f`, verified from run metadata and PR commit history |
| Protected workflow source revision | `0b3ea0be09402301e58fc64abb34c6ecdd9d9a5b` (`main` base; workflow source for `pull_request_target`) |
| Reviewed merge SHA | Not produced (model job skipped) |
| Configured model / effort | `gpt-6-sol` / `low` (protected CI policy) |
| Result / incomplete reason | Authorize job succeeded and recorded that `allowed` and `reason` outputs were set; their values were not exposed in retrieved metadata. Model job skipped; cause unknown. No semantic decision produced. |
| Protected policy digest | Not produced (model job skipped) |
| Authority provenance / digest | Not produced (model job skipped) |
| Comment URL | Gatekeeper comment not produced (model job skipped) |
| Run timestamps / model latency | Run created 2026-09-28T13:22:50Z and updated 2026-09-28T13:22:57Z; authorize job 13:22:53Z–13:22:56Z. Model job timestamps are inconsistent (`startedAt` 13:22:57Z, `completedAt` 13:22:56Z) and it had zero steps; no reliable model latency (model job skipped). |
| Provider cost | Unavailable/not produced |
| Notes | No evidence establishes whether propagated `allowed` was `true`, empty, or another value. The model job condition required `allowed == 'true'`; it was skipped. GitHub reports its completion one second before its start, so those job timestamps are retained as reported but not treated as a valid duration. The diagnostic job is intended to expose validated propagated values safely. See [runbook details](gatekeeper-observation-ci.md#bootstrap-and-records). |

### PR #24 / attempt 1

| Field | Value |
| --- | --- |
| Run / jobs | [run 36434359700](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36434359700) / [authorize job 108968319525](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36434359700/job/108968319525); [model job 108968370306](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36434359700/job/108968370306) |
| Event / action | `pull_request_target`; action subtype unavailable |
| PR author association / draft | `MEMBER`; non-draft |
| Base SHA | `b03f7c39c7e3b1012d832b17c944831327d259d6` (`main`) |
| Head SHA | `dc687f4c3bcaba8067775e0fa7ae46cdc6c700a6` |
| Protected workflow source revision | `b03f7c39c7e3b1012d832b17c944831327d259d6` (`main` base, before PR #24 merged) |
| Reviewed merge SHA | Not produced (model job skipped) |
| Configured model / effort | `gpt-6-sol` / `low` (protected CI policy) |
| Result / incomplete reason | Authorize job succeeded; model job was skipped. No semantic decision was produced. |
| Protected policy digest | Not produced (model job skipped) |
| Authority provenance / digest | Not produced (model job skipped) |
| Comment URL | Gatekeeper comment not produced (model job skipped) |
| Run timestamps / model latency | Run created 2026-09-28T14:13:31Z and updated 2026-09-28T14:13:40Z; no model latency (model job skipped) |
| Provider cost | Unavailable/not produced |
| Notes | This run used the protected-base workflow at `b03f7c3…`, which predates PR #24. It had the authorize and model jobs but no `diagnose-authorization` job, so it cannot test PR #24's output-diagnostic change. This new PR is the first probe whose protected base contains that job. |

### PR #25 / attempt 1

| Field | Value |
| --- | --- |
| Run / jobs | [run 36435111794](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36435111794) / [authorize job 108970899516](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36435111794/job/108970899516); [diagnose job 108970932654](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36435111794/job/108970932654); [model job 108970992251](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36435111794/job/108970992251) |
| Event / action | `pull_request_target` / `opened` |
| PR author association / draft in event payload | `CONTRIBUTOR`; non-draft |
| Base SHA | `c060eaa06b6f4312a3aab442a60d7dcc93acea77` (`main`) |
| Head SHA | `8541248edc4c3284a1dfa2221a6182a6f04d382a` |
| Protected workflow source revision | `c060eaa06b6f4312a3aab442a60d7dcc93acea77` (`main` base) |
| Reviewed merge SHA | Not produced (model job skipped) |
| Configured model / effort | `gpt-6-sol` / `low` (protected CI policy) |
| Result / incomplete reason | Authorize succeeded with `allowed=false`, `reason=author_association`; diagnostic succeeded with valid propagated outputs; model job skipped. No semantic decision was produced. |
| Protected policy digest | Not produced (model job skipped) |
| Authority provenance / digest | Not produced (model job skipped) |
| Comment URL | Gatekeeper comment not produced (model job skipped) |
| Run timestamps / model latency | Run created 2026-09-28T14:19:30Z and updated 2026-09-28T14:19:44Z; no model latency (model job skipped) |
| Provider cost | Unavailable/not produced |
| Later PR API association observation | A subsequent REST PR read reported `MEMBER`. This later PR metadata observation is separate from the `CONTRIBUTOR` association in the opened-event payload and does not change the event record. |
| Notes | The authorization output diagnostic validated the deny-path propagation (`allowed=false`, `reason=author_association`) and kept the model job skipped. This verifies that denial path only; it does not exercise the eligible `MEMBER` route or a model review. |

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

PR #25 attempt 1 is the latest recorded observation attempt. Its authorize
job denied the opened event's `CONTRIBUTOR` association, and the diagnostic
job successfully validated the propagated denial outputs; the model job was
skipped. This verifies the diagnostic denial path, not the eligible `MEMBER`
route. Record a later synchronize attempt separately after GitHub evaluates
it from the protected base. A successful start alone verifies only
trigger/gate execution, not a valid semantic review or adoption.
