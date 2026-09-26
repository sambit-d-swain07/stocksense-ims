import { Receipt, DashboardKpis } from '@/types/operations';
import { mockReceipts, mockDashboardKpis } from './mock/operations';

export async function getReceipts(): Promise<Receipt[]> {
  // Later: return fetch('/api/receipts').then(r => r.json()).then(j => j.data)
  await new Promise((resolve) => setTimeout(resolve, 250));
  return mockReceipts.map((r) => ({
    ...r,
    lines: r.lines.map((l) => ({ ...l })),
  }));
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  // Later: return fetch('/api/dashboard/kpis').then(r => r.json()).then(j => j.data)
  await new Promise((resolve) => setTimeout(resolve, 250));
  return { ...mockDashboardKpis };
}
