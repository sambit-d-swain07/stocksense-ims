import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';
import { generateAdjustmentRef } from '@/lib/ref';

export const dynamic = 'force-dynamic';

const createAdjustmentSchema = z.object({
  reference: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  countedQty: z.number().int().min(0, 'Counted quantity must be 0 or greater'),
  reason: z.string().optional(),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const adjustments = await prisma.adjustment.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            unit: true,
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
      orderBy: { createdAt: 'desc' },
    });

    const data = adjustments.map((adj) => ({
      ...adj,
      productName: adj.product?.name || '',
      productSku: adj.product?.sku || '',
      locationName: adj.location?.name || '',
      warehouseName: adj.location?.warehouse?.name || '',
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/adjustments error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch adjustments' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createAdjustmentSchema);
  if (!result.success) return result.response;

  const { reference: inputRef, productId, locationId, countedQty, reason } = result.data;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: { message: `Product ${productId} does not exist` } },
        { status: 400 }
      );
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
      return NextResponse.json(
        { error: { message: `Location ${locationId} does not exist` } },
        { status: 400 }
      );
    }

    const stock = await prisma.stock.findUnique({
      where: {
        productId_locationId: { productId, locationId },
      },
    });

    const systemQty = stock ? stock.onHand : 0;
    const difference = countedQty - systemQty;
    const reference = await generateAdjustmentRef(inputRef);

    const ops: any[] = [];
    ops.push(
      prisma.stock.upsert({
        where: { productId_locationId: { productId, locationId } },
        update: { onHand: countedQty },
        create: { productId, locationId, onHand: countedQty, reserved: 0 },
      })
    );

    ops.push(
      prisma.adjustment.create({
        data: {
          reference,
          productId,
          locationId,
          systemQty,
          countedQty,
          difference,
          reason: reason || null,
        },
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          location: {
            select: {
              id: true,
              name: true,
              shortCode: true,
              warehouse: { select: { id: true, name: true } },
            },
          },
        },
      })
    );

    if (difference !== 0) {
      const moveType = difference > 0 ? 'IN' : 'OUT';
      const moveQty = Math.abs(difference);
      const noteReason = reason ? `: ${reason}` : '';
      const diffSign = difference > 0 ? `+${difference}` : `${difference}`;

      ops.push(
        prisma.stockMove.create({
          data: {
            type: moveType,
            reference,
            productId,
            locationId,
            quantity: moveQty,
            notes: `Inventory Adjustment (${diffSign})${noteReason}`,
          },
        })
      );
    }

    const results = await withRetry(() => prisma.$transaction(ops));
    const adjustment = results.find((res: any) => res && res.reference && res.systemQty !== undefined);

    const data = {
      ...adjustment,
      productName: adjustment.product?.name || '',
      productSku: adjustment.product?.sku || '',
      locationName: adjustment.location?.name || '',
      warehouseName: adjustment.location?.warehouse?.name || '',
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/adjustments error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to record adjustment' } },
      { status: 500 }
    );
  }
}
