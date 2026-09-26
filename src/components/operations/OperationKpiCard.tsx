import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface KpiStatItem {
  label: string;
  value?: number;
  tone?: 'default' | 'warning';
  showDot?: boolean;
  dotColor?: 'amber' | 'slate';
  href?: string;
}

export interface OperationKpiCardProps {
  title: string;
  icon: React.ReactNode;
  actionLabel: string;
  actionHref: string;
  stats: KpiStatItem[];
}

export const OperationKpiCard: React.FC<OperationKpiCardProps> = ({
  title,
  icon,
  actionLabel,
  actionHref,
  stats,
}) => {
  // Filter out stats with value 0 or undefined
  const visibleStats = stats.filter(
    (stat) => stat.value !== undefined && stat.value !== null && stat.value > 0
  );

  return (
    <div className="bg-white rounded-xl border border-surface-200/80 shadow-sm p-6 hover:shadow-md transition-shadow space-y-6">
      {/* Title Header Row */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-surface-100">
        <div className="p-2 rounded-lg bg-surface-100 text-slate-700 shrink-0">
          {icon}
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-surface-900">{title}</h2>
      </div>

      {/* Content Row: Button on left, Right-aligned stats list on right */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link href={actionHref}>
            <Button variant="primary" size="md" className="shadow-sm">
              {actionLabel}
            </Button>
          </Link>
        </div>

        <div className="text-right space-y-1.5 text-sm">
          {visibleStats.map((stat, idx) => {
            const isWarning = stat.tone === 'warning';
            const statHref = stat.href || actionHref;

            return (
              <div key={idx} className="flex items-center justify-end gap-1.5">
                {stat.showDot && (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      stat.dotColor === 'amber' || isWarning ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                  />
                )}
                <Link
                  href={statHref}
                  className={`hover:underline font-medium transition-colors ${
                    isWarning ? 'text-amber-700 font-semibold' : 'text-slate-600 hover:text-surface-900'
                  }`}
                >
                  {stat.value} {stat.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
