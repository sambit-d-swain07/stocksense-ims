import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  shortCode: z.string().min(1, 'Short code is required'),
  address: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: warehouses });
  } catch (err: any) {
    console.error('GET /api/warehouses error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch warehouses' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createWarehouseSchema);
  if (!result.success) return result.response;

  const { name, shortCode, address } = result.data;

  try {
    const existing = await prisma.warehouse.findUnique({
      where: { shortCode },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: {
            message: 'Warehouse with this short code already exists',
            fields: { shortCode: 'Short code must be unique' },
          },
        },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        shortCode,
        address: address || null,
      },
    });

    return NextResponse.json({ data: warehouse }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/warehouses error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create warehouse' } },
      { status: 500 }
    );
  }
}
