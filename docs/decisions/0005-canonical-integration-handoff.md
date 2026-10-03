# Make canonical integration the normal completion handoff

- **Status:** Adopted
- **Decision date:** 2026-10-04
- **Decision owner:** Repository owner
- **Outcome:** Amend the product endpoint proposed in Proposal 0005
- **Authorization evidence:** [Explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/issues/69#issuecomment-5972202033)
- **Target:** [`docs/architecture.md`](../architecture.md), product endpoint and lifecycle
- **Original Proposal review target:** Exact Proposal bytes with SHA-256 `6644ac4c4f5428bcb962098846e6b901f90ec5f21a530e506b646ac5240ef2cc`; the owner supplied the amendment before commit `3db7ab89c75f8f611ad234834dab30203ec7badb` was created. That later commit [preserves those original bytes for history](https://github.com/flair-agency/architecture-decision-authoring/blob/3db7ab89c75f8f611ad234834dab30203ec7badb/docs/proposals/0005-canonical-integration-and-artifact-lifecycle.md); it was not the revision reviewed or adopted.
- **Current amended outcome record:** [`docs/proposals/0005-canonical-integration-and-artifact-lifecycle.md`](../proposals/0005-canonical-integration-and-artifact-lifecycle.md)

## Owner-specified amendment

The repository owner supplied this exact replacement endpoint wording in response to the identified Proposal revision:

> Authority fragment/packageを通常の最終成果物としない。既存canonical authorityがある場合は、ProposalをGit commitで固定してowner outcomeを得た後、同じ作業branch上でそのcanonical authorityへ採択内容を統合し、review済みのPR-readyなrepository changeをSkillのhandoff成果物とする。PR作成・merge・selection・activationはconsumer responsibilityとする。AGK Authority Set exportは、canonical authorityを直接選択できない場合等のoptional interoperability pathとして再整理する。

The owner supplied the wording in Japanese; the English canonical wording below preserves its sequence and responsibility boundaries. The cited issue comment is the coordinator's transcription of the direct owner instruction, not independent authentication evidence.

## Decision

Amend the normal completion endpoint as follows:

1. When the consumer has an existing canonical authority, commit the exact Proposal before obtaining the owner outcome at a repository-relative path chosen under the consumer's existing conventions. Record the full commit, path, blob, and digest.
2. After the explicit owner outcome, integrate only the adopted content into the same working branch. Hand off a reviewed, PR-ready repository change as the Skill's completion artifact.
3. The consumer owns PR creation and merge, Gatekeeper selection, and activation. The handoff does not perform these actions or imply their completion.
4. Keep Gatekeeper Authority Set export as an optional interoperability path, including when the consumer cannot select its canonical authority directly. Preserve the existing package integrity requirements and checker.
5. If the canonical target is missing or inaccessible, report that concrete blocker and do not infer a target. If conflicting authority leaves adopted meaning unresolved, present the concrete alternatives to the authorized owner and do not infer a resolution.

Faithful English rendering adopted into `docs/architecture.md`:

> Authority fragments and packages are not the normal final product. When a consumer has existing canonical authority, the Skill commits the Proposal to Git at a repository-relative path chosen under the consumer's existing conventions before the owner outcome, then integrates the adopted content into that canonical authority on the same working branch. The Skill's handoff is the reviewed, PR-ready repository change. Creating or merging a PR, selecting authority, and activating policy remain the consumer's responsibility. A Gatekeeper Authority Set export is an optional interoperability path, including when canonical authority cannot be selected directly.

## Scope and relationship to prior decisions

This decision adopts the endpoint amendment only. It does not adopt Proposal 0005's suggested file-count/layout details or require a new outcome schema, owner-evidence transcript, integration-record format, or fixed number of durable files. Use the existing Proposal and adoption-record requirements; preserve exact bytes, provenance, owner outcome, and the existing checker. For the normal path, the Proposal commit uses the consumer's existing repository path conventions; `proposal.md` at the package placement path and checker constraints apply only to optional export. If an export requires a separately placed Proposal, its required Git binding must be prepared as separately authorized work. Record consumer integration through its reviewed repository change and references available under that consumer's process.

Decision record [0002](0002-authority-set-final-outcome.md) remains historical and its package contract remains valid for optional export. Decision record [0004](0004-bind-proposal-revision-to-committed-bytes.md) remains in force. This amendment changes the normal endpoint and sequencing; it does not weaken Proposal binding, infer owner adoption, or activate downstream policy.

## Consequences and limits

- ADA's normal handoff for an existing canonical authority is a reviewed integration on the Proposal's working branch, after the owner outcome.
- The owner outcome remains bound to the exact Proposal commit and path. Branch preparation alone is not an owner outcome.
- The consumer's PR workflow and subsequent canonical readback are separate from the Skill handoff. PR creation, merge, selection, and activation are not claimed.
- The optional export remains available under its existing package and validation contract. No Gatekeeper runtime dependency is added.
- This decision is limited to one exact owner-adopted decision and the identified consumer canonical authority. It does not authorize bulk discovery, arbitrary policy edits, or invented conflict resolution.

## Source mapping

- Owner-specified endpoint amendment and authorization: [ADA issue #69 owner comment](https://github.com/flair-agency/architecture-decision-authoring/issues/69#issuecomment-5972202033).
- Original review target: exact Proposal content identified by SHA-256 `6644ac4c4f5428bcb962098846e6b901f90ec5f21a530e506b646ac5240ef2cc`; the [commit `3db7ab89c75f8f611ad234834dab30203ec7badb`](https://github.com/flair-agency/architecture-decision-authoring/blob/3db7ab89c75f8f611ad234834dab30203ec7badb/docs/proposals/0005-canonical-integration-and-artifact-lifecycle.md) is a later historical preservation of those bytes, not the reviewed/adopted revision. See the [current amended outcome record](../proposals/0005-canonical-integration-and-artifact-lifecycle.md).
- Prior optional package endpoint and owner boundary: [decision record 0002](0002-authority-set-final-outcome.md) and [current adoption record contract](0003-pending-adoption-record.md).
- Proposal Git/blob/digest requirement: [decision record 0004](0004-bind-proposal-revision-to-committed-bytes.md).

The canonical text is an English rendering of the owner's Japanese instruction. The owner chose the endpoint, sequence, and responsibility boundaries; implementation details not stated in the instruction remain governed by existing authority or unresolved until evidence or an owner choice is available.
