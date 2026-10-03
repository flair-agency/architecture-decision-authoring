# Issue and pull request workflow

This process helps keep work reviewable. It does not amend the [architecture contract](architecture.md), adopt a consumer decision, or approve policy activation or release publication.

## Issues

Choose Bug report, Feature request, Task, or Release planning. Bugs identify the exact release or immutable commit, affected ADA route, safe reproduction, expected outcome, and criteria with verification methods. Feature and task issues define one outcome, scope, acceptance criteria, verification scope, and known dependencies. Keep facts, assumptions, unknowns, and owner decisions distinct. Link real issues or canonical decisions; do not invent an owner-decision issue or resolve a consumer decision in an implementation ticket.

Make each acceptance criterion a separate observable statement. State how and within what scope it can be verified. Blank issue creation is disabled in the web issue chooser. CLI or API clients can still create issues without a form, so include the same substantive sections and criteria; submission through another client does not validate completeness. Do not put credentials, private consumer authority, owner evidence, or personal data in public issues. Follow the repository security reporting instructions for vulnerabilities.

During triage, link existing dependencies and split work only where each unit remains independently reviewable. Keep a parent issue open until all of its criteria and full scope are verified. Use the Project's existing statuses: `Todo`, `In Progress`, and `Done`. `Done` means a maintainer verified the full issue scope and every criterion. Status is coordination metadata, not validation or owner acceptance. Do not create a new status field to represent review.

## Partial delivery and issue closure

A PR may complete only part of an issue. It must identify the criteria it covers, list remaining criteria, and link a real follow-up issue where one exists. Do not use a closing keyword for partial coverage. A plain issue reference does not close an issue. Use a closing keyword only when the PR completes the issue's entire scope and every acceptance criterion; the issue closes when GitHub merges the PR into the configured branch.

## Pull requests

Use the five shared headings in `.github/pull_request_template.md`—Outcome, Issue coverage, Verification, Remaining work, and Authority and assurance—in both web and CLI/API PR descriptions. Preserve all five sections when creating or editing a PR outside GitHub's form. Replace each HTML-comment prompt with substantive information; comments are guidance, not completed content. Report only checks actually run, their results, and evidence for the covered criteria. State unrun checks and remaining work plainly. For no issue, explain `N/A`; for no follow-up work, explain `None` and keep unresolved follow-up ownership visible where applicable. Retain the Third-party material notice and preserve original license and attribution notices.

A PR's creation, review, or merge does not by itself adopt an architecture decision. For an architecture- or artifact-contract change, identify the relevant canonical contract and any unresolved owner decision. Follow `docs/architecture.md` for the distinction between Proposal, explicit owner outcome, finalized Authority Set, and consumer activation.

## Release planning

A release-planning issue records candidate scope and planning estimates. Separate active effort from elapsed calendar time spent waiting, and date the estimates with their evidence source. When useful, state a shortest plausible case, a target case, and a conditional recovery/longest defensible bound; include assumptions and mark unsupported or unbounded waits unknown. Use the project planning agreement already in force for routine dates; a date update alone does not require a new architecture approval. Reforecast when scope, capacity, or material assumptions change.

Keep release evidence separate from assumptions and unknowns. Preview feedback should identify the version/revision and observed limitation when available. State a short corrective or recovery path only when relevant; do not turn this form into a mandatory universal checklist or imply a preview is required for every release. Release planning does not replace the checks, owner decisions, compatibility evidence, or publication steps required by the architecture contract and release process.
