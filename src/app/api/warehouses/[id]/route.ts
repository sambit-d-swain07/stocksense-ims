import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const updateWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').optional(),
  shortCode: z.string().min(1, 'Short code is required').optional(),
  address: z.string().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: { locations: true },
    });

    if (!warehouse) {
      return NextResponse.json({ error: { message: 'Warehouse not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: warehouse });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, updateWarehouseSchema);
  if (!result.success) return result.response;

  try {
    const updated = await prisma.warehouse.update({
      where: { id: params.id },
      data: result.data,
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
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: { _count: { select: { locations: true } } },
    });

    if (!warehouse) {
      return NextResponse.json({ error: { message: 'Warehouse not found' } }, { status: 404 });
    }

    if (warehouse._count.locations > 0) {
      return NextResponse.json(
        { error: { message: 'Cannot delete warehouse with associated locations' } },
        { status: 400 }
      );
    }

    await prisma.warehouse.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { message: 'Warehouse deleted successfully' } });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
