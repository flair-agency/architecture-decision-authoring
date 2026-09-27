# Documentation

This directory contains design materials for a project that is still in the design and pre-pilot phase. It includes the adopted initial pilot contract and decision record, as well as proposals and guidance that do not by themselves establish adopted decisions.

- [Product and artifact contract](architecture.md) — adopted initial pilot purpose, responsibility boundary, input classification, outputs, lifecycle, and downstream boundary; reassess after the comparative pilot.
- [Architecture Decision Proposal template](templates/architecture-decision-proposal.md) — Markdown-first, source-mapped starting point; mark missing information instead of inventing it.
- [Decision records](decisions/README.md) — record guidance and status meanings.
- [Proposed comparative pilot protocol](../evals/protocol.md) — public cases are rehearsal-only; Issue #3 remains open pending owner-adjudicated held-out expectations and a frozen [run plan](../evals/run-plan-template.md).
- [Architecture Decision Authoring Skill prototype](../skills/architecture-decision-authoring/SKILL.md) — reviewable instruction prototype; its [bundled proposal template](../skills/architecture-decision-authoring/assets/architecture-decision-proposal.md) is a distribution copy of the canonical [docs template](templates/architecture-decision-proposal.md). A [curated walkthrough](../examples/bounded-decision/run-record.md) illustrates use but is not an evaluation.

Use `decisions/` for decision records. A status such as proposed, adopted, or superseded is descriptive metadata, not authentication of who approved a decision. This repository's bootstrap adoption rule is documented in [decisions/README.md](decisions/README.md). Generation, commit, merge, and a status label alone do not imply adoption.

Third-party material must retain its original license and attribution notices.
