import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { getUsersDb } from '@/lib/db-helper';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const db = getUsersDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Database unavailable' },
      { status: 503 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier || 'premium';

        if (userId) {
          // Update user subscription tier
          await db.prepare(
            'UPDATE users SET subscription_tier = ?, stripe_customer_id = ? WHERE id = ?'
          ).run(tier, session.customer as string, parseInt(userId));

          console.log(`User ${userId} subscribed to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by stripe customer ID
        const user = await db.prepare(
          'SELECT id FROM users WHERE stripe_customer_id = ?'
        ).get(customerId) as { id: number } | undefined;

        if (user) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          const newTier = isActive ? 'premium' : 'free';

          await db.prepare(
            'UPDATE users SET subscription_tier = ? WHERE id = ?'
          ).run(newTier, user.id);

          console.log(`User ${user.id} subscription ${event.type === 'customer.subscription.created' ? 'created' : 'updated'} - tier: ${newTier}, status: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by stripe customer ID
        const user = await db.prepare(
          'SELECT id FROM users WHERE stripe_customer_id = ?'
        ).get(customerId) as { id: number } | undefined;

        if (user) {
          await db.prepare(
            'UPDATE users SET subscription_tier = ? WHERE id = ?'
          ).run('free', user.id);

          console.log(`User ${user.id} subscription canceled`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
