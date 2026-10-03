# Skill release runbook

This project distributes a standalone Codex Skill archive. The root npm
manifest and scripts are private development tools; they are not a runtime
package, and there is no npm publication step. A release does not adopt a
consumer's architecture, select the Skill, or activate downstream policy.

GitHub Releases are the public release history. Keep release notes in the
GitHub Release rather than maintaining a second changelog. Rehearsals are
non-publishing: do not create or push a tag or GitHub Release while checking a
candidate.

## Plan and estimate

Use the [release planning issue form](../.github/ISSUE_TEMPLATE/release_planning.yml)
to state the intended change, proposed version, evidence, dependencies, and
remaining work. Version and date are planning values until the release owner
sets the plan. Routine release dates do not require a new architecture-owner
decision; a new product responsibility or assurance rule must first be
recorded in canonical authority.

Estimate active effort separately from elapsed waiting. Base estimates on
observed implementation, test, archive, review, external setup, and recovery
work where such measurements exist. State assumptions and the observation
source. If review availability, external setup, or another material dependency
has no defensible bound, say the date or upper bound is unknown or conditional;
do not invent a duration. A daily meaningful compatible minor release may be
an ambition when a candidate is ready, never a calendar-forced publication.

For this early-stage `0.x` Skill, record the proposed version and why it fits
the change; do not imply that the number alone promises compatibility. The
current v0.2.0 finalization workflow remains experimental. Mark an experimental
release as a GitHub prerelease deliberately; a version string alone does not
set that state. A published release is immutable. Correct an issue with a new
compatible corrective release and a new version rather than replacing an
existing tag, archive, or release.

## Freeze and review a candidate

1. Select the exact commit on the intended source branch. Confirm the checkout
   is clean and record the full commit SHA, proposed version, and expected tag.
   Review the complete diff against `docs/architecture.md` and the release
   scope.
2. Run focused tests, `npm test`, and `npm run archive:smoke` from that exact
   source. Run CodeQL when available and assess its findings. Complete the
   host-native Architecture Review before committing source changes and run
   Codex `/review` against the exact candidate pull request commit. Record the
   actual revisions and results; skipped or running reviews are not passes.
3. Reuse a recent model-authored Proposal smoke only when the relevant Skill
   text, references, template, input, model, and execution context are
   unchanged. Otherwise run a bounded smoke with synthetic or task-authorized
   material and review source fidelity, unknowns, and invented claims. Report
   this separately from mechanical checks. Do not publish during rehearsal.
4. Verify the archive in a fresh temporary location as described below. Save
   the exact source SHA, archive filename, SHA-256, extracted file inventory,
   and check results with the candidate evidence. Keep temporary archives and
   model outputs outside the repository unless a reviewed evidence change
   explicitly includes bounded synthetic artifacts.

The root npm manifest is not included in the Skill archive. Do not add it,
CodeQL outputs, review requests, credentials, or local settings to the release
asset.

## Archive rehearsal

From the clean candidate checkout, run:

```sh
npm run archive:smoke
```

This creates an ephemeral ZIP under a temporary directory, checks archive
paths, extracts it, and runs the validator tests from the extracted Skill.
Inspect the printed temporary workspace. The archive should contain exactly
the seven files in the Skill layout, with `architecture-decision-authoring/`
as the root:

```text
architecture-decision-authoring/LICENSE
architecture-decision-authoring/SKILL.md
architecture-decision-authoring/agents/openai.yaml
architecture-decision-authoring/assets/architecture-decision-proposal.md
architecture-decision-authoring/references/authority-set-finalization.md
architecture-decision-authoring/scripts/validate-decision-package.mjs
architecture-decision-authoring/scripts/validate-decision-package.test.mjs
```

The Skill-local `LICENSE` must be preserved. Compare the extracted template
byte-for-byte with the canonical proposal template. For example, set
`SMOKE_ROOT` to the printed temporary workspace path and run:

```sh
cmp "$SMOKE_ROOT/extracted/architecture-decision-authoring/assets/architecture-decision-proposal.md" \
  docs/templates/architecture-decision-proposal.md
cmp LICENSE skills/architecture-decision-authoring/LICENSE
```

The smoke command is a mechanical archive and validator check; it does not perform a model
authoring run or establish owner adoption, semantic fidelity, or consumer
activation.

For a candidate-specific sidecar, compute SHA-256 using only the archive
filename from the directory containing that archive, so the sidecar does not
embed a machine-specific path:

```sh
cd /path/to/archive-directory
shasum -a 256 architecture-decision-authoring.zip \
  > architecture-decision-authoring.zip.sha256
```

Check the sidecar filename and hash against the exact archive. Preserve the
archive and sidecar for release upload only after the reviewed source SHA is
confirmed. The ephemeral smoke artifact itself is not a published version.

## Publish and read back

Once the candidate's required reviews and checks are complete, create a new
version tag at the recorded source commit and publish the Skill ZIP and its
`.sha256` sidecar in a GitHub Release for that tag. The release identity is
the tuple of version/tag, full source commit SHA, archive filename, and archive
SHA-256. Verify that the tag resolves to the intended commit and that the
release contains the intended archive and sidecar.

Use the normal repository credentials and publication access. For example,
after setting the reviewed values and preparing release notes outside the
checkout. The GitHub Release carries the ZIP, its checksum sidecar, and the
repository `LICENSE`; the ZIP also includes the Skill-local `LICENSE`.

```sh
set -eu
SOURCE_REPO='/path/to/clean/source-checkout'
SOURCE_SHA='<full-reviewed-source-commit>'
VERSION='<release-version>'
RELEASE_TAG="v$VERSION"
ARCHIVE='/path/to/archive-directory/architecture-decision-authoring.zip'
SIDECAR="$ARCHIVE.sha256"
RELEASE_NOTES='/path/to/reviewed-release-notes.md'
cd "$SOURCE_REPO"
test "$(git rev-parse HEAD)" = "$SOURCE_SHA"
test -z "$(git status --porcelain)"
REMOTE_TAGS="$(git ls-remote --tags origin "refs/tags/$RELEASE_TAG" "refs/tags/$RELEASE_TAG^{}")"
test -z "$REMOTE_TAGS"
RELEASE_TAGS="$(gh release list --limit 1000 --json tagName --jq '.[].tagName')"
if printf '%s\n' "$RELEASE_TAGS" | grep -Fxq "$RELEASE_TAG"; then
  printf '%s\n' 'GitHub release tag already exists.' >&2
  exit 1
fi
test -s "$ARCHIVE" && test -s "$SIDECAR" && test -s "$SOURCE_REPO/LICENSE" && test -s "$RELEASE_NOTES"
git tag -a "$RELEASE_TAG" "$SOURCE_SHA" -m "$RELEASE_TAG"
git push origin "refs/tags/$RELEASE_TAG"
gh release create "$RELEASE_TAG" "$ARCHIVE" "$SIDECAR" "$SOURCE_REPO/LICENSE" \
  --verify-tag --title "$RELEASE_TAG" --notes-file "$RELEASE_NOTES" --prerelease
```

The example marks this experimental candidate as a prerelease. Remove
`--prerelease` only for an intentionally stable release. It assumes the
archive, sidecar, repository `LICENSE`, and notes file are available after the
non-publishing rehearsal. Do not rerun the tag or release commands for an
existing version; first inspect remote state and use a new version for a
correction. GitHub CLI uses `--notes-file` for release notes.

After publication, read the release back from GitHub. Confirm the release URL,
tag, title/body, prerelease state, and uploaded asset names. `targetCommitish`
is informational; verify the tag's peeled commit independently. Download the
uploaded archive and sidecar to a clean temporary directory, verify the
SHA-256, inspect and extract the archive, and compare its file inventory with
the candidate smoke. Record the exact readback and hash. A tag push or
successful upload alone is not a verified release.

Read back the Git tag and release metadata with:

```sh
git ls-remote origin "refs/tags/$RELEASE_TAG" "refs/tags/$RELEASE_TAG^{}"
gh release view "$RELEASE_TAG" --json url,tagName,targetCommitish,isDraft,isPrerelease,assets,body
```

For an annotated tag, confirm the peeled `^{}` SHA equals `SOURCE_SHA`.

Never overwrite a published tag, archive, or release. If a release needs
correction, preserve the existing record and publish a new compatible
corrective version from a separately reviewed commit. Keep GitHub Releases as
the release history; do not also add a duplicate changelog file.

## Feedback and retrospective

For release feedback, record the released version, source SHA, reproduction,
impact, affected consumer pins, and supporting evidence. Assess compatibility
and scope, then use a new corrective version for a fix; document a tested
consumer recovery pin only when that consumer's adopted policy supports it.
Do not treat a download, install, or release announcement as consumer adoption
or activation.

After a release, compare estimated and actual active effort separately from
elapsed waiting. Record variance in implementation, tests, archive work,
review, external setup, feedback, and recovery; link the observations. Keep
unknown bounds marked unknown and turn a demonstrated process improvement into
owned follow-up work rather than adding an unmeasured schedule buffer.

## Evidence and limits

Record what was actually checked: source revision, test commands and results,
reviewed revision and findings, archive filename and SHA-256, extraction and
template comparison, GitHub release URL, tag target, and asset readback. Mark
missing checks and unknown dates explicitly. Reuse unchanged model smoke
evidence rather than making redundant calls; rerun it when relevant authoring
instructions, references, inputs, model, or execution context change.

Keep each claim within its evidence. Archive extraction demonstrates the
packaged files can be read and the validator tests can run from the extracted
Skill. Pinned Gatekeeper materialization demonstrates compatibility with that
specific parser/materializer. Neither proves source fidelity or owner
authorization. A human or bounded semantic review is distinct from structural
checks. The consumer separately decides whether to adopt an outcome, install
the Skill, select an Authority Set, or activate policy.
