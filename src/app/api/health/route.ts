/**
 * GET /api/health
 * Health check endpoint for monitoring, load balancers, and deployment verification.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const services: Record<string, { status: 'ok' | 'degraded' | 'down'; latencyMs?: number }> = {
    database: { status: 'down' },
    env: { status: 'ok' },
  };

  // Check DB
  try {
    const t = Date.now();
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
    services.database = {
      status: !error || error.code === 'PGRST116' ? 'ok' : 'degraded',
      latencyMs: Date.now() - t,
    };
  } catch { services.database = { status: 'down' }; }

  // Check required env vars (without exposing variable names)
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const hasAllEnv = requiredVars.every(v => !!process.env[v]);
  if (!hasAllEnv) services.env = { status: 'degraded' };

  const overall = services.database.status === 'down' ? 'down'
    : Object.values(services).some(s => s.status !== 'ok') ? 'degraded'
    : 'ok';

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    services,
    uptime: process.uptime(),
  }, { status: overall === 'down' ? 503 : overall === 'degraded' ? 207 : 200 });
}
