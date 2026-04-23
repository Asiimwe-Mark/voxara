import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = await ratelimit.limit(`auth:reset-password:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many reset requests. Please try again later.' }, { status: 429 });
  }

  const supabase = await createClient();

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email } = body;
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/confirm`;

  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
    redirectTo,
  });

  if (error) {
    console.error('Password reset error:', error);
    // Don't expose whether the email exists — always return success
  }

  return NextResponse.json({ success: true });
}
