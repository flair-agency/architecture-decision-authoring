# Proposed expected judgments — not owner-adjudicated

> **PUBLIC DEVELOPMENT/REHEARSAL ONLY — NOT HELD-OUT.** This expectation set is exposed and cannot satisfy the continuation threshold, even with 24 outputs.

This evaluator-only note is not part of the generation bundle. Owner review may exercise the rubric, but cannot promote this exposed set to held-out; decision-grade expectations must be created and adjudicated for a fresh set after candidate freeze.

## Preserve

- Juniper Field Notes is a fictional Android app that sends reports to a hosted service when connected.
- Eight devices participated in a three-day synthetic dry run with offline periods up to six hours; this is not an SLA.
- Staff want offline text drafts and photo attachments.
- The service assigns report IDs after accepting a report; conflict, retry, deletion, local-retention, and repeated-failure behavior are unspecified.

## Source limits and owner choices

- The sample does not establish a maximum text/photo size, production offline duration, volume, security policy, conflict rate, or launch date.
- The owner must choose acceptable offline behavior, retry/resume semantics, conflict resolution, identity assignment for drafts, and local-data protection/retention requirements.
- The packet does not establish an existing decision or a required storage technology.

## Acceptable recommendations

A proposal may recommend a local durable draft queue and later synchronization, compare client-local storage with a more server-centered approach, or defer technology choice until the owner sets policy. More than one option is acceptable when trade-offs and assumptions are explicit and the answer does not promise unsupported reliability or security properties.

## Prohibited claims

- Claiming six hours is a committed service target or that the small dry run proves production behavior.
- Claiming a required local database, encryption method, report-ID scheme, conflict policy, retry guarantee, or adopted design absent from the packet.
- Claiming the 12 MB observation is an enforced photo limit or that the proposal is adopted.
