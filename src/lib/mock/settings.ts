import { Warehouse, Location } from '@/types/operations';

export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'Main Warehouse',
    shortCode: 'WH',
    address: '100 Logistics Way, Industrial Zone, Area 4',
  },
  {
    id: 'wh-002',
    name: 'Warehouse 2',
    shortCode: 'WH2',
    address: '45 Freight Avenue, North Terminal',
  },
  {
    id: 'wh-003',
    name: 'Production Floor',
    shortCode: 'PF',
    address: 'Building B, Manufacturing Plant',
  },
];

export const mockLocations: Location[] = [
  {
    id: 'loc-001',
    name: 'Stock',
    shortCode: 'STOCK',
    warehouseId: 'wh-001',
    warehouseName: 'Main Warehouse',
  },
  {
    id: 'loc-002',
    name: 'Rack A',
    shortCode: 'RACK-A',
    warehouseId: 'wh-001',
    warehouseName: 'Main Warehouse',
  },
  {
    id: 'loc-003',
    name: 'Rack B',
    shortCode: 'RACK-B',
    warehouseId: 'wh-001',
    warehouseName: 'Main Warehouse',
  },
  {
    id: 'loc-004',
    name: 'Dispatch',
    shortCode: 'DISPATCH',
    warehouseId: 'wh-002',
    warehouseName: 'Warehouse 2',
  },
  {
    id: 'loc-005',
    name: 'Shelf 1',
    shortCode: 'SHELF-1',
    warehouseId: 'wh-003',
    warehouseName: 'Production Floor',
  },
];
