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
    <div className={`bg-white border border-surface-200/80 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
          {title && <h3 className="text-lg font-semibold text-surface-900">{title}</h3>}
          {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 border-t border-surface-100 bg-surface-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};
