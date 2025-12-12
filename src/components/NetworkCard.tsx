interface NetworkCardProps {
  name: string;
  network: string;
  icon: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function NetworkCard({ name, network, icon, selected, disabled, onClick }: NetworkCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
        ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 active:scale-98'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{network}</div>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}
