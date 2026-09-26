import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  unit: z.string().min(1, 'Unit is required'),
  costPerUnit: z.number().min(0, 'Cost per unit must be 0 or greater').optional().default(0),
  reorderPoint: z.number().int().min(0, 'Reorder point must be 0 or greater').optional().default(0),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = products.map((prod) => ({
      ...prod,
      categoryName: prod.category?.name || '',
    }));

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/products error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch products' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createProductSchema);
  if (!result.success) return result.response;

  const { name, sku, categoryId, unit, costPerUnit, reorderPoint } = result.data;

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: {
            message: 'Category not found',
            fields: { categoryId: 'Specified category does not exist' },
          },
        },
        { status: 400 }
      );
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      return NextResponse.json(
        {
          error: {
            message: 'Product with this SKU already exists',
            fields: { sku: 'SKU must be unique' },
          },
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId,
        unit,
        costPerUnit: costPerUnit ?? 0,
        reorderPoint: reorderPoint ?? 0,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          ...product,
          categoryName: product.category?.name || '',
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/products error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create product' } },
      { status: 500 }
    );
  }
}
