import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const updateLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').optional(),
  shortCode: z.string().min(1, 'Short code is required').optional(),
  warehouseId: z.string().min(1, 'Warehouse ID is required').optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: { warehouse: true },
    });

    if (!location) {
      return NextResponse.json({ error: { message: 'Location not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: location });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, updateLocationSchema);
  if (!result.success) return result.response;

  try {
    const updated = await prisma.location.update({
      where: { id: params.id },
      data: result.data,
      include: { warehouse: true },
    });
    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  return PATCH(req, context);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { stocks: true, receiptItems: true, deliveryItems: true },
        },
      },
    });

    if (!location) {
      return NextResponse.json({ error: { message: 'Location not found' } }, { status: 404 });
    }

    const hasDeps = location._count.stocks > 0 || location._count.receiptItems > 0 || location._count.deliveryItems > 0;
    if (hasDeps) {
      return NextResponse.json(
        { error: { message: 'Cannot delete location with existing stock or operation records' } },
        { status: 400 }
      );
    }

    await prisma.location.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { message: 'Location deleted successfully' } });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
