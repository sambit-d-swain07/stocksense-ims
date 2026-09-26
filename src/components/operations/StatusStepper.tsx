import React from 'react';
import { Check } from 'lucide-react';

export interface StatusStepperProps {
  steps: string[];
  currentStatus: string;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ steps, currentStatus }) => {
  const normCurrent = (currentStatus || '').toLowerCase();
  const isCanceled = normCurrent === 'canceled' || normCurrent === 'cancelled';

  let currentIndex = steps.findIndex((s) => s.toLowerCase() === normCurrent);
  if (currentIndex === -1 && !isCanceled) {
    currentIndex = 0;
  }

  if (isCanceled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-100 text-surface-400 border border-surface-200">
        <span className="w-1.5 h-1.5 rounded-full bg-surface-400" />
        <span className="line-through">Canceled</span>
      </div>
    );
  }

  return (
    <nav aria-label="Operation status stepper" className="w-full">
      <div className="inline-flex items-center p-1 bg-surface-100/90 rounded-full border border-surface-200 gap-1 overflow-x-auto max-w-full">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-brand-600 text-white shadow-sm'
                  : isDone
                  ? 'bg-white text-surface-800 shadow-xs border border-surface-200/50'
                  : 'text-surface-400'
              }`}
              {...(isCurrent ? { 'aria-current': 'step' } : {})}
            >
              {isDone ? (
                <span className="w-4 h-4 rounded-full bg-surface-800 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-2.5 h-2.5" />
                </span>
              ) : isCurrent ? (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-surface-200 text-surface-500 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

