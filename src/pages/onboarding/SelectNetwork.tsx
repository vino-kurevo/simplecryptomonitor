import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { NetworkCard } from '../../components/NetworkCard';
import { StepIndicator } from '../../components/StepIndicator';

const NETWORKS = [
  { id: 'usdt-tron', name: 'USDT', network: 'Tron (TRC20)', icon: '₮', value: 'tron' },
  { id: 'usdt-ethereum', name: 'USDT', network: 'Ethereum (ERC20)', icon: '₮', value: 'ethereum' },
  { id: 'usdt-bsc', name: 'USDT', network: 'BNB Smart Chain (BEP20)', icon: '₮', value: 'bsc' },
  { id: 'usdc-solana', name: 'USDC', network: 'Solana', icon: '◎', value: 'solana', disabled: true },
  { id: 'usdc-ethereum', name: 'USDC', network: 'Ethereum (ERC20)', icon: '◎', value: 'ethereum', disabled: true },
  { id: 'btc', name: 'Bitcoin', network: 'BTC native', icon: '₿', value: 'bitcoin', disabled: true },
  { id: 'eth', name: 'Ethereum', network: 'ETH native', icon: '⟠', value: 'ethereum', disabled: true },
];

export function SelectNetwork() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('onboarding_network', selected);
      navigate('/onboarding/wallet-address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Add Wallet" showBack />
      <StepIndicator currentStep={1} totalSteps={4} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Select network</h2>
            <p className="text-gray-600">Choose which network you want to monitor</p>
          </div>

          <div className="space-y-3">
            {NETWORKS.map((network) => (
              <NetworkCard
                key={network.id}
                name={network.name}
                network={network.network}
                icon={network.icon}
                selected={selected === network.value}
                disabled={network.disabled}
                onClick={() => !network.disabled && setSelected(network.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            size="lg"
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
