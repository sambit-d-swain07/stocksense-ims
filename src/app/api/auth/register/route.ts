import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma, withRetry } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { validateBody } from '@/lib/validate';

const registerSchema = z.object({
  name: z.string().optional(),
  loginId: z
    .string()
    .min(6, 'loginId must be between 6 and 12 characters')
    .max(12, 'loginId must be between 6 and 12 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['MANAGER', 'STAFF']).optional(),
});

export async function POST(req: Request) {
  const result = await validateBody(req, registerSchema);
  if (!result.success) {
    return result.response;
  }

  const { name, loginId, email, password, role } = result.data;

  try {
    const existingLoginId = await withRetry(() =>
      prisma.user.findUnique({
        where: { loginId },
      })
    );

    if (existingLoginId) {
      return NextResponse.json(
        {
          error: {
            message: 'A user with this loginId already exists',
            fields: { loginId: 'loginId is already in use' },
          },
        },
        { status: 400 }
      );
    }

    const existingEmail = await withRetry(() =>
      prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })
    );

    if (existingEmail) {
      return NextResponse.json(
        {
          error: {
            message: 'An account with this email already exists',
            fields: { email: 'Email is already taken' },
          },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await withRetry(() =>
      prisma.user.create({
        data: {
          loginId,
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name ? name.trim() : null,
          role: role || 'STAFF',
        },
        select: {
          id: true,
          loginId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      })
    );

    const token = signToken({
      userId: user.id,
      email: user.email,
      loginId: user.loginId,
      role: user.role,
    });

    return NextResponse.json(
      {
        data: {
          token,
          user,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to register user' } },
      { status: 500 }
    );
  }
}
