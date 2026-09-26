import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { referenceNo, warehouseId, locationId, lines } = body;

    if (!referenceNo || !warehouseId || !locationId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create receipt
      const receipt = await tx.receipt.create({
        data: {
          referenceNo,
          warehouseId,
          locationId,
          createdById: auth.user!.userId,
          status: 'DONE',
          lines: {
            create: lines.map((line: any) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitCost: line.unitCost || 0,
            })),
          },
        },
        include: { lines: true },
      });

      // 2. Increase stock and create ledger entries
      for (const line of receipt.lines) {
        // Find existing stock or create it
        const stock = await tx.stock.upsert({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId,
            },
          },
          update: {
            onHand: { increment: line.quantity },
          },
          create: {
            productId: line.productId,
            locationId,
            onHand: line.quantity,
          },
        });

        // Calculate before and after
        const beforeQuantity = stock.onHand - line.quantity;
        const afterQuantity = stock.onHand;

        // Create ledger entry
        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId,
            type: 'RECEIPT',
            quantity: line.quantity,
            beforeQuantity,
            afterQuantity,
            referenceType: 'Receipt',
            referenceNo: receipt.referenceNo,
            createdById: auth.user!.userId,
          },
        });
      }

      return receipt;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Receipt POST error:', error);
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
  const warehouseId = searchParams.get('warehouseId');
  const status = searchParams.get('status');

  const where: any = {};
  if (warehouseId) where.warehouseId = warehouseId;
  if (status) where.status = status;

  try {
    const receipts = await prisma.receipt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: { select: { name: true } },
        location: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Receipt GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
