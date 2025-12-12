import { MoreVertical } from 'lucide-react';

interface WalletCardProps {
  label: string;
  address: string;
  network: string;
  isActive: boolean;
  onClick?: () => void;
}

export function WalletCard({ label, address, network, isActive, onClick }: WalletCardProps) {
  const shortenAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkIcon = (net: string) => {
    const icons: Record<string, string> = {
      ethereum: '⟠',
      tron: '◬',
      bsc: '◆'
    };
    return icons[net] || '●';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getNetworkIcon(network)}</span>
          <div>
            <div className="font-semibold text-gray-900">{label}</div>
            <div className="text-sm text-gray-500 font-mono">{shortenAddress(address)}</div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase">{network}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive ? 'Monitoring active' : 'Paused'}
        </span>
      </div>
    </div>
  );
}
