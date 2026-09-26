'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getReceipts } from '@/lib/operations-api';
import { useAsyncData } from '@/hooks/useAsyncData';
import { Receipt } from '@/types/operations';
import { formatDate, isOverdue, searchMatcher } from '@/lib/operations-utils';
import { OperationsToolbar } from '@/components/operations/OperationsToolbar';
import { DataTable, Column } from '@/components/operations/DataTable';
import { KanbanBoard } from '@/components/operations/KanbanBoard';
import { StatusBadge } from '@/components/operations/StatusBadge';
import { LoadingState } from '@/components/operations/LoadingState';
import { EmptyState } from '@/components/operations/EmptyState';
import { ErrorState } from '@/components/operations/ErrorState';

export default function ReceiptsListPage() {
  const router = useRouter();
  const { data: receipts, isLoading, error, reload } = useAsyncData(getReceipts, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter((r) =>
      searchMatcher(r, searchQuery, ['reference', 'contact', 'from', 'to'])
    );
  }, [receipts, searchQuery]);

  const columns: Column<Receipt>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (r) => <span className="font-semibold text-brand-600">{r.reference}</span>,
    },
    {
      key: 'from',
      header: 'From',
      render: (r) => <span>{r.from || '—'}</span>,
    },
    {
      key: 'to',
      header: 'To',
      render: (r) => <span>{r.to || '—'}</span>,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (r) => <span>{r.contact || '—'}</span>,
    },
    {
      key: 'scheduleDate',
      header: 'Schedule Date',
      render: (r) => {
        const overdue = isOverdue(r.scheduleDate, r.status);
        return (
          <span className={overdue ? 'text-amber-700 font-medium' : 'text-slate-600'}>
            {formatDate(r.scheduleDate)} {overdue ? '(Overdue)' : ''}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const kanbanColumns = [
    { id: 'draft', title: 'Draft' },
    { id: 'ready', title: 'Ready' },
    { id: 'done', title: 'Done' },
    { id: 'canceled', title: 'Canceled' },
  ];

  return (
    <AppShell>
      <OperationsToolbar
        title="Receipts"
        description="Manage incoming inventory transfers, vendor stock receipts, and verification."
        newHref="/operations/receipts/new"
        newButtonText="New Receipt"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        view={view}
        onViewChange={setView}
        totalRecords={filteredReceipts.length}
      />

      {isLoading ? (
        <LoadingState message="Loading receipts data..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredReceipts.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching receipts' : 'No receipts created yet'}
          description={
            searchQuery
              ? `No receipts found matching "${searchQuery}".`
              : 'Create your first receipt to start tracking incoming inventory.'
          }
          actionText={searchQuery ? 'Clear Search' : 'New Receipt'}
          onAction={() => {
            if (searchQuery) {
              setSearchQuery('');
            } else {
              router.push('/operations/receipts/new');
            }
          }}
        />
      ) : view === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredReceipts}
          keyExtractor={(r) => r.id}
          onRowClick={(r) => router.push(`/operations/receipts/${r.id}`)}
        />
      ) : (
        <KanbanBoard
          columns={kanbanColumns}
          items={filteredReceipts}
          groupOf={(r) => r.status}
          keyExtractor={(r) => r.id}
          onCardClick={(r) => router.push(`/operations/receipts/${r.id}`)}
          renderCard={(r) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-brand-600">{r.reference}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-medium text-slate-800">From:</span> {r.from || '—'}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-surface-100">
                <span>{r.contact}</span>
                <span className={isOverdue(r.scheduleDate, r.status) ? 'text-amber-700 font-medium' : ''}>
                  {formatDate(r.scheduleDate)}
                </span>
              </div>
            </div>
          )}
        />
      )}
    </AppShell>
  );
}
