'use client';

import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { getDashboardKpis } from '@/lib/operations-api';
import { useAsyncData } from '@/hooks/useAsyncData';
import { OperationKpiCard } from '@/components/operations/OperationKpiCard';
import { LoadingState, ErrorState } from '@/components/operations/States';

export default function DashboardPage() {
  const { data: kpis, isLoading, error, reload } = useAsyncData(getDashboardKpis, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-surface-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Today's inventory operations</p>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState message="Loading dashboard statistics..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : kpis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RECEIPT Card */}
            <OperationKpiCard
              title="Receipt"
              icon={<ArrowDownToLine className="w-5 h-5" />}
              actionLabel={`${kpis.receipts.toProcess} to receive`}
              actionHref="/operations/receipts"
              stats={[
                {
                  label: 'Late',
                  value: kpis.receipts.late,
                  tone: 'warning',
                  showDot: true,
                  dotColor: 'amber',
                  href: '/operations/receipts',
                },
                {
                  label: 'operations',
                  value: kpis.receipts.total,
                  href: '/operations/receipts',
                },
              ]}
            />

            {/* DELIVERY Card */}
            <OperationKpiCard
              title="Delivery"
              icon={<ArrowUpFromLine className="w-5 h-5" />}
              actionLabel={`${kpis.deliveries.toProcess} to deliver`}
              actionHref="/operations/deliveries"
              stats={[
                {
                  label: 'Late',
                  value: kpis.deliveries.late,
                  tone: 'warning',
                  showDot: true,
                  dotColor: 'amber',
                  href: '/operations/deliveries',
                },
                {
                  label: 'waiting',
                  value: kpis.deliveries.waiting,
                  showDot: true,
                  dotColor: 'amber',
                  href: '/operations/deliveries',
                },
                {
                  label: 'operations',
                  value: kpis.deliveries.total,
                  href: '/operations/deliveries',
                },
              ]}
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
