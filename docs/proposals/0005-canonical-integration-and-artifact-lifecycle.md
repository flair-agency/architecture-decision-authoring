# Architecture Decision Proposal 0005: Canonical integration handoff

> **Document status:** Adopted (owner outcome: Amend)  
> **Prepared:** 2026-10-04  
> **Decision owner:** Repository owner  
> **Review by / time bound:** None known

## Decision question and scope

- **Question:** What is ADA's normal completion endpoint after an explicit owner outcome for one exact architecture decision?
- **Scope:** The ADA Skill handoff for a consumer that has existing canonical authority, and the relationship to the optional Gatekeeper Authority Set export.
- **Applicability:** The owner outcome is bound to the exact Proposal commit/path/blob/digest. The consumer's existing process governs any repository change.
- **Exceptions:** If the canonical target is missing or inaccessible, report the concrete blocker. If a conflict leaves adopted meaning unresolved, ask the authorized owner to resolve that specific conflict. Do not infer a target or meaning.
- **Time bounds:** Adopted 2026-10-04; no expiry known.

## Original reviewed candidate

The owner reviewed the original Proposal bytes identified by SHA-256 `6644ac4c4f5428bcb962098846e6b901f90ec5f21a530e506b646ac5240ef2cc` and supplied the amendment before commit `3db7ab89c75f8f611ad234834dab30203ec7badb` was created. That later commit [preserves the original bytes](https://github.com/flair-agency/architecture-decision-authoring/blob/3db7ab89c75f8f611ad234834dab30203ec7badb/docs/proposals/0005-canonical-integration-and-artifact-lifecycle.md) for historical reference; it was not the revision the owner reviewed or adopted. The original candidate compared detailed file-layout alternatives. Those file-count, layout, and schema recommendations were not adopted. This file records the owner amendment and resulting outcome; it does not rewrite the original review target in Git history.

## Owner-specified amendment

The repository owner supplied this exact replacement endpoint wording:

> Authority fragment/packageを通常の最終成果物としない。既存canonical authorityがある場合は、ProposalをGit commitで固定してowner outcomeを得た後、同じ作業branch上でそのcanonical authorityへ採択内容を統合し、review済みのPR-readyなrepository changeをSkillのhandoff成果物とする。PR作成・merge・selection・activationはconsumer responsibilityとする。AGK Authority Set exportは、canonical authorityを直接選択できない場合等のoptional interoperability pathとして再整理する。

The owner outcome is recorded in [decision record 0005](../decisions/0005-canonical-integration-handoff.md), with the [English canonical rendering](../decisions/0005-canonical-integration-handoff.md#decision) and authorization evidence at [ADA issue #69](https://github.com/flair-agency/architecture-decision-authoring/issues/69#issuecomment-5972202033). The issue comment is the coordinator's transcription of the direct instruction, not independent authentication.

## Adopted outcome

For a consumer with existing canonical authority, the normal Skill path commits the exact Proposal at a repository-relative location selected under the consumer's conventions before the owner outcome. After the explicit outcome, the Skill integrates only the adopted content into that same working branch and hands off a reviewed, PR-ready repository change. The consumer owns PR creation and merge, Gatekeeper selection, and activation.

A Gatekeeper Authority Set export remains an optional interoperability path, including when canonical authority cannot be selected directly. The export retains the existing package integrity requirements and checker. Its package-specific Proposal placement and Git binding do not prescribe the ordinary Proposal path used by the canonical-integration path.

If the target is missing or inaccessible, report that blocker without inventing a target. If conflicting authority leaves adopted meaning unresolved, present the concrete alternatives to the authorized owner. No conflict resolution, PR creation/merge, selection, or activation is inferred.

## Owner outcome and canonical disposition

- **Owner outcome:** Amend
- **Original review target:** Exact Proposal 0005 bytes identified by the SHA-256 recorded above; the owner supplied the amendment before commit `3db7ab89c75f8f611ad234834dab30203ec7badb` later preserved those bytes for history. The amendment is limited to the owner's exact endpoint wording and its faithful English rendering in decision record 0005.
- **Authorized owner/authority:** Repository owner
- **Authorization evidence:** [Explicit owner outcome](https://github.com/flair-agency/architecture-decision-authoring/issues/69#issuecomment-5972202033)
- **Decision date and adopted scope:** 2026-10-04; normal canonical-integration handoff for one exact owner outcome, with Gatekeeper export retained as optional interoperability.
- **Applicability conditions and exceptions:** As stated above and in [decision record 0005](../decisions/0005-canonical-integration-handoff.md).
- **Canonical architecture disposition:** Adopted into [`docs/architecture.md`](../architecture.md) and recorded in [decision record 0005](../decisions/0005-canonical-integration-handoff.md).
- **Downstream artifacts:** None. This product-contract amendment does not itself integrate a consumer decision or create/merge a consumer PR, select Gatekeeper authority, or activate policy.

## Existing contract retained

Decision record [0002](../decisions/0002-authority-set-final-outcome.md) remains the source of the optional package's bounded contents and compatibility contract. Decision record [0004](../decisions/0004-bind-proposal-revision-to-committed-bytes.md) remains in force for package export. This amendment does not introduce a required file count, a new adoption-record schema, or a mandatory owner-evidence transcript.
