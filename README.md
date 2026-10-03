# Architecture Decision Authoring

[![GitHub Sponsors](https://img.shields.io/github/sponsors/flair-agency?label=Sponsor&logo=github)](https://github.com/sponsors/flair-agency)

Architecture Decision Authoring helps architecture owners and decision proposers turn evidence, constraints, alternatives, and unresolved questions into reviewable decision proposals. For a consumer with existing canonical authority, the normal endpoint is a reviewed, PR-ready integration of the adopted content into that authority.

The normal sequence is to commit the exact Proposal on the consumer's working branch, obtain the explicit owner outcome for that committed Proposal, integrate only the adopted content into the consumer's existing canonical authority on the same branch, review the exact change, and hand off the PR-ready repository change. The consumer creates and merges any PR and controls authority selection and activation. The product never makes, adopts, or replaces an architecture owner's decision.

The bounded workflow addresses one decision and one consumer repository at a time. It uses the consumer's existing canonical paths and process; it does not prescribe `proposal.md`, a `decision-package/` directory, or a new durable-file count for normal integration. A Gatekeeper-compatible Authority Set remains an optional interoperability export when requested or when canonical authority cannot be selected directly. Export retains its existing package integrity and validation requirements; it is not the routine completion artifact. Integration does not create or merge a PR, select policy, or activate enforcement.

Development checks and the standalone Skill archive rehearsal are documented in the [development workflow](docs/development.md). The [release runbook](docs/release.md) covers frozen-source review, archive verification, and release readback. The root npm manifest is private development tooling; consumers install the Skill directory, not an npm runtime package.

## Project status

The current work is tracked in the [GitHub Project](https://github.com/orgs/flair-agency/projects/7) and through these milestones:

- [M0 — Scope, contracts and evaluation design](https://github.com/flair-agency/architecture-decision-authoring/milestone/1)
- [M1 — Reviewable authoring pilot](https://github.com/flair-agency/architecture-decision-authoring/milestone/2)
- [M2 — Comparative pilot and continuation decision](https://github.com/flair-agency/architecture-decision-authoring/milestone/3)

Current work items: [Issues](https://github.com/flair-agency/architecture-decision-authoring/issues).

## Skill prototype

The [Architecture Decision Authoring Skill](skills/architecture-decision-authoring/SKILL.md) supports Proposal authoring and prepares a clause-mapped, PR-ready canonical integration handoff after an explicit owner outcome. Authority Set finalization remains an optional interoperability export. The [read-only package checker](skills/architecture-decision-authoring/scripts/validate-decision-package.mjs) checks the existing export package mechanics; the [synthetic finalization walkthrough](examples/issue-33-finalization-rehearsal/rehearsal-record.md) records its historical scope and evidence. These materials do not establish real owner adoption, semantic fidelity, consumer PR completion, or activation. The [curated bounded-decision walkthrough](examples/bounded-decision/run-record.md) demonstrates Proposal-authoring use. The canonical proposal template remains [docs/templates/architecture-decision-proposal.md](docs/templates/architecture-decision-proposal.md); the Skill's [bundled copy](skills/architecture-decision-authoring/assets/architecture-decision-proposal.md) is for distribution and must remain byte-identical to the canonical template.

### Install and invoke the Skill

Codex does not install this Skill automatically. To make it available in this repository, copy the complete Skill directory into the repository-scoped skills folder from the repository root:

```sh
mkdir -p .codex/skills
cp -R skills/architecture-decision-authoring .codex/skills/
```

For user-wide availability instead, copy it to `~/.codex/skills/architecture-decision-authoring/`. In either location, the Skill entrypoint is `SKILL.md`. Explicitly activate it with `/skills` or `$architecture-decision-authoring` in your prompt.

For example, after placing your source files in the workspace, ask:

> Use $architecture-decision-authoring to prepare one reviewable proposal from `docs/current-architecture.md` and `docs/constraints.md`. Cite source locations, compare viable options, and leave unsupported facts and owner choices unresolved.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to discuss and propose changes. Design documents are proposals until an authorized owner adopts them. The [product and artifact contract](docs/architecture.md), [initial Proposal decision](docs/decisions/0001-markdown-first-proposal-contract.md), [optional Authority Set export decision](docs/decisions/0002-authority-set-final-outcome.md), and [canonical-integration handoff decision](docs/decisions/0005-canonical-integration-handoff.md) are adopted within their stated bounds. See also the [proposal template](docs/templates/architecture-decision-proposal.md) and [decision-record guidance](docs/decisions/README.md).

## Community and security

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)

## Sponsorship

You can support ongoing work through [GitHub Sponsors](https://github.com/sponsors/flair-agency). Sponsorship does not influence project decisions, priorities, or review outcomes.

## License

This project is licensed under the [MIT License](LICENSE). Third-party materials included in the repository retain their original licenses and notices.
