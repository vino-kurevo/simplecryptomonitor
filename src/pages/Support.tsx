import { Header } from '../components/Header';
import { Mail, MessageCircle } from 'lucide-react';

export function Support() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Support" showBack />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Help</h2>
            <p className="text-gray-600">We're here to assist you</p>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 transition-colors text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Get help via email. We typically respond within 24 hours.
                  </p>
                  <span className="text-sm font-medium text-blue-600">
                    support@simplecryptomonitor.com
                  </span>
                </div>
              </div>
            </button>

            <button className="w-full bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-400 transition-colors text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Community Support</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Join our Telegram community for quick answers and tips.
                  </p>
                  <span className="text-sm font-medium text-blue-600">
                    Join Telegram Group →
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Common Issues</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Not receiving notifications? Check your channel connections in settings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Invalid wallet address? Make sure you're using the correct network format.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Billing questions? Visit the Billing page to manage your subscription.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Check out our <button className="text-blue-600 hover:text-blue-700 font-medium">FAQ page</button> for more answers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
