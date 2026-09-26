import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { products: true },
    });

    if (!category) {
      return NextResponse.json({ error: { message: 'Category not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const result = await validateBody(req, updateCategorySchema);
  if (!result.success) return result.response;

  try {
    const updated = await prisma.category.update({
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
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: { message: 'Category not found' } }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: { message: 'Cannot delete category associated with existing products' } },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { message: 'Category deleted successfully' } });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
