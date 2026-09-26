import {
  Category,
  Product,
  Warehouse,
  Location,
  DashboardKpis,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_DASHBOARD_KPIS,
} from './mock-data';

export class ApiError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.field = field;
  }
}

// In-memory mutable state initialized from mock data
let categories: Category[] = [...INITIAL_CATEGORIES];
let products: Product[] = [...INITIAL_PRODUCTS];
let warehouses: Warehouse[] = [...INITIAL_WAREHOUSES];
let locations: Location[] = [...INITIAL_LOCATIONS];
let dashboardKpis: DashboardKpis = { ...INITIAL_DASHBOARD_KPIS };

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // TODO: GET /api/dashboard/kpis
  async getDashboardKpis(): Promise<DashboardKpis> {
    await delay(250);
    return JSON.parse(JSON.stringify(dashboardKpis));
  },

  // TODO: GET /api/categories
  async getCategories(): Promise<Category[]> {
    await delay(200);
    return JSON.parse(JSON.stringify(categories));
  },

  // TODO: GET /api/products
  async getProducts(): Promise<Product[]> {
    await delay(300);
    // Enrich with categoryName for UI display
    const enriched = products.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      return {
        ...p,
        categoryName: cat?.name || 'Uncategorized',
      };
    });
    return JSON.parse(JSON.stringify(enriched));
  },

  // TODO: POST /api/products
  async createProduct(input: {
    name: string;
    sku: string;
    categoryId: string;
    unit: string;
    initialStock?: number;
  }): Promise<Product> {
    await delay(350);
    const upperSku = input.sku.trim().toUpperCase();

    const exists = products.some((p) => p.sku.toUpperCase() === upperSku);
    if (exists) {
      throw new ApiError('Product with this SKU already exists.', 'sku');
    }

    const cat = categories.find((c) => c.id === input.categoryId);
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: input.name.trim(),
      sku: upperSku,
      categoryId: input.categoryId,
      categoryName: cat?.name || 'Uncategorized',
      unit: input.unit,
      costPrice: 0,
      onHand: Number(input.initialStock) || 0,
      reserved: 0,
    };

    products.unshift(newProduct);
    return JSON.parse(JSON.stringify(newProduct));
  },

  // TODO: PATCH /api/stock/[id] or PUT /api/products/[id]/stock
  async updateStock(
    productId: string,
    data: { costPrice: number; onHand: number }
  ): Promise<Product> {
    await delay(300);
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new ApiError('Product not found.');
    }

    const existing = products[index];
    if (data.onHand < existing.reserved) {
      throw new ApiError(
        `On Hand cannot be less than reserved quantity (${existing.reserved}).`,
        'onHand'
      );
    }

    const updated: Product = {
      ...existing,
      costPrice: Number(data.costPrice) || 0,
      onHand: Number(data.onHand) || 0,
    };

    products[index] = updated;
    const cat = categories.find((c) => c.id === updated.categoryId);
    return JSON.parse(
      JSON.stringify({ ...updated, categoryName: cat?.name || 'Uncategorized' })
    );
  },

  // TODO: GET /api/warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    await delay(300);
    const enriched = warehouses.map((w) => {
      const count = locations.filter((loc) => loc.warehouseId === w.id).length;
      return {
        ...w,
        locationCount: count,
      };
    });
    return JSON.parse(JSON.stringify(enriched));
  },

  // TODO: POST /api/warehouses
  async createWarehouse(input: {
    name: string;
    shortCode: string;
    address: string;
  }): Promise<Warehouse> {
    await delay(350);
    const upperCode = input.shortCode.trim().toUpperCase();

    const exists = warehouses.some((w) => w.shortCode.toUpperCase() === upperCode);
    if (exists) {
      throw new ApiError('Warehouse with this short code already exists.', 'shortCode');
    }

    const newWarehouse: Warehouse = {
      id: `wh-${Date.now()}`,
      name: input.name.trim(),
      shortCode: upperCode,
      address: input.address.trim(),
      locationCount: 0,
    };

    warehouses.unshift(newWarehouse);
    return JSON.parse(JSON.stringify(newWarehouse));
  },

  // TODO: GET /api/locations
  async getLocations(): Promise<Location[]> {
    await delay(300);
    const enriched = locations.map((loc) => {
      const wh = warehouses.find((w) => w.id === loc.warehouseId);
      return {
        ...loc,
        warehouseCode: wh?.shortCode || 'N/A',
      };
    });
    return JSON.parse(JSON.stringify(enriched));
  },

  // TODO: POST /api/locations
  async createLocation(input: {
    name: string;
    shortCode: string;
    warehouseId: string;
  }): Promise<Location> {
    await delay(350);
    const upperCode = input.shortCode.trim().toUpperCase();

    const exists = locations.some(
      (loc) =>
        loc.warehouseId === input.warehouseId &&
        loc.shortCode.toUpperCase() === upperCode
    );

    if (exists) {
      throw new ApiError(
        'Location short code already exists in this warehouse.',
        'shortCode'
      );
    }

    const wh = warehouses.find((w) => w.id === input.warehouseId);
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      name: input.name.trim(),
      shortCode: upperCode,
      warehouseId: input.warehouseId,
      warehouseCode: wh?.shortCode || 'N/A',
    };

    locations.unshift(newLocation);
    return JSON.parse(JSON.stringify(newLocation));
  },
};
