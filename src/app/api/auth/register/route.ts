import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { validateBody } from '@/lib/validate';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  const result = await validateBody(req, registerSchema);
  if (!result.success) {
    return result.response;
  }

  const { name, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { message: 'An account with this email already exists', fields: { email: 'Email is already taken' } } },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

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
