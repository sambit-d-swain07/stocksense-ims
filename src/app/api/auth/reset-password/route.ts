import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/validate';
import { verifyAndConsumeOtp } from '@/lib/otp';

export const dynamic = 'force-dynamic';

const resetPasswordSchema = z.object({
  loginIdOrEmail: z.string().min(1, 'Login ID or Email is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export async function POST(req: Request) {
  const result = await validateBody(req, resetPasswordSchema);
  if (!result.success) return result.response;

  const { loginIdOrEmail, otp, newPassword } = result.data;
  const identifier = loginIdOrEmail.trim();

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
        { error: { message: 'User account not found' } },
        { status: 404 }
      );
    }

    const isOtpValid = verifyAndConsumeOtp(user.email, otp) || verifyAndConsumeOtp(user.loginId, otp);

    if (!isOtpValid) {
      return NextResponse.json(
        { error: { message: 'Invalid or expired OTP' } },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      data: { message: 'Password updated successfully. You can now login with your new password.' },
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to reset password' } },
      { status: 500 }
    );
  }
}
