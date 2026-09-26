import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { validateBody } from '@/lib/validate';

const loginSchema = z
  .object({
    loginId: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => !!(data.loginId || data.email), {
    message: 'Please provide either loginId or email',
    path: ['loginId'],
  });

export async function POST(req: Request) {
  const result = await validateBody(req, loginSchema);
  if (!result.success) {
    return result.response;
  }

  const { loginId, email, password } = result.data;
  const identifier = loginId || email || '';

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { loginId: identifier },
          { email: identifier.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid credentials',
            fields: { loginId: 'User not found' },
          },
        },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid credentials',
            fields: { password: 'Incorrect password' },
          },
        },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      loginId: user.loginId,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      loginId: user.loginId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to authenticate user' } },
      { status: 500 }
    );
  }
}
