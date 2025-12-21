import { Header } from '../components/Header';
import { TelegramConnect } from '../components/TelegramConnect';

export function NotificationSettings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Notification Settings" showBack showMenu />

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Notification Channels
            </h2>
            <p className="text-gray-600">
              Manage how you receive alerts about your wallet transactions
            </p>
          </div>

          <div className="space-y-4">
            <TelegramConnect />

            <div className="bg-white rounded-xl p-6 border border-gray-200 opacity-50">
              <div className="flex items-start gap-4">
                <div className="text-3xl">✉️</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Receive notifications in your inbox
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 opacity-50">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🪝</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Send notifications to custom endpoints
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Connect at least one notification channel to receive instant alerts when transactions occur on your monitored wallets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
