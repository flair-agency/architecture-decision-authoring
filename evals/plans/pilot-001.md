# Pilot 001 — proposed Phase A run plan

**Document status:** Proposed; owner outcome Pending.  
**Phase A status:** Proposed; not Frozen.  
**Phase B status:** Not started. No held-out cases or expectations are included or created by this proposal.

This is a concrete proposal for owner review, not an authorization. Filling this document, committing or merging it, or changing a status label does not adopt or freeze it. Only an explicit owner outcome with evidence for this exact target revision can do so. The adopted product contract is normative. The proposed evaluation protocol and rubric are the governing references used to prepare this proposal, but remain subject to owner adoption before any decision-grade run; this plan does not weaken them. See the [plan index](README.md), [protocol](../protocol.md), [rubric](../rubric.md), and [Issue #5 diagnostic review](../../reviews/issue-5/README.md).

## Proposed immutable artifact identities

These identities define the candidate and shared artifacts proposed for Phase A. Adopted identity must be rechecked against the actual artifacts and recorded as an immutable revision/digest when the owner acts.

| Artifact | Proposed identity | Evidence / use |
| --- | --- | --- |
| Base repository revision | `main` commit `fc39b5b85a9744c300514f993a99352fe1d235f4` | Proposed base from current `main`; record exact adopted revision. |
| Skill candidate | Commit `137ef346c06cad0d75ef77b4537b42fb6fafc3c3`; SHA-256 `a8703a377e7a1244001e45d90863623e0d248c5dc74a87715c8cb1331ffd4b4a` | `skills/architecture-decision-authoring/SKILL.md`; matches the Issue #5 diagnostic candidate. |
| Shared proposal template | SHA-256 `34bf6d7166c972ae46b55b7de8c0f8ebf0d90a9e276f4a5be6c502dc23f076e1` | `docs/templates/architecture-decision-proposal.md`; identical to bundled copy at the reviewed candidate. |
| Shared baseline prompt | SHA-256 `9ad839aa0db088506ba155d6e631f8cc40ae1327aa7d43a1370ee95b8add206e` | `evals/baseline-prompt.md`; supply only the prompt body bounded by its opening and closing `---` delimiters. Exclude the title/status metadata and delimiters themselves. Use identical extracted body in both arms. |
| Protocol | SHA-256 `9c5fce2c5c85de6d1fb12d4503d2069c6b09e160f5bb3188bcee9f3d4156aaf0` | `evals/protocol.md`; proposed protocol revision read for this plan. |
| Rubric | SHA-256 `821ca0f54a9ecabc7f07cb527004a03d2dba7637ef64876c3cf83e467c2d98d1` | `evals/rubric.md`; proposed rubric revision read for this plan. |

Changing any adopted artifact identity or material condition follows the protocol's supersession path. Do not silently update a run in place.

## Proposed matched run conditions

- **Model/configuration:** `gpt-6-astra`, reasoning `high`, as a proposed starting configuration. Provider identity, backend model revision, and sampling-setting support remain unverified.
- **Runtime:** Codex CLI `0.153.2`, using isolated ephemeral sessions and `--ignore-user-config`; read-only mode; network and tools disabled.
- **Interaction:** one case request and one assistant response per fresh session; no follow-up turns or cross-run context.
- **Shared materials:** provide the same case request, source snapshot bundle, shared prompt body, and proposal template once in each arm. Use the same repository-relative paths and contents. Do not duplicate the template or shared materials. The Skill arm receives only the frozen Skill instructions as its intended difference; those instructions count within the same context and output budgets.
- **Generation sources:** held-out request and `input/` snapshots only. Do not provide `expected.md`, rehearsal expectations, this plan, rubric, case inventory, evaluator notes, or owner evaluation notes to either generation arm.
- **Other controls:** no external sources, network, or additional tools. Preserve outputs and logs needed to establish protocol compliance without placing them in the model context.

### Feasibility gate — unresolved before Phase A Adopt

The following are not established by the current evidence and must not be assumed: actual provider identity; exact backend model revision; hidden platform/system instructions; enforceable context and output caps; whether requested sampling settings are supported and applied; and whether CLI controls actually enforce the stated isolation, read-only, network, and tool behavior for this setup.

Proposed starting targets, pending a **non-case transport smoke check** before any held-out case creation:

- assembled visible input no greater than 16,384 tokens per arm, including shared materials and Skill instructions where applicable;
- generation cap of 8,192 tokens only if supported and verifiably applied by the provider/runtime;
- exact requested model/settings and no tools/network, confirmed from available metadata and observed behavior.

The smoke check must use no evaluation or rehearsal case, source packet, or expected answer. It must verify prompt-body extraction and delivery, one-time shared-material inclusion, model/settings metadata, input/output cap semantics, tool/network behavior, and the effective instructions/configuration exposed to the run. If limits cannot be enforced or verified, or settings/metadata are unavailable, stop before Phase A Adopt and ask the owner to resolve or explicitly revise the proposal. Do not compensate by silently increasing budgets or weakening the protocol. Record the smoke-check artifact/evidence and outcome in the owner decision record.

## Proposed decision rule for the initial 12 outputs

The initial comparison is six held-out cases × two arms × one run = 12 outputs. **Continue to the next scoped investment only if every condition below is met:**

1. No Skill-arm hard failure occurs.
2. At least 3 of 6 paired cases have at least one fewer material substantive correction in the Skill output than baseline.
3. Those improvements span both product contexts.
4. In no case does the Skill arm exceed baseline on material substantive corrections, missed owner choices, or unsupported claims.
5. In every case, Skill source fidelity is at least baseline and at least 2 on the rubric's 0–3 scale.
6. Total unnecessary questions in the Skill arm do not exceed baseline.
7. Rounded total Skill owner-active effort is no more than rounded total baseline owner-active effort plus 5 minutes.
8. Every required measure is recorded; any missing required measurement means the result cannot be Continue.

### Decision precedence and recommendations

Apply these outcomes in order; they are recommendations for the owner's final decision, not automatic decisions:

1. **Stop** recommendation if a Skill hard failure is observed on a valid run. Preserve the finding. Remaining already-planned runs may continue for learning only while all frozen controls remain intact and the owner-authorized plan permits continuation; this can never restore Continue eligibility or rewrite the initial result.
2. Otherwise, if comparison validity, completeness, or any required measurement is insufficient, recommend **Incomplete/Inconclusive**. Do not reach Simplify or Continue from insufficient evidence. Preserve the reason and any valid observations.
3. Only a complete, valid comparison with all required measurements may reach **Continue** if every criterion above is met. If complete and valid but one or more criteria are unmet and no valid Skill hard failure basis exists, recommend **Simplify**.

A failed control run is handled under invalid-run rules, not scored as a product failure. A hard failure is any rubric overlay failure, including fabricated source claims, silent existing-decision change, or false adoption; the proposed P3 deferral below does not waive, downgrade, or suppress any hard-failure category.

## Proposed additional-run policy

- Preplanned paired additional runs: **None; cap 0.**
- Do not add post-results replications to the initial result. Any later diagnostic is reported separately and cannot rewrite it.

## Proposed ordering and blinding

Create fresh held-out cases only after Phase A is Frozen by explicit owner Adopt. Use the following fixed case-matrix slot order; it balances which arm goes first within each product context and within each decision type, with three baseline-first and three Skill-first pairs overall. This mixes order but does not eliminate order effects statistically. Do not execute any evaluation run until Phase B has been owner-adjudicated and Frozen by explicit owner Adopt:

1. Context A — new decision — baseline-first
2. Context B — new decision — Skill-first
3. Context B — revision — baseline-first
4. Context A — revision — Skill-first
5. Context A — conflict/incomplete — baseline-first
6. Context B — conflict/incomplete — Skill-first

For each case, run the paired arms consecutively in the stated order. Do not update model, prompts, Skill, template, or runtime configuration during the set; any necessary material change invokes the protocol supersession path.

Assign neutral random IDs per paired case. Keep the arm-to-ID mapping in a separate record. A named custodian is unresolved; the owner must identify the coordinator/custodian and secure context before Phase A adoption. Balance owner scoring order across arms and cases using the neutral IDs. Disclose mapping only after scoring and adjudication are recorded. Scorers log any guessed arm assignment; a guess alone is not an invalid run.

## Proposed invalid-run and replacement handling

- If either arm in a paired block is invalid due to a protocol/control failure, preserve both original runs and perform at most one replacement paired block for that case under the same frozen conditions.
- Preserve each invalid/partial output and reason; never overwrite it. If a replacement block is also invalid, mark that pair missing and the overall result incomplete/inconclusive; it cannot qualify as Continue.
- A poor answer, hard failure, or ordinary model truncation under the frozen cap is not invalid. Score it as observed; do not rerun to improve the result.
- Stop further generation if widespread expected-judgment leakage or other systemic control failure is detected. Preserve records, mark affected runs invalid, and report the evaluation as incomplete; do not silently restart under altered conditions.

## Proposed owner-active-effort measurement

Measure per-output active time spent reading the proposal, checking its sources, identifying required corrections, and scoring the rubric. Exclude common expectation familiarization, setup, provider/runtime waiting, and breaks. Preserve raw interval notes; sum unrounded intervals separately for each arm, then round each arm's total to the nearest minute for the decision rule. Do not sum rounded per-output display values. List required corrections with output locations, but do not create repaired proposals. Apply the same method to both arms. This is an evaluation measure, not production authoring time. Missing an output's required effort or correction record prevents Continue.

## Owner decisions still required — no adoption implied

- Adopt, Amend, Defer, or Reject this exact proposed Phase A target; if Amending, identify a revised target and then make a subsequent explicit Adopt decision before it is Frozen.
- Resolve the feasibility gate, including actual provider/runtime/model metadata, hidden-instruction visibility, enforceable context/output limits, supported settings, and smoke-check evidence.
- Name the mapping custodian and secure location, and identify the authorized owner/evidence record.
- Confirm the P3 deferral below and whether the fixed conditions, decision threshold, ordering, invalid-run, and owner-effort rules are acceptable.
- If Phase A is adopted, record its exact immutable revision, owner outcome, date/time, and authorization evidence. Only then may independent Phase B case creation begin. Phase B remains Not started until fresh case/input identities and owner-adjudicated expectations are separately frozen.

### P3 classification ambiguity — proposed deferral

The Issue #5 diagnostic review identified a nonblocking P3 ambiguity: some reported operational rules were classified as “Existing decisions” although their source authority/adoption was not established. Proposed disposition: defer changing the candidate Skill's classification behavior for this limited pilot and preserve the finding in the review record. This deferral applies only to candidate-change scope; it does not defer, alter, or waive the rubric. Every held-out output is scored normally, and any fabricated source claim, silent existing-decision change, or false adoption remains a hard failure. This deferral is proposed only; the owner must confirm it. The diagnostic review itself remains public/exposed and is not held-out evaluation evidence.
