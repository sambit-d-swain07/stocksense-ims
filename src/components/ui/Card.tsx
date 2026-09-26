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
    <div className={`bg-white border border-zinc-200 rounded-xl overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-zinc-100 bg-white">
          {title && <h3 className="text-base font-semibold text-zinc-900">{title}</h3>}
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};
