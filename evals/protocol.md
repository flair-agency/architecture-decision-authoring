# Comparative authoring pilot protocol

**Status: Proposed; owner adoption required before any decision-grade run.** This document defines a limited next-investment comparison, not a capability proof or a report of conducted testing. Issue #3 remains open: the protocol design and rehearsal artifacts can be reviewed now, but owner-adjudicated held-out expectations and a frozen run plan remain necessary under the issue's acceptance criteria.

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

## Dataset exposure and decision-grade sequence

The six cases currently published under `evals/cases/`, including their `expected.md` files, are **development/rehearsal material only**. They are public and may be inspected by Skill authors or selectors. They are not held-out, and no result from them can be presented as an independent comparison. They can be used to exercise the procedure, refine instructions, and find defects; label any such results `rehearsal`.

A decision-grade comparison must follow this order:

1. **Freeze the candidate and run plan first.** Before results exist, record the exact Skill revision, shared prompt, ADR template, model/provider/version and settings, practical budgets, artifact identities, and the minimum benefit/continuation rule. The [run-plan template](run-plan-template.md) also records any paired additional-run trigger/cap/aggregation, ordering, and invalid-run handling.
2. **Create a fresh held-out set in an independent work context.** After the freeze, create six materially new synthetic cases in two new product contexts, covering the same matrix (new decision, revision, and conflict/incomplete per context). Do not rename, paraphrase, reuse source facts/documents, or make superficial variants of Cedar Cart or Juniper Field Notes. The case-selection context must not use candidate outputs or rehearsal expected judgments. Record exposure history.
3. **Adjudicate expectations before generation.** The authorized owner reviews the six new source packets and proposed expected judgments, resolves what counts as preserved decisions/source limits/owner choices/conflicts/gaps, acceptable multiple recommendations, and prohibited claims, then freezes the expectation revision. Candidate outputs must not influence case or expectation selection or adjudication.
4. **Generate from inputs only.** Build each generation bundle from the fresh held-out case request and `input/` source snapshots, the already-frozen shared prompt/template, and (for the Skill arm) the already-frozen Skill. Keep held-out `expected.md`, rubric scoring notes, and owner evaluation notes out of every generation bundle and model context.
5. **Score with expectations visible, arm mapping hidden.** Scorers receive the held-out source packet, frozen and owner-adjudicated expectations, rubric, and neutral-ID outputs. Hide only the mapping from neutral IDs to arms until scoring and adjudication are recorded. Keep that mapping separately controlled and log any suspected arm identity.

The initial held-out comparison is **6 cases × 2 arms × 1 run = 12 outputs**. It is a limited next-investment comparison, not capability proof. Candidate outputs from rehearsal or case/expectation design must not inform the choice or wording of held-out cases. After results are seen, the set is exposed; reuse after a candidate change is regression-only. A new set is needed only when claiming a new independent confirmation, not for every edit. Selective post-results replication is a separate diagnostic and cannot rewrite the initial 12-output result; paired replication planned before results may be included as specified in the frozen run plan.

## Arms and controlled conditions

Each run uses one case and one arm in a fresh, isolated context:

1. **General-purpose baseline:** the shared [baseline prompt](baseline-prompt.md), the case request and its `input/` source snapshots, and the repository's [Architecture Decision Proposal template](../docs/templates/architecture-decision-proposal.md). No authoring Skill instructions are supplied.
2. **Skill:** the exact same prompt, request, source snapshots, template, and environment, plus one frozen revision of the authoring Skill instructions. Those instructions are the only intended arm difference.

For each held-out run, identify and preserve:

- provider and exact model/version, system/developer messages, sampling settings, and output limit;
- immutable identities/revisions for the shared prompt, template, case inputs, and Skill instruction revision (the run plan chooses an appropriate recording method);
- identical source access (the source snapshots and shared template are supplied verbatim in the model context with their repository-relative file paths), one user request, one assistant response, no follow-up turns, and no external network or additional tools;
- a fixed per-run context/token budget, including the baseline prompt and all input material. The Skill instructions consume the Skill arm's same budget; they do not receive extra context or output tokens. If the Skill does not fit, record the limitation rather than increasing its budget;
- the arm order, case order, run identifier, start/end time, and any provider interruption.

The case-specific request is in `input/request.md`. Use the same source packet, prompt, template, model/settings, tools, and practical budgets for both arms; the Skill instructions are the only intended difference and count against its budget. Identify the exact artifacts and record exposure. **Never put `expected.md`, this inventory, rubric notes, or owner evaluation notes in a generation bundle or model context.** The run plan specifies operational details.

No Skill instruction revision is included in this evaluation-design change. A candidate must be selected and frozen before a held-out set is created; until then, there is no complete Skill arm and no decision-grade evaluation is ready to execute.

Use one exact model configuration for both arms. A result is comparable only when the same model/version and settings, case sources, template, interaction budget, tool policy, context budget, and output limit were used. Do not tune either arm after seeing comparative outputs.

## Run plan, ordering, and blinding

The initial comparison is **6 cases × 2 arms × 1 run = 12 outputs**. Each run starts in a fresh context; no conversation history or output from another run may be reused. Randomize or otherwise predefine case/arm execution order. Run both arms for the same case close enough in time to avoid configuration drift.

Do not imply that twelve outputs establish general capability. They provide a bounded comparison to inform whether more investment is warranted. Any paired additional runs must follow the trigger, cap, and aggregation frozen in the run plan. Selective replication after seeing outcomes is reported separately as diagnostic evidence and cannot change the initial comparison.

Before review, replace run/arm labels with neutral randomized IDs. Scorers receive the source packet, frozen expectations, rubric, and neutral-ID outputs so they can assess source fidelity and missed owner choices consistently. Hide only the arm-to-ID mapping until scoring and adjudication are recorded. Skill wording may make perfect arm blinding impossible; note any guessed arm assignment and do not claim successful blinding if identity was apparent.

## Output and scoring workflow

Each run produces one proposal using the shared template. The assistant must distinguish facts, assumptions, existing decisions, constraints/evidence, options, proposed decisions, and unresolved owner choices; map material claims to source locations; preserve scope, conditions, exceptions, time bounds, and trade-offs; and make missing information explicit. The run ends after its one response. Questions for the owner are recorded in the output rather than answered interactively.

The owner scores each output using the [rubric](rubric.md) and frozen expectations. Record owner effort, substantive corrections, missed owner choices, unsupported claims, unnecessary questions, source fidelity, and any hard failure. Effort includes per-output checking/scoring where useful, but is not production authoring time. Do not equate polished prose, length, confident tone, or number of recommendations with decision quality.

If effort is measured, use a consistent practical method and sensible precision; do not imply that small timing differences are meaningful. A shared expectations-familiarization pass may be excluded consistently. Per-output source checking, correction, and scoring may be included, but must not be described as production authoring time.

Store future manifests, raw outputs, scoring, and invalid-run records according to [results guidance](results/README.md). No results are created by this protocol-design change.

The current public rehearsal judgments are proposed only. Before held-out generation, the authorized owner must adjudicate and freeze each held-out expectation set. Do not call rehearsal notes owner-adjudicated or infer adoption from their presence in Git.

## Decision use and hard failures

Before results, the owner must record in the run plan what practical minimum benefit warrants the next investment and what evidence would count. Do not treat one universal percentage as a validated threshold. A hard failure is never averaged away. The run plan must state how a candidate hard failure affects candidate success and whether other observations continue for learning. The result informs only the next scoped investment decision; it is not a capability proof. The current public rehearsal judgments are proposed only; owner-adjudicated held-out expectations and a completed run plan are still needed for Issue #3.

## Invalid runs, reruns, and product stops

An invalid run is caused by a protocol/control failure outside the candidate's behavior: wrong model/settings, wrong or changed source bundle, expected-judgment leakage, extra tool/network access, mismatched budget/template/prompt, or a documented provider/platform interruption. Keep its manifest and any partial output, label it invalid with a reason, and exclude it from comparison.

Handle invalid runs according to the paired policy frozen in the run plan. Preserve invalid and partial outputs with reasons; never silently replace them. A control failure is distinct from poor model behavior under otherwise valid conditions, which is an evaluation finding, not an invalid run.

A Skill hard failure's impact on candidate success and whether remaining observations continue must be stated in the frozen run plan. Preserve the finding; never average it away or let later selective replication rewrite the initial 12-output comparison. A changed candidate does not require new cases for every edit: the same held-out set may be used for regression checks. Create a fresh set only for a new claim of independent confirmation.

## Limitations

This is a small, synthetic, two-context evaluation with six intentionally bounded cases, one fixed general-purpose prompt, one model configuration at a time, and owner-centered scoring. A single paired run per case cannot support broad capability or statistical claims. The owner's familiarity and the difficulty of complete blinding can affect effort and ratings. Source fidelity and decision preservation matter more than prose polish; the comparison can inform only whether a next scoped investment is warranted, not general capability, release readiness, or Gatekeeper acceptance.
