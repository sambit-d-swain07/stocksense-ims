import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const createStockSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  onHand: z.number().int().min(0, 'onHand must be 0 or greater').optional().default(0),
  reserved: z.number().int().min(0, 'reserved must be 0 or greater').optional().default(0),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const stockRows = await prisma.stock.findMany({
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
      orderBy: { id: 'asc' },
    });

    const data = stockRows.map((stock) => ({
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
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/stock error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch stock rows' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createStockSchema);
  if (!result.success) return result.response;

  const { productId, locationId, onHand, reserved } = result.data;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: { message: 'Product not found', fields: { productId: 'Product does not exist' } } },
        { status: 400 }
      );
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
      return NextResponse.json(
        { error: { message: 'Location not found', fields: { locationId: 'Location does not exist' } } },
        { status: 400 }
      );
    }

    const stock = await prisma.stock.upsert({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
      update: {
        onHand: onHand ?? 0,
        reserved: reserved ?? 0,
      },
      create: {
        productId,
        locationId,
        onHand: onHand ?? 0,
        reserved: reserved ?? 0,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        location: { select: { id: true, name: true, shortCode: true } },
      },
    });

    return NextResponse.json(
      {
        data: {
          ...stock,
          productName: stock.product?.name || '',
          locationName: stock.location?.name || '',
          freeToUse: stock.onHand - stock.reserved,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/stock error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create/update stock row' } },
      { status: 500 }
    );
  }
}
