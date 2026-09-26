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
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-surface-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span className="line-through">Canceled</span>
      </div>
    );
  }

  return (
    <nav aria-label="Receipt status stepper" className="w-full">
      <ol className="flex items-center w-full text-xs font-medium">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <li
              key={step}
              className={`flex items-center ${
                idx !== steps.length - 1 ? 'flex-1' : ''
              }`}
              {...(isCurrent ? { 'aria-current': 'step' } : {})}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isDone
                      ? 'bg-slate-800 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white shadow-sm ring-4 ring-brand-100'
                      : 'bg-surface-200 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 text-white" /> : idx + 1}
                </span>
                <span
                  className={`${
                    isCurrent
                      ? 'text-brand-700 font-semibold'
                      : isDone
                      ? 'text-surface-900 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>

              {idx !== steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2.5 ${
                    isDone ? 'bg-slate-800' : 'bg-surface-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
