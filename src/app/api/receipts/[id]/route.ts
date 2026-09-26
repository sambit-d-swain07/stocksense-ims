import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, withRetry } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const receiptItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

const updateReceiptSchema = z.object({
  reference: z.string().optional(),
  supplierName: z.string().optional(),
  status: z.enum(['DRAFT', 'READY', 'DONE']).optional(),
  items: z.array(receiptItemSchema).optional(),
});

async function getReceiptByIdOrRef(id: string) {
  return await withRetry(() =>
    prisma.receipt.findFirst({
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
    const receipt = await getReceiptByIdOrRef(params.id);
    if (!receipt) {
      return NextResponse.json({ error: { message: 'Receipt not found' } }, { status: 404 });
    }

    const data = {
      ...receipt,
      items: receipt.items.map((item) => ({
        ...item,
        productName: item.product?.name || '',
        locationName: item.location?.name || '',
        warehouseName: item.location?.warehouse?.name || '',
      })),
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error(`GET /api/receipts/${params.id} error:`, err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch receipt' } },
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

  const result = await validateBody(req, updateReceiptSchema);
  if (!result.success) return result.response;

  const { reference, supplierName, status, items } = result.data;

  try {
    const existing = await getReceiptByIdOrRef(id);
    if (!existing) {
      return NextResponse.json({ error: { message: 'Receipt not found' } }, { status: 404 });
    }

    // DUPLICATE DONE PROTECTION
    if (existing.status === 'DONE') {
      if (status && status !== 'DONE') {
        return NextResponse.json(
          { error: { message: 'Cannot change status of a completed receipt' } },
          { status: 400 }
        );
      }
      if (items && items.length > 0) {
        return NextResponse.json(
          { error: { message: 'Cannot modify items of a completed receipt' } },
          { status: 400 }
        );
      }
      const data = {
        ...existing,
        items: existing.items.map((item) => ({
          ...item,
          productName: item.product?.name || '',
          locationName: item.location?.name || '',
          warehouseName: item.location?.warehouse?.name || '',
        })),
      };
      return NextResponse.json({ data });
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
    const finalSupplier = supplierName !== undefined ? supplierName : existing.supplierName;

    if (targetStatus === 'DONE') {
      const ops: any[] = [];

      if (items) {
        ops.push(prisma.receiptItem.deleteMany({ where: { receiptId: existing.id } }));
        ops.push(
          prisma.receiptItem.createMany({
            data: items.map((i) => ({
              receiptId: existing.id,
              productId: i.productId,
              locationId: i.locationId,
              quantity: i.quantity,
            })),
          })
        );
      }

      ops.push(
        prisma.receipt.update({
          where: { id: existing.id },
          data: {
            reference: finalRef,
            supplierName: finalSupplier,
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
          prisma.stock.upsert({
            where: {
              productId_locationId: { productId: item.productId, locationId: item.locationId },
            },
            update: { onHand: { increment: item.quantity } },
            create: { productId: item.productId, locationId: item.locationId, onHand: item.quantity, reserved: 0 },
          })
        );

        ops.push(
          prisma.stockMove.create({
            data: {
              type: 'IN',
              reference: finalRef,
              productId: item.productId,
              locationId: item.locationId,
              quantity: item.quantity,
              notes: finalSupplier ? `Receipt from ${finalSupplier}` : 'Receipt DONE',
            },
          })
        );
      }

      const results = await withRetry(() => prisma.$transaction(ops));
      const updatedReceipt =
        results.find((res: any) => res && res.reference && res.status === 'DONE') ||
        (await getReceiptByIdOrRef(existing.id));

      return NextResponse.json({ data: updatedReceipt });
    } else {
      // Update DRAFT or READY receipt without touching stock
      const ops: any[] = [];
      if (items) {
        ops.push(prisma.receiptItem.deleteMany({ where: { receiptId: existing.id } }));
        ops.push(
          prisma.receiptItem.createMany({
            data: items.map((i) => ({
              receiptId: existing.id,
              productId: i.productId,
              locationId: i.locationId,
              quantity: i.quantity,
            })),
          })
        );
      }

      ops.push(
        prisma.receipt.update({
          where: { id: existing.id },
          data: {
            reference: finalRef,
            supplierName: finalSupplier,
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
      const updatedReceipt =
        results.find((res: any) => res && res.reference) || (await getReceiptByIdOrRef(existing.id));

      return NextResponse.json({ data: updatedReceipt });
    }
  } catch (err: any) {
    console.error(`PUT/PATCH /api/receipts/${id} error:`, err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to update receipt' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const existing = await getReceiptByIdOrRef(params.id);
    if (!existing) {
      return NextResponse.json({ error: { message: 'Receipt not found' } }, { status: 404 });
    }

    if (existing.status === 'DONE') {
      return NextResponse.json(
        { error: { message: 'Cannot delete a completed receipt' } },
        { status: 400 }
      );
    }

    await prisma.receipt.delete({ where: { id: existing.id } });

    return NextResponse.json({ data: { message: 'Receipt deleted successfully' } });
  } catch (err: any) {
    console.error(`DELETE /api/receipts/${params.id} error:`, err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to delete receipt' } },
      { status: 500 }
    );
  }
}
