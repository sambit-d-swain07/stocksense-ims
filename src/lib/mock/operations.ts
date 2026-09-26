import { Receipt } from '@/types/operations';

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
