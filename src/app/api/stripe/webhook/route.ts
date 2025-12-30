import { NextRequest, NextResponse } from 'next/server';
import { getStripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { getUsersDb } from '@/lib/db-helper';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
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
        const customerId = session.customer as string;

        if (userId) {
          console.log(`Processing checkout completion for user ${userId}:`, {
            tier,
            customerId,
            subscriptionId: session.subscription,
            paymentStatus: session.payment_status
          });

          // Update user subscription tier and customer ID
          await db.prepare(
            'UPDATE users SET subscription_tier = ?, stripe_customer_id = ? WHERE id = ?'
          ).run(tier, customerId, parseInt(userId));

          console.log(`[OK] User ${userId} subscribed to ${tier} tier with customer ID ${customerId}`);
        } else {
          console.error('checkout.session.completed webhook missing userId in metadata:', {
            sessionId: session.id,
            metadata: session.metadata
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by stripe customer ID
        const user = await db.prepare(
          'SELECT id, email, subscription_tier, subscription_status FROM users WHERE stripe_customer_id = ?'
        ).get(customerId) as { id: number; email: string; subscription_tier: string; subscription_status: string } | undefined;

        if (user) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          
          // Determine tier and status
          // If subscription is canceled but still in current period, keep premium until period ends
          const isCanceled = subscription.cancel_at_period_end;
          const newTier = isActive ? 'premium' : 'free';
          const newStatus = isCanceled ? 'canceled' : subscription.status;
          
          // Use type assertion since Stripe types may not include all runtime properties
          const currentPeriodEnd = (subscription as any).current_period_end;
          const expiresAt = isCanceled && currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null;

          console.log(`Processing subscription ${event.type === 'customer.subscription.created' ? 'creation' : 'update'} for user ${user.id}:`, {
            email: user.email,
            currentTier: user.subscription_tier,
            currentStatus: user.subscription_status,
            newTier,
            newStatus,
            expiresAt,
            subscriptionStatus: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: currentPeriodEnd
          });

          if (expiresAt) {
            await db.prepare(
              'UPDATE users SET subscription_tier = ?, subscription_status = ?, subscription_expires_at = ? WHERE id = ?'
            ).run(newTier, newStatus, expiresAt, user.id);
          } else {
            await db.prepare(
              'UPDATE users SET subscription_tier = ?, subscription_status = ?, subscription_expires_at = NULL WHERE id = ?'
            ).run(newTier, newStatus, user.id);
          }

          console.log(`[OK] User ${user.id} (${user.email}) subscription updated - tier: ${newTier}, status: ${newStatus}, expires: ${expiresAt || 'N/A'}`);
        } else {
          console.error(`customer.subscription.${event.type === 'customer.subscription.created' ? 'created' : 'updated'} - User not found for customer ID:`, customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by stripe customer ID
        const user = await db.prepare(
          'SELECT id, email, subscription_tier FROM users WHERE stripe_customer_id = ?'
        ).get(customerId) as { id: number; email: string; subscription_tier: string } | undefined;

        if (user) {
          console.log(`Processing subscription deletion for user ${user.id}:`, {
            email: user.email,
            currentTier: user.subscription_tier,
            subscriptionStatus: subscription.status
          });

          await db.prepare(
            'UPDATE users SET subscription_tier = ?, subscription_status = ?, subscription_expires_at = NULL WHERE id = ?'
          ).run('free', 'expired', user.id);

          console.log(`[OK] User ${user.id} (${user.email}) subscription canceled - downgraded to free tier`);
        } else {
          console.error('customer.subscription.deleted - User not found for customer ID:', customerId);
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
