import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing or invalid Authorization header' } },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: { message: 'Invalid or expired authentication token' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'User account no longer exists' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        user,
      },
    });
  } catch (err: any) {
    console.error('Me route error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Authentication error' } },
      { status: 500 }
    );
  }
}
