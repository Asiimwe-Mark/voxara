#!/usr/bin/env node
/**
 * scripts/check-edge-imports.ts
 * ─────────────────────────────────────────────────────────────────
 * Traces the import graph from middleware.ts and all edge-runtime routes
 * to detect Node.js modules that would crash the Edge Runtime.
 *
 * This is a deeper version of the edge-safety check in precheck.ts —
 * it follows transitive imports, not just direct imports.
 *
 * Run: npx ts-node --transpile-only scripts/check-edge-imports.ts
 */

import * as fs   from 'fs';
import * as path from 'path';

const ROOT = process.cwd();

// Node.js built-in modules that crash the Edge Runtime
const NODE_BUILTINS = new Set([
  'crypto', 'fs', 'path', 'os', 'child_process', 'net', 'tls',
  'http', 'https', 'stream', 'buffer', 'util', 'events',
  'worker_threads', 'cluster', 'readline',
]);

// Edge runtime entry points
const EDGE_ENTRIES = [
  'src/middleware.ts',
  'src/lib/security.ts',
  'src/lib/logger.ts',
  'src/lib/rate-limit.ts',
  'src/lib/supabase/middleware.ts',
];

// Already-visited files (avoid infinite loops from circular deps)
const visited = new Set<string>();

// Violations found: { file, importedModule, importedFrom }
const violations: Array<{ file: string; module: string; importedFrom: string }> = [];

function resolveImport(from: string, imp: string): string | null {
  // Handle path aliases
  imp = imp.replace(/^@\//, path.join(ROOT, 'src') + '/');

  const candidates = [
    imp,
    imp + '.ts',
    imp + '.tsx',
    imp + '/index.ts',
    imp + '/index.tsx',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function isNodeBuiltin(mod: string): boolean {
  const bare = mod.replace(/^node:/, '');
  return NODE_BUILTINS.has(bare);
}

function scanFile(filePath: string, importedFrom: string, depth: number) {
  if (visited.has(filePath) || depth > 20) return;
  visited.add(filePath);

  let src: string;
  try { src = fs.readFileSync(filePath, 'utf8'); }
  catch { return; }

  // Match: import X from 'module'  /  import { X } from 'module'  /  import 'module'
  const importRe = /(?:^|\n)\s*import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;

  while ((m = importRe.exec(src)) !== null) {
    const mod = m[1];

    // Direct Node.js built-in
    if (isNodeBuiltin(mod)) {
      violations.push({
        file:         path.relative(ROOT, filePath),
        module:       mod,
        importedFrom: path.relative(ROOT, importedFrom),
      });
      continue;
    }

    // Dynamic import('crypto') — also flagged by Turbopack
    const dynRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let dm: RegExpExecArray | null;
    while ((dm = dynRe.exec(src)) !== null) {
      if (isNodeBuiltin(dm[1])) {
        violations.push({
          file:         path.relative(ROOT, filePath),
          module:       dm[1] + ' (dynamic)',
          importedFrom: path.relative(ROOT, importedFrom),
        });
      }
    }

    // Relative / aliased import — follow transitively
    if (mod.startsWith('.') || mod.startsWith('@/')) {
      const resolved = resolveImport(path.dirname(filePath), mod);
      if (resolved) scanFile(resolved, filePath, depth + 1);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log('\n🔍 Scanning Edge Runtime import graph...\n');

for (const entry of EDGE_ENTRIES) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) continue;
  console.log(`  Entry: ${entry}`);
  scanFile(full, full, 0);
}

if (violations.length === 0) {
  console.log('\n\x1b[32m✓ No Node.js modules detected in Edge Runtime import graph.\x1b[0m\n');
  process.exit(0);
} else {
  console.log(`\n\x1b[31m✗ ${violations.length} Edge Runtime violation(s) found:\x1b[0m\n`);
  const seen = new Set<string>();
  for (const v of violations) {
    const key = `${v.file}:${v.module}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  \x1b[31m${v.file}\x1b[0m`);
    console.log(`    imports Node.js module: \x1b[33m'${v.module}'\x1b[0m`);
    if (v.importedFrom !== v.file) console.log(`    (reached via ${v.importedFrom})`);
  }
  console.log('\n\x1b[90mFix: Move Node.js-only code to *.node.ts files.\x1b[0m\n');
  console.log('\x1b[90mSee: src/lib/security.node.ts for the pattern to follow.\x1b[0m\n');
  process.exit(1);
}
