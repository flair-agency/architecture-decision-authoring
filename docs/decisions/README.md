# Decision records

Decision records capture a question, context, alternatives, an outcome, and its consequences. They preserve the rationale for a decision; they do not make the decision for the authorized owner.

## Status

- **Proposed** — a decision is suggested and awaits owner review or adoption.
- **Adopted** — the authorized owner has adopted the decision through the agreed project process.
- **Superseded** — a later adopted decision replaces it; link to that record when available.

A status label is not authentication or proof of approval. Record the authorization evidence for each decision. The public owner decision record for this initial pilot is [here](https://github.com/flair-agency/architecture-decision-authoring/pull/8#issuecomment-5857199038); it is a coordinator transcription, not independent owner authentication.

The adopted records are:

- [0001 — Use a Markdown-first, source-mapped proposal contract](0001-markdown-first-proposal-contract.md), which preserves the initial pilot contract and rationale; and
- [0002 — Produce a Gatekeeper-compatible Authority Set after owner adoption](0002-authority-set-final-outcome.md), which amends 0001's product endpoint while retaining the Proposal and owner-adoption boundary.
- [0003 — Distinguish pending adoption from a decided outcome](0003-pending-adoption-record.md), which defines pending and decided adoption-record states and preserves valid legacy decided records.
- [0004 — Bind a Proposal revision to committed repository bytes](0004-bind-proposal-revision-to-committed-bytes.md), which binds the packaged Proposal to its locally available committed bytes and digest.
- [0005 — Make canonical integration the normal completion handoff](0005-canonical-integration-handoff.md), which amends the product endpoint while retaining the optional Gatekeeper package and its existing integrity boundary.

## Repository bootstrap adoption rule

This rule governs decisions about this repository's own product contract and artifacts. It does not govern decisions made by consumers of this product.

For a repository decision, the repository owner must record one explicit outcome: `Adopt`, `Amend`, `Defer`, or `Reject`. The record must identify the target artifact and revision, applicable scope/conditions and exceptions, and an authorization evidence URL or record ID. A `Defer` or `Reject` outcome does not adopt the target; an `Amend` outcome must identify the resulting amended artifact/revision. Keep the document status synchronized with the recorded outcome, while treating the status as descriptive metadata only.

No mandatory reviewer is required during the pilot. A pull request, approval, merge, or status label alone does not establish adoption; the explicit owner outcome and its evidence record the decision. Consumers retain authority over their own review roles, adoption rules, canonical architecture, and downstream artifacts.

Use the [Architecture Decision Proposal template](../templates/architecture-decision-proposal.md) for reviewable proposals. Keep a decision record's scope, applicability conditions, exceptions, time bounds, source mapping, and trade-offs explicit. If information or owner choices are missing, record the gap rather than silently deciding it.
