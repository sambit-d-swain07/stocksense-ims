import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'highlight';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  className = '',
}) => {
  const isHighlight = variant === 'highlight';

  return (
    <div
      className={`rounded-[24px] p-6 transition-all duration-200 ${
        isHighlight
          ? 'bg-[#1C1C1C] text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
          : 'bg-white text-[#141414] shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#E2E2E2]'
      } ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3
              className={`text-lg font-bold tracking-tight ${
                isHighlight ? 'text-white' : 'text-[#141414]'
              }`}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              className={`text-xs mt-1 ${
                isHighlight ? 'text-[#A9A9A9]' : 'text-[#6E6E6E]'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-[#E2E2E2]/60">{footer}</div>}
    </div>
  );
};
