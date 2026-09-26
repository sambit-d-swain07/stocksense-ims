import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  costPerUnit: z.number().min(0, 'Cost per unit must be 0 or greater').optional(),
  reorderPoint: z.number().int().min(0, 'Reorder point must be 0 or greater').optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const productId = params.id;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        stocks: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                shortCode: true,
                warehouse: {
                  select: {
                    id: true,
                    name: true,
                    shortCode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: { message: 'Product not found' } },
        { status: 404 }
      );
    }

    const stocks = product.stocks.map((stock) => ({
      ...stock,
      locationName: stock.location?.name || '',
      warehouseName: stock.location?.warehouse?.name || '',
      freeToUse: stock.onHand - stock.reserved,
    }));

    const data = {
      ...product,
      categoryName: product.category?.name || '',
      stocks,
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('GET /api/products/[id] error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to fetch product details' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const productId = params.id;
  const result = await validateBody(req, updateProductSchema);
  if (!result.success) return result.response;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: { message: 'Product not found' } },
        { status: 404 }
      );
    }

    if (result.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: result.data.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: { message: 'Category not found', fields: { categoryId: 'Specified category does not exist' } } },
          { status: 400 }
        );
      }
    }

    if (result.data.sku && result.data.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: result.data.sku },
      });
      if (existingSku) {
        return NextResponse.json(
          { error: { message: 'Product with this SKU already exists', fields: { sku: 'SKU must be unique' } } },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: result.data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      data: {
        ...updatedProduct,
        categoryName: updatedProduct.category?.name || '',
      },
    });
  } catch (err: any) {
    console.error('PATCH /api/products/[id] error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to update product' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  return PATCH(req, context);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  const productId = params.id;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { stocks: true },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: { message: 'Product not found' } },
        { status: 404 }
      );
    }

    if (existingProduct._count.stocks > 0) {
      return NextResponse.json(
        { error: { message: 'Cannot delete product because it has associated stock records' } },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ data: { message: 'Product deleted successfully' } });
  } catch (err: any) {
    console.error('DELETE /api/products/[id] error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to delete product' } },
      { status: 500 }
    );
  }
}
