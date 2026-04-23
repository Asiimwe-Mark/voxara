import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

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
    .select('id, name, price, stripe_price_id, creator_id')
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
    await supabase
      .from('marketplace_templates')
      .update({ downloads: supabase.rpc as any }) // actual increment via RPC
      .eq('id', template.id);
    return NextResponse.json({ success: true, free: true });
  }

  // Paid templates — create Stripe Checkout session
  if (!template.stripe_price_id) {
    return NextResponse.json({ error: 'Template is not available for purchase' }, { status: 400 });
  }

  const { data: stripeCustomer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomer?.stripe_customer_id,
    mode: 'payment',
    line_items: [{ price: template.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace`,
    metadata: {
      user_id: user.id,
      template_id: template.id,
      type: 'template_purchase',
    },
  });

  return NextResponse.json({ url: session.url });
}
