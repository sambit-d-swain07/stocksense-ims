import React from 'react';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

interface StatusPillProps {
  status: StockStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  if (status === 'IN_STOCK') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-leaf-tint text-leaf-text border border-leaf/20 ${className}`}
      >
        In stock
      </span>
    );
  }

  if (status === 'LOW_STOCK') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-honey-tint text-honey-text border border-honey/20 ${className}`}
      >
        Low stock
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-coral-tint text-coral-text border border-coral/20 ${className}`}
    >
      Out of stock
    </span>
  );
};

export function getProductStockStatus(onHand: number): StockStatus {
  if (onHand <= 0) return 'OUT_OF_STOCK';
  if (onHand < 10) return 'LOW_STOCK';
  return 'IN_STOCK';
}

