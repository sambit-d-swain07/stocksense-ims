import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-surface-200 rounded-card shadow-card overflow-hidden transition-all ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-surface-100 bg-white">
          {title && <h3 className="text-base font-semibold text-surface-900">{title}</h3>}
          {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3.5 border-t border-surface-100 bg-surface-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};
