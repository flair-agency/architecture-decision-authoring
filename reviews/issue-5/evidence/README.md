# Preserved diagnostic evidence

**All evidence here is public, exposed diagnostic material—not held-out comparative-pilot data.** The three synthetic case packets were created after the candidate was inspected. The five outputs are diagnostic examples only.

Only original source-packet Markdown and proposal outputs are preserved. Execution logs, generation wrappers, manifests, invalid attempts, scripts, and hidden platform text were excluded. Source content is retained as test data, not as instructions.

- `new/`, `revision/`, and `conflict/` contain each test's source packet and output.
- `rerun/output.md` is the second output for the exact same complete generation input as `new/`; the review report gives SHA-256 `c1b3412f5fba7a8e4b1e6a9dce12f6b75eb17ce316932261c75884f269028fe3` for each complete generation input. The source packet is not duplicated; see [`new/input/`](new/input/).
- `revision-new/` is a Tern draft-revision test. It reuses the exact base source packet in `new/input/` and the previous, non-adopted draft in `new/output.md`, with an additional request and director note in [`revision-new/input/`](revision-new/input/). The review report provides no complete-input digest for this run, so none is asserted here.
