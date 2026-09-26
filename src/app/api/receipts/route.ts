import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';
import { generateReceiptRef } from '@/lib/ref';

export const dynamic = 'force-dynamic';

const receiptItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

const createReceiptSchema = z.object({
  reference: z.string().optional(),
  supplierName: z.string().optional(),
  status: z.enum(['DRAFT', 'READY', 'DONE']).optional().default('DRAFT'),
  items: z.array(receiptItemSchema).optional().default([]),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const receipts = await prisma.receipt.findMany({
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
    });

    const data = receipts.map((receipt) => ({
      ...receipt,
      items: receipt.items.map((item) => ({
        ...item,
        productName: item.product?.name || '',
        locationName: item.location?.name || '',
        warehouseName: item.location?.warehouse?.name || '',
      })),
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/receipts error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch receipts' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createReceiptSchema);
  if (!result.success) return result.response;

  const { reference: inputRef, supplierName, status } = result.data;
  const items = result.data.items || [];

  try {
    // Validate products & locations existence
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

    const reference = await generateReceiptRef(inputRef);

    if (status === 'DONE') {
      const newReceipt = await prisma.receipt.create({
        data: {
          reference,
          supplierName: supplierName || null,
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
      });

      const stockOps: any[] = [];
      for (const item of items) {
        stockOps.push(
          prisma.stock.upsert({
            where: {
              productId_locationId: { productId: item.productId, locationId: item.locationId },
            },
            update: { onHand: { increment: item.quantity } },
            create: { productId: item.productId, locationId: item.locationId, onHand: item.quantity, reserved: 0 },
          })
        );
        stockOps.push(
          prisma.stockMove.create({
            data: {
              type: 'IN',
              reference: newReceipt.reference,
              productId: item.productId,
              locationId: item.locationId,
              quantity: item.quantity,
              notes: supplierName ? `Receipt from ${supplierName}` : 'Receipt DONE',
            },
          })
        );
      }

      if (stockOps.length > 0) {
        await withRetry(() => prisma.$transaction(stockOps));
      }

      return NextResponse.json({ data: newReceipt }, { status: 201 });
    } else {
      // DRAFT or READY: Create receipt without updating stock
      const receipt = await prisma.receipt.create({
        data: {
          reference,
          supplierName: supplierName || null,
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
      });

      return NextResponse.json({ data: receipt }, { status: 201 });
    }
  } catch (err: any) {
    console.error('POST /api/receipts error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create receipt' } },
      { status: 500 }
    );
  }
}
