# Comparative authoring pilot protocol

**Status: Proposed; owner adoption required before any run.** This document predefines a narrow evaluation of the adopted initial pilot contract. It is a design proposal, not a report of conducted testing. The case expectations and continuation threshold in this directory are proposed and have not been owner-adjudicated or adopted.

## Purpose and limits

Compare a fixed general-purpose-agent baseline with one fixed Architecture Decision Authoring Skill instruction set on six synthetic architecture-decision cases. The comparison asks whether the Skill improves proposal preparation for owners under matched conditions. It does not benchmark models broadly, establish statistical claims about architecture work generally, or evaluate Architecture Gatekeeper acceptance. No Gatekeeper tool, schema, rubric, or decision is used.

The expected judgments are evaluator notes, not the required architecture answer. They identify facts and decisions to preserve, source limits, owner choices, conflicts and gaps, acceptable recommendation families, and prohibited claims. Multiple materially different recommendations can be acceptable when they respect the evidence and leave owner decisions with the owner.

## Proposed case matrix

Two fictional product contexts each contain three cases:

| Context | New decision | Revision of an existing decision | Conflicting or incomplete inputs |
| --- | --- | --- | --- |
| Cedar Cart, a small fictional web shop | Catalog-search boundary | Whether to revise an existing deployment/checkout boundary | Conflicting catalog freshness statements |
| Juniper Field Notes, a fictional offline field-report app | Offline draft storage and sync boundary | Whether to revise an adopted report-correction rule | Conflicting retention statements and unclear authority |

See [case inventory](cases/README.md). The only generation sources are the local snapshots under each case's `input/` directory. All are original synthetic material created for this protocol; none is based on real organization data or external source text.

## Arms and controlled conditions

Each run uses one case and one arm in a fresh, isolated context:

1. **General-purpose baseline:** the shared [baseline prompt](baseline-prompt.md), the case request and its `input/` source snapshots, and the repository's [Architecture Decision Proposal template](../docs/templates/architecture-decision-proposal.md). No authoring Skill instructions are supplied.
2. **Skill:** the exact same prompt, request, source snapshots, template, and environment, plus one frozen revision of the authoring Skill instructions. Those instructions are the only intended arm difference.

Before a decision-grade run, record and freeze:

- provider and exact model/version, system/developer messages, sampling settings, and output limit;
- the commit SHA and SHA-256 digest for the shared prompt, template, every case input file, and the Skill instruction revision;
- identical source access (the source snapshots and shared template are supplied verbatim in the model context with their repository-relative file paths), one user request, one assistant response, no follow-up turns, and no external network or additional tools;
- a fixed per-run context/token budget, including the baseline prompt and all input material. The Skill instructions consume the Skill arm's same budget; they do not receive extra context or output tokens. If the Skill does not fit, record the limitation rather than increasing its budget;
- the arm order, case order, run identifier, start/end time, and any provider interruption.

The case-specific request is in `input/request.md`. For each run, construct model context in a fixed order: common system/developer messages, the complete shared baseline prompt, the case request, all remaining files in that case's `input/` in lexical path order, then the shared template verbatim. Label each snapshot with its repository-relative path. The Skill arm receives the exact same context plus the frozen Skill instructions in the same declared location on every run. **Never put `expected.md`, this inventory, rubric notes, or owner evaluation notes in a generation bundle or model context.** Record evaluator-only hashes separately from the generation manifest. Freeze the prompt, template, inputs, Skill revision, rubric, and expectations before comparing outputs; any change creates a new protocol version and a new run set.

No Skill instruction revision is included in this evaluation-design change. A candidate must be selected and frozen before a run; until then, there is no complete Skill arm and the comparison is not ready to execute.

Use one exact model configuration for both arms. A result is comparable only when the same model/version and settings, case sources, template, interaction budget, tool policy, context budget, and output limit were used. Do not tune either arm after seeing comparative outputs.

## Run plan, ordering, and blinding

The recommended design is **6 cases × 2 arms × 2 independent runs = 24 outputs**. Each repetition starts in a fresh context; no conversation history or output from another run may be reused. Randomize case/arm execution order with a recorded seed. Run both arms for the same case close enough in time to avoid configuration drift.

If resources only allow **12 outputs** (one run per case per arm), label the set *exploratory*. It can surface usability issues but cannot satisfy the continuation threshold or support a decision-grade comparative claim. Do not treat extra runs of selected cases as a substitute for the paired full design.

Before review, replace run/arm labels with neutral randomized IDs. The owner scoring outputs should not see the arm assignment or expected judgments while scoring. Keep the arm-to-ID key and expected judgments separate until scoring is recorded. Skill wording may make perfect blinding impossible; note any guessed arm assignment and do not claim successful blinding if identity was apparent.

## Output and scoring workflow

Each run produces one proposal using the shared template. The assistant must distinguish facts, assumptions, existing decisions, constraints/evidence, options, proposed decisions, and unresolved owner choices; map material claims to source locations; preserve scope, conditions, exceptions, time bounds, and trade-offs; and make missing information explicit. The run ends after its one response. Questions for the owner are recorded in the output rather than answered interactively.

The owner scores each output using the [rubric](rubric.md) and proposed expectations. Record owner active effort in minutes, substantive corrections, missed owner choices, unsupported claims, unnecessary questions, source fidelity, and any hard failure. Do not equate polished prose, length, confident tone, or number of recommendations with decision quality.

Store future manifests, raw outputs, scoring, and invalid-run records according to [results guidance](results/README.md). No results are created by this protocol-design change.

The expected judgments are currently proposed only. Before a decision-grade run, the authorized owner must adjudicate and freeze each expectation set, the rubric, and the threshold. Do not call the current case notes owner-adjudicated, infer adoption from their presence in Git, or inspect comparative results before adopting the threshold.

## Continuation threshold — Proposed

Continue this Skill design to another pilot stage only if every condition below is met on the full paired design:

1. The Skill arm has **zero hard failures**. A hard failure is never averaged away, offset by time savings, or waived because the baseline also failed.
2. Compared with baseline, the Skill has no worsening in source fidelity, missed owner choices, or substantive corrections, both in the pooled six-case comparison and within either product context. Sum the two owner-choice/correction counts per output across valid paired runs; compare the arithmetic mean of the 0–3 source-fidelity scores. Lower counts and a higher fidelity score are favorable.
3. Total owner active effort is reduced by **at least 20%** across the six paired cases, using the sum of the two valid runs per case and arm: `(baseline minutes − Skill minutes) / baseline minutes`.
4. Owner active effort is lower for the Skill arm in **each** product context when valid run minutes are summed within that context.

These are proposed decision rules pending owner adoption. If adopted and any condition fails, do not advance the Skill unchanged: simplify, revise and re-freeze it for a new comparison, or stop. Threshold failure is not proof that all Skills or architecture-authoring workflows lack value. If a hard failure occurs, stop the current Skill candidate and preserve the output for owner review before any rerun or revision.

## Invalid runs, reruns, and product stops

An invalid run is caused by a protocol/control failure outside the candidate's behavior: wrong model/settings, wrong or changed source bundle, expected-judgment leakage, extra tool/network access, mismatched budget/template/prompt, or a documented provider/platform interruption. Keep its manifest and any partial output, label it invalid with a reason, and exclude it from comparison.

Treat each replication as a paired block containing one baseline and one Skill output for the same case. If either output in a block is invalid, exclude both outputs in that block and rerun both arms in fresh contexts under the same frozen configuration; this preserves balanced pairs. Allow one paired rerun per invalid block. If the same control failure recurs, pause the evaluation, repair the protocol, issue a new version, and restart the affected design; do not silently replace results. Model behavior such as unsupported claims, omissions, refusal, or poor output under valid conditions is a product result, not an invalid run.

A Skill hard failure is a product stop for that frozen Skill revision; preserve it and do not average or rerun it away. A valid 12-output exploratory set or a threshold miss cannot authorize continuation. Any changed Skill, prompt, source, template, model configuration, rubric, or expectation requires a new frozen evaluation revision before another comparison.

## Limitations

This is a small, synthetic, two-context evaluation with six intentionally bounded cases, one fixed general-purpose prompt, one model configuration at a time, and an owner-centered scoring approach. Two runs per arm/case do not support broad statistical conclusions. The owner's familiarity and the difficulty of complete blinding can affect effort and ratings. Source fidelity and decision preservation matter more than prose polish; passing this protocol would support only the next scoped pilot decision, not general capability, release readiness, or Gatekeeper acceptance.
