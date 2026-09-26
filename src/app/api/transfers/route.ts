import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';
import { generateTransferRef } from '@/lib/ref';

export const dynamic = 'force-dynamic';

const transferSchema = z.object({
  reference: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  fromLocationId: z.string().min(1, 'Source Location ID is required'),
  toLocationId: z.string().min(1, 'Destination Location ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  responsible: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const transferMoves = await prisma.stockMove.findMany({
      where: {
        OR: [
          { reference: { startsWith: 'WH/INT/' } },
          { notes: { contains: 'Internal Transfer', mode: 'insensitive' } },
        ],
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
      orderBy: { createdAt: 'desc' },
    });

    // Group moves by reference
    const grouped = new Map<string, any>();
    for (const move of transferMoves) {
      const ref = move.reference;
      if (!grouped.has(ref)) {
        grouped.set(ref, {
          id: move.id,
          reference: ref,
          productId: move.productId,
          productName: move.product?.name || '',
          productSku: move.product?.sku || '',
          quantity: move.quantity,
          createdAt: move.createdAt,
          status: 'DONE',
          fromLocationId: move.type === 'OUT' ? move.locationId : null,
          fromLocationName: move.type === 'OUT' ? move.location?.name : null,
          toLocationId: move.type === 'IN' ? move.locationId : null,
          toLocationName: move.type === 'IN' ? move.location?.name : null,
          notes: move.notes,
        });
      } else {
        const item = grouped.get(ref);
        if (move.type === 'OUT' && !item.fromLocationId) {
          item.fromLocationId = move.locationId;
          item.fromLocationName = move.location?.name;
        }
        if (move.type === 'IN' && !item.toLocationId) {
          item.toLocationId = move.locationId;
          item.toLocationName = move.location?.name;
        }
      }
    }

    const data = Array.from(grouped.values());
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/transfers error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch internal transfers' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, transferSchema);
  if (!result.success) return result.response;

  const { reference: inputRef, productId, fromLocationId, toLocationId, quantity, responsible, notes } = result.data;

  if (fromLocationId === toLocationId) {
    return NextResponse.json(
      { error: { message: 'Source and Destination locations must be different' } },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: { message: `Product ${productId} does not exist` } },
        { status: 400 }
      );
    }

    const fromLocation = await prisma.location.findUnique({
      where: { id: fromLocationId },
      include: { warehouse: { select: { name: true } } },
    });
    if (!fromLocation) {
      return NextResponse.json(
        { error: { message: `Source location ${fromLocationId} does not exist` } },
        { status: 400 }
      );
    }

    const toLocation = await prisma.location.findUnique({
      where: { id: toLocationId },
      include: { warehouse: { select: { name: true } } },
    });
    if (!toLocation) {
      return NextResponse.json(
        { error: { message: `Destination location ${toLocationId} does not exist` } },
        { status: 400 }
      );
    }

    // Stock availability check at source location
    const sourceStock = await prisma.stock.findUnique({
      where: { productId_locationId: { productId, locationId: fromLocationId } },
    });

    const available = sourceStock ? sourceStock.onHand : 0;
    if (available < quantity) {
      return NextResponse.json(
        {
          error: {
            message: `Insufficient stock at ${fromLocation.name}. Available: ${available}, Requested: ${quantity}`,
            availableQuantity: available,
            requestedQuantity: quantity,
          },
        },
        { status: 400 }
      );
    }

    const reference = await generateTransferRef(inputRef);
    const transferNotes = notes || `Internal Transfer from ${fromLocation.name} to ${toLocation.name}${responsible ? ` (By ${responsible})` : ''}`;

    const ops: any[] = [
      // 1. Decrement source stock
      prisma.stock.update({
        where: { productId_locationId: { productId, locationId: fromLocationId } },
        data: { onHand: { decrement: quantity } },
      }),
      // 2. Increment destination stock
      prisma.stock.upsert({
        where: { productId_locationId: { productId, locationId: toLocationId } },
        update: { onHand: { increment: quantity } },
        create: { productId, locationId: toLocationId, onHand: quantity, reserved: 0 },
      }),
      // 3. Create OUT ledger entry
      prisma.stockMove.create({
        data: {
          type: 'OUT',
          reference,
          productId,
          locationId: fromLocationId,
          quantity,
          notes: transferNotes,
        },
      }),
      // 4. Create IN ledger entry
      prisma.stockMove.create({
        data: {
          type: 'IN',
          reference,
          productId,
          locationId: toLocationId,
          quantity,
          notes: transferNotes,
        },
      }),
    ];

    await withRetry(() => prisma.$transaction(ops));

    const transferData = {
      reference,
      productId,
      productName: product.name,
      productSku: product.sku,
      fromLocationId,
      fromLocationName: fromLocation.name,
      toLocationId,
      toLocationName: toLocation.name,
      quantity,
      status: 'DONE',
      createdAt: new Date().toISOString(),
      responsible: responsible || null,
      notes: transferNotes,
    };

    return NextResponse.json({ data: transferData }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/transfers error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to process internal transfer' } },
      { status: 500 }
    );
  }
}
