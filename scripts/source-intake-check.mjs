#!/usr/bin/env node
/**
 * Stage A.1 — local-only development helper.
 *
 * Inventories files under local-source-materials/ so a human can see what
 * has been placed there before Stage B review, WITHOUT ever reading,
 * parsing, printing, summarizing, or transmitting file *content*. Only
 * filesystem metadata (name, extension, size, hash) is computed and printed.
 *
 * This script:
 *   - is intentionally NOT wired into `npm run build`, `npm run test`,
 *     production startup, or any GitHub Actions workflow.
 *   - makes zero network calls.
 *   - never logs a file's text content, only its metadata.
 *
 * Run manually with: npm run source:intake-check
 */
import { createHash } from 'node:crypto';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INTAKE_DIR = path.join(ROOT, 'local-source-materials');

// Files that are part of the tracked scaffold itself, not source-material
// intake, and should not be inventoried as if they were an export.
const IGNORED_RELATIVE_PATHS = new Set(['README.md']);

// Extensions this project can plausibly review as text/document evidence.
// Anything outside this list is flagged, not blocked — a human decides what
// to do with an unsupported file, this script only reports.
const SUPPORTED_EXTENSIONS = new Set(['.md', '.txt', '.csv', '.pdf', '.docx', '.doc', '.html', '.htm']);

/** @returns {{relPath: string, name: string, ext: string, sizeBytes: number}[]} */
function walk(dir, baseDir) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).split(path.sep).join('/');
    if (IGNORED_RELATIVE_PATHS.has(relPath)) continue;
    if (entry.isDirectory()) {
      results.push(...walk(fullPath, baseDir));
    } else if (entry.isFile()) {
      const stats = statSync(fullPath);
      results.push({
        relPath,
        name: entry.name,
        ext: path.extname(entry.name).toLowerCase(),
        sizeBytes: stats.size,
        fullPath,
      });
    }
  }
  return results;
}

function hashFile(fullPath) {
  // Metadata only: a content-addressed hash is used purely to detect
  // whether a file changed between runs, never to inspect or reproduce its
  // content. The hash itself reveals nothing about the file's text.
  const buf = readFileSync(fullPath);
  return createHash('sha256').update(buf).digest('hex');
}

function main() {
  console.log('Stage A.1 local source intake inventory');
  console.log(`Scanning: ${path.relative(ROOT, INTAKE_DIR)}/`);
  console.log('(metadata only — no file content is read, printed, or transmitted)\n');

  const files = walk(INTAKE_DIR, INTAKE_DIR);

  if (files.length === 0) {
    console.log('No source files found (expected until files are manually exported —');
    console.log('see docs/survival-guide-required-source-checklist.md).');
    return;
  }

  const basenameCounts = new Map();
  for (const f of files) {
    basenameCounts.set(f.name, (basenameCounts.get(f.name) ?? 0) + 1);
  }

  let emptyCount = 0;
  let unsupportedCount = 0;
  let duplicateCount = 0;

  for (const f of files) {
    const hash = hashFile(f.fullPath);
    const flags = [];
    if (f.sizeBytes === 0) {
      flags.push('EMPTY');
      emptyCount++;
    }
    if (!SUPPORTED_EXTENSIONS.has(f.ext)) {
      flags.push('UNSUPPORTED_TYPE');
      unsupportedCount++;
    }
    if ((basenameCounts.get(f.name) ?? 0) > 1) {
      flags.push('DUPLICATE_FILENAME');
      duplicateCount++;
    }

    console.log(
      `${f.relPath} | ext=${f.ext || '(none)'} | size=${f.sizeBytes}B | sha256=${hash}` +
        (flags.length ? ` | FLAGS: ${flags.join(', ')}` : ''),
    );
  }

  console.log(`\n${files.length} file(s) inventoried. Empty: ${emptyCount}. Unsupported type: ${unsupportedCount}. Duplicate filenames: ${duplicateCount}.`);
  console.log('\nReminder: this report does not confirm any file is a genuine, approved,');
  console.log('or sufficient source. Complete docs/survival-guide-source-intake-template.md');
  console.log('and the checklist in docs/survival-guide-required-source-checklist.md before');
  console.log('using any of these files in Stage B.');
}

main();
