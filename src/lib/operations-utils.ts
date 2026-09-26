import { ReceiptStatus } from '@/types/operations';

export const STATUS_LABEL: Record<ReceiptStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  done: 'Done',
  canceled: 'Canceled',
};

export function formatDate(isoDate?: string): string {
  if (!isoDate) return '—';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function isOverdue(scheduleDate?: string, status?: ReceiptStatus | string): boolean {
  if (!scheduleDate || status === 'done' || status === 'canceled') return false;
  const today = new Date().toISOString().split('T')[0];
  return scheduleDate < today;
}

export function matchesSearch(query: string, ...fields: (string | undefined | null)[]): boolean {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();
  return fields.some((field) => (field ? field.toLowerCase().includes(q) : false));
}
