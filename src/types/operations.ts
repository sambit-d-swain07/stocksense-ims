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
