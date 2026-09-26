import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-surface-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-11 px-3.5 text-xs bg-white border rounded-xl transition-colors focus:outline-none focus:ring-2 ${
              rightElement ? 'pr-10' : ''
            } ${
              error
                ? 'border-coral/50 focus:border-coral focus:ring-coral-tint text-coral-text'
                : 'border-surface-200 focus:border-brand-600 focus:ring-brand-600/20 text-surface-900 placeholder:text-surface-400'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-coral-text font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-surface-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

