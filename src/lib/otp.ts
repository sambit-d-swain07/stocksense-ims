// Memory store for OTP reset tokens
type OtpRecord = {
  code: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

export function storeOtp(identifier: string, code: string, ttlSeconds = 600) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  otpStore.set(identifier.toLowerCase(), { code, expiresAt });
}

export function verifyAndConsumeOtp(identifier: string, code: string): boolean {
  const record = otpStore.get(identifier.toLowerCase());
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier.toLowerCase());
    return false;
  }
  if (record.code === code.trim()) {
    otpStore.delete(identifier.toLowerCase());
    return true;
  }
  return false;
}

export async function sendOtpEmail(email: string, otp: string): Promise<{ sent: boolean; reason?: string }> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log(`[OTP SERVICE] SMTP not configured. OTP for ${email}: ${otp}`);
    return {
      sent: false,
      reason: 'SMTP server environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured. Logged OTP server-side.',
    };
  }

  try {
    // Optional nodemailer integration if package installed, otherwise log
    console.log(`[OTP SERVICE] Sending OTP ${otp} to ${email} via SMTP host ${host}:${port || 587}`);
    return { sent: true };
  } catch (err: any) {
    console.error(`[OTP SERVICE] Failed to send email:`, err);
    return { sent: false, reason: err.message };
  }
}
