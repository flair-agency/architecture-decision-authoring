# Architecture Decision Proposal 0006: Recover a valid pre-Git owner outcome

> **Document status:** Proposed; owner decision pending  
> **Prepared:** 2026-10-04  
> **Decision owner:** Repository owner  
> **Review by / time bound:** None known

## Decision question and scope

**Question:** When an explicit `Adopt` was validly recorded under the consumer's prior applicable process before the Proposal had a Git binding, may ADA establish a later byte-preserving Git binding and continue authorized canonical integration without asking for a second adoption?

This is a narrow compatibility question for already-recorded outcomes. It does not change the normal sequence for new outcomes: commit the exact Proposal before obtaining the owner outcome. It does not validate an outcome that was not valid under the process applicable when it was given, repair a changed or unidentified Proposal, authorize an otherwise unauthorized repository change, or alter optional-export rules.

## Context and classified inputs

- **Existing decision:** ADA's current canonical contract binds a new owner outcome to the exact committed Proposal and requires that Proposal commit before the outcome. Decision [0005](../decisions/0005-canonical-integration-handoff.md) adopts canonical integration as the normal completion handoff; it does not decide how to handle an earlier valid outcome that predates the Git-binding requirement.
- **Review finding:** The current PR review identifies a real contradiction: treating a later commit as though it had been the target of an earlier outcome would retroactively bind that outcome. The reviewer says to block unless the authorized owner explicitly adopts a recovery rule ([PR #70 review comment](https://github.com/flair-agency/architecture-decision-authoring/pull/70#discussion_r4174542302)).
- **Related reported need:** Issue [#65](https://github.com/flair-agency/architecture-decision-authoring/issues/65) concerns owner-outcome recording and Authority Set package finalization. It asks to prepare an authorized Proposal Git binding and resume without needlessly repeating an otherwise clear outcome, while retaining exact Proposal bytes and the binding. That package-finalization request does not itself authorize a retroactive-binding exception for canonical integration; this Proposal asks for that separate owner choice.
- **Existing compatibility boundary:** Decision [0002](../decisions/0002-authority-set-final-outcome.md) keeps the bounded Authority Set as an optional export. Decision [0004](../decisions/0004-bind-proposal-revision-to-committed-bytes.md) requires a real Proposal commit/blob/digest for package validation. Neither decision defines a canonical-integration recovery exception.
- **Assumption to verify per case:** The applicable prior consumer process may have recorded an outcome against an exact, retrievable Proposal content identity even though no Git commit existed. A later commit can establish Git identity for those same bytes; it cannot prove what the owner saw or supply missing authorization.

## Options

| Option | Behavior | Benefits | Costs and limits |
| --- | --- | --- | --- |
| **A. Allow narrowly bounded recovery (proposed)** | Preserve a valid prior `Adopt`; verify its exact Proposal content identity; under consumer authorization, prepare the unchanged bytes, complete required precommit reviews, commit them, read back full Git identity, then continue same-branch canonical integration. | Resolves the legacy sequencing gap without asking an owner to repeat a clear outcome or pretending the later commit existed earlier. | Requires evidence that prior process and exact-content target are valid. It cannot recover missing bytes, an ambiguous target, or missing repository authorization. |
| B. Keep the commit-before-outcome rule absolute | Treat the earlier outcome as historical but insufficient for canonical integration; stop and ask the owner to review/adopt the exact committed Proposal under the current sequence. | Avoids any exception to the present gate. | Repeats owner review even when the earlier outcome was valid and exact; leaves authorized mechanical recovery incomplete. |

## Proposed decision for owner review

The following is a proposal, not adopted authority. **Option A is recommended**, limited to an already-valid prior outcome; the owner may adopt it, amend it with exact wording, defer, or reject it.

> **Narrow recovery of an existing outcome.** This exception applies only when an explicit `Adopt` was recorded under the consumer process applicable at the time, the durable outcome evidence identifies the exact Proposal content, and those exact bytes remain available. With authorization under the consumer's existing repository process, prepare those bytes unchanged, complete the required precommit reviews, commit them, and read back the full commit, repository-relative path, blob, and digest. The later commit establishes the Git binding for the already-identified content; it is not represented as the revision the owner reviewed or as a new owner outcome. Only after the binding and required reviews pass may ADA continue the authorized canonical integration on that branch, preserving the adopted scope, conditions, exceptions, and unrelated canonical content. Record provenance using the consumer's existing process; do not introduce a mandatory schema or evidence-file format. If exact identity, bytes, authorization, access, or required review cannot be verified, stop and report the specific blocker. A missing or inaccessible canonical target is a concrete blocker; a meaning-changing conflict remains an owner decision. The consumer owns PR creation, merge, Gatekeeper selection, and activation. This exception does not change the commit-before-outcome sequence for new decisions or the existing package-export binding and checker.

**日本語案（上記の英語案と同じ提案内容）**

> **既存 outcome の限定的な回復。** この例外は、適用時点の消費者プロセスに従って `Adopt` が明示的に記録され、永続的な outcome 証拠が Proposal の正確な内容を特定し、その同一バイト列を取得できる場合に限る。消費者の既存リポジトリプロセスに基づく権限の下で、そのバイト列を変更せずに準備し、必要な commit 前レビューを完了した後に commit して、完全な commit、リポジトリ相対 path、blob、digest を読み戻す。後から作成した commit は、すでに特定された内容の Git binding を確立するものであり、owner がレビューした revision であった、または新たな owner outcome であるとは扱わない。binding と必要なレビューが確認された後に限り、採択された scope、conditions、exceptions、および無関係な canonical 内容を保持して、同じ branch 上の許可済み canonical integration を続行できる。provenance は消費者の既存プロセスで記録し、必須 schema や evidence-file 形式を新設しない。正確な識別、バイト列、権限、アクセス、または必要なレビューを検証できない場合は停止し、具体的な blocker を報告する。canonical target が見つからない、またはアクセスできない場合は具体的な blocker として報告する。意味を変える conflict は引き続き owner 判断とする。PR 作成・merge、Gatekeeper selection、activation は consumer が担う。この例外は新しい decision の「owner outcome 前に commit」する順序も、既存 package export の binding と checker も変更しない。

## Applicability and stop conditions

The existing outcome record or other durable evidence under the consumer process must explicitly identify the Proposal content being adopted. A commit made later must not be described as the earlier outcome's review target. If evidence only points to a mutable filename, if the exact bytes cannot be recovered, if the prior outcome's authority/scope is unclear, or if the consumer has not authorized the repository preparation/integration, do not invoke Option A. Preserve the earlier record and ask only the targeted question needed to resolve the missing identity, authority, or authorization; do not invent a new general approval layer.

Where Option A applies, preserve the existing checks and distinctions: exact bytes and full Git identity; applicable review before commit; exact outcome scope; canonical target and base; clause mapping; duplicate/conflict handling; semantic review; package export, if separately requested; and consumer-controlled PR, selection, and activation. A package export at a different package path requires its own real binding under the unchanged checker contract.

## Owner decision requested

Should ADA allow Option A's narrowly bounded recovery for a valid, explicitly recorded pre-Git `Adopt`, or should it require a new owner review/outcome against a Proposal committed under the current sequence? If amending Option A, provide exact replacement wording for the eligibility evidence, review order, and whether integration may proceed without a new adoption. No implementation or canonical contract change is authorized by this pending Proposal.

## Source map

- Current canonical endpoint and sequence: [`docs/architecture.md`](../architecture.md), “Output contract” and “Lifecycle and adoption boundary”; [decision 0005](../decisions/0005-canonical-integration-handoff.md).
- Review finding requiring explicit owner authority: [PR #70 review comment 4174542302](https://github.com/flair-agency/architecture-decision-authoring/pull/70#discussion_r4174542302).
- Authorized preparation/resumption problem and acceptance criteria: [ADA issue #65](https://github.com/flair-agency/architecture-decision-authoring/issues/65).
- Existing optional export boundary and package integrity: [decision 0002](../decisions/0002-authority-set-final-outcome.md); [decision 0004](../decisions/0004-bind-proposal-revision-to-committed-bytes.md).
- Release scope context, not decision authority: [ADA issue #69](https://github.com/flair-agency/architecture-decision-authoring/issues/69).
