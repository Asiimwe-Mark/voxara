# Voxara — Pre-Deploy Testing Guide

## TL;DR — Run This Before Every Deploy

```bash
npm run precheck        # Fast: static checks only (~15s)
npm run precheck:full   # Thorough: includes next build (~90s)
```

---

## What Each Check Catches

| Check | What it finds | How to fix |
|-------|--------------|------------|
| **Edge Runtime safety** | `import crypto from 'crypto'` in middleware-imported files | Move to `*.node.ts`, use Web Crypto API |
| **'use client' placement** | Directive not on line 1 | Remove comments above it, move to top |
| **Unterminated strings** | `logger.error('msg:'',` artifact | Find + remove the stray `'` |
| **Banned patterns** | `Record<string,any>`, `process.exit`, unguarded `env!` | Replace per engineering guidelines |
| **Zod validation** | POST/PUT routes reading body without schema | Add `z.object(...)` and `safeParse()` |
| **Sentry config** | Missing `sentry.*.config.ts` files | Check they weren't deleted |
| **vercel.json** | Invalid JSON | Run `cat vercel.json \| python3 -m json.tool` |
| **Migrations** | Gap in `001_` → `021_` sequence | Rename or add missing migration |
| **Instrumentation** | Missing `src/instrumentation.ts` | Check if accidentally deleted |
| **Error boundaries** | Missing `error.tsx` / `loading.tsx` | Re-create from templates below |
| **TypeScript** | Type errors (like the ones that crashed your build) | Fix per TS error output |
| **ESLint** | Code style + correctness violations | Run `npm run lint:fix` for auto-fixes |
| **next build** | Anything that TypeScript misses at build time | Fix per build error output |

---

## The Three-Command Workflow

### Before pushing a PR
```bash
npm run precheck:quick   # ~8s — catches most structural errors
```

### Before merging to main
```bash
npm run precheck         # ~25s — adds TypeScript + ESLint
```

### Before a production deploy
```bash
npm run precheck:full    # ~90s — full build verification
# or just:
npm run deploy           # `predeploy` hook runs check:all automatically
```

---

## Individual Checks (Run Separately)

```bash
# Trace which Node.js modules leak into the Edge Runtime import graph
npm run check:edge

# TypeScript only
npm run check:types

# ESLint only
npm run check:lint

# All three in sequence
npm run check:all
```

---

## Edge Runtime Errors (The #1 Build Killer)

These errors crash your build with messages like:
```
A Node.js module is loaded ('crypto' at line X) which is not supported in the Edge Runtime.
```

### Root Cause
`middleware.ts` and any file it imports run in the Edge Runtime (V8 isolates).
The Edge Runtime **only** has Web APIs — no Node.js built-ins.

### The Rule
```
middleware.ts
└── src/lib/security.ts         ← Must use Web Crypto API only
└── src/lib/logger.ts           ← Must use console.* only
└── src/lib/rate-limit.ts       ← Must use Upstash HTTP client only
└── src/lib/supabase/middleware.ts ← Must use @supabase/ssr only
```

### The Pattern

**Edge-safe (Web Crypto API)** → `src/lib/security.ts`
```ts
// ✅ Works in Edge, Node.js, and browsers
const key = await globalThis.crypto.subtle.importKey('raw', enc.encode(secret), ...);
```

**Node.js only** → `src/lib/security.node.ts`
```ts
// ✅ Only import from API routes and Inngest functions (never from middleware)
import crypto from 'crypto';  // Node.js only
export function verifyWebhookSignatureHmac(...) { ... }
```

**How to check** (before you push):
```bash
npm run check:edge
```

---

## Common Fixes Reference

### Fix: unterminated string constant
```ts
// BROKEN — has dangling quote
logger.error('Checkout failed:'', { detail: err.message });

// FIXED
logger.error('Checkout failed', { detail: err.message });
```

### Fix: 'use client' placement
```ts
// BROKEN — comment before directive
/**
 * My component
 */
'use client';

// FIXED — directive must be absolute first line
'use client';

/**
 * My component
 */
```

### Fix: Node.js crypto in Edge-imported file
```ts
// BROKEN — in security.ts (imported by middleware)
import crypto from 'crypto';

// FIXED — use Web Crypto API
const hash = await globalThis.crypto.subtle.digest('SHA-256', data);

// OR — move the function to security.node.ts
// and import it only from API routes (not middleware)
```

### Fix: process.exit() in Edge Runtime
```ts
// BROKEN — process.exit() is Node.js-only
if (missing) process.exit(1);

// FIXED — throw instead (works in all runtimes)
if (missing) throw new Error('Missing required environment variable: X');
```

---

## CI Pipeline (GitHub Actions)

The CI pipeline at `.github/workflows/ci.yml` runs 4 jobs automatically on every push:

```
push / PR
  │
  ├── [Job 1] Static Analysis  (~3 min)
  │     ├── check:edge (transitive import scanner)
  │     ├── precheck --quick (structural checks)
  │     ├── tsc --noEmit
  │     └── next lint
  │
  ├── [Job 2] next build  (~8 min, runs after Job 1)
  │
  ├── [Job 3] DB Migrations  (~1 min)
  │     ├── Sequential check
  │     └── SQL syntax validation
  │
  └── [Job 4] Security Audit  (~2 min)
        ├── npm audit --audit-level=high
        ├── Hardcoded secrets scan
        └── .env file committed check
```

All jobs must pass before merging to `main`.

---

## Quick Reference Card

```bash
# Standard workflow
npm run precheck          # Before every commit
npm run deploy            # Deploys (runs check:all first via predeploy hook)

# Debugging specific issues
npm run check:edge        # "Node.js module not supported in Edge Runtime"
npm run check:types       # TypeScript errors
npm run check:lint        # ESLint errors
npx tsc --noEmit 2>&1 | head -50   # Full TS output

# If build fails locally
npx next build 2>&1 | grep -A3 "error\|Error"
```
