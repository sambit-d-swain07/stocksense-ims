import { OperationLine, ProductOption, StockMap, DeliveryStatus } from '@/types/operations';

/**
 * getShortages(lines, products, stock): returns the lines whose quantity exceeds available stock.
 * Sums total quantities per product first before comparing against available stock.
 */
export function getShortages(
  lines: OperationLine[],
  products: ProductOption[],
  stock: StockMap
): OperationLine[] {
  // Sum quantities per product
  const totalPerProduct: Record<string, number> = {};
  for (const line of lines) {
    if (!line.productId) continue;
    totalPerProduct[line.productId] = (totalPerProduct[line.productId] || 0) + (Number(line.quantity) || 0);
  }

  // Find products that exceed available stock
  const shortProductIds = new Set<string>();
  for (const [productId, totalQty] of Object.entries(totalPerProduct)) {
    const available = stock[productId] ?? 0;
    if (totalQty > available) {
      shortProductIds.add(productId);
    }
  }

  // Return the lines associated with short products
  return lines.filter((line) => shortProductIds.has(line.productId));
}

/**
 * deriveDeliveryStatus: any shortage forces 'waiting' unless already done or canceled
 */
export function deriveDeliveryStatus(
  storedStatus: DeliveryStatus,
  hasShortage: boolean
): DeliveryStatus {
  if (storedStatus === 'done' || storedStatus === 'canceled') {
    return storedStatus;
  }
  if (hasShortage) {
    return 'waiting';
  }
  if (storedStatus === 'waiting') {
    return 'ready';
  }
  return storedStatus;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function isOverdue(scheduleDate?: string, status?: string): boolean {
  if (!scheduleDate || status === 'done' || status === 'canceled') return false;
  const today = new Date().toISOString().split('T')[0];
  return scheduleDate < today;
}

export function searchMatcher<T>(item: T, query: string, fields: (keyof T | string)[]): boolean {
  if (!query || !query.trim()) return true;
  const lowerQuery = query.toLowerCase().trim();

  return fields.some((field) => {
    const val = (item as any)[field];
    if (val === undefined || val === null) return false;
    return String(val).toLowerCase().includes(lowerQuery);
  });
}
