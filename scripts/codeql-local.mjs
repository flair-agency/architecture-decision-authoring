#!/usr/bin/env node
// Adapted from flair-agency/architecture-gatekeeper scripts/codeql-local.mjs
// Source commit: 38e56232a7ce06ee431a5a2e25e85ddccb837daa.
// Copyright (c) 2026 Flair Agency; MIT License (see repository LICENSE).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaults = { spawnSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync, homedir, fileURLToPath, process, console };

export function runCodeql(overrides = {}) {
  const { spawnSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync, homedir, fileURLToPath, process, console } = { ...defaults, ...overrides };
  const source = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
  const binary = process.platform === 'win32' ? 'codeql.exe' : 'codeql';
  const scanRoot = join(homedir(), '.local/share/architecture-decision-authoring/codeql');
  function run(args) {
    const result = spawnSync(binary, args, { stdio: 'inherit' });
    if (result.error?.code === 'ENOENT') {
      console.error(`CodeQL CLI was not found: ${binary}
  Install the official CodeQL bundle for your OS:
  https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/scan-from-the-command-line/set-up-codeql-cli
  Add its codeql directory to PATH (Windows: the directory containing codeql.exe).
  Then run npm run codeql again.`);
      process.exit(1);
    }
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`CodeQL failed (${result.status ?? result.signal}); see scan logs.`);
  }
  run(['version']);
  function requireOutsideRepository(root) {
    const rel = relative(source, root);
    if (rel === '' || (!rel.startsWith('..' + sep) && rel !== '..' && !isAbsolute(rel))) throw new Error('The CodeQL output directory must be outside the repository.');
  }
  // Resolve existing ancestors before creating anything, including symlinked parents.
  let ancestor = resolve(scanRoot);
  while (!existsSync(ancestor)) {
    const parent = dirname(ancestor);
    if (resolve(parent) === resolve(ancestor)) {
      throw new Error('Could not find an existing parent for the CodeQL output directory.');
    }
    ancestor = parent;
  }
  const plannedRoot = resolve(realpathSync(ancestor), relative(ancestor, resolve(scanRoot)));
  requireOutsideRepository(plannedRoot);
  mkdirSync(plannedRoot, { recursive: true });
  const physicalRoot = realpathSync(plannedRoot);
  requireOutsideRepository(physicalRoot);
  const scan = mkdtempSync(join(physicalRoot, 'scan-'));
  console.log(`CodeQL output: ${scan}`);
  const summary = { source, binary, scan, startedAt: new Date().toISOString(), languages: [] };
  writeFileSync(join(scan, 'summary.json'), JSON.stringify(summary, null, 2));
  for (const [language, suite] of [['javascript-typescript', 'javascript'], ['actions', 'actions']]) {
    const db = join(scan, `db-${suite}`);
    run(['database', 'create', db, `--language=${language}`, `--source-root=${source}`, '--threads=2', '--ram=4096']);
    const sarif = join(scan, `${suite}.sarif`);
    run(['database', 'analyze', db, `codeql/${suite}-queries:codeql-suites/${suite}-code-scanning.qls`, '--threat-model=local', '--format=sarif-latest', `--output=${sarif}`, '--threads=2', '--ram=4096']);
    const results = JSON.parse(readFileSync(sarif, 'utf8')).runs.flatMap(run => run.results || []);
    const counts = {};
    for (const finding of results) counts[finding.ruleId] = (counts[finding.ruleId] || 0) + 1;
    summary.languages.push({ language, sarif, findings: results.length, rules: counts });
    writeFileSync(join(scan, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(`${language}: ${results.length} findings`);
  }
  summary.completedAt = new Date().toISOString();
  writeFileSync(join(scan, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('Analysis completed. Review SARIF findings before committing; successful execution does not mean zero findings.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCodeql();
