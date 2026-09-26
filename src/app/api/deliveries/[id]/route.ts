import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const deliveryItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

const updateDeliverySchema = z.object({
  reference: z.string().optional(),
  customerName: z.string().optional(),
  status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE']).optional(),
  items: z.array(deliveryItemSchema).optional(),
});

async function getDeliveryByIdOrRef(id: string) {
  return await withRetry(() =>
    prisma.delivery.findFirst({
      where: {
        OR: [{ id }, { reference: id }],
      },
      include: {
        items: {
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
        },
      },
    })
  );
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const delivery = await getDeliveryByIdOrRef(params.id);
    if (!delivery) {
      return NextResponse.json({ error: { message: 'Delivery not found' } }, { status: 404 });
    }

    const enrichedItems = await Promise.all(
      delivery.items.map(async (item) => {
        const stock = await prisma.stock.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.locationId,
            },
          },
        });
        const availableStock = stock ? stock.onHand : 0;
        return {
          ...item,
          productName: item.product?.name || '',
          locationName: item.location?.name || '',
          warehouseName: item.location?.warehouse?.name || '',
          availableStock,
          isOutOfStock: availableStock < item.quantity,
        };
      })
    );

    const data = {
      ...delivery,
      items: enrichedItems,
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error(`GET /api/deliveries/${params.id} error:`, err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch delivery' } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params.id);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params.id);
}

async function handleUpdate(req: Request, id: string) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, updateDeliverySchema);
  if (!result.success) return result.response;

  const { reference, customerName, status, items } = result.data;

  try {
    const existing = await getDeliveryByIdOrRef(id);
    if (!existing) {
      return NextResponse.json({ error: { message: 'Delivery not found' } }, { status: 404 });
    }

    // DUPLICATE DONE PROTECTION
    if (existing.status === 'DONE') {
      if (status && status !== 'DONE') {
        return NextResponse.json(
          { error: { message: 'Cannot change status of a completed delivery' } },
          { status: 400 }
        );
      }
      if (items && items.length > 0) {
        return NextResponse.json(
          { error: { message: 'Cannot modify items of a completed delivery' } },
          { status: 400 }
        );
      }

      const enrichedItems = await Promise.all(
        existing.items.map(async (item) => {
          const stock = await prisma.stock.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: item.locationId,
              },
            },
          });
          const availableStock = stock ? stock.onHand : 0;
          return {
            ...item,
            productName: item.product?.name || '',
            locationName: item.location?.name || '',
            warehouseName: item.location?.warehouse?.name || '',
            availableStock,
            isOutOfStock: availableStock < item.quantity,
          };
        })
      );

      return NextResponse.json({ data: { ...existing, items: enrichedItems } });
    }

    // Validate product & location existence if new items are provided
    if (items) {
      for (const item of items) {
        const productExists = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!productExists) {
          return NextResponse.json(
            { error: { message: `Product ${item.productId} does not exist` } },
            { status: 400 }
          );
        }
        const locationExists = await prisma.location.findUnique({ where: { id: item.locationId } });
        if (!locationExists) {
          return NextResponse.json(
            { error: { message: `Location ${item.locationId} does not exist` } },
            { status: 400 }
          );
        }
      }
    }

    const targetStatus = status || existing.status;
    const finalItems = items || existing.items;
    const finalRef = reference !== undefined ? reference : existing.reference;
    const finalCustomer = customerName !== undefined ? customerName : existing.customerName;

    if (targetStatus === 'DONE') {
      // Stock check before executing transition to DONE
      const stockInfo = [];
      let allAvailable = true;

      for (const item of finalItems) {
        const stock = await prisma.stock.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.locationId,
            },
          },
        });
        const availableStock = stock ? stock.onHand : 0;
        const isOutOfStock = availableStock < item.quantity;
        if (isOutOfStock) allAvailable = false;

        stockInfo.push({
          productId: item.productId,
          locationId: item.locationId,
          requiredQuantity: item.quantity,
          availableStock,
          isOutOfStock,
        });
      }

      if (!allAvailable) {
        const failedItems = stockInfo.filter((s) => s.isOutOfStock);
        return NextResponse.json(
          {
            error: {
              message: 'Insufficient stock to complete delivery',
              outOfStockItems: failedItems,
            },
          },
          { status: 400 }
        );
      }

      const ops: any[] = [];
      if (items) {
        ops.push(prisma.deliveryItem.deleteMany({ where: { deliveryId: existing.id } }));
        ops.push(
          prisma.deliveryItem.createMany({
            data: items.map((i) => ({
              deliveryId: existing.id,
              productId: i.productId,
              locationId: i.locationId,
              quantity: i.quantity,
            })),
          })
        );
      }

      ops.push(
        prisma.delivery.update({
          where: { id: existing.id },
          data: {
            reference: finalRef,
            customerName: finalCustomer,
            status: 'DONE',
          },
          include: {
            items: {
              include: {
                product: { select: { id: true, name: true, sku: true } },
                location: { select: { id: true, name: true, shortCode: true } },
              },
            },
          },
        })
      );

      for (const item of finalItems) {
        ops.push(
          prisma.stock.update({
            where: {
              productId_locationId: { productId: item.productId, locationId: item.locationId },
            },
            data: { onHand: { decrement: item.quantity } },
          })
        );

        ops.push(
          prisma.stockMove.create({
            data: {
              type: 'OUT',
              reference: finalRef,
              productId: item.productId,
              locationId: item.locationId,
              quantity: item.quantity,
              notes: finalCustomer ? `Delivery to ${finalCustomer}` : 'Delivery DONE',
            },
          })
        );
      }

      const results = await withRetry(() => prisma.$transaction(ops));
      const updatedDelivery =
        results.find((res: any) => res && res.reference && res.status === 'DONE') ||
        (await getDeliveryByIdOrRef(existing.id));

      return NextResponse.json({ data: updatedDelivery });
    } else {
      // Update DRAFT, WAITING, or READY delivery without touching stock
      const ops: any[] = [];
      if (items) {
        ops.push(prisma.deliveryItem.deleteMany({ where: { deliveryId: existing.id } }));
        ops.push(
          prisma.deliveryItem.createMany({
            data: items.map((i) => ({
              deliveryId: existing.id,
              productId: i.productId,
              locationId: i.locationId,
              quantity: i.quantity,
            })),
          })
        );
      }

      ops.push(
        prisma.delivery.update({
          where: { id: existing.id },
          data: {
            reference: finalRef,
            customerName: finalCustomer,
            status: targetStatus,
          },
          include: {
            items: {
              include: {
                product: { select: { id: true, name: true, sku: true } },
                location: { select: { id: true, name: true, shortCode: true } },
              },
            },
          },
        })
      );

      const results = await withRetry(() => prisma.$transaction(ops));
      const updatedDelivery =
        results.find((res: any) => res && res.reference) || (await getDeliveryByIdOrRef(existing.id));

      return NextResponse.json({ data: updatedDelivery });
    }
  } catch (err: any) {
    console.error(`PUT/PATCH /api/deliveries/${id} error:`, err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to update delivery' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const existing = await getDeliveryByIdOrRef(params.id);
    if (!existing) {
      return NextResponse.json({ error: { message: 'Delivery not found' } }, { status: 404 });
    }

    if (existing.status === 'DONE') {
      return NextResponse.json(
        { error: { message: 'Cannot delete a completed delivery' } },
        { status: 400 }
      );
    }

    await prisma.delivery.delete({ where: { id: existing.id } });

    return NextResponse.json({ data: { message: 'Delivery deleted successfully' } });
  } catch (err: any) {
    console.error(`DELETE /api/deliveries/${params.id} error:`, err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to delete delivery' } },
      { status: 500 }
    );
  }
}
