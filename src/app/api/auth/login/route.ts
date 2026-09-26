import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { validateBody } from '@/lib/validate';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  const result = await validateBody(req, loginSchema);
  if (!result.success) {
    return result.response;
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Invalid email or password', fields: { email: 'User not found' } } },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: { message: 'Invalid email or password', fields: { password: 'Incorrect password' } } },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, email: user.email });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
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
