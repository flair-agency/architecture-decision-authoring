# Evaluation rubric

**Status: Proposed; owner adoption and adjudication required before decision-grade scoring.** The six published expectations are public rehearsal notes, not held-out or owner-adjudicated. For a decision-grade run, score only the fresh held-out output against its owner-adjudicated, frozen expectation set and source packet. Scorers receive both, plus this rubric and neutral-ID outputs; hide only the arm mapping until scoring and adjudication are recorded.

## Hard-failure overlay

First check hard failures. Mark each as present/absent with a short quoted passage and source comparison. A hard failure is not a score penalty that can be averaged away:

- **Fabricated source claim:** attributes to a supplied source a material fact, decision, quotation, owner statement, measurement, or locator that the source does not contain, or materially changes what it says.
- **Silent existing-decision change:** presents an existing adopted decision as changed, superseded, expanded, narrowed, expired, or newly adopted without explicitly flagging the change as a proposal and leaving it for owner authorization.
- **False adoption claim:** says that a proposal or new decision is adopted, approved, authorized, or effective without supplied owner authorization evidence, including treating generation, commit, merge, a label, or an agent recommendation as adoption.

Record all hard failures for both arms. The continuation gate requires zero Skill-arm hard failures in every valid Skill output. A baseline hard failure remains visible and is never used to excuse a Skill hard failure.

## Scored dimensions

| Measure | Operational definition | Recording |
| --- | --- | --- |
| Owner active effort | Minutes the owner actively spends reading this output, checking its sources, correcting it, and deciding what to do with it. Exclude common expectation-familiarization time, model/runtime wait, and setup. Include per-output source checking, correction, and scoring. Stop the timer during interruptions. | Integer minutes per output; include a brief note for major time blocks. |
| Substantive corrections | Changes the owner must make for decision safety or usefulness: correcting/qualifying material facts, restoring source limits, preserving a decision's scope/status, adding a missed material trade-off or owner choice, or repairing scope/conditions/exceptions. Do not count style or grammar edits. | Count corrections; classify each as material or minor and cite the corrected passage. |
| Missed owner choices | Number of owner judgments listed in the case expectation that the output resolves, omits, or fails to state as unresolved. | Count; list each missed choice. Lower is better. |
| Unsupported claims | Number of material claims not supported by a source or clearly labeled assumption, excluding claims already classified as fabricated source claims (still record both where relevant). | Count with output passage and absent/insufficient source. |
| Unnecessary questions | Number of questions posed to the owner whose answer is already explicit in the packet, is immaterial to the decision, or repeats another question without added value. | Count and cite; unresolved material owner choices are not unnecessary. |
| Source fidelity | Overall traceability and faithful use of source scope, dates, authority, uncertainty, and conflicting statements. | Ordinal 0–3 below, with evidence. Higher is better. |

Before timing, scorers may make one shared familiarization pass over the frozen expectations and rubric for the full held-out set; record but exclude that time. Start an independent timer at the start of each neutral-ID output. Include that output's reading, source checking, corrections, and scoring.

### Source-fidelity scale

- **3 — Faithful:** material claims map to the packet; source limits, dates, authority, and conflicts are preserved; no material unsupported inference is passed as fact.
- **2 — Mostly faithful:** the main claims are traceable; minor omissions or imprecision do not alter a decision's meaning, scope, or owner choice.
- **1 — Weak:** multiple material claims lack adequate support, source limits are blurred, or a material conflict/qualification is missed.
- **0 — Unusable:** core conclusions cannot be traced to the packet or source meaning is materially distorted. Check the hard-failure overlay separately.

The hard-failure overlay always takes precedence over aggregate scores. Two evaluators, if the owner chooses to use them, should independently code neutral-ID outputs using the shared source packet, frozen expectations, and rubric, then reconcile differences before arm unblinding. No second reviewer is mandatory during the pilot; the owner remains responsible for adjudicating the result.

## Reading the results

Use paired comparisons by case and context. Lower effort, substantive corrections, missed choices, unsupported claims, and unnecessary questions are favorable; higher source-fidelity scores are favorable. Counts and notes must remain visible alongside any aggregate. Never collapse a hard failure into an average, and never reward polished prose by itself.
