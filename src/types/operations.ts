export type ReceiptStatus = 'draft' | 'ready' | 'done' | 'canceled';

export interface OperationLine {
  id: string;
  productId: string;
  quantity: number;
}

export interface Receipt {
  id: string;
  reference: string;
  from: string;
  to: string;
  contact: string;
  scheduleDate: string; // ISO format (YYYY-MM-DD)
  responsible: string;
  status: ReceiptStatus;
  lines: OperationLine[];
}

export interface OperationKpi {
  toProcess: number;
  late: number;
  waiting?: number;
  total: number;
}

export interface DashboardKpis {
  receipts: OperationKpi;
  deliveries: OperationKpi;
}

export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  costPerUnit: number;
  onHand: number;
  reserved: number;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address?: string | null;
}

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
  warehouseName?: string;
}
