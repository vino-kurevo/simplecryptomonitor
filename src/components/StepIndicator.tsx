interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i + 1 === currentStep
              ? 'w-8 bg-blue-600'
              : i + 1 < currentStep
              ? 'w-6 bg-blue-600'
              : 'w-6 bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
