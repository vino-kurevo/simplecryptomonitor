import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { StepIndicator } from '../../components/StepIndicator';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function TestNotification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const network = sessionStorage.getItem('onboarding_network');
  const address = sessionStorage.getItem('onboarding_address');
  const label = sessionStorage.getItem('onboarding_label');
  const channels = JSON.parse(sessionStorage.getItem('onboarding_channels') || '[]');

  const handleCreateWallet = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData) {
        await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name,
            current_plan: 'free'
          });
      }

      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          network,
          address,
          label: label || 'My Wallet',
          is_active: true
        });

      if (walletError) throw walletError;

      sessionStorage.removeItem('onboarding_network');
      sessionStorage.removeItem('onboarding_address');
      sessionStorage.removeItem('onboarding_label');
      sessionStorage.removeItem('onboarding_channels');

      setStatus('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Add Wallet" showBack />
      <StepIndicator currentStep={4} totalSteps={4} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to monitor</h2>
            <p className="text-gray-600">Review your setup and start monitoring</p>
          </div>

          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Network</div>
                <div className="font-semibold text-gray-900 capitalize">{network}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Wallet</div>
                <div className="font-semibold text-gray-900">{label}</div>
                <div className="text-sm font-mono text-gray-600 break-all">{address}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Notifications</div>
                <div className="font-semibold text-gray-900 capitalize">
                  {channels.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-green-900">Wallet added successfully!</div>
                <div className="text-sm text-green-700">Redirecting to dashboard...</div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900">Failed to add wallet</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>We'll start monitoring your wallet immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You'll receive alerts for all new transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Connect your notification channels from the dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            size="lg"
            disabled={loading || status === 'success'}
            onClick={handleCreateWallet}
          >
            {loading ? 'Setting up...' : status === 'success' ? 'Success!' : 'Start Monitoring'}
          </Button>
        </div>
      </div>
    </div>
  );
}
