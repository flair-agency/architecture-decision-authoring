# One-case public rehearsal comparison

This is an agent-coded diagnostic of one public, exposed case; the scorer read the case expectation and rubric. It is not owner-adjudicated, formal Phase A evidence, or decision-grade evidence.

## Blind Astra diagnostic score

| Measure | Baseline | Skill |
| --- | ---: | ---: |
| Substantive corrections — material | 0 | 0 |
| Substantive corrections — minor | 1 | 2 |
| Fabricated source claims | Not observed | Not observed |
| Silent decision changes | Not observed | Not observed |
| False adoption claims | Not observed | Not observed |
| Missed owner choices | 0 | 0 |
| Unsupported material claims | 0 | 0 |
| Unnecessary questions | 0 | 1 |
| Source fidelity (0–3) | 2 | 2 |
| Owner effort | Unmeasured | Unmeasured |

The shared minor correction is a lost source qualification: the baseline says there was “no interval above 7” order writes ([baseline, line 39](baseline.md#L39)); the Skill says there was “no order-write rate above 7/second” ([Skill, line 40](skill.md#L40)). The source only states that there was no **sustained** order-write interval above 7 ([load-test note, line 7](../../../cases/cedar-cart-revision/input/load-test-note.md#L7)). Restoring “sustained” preserves the evidence limit; neither wording changes the conclusion that the recorded threshold was not established.

The Skill's second minor correction is also the single unnecessary question, so these counts overlap rather than describing separate defects. It asks whether checkout's transaction boundary should remain unchanged if search is separated ([Skill, line 85](skill.md#L85)), even though the adopted decision explicitly keeps checkout and inventory reservation in one transaction ([adopted decision, line 6](../../../cases/cedar-cart-revision/input/adopted-decision.md#L6)) and the Skill itself excludes that boundary from the proposed change ([Skill, line 11](skill.md#L11)). This is a scope-reconfirmation issue, not a silent change or hard failure.

## Evidence and interpretation

- Both proposals preserve CC-ADR-014's adoption status, limits, and lack of amendment authority: [baseline, lines 33–34 and 66](baseline.md#L33-L34), [Skill, lines 33–35 and 69](skill.md#L33-L35), and the [adopted decision, lines 5–10](../../../cases/cedar-cart-revision/input/adopted-decision.md#L5-L10). Their adoption records remain pending: [baseline, lines 101–111](baseline.md#L101-L111) and [Skill, lines 105–113](skill.md#L105-L113).
- Both distinguish 36 catalog reads/second from 7 order writes/second and preserve the staging-to-production uncertainty: [baseline, lines 39–42](baseline.md#L39-L42), [Skill, lines 39–43](skill.md#L39-L43), and [load-test note, lines 5–8](../../../cases/cedar-cart-revision/input/load-test-note.md#L5-L8).
- Both leave the deployment amendment unresolved and identify the relevant owner choices: [baseline, lines 79–82](baseline.md#L79-L82) and [Skill, lines 82–84](skill.md#L82-L84). The separate owner-request review route is also preserved ([baseline, line 82](baseline.md#L82); [Skill, lines 33 and 94](skill.md#L33)).

There is no Skill quality advantage in this pair. A candidate improvement hypothesis is a final unresolved-choice check that removes questions already answered by adopted decisions outside the requested amendment scope, while retaining exact qualifiers from evidence sources.

## Scorer and limitations

A separate GPT-6 Astra scorer read the rubric and [public case expectation](../../../cases/cedar-cart-revision/expected.md), then scored the proposals without seeing the earlier proposed scores. Arm identity was visible. A prior non-blind planning review, which had received proposed scores in advance, scored corrections as baseline 0 / Skill 1 minor and source fidelity as 3/3. The blind scorer identified the shared lost “sustained” qualification and scored source fidelity 2/3 for both; this sensitivity to scoring interpretation is another limitation, so the stricter blind score is reported above.

Other limits: the case and expectations are public and exposed; the arms are visible; there was one run per arm; the baseline already received shared authoring guidance; the initial `gpt-6-sol` startup failed and both completed runs used requested model `gpt-5.6-sol` at low reasoning; and the served backend/model revision could not be verified. These results are not held-out, formal, or general evidence. Owner effort was not measured. Run details and hashes are in the [run manifest](run-manifest.md).
