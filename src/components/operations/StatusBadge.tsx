import React from 'react';
import { STATUS_LABEL } from '@/lib/operations-utils';
import { ReceiptStatus } from '@/types/operations';

export interface StatusBadgeProps {
  status: ReceiptStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normStatus = (status || '').toLowerCase();

  let badgeStyles = 'bg-surface-100 text-surface-600 border-surface-200';
  let dotStyles = 'bg-surface-400';
  let textStyles = '';
  let label = STATUS_LABEL[normStatus as ReceiptStatus] || status;

  switch (normStatus) {
    case 'draft':
      badgeStyles = 'bg-surface-100 text-surface-600 border-surface-200';
      dotStyles = 'bg-surface-400';
      break;
    case 'waiting':
      badgeStyles = 'bg-honey-tint text-honey-text border-honey/30';
      dotStyles = 'bg-honey';
      break;
    case 'ready':
      badgeStyles = 'bg-sky-tint text-sky-text border-sky/30';
      dotStyles = 'bg-sky';
      break;
    case 'done':
    case 'in':
      badgeStyles = 'bg-leaf-tint text-leaf-text border-leaf/30';
      dotStyles = 'bg-leaf';
      break;
    case 'canceled':
      badgeStyles = 'bg-surface-100 text-surface-400 border-surface-200';
      dotStyles = 'bg-surface-400';
      textStyles = 'line-through';
      break;
    case 'out':
    case 'error':
    case 'shortage':
      badgeStyles = 'bg-coral-tint text-coral-text border-coral/30';
      dotStyles = 'bg-coral';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${badgeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
      <span className={textStyles}>{label}</span>
    </span>
  );
};

