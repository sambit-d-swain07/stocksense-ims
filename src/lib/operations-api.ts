import { Receipt, DashboardKpis, StockItem, ProductOption } from '@/types/operations';
import {
  mockReceipts,
  mockDashboardKpis,
  mockStockItems,
  mockProducts,
  mockSuppliers,
} from './mock/operations';

// Shared in-memory state across all operations functions
let receiptsState: Receipt[] = mockReceipts.map((r) => ({
  ...r,
  lines: r.lines.map((l) => ({ ...l })),
}));

let stockItemsState: StockItem[] = mockStockItems.map((item) => ({ ...item }));

const simulateLatency = async (ms: number = 250) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export async function getReceipts(): Promise<Receipt[]> {
  // Later: fetch('/api/receipts').then(r => r.json()).then(j => j.data)
  await simulateLatency();
  return receiptsState.map((r) => ({
    ...r,
    lines: r.lines.map((l) => ({ ...l })),
  }));
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  // Later: fetch(`/api/receipts/${id}`).then(r => r.json()).then(j => j.data)
  await simulateLatency();
  const found = receiptsState.find((r) => r.id === id);
  return found
    ? { ...found, lines: found.lines.map((l) => ({ ...l })) }
    : null;
}

export async function getNextReceiptReference(): Promise<string> {
  // Calculates next reference number e.g. WH/IN/0007 based on highest existing number
  let maxNum = 0;
  receiptsState.forEach((r) => {
    const match = r.reference.match(/WH\/IN\/(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  const formatted = String(nextNum).padStart(4, '0');
  return `WH/IN/${formatted}`;
}

export async function saveReceipt(
  input: Partial<Receipt> & { id?: string }
): Promise<Receipt> {
  // Later: POST /api/receipts or PUT /api/receipts/:id
  await simulateLatency();

  if (input.id) {
    const idx = receiptsState.findIndex((r) => r.id === input.id);
    if (idx !== -1) {
      const updated: Receipt = {
        ...receiptsState[idx],
        ...input,
        lines: input.lines
          ? input.lines.map((l) => ({ ...l }))
          : receiptsState[idx].lines,
      };
      receiptsState[idx] = updated;
      return { ...updated, lines: updated.lines.map((l) => ({ ...l })) };
    }
  }

  // Create new receipt
  const reference = input.reference || (await getNextReceiptReference());
  const newReceipt: Receipt = {
    id: input.id || `rec-${Date.now()}`,
    reference,
    from: input.from || '',
    to: input.to || 'Main Warehouse',
    contact: input.contact || input.from || '',
    scheduleDate: input.scheduleDate || new Date().toISOString().split('T')[0],
    responsible: input.responsible || 'Unassigned',
    status: input.status || 'draft',
    lines: input.lines ? input.lines.map((l) => ({ ...l })) : [],
  };

  receiptsState.unshift(newReceipt);
  return { ...newReceipt, lines: newReceipt.lines.map((l) => ({ ...l })) };
}

export async function validateReceipt(id: string): Promise<Receipt> {
  // Later: POST /api/receipts/:id/validate
  await simulateLatency();

  const idx = receiptsState.findIndex((r) => r.id === id);
  if (idx === -1) {
    throw new Error('Receipt not found');
  }

  const updated: Receipt = {
    ...receiptsState[idx],
    status: 'done',
  };
  receiptsState[idx] = updated;

  return { ...updated, lines: updated.lines.map((l) => ({ ...l })) };
}

export async function cancelReceipt(id: string): Promise<Receipt> {
  // Later: POST /api/receipts/:id/cancel
  await simulateLatency();

  const idx = receiptsState.findIndex((r) => r.id === id);
  if (idx === -1) {
    throw new Error('Receipt not found');
  }

  const updated: Receipt = {
    ...receiptsState[idx],
    status: 'canceled',
  };
  receiptsState[idx] = updated;

  return { ...updated, lines: updated.lines.map((l) => ({ ...l })) };
}

export async function getProducts(): Promise<ProductOption[]> {
  // Later: fetch('/api/products').then(r => r.json()).then(j => j.data)
  await simulateLatency();
  return mockProducts.map((p) => ({ ...p }));
}

export async function getSuppliers(): Promise<string[]> {
  // Later: fetch('/api/contacts?type=supplier').then(r => r.json()).then(j => j.data)
  await simulateLatency();
  return [...mockSuppliers];
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  // Later: fetch('/api/dashboard/kpis').then(r => r.json()).then(j => j.data)
  await simulateLatency();

  const toProcess = receiptsState.filter(
    (r) => r.status === 'draft' || r.status === 'ready'
  ).length;
  const today = new Date().toISOString().split('T')[0];
  const late = receiptsState.filter(
    (r) => r.status !== 'done' && r.status !== 'canceled' && r.scheduleDate < today
  ).length;

  return {
    receipts: {
      toProcess,
      late,
      total: receiptsState.length,
    },
    deliveries: mockDashboardKpis.deliveries,
  };
}

export async function getStockItems(): Promise<StockItem[]> {
  // Later: fetch('/api/stock').then(r => r.json()).then(j => j.data)
  await simulateLatency();
  return stockItemsState.map((item) => ({ ...item }));
}

export async function updateStockOnHand(
  id: string,
  onHand: number
): Promise<StockItem> {
  // Later: fetch(`/api/stock/${id}`, { method: 'PATCH', body: JSON.stringify({ onHand }) }).then(r => r.json()).then(j => j.data)
  await simulateLatency();

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
