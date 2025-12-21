import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface TelegramStatus {
  connected: boolean;
  destination: 'direct' | 'group' | null;
  chat_title?: string;
}

export function TelegramConnect() {
  const { session } = useAuth();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    loadStatus();
  }, [session]);

  useEffect(() => {
    if (waitingForConfirmation && pollCount < 20) {
      const timer = setTimeout(() => {
        loadStatus();
        setPollCount(prev => prev + 1);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (pollCount >= 20) {
      setWaitingForConfirmation(false);
      setPollCount(0);
    }
  }, [waitingForConfirmation, pollCount]);

  const loadStatus = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.telegram.getStatus(session.access_token);
      setStatus(data);

      if (waitingForConfirmation && data.connected) {
        setWaitingForConfirmation(false);
        setPollCount(0);
      }
    } catch (err) {
      console.error('Failed to load Telegram status:', err);
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError('Please log in again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (destination: 'direct' | 'group') => {
    if (!session?.access_token) {
      setError('Please log in to connect Telegram');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const response = await api.telegram.createConnectToken(session.access_token, destination);

      const telegramUrl = response.telegram_url;

      if (isMobileDevice()) {
        window.location.href = telegramUrl;
      } else {
        window.open(telegramUrl, '_blank');
      }

      setWaitingForConfirmation(true);
      setPollCount(0);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          setError('Please log in again');
        } else if (err.status === 500 && err.message.includes('not configured')) {
          setError('Telegram bot is not configured. Please contact support.');
        } else {
          setError(err.message || 'Could not generate connect link. Try again.');
        }
      } else {
        setError('Could not generate connect link. Try again.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4 mb-4">
        <div className="text-3xl">✈️</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">Telegram</h3>
            {status?.connected && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {status?.connected
              ? 'Receive instant alerts on Telegram'
              : 'Connect Telegram to receive instant alerts'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {status?.connected ? (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Connected</span>
            </div>
            <p className="text-sm text-green-700">
              {status.destination === 'direct' ? 'Direct messages' : 'Group chat'}
              {status.chat_title && `: ${status.chat_title}`}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConnect('direct')}
              disabled={connecting}
              className="flex-1"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Change to Direct'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConnect('group')}
              disabled={connecting}
              className="flex-1"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Change to Group'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleConnect('direct')}
              disabled={connecting}
              className="flex-1"
            >
              {connecting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                'Connect Direct'
              )}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => handleConnect('group')}
              disabled={connecting}
              className="flex-1"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Connect Group'
              )}
            </Button>
          </div>

          {waitingForConfirmation && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 mb-2 font-medium">
                Waiting for confirmation...
              </p>
              <p className="text-xs text-blue-700 mb-3">
                Press START in Telegram, then come back here. Checking status automatically...
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadStatus}
                className="w-full"
              >
                Check Status Now
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500">
            You'll be redirected to Telegram to complete the connection
          </p>
        </div>
      )}
    </div>
  );
}
