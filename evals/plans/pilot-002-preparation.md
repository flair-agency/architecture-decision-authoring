# Pilot 002 — current-Skill evaluation preparation

**Status: Proposed preparation, not an adopted or generation-ready Phase A.** Phase B has not started. No held-out cases, expectations, model outputs or owner observations are created by this plan. The original [Pilot 001](pilot-001.md), [transport evidence](pilot-001-transport-smoke.md), proposed [protocol](../protocol.md) and [rubric](../rubric.md) remain unchanged. This document does not supersede or weaken their conditions.

## Purpose and current gap

Prepare useful evidence about the current Skill's Proposal authoring and owner interaction before another capability investment. #3 owns evaluation design; #6 owns comparative execution and the continuation decision. #59 remains exploratory multi-point discussion work, not authority for independent per-point outcomes or partial adoption. Gatekeeper availability, CI enforcement and release publication are not evaluation prerequisites.

Pilot 001 targets a historical Skill and template, CLI 0.153.2, and a single request/response. Current published v0.6.0 adds progressive briefs, source-grounded explanations, exact amendment drafts, outcome targeting, canonical integration, resumption and bounded repository intake. A one-turn Proposal comparison can measure its output usefulness; it cannot establish the value of the subsequent conversation or consumer activation. Those claims need separate observations.

Use two preparation tracks before a decision-grade held-out comparison:

| Track | Ready work and evidence | Limit |
| --- | --- | --- |
| Public paired rehearsal | Prepare and later run one exposed revision case under the same observable configuration; preserve both outputs, assembly identities, deviations and all failures. | Diagnostic only; no held-out threshold or comparative-effectiveness claim. |
| Actual-owner conversation observation | Use the public case and current Skill to observe comprehension, questions, requested amendments and fresh-context resumption. Record the human's actual corrections and active effort. | Exploratory interaction evidence; not owner adoption, general effectiveness or a substitute for frozen Phase A/B. |

Preparation is authorized by the active task and the existing [#3 sequencing note](https://github.com/flair-agency/architecture-decision-authoring/issues/3#issuecomment-5883353994). This does not authorize generation of held-out cases. No generation or owner session has been performed by this update.

## Current proposed artifact identities

Use published source `4421e05b48b67963bc95ecb2c86590fd4c1a0252` (v0.6.0) as the current candidate. PR #77's checker fix is separate and is not silently added to this candidate; the Proposal-only comparison does not invoke that checker.

| Artifact at that source | SHA-256 |
| --- | --- |
| `skills/architecture-decision-authoring/SKILL.md` | `8d9d44a44132b0fddc429e5ff5db4cce74ffe814ece1ab3c1f5114cdb1c64508` |
| `docs/templates/architecture-decision-proposal.md` | `c6769f26d3cac800cecb2d5bcd97b7efc1f8cd2d52f6d71b76efde6908bc51e5` |
| `evals/baseline-prompt.md` | `9ad839aa0db088506ba155d6e631f8cc40ae1327aa7d43a1370ee95b8add206e` |
| `evals/protocol.md` | `9c5fce2c5c85de6d1fb12d4503d2069c6b09e160f5bb3188bcee9f3d4156aaf0` |
| `evals/rubric.md` | `821ca0f54a9ecabc7f07cb527004a03d2dba7637ef64876c3cf83e467c2d98d1` |

Preserve Pilot 001's identities as history. Before an eventual Phase A outcome, identify the exact final plan and all generation artifacts by commit/path/digest or the existing process's immutable content identities. A candidate or material-condition change requires the protocol's supersession path; it cannot be slipped into a frozen run.

## Public rehearsal that can be prepared now

Use only the already public `evals/cases/cedar-cart-revision/input/` packet: `request.md`, `adopted-decision.md`, `current-context.md` and `load-test-note.md`. It covers revision of one decision while preserving an existing decision's scope and source limitations. This is an exposed fictional case, not newly created or held-out material. Do not read its `expected.md` while assembling generation inputs.

Prepare two exact UTF-8 input bundles. Both contain the baseline prompt body between the two standalone `---` delimiters, the same four input snapshots with exact source paths, and the canonical template exactly once. The Skill bundle adds the identified Skill instructions exactly once. Do not include protocol/rubric/plan text, expectations, scorer notes, earlier outputs or owner observations in either bundle. Keep bundling instructions and metadata out of the generation body unless shared identically and counted within its visible input. Check actual bytes and hashes before dispatch.

Proposed configuration for later rehearsal: CLI 0.159.3, `gpt-6.1-sol` / `xhigh`, fresh ephemeral sessions, ignored user configuration and rules, empty working directories, read-only sandbox, no model tools/search/apps/plugins/subagents, one shared case request and one response. The model/effort target is proposed, not evidence of an authoring run. Read back accepted settings and event metadata from a non-case smoke before using it. API transport necessarily uses network; model browsing/tool access is a separate control. Do not claim complete egress isolation.

Use the same accepted configuration and observable budgets in both arms, with the Skill instructions as the only intended arm difference. Record visible input bytes separately from tokens and total runtime context. Do not infer a token count or provider hard cap from byte size. Preserve raw overlength/truncated outputs; do not clip or rerun a poor answer into a success. If limits or effective settings cannot be verified, describe that as a rehearsal limitation and do not promote the pair to decision-grade evidence.

Predefine baseline-first for this single rehearsal pair. Show neutral output IDs to the owner until their initial assessment is recorded, and keep the mapping with the execution coordinator in a private, uncommitted task directory. One case cannot balance order or establish successful blinding; record guessed arm identity and carry-over familiarity. No replacement is planned for poor model behavior. Preserve control failures; a repaired transport diagnostic is separate, not a rewritten original.

The rehearsal checks assembly, supported controls, source fidelity and the scoring procedure. It does not measure repository intake, optional export compatibility, real canonical integration or activation. Existing release evidence for those features remains separate.

## What the actual owner must observe

Use the [observation procedure](pilot-002-owner-observation.md). Capture the actual human's reading/source-checking effort, material corrections, missed choices, unsupported claims, unnecessary questions and source-fidelity assessment. For interaction, additionally record whether the brief, source answer, exact draft diff and resumed state let the human identify the active question, revision, scope and next action. These are observations, not a new product status or workflow schema.

The owner chooses their own material question and desired amendment. Do not invent their reaction, prefill a favorable score, script a substantive preference or use a model reviewer as a substitute. A human interacting with fictional source material is a real observation of that interaction, not real adoption of fictional architecture. Store observations privately by default; publishing a transcript is separate authorized work. No actual-owner effort, correction count or session date is known yet.

## Decision-grade Phase A remains blocked

Current local checks on 2026-10-04 observed CLI 0.159.3 and its documented ephemeral/configuration controls. A strict-config attempt with `model_max_output_tokens=8192` failed before model dispatch: `unknown configuration field`. This establishes rejection of that setting, not the absence of every possible output-cap mechanism. No successful non-case transport smoke or authoring run was performed. Exact backend revision, complete effective instructions/tools, enforceable context/output caps and broad network isolation remain unverified.

The [CLI preflight record and minimum rehearsal procedure](pilot-002-cli-preflight.md) retain the exact non-generating command, version, error, input assembly checks and the proposed three-call sequence. A procedure is not evidence that its model calls ran. New paid API use or authentication is not part of this preparation.

Keep the original 16,384-token context and 8,192-token hard output targets **proposed and unsatisfied**. Before Phase A adoption, perform a non-case smoke with no evaluation/rehearsal packet or expectations, verify the current plan's controls and archive safe metadata. If the host still cannot meet them, preserve the blocker. Do not claim ignored user configuration removes all platform instructions, substitute an instruction-only length request for a hard cap, or silently amend the protocol. A different verifiable execution profile or an explicit owner-approved change to evaluation conditions would need a concrete revised plan before adoption.

When feasible, retain the original six fresh cases in two new contexts, each covering new/revision/conflicting-or-incomplete input; 12 initial outputs, one run per case/arm; identical shared inputs and budgets; no tools, extra sources or follow-up turns. Create the fresh case set only after explicit Phase A Adopt, in an independent context without candidate outputs or public rehearsal expectations. Phase B must then receive actual owner adjudication, explicit Adopt, matching Phase A identity and Yes confirmation that conditions are unchanged before generation.

The proposed Pilot 001 continuation rule is carried forward **unchanged and unadopted**: no valid Skill hard failure; at least three paired cases improve by at least one material correction, spanning both contexts; no case worsens on corrections/missed choices/unsupported claims; Skill source fidelity at least baseline and at least 2; total unnecessary questions no greater; rounded total owner-active effort at most baseline plus five minutes; all required measurements present. Stop recommendations take precedence for a valid Skill hard failure, then Incomplete/Inconclusive for insufficient controls/measurements, then Continue only if every criterion passes, otherwise Simplify. No post-results additional runs can rewrite that initial result.

Retain zero preplanned additional runs, at most one replacement paired block per control-invalid case, both original outputs, the original balanced case/arm order, raw owner-effort intervals and separate rounding of each arm's summed active time. Ordinary truncation, poor answers and hard failures under valid controls are findings, not control-invalid runs. Missing owner measurements prevent Continue. Recommendations never make the owner's continuation decision automatically.

The historical P3 classification finding remains visible. The current candidate already instructs explicit uncertainty about source authority. No new exemption or deferral is proposed; score current outputs under the unchanged hard-failure overlay. A needed Skill correction would require a new identified candidate and reconsidered Phase A, not a waived failure.

## Owner decisions, only when their prerequisites exist

No new owner policy adoption is needed to prepare these public diagnostic inputs or this observation procedure. The active task has already chosen Skill usability/UX preparation over CI enforcement; do not ask that priority again. Real owner participation is missing information/observation, not something the agent may fabricate.

Do not ask the owner to adopt this unready Phase A. First make the runtime controls concrete and review the exact final target. The necessary future closed questions are:

1. **Phase A, after feasibility:** “Adopt the identified final comparison plan and its exact candidate/controls/thresholds, or Defer?” Recommend Adopt only when the documented feasibility gate is met; while current gaps remain, recommend Defer and continue public diagnostic learning. A desired condition change is Amend, requiring a concrete revised target and later Adopt.
2. **Phase B, only after Phase A:** “Adopt the independently prepared, owner-adjudicated case/expectation set with unchanged Phase A conditions, or request an amendment?” Recommend Adopt only after actual adjudication and identity/unchanged-condition checks. No Phase B target currently exists.

Do not turn permission to observe the owner into an architecture outcome, a conditional freeze or an authorization for canonical integration, PR/merge, release or activation. #3/#6 remain open; preparation alone does not satisfy their full criteria.
