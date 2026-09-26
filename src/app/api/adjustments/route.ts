import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { referenceNo, locationId, productId, type, quantity, reason } = body;

    if (!referenceNo || !locationId || !productId || !type || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    if (type !== 'INCREASE' && type !== 'DECREASE') {
      return NextResponse.json({ error: 'Invalid adjustment type' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let updatedStock;
      
      if (type === 'INCREASE') {
        updatedStock = await tx.stock.upsert({
          where: { productId_locationId: { productId, locationId } },
          update: { onHand: { increment: quantity } },
          create: { productId, locationId, onHand: quantity },
        });
      } else {
        // For DECREASE, we perform an atomic decrement
        updatedStock = await tx.stock.update({
          where: { productId_locationId: { productId, locationId } },
          data: { onHand: { decrement: quantity } },
        });

        // Verify we didn't drop below zero
        if (updatedStock.onHand < 0) {
          throw new Error('Adjustment would result in negative stock');
        }
      }

      // 3. Create Adjustment record
      const adjustment = await tx.adjustment.create({
        data: {
          referenceNo,
          locationId,
          productId,
          type,
          quantity,
          reason,
          createdById: auth.user!.userId,
        },
      });

      // Calculate before/after
      const afterQuantity = updatedStock.onHand;
      const beforeQuantity = type === 'INCREASE' ? afterQuantity - quantity : afterQuantity + quantity;

      // 4. Create StockLedger record
      const ledgerQty = type === 'INCREASE' ? quantity : -quantity;
      await tx.stockLedger.create({
        data: {
          productId,
          locationId,
          type: 'ADJUSTMENT',
          quantity: ledgerQty,
          beforeQuantity,
          afterQuantity,
          referenceType: 'Adjustment',
          referenceNo: adjustment.referenceNo,
          createdById: auth.user!.userId,
        },
      });

      return adjustment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Adjustment POST error:', error);
    if (error.code === 'P2025' && body.type === 'DECREASE') {
      return NextResponse.json({ error: 'Stock record not found to decrease' }, { status: 404 });
    }
    if (error.message && error.message.includes('negative stock')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Reference number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get('locationId');
  const productId = searchParams.get('productId');

  const where: any = {};
  if (locationId) where.locationId = locationId;
  if (productId) where.productId = productId;

  try {
    const adjustments = await prisma.adjustment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error('Adjustment GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
