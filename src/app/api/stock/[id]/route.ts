import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const updateStockSchema = z.object({
  onHand: z.number().int().min(0, 'onHand must be 0 or greater'),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const stockId = params.id;

  const result = await validateBody(req, updateStockSchema);
  if (!result.success) return result.response;

  const { onHand } = result.data;

  try {
    const existingStock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!existingStock) {
      return NextResponse.json(
        { error: { message: 'Stock record not found' } },
        { status: 404 }
      );
    }

    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: { onHand },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            shortCode: true,
            warehouse: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const data = {
      id: updatedStock.id,
      productId: updatedStock.productId,
      locationId: updatedStock.locationId,
      productName: updatedStock.product?.name || '',
      locationName: updatedStock.location?.name || '',
      warehouseName: updatedStock.location?.warehouse?.name || '',
      onHand: updatedStock.onHand,
      reserved: updatedStock.reserved,
      freeToUse: updatedStock.onHand - updatedStock.reserved,
      product: updatedStock.product,
      location: updatedStock.location,
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('PATCH /api/stock/[id] error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to update stock quantity' } },
      { status: 500 }
    );
  }
}
