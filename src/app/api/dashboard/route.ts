import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const data = await withRetry(async () => {
      const [
        totalProducts,
        totalWarehouses,
        totalStockAgg,
        pendingReceipts,
        pendingDeliveries,
        recentMovementsRaw,
        allProductsWithStock,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.warehouse.count(),
        prisma.stock.aggregate({
          _sum: {
            onHand: true,
          },
        }),
        prisma.receipt.count({
          where: {
            status: { in: ['DRAFT', 'READY'] },
          },
        }),
        prisma.delivery.count({
          where: {
            status: { in: ['DRAFT', 'WAITING', 'READY'] },
          },
        }),
        prisma.stockMove.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: { id: true, name: true, sku: true, unit: true },
            },
            location: {
              select: {
                id: true,
                name: true,
                shortCode: true,
                warehouse: { select: { id: true, name: true } },
              },
            },
          },
        }),
        prisma.product.findMany({
          include: {
            category: { select: { id: true, name: true } },
            stocks: {
              select: { onHand: true, reserved: true },
            },
          },
        }),
      ]);

      const totalStock = totalStockAgg._sum.onHand || 0;

      const lowStockProductsList: any[] = [];
      const outOfStockProductsList: any[] = [];

      allProductsWithStock.forEach((product) => {
        const currentStock = product.stocks.reduce((acc, s) => acc + s.onHand, 0);
        const productInfo = {
          id: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
          categoryName: product.category?.name || '',
          reorderPoint: product.reorderPoint,
          currentStock,
        };

        if (currentStock === 0) {
          outOfStockProductsList.push(productInfo);
        } else if (currentStock <= product.reorderPoint) {
          lowStockProductsList.push(productInfo);
        }
      });

      const recentMovements = recentMovementsRaw.map((move) => ({
        id: move.id,
        type: move.type,
        reference: move.reference,
        productId: move.productId,
        locationId: move.locationId,
        quantity: move.quantity,
        notes: move.notes,
        createdAt: move.createdAt,
        productName: move.product?.name || '',
        productSku: move.product?.sku || '',
        locationName: move.location?.name || '',
        warehouseName: move.location?.warehouse?.name || '',
      }));

      return {
        kpis: {
          totalProducts,
          totalStock,
          totalWarehouses,
          pendingReceipts,
          pendingDeliveries,
          lowStockCount: lowStockProductsList.length,
          outOfStockCount: outOfStockProductsList.length,
        },
        lowStockProducts: lowStockProductsList,
        outOfStockProducts: outOfStockProductsList,
        recentMovements,
      };
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/dashboard error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to calculate dashboard metrics' } },
      { status: 500 }
    );
  }
}
