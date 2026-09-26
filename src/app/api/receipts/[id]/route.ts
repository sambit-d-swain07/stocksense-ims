import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.id },
      include: {
        lines: {
          include: {
            product: { select: { name: true, sku: true, unit: true } }
          }
        },
        warehouse: { select: { name: true, shortCode: true } },
        location: { select: { name: true, shortCode: true } },
        createdBy: { select: { name: true } },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Receipt GET [id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
