import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const [
      totalProducts,
      stockAggregate,
      pendingDeliveries,
      recentMovements,
      productsWithStock
    ] = await prisma.$transaction([
      prisma.product.count(),
      prisma.stock.aggregate({ _sum: { onHand: true } }),
      prisma.delivery.count({ where: { status: 'WAITING' } }),
      prisma.stockLedger.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          location: { select: { name: true } },
        },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          reorderPoint: true,
          stocks: {
            select: { onHand: true }
          }
        }
      })
    ]);

    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const product of productsWithStock) {
      const totalStock = product.stocks.reduce((sum, stock) => sum + stock.onHand, 0);
      
      if (totalStock === 0) {
        outOfStockCount++;
      } else if (product.reorderPoint > 0 && totalStock <= product.reorderPoint) {
        lowStockCount++;
      }
    }

    return NextResponse.json({
      kpis: {
        totalProducts,
        totalStockUnits: stockAggregate._sum.onHand || 0,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        pendingDeliveries,
      },
      recentMovements,
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
