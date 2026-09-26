import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        lines: {
          include: {
            product: { select: { name: true, sku: true, unit: true } }
          }
        },
        warehouse: { select: { name: true, shortCode: true } },
        location: { select: { name: true, shortCode: true } },
        createdBy: { select: { name: true } },
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error('Delivery GET [id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    if (delivery.status === 'DONE') {
      return NextResponse.json({ error: 'Cannot change status of a completed delivery' }, { status: 400 });
    }

    // Process transition to DONE
    if (status === 'DONE') {
      const result = await prisma.$transaction(async (tx) => {
        if (delivery.status === 'WAITING' || delivery.status === 'DRAFT') {
          // WAITING -> DONE (No reservation was made)
          for (const line of delivery.lines) {
            // Atomic decrement
            const stock = await tx.stock.update({
              where: {
                productId_locationId: { productId: line.productId, locationId: delivery.locationId },
              },
              data: {
                onHand: { decrement: line.quantity },
              },
            });

            // Since it was WAITING, it didn't reserve. But we must ensure deducting onHand doesn't steal reserved stock.
            if (stock.onHand < stock.reserved) {
               throw new Error(`Insufficient available stock to complete WAITING delivery for product ${line.productId}`);
            }

            const beforeQuantity = stock.onHand + line.quantity;
            const afterQuantity = stock.onHand;

            await tx.stockLedger.create({
              data: {
                productId: line.productId,
                locationId: delivery.locationId,
                type: 'DELIVERY',
                quantity: -line.quantity,
                beforeQuantity,
                afterQuantity,
                referenceType: 'Delivery',
                referenceNo: delivery.referenceNo,
                createdById: auth.user!.userId,
              },
            });
          }
        } else if (delivery.status === 'READY') {
          // READY -> DONE (Reservation was made)
          for (const line of delivery.lines) {
            const stock = await tx.stock.update({
              where: {
                productId_locationId: { productId: line.productId, locationId: delivery.locationId },
              },
              data: {
                onHand: { decrement: line.quantity },
                reserved: { decrement: line.quantity },
              },
            });

            if (stock.onHand < 0 || stock.reserved < 0) {
              throw new Error(`Stock integrity error during completion for product ${line.productId}`);
            }

            const beforeQuantity = stock.onHand + line.quantity;
            const afterQuantity = stock.onHand;

            await tx.stockLedger.create({
              data: {
                productId: line.productId,
                locationId: delivery.locationId,
                type: 'DELIVERY',
                quantity: -line.quantity,
                beforeQuantity,
                afterQuantity,
                referenceType: 'Delivery',
                referenceNo: delivery.referenceNo,
                createdById: auth.user!.userId,
              },
            });
          }
        }

        // Update delivery status
        return await tx.delivery.update({
          where: { id: params.id },
          data: { status },
          include: { lines: true },
        });
      });

      return NextResponse.json(result);
    }
    
    // Reject other invalid status transitions
    return NextResponse.json({ error: 'Only transitions to DONE are supported for safety' }, { status: 409 });
    
  } catch (error: any) {
    console.error('Delivery PATCH error:', error);
    if (error.message && (error.message.includes('Insufficient') || error.message.includes('Stock integrity'))) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
