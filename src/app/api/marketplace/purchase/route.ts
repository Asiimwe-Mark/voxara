import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentAdapter } from '@/lib/payment-adapter';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { templateId?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.templateId) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
  }

  const { data: template } = await supabase
    .from('marketplace_templates')
    .select('id, name, price, creator_id')
    .eq('id', body.templateId)
    .eq('status', 'published')
    .single();

  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  // Free templates — record the download and preserve the buyer record
  if (template.price === 0) {
    await supabase.from('template_purchases').upsert(
      { buyer_id: user.id, template_id: template.id, amount_paid: 0 } as never,
      { onConflict: 'buyer_id_template_id' }
    );
    await supabase.rpc('increment_template_downloads', { template_id: template.id });
    return NextResponse.json({ success: true, free: true });
  }

  // Paid templates — limit support to Flutterwave for arbitrary marketplace amounts
  if (((process.env.PAYMENT_PROVIDER ?? 'paddle').toLowerCase()) === 'paddle') {
    return NextResponse.json({
      error: 'Paid marketplace purchases are not supported with Paddle. Use Flutterwave or configure Paddle price IDs for marketplace products.',
    }, { status: 400 });
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (!email) return NextResponse.json({ error: 'User email not found' }, { status: 400 });

    const paymentAdapter = createPaymentAdapter();
    const session = await paymentAdapter.createCheckout({
      userId: user.id,
      email,
      amount: template.price,
      mode: 'payment',
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace?purchase=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace`,
      metadata: {
        template_id: template.id,
        type: 'template_purchase',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('Marketplace purchase error', { detail: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
