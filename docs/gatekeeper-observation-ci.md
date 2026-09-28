# Optional Architecture Gatekeeper CI observation

This workflow runs a no-secret authorization preflight for matching pull
request events targeting `main`. Only a valid, non-draft PR with author
association `OWNER`, `MEMBER`, or `COLLABORATOR` proceeds to the semantic
review observation. That model job is pinned to Architecture Gatekeeper v0.5.1 at commit
`58bbdbb3119736e53a849388a025e74589ab8664`. It uses the `main` policy from
the protected base, the protected prompt, schema and validation files, and the
protected Authority Set. The selected model is `gpt-6-sol` with `low`
reasoning. The default policy is `local-only`; the `main` entry is explicitly
`enforced` for this observation. The CI policy sets `maxPromptBytes` to
131,072 bytes, intentionally below the local/manual configuration's 524,288
bytes to bound this observation's request size; local configuration remains
unchanged.

The no-secret preflight runs for each configured PR event. It reads only the
GitHub event JSON file, validates the expected event shape and target base,
and checks that `draft` is a JSON boolean and the author association is an
exact recognized GitHub value. Draft and external/non-allowlisted PRs complete
the preflight with `allowed=false` and a fixed reason; they skip the model
job. A separate no-secret diagnostic job validates and reports the
authorization job's propagated `result`, `allowed`, and `reason` values. It
runs even when authorization fails, and fails visibly for missing or invalid
outputs. The model job requires successful authorization, `allowed=true`, and
a successful diagnostic job. Malformed JSON or missing, wrong-type, or
unrecognized required fields fail the preflight visibly and cannot start the
model job. The preflight and diagnostic jobs have no token permissions,
perform no checkout/API call, and receive no secrets.
The recognized `MANNEQUIN` association is denied like other non-allowlisted
associations; arbitrary unknown association strings remain malformed input.
A collaborator association is allowed even if that collaborator is outside
the organization.

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
ceiling. Before broadening the author-association gate, verify that hard spend
limits are configured and active in the OpenAI provider/account settings.

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
types, `main` target, non-draft and author-association conditions, exact
reusable-workflow SHA, permissions, secret mapping, and explicit
policy/prompt/schema/validation paths. Parse the policy JSON and resolve its
`main` entry with the pinned Gatekeeper v0.5.1 policy resolver. Confirm that
the Authority Set and the manifest, member, file, and total-byte limits match
the existing committed configuration. Confirm that CI's prompt limit is
131,072 bytes while local/manual remains 524,288 bytes, and that the schema
restricts each `authorityIds` item to `authoring-product-contract`. The pinned
runtime's `validateAuthoritySetDecision` separately checks exact complete-set
cardinality and rejects missing, duplicate, or extra IDs. The same schema is
used by local/manual/native review, so confirm those routes still accept the
selected authority ID. Review the prompt for evidence/authority separation and
the non-adoption boundary. After merge, inspect the first run and record
either the validated semantic outcome or the specific incomplete failure; do
not infer rollout success from workflow presence alone.

The post-merge smoke should confirm that each configured PR event starts the
no-secret preflight and output diagnostic; draft and external-author PRs
should report a fixed skip reason and not start the model job, while an
eligible non-draft member PR should report propagated `allowed=true` and start
it. If the model job is skipped, inspect the diagnostic output before
attributing a cause. A commit update should exercise `synchronize`,
and edits to the PR description or base branch should exercise `edited` (a
retarget to `main` should start an observation). Confirm the run uses the
protected base policy and authority, emits a validated decision or visible
incomplete failure, and creates or updates the marker-owned comment. Also
inspect one incomplete path, such as a deliberately unavailable secret in a
controlled test repository, to verify it remains a failed/incomplete run
rather than a semantic result. These checks do not make the status required or
establish that any proposal was adopted.
