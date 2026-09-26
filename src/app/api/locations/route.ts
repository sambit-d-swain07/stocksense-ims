import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  shortCode: z.string().min(1, 'Short code is required'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const locations = await prisma.location.findMany({
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            shortCode: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = locations.map((loc) => ({
      ...loc,
      warehouseName: loc.warehouse?.name || '',
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/locations error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch locations' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createLocationSchema);
  if (!result.success) return result.response;

  const { name, shortCode, warehouseId } = result.data;

  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return NextResponse.json(
        {
          error: {
            message: 'Warehouse not found',
            fields: { warehouseId: 'Specified warehouse does not exist' },
          },
        },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        name,
        shortCode,
        warehouseId,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            shortCode: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          ...location,
          warehouseName: location.warehouse?.name || '',
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/locations error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create location' } },
      { status: 500 }
    );
  }
}
