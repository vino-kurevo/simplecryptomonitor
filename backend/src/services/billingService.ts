import Stripe from 'stripe';
import { supabase } from '../utils/supabase.js';
import { AppError } from '../utils/errors.js';
import { config } from '../utils/config.js';

const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export const billingService = {
  async getCurrentSubscription(userId: string) {
    const { data, error } = await supabase
      .from('billing_subscriptions')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new AppError('FETCH_FAILED', error.message, 500);
    }

    return data || { plan: 'free', status: 'active' };
  },

  async createStripeCheckoutSession(userId: string, plan: 'starter' | 'pro', returnUrl: string) {
    if (!config.STRIPE_SECRET_KEY) {
      throw new AppError('STRIPE_NOT_CONFIGURED', 'Stripe not configured', 500);
    }

    const { data: user } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    const priceId = plan === 'starter' ? config.STRIPE_STARTER_PRICE_ID : config.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      throw new AppError('PRICE_NOT_CONFIGURED', 'Price ID not configured', 500);
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?cancelled=true`,
      metadata: { user_id: userId, plan },
    });

    return session.url;
  },

  async handleStripeWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (!userId || !plan) break;

        await supabase.from('billing_subscriptions').insert({
          user_id: userId,
          plan,
          status: 'active',
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
        });

        await supabase.from('users').update({ current_plan: plan }).eq('id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('billing_subscriptions')
          .update({ status: subscription.status })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from('billing_subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);

        const { data } = await supabase
          .from('billing_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (data) {
          await supabase.from('users').update({ current_plan: 'free' }).eq('id', data.user_id);
        }
        break;
      }
    }
  },
};
