import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

export async function GET(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: categories });
  } catch (err: any) {
    console.error('GET /api/categories error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch categories' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, createCategorySchema);
  if (!result.success) return result.response;

  const { name } = result.data;

  try {
    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/categories error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to create category' } },
      { status: 500 }
    );
  }
}
