import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { email?: string; organizationId?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, organizationId, role } = body;

  if (!email || !organizationId || !role) {
    return NextResponse.json(
      { error: 'email, organizationId, and role are required' },
      { status: 400 }
    );
  }

  const validRoles = ['admin', 'member', 'viewer'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
  }

  // Verify caller is owner/admin of the org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
  }

  // Check if invite already exists for this email + org
  const { data: existingInvite } = await supabase
    .from('organization_invites')
    .select('id, expires_at')
    .eq('organization_id', organizationId)
    .eq('email', email)
    .maybeSingle();

  // If there's a valid (non-expired) invite, don't create a duplicate
  if (existingInvite && new Date(existingInvite.expires_at) > new Date()) {
    return NextResponse.json(
      { error: 'A pending invitation already exists for this email' },
      { status: 409 }
    );
  }

  // Create (or re-create) the invite token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const { data: invite, error } = await supabase
    .from('organization_invites')
    .upsert(
      {
        organization_id: organizationId,
        email,
        role,
        invited_by: user.id,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'organization_id,email' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch org name for the email
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single();

  const orgName = org?.name ?? 'your team';
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;

  await resend.emails.send({
    from: 'voxara <team@voxara.app>',
    to: [email],
    subject: `You're invited to join ${orgName} on voxara`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>You've been invited!</h2>
        <p><strong>${user.email}</strong> invited you to join <strong>${orgName}</strong> on voxara as a <strong>${role}</strong>.</p>
        <p>This invite expires in 7 days.</p>
        <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:6px;margin:16px 0">Accept Invitation</a>
        <p style="color:#6b7280;font-size:12px">If you weren't expecting this, you can ignore this email.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true, inviteId: invite.id });
}
