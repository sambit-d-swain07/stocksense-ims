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
