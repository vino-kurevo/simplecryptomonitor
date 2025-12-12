import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/StepIndicator';

export function WalletAddress() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const network = sessionStorage.getItem('onboarding_network');

  const validateAddress = (addr: string) => {
    if (!addr) return false;
    if (network === 'ethereum' || network === 'bsc') {
      return /^0x[a-fA-F0-9]{40}$/.test(addr);
    }
    if (network === 'tron') {
      return addr.startsWith('T') && addr.length === 34;
    }
    return addr.length > 20;
  };

  const handleContinue = () => {
    if (validateAddress(address)) {
      sessionStorage.setItem('onboarding_address', address);
      sessionStorage.setItem('onboarding_label', label || 'My Wallet');
      navigate('/onboarding/notifications');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Add Wallet" showBack />
      <StepIndicator currentStep={2} totalSteps={4} />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enter wallet address</h2>
            <p className="text-gray-600">
              Paste your {network} wallet address
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              label="Wallet Address"
              placeholder={network === 'tron' ? 'T...' : '0x...'}
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              error={address && !validateAddress(address) ? 'Invalid address format' : undefined}
              hint="Watch-only. No private keys required."
            />

            <Input
              type="text"
              label="Label (optional)"
              placeholder="e.g., Business Wallet"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              hint="Give this wallet a name to identify it easily"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Safe & secure:</strong> We only monitor transactions. Your wallet stays completely secure.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            size="lg"
            disabled={!validateAddress(address)}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
