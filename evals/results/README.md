# Evaluation results

**No pilot outputs are recorded here.** This directory is reserved for future evaluation evidence. The protocol, rubric, continuation threshold, and case expectations are proposals pending owner adoption; creating this directory is not evidence that a run occurred or that criteria were approved.

Before any decision-grade run, obtain owner adoption of the frozen protocol, rubric, expectation set, and threshold. Record a run manifest with the protocol revision, case ID, random run ID, arm, exact model/version and settings, prompt/template/input/Skill digests, context and token budget, tool policy, ordering seed, timestamps, and validity status. Keep the evaluator-only arm key and expectation hashes separate from generation bundles.

For each output, retain the raw proposal and a scoring record with owner active effort, substantive corrections, missed owner choices, unsupported claims, unnecessary questions, source-fidelity score, and hard-failure findings. Preserve invalid runs and reasons; never overwrite them with reruns. Store reruns as new paired-block artifacts linked to the invalid run IDs.

Do not publish an aggregate without the case-level paired results, context breakdown, limitations, and every hard failure. Hard failures must remain individually visible and cannot be averaged away. The 12-output mode is exploratory and must not be represented as satisfying the continuation threshold.
