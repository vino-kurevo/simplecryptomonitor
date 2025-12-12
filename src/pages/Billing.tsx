import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  current?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: [
      'Up to 2 wallets',
      'Telegram + Email notifications',
      'All supported networks',
      'Basic monitoring'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$4.99',
    features: [
      'Up to 30 wallets',
      'Telegram + Email notifications',
      'All supported networks',
      'Faster monitoring',
      'Priority alert delivery'
    ]
  }
];

export function Billing() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentPlan();
  }, [user]);

  const loadCurrentPlan = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('users')
        .select('current_plan')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setCurrentPlan(data.current_plan);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    if (planId === 'pro') {
      alert('Stripe integration coming soon! You will be able to upgrade to Pro plan.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Billing" showBack />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your plan</h2>
            <p className="text-gray-600">Simple, transparent pricing</p>
          </div>

          <div className="space-y-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl p-6 border-2 transition-all ${
                    isCurrent ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  {isCurrent && (
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full mb-3">
                      Current Plan
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      {plan.price !== '$0' && <span className="text-gray-600">/month</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrent && (
                    <Button
                      fullWidth
                      size="lg"
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plan.id === 'free' ? 'Downgrade' : 'Upgrade to Pro'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Need more than 30 wallets?</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium mt-1">
              Contact us for enterprise pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
