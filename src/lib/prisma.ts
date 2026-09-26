import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isConnectionError =
        err?.code === 'P1001' ||
        err?.code === 'P1002' ||
        err?.code === 'P1017' ||
        err?.code === 'P2028' ||
        err?.message?.includes("Can't reach database server") ||
        err?.message?.includes('closed the connection') ||
        err?.message?.includes('ConnectionReset') ||
        err?.message?.includes('ETIMEDOUT') ||
        err?.message?.includes('ENOTFOUND') ||
        err?.message?.includes('expired transaction');
      if (attempt < retries && isConnectionError) {
        console.warn(`[Prisma] Connection error/reset detected (${err?.message || err?.code}). Retrying attempt ${attempt}/${retries}...`);
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
      throw err;
    }
  }
}
