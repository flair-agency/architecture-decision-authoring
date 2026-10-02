# Local Architecture Gatekeeper review

**Purpose:** optional local development feedback on possible contract conflicts from a pinned semantic review. These results are diagnostic only; they are not product acceptance, owner adoption, merge approval, or evidence that the contract itself is correct.

## Fixed runtime and configuration

This guide pins the runtime to `@flair-agency/architecture-gatekeeper@0.6.0-preview.2`, published from source commit `c6c45da24d755ddd51b3a595e614242f869ec3ad`. Use only this exact release for this local review; do not use a floating version or an unpinned registry fallback. The package and lock files are in `tools/gatekeeper-preview/`.

[GitHub Packages requires a personal access token (classic)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) with `read:packages` to install packages. In a trusted terminal, make it available as an **unexported** shell variable named `GITHUB_PACKAGES_TOKEN`; do not run commands or shell startup hooks from the checkout while it is set. npm supports environment-variable substitution in `.npmrc` ([npm docs](https://docs.npmjs.com/cli/v11/configuring-npm/npmrc/)). Do not put a token value in the repository or commit it.

The first bootstrap is pinned to package files from commit `401ad66901039b124e3eb0e00e34d1af51b2f30f`, because the current protected `main` predates these tooling files. Before using it, the maintainer must independently verify this exact full commit and both package files as the approved bootstrap source; a successful fetch does not establish trust. If this commit is no longer available, use only an independently verified immutable protected-base commit that contains the package files, or stop if no such source is available. Do not infer trust from a commit being a pull request head, and do not substitute the current checkout revision or a branch name.

Check Node before starting npm; this package requires Node 22 or newer. From the trusted terminal, copy only the package manifest and lockfile from the selected commit into a private temporary directory outside the checkout. Run npm there with lifecycle scripts disabled and a temporary project config. The unexported token is passed into the environment of the install process only, then unset; npm does not run any code from the checkout while the token is present.

```sh
set -eu
node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$node_major" -lt 22 ]; then
  printf '%s\n' 'Node.js 22 or newer is required.' >&2
  exit 1
fi

checkout_root="$(git rev-parse --show-toplevel)"
tool_source_revision=401ad66901039b124e3eb0e00e34d1af51b2f30f
# Independently verify this exact revision and files with the maintainer before use.
# After protected main contains both files, replace with its verified full commit SHA.
tool_source_remote=https://github.com/flair-agency/architecture-decision-authoring.git
if ! git -C "$checkout_root" cat-file -e "${tool_source_revision}^{commit}" 2>/dev/null; then
  git -C "$checkout_root" fetch --no-tags "$tool_source_remote" "$tool_source_revision"
fi
git -C "$checkout_root" cat-file -e "${tool_source_revision}^{commit}"
runtime_dir="$(mktemp -d "${TMPDIR:-/tmp}/ada-gatekeeper-preview.XXXXXX")"
cleanup_npm_auth() {
  rm -f "$runtime_dir/.npmrc"
  unset GITHUB_PACKAGES_TOKEN
}
trap cleanup_npm_auth 0
trap 'exit 1' HUP INT TERM

git -C "$checkout_root" show "${tool_source_revision}:tools/gatekeeper-preview/package.json" > "$runtime_dir/package.json"
git -C "$checkout_root" show "${tool_source_revision}:tools/gatekeeper-preview/package-lock.json" > "$runtime_dir/package-lock.json"
printf '%s\n' '//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}' > "$runtime_dir/.npmrc"
(
  cd "$runtime_dir"
  GITHUB_PACKAGES_TOKEN="${GITHUB_PACKAGES_TOKEN:?Set an unexported GitHub Packages token with read:packages}" npm ci --ignore-scripts --registry=https://npm.pkg.github.com
)
rm -f "$runtime_dir/.npmrc"
unset GITHUB_PACKAGES_TOKEN
runtime_bin="$runtime_dir/node_modules/.bin"
printf 'Gatekeeper preview commands: %s/\n' "$runtime_bin"
cd "$checkout_root"
```

The package inputs are only the two files copied from the selected immutable commit; npm also reads the isolated temporary project config. `npm ci` runs from the private temporary directory, and `--ignore-scripts` prevents dependency lifecycle scripts from running during installation. The temporary project config and token are removed before review commands run. Those review commands run from the ADA checkout so Gatekeeper selects this repository's local configuration. Keep `runtime_dir` for this session and remove it after the local review. The install does not modify shared Gatekeeper installations or user/global npm configuration.

The runtime is configured for local/manual version 2 and one self authority: `authoring-product-contract` at the committed `docs/architecture.md` revision. The manifest identifies the self authority at the reviewed Git revision; no external authority is selected.

The consumer-owned prompt, output schema, deterministic decision validation, reviewer model/effort, limits, and timeout are in `.codex/gatekeeper/`. Their selection does not make the review an acceptance gate. The reviewer is configured as `gpt-6-sol` with `low` reasoning and a 180,000 ms review timeout.

Use the installed exact package entry point under `$runtime_bin` with a focused change description, for example:

```sh
"$runtime_bin/architecture-review" "Review the proposed change to [briefly identify changed files and intended responsibility]."
```

The manual CLI runs a model review and validates its structured decision against the committed consumer configuration. It does not implement changes. Keep the input focused and identify the exact proposal/revision being examined.

For a native Skill review, use the same installation's `architecture-review-native` entry point. Prepare a private request with `prepare`, give its exact prompt, schema, model, and reasoning effort to a separate host-native review-only reviewer, save only the returned JSON decision, then pass it to `validate`:

```sh
set -eu
# mktemp uses TMPDIR when set; the XXXXXX template works on macOS and GNU systems.
review_dir="$(mktemp -d "${TMPDIR:-/tmp}/ada-architecture-review.XXXXXX")"
trap 'rm -rf "$review_dir"' 0
trap 'exit 1' HUP INT TERM
request_path="$review_dir/request.json"
decision_path="$review_dir/decision.json"
"$runtime_bin/architecture-review-native" prepare "$request_path" "Review the proposed change to [briefly identify changed files and intended responsibility]."
# Have the host-native review-only reviewer save its returned JSON to "$decision_path".
"$runtime_bin/architecture-review-native" validate "$request_path" "$decision_path"
```

The exit trap removes the private request and decision files on success, failure, or interruption. Do not substitute the manual CLI for the native Skill reviewer. The host-installed `architecture-review` Skill's SHA-256 is `2fab19f48d022fd57d94fc7b3494c03aebb2a7d9f38ed022f58835a98e008a5a`; it byte-matches `skills/architecture-review/SKILL.md` at the pinned preview source commit. Both that Skill and `src/native-review.mjs` are unchanged between Gatekeeper v0.5.1 source `58bbdbb3119736e53a849388a025e74589ab8664` and preview source `c6c45da24d755ddd51b3a595e614242f869ec3ad`; the preview does not claim to correct the historical native-review nonresponse.

## Representative procedure

Use a small, non-sensitive, reviewable proposal or change description and record its exact repository revision and input. Examples of useful probes include:

1. A clearly bounded edit that preserves the standalone authoring responsibility and leaves adoption with the authorized owner. Record the returned semantic decision and authority provenance.
2. A proposal to make proposal generation automatically update the canonical architecture record or to treat a merge/status label as adoption. Check whether the review identifies a conflict with the adoption boundary.
3. An ambiguous proposal that would make the core depend on a downstream Gatekeeper schema or runtime. Check whether it distinguishes the consumer-owned optional handoff from a new core dependency, and routes insufficient authority to `OWNER_DECISION` rather than inventing an owner choice.
4. A material expansion of product scope that the adopted contract does not settle. Check whether the review returns `OWNER_DECISION` and states the unresolved choice without selecting it.
5. An isolated copy of the configuration with a missing or invalid authority selection. Check only the preparation/materialization path and confirm that execution remains incomplete rather than producing a semantic decision. Do not alter the committed authority selection merely to create this probe.

These are suggested manual probes, not claims that any review has been executed. Do not modify the Skill, evaluation cases, expectations, or pilot artifacts as part of this local review.

## Interpret results carefully

After a successful prepare, reviewer invocation, and validation, `PASS`, `BLOCK`, and `OWNER_DECISION` are semantic review outcomes against the selected authority at a recorded commit. They are development feedback only. A reviewer response alone is not a successful review: unavailable authority, preparation/configuration/schema errors, reviewer timeout or failure, malformed output, or deterministic validation failure means **incomplete execution**. Do not translate incomplete execution into PASS, BLOCK, or OWNER_DECISION, and do not treat it as a semantic judgment.

Record the reviewed commit, exact pinned runtime version, selected authority ID and revision, task/input, structured outcome, and any incomplete-execution reason. Preserve that record as diagnostic evidence; do not change adoption status or make a merge/check requirement from it.

## Explicit non-scope

This is an optional local development review. It adds no CI workflow, required check, hook, `OWNER_*` route, merge enforcement, or automatic follow-up. It does not amend `docs/architecture.md`, authorize architecture changes, adopt proposals, or change the standalone product contract. A later proposal to expand these boundaries requires owner review and canonical authority updates before implementation.
