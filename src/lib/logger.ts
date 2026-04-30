/**
 * Structured logger — Edge Runtime compatible.
 *
 * Uses console.* which is supported in ALL Next.js runtimes:
 *   - Node.js (API routes, server components)
 *   - Edge Runtime (middleware, edge routes)
 *   - Browser (client components — filtered out in production)
 *
 * In production: emits single-line JSON (picked up by Vercel Log Drains).
 * In development: emits coloured human-readable lines.
 *
 * Minimum log level controlled by LOG_LEVEL env var (defaults to 'info').
 * Set to 'debug' during development if you need verbose output.
 */

export interface LogContext {
  [key: string]: unknown;
}

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldEmit(level: Level): boolean {
  const configured = (process.env.LOG_LEVEL as Level) ?? 'info';
  return LEVEL_ORDER[level] >= LEVEL_ORDER[configured];
}

function emit(level: Level, message: string, ctx?: LogContext): void {
  if (!shouldEmit(level)) return;

  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    // Single-line JSON — Vercel/Datadog Log Drains pick this up
    const payload = JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...ctx,
    });
    if (level === 'error' || level === 'warn') {
      console.error(payload);
    } else {
      console.log(payload);
    }
  } else {
    const colours: Record<Level, string> = {
      debug: '\x1b[90m',
      info:  '\x1b[36m',
      warn:  '\x1b[33m',
      error: '\x1b[31m',
    };
    const reset = '\x1b[0m';
    const ts = new Date().toISOString().slice(11, 23);
    const ctxStr = ctx ? ' ' + JSON.stringify(ctx) : '';
    const line = `${colours[level]}[${level.toUpperCase()}]${reset} ${ts} ${message}${ctxStr}`;
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }
}

export const logger = {
  debug: (message: string, ctx?: LogContext) => emit('debug', message, ctx),
  info:  (message: string, ctx?: LogContext) => emit('info',  message, ctx),
  warn:  (message: string, ctx?: LogContext) => emit('warn',  message, ctx),
  error: (message: string, ctx?: LogContext) => emit('error', message, ctx),
};

export default logger;