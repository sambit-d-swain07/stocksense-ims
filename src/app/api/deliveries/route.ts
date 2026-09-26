import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';
import { generateDeliveryRef } from '@/lib/ref';

export const dynamic = 'force-dynamic';

const deliveryItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

const createDeliverySchema = z.object({
  reference: z.string().optional(),
  customerName: z.string().optional(),
  status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE']).optional().default('DRAFT'),
  items: z.array(deliveryItemSchema).optional().default([]),
});

async function checkStockAvailability(items: Array<{ productId: string; locationId: string; quantity: number }>) {
  const stockInfo = [];
  let allAvailable = true;

  for (const item of items) {
    const stock = await withRetry(() =>
      prisma.stock.findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: item.locationId,
          },
        },
      })
    );

    const availableStock = stock ? stock.onHand : 0;
    const isOutOfStock = availableStock < item.quantity;
    if (isOutOfStock) {
      allAvailable = false;
    }

    stockInfo.push({
      productId: item.productId,
      locationId: item.locationId,
      requiredQuantity: item.quantity,
      availableStock,
      isOutOfStock,
    });
  }

  return { allAvailable, stockInfo };
}

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const deliveries = await withRetry(() =>
      prisma.delivery.findMany({
        include: {
          items: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    );

    const enrichedDeliveries = await Promise.all(
      deliveries.map(async (delivery) => {
        const enrichedItems = await Promise.all(
          delivery.items.map(async (item) => {
            const stock = await withRetry(() =>
              prisma.stock.findUnique({
                where: {
                  productId_locationId: {
                    productId: item.productId,
                    locationId: item.locationId,
                  },
                },
              })
            );
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
        return {
          ...delivery,
          items: enrichedItems,
        };
      })
    );

    return NextResponse.json({ data: enrichedDeliveries });
  } catch (err: any) {
    console.error('GET /api/deliveries error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch deliveries' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createDeliverySchema);
  if (!result.success) return result.response;

  const { reference: inputRef, customerName, status } = result.data;
  const items = result.data.items || [];

  try {
    for (const item of items) {
      const productExists = await withRetry(() => prisma.product.findUnique({ where: { id: item.productId } }));
      if (!productExists) {
        return NextResponse.json(
          { error: { message: `Product ${item.productId} does not exist` } },
          { status: 400 }
        );
      }
      const locationExists = await withRetry(() => prisma.location.findUnique({ where: { id: item.locationId } }));
      if (!locationExists) {
        return NextResponse.json(
          { error: { message: `Location ${item.locationId} does not exist` } },
          { status: 400 }
        );
      }
    }

    const reference = await generateDeliveryRef(inputRef);

    if (status === 'DONE') {
      const { allAvailable, stockInfo } = await checkStockAvailability(items);
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

      const newDelivery = await withRetry(() =>
        prisma.delivery.create({
          data: {
            reference,
            customerName: customerName || null,
            status: 'DONE',
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                locationId: i.locationId,
                quantity: i.quantity,
              })),
            },
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

      const stockOps: any[] = [];
      for (const item of items) {
        stockOps.push(
          prisma.stock.update({
            where: {
              productId_locationId: { productId: item.productId, locationId: item.locationId },
            },
            data: { onHand: { decrement: item.quantity } },
          })
        );
        stockOps.push(
          prisma.stockMove.create({
            data: {
              type: 'OUT',
              reference: newDelivery.reference,
              productId: item.productId,
              locationId: item.locationId,
              quantity: item.quantity,
              notes: customerName ? `Delivery to ${customerName}` : 'Delivery DONE',
            },
          })
        );
      }

      if (stockOps.length > 0) {
        await withRetry(() => prisma.$transaction(stockOps));
      }

      return NextResponse.json({ data: newDelivery }, { status: 201 });
    } else {
      const delivery = await withRetry(() =>
        prisma.delivery.create({
          data: {
            reference,
            customerName: customerName || null,
            status,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                locationId: i.locationId,
                quantity: i.quantity,
              })),
            },
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

      return NextResponse.json({ data: delivery }, { status: 201 });
    }
  } catch (err: any) {
    console.error('POST /api/deliveries error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create delivery' } },
      { status: 500 }
    );
  }
}
