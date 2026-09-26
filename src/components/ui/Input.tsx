import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

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
          <label
            htmlFor={inputId}
            className="block text-[13.5px] font-medium text-[#141414]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-12 px-4 text-[14px] text-[#141414] placeholder:text-[#A9A9A9] rounded-[14px] transition-all duration-150 focus:outline-none ${
              error
                ? 'border-[1.5px] border-black bg-[#FAFAFA] focus:ring-2 focus:ring-black/10'
                : 'border border-[#E2E2E2] bg-white focus:border-black focus:ring-2 focus:ring-black/10'
            } ${rightElement ? 'pr-11' : ''} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center text-[#6E6E6E]">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <div className="flex items-center gap-1.5 pt-0.5 text-xs text-[#141414] font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#141414]" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p className="text-xs text-[#6E6E6E]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
