import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe, STRIPE_PRODUCTS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      );
    }

    const { tier, billingCycle } = await req.json();

    // Validate tier and billing cycle
    if (tier !== 'premium' || !['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier or billing cycle' },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRODUCTS.premium[billingCycle as 'monthly' | 'annual'];
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this subscription' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        tier,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
