import { useNavigate } from 'react-router-dom';
import { Bell, Shield, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SimpleCryptoMonitor</h1>
          <p className="text-lg text-gray-600">Never miss a crypto payment</p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Get instant alerts for your crypto wallets
            </h2>
            <p className="text-gray-600">
              Track payments on multiple networks. Simple, fast, reliable.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Instant Notifications</h3>
                <p className="text-sm text-gray-600">Get alerts via Telegram and email</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Watch-Only</h3>
                <p className="text-sm text-gray-600">No private keys required, completely safe</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Multi-Network</h3>
                <p className="text-sm text-gray-600">Support for Ethereum, Tron, BSC, and more</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Free plan includes 2 wallets</p>
          <p>No credit card required</p>
        </div>
      </div>
    </div>
  );
}
