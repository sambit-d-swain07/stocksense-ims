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
      let isWaiting = false;

      // Check stock availability
      for (const line of lines) {
        const stock = await tx.stock.findUnique({
          where: {
            productId_locationId: { productId: line.productId, locationId },
          },
        });

        const available = stock ? (stock.onHand - stock.reserved) : 0;
        if (available < line.quantity) {
          isWaiting = true;
          break; // If any line fails, whole delivery is WAITING
        }
      }

      const status = isWaiting ? 'WAITING' : 'READY';

      const delivery = await tx.delivery.create({
        data: {
          referenceNo,
          warehouseId,
          locationId,
          status,
          createdById: auth.user!.userId,
          lines: {
            create: lines.map((line: any) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
          },
        },
        include: { lines: true },
      });

      // If READY, atomically increment reserved quantity and verify it did not exceed onHand
      if (status === 'READY') {
        for (const line of lines) {
          const updatedStock = await tx.stock.update({
            where: {
              productId_locationId: { productId: line.productId, locationId },
            },
            data: {
              reserved: { increment: line.quantity },
            },
          });
          
          if (updatedStock.reserved > updatedStock.onHand) {
            throw new Error(`Concurrent reservation error: insufficient stock for product ${line.productId}`);
          }
        }
      }

      return delivery;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Delivery POST error:', error);
    if (error.message && error.message.includes('Concurrent reservation error')) {
       // Returning 409 Conflict allows the client to retry (which will result in WAITING)
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
  const warehouseId = searchParams.get('warehouseId');
  const status = searchParams.get('status');

  const where: any = {};
  if (warehouseId) where.warehouseId = warehouseId;
  if (status) where.status = status;

  try {
    const deliveries = await prisma.delivery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: { select: { name: true } },
        location: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Delivery GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
