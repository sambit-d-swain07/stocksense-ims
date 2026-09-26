import { Warehouse, Location } from '@/types/operations';
import { mockWarehouses, mockLocations } from './mock/settings';

let warehousesState: Warehouse[] = mockWarehouses.map((w) => ({ ...w }));
let locationsState: Location[] = mockLocations.map((l) => ({ ...l }));

const simulateLatency = async (ms: number = 250) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

// ==========================================
// WAREHOUSES API
// ==========================================

export async function getWarehouses(): Promise<Warehouse[]> {
  // Later: return fetch('/api/warehouses').then(r => r.json()).then(j => j.data)
  await simulateLatency();
  return warehousesState.map((w) => ({ ...w }));
}

export async function saveWarehouse(
  input: Partial<Warehouse> & { id?: string }
): Promise<Warehouse> {
  // Later: return fetch('/api/warehouses', { method: input.id ? 'PUT' : 'POST', body: JSON.stringify(input) }).then(r => r.json()).then(j => j.data)
  await simulateLatency();

  const name = (input.name || '').trim();
  const shortCode = (input.shortCode || '').trim().toUpperCase();

  if (!name) {
    throw new Error('Warehouse name is required');
  }

  if (!shortCode || shortCode.length < 2 || shortCode.length > 5 || !/^[A-Z0-9]+$/.test(shortCode)) {
    throw new Error('Short code must be 2 to 5 uppercase alphanumeric characters');
  }

  // Check code uniqueness
  const duplicate = warehousesState.find(
    (w) => w.shortCode === shortCode && w.id !== input.id
  );
  if (duplicate) {
    throw new Error(`Warehouse short code "${shortCode}" is already in use`);
  }

  if (input.id) {
    const idx = warehousesState.findIndex((w) => w.id === input.id);
    if (idx !== -1) {
      const updated: Warehouse = {
        ...warehousesState[idx],
        name,
        shortCode,
        address: input.address || null,
      };
      warehousesState[idx] = updated;

      // Update location warehouseNames if code/name changed
      locationsState = locationsState.map((loc) =>
        loc.warehouseId === input.id ? { ...loc, warehouseName: name } : loc
      );

      return { ...updated };
    }
  }

  const newWarehouse: Warehouse = {
    id: input.id || `wh-${Date.now()}`,
    name,
    shortCode,
    address: input.address || null,
  };

  warehousesState.push(newWarehouse);
  return { ...newWarehouse };
}

export async function deleteWarehouse(id: string): Promise<void> {
  // Later: return fetch(`/api/warehouses/${id}`, { method: 'DELETE' })
  await simulateLatency();

  // Check if warehouse has attached locations
  const hasLocations = locationsState.some((loc) => loc.warehouseId === id);
  if (hasLocations) {
    throw new Error('Remove its locations first');
  }

  warehousesState = warehousesState.filter((w) => w.id !== id);
}

// ==========================================
// LOCATIONS API
// ==========================================

export async function getLocations(): Promise<Location[]> {
  // Later: return fetch('/api/locations').then(r => r.json()).then(j => j.data)
  await simulateLatency();
  return locationsState.map((l) => ({ ...l }));
}

export async function saveLocation(
  input: Partial<Location> & { id?: string }
): Promise<Location> {
  // Later: return fetch('/api/locations', { method: input.id ? 'PUT' : 'POST', body: JSON.stringify(input) }).then(r => r.json()).then(j => j.data)
  await simulateLatency();

  const name = (input.name || '').trim();
  const shortCode = (input.shortCode || '').trim().toUpperCase();
  const warehouseId = input.warehouseId || '';

  if (!name) {
    throw new Error('Location name is required');
  }

  if (!shortCode) {
    throw new Error('Short code is required');
  }

  if (!warehouseId) {
    throw new Error('Warehouse is required');
  }

  const warehouse = warehousesState.find((w) => w.id === warehouseId);
  if (!warehouse) {
    throw new Error('Selected warehouse does not exist');
  }

  // Check shortCode uniqueness within same warehouse
  const duplicate = locationsState.find(
    (loc) =>
      loc.warehouseId === warehouseId &&
      loc.shortCode === shortCode &&
      loc.id !== input.id
  );
  if (duplicate) {
    throw new Error(
      `Short code "${shortCode}" already exists in ${warehouse.name}`
    );
  }

  if (input.id) {
    const idx = locationsState.findIndex((l) => l.id === input.id);
    if (idx !== -1) {
      const updated: Location = {
        ...locationsState[idx],
        name,
        shortCode,
        warehouseId,
        warehouseName: warehouse.name,
      };
      locationsState[idx] = updated;
      return { ...updated };
    }
  }

  const newLocation: Location = {
    id: input.id || `loc-${Date.now()}`,
    name,
    shortCode,
    warehouseId,
    warehouseName: warehouse.name,
  };

  locationsState.push(newLocation);
  return { ...newLocation };
}

export async function deleteLocation(id: string): Promise<void> {
  // Later: return fetch(`/api/locations/${id}`, { method: 'DELETE' })
  await simulateLatency();
  locationsState = locationsState.filter((l) => l.id !== id);
}
