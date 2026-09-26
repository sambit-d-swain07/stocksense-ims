import { Receipt, DashboardKpis, StockItem } from '@/types/operations';
import { mockReceipts, mockDashboardKpis, mockStockItems } from './mock/operations';

let stockItemsState: StockItem[] = mockStockItems.map((item) => ({ ...item }));

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

export async function getStockItems(): Promise<StockItem[]> {
  // Later: return fetch('/api/stock').then(r => r.json()).then(j => j.data)
  await new Promise((resolve) => setTimeout(resolve, 250));
  return stockItemsState.map((item) => ({ ...item }));
}

export async function updateStockOnHand(id: string, onHand: number): Promise<StockItem> {
  // Later: return fetch(`/api/stock/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ onHand }) }).then(r => r.json()).then(j => j.data)
  await new Promise((resolve) => setTimeout(resolve, 250));

  const idx = stockItemsState.findIndex((item) => item.id === id);
  if (idx === -1) {
    throw new Error('Stock item not found');
  }

  const updated: StockItem = {
    ...stockItemsState[idx],
    onHand,
  };
  stockItemsState[idx] = updated;

  return { ...updated };
}
