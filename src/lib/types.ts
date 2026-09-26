export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  costPrice: number;
  onHand: number;
  reserved: number;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  locationCount?: number;
}

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
  warehouseCode?: string;
}

export interface DashboardKpis {
  receipts: {
    toReceive: number;
    late: number;
    operations: number;
  };
  deliveries: {
    toDeliver: number;
    late: number;
    waiting: number;
    operations: number;
  };
}

export function freeToUse(onHand: number, reserved: number = 0): number {
  return Math.max(onHand - reserved, 0);
}
