import { Category, Product, Warehouse, Location, DashboardKpis } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Raw Materials' },
  { id: 'cat-2', name: 'Finished Goods' },
  { id: 'cat-3', name: 'Packaging' },
  { id: 'cat-4', name: 'Office Furniture' },
  { id: 'cat-5', name: 'Electronics' },
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Central Hub',
    shortCode: 'WH-MAIN',
    address: 'Plot 42, Logistics Park Phase II, Industrial Corridor, Pune 411018',
  },
  {
    id: 'wh-2',
    name: 'North Transit Facility',
    shortCode: 'WH-NORTH',
    address: 'Warehouse 7B, Cargo Terminal NH48, Sector 18, Gurgaon 122001',
  },
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    name: 'Raw Materials Bay A',
    shortCode: 'BAY-A',
    warehouseId: 'wh-1',
  },
  {
    id: 'loc-2',
    name: 'Assembly Storage 01',
    shortCode: 'ASM-01',
    warehouseId: 'wh-1',
  },
  {
    id: 'loc-3',
    name: 'Bulk Storage Deck 2',
    shortCode: 'BLK-02',
    warehouseId: 'wh-2',
  },
  {
    id: 'loc-4',
    name: 'Dispatch Staging Zone',
    shortCode: 'DISP-1',
    warehouseId: 'wh-2',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Steel Rods 12mm High Tensile',
    sku: 'STL-ROD-012',
    categoryId: 'cat-1',
    unit: 'kg',
    costPrice: 65,
    onHand: 450,
    reserved: 50,
  },
  {
    id: 'prod-2',
    name: 'Industrial Hex Bolts M8',
    sku: 'BLT-HEX-008',
    categoryId: 'cat-1',
    unit: 'Units',
    costPrice: 4.5,
    onHand: 1200,
    reserved: 100,
  },
  {
    id: 'prod-3',
    name: 'Ergonomic Mesh Office Chair',
    sku: 'FUR-CHR-001',
    categoryId: 'cat-4',
    unit: 'Units',
    costPrice: 4200,
    onHand: 8,
    reserved: 3,
  },
  {
    id: 'prod-4',
    name: 'Dual Motor Standing Desk Frame',
    sku: 'FUR-DSK-002',
    categoryId: 'cat-4',
    unit: 'Units',
    costPrice: 12500,
    onHand: 0,
    reserved: 0,
  },
  {
    id: 'prod-5',
    name: 'Heavy-Duty Corrugated Boxes 5-Ply',
    sku: 'PKG-BOX-020',
    categoryId: 'cat-3',
    unit: 'Box',
    costPrice: 45,
    onHand: 350,
    reserved: 20,
  },
  {
    id: 'prod-6',
    name: 'High Thermal Conductivity Paste 50g',
    sku: 'ELC-THP-050',
    categoryId: 'cat-5',
    unit: 'g',
    costPrice: 180,
    onHand: 5,
    reserved: 2,
  },
  {
    id: 'prod-7',
    name: 'Synthetic Industrial Gear Oil ISO 220',
    sku: 'CHM-LUB-005',
    categoryId: 'cat-1',
    unit: 'Litres',
    costPrice: 320,
    onHand: 85,
    reserved: 10,
  },
  {
    id: 'prod-8',
    name: 'Anodized Aluminium Profile Channel',
    sku: 'RAW-ALM-003',
    categoryId: 'cat-1',
    unit: 'Metres',
    costPrice: 850,
    onHand: 60,
    reserved: 15,
  },
];

export const INITIAL_DASHBOARD_KPIS: DashboardKpis = {
  receipts: {
    toReceive: 4,
    late: 1,
    operations: 6,
  },
  deliveries: {
    toDeliver: 8,
    late: 1,
    waiting: 2,
    operations: 6,
  },
};
