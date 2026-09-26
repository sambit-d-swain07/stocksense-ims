import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get('locationId');
  const productId = searchParams.get('productId');
  const type = searchParams.get('type');
  const referenceNo = searchParams.get('referenceNo');

  const where: any = {};
  if (locationId) where.locationId = locationId;
  if (productId) where.productId = productId;
  if (type) where.type = type;
  if (referenceNo) where.referenceNo = { contains: referenceNo, mode: 'insensitive' };

  try {
    const ledger = await prisma.stockLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json(ledger);
  } catch (error) {
    console.error('Ledger GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
