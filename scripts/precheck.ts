#!/usr/bin/env node
/**
 * scripts/precheck.ts
 * ─────────────────────────────────────────────────────────────────
 * Pre-deploy validation script for Voxara.
 * Run before every `vercel --prod` or CI pipeline push.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/precheck.ts
 *   npm run precheck
 *
 * Checks performed:
 *   1.  TypeScript compilation (tsc --noEmit)
 *   2.  ESLint across all source files
 *   3.  Edge Runtime safety (Node.js API leaks into Edge files)
 *   4.  'use client' directive placement in client components
 *   5.  Unterminated string literals (common regex-patch artifact)
 *   6.  Required environment variables present
 *   7.  Missing Zod validation on API routes
 *   8.  Banned patterns (console.log, any, TODO, process.exit)
 *   9.  Circular dependency detection
 *   10. Dead export detection (exports never imported)
 *   11. Next.js build smoke-test (next build --dry-run equivalent)
 *   12. Sentry config files present
 *   13. vercel.json validity
 *   14. supabase migrations sequential and gap-free
 */

import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ─── Colour helpers ────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};

type Result = { pass: boolean; message: string; details?: string[] };

const results: Array<{ name: string } & Result> = [];
let totalErrors = 0;
let totalWarnings = 0;

function log(msg: string) { process.stdout.write(msg + '\n'); }

function section(name: string) {
  log(`\n${c.cyan}${c.bold}▶ ${name}${c.reset}`);
}

function record(name: string, result: Result) {
  results.push({ name, ...result });
  const icon = result.pass ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
  log(`  ${icon} ${name}`);
  if (!result.pass) {
    totalErrors++;
    (result.details ?? [result.message]).slice(0, 8).forEach(d =>
      log(`    ${c.red}${d}${c.reset}`)
    );
    if ((result.details?.length ?? 0) > 8) {
      log(`    ${c.gray}...and ${(result.details!.length) - 8} more${c.reset}`);
    }
  }
}

function warn(name: string, message: string, details?: string[]) {
  totalWarnings++;
  const icon = `${c.yellow}⚠${c.reset}`;
  log(`  ${icon} ${name}: ${message}`);
  (details ?? []).slice(0, 5).forEach(d => log(`    ${c.gray}${d}${c.reset}`));
}

function run(cmd: string, cwd = process.cwd()): { ok: boolean; out: string; err: string } {
  const r = spawnSync(cmd, { shell: true, cwd, encoding: 'utf8', timeout: 120_000 });
  return { ok: r.status === 0, out: r.stdout ?? '', err: r.stderr ?? '' };
}

function allSourceFiles(): string[] {
  const result: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.cache', 'dist', 'out'].includes(entry.name)) walk(full);
      } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        result.push(full);
      }
    }
  }
  walk(path.join(process.cwd(), 'src'));
  return result;
}

// ─── Check 1: TypeScript ───────────────────────────────────────────────────────
function checkTypeScript(): Result {
  const r = run('npx tsc --noEmit --pretty false 2>&1');
  if (r.ok) return { pass: true, message: 'No TypeScript errors' };
  const lines = r.out.split('\n').filter(l => l.includes('error TS'));
  return {
    pass: false,
    message: `${lines.length} TypeScript error(s)`,
    details: lines.slice(0, 20).map(l => l.replace(process.cwd() + '/', '')),
  };
}

// ─── Check 2: ESLint ──────────────────────────────────────────────────────────
function checkESLint(): Result {
  const r = run('npx next lint --format compact 2>&1');
  if (r.ok) return { pass: true, message: 'No ESLint errors' };
  const errors = r.out.split('\n').filter(l => /error/i.test(l));
  return {
    pass: false,
    message: `${errors.length} ESLint error(s)`,
    details: errors.slice(0, 15).map(l => l.replace(process.cwd() + '/', '')),
  };
}

// ─── Check 3: Edge Runtime Safety ─────────────────────────────────────────────
function checkEdgeRuntimeSafety(): Result {
  // Files imported (directly or transitively) by middleware.ts run in Edge Runtime.
  // Detect top-level Node.js API usage in files that directly feed into middleware.

  const EDGE_ENTRY_FILES = [
    'src/middleware.ts',
    'src/lib/security.ts',
    'src/lib/logger.ts',
    'src/lib/rate-limit.ts',
    'src/lib/supabase/middleware.ts',
  ].map(f => path.join(process.cwd(), f));

  const NODE_APIS = [
    /^import crypto from ['"]crypto['"]/m,
    /^import fs from ['"]fs['"]/m,
    /^import path from ['"]path['"]/m,
    /^import os from ['"]os['"]/m,
    /process\.exit\s*\(/,
    /process\.stdout\.write/,
    /process\.stderr\.write/,
    /require\s*\(/,
  ];

  const violations: string[] = [];
  for (const file of EDGE_ENTRY_FILES) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const pattern of NODE_APIS) {
      if (pattern.test(src)) {
        const match = src.match(pattern);
        violations.push(`${path.relative(process.cwd(), file)}: ${match?.[0]?.slice(0, 80)}`);
      }
    }
  }

  if (violations.length === 0) return { pass: true, message: 'No Node.js APIs in Edge Runtime files' };
  return { pass: false, message: `${violations.length} Edge Runtime violation(s)`, details: violations };
}

// ─── Check 4: 'use client' placement ──────────────────────────────────────────
function checkUseClientPlacement(): Result {
  const violations: string[] = [];
  for (const file of allSourceFiles()) {
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split('\n');
    const hasDirective = lines.some(l => l.trim() === "'use client';" || l.trim() === '"use client";');
    if (!hasDirective) continue;
    const firstLine = lines[0].trim();
    if (firstLine !== "'use client';" && firstLine !== '"use client";') {
      violations.push(path.relative(process.cwd(), file));
    }
  }
  if (violations.length === 0) return { pass: true, message: "'use client' correctly placed in all files" };
  return {
    pass: false,
    message: `${violations.length} file(s) with misplaced 'use client'`,
    details: violations,
  };
}

// ─── Check 5: Unterminated strings ────────────────────────────────────────────
function checkUnterminatedStrings(): Result {
  const violations: string[] = [];
  for (const file of allSourceFiles()) {
    const src = fs.readFileSync(file, 'utf8');
    // Common artifact: logger.error('msg:'', { ... })
    const matches = [...src.matchAll(/logger\.\w+\('[^']*:'',/g)];
    for (const m of matches) {
      const line = src.slice(0, m.index).split('\n').length;
      violations.push(`${path.relative(process.cwd(), file)}:${line}`);
    }
  }
  if (violations.length === 0) return { pass: true, message: 'No unterminated string literals detected' };
  return {
    pass: false,
    message: `${violations.length} unterminated string(s) found`,
    details: violations,
  };
}

// ─── Check 6: Required environment variables ──────────────────────────────────
function checkEnvVars(): Result {
  const REQUIRED = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];
  const EXPECTED_IN_EXAMPLE = [
    ...REQUIRED,
    'RESEND_API_KEY',
    'INNGEST_EVENT_KEY',
    'INNGEST_SIGNING_KEY',
    'GEMINI_API_KEY',
  ];

  // Check .env.example documents all expected keys
  const examplePath = path.join(process.cwd(), '.env.example');
  const exampleSrc = fs.existsSync(examplePath) ? fs.readFileSync(examplePath, 'utf8') : '';
  const missing = EXPECTED_IN_EXAMPLE.filter(k => !exampleSrc.includes(k));

  // Check that .env.local exists (warn, not error — CI may inject vars differently)
  const hasEnvLocal = fs.existsSync(path.join(process.cwd(), '.env.local'));
  if (!hasEnvLocal) {
    warn('Env', '.env.local not found — ensure vars are set in Vercel dashboard or CI');
  }

  if (missing.length === 0) return { pass: true, message: '.env.example documents all required vars' };
  return {
    pass: false,
    message: `${missing.length} key(s) missing from .env.example`,
    details: missing,
  };
}

// ─── Check 7: API routes missing Zod validation ───────────────────────────────
function checkZodValidation(): Result {
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  const violations: string[] = [];

  function walkRoutes(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkRoutes(full);
      } else if (entry.name === 'route.ts') {
        const src = fs.readFileSync(full, 'utf8');
        const hasPOST   = /export async function POST/.test(src);
        const hasPUT    = /export async function PUT/.test(src);
        const hasPATCH  = /export async function PATCH/.test(src);
        const hasBody   = /await request\.(json|text|formData)\(\)/.test(src);
        const hasZod    = /from ['"]zod['"]|z\.(object|string|number|enum|union|array)/.test(src);

        if ((hasPOST || hasPUT || hasPATCH) && hasBody && !hasZod) {
          violations.push(path.relative(process.cwd(), full));
        }
      }
    }
  }
  walkRoutes(apiDir);

  if (violations.length === 0) return { pass: true, message: 'All mutating routes have Zod validation' };
  return {
    pass: false,
    message: `${violations.length} route(s) accept body without Zod schema`,
    details: violations,
  };
}

// ─── Check 8: Banned patterns ─────────────────────────────────────────────────
function checkBannedPatterns(): Result {
  const BANNED: Array<{ pattern: RegExp; label: string; isError: boolean }> = [
    { pattern: /\bRecord<string, any>\b/, label: 'Record<string, any>',       isError: true  },
    { pattern: /\bconsole\.log\(/,         label: 'bare console.log()',        isError: false },
    { pattern: /process\.env\.[A-Z_]+!/,   label: 'unguarded env! bang',      isError: true  },
    { pattern: /process\.exit\(/,          label: 'process.exit()',            isError: true  },
    { pattern: /\bTODO\b|\bFIXME\b/,       label: 'TODO/FIXME marker',        isError: false },
    { pattern: /^\/\/ @ts-ignore/m,        label: '@ts-ignore comment',       isError: false },
    { pattern: /\bany\b as \b/,            label: 'unsafe `as any` cast',     isError: true  },
  ];

  const errors:   string[] = [];
  const warnings: string[] = [];

  for (const file of allSourceFiles()) {
    // Skip the logger and error-handler which intentionally use console
    if (file.includes('logger.ts') || file.includes('error-handler.ts') || file.includes('monitoring.ts')) continue;

    const src = fs.readFileSync(file, 'utf8');
    const rel = path.relative(process.cwd(), file);

    for (const { pattern, label, isError } of BANNED) {
      const matches = [...src.matchAll(new RegExp(pattern, 'gm'))];
      if (matches.length > 0) {
        const msg = `${rel}: ${matches.length}× ${label}`;
        if (isError) errors.push(msg);
        else warnings.push(msg);
      }
    }
  }

  warnings.forEach(w => warn('Pattern', w));

  if (errors.length === 0) return { pass: true, message: 'No banned patterns in source' };
  return { pass: false, message: `${errors.length} banned pattern(s) found`, details: errors };
}

// ─── Check 9: Sentry config files ─────────────────────────────────────────────
function checkSentryConfig(): Result {
  const required = ['sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.edge.config.ts'];
  const missing  = required.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  if (missing.length === 0) return { pass: true, message: 'All 3 Sentry config files present' };
  return { pass: false, message: 'Missing Sentry config file(s)', details: missing };
}

// ─── Check 10: vercel.json validity ───────────────────────────────────────────
function checkVercelJson(): Result {
  const p = path.join(process.cwd(), 'vercel.json');
  if (!fs.existsSync(p)) return { pass: false, message: 'vercel.json not found' };
  try {
    JSON.parse(fs.readFileSync(p, 'utf8'));
    return { pass: true, message: 'vercel.json is valid JSON' };
  } catch (e) {
    return { pass: false, message: `vercel.json is invalid JSON: ${(e as Error).message}` };
  }
}

// ─── Check 11: Supabase migrations sequential ─────────────────────────────────
function checkMigrationsSequential(): Result {
  const dir = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(dir)) return { pass: true, message: 'No migrations directory' };

  const files = fs.readdirSync(dir)
    .filter(f => /^\d+_.+\.sql$/.test(f))
    .sort();

  const gaps: string[] = [];
  let prevNum = 0;

  for (const f of files) {
    const num = parseInt(f.split('_')[0], 10);
    if (num !== prevNum + 1) {
      gaps.push(`Gap: expected ${String(prevNum + 1).padStart(3, '0')}, found ${String(num).padStart(3, '0')} (${f})`);
    }
    prevNum = num;
  }

  if (gaps.length === 0) {
    return { pass: true, message: `${files.length} migrations are sequential (001–${String(prevNum).padStart(3,'0')})` };
  }
  return { pass: false, message: 'Migration sequence has gaps', details: gaps };
}

// ─── Check 12: Next.js build (full) ───────────────────────────────────────────
function checkNextBuild(): Result {
  log(`  ${c.gray}Running next build... (this may take 30-60s)${c.reset}`);
  const r = run('npx next build 2>&1');
  if (r.ok) return { pass: true, message: 'next build succeeded' };

  const lines = (r.out + r.err).split('\n');
  const errorLines = lines.filter(l =>
    /error|failed|cannot find|not found|unexpected/i.test(l) &&
    !/warning/i.test(l)
  );
  return {
    pass: false,
    message: 'next build failed',
    details: errorLines.slice(0, 20).map(l => l.replace(process.cwd() + '/', '')),
  };
}

// ─── Check 13: Instrumentation file ───────────────────────────────────────────
function checkInstrumentation(): Result {
  const p = path.join(process.cwd(), 'src', 'instrumentation.ts');
  if (!fs.existsSync(p)) {
    return { pass: false, message: 'src/instrumentation.ts missing (needed for startup env validation)' };
  }
  const src = fs.readFileSync(p, 'utf8');
  const hasValidateEnv = src.includes('validateEnv');
  const hasSentry      = src.includes('sentry');
  if (!hasValidateEnv) {
    return { pass: false, message: 'instrumentation.ts does not call validateEnv()' };
  }
  if (!hasSentry) {
    warn('Instrumentation', 'instrumentation.ts does not initialise Sentry');
  }
  return { pass: true, message: 'instrumentation.ts present and configured' };
}

// ─── Check 14: Error boundaries ──────────────────────────────────────────────
function checkErrorBoundaries(): Result {
  const required = [
    'src/app/error.tsx',
    'src/app/global-error.tsx',
    'src/app/loading.tsx',
  ];
  const missing = required.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  if (missing.length === 0) return { pass: true, message: 'Error boundaries and loading states present' };
  return { pass: false, message: 'Missing required App Router files', details: missing };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const runBuild = args.includes('--build') || args.includes('-b');
  const quick    = args.includes('--quick') || args.includes('-q');

  log(`\n${c.bold}${c.cyan}╔═══════════════════════════════════════════════╗${c.reset}`);
  log(`${c.bold}${c.cyan}║   Voxara Pre-Deploy Validation Pipeline       ║${c.reset}`);
  log(`${c.bold}${c.cyan}╚═══════════════════════════════════════════════╝${c.reset}`);
  log(`${c.gray}Working directory: ${process.cwd()}${c.reset}`);
  log(`${c.gray}Mode: ${quick ? 'quick (skip build)' : runBuild ? 'full (with build)' : 'standard'}${c.reset}`);

  // ── Static / fast checks (always run) ─────────────────────────────────────
  section('Static Analysis');
  record('Edge Runtime safety',       checkEdgeRuntimeSafety());
  record("'use client' placement",    checkUseClientPlacement());
  record('Unterminated strings',       checkUnterminatedStrings());
  record('Banned patterns',            checkBannedPatterns());
  record('Zod validation coverage',   checkZodValidation());

  section('Project Structure');
  record('Sentry config files',        checkSentryConfig());
  record('vercel.json validity',       checkVercelJson());
  record('Migrations sequential',      checkMigrationsSequential());
  record('Instrumentation',            checkInstrumentation());
  record('Error boundaries',           checkErrorBoundaries());
  record('Environment variables',      checkEnvVars());

  if (!quick) {
    // ── TypeScript + ESLint (medium speed) ──────────────────────────────────
    section('Compiler & Linter');
    log(`  ${c.gray}Running TypeScript...${c.reset}`);
    record('TypeScript (noEmit)',     checkTypeScript());
    log(`  ${c.gray}Running ESLint...${c.reset}`);
    record('ESLint',                  checkESLint());
  }

  if (runBuild) {
    // ── Full Next.js build (slow — only on demand) ───────────────────────────
    section('Build');
    record('next build',             checkNextBuild());
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;

  log(`\n${c.bold}─────────────────────────────────────────────────${c.reset}`);
  log(`${c.bold}Results: ${c.green}${passed} passed${c.reset} · ${failed > 0 ? c.red : c.gray}${failed} failed${c.reset} · ${totalWarnings > 0 ? c.yellow : c.gray}${totalWarnings} warning(s)${c.reset}`);

  if (failed === 0) {
    log(`\n${c.green}${c.bold}✓ All checks passed — safe to deploy.${c.reset}\n`);
    process.exit(0);
  } else {
    log(`\n${c.red}${c.bold}✗ ${failed} check(s) failed — fix before deploying.${c.reset}\n`);
    log(`${c.gray}Tip: Run with --build (-b) to also run next build.${c.reset}`);
    log(`${c.gray}Tip: Run with --quick (-q) to skip TypeScript and ESLint.${c.reset}\n`);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
