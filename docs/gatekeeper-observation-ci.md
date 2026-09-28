# Optional Architecture Gatekeeper CI observation

This workflow runs a semantic review observation for non-draft pull requests
targeting `main`. It is pinned to Architecture Gatekeeper v0.5.1 at commit
`58bbdbb3119736e53a849388a025e74589ab8664`. It uses the `main` policy from
the protected base, the protected prompt, schema and validation files, and the
protected Authority Set. The selected model is `gpt-6-sol` with `low`
reasoning. The default policy is `local-only`; the `main` entry is explicitly
`enforced` for this observation.

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

The caller grants only `contents: read` and `pull-requests: write`, and passes
only `OPENAI_API_KEY`. It does not pass `CI_SOURCE_READ_TOKEN`. The reusable
workflow uses its own pinned implementation and protected-base materialization;
the pull-request merge checkout and diff are review evidence, not executable
instructions or authority. The model request transmits pull-request review
content and the selected `docs/architecture.md` authority to OpenAI. The
workflow can create or update its marker-owned pull-request comment.

## Bootstrap and records

The initial workflow change cannot run itself under the new caller. After it
is merged, the next eligible pull request is the first observation run. For
each run, record the PR number, workflow run ID and attempt, workflow revision,
base and head SHAs, reviewed merge SHA, protected policy digest, selected
authority IDs and provenance, configured model and effort, completed decision
or incomplete reason, and the Actions run/comment links. Do not copy secrets
or represent incomplete runs as decisions. Preserve the distinction between
this diagnostic record and an owner adoption record.

## Focused checks

Before merge, inspect the rendered workflow and confirm the four PR event
types, `main` target, non-draft condition, exact reusable-workflow SHA,
permissions, secret mapping, and explicit policy/prompt/schema/validation
paths. Parse the policy JSON and resolve its `main` entry with the pinned
Gatekeeper v0.5.1 policy resolver. Confirm that the Authority Set and limits
match the existing committed manifest/configuration, and that the schema
requires exact authority IDs. Review the prompt for evidence/authority
separation and the non-adoption boundary. After merge, inspect the first run
and record either the validated semantic outcome or the specific incomplete
failure; do not infer rollout success from workflow presence alone.

The post-merge smoke should confirm that a non-draft PR to `main` starts a
run and that draft PRs do not; an edit/update should exercise the
`synchronize` event. Confirm the run uses the protected base policy and
authority, emits a validated decision or visible incomplete failure, and
creates or updates the marker-owned comment. Also inspect one incomplete
path, such as a deliberately unavailable secret in a controlled test
repository, to verify it remains a failed/incomplete run rather than a
semantic result. These checks do not make the status required or establish
that any proposal was adopted.
