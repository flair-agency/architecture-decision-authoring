#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { cpSync, lstatSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(repository, 'skills', 'architecture-decision-authoring');
const root = mkdtempSync(join(tmpdir(), 'architecture-decision-authoring-archive-'));
const stage = join(root, 'stage');
const extracted = join(root, 'extracted');
const archive = join(root, 'architecture-decision-authoring.zip');
const archiveRoot = 'architecture-decision-authoring';
const required = [
  'LICENSE',
  'SKILL.md',
  'agents/openai.yaml',
  'assets/architecture-decision-proposal.md',
  'references/authority-set-finalization.md',
  'scripts/validate-decision-package.mjs',
  'scripts/validate-decision-package.test.mjs',
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error) throw new Error(`${command} could not run: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed (${result.status ?? result.signal}): ${result.stderr || result.stdout}`);
  return result.stdout;
}

function listFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Skill archive source must not contain symlinks: ${relativePath}`);
    if (entry.isDirectory()) return listFiles(absolutePath, relativePath);
    if (!entry.isFile()) throw new Error(`Skill archive source must contain only regular files: ${relativePath}`);
    return [relativePath];
  }).sort();
}

try {
  const actual = listFiles(source);
  const expected = [...required].sort();
  if (actual.length !== expected.length || actual.some((path, index) => path !== expected[index])) {
    throw new Error(`Skill archive must contain exactly the published seven-file layout. Found: ${actual.join(', ')}`);
  }
  mkdirSync(stage);
  cpSync(source, join(stage, archiveRoot), { recursive: true, errorOnExist: true });
  run('zip', ['-X', '-q', '-r', archive, archiveRoot], { cwd: stage });
  run('unzip', ['-t', archive]);

  const entries = run('unzip', ['-Z1', archive]).trim().split(/\r?\n/).filter(Boolean);
  for (const entry of entries) {
    if (entry.startsWith('/') || entry.includes('\\') || entry.split('/').some((part) => part === '..' || part === '.')) {
      throw new Error(`Unsafe ZIP path: ${entry}`);
    }
  }
  const files = entries.filter((entry) => !entry.endsWith('/')).sort();
  const expectedEntries = required.map((path) => `${archiveRoot}/${path}`).sort();
  if (files.length !== expectedEntries.length || files.some((path, index) => path !== expectedEntries[index])) {
    throw new Error(`ZIP contents do not match the seven-file Skill contract: ${files.join(', ')}`);
  }

  run('unzip', ['-q', archive, '-d', extracted]);
  const extractedSkill = join(extracted, archiveRoot);
  for (const path of required) {
    if (!lstatSync(join(extractedSkill, path)).isFile()) throw new Error(`Extracted file is missing or not regular: ${path}`);
  }
  run(process.execPath, ['--test', join(extractedSkill, 'scripts', 'validate-decision-package.test.mjs')], { cwd: extractedSkill });
  console.log(`Skill ZIP inspect/extract smoke passed: ${archive}`);
  console.log('ZIP contains the exact seven-file published Skill layout; validator tests passed from extracted files.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  // Keep the generated archive and extraction available for CI log follow-up; both live in the OS temp directory.
  console.log(`Temporary smoke workspace: ${root}`);
}
