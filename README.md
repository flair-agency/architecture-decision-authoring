# Architecture Decision Authoring

[![GitHub Sponsors](https://img.shields.io/github/sponsors/flair-agency?label=Sponsor&logo=github)](https://github.com/sponsors/flair-agency)

Architecture Decision Authoring is an early-stage design project exploring how to help architecture owners and decision proposers turn scattered evidence, constraints, alternatives, and unresolved questions into reviewable decision proposals.

This project is in the design and pre-pilot phase. Its outputs are proposals for human review; they do not make, adopt, or replace an architecture owner's decision. No pilot result or product capability is claimed as validated.

The current scope is to support one architecture decision at a time by organizing its context and trade-offs. The project does not aim to generate a complete architecture, make decisions for owners, or automatically approve or adopt proposals.

## Project status

The current work is tracked in the [GitHub Project](https://github.com/orgs/flair-agency/projects/7) and through these milestones:

- [M0 — Scope, contracts and evaluation design](https://github.com/flair-agency/architecture-decision-authoring/milestone/1)
- [M1 — Reviewable authoring pilot](https://github.com/flair-agency/architecture-decision-authoring/milestone/2)
- [M2 — Comparative pilot and continuation decision](https://github.com/flair-agency/architecture-decision-authoring/milestone/3)

Current work items: [Issues](https://github.com/flair-agency/architecture-decision-authoring/issues).

## Skill prototype

The [Architecture Decision Authoring Skill prototype](skills/architecture-decision-authoring/SKILL.md) is a reviewable implementation experiment. Its [curated bounded-decision walkthrough](examples/bounded-decision/run-record.md) demonstrates intended use; it is not an automated or independent evaluation. The canonical proposal template remains [docs/templates/architecture-decision-proposal.md](docs/templates/architecture-decision-proposal.md); the Skill's [bundled copy](skills/architecture-decision-authoring/assets/architecture-decision-proposal.md) is for distribution and must remain byte-identical to the canonical template.

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to discuss and propose changes. Design documents are proposals until an authorized owner adopts them. The [product and artifact contract](docs/architecture.md) and its [initial decision record](docs/decisions/0001-markdown-first-proposal-contract.md) are adopted for the initial pilot and will be reassessed after the comparative pilot. See also the [proposal template](docs/templates/architecture-decision-proposal.md) and [decision-record guidance](docs/decisions/README.md).

## Community and security

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)

## Sponsorship

You can support ongoing work through [GitHub Sponsors](https://github.com/sponsors/flair-agency). Sponsorship does not influence project decisions, priorities, or review outcomes.

## License

This project is licensed under the [MIT License](LICENSE). Third-party materials included in the repository retain their original licenses and notices.
