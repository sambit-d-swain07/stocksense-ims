import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
