# Documentation

This directory contains design materials for a project that is still in the design and pre-pilot phase. It includes the adopted initial pilot contract and decision record, as well as proposals and guidance that do not by themselves establish adopted decisions.

- [Product and artifact contract](architecture.md) — adopted initial pilot purpose, responsibility boundary, input classification, outputs, lifecycle, and downstream boundary; reassess after the comparative pilot.
- [Architecture Decision Proposal template](templates/architecture-decision-proposal.md) — Markdown-first, source-mapped starting point; mark missing information instead of inventing it.
- [Non-normative design views](design-views.md) — explanatory responsibility, concept/artifact, and lifecycle diagrams derived from the adopted contract in `architecture.md`.
- [Decision records](decisions/README.md) — record guidance and status meanings.
- [Proposal to make a Gatekeeper-compatible Authority Set the final product outcome](proposals/0002-authority-set-final-outcome.md) — proposed amendment to the initial product endpoint; does not change the current adopted contract.
- [Proposed comparative pilot protocol](../evals/protocol.md) — public cases are rehearsal-only; Issue #3 remains open pending Phase A and Phase B freeze records and owner-adjudicated held-out expectations in the [run plan](../evals/run-plan-template.md).
- [Pilot 001 Phase A proposal](../evals/plans/pilot-001.md) — concrete proposed conditions for owner review; not adopted or frozen, with Phase B not started.
- [Architecture Decision Authoring Skill prototype](../skills/architecture-decision-authoring/SKILL.md) — reviewable instruction prototype; its [bundled proposal template](../skills/architecture-decision-authoring/assets/architecture-decision-proposal.md) is a distribution copy of the canonical [docs template](templates/architecture-decision-proposal.md). A [curated walkthrough](../examples/bounded-decision/run-record.md) illustrates use but is not an evaluation.
- [Issue #5 diagnostic review](../reviews/issue-5/README.md) — evidence and findings for the exact candidate; all diagnostic material is public/exposed and is not held-out pilot data.
- [Manual Architecture Gatekeeper dogfood](gatekeeper-manual-dogfood.md) — optional, local development feedback only; not an acceptance or adoption mechanism.
- [Optional Architecture Gatekeeper CI observation](gatekeeper-observation-ci.md) — non-required PR feedback under a pinned Gatekeeper workflow; not merge acceptance or adoption.
- [Gatekeeper CI observation log](gatekeeper-observation-log.md) — diagnostic run metadata, including the skipped bootstrap attempt; not acceptance or adoption evidence.
- [Issue #7 manual Gatekeeper dogfood](../reviews/issue-7/README.md) — includes an incomplete initial attempt and a separate validated native Skill E2E; both are diagnostic only, not acceptance or adoption.

Use `decisions/` for decision records. A status such as proposed, adopted, or superseded is descriptive metadata, not authentication of who approved a decision. This repository's bootstrap adoption rule is documented in [decisions/README.md](decisions/README.md). Generation, commit, merge, and a status label alone do not imply adoption.

Third-party material must retain its original license and attribution notices.
