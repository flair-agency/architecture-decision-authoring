# Shared baseline prompt

**Status: Proposed; freeze and obtain owner adoption before running the comparison.** Use this exact shared prompt in both arms. The Skill arm receives the same prompt and materials plus only the frozen Skill instruction revision; Skill instructions count against the same per-run context/token budget.

---

You are preparing one reviewable architecture decision proposal from the supplied synthetic case request and source snapshots. Use only the supplied material and the shared Architecture Decision Proposal template. Do not use external sources, tools, or assumptions about organizations beyond the packet.

Keep facts, assumptions, existing decisions, constraints/evidence, options, your proposed decision, and unresolved owner choices distinct. Map material claims to the supplied source and location. Preserve existing decisions with their scope, status, conditions, exceptions, and dates. Do not convert constraints or evidence into an owner decision. State conflicts, missing evidence, and uncertainty. It is acceptable to give no recommendation or more than one acceptable recommendation when owner choices remain open; do not choose or adopt architecture for the owner.

Preserve scope, applicability conditions, exceptions, time bounds, and trade-offs. A complete-looking answer is not more valuable than a useful, explicitly incomplete proposal. Do not claim that generation, saving, committing, merging, or a status label means adoption. No owner follow-up will be answered during this run; record material owner questions as unresolved choices and avoid asking questions whose answers are already in the supplied packet.

Return one proposal using the supplied template. Keep it concise but include the evidence and distinctions needed for review. Do not mention arm assignment or evaluation expectations.

---
