# Synthetic case inventory

**Status: Proposed. These six published cases are public development/rehearsal material only, not held-out.** Their `expected.md` files are visible and not owner-adjudicated. Outputs from this set cannot serve as an independent comparison, regardless of the number of runs. Each case directory contains a bounded generation packet under `input/` and a separate evaluator-only `expected.md`; keep it out of every generation bundle, prompt, model context, and Skill source.

All contexts, people/roles, decisions, documents, dates, constraints, and metrics below are fictional and created for this evaluation. They are not derived from external sources or real organization data. No case requires one mandatory architecture recommendation.

| Context | Case | Pattern | What it probes |
| --- | --- | --- | --- |
| Cedar Cart | [cedar-cart-new](cedar-cart-new/) | New decision | Separate an open catalog-search boundary question from known transactional constraints. |
| Cedar Cart | [cedar-cart-revision](cedar-cart-revision/) | Revision | Preserve a scoped adopted deployment/checkout decision while assessing new read-load evidence. |
| Cedar Cart | [cedar-cart-conflict-incomplete](cedar-cart-conflict-incomplete/) | Conflict/incomplete | Surface incompatible freshness statements and unresolved authority. |
| Juniper Field Notes | [juniper-field-notes-new](juniper-field-notes-new/) | New decision | Compare options for offline drafts while identifying unresolved synchronization choices. |
| Juniper Field Notes | [juniper-field-notes-revision](juniper-field-notes-revision/) | Revision | Preserve an adopted correction rule while considering a requested amendment. |
| Juniper Field Notes | [juniper-field-notes-conflict-incomplete](juniper-field-notes-conflict-incomplete/) | Conflict/incomplete | Distinguish an adopted retention decision from a conflicting unsigned note. |

`input/` is the only case-specific source bundle. The shared template and baseline prompt live outside the case folders. Build generation bundles from `input/` only; exclude every `expected.md` and this inventory. Identify the exact materials used for any rehearsal. Decision-grade evaluation requires a materially fresh held-out set created after candidate freeze in an independent work context, as specified in [the protocol](../protocol.md).
