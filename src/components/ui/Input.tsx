import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-surface-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900'
              : 'border-surface-200 focus:border-brand-500 focus:ring-brand-100 text-surface-900 placeholder:text-surface-400'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-surface-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
