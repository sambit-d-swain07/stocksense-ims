import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const productIdParam = searchParams.get('productId');
    const locationIdParam = searchParams.get('locationId');
    const referenceParam = searchParams.get('reference');

    const where: any = {};

    if (typeParam && (typeParam === 'IN' || typeParam === 'OUT')) {
      where.type = typeParam;
    }

    if (productIdParam) {
      where.productId = productIdParam;
    }

    if (locationIdParam) {
      where.locationId = locationIdParam;
    }

    if (referenceParam) {
      where.reference = {
        contains: referenceParam,
        mode: 'insensitive',
      };
    }

    const moves = await prisma.stockMove.findMany({
      where,
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

    const data = moves.map((move) => ({
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
      product: move.product,
      location: move.location,
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/ledger error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch ledger movements' } },
      { status: 500 }
    );
  }
}
