import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { WalletCard } from '../components/WalletCard';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Wallet {
  id: string;
  network: string;
  address: string;
  label: string;
  is_active: boolean;
}

interface UserData {
  current_plan: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: userInfo } = await supabase
        .from('users')
        .select('current_plan')
        .eq('id', user.id)
        .maybeSingle();

      setUserData(userInfo);

      const { data: walletsData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setWallets(walletsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWalletLimit = (plan: string) => {
    if (plan === 'pro') return 30;
    if (plan === 'starter') return 5;
    return 2;
  };

  const canAddWallet = () => {
    if (!userData) return false;
    const limit = getWalletLimit(userData.current_plan);
    return wallets.length < limit;
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
      <Header showMenu />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Plan</span>
              <span className="text-sm font-semibold text-blue-600 uppercase">
                {userData?.current_plan || 'free'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Wallets</span>
              <span className="text-sm font-semibold text-gray-900">
                {wallets.length} / {getWalletLimit(userData?.current_plan || 'free')}
              </span>
            </div>
            {!canAddWallet() && userData?.current_plan !== 'pro' && (
              <button
                onClick={() => navigate('/billing')}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to add more wallets
              </button>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Wallets</h2>
          </div>

          {wallets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No wallets yet</h3>
              <p className="text-gray-600 mb-6">Add your first wallet to start monitoring</p>
              <Button onClick={() => navigate('/onboarding/network')}>
                Add Your First Wallet
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {wallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    label={wallet.label}
                    address={wallet.address}
                    network={wallet.network}
                    isActive={wallet.is_active}
                    onClick={() => navigate(`/wallet/${wallet.id}`)}
                  />
                ))}
              </div>

              {canAddWallet() && (
                <Button
                  fullWidth
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/onboarding/network')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Another Wallet</span>
                  </div>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
