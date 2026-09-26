import React from 'react';
import { STATUS_LABEL } from '@/lib/operations-utils';
import { ReceiptStatus } from '@/types/operations';

export interface StatusBadgeProps {
  status: ReceiptStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normStatus = (status || '').toLowerCase() as ReceiptStatus;

  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotStyles = 'bg-slate-400';
  let textStyles = '';
  let label = STATUS_LABEL[normStatus] || status;

  switch (normStatus) {
    case 'draft':
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
      dotStyles = 'bg-slate-400';
      break;
    case 'ready':
      badgeStyles = 'bg-brand-50 text-brand-700 border-brand-200/70';
      dotStyles = 'bg-brand-500';
      break;
    case 'done':
      badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
      dotStyles = 'bg-emerald-500';
      break;
    case 'canceled':
      badgeStyles = 'bg-slate-100 text-slate-500 border-slate-200';
      dotStyles = 'bg-slate-400';
      textStyles = 'line-through';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${badgeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
      <span className={textStyles}>{label}</span>
    </span>
  );
};
