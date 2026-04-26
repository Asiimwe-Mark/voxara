/**
 * Structured logger — replaces all bare console.log/warn/error calls.
 *
 * In production (NODE_ENV=production) every line is emitted as a single-line
 * JSON object which is picked up by Vercel Log Drains, Datadog, etc.
 * In development it prints coloured human-readable output.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

function emit(level: Level, message: string, ctx?: LogContext) {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    // Single-line JSON — Vercel picks this up and formats it in Log Drains
    process.stdout.write(
      JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        ...ctx,
      }) + '\n'
    );
  } else {
    const colours: Record<Level, string> = {
      debug: '\x1b[90m',   // grey
      info:  '\x1b[36m',   // cyan
      warn:  '\x1b[33m',   // yellow
      error: '\x1b[31m',   // red
    };
    const reset = '\x1b[0m';
    const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.mmm
    const ctxStr = ctx ? ' ' + JSON.stringify(ctx) : '';
    process.stderr.write(
      `${colours[level]}[${level.toUpperCase()}]${reset} ${ts} ${message}${ctxStr}\n`
    );
  }
}

export const logger = {
  debug: (message: string, ctx?: LogContext) => emit('debug', message, ctx),
  info:  (message: string, ctx?: LogContext) => emit('info', message, ctx),
  warn:  (message: string, ctx?: LogContext) => emit('warn', message, ctx),
  error: (message: string, ctx?: LogContext) => emit('error', message, ctx),
};

export default logger;
