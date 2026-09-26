import React from 'react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-[12px] font-bold text-surface-500 uppercase tracking-wider">
        {label} {required && <span className="text-coral-text">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-coral-text font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-surface-500">{helperText}</p>
      ) : null}
    </div>
  );
};

