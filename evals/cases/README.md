# Synthetic case inventory

**Status: Proposed; expectations are not owner-adjudicated.** Each case directory contains a bounded generation packet under `input/` and a separate `expected.md`. The expectation file is evaluator-only and must never enter a generation bundle, prompt, model context, or Skill source. Before a decision-grade run, the owner must review, adjudicate, and freeze each expectation file.

All contexts, people/roles, decisions, documents, dates, constraints, and metrics below are fictional and created for this evaluation. They are not derived from external sources or real organization data. No case requires one mandatory architecture recommendation.

| Context | Case | Pattern | What it probes |
| --- | --- | --- | --- |
| Cedar Cart | [cedar-cart-new](cedar-cart-new/) | New decision | Separate an open catalog-search boundary question from known transactional constraints. |
| Cedar Cart | [cedar-cart-revision](cedar-cart-revision/) | Revision | Preserve a scoped adopted deployment/checkout decision while assessing new read-load evidence. |
| Cedar Cart | [cedar-cart-conflict-incomplete](cedar-cart-conflict-incomplete/) | Conflict/incomplete | Surface incompatible freshness statements and unresolved authority. |
| Juniper Field Notes | [juniper-field-notes-new](juniper-field-notes-new/) | New decision | Compare options for offline drafts while identifying unresolved synchronization choices. |
| Juniper Field Notes | [juniper-field-notes-revision](juniper-field-notes-revision/) | Revision | Preserve an adopted correction rule while considering a requested amendment. |
| Juniper Field Notes | [juniper-field-notes-conflict-incomplete](juniper-field-notes-conflict-incomplete/) | Conflict/incomplete | Distinguish an adopted retention decision from a conflicting unsigned note. |

`input/` is the only case-specific source bundle. The shared template and baseline prompt live outside the case folders. Build generation bundles from `input/` only; exclude every `expected.md` and this inventory. Hash inputs and record exact revisions before a run, as specified in [the protocol](../protocol.md).
