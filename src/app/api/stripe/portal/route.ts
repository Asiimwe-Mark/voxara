import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { returnUrl } = await request.json();
    const provider = process.env.PAYMENT_PROVIDER || 'lemon-squeezy';

    if (provider === 'lemon-squeezy') {
      return handleLemonSqueezyPortal(user.id, returnUrl);
    } else if (provider === 'flutterwave') {
      // Flutterwave doesn't have a built-in portal, so we redirect to dashboard
      return NextResponse.json({ url: returnUrl || '/dashboard' });
    }

    return NextResponse.json({ error: 'Unknown payment provider' }, { status: 400 });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

async function handleLemonSqueezyPortal(userId: string, returnUrl?: string) {
  // Lemon Squeezy uses customer portal links directly
  // In a real implementation, you would fetch the customer portal link from Lemon Squeezy API
  // For now, return a redirect to the Lemon Squeezy customer portal
  
  const customerPortalUrl = `https://app.lemonsqueezy.com/`;
  
  return NextResponse.json({
    url: customerPortalUrl,
    note: 'Please log in to your Lemon Squeezy account to manage your subscription',
  });
}