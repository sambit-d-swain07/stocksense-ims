import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/validate';
import { storeOtp, sendOtpEmail } from '@/lib/otp';

export const dynamic = 'force-dynamic';

const forgotPasswordSchema = z.object({
  loginIdOrEmail: z.string().min(1, 'Login ID or Email is required'),
});

export async function POST(req: Request) {
  const result = await validateBody(req, forgotPasswordSchema);
  if (!result.success) return result.response;

  const { loginIdOrEmail } = result.data;
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
        { error: { message: 'User with this Login ID or Email was not found' } },
        { status: 404 }
      );
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storeOtp(user.email, otp);
    storeOtp(user.loginId, otp);

    const emailStatus = await sendOtpEmail(user.email, otp);

    return NextResponse.json({
      data: {
        message: 'OTP has been generated and sent to your registered email address.',
        email: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length)),
        otpDeliveryInfo: emailStatus.sent ? 'Sent via email' : emailStatus.reason,
      },
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { error: { message: err.message || 'Failed to process forgot password request' } },
      { status: 500 }
    );
  }
}
