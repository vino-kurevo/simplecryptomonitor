import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell, CheckCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { WalletCard } from '../components/WalletCard';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

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

interface NotificationStatus {
  telegram_connected: boolean;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>({ telegram_connected: false });
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

      if (session?.access_token) {
        try {
          const telegramStatus = await api.telegram.getStatus(session.access_token);
          setNotificationStatus({ telegram_connected: telegramStatus.connected });
        } catch (err) {
          console.error('Error loading notification status:', err);
        }
      }
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

          <button
            onClick={() => navigate('/notifications')}
            className="w-full bg-white rounded-xl p-4 mb-6 border border-gray-200 hover:border-blue-300 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {notificationStatus.telegram_connected ? (
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Notifications
                  </span>
                  {notificationStatus.telegram_connected && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {notificationStatus.telegram_connected
                    ? 'Telegram alerts active'
                    : 'Connect Telegram to receive alerts'}
                </p>
              </div>
              <div className="flex-shrink-0 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

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
