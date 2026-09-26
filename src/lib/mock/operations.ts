import { Receipt, DashboardKpis, StockItem } from '@/types/operations';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export const mockReceipts: Receipt[] = [
  {
    id: 'rec-001',
    reference: 'WH/IN/0001',
    from: 'ABC Suppliers Ltd',
    to: 'Main Warehouse',
    contact: 'John Supplier',
    scheduleDate: daysFromNow(-2), // Overdue
    responsible: 'Sarah Jenkins',
    status: 'done',
    lines: [
      { id: 'line-1', productId: 'Laptop', quantity: 5 },
      { id: 'line-2', productId: 'Keyboard', quantity: 10 },
    ],
  },
  {
    id: 'rec-002',
    reference: 'WH/IN/0002',
    from: 'Tech Logix Corp',
    to: 'Main Warehouse',
    contact: 'Alice Smith',
    scheduleDate: daysFromNow(1), // Upcoming
    responsible: 'Alex Johnson',
    status: 'ready',
    lines: [
      { id: 'line-3', productId: 'Mouse', quantity: 20 },
      { id: 'line-4', productId: 'Monitor', quantity: 5 },
    ],
  },
  {
    id: 'rec-003',
    reference: 'WH/IN/0003',
    from: 'Global Furniture Co',
    to: 'WH/Stock',
    contact: 'Azure Interior',
    scheduleDate: daysFromNow(3), // Upcoming
    responsible: 'Sarah Jenkins',
    status: 'draft',
    lines: [
      { id: 'line-5', productId: 'Office Desk', quantity: 4 },
      { id: 'line-6', productId: 'Office Chair', quantity: 10 },
    ],
  },
  {
    id: 'rec-004',
    reference: 'WH/IN/0004',
    from: 'Component Hub',
    to: 'Main Warehouse',
    contact: 'John Supplier',
    scheduleDate: daysFromNow(-5),
    responsible: 'Unassigned',
    status: 'canceled',
    lines: [
      { id: 'line-7', productId: 'Keyboard', quantity: 15 },
    ],
  },
  {
    id: 'rec-005',
    reference: 'WH/IN/0005',
    from: 'Apex Components',
    to: 'Main Warehouse',
    contact: 'David Miller',
    scheduleDate: daysFromNow(-1), // Overdue
    responsible: 'Alex Johnson',
    status: 'ready',
    lines: [
      { id: 'line-8', productId: 'Laptop', quantity: 8 },
    ],
  },
  {
    id: 'rec-006',
    reference: 'WH/IN/0006',
    from: 'Office Needs Inc',
    to: 'WH/Stock',
    contact: 'Elena Vance',
    scheduleDate: daysFromNow(5),
    responsible: 'Sarah Jenkins',
    status: 'draft',
    lines: [
      { id: 'line-9', productId: 'Office Chair', quantity: 5 },
    ],
  },
];

export const mockDashboardKpis: DashboardKpis = {
  receipts: { toProcess: 4, late: 1, total: 6 },
  deliveries: { toProcess: 2, late: 1, waiting: 2, total: 6 },
};

export const mockStockItems: StockItem[] = [
  {
    id: 'stk-001',
    productId: 'prod-desk',
    productName: 'Desk',
    sku: 'DSK-001',
    unit: 'Units',
    costPerUnit: 3000,
    onHand: 50,
    reserved: 5,
  },
  {
    id: 'stk-002',
    productId: 'prod-table',
    productName: 'Table',
    sku: 'TBL-001',
    unit: 'Units',
    costPerUnit: 3000,
    onHand: 50,
    reserved: 5,
  },
  {
    id: 'stk-003',
    productId: 'prod-laptop',
    productName: 'Laptop',
    sku: 'LPT-014',
    unit: 'Units',
    costPerUnit: 55000,
    onHand: 10,
    reserved: 2,
  },
  {
    id: 'stk-004',
    productId: 'prod-keyboard',
    productName: 'Keyboard',
    sku: 'KEY-001',
    unit: 'Units',
    costPerUnit: 1500,
    onHand: 25,
    reserved: 5,
  },
  {
    id: 'stk-005',
    productId: 'prod-mouse',
    productName: 'Mouse',
    sku: 'MOU-001',
    unit: 'Units',
    costPerUnit: 800,
    onHand: 50,
    reserved: 0,
  },
  {
    id: 'stk-006',
    productId: 'prod-monitor',
    productName: 'Monitor',
    sku: 'MON-001',
    unit: 'Units',
    costPerUnit: 12000,
    onHand: 15,
    reserved: 3,
  },
  {
    id: 'stk-007',
    productId: 'prod-chair',
    productName: 'Office Chair',
    sku: 'CHR-001',
    unit: 'Units',
    costPerUnit: 4500,
    onHand: 8,
    reserved: 8, // Free to use = 0 -> amber display
  },
  {
    id: 'stk-008',
    productId: 'prod-steel',
    productName: 'Steel Rod',
    sku: 'STL-001',
    unit: 'kg',
    costPerUnit: 650,
    onHand: 100,
    reserved: 10,
  },
];
