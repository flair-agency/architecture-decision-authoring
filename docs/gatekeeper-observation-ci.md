# Optional Architecture Gatekeeper CI observation

This owner-directed observation runs a no-secret authorization preflight for
matching pull request events targeting `main`. The owner selected same-repository
PR admission independently of author association, while retaining the Fork
prohibition. The workflow repository ID, event repository ID, and pull request's
base repository ID must be valid positive integers that agree. The head
repository ID must also be valid and equal the base ID; a different ID is a
Fork and is denied regardless of author association. Missing, malformed, or
contradictory repository identity fails closed. Only valid, non-draft,
same-repository PRs targeting `main` proceed to the semantic review observation.
The spend prerequisite and its owner-reported confirmation are recorded below.
That model job is
pinned to Architecture Gatekeeper v0.6.0-preview.2 at commit
`c6c45da24d755ddd51b3a595e614242f869ec3ad`. It uses the `main` policy from
the protected base, the protected prompt, schema and validation files, and the
protected Authority Set. The selected model is `gpt-6-sol` with `low`
reasoning. The default policy is `local-only`; the `main` entry is explicitly
`enforced` for this observation. The CI policy sets `maxPromptBytes` to
131,072 bytes, intentionally below the local/manual configuration's 524,288
bytes to bound this observation's request size; local configuration remains
unchanged.

The no-secret preflight runs for each configured PR event. It reads only the
GitHub event JSON file and the platform-provided repository ID, validates the
expected event shape, repository identity, and target base,
and checks that `draft` is a JSON boolean. Author association is diagnostic
only: recognized values are printed, while missing, malformed, or unknown
values print the fixed `UNKNOWN` label without changing admission. Draft,
Fork, and wrong-base PRs complete the preflight with `allowed=false` and a
fixed reason; they skip the model job. Malformed identity fails the preflight
and the diagnostic job reports invalid or missing propagation; the model
remains skipped. A separate no-secret diagnostic job validates and reports the
authorization job's propagated `result`, `allowed`, and `reason` values. It
runs even when authorization fails, and fails visibly for missing or invalid
outputs. The model job requires successful authorization, `allowed=true`, and
a successful diagnostic job. Malformed JSON or missing, wrong-type, or
unrecognized required fields fail the preflight visibly and cannot start the
model job. The preflight and diagnostic jobs have no token permissions,
perform no checkout/API call, and receive no secrets.
The pinned Codex Action separately checks the execution actor's repository
write access. This caller change does not bypass or configure that upstream
actor gate; passing the caller preflight does not prove model execution.

## Meaning and limits

The workflow is optional feedback, not a required check or merge-acceptance
rule. A completed `PASS`, `BLOCK`, or `OWNER_DECISION` is a semantic review
against the selected authority at the recorded revision. It does not approve
the pull request, authenticate owner approval, adopt a proposal, or update
canonical architecture. Branch protection and any future required-check
decision are outside this change and remain unresolved owner choices.
The reusable workflow exposes an `accept` job/check for its own policy result;
this caller does not configure that check as required. Its presence or result
alone does not change the repository's merge policy.

An unavailable secret, policy or authority, workflow error, reviewer timeout,
malformed response, or schema/validation failure leaves the review incomplete.
Incomplete execution is not converted to a semantic decision. There is no
fallback route and no `continue-on-error`. The pinned reporter writes a job
summary; a pull-request comment delivery error is reported as a warning and
does not by itself invalidate an otherwise completed review. The workflow may
fail visibly; because it is not configured as a required check, that failure
does not itself block merging.

Top-level permissions are empty. The authorization preflight has empty
permissions, runs no actions, does not check out pull-request code, and reads
only the event JSON using `jq`. Event values are validated/allowlisted before
they enter ordinary logs/summary; only fixed `allowed` and `reason` outputs
are passed downstream. The diagnostic job receives those fixed outputs via
environment variables, validates them, and prints only the validated values
or a fixed missing/invalid status. It also has empty permissions, no checkout,
actions, API calls, or secrets. Under `pull_request_target`, the authorization
preflight itself does not execute PR content and preserves the existing
pinned reviewer/protected-materialization boundary. Reviewer execution safety
remains dependent on the pinned reusable implementation. The
reusable review job alone grants `contents: read` and `pull-requests: write`,
and passes only `OPENAI_API_KEY`. It does not pass `CI_SOURCE_READ_TOKEN`. The reusable
workflow uses its own pinned implementation and protected-base materialization;
the pull-request merge checkout and diff are review evidence, not executable
instructions or authority. The model request transmits pull-request review
content and the selected `docs/architecture.md` authority to OpenAI. The
workflow can create or update its marker-owned pull-request comment.

The pinned reusable workflow already uses per-PR concurrency and
`cancel-in-progress`, so a newer run for the same PR cancels the older one.
This reduces overlapping work but does not impose a provider or account spend
ceiling. Before merging or activating a broadening of caller admission, require
confirmation that hard spend limits are configured and active in the OpenAI
provider/account settings. On 2026-10-05 the owner reported replacing the
repository's `OPENAI_API_KEY`, setting the monthly limit to USD 20, and saving
`Enforce a hard limit` as ON. This satisfies the confirmation prerequisite on
owner-reported evidence; no independent provider settings or secret-value
readback was performed. The monthly amount alone would not establish hard
limit enforcement. This repository change does not configure provider limits
or grant additional secret access. Reaching the cap can prevent model execution
or cause a provider error; such a run is incomplete, not a semantic `PASS`.

## Bootstrap and records

The initial workflow change cannot run itself under the new caller. After it
is merged, the next eligible pull request is the first observation run. For
each run, record the PR number, workflow run ID and attempt, workflow revision,
base and head SHAs, reviewed merge SHA, protected policy digest, selected
authority IDs and provenance, configured model and effort, completed decision
or incomplete reason, and the Actions run/comment links. Do not copy secrets
or represent incomplete runs as decisions. Preserve the distinction between
this diagnostic record and an owner adoption record.

The first reported bootstrap attempt, [Actions run `36418779734`](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36418779734)
(attempt 1; [job `108916190828`](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36418779734/job/108916190828)),
was for PR #19. GitHub run/job metadata records event `pull_request_target`,
conclusion `skipped`, and zero job steps. The event action subtype
(`opened`/`synchronize`/etc.) is unavailable in the retrieved run record. The
PR metadata records non-draft, base `main` at
`6446adddac48763997b23a99c8a2c136c1a15022`, head
`75dd7261a7cff3ecb25ab2d46d67fadc81a746fc`, and author association `MEMBER`.
The run used the protected-base workflow source at that `main` commit; its
protected CI policy configured `gpt-6-sol` with `low` reasoning. The run was
created at `2026-09-28T11:57:30Z` and completed at `2026-09-28T11:57:40Z`.

Because the job was skipped before any steps ran, there was no semantic
decision or completed observation. Authority provenance/digest, model latency,
provider cost, and a Gatekeeper marker comment were not produced by this run.
The membership-expression evaluation is a suspected cause, not a confirmed
diagnosis. A later protected-base revision replaced that membership expression
with explicit equality checks, but the next eligible PR still skipped before
any steps ran (see below). Do not count this skipped run as a completed
observation.

A second attempt, [Actions run `36422044674`](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36422044674)
(attempt 1; [job `108926921218`](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36422044674/job/108926921218)),
was for PR #21. The PR was non-draft, targeted `main`, and had author
association `MEMBER`; the protected-base workflow already contained the
explicit equality-OR condition. The model job was skipped with zero steps.
The exact cause remains unknown; this run does not verify the equality-OR fix.
No semantic result or authority provenance was produced by that model job.
The two skipped runs motivate the event-file preflight above; this new design
is itself unverified until a later eligible PR runs the protected-base
workflow and the preflight summary and model-job behavior are inspected.

A third attempt, [Actions run `36428196058`](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36428196058)
(attempt 1; [authorize job `108947317875`](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36428196058/job/108947317875)
and [model job `108947355003`](https://github.com/flair-agency/architecture-decision-authoring/actions/runs/36428196058/job/108947355003)),
was for PR #23. GitHub metadata records a non-draft PR targeting `main` with
author association `MEMBER`. The authorize job succeeded and its logs record
that the `allowed` and `reason` outputs were set, but the retrieved metadata
does not expose their values. The model job was skipped. The cause is
therefore unknown; no evidence shows whether the propagated `allowed` value
was `true`, empty, or another value. Omitting `${{ }}` around a job-level
`if` is not established as the cause; GitHub documents that wrapper as
optional. The reviewer condition now uses the explicit wrapper for clarity,
not as a verified fix. The diagnostic job is intended to expose the
validated propagated values safely in ordinary logs and a job summary. This
design remains unverified until a later protected-base run.

## Focused checks

Before merge, inspect the rendered workflow and confirm the five PR event
types, `main` target, non-draft and same-repository identity conditions, exact
reusable-workflow SHA, permissions, secret mapping, and explicit
policy/prompt/schema/validation paths. Parse the policy JSON and resolve its
`main` entry with the pinned Gatekeeper v0.6.0-preview.2 policy resolver. Confirm that
the Authority Set and the manifest, member, file, and total-byte limits match
the existing committed configuration. Confirm that CI's prompt limit is
131,072 bytes while local/manual remains 524,288 bytes, and that the schema
restricts each `authorityIds` item to `authoring-product-contract`. The adopted
schema keeps `findings` as strings, so this preview's optional inline PR comment
route is not selected; the existing report and decision validation remain the
configured behavior. The pinned runtime's `validateAuthoritySetDecision` separately checks exact complete-set
cardinality and rejects missing, duplicate, or extra IDs. The same schema is
used by local/manual/native review, so confirm those routes still accept the
selected authority ID. Review the prompt for evidence/authority separation and
the non-adoption boundary. After merge, inspect the first run and record
either the validated semantic outcome or the specific incomplete failure; do
not infer rollout success from workflow presence alone.

The post-merge smoke should confirm that each configured PR event starts the
no-secret preflight and output diagnostic; draft and Fork PRs
should report a fixed skip reason and not start the model job, while an
eligible non-draft same-repository PR should report propagated `allowed=true`.
The separate upstream actor gate may still prevent model execution. If the model job is skipped, inspect the diagnostic output before
attributing a cause. A commit update should exercise `synchronize`,
and edits to the PR description or base branch should exercise `edited` (a
retarget to `main` should start an observation). Confirm the run uses the
protected base policy and authority, emits a validated decision or visible
incomplete failure, and creates or updates the marker-owned comment. Also
inspect one incomplete path, such as a deliberately unavailable secret in a
controlled test repository, to verify it remains a failed/incomplete run
rather than a semantic result. These checks do not make the status required or
establish that any proposal was adopted.


## Post-merge same-repository verification

After an authorized merge, use an ordinary configured event on a valid,
non-draft same-repository PR targeting `main`. Record the exact protected
caller revision, PR/event base and head identities, run ID and attempt, and
pinned reusable workflow revision separately. Inspect actual authorization
and diagnostic logs for `allowed=true reason=eligible`; workflow success or
this preflight alone is not a completed model review. The pinned Codex Action's
separate execution-actor write-access check remains applicable.

Confirm that the model job starts, produces a structured decision, passes the
configured schema and deterministic decision validation, and completes
successfully before reporting a semantic outcome. Preserve authority provenance,
reviewed revision, model/effort and the returned `PASS`, `BLOCK`, or
`OWNER_DECISION`; a completed decision is optional feedback, not adoption or
merge acceptance. If the job skips or fails, record its exact stage and reason
without inventing a decision. An invalid or unavailable key, provider cap,
actor rejection, timeout or malformed response leaves execution incomplete.

Keep Fork-denial verification separate: a different valid head repository ID
must yield `allowed=false reason=fork`, with the model job skipped. An
allowlisted author or an eligible actor does not override that restriction.
The existing post-#79 Fork run is evidence for the unchanged identity guard;
new hosted verification is not implied by this documentation update.
