import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentAdapter } from "@/lib/payment-adapter";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { planType = "free", mode = "subscription", successUrl, cancelUrl, credits } = body;

    // Initialize payment adapter
    const paymentAdapter = createPaymentAdapter();
    const provider = process.env.PAYMENT_PROVIDER || 'Paddle';

    // Create checkout session with payment adapter
    const session = await paymentAdapter.createCheckout({
      userId: user.id,
      email: user.email!,
      amount: getAmountForPlan(planType, mode),
      credits,
      planType: planType as any,
      mode: mode as any,
      successUrl: successUrl ?? `${request.nextUrl.origin}/dashboard?checkout=success`,
      cancelUrl: cancelUrl ?? `${request.nextUrl.origin}/pricing?checkout=cancelled`,
      metadata: {
        provider,
        created_at: new Date().toISOString(),
      },
    });

    // Store payment session in database for tracking
    const { error: insertError } = await supabase.from('payment_sessions').insert({
      user_id: user.id,
      provider,
      session_id: session.id,
      plan_type: planType,
      credits,
      metadata: session.metadata,
      status: 'pending',
    });

    if (insertError) {
      console.warn('Failed to store payment session:', insertError);
      // Don't fail checkout if DB insert fails
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

function getAmountForPlan(planType: string, mode: string): number {
  // For credit packs
  if (mode === 'payment') {
    const creditMap: Record<string, number> = {
      '10': 9.99,
      '25': 19.99,
      '50': 29.99,
    };
    return creditMap[planType] || 19.99;
  }

  // For subscriptions
  const subscriptionMap: Record<string, number> = {
    'pro': 19.99, // monthly
    'agency': 49.99, // monthly
    'free': 0,
  };
  return subscriptionMap[planType] || 0;
}
