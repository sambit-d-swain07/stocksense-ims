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

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 300): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isConnectionError =
        err?.code === 'P1017' ||
        err?.code === 'P2028' ||
        err?.message?.includes('closed the connection') ||
        err?.message?.includes('ConnectionReset') ||
        err?.message?.includes('expired transaction');
      if (attempt < retries && isConnectionError) {
        console.warn(`[Prisma] Connection reset detected. Retrying attempt ${attempt}/${retries}...`);
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
      throw err;
    }
  }
}
