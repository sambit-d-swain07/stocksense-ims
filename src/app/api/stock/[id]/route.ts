import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const updateStockSchema = z.object({
  onHand: z.number().int().min(0, 'onHand must be 0 or greater').optional(),
  reserved: z.number().int().min(0, 'reserved must be 0 or greater').optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const stockId = params.id;

  try {
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
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

    if (!stock) {
      return NextResponse.json(
        { error: { message: 'Stock record not found' } },
        { status: 404 }
      );
    }

    const data = {
      id: stock.id,
      productId: stock.productId,
      locationId: stock.locationId,
      productName: stock.product?.name || '',
      locationName: stock.location?.name || '',
      warehouseName: stock.location?.warehouse?.name || '',
      onHand: stock.onHand,
      reserved: stock.reserved,
      freeToUse: stock.onHand - stock.reserved,
      product: stock.product,
      location: stock.location,
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/stock/[id] error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch stock record' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const stockId = params.id;

  const result = await validateBody(req, updateStockSchema);
  if (!result.success) return result.response;

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

    const newOnHand = result.data.onHand !== undefined ? result.data.onHand : existingStock.onHand;
    const newReserved = result.data.reserved !== undefined ? result.data.reserved : existingStock.reserved;

    if (newOnHand < newReserved) {
      return NextResponse.json(
        { error: { message: 'onHand quantity cannot be less than reserved quantity' } },
        { status: 400 }
      );
    }

    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: {
        onHand: newOnHand,
        reserved: newReserved,
      },
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
