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
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1C1C1C] text-white tracking-wide ${className}`}
      >
        In stock
      </span>
    );
  }

  if (status === 'LOW_STOCK') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-dashed border-black text-[#141414] bg-transparent tracking-wide ${className}`}
      >
        Low stock
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-[#A9A9A9] text-[#6E6E6E] bg-transparent tracking-wide ${className}`}
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
