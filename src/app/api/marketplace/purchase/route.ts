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

  // Free templates — just record the download
  if (template.price === 0) {
    await supabase.from('template_purchases').upsert(
      { user_id: user.id, template_id: template.id, amount_paid: 0 },
      { onConflict: 'user_id,template_id' }
    );
    await supabase.rpc('increment_template_downloads', { template_id: template.id });
    return NextResponse.json({ success: true, free: true });
  }

  // Paid templates — create checkout session via payment adapter
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
    console.error('Marketplace purchase error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
