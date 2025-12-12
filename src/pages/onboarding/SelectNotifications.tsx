import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ChannelCard } from '../../components/ChannelCard';
import { StepIndicator } from '../../components/StepIndicator';

const CHANNELS = [
  { id: 'telegram', name: 'Telegram', description: 'Instant push notifications', icon: '✈️', recommended: true },
  { id: 'email', name: 'Email', description: 'Notifications to your inbox', icon: '✉️' },
  { id: 'slack', name: 'Slack', description: 'Team notifications', icon: '💬', comingSoon: true },
  { id: 'discord', name: 'Discord', description: 'Community alerts', icon: '🎮', comingSoon: true },
  { id: 'sms', name: 'SMS', description: 'Text message alerts', icon: '📱', comingSoon: true },
  { id: 'browser', name: 'Browser Push', description: 'Desktop notifications', icon: '🔔', comingSoon: true },
];

export function SelectNotifications() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(['telegram']);

  const toggleChannel = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      sessionStorage.setItem('onboarding_channels', JSON.stringify(selected));
      navigate('/onboarding/test');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Add Wallet" showBack />
      <StepIndicator currentStep={3} totalSteps={4} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Select notification channels</h2>
            <p className="text-gray-600">Choose how you want to receive alerts</p>
          </div>

          <div className="space-y-3">
            {CHANNELS.map((channel) => (
              <ChannelCard
                key={channel.id}
                name={channel.name}
                description={channel.description}
                icon={channel.icon}
                selected={selected.includes(channel.id)}
                recommended={channel.recommended}
                comingSoon={channel.comingSoon}
                onClick={() => !channel.comingSoon && toggleChannel(channel.id)}
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-900">
              You'll need to connect your Telegram or email after setup to start receiving alerts.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            size="lg"
            disabled={selected.length === 0}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
