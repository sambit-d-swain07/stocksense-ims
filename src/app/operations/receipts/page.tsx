'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getReceipts } from '@/lib/operations-api';
import { useAsyncData } from '@/hooks/useAsyncData';
import { Receipt } from '@/types/operations';
import { formatDate, isOverdue, matchesSearch } from '@/lib/operations-utils';
import { OperationsToolbar } from '@/components/operations/OperationsToolbar';
import { DataTable, Column } from '@/components/operations/DataTable';
import { KanbanBoard, KanbanColumn } from '@/components/operations/KanbanBoard';
import { StatusBadge } from '@/components/operations/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '@/components/operations/States';

export default function ReceiptsListPage() {
  const router = useRouter();
  const { data: receipts, isLoading, error, reload } = useAsyncData(getReceipts, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter((r) =>
      matchesSearch(searchQuery, r.reference, r.contact, r.from, r.to)
    );
  }, [receipts, searchQuery]);

  const columns: Column<Receipt>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (r) => <span className="font-semibold text-surface-900">{r.reference}</span>,
    },
    {
      key: 'from',
      header: 'From',
      render: (r) => <span className="text-slate-600">{r.from || '—'}</span>,
    },
    {
      key: 'to',
      header: 'To',
      render: (r) => <span className="text-slate-600">{r.to || '—'}</span>,
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

  const kanbanColumns: KanbanColumn[] = [
    { key: 'draft', label: 'Draft', dotColor: 'bg-slate-400' },
    { key: 'ready', label: 'Ready', dotColor: 'bg-brand-500' },
    { key: 'done', label: 'Done', dotColor: 'bg-emerald-500' },
    { key: 'canceled', label: 'Canceled', dotColor: 'bg-slate-400' },
  ];

  return (
    <AppShell>
      <OperationsToolbar
        title="Receipts"
        description="Incoming goods from vendors into the warehouse."
        newHref="/operations/receipts/new"
        newButtonText="New"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        view={view}
        onViewChange={setView}
        totalRecords={filteredReceipts.length}
      />

      {isLoading ? (
        <LoadingState message="Loading receipts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredReceipts.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No receipts match your search' : 'No receipts found'}
          description={
            searchQuery
              ? `No receipts found matching "${searchQuery}".`
              : 'There are no receipts in the system.'
          }
          actionText={searchQuery ? 'Clear search' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : view === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredReceipts}
          onRowClick={(r) => router.push(`/operations/receipts/${r.id}`)}
        />
      ) : (
        <KanbanBoard
          columns={kanbanColumns}
          items={filteredReceipts}
          groupOf={(r) => r.status}
          onCardClick={(r) => router.push(`/operations/receipts/${r.id}`)}
          renderCard={(r) => {
            const productCount = r.lines.reduce((acc, l) => acc + l.quantity, 0);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-surface-900">{r.reference}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Contact:</span> {r.contact || '—'}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-surface-100">
                  <span className={isOverdue(r.scheduleDate, r.status) ? 'text-amber-700 font-medium' : ''}>
                    {formatDate(r.scheduleDate)}
                  </span>
                  <span>{productCount} {productCount === 1 ? 'unit' : 'units'}</span>
                </div>
              </div>
            );
          }}
        />
      )}
    </AppShell>
  );
}
