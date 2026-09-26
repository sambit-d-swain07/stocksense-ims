import { prisma } from './prisma';

export async function generateReceiptRef(providedRef?: string): Promise<string> {
  if (providedRef && providedRef.trim() !== '') {
    return providedRef.trim();
  }
  const count = await prisma.receipt.count();
  let num = count + 1;
  let ref = `WH/IN/${String(num).padStart(4, '0')}`;
  while (await prisma.receipt.findUnique({ where: { reference: ref } })) {
    num++;
    ref = `WH/IN/${String(num).padStart(4, '0')}`;
  }
  return ref;
}

export async function generateDeliveryRef(providedRef?: string): Promise<string> {
  if (providedRef && providedRef.trim() !== '') {
    return providedRef.trim();
  }
  const count = await prisma.delivery.count();
  let num = count + 1;
  let ref = `WH/OUT/${String(num).padStart(4, '0')}`;
  while (await prisma.delivery.findUnique({ where: { reference: ref } })) {
    num++;
    ref = `WH/OUT/${String(num).padStart(4, '0')}`;
  }
  return ref;
}

export async function generateAdjustmentRef(providedRef?: string): Promise<string> {
  if (providedRef && providedRef.trim() !== '') {
    return providedRef.trim();
  }
  const count = await prisma.adjustment.count();
  let num = count + 1;
  let ref = `INV/ADJ/${String(num).padStart(4, '0')}`;
  while (await prisma.adjustment.findUnique({ where: { reference: ref } })) {
    num++;
    ref = `INV/ADJ/${String(num).padStart(4, '0')}`;
  }
  return ref;
}

export async function generateTransferRef(providedRef?: string): Promise<string> {
  if (providedRef && providedRef.trim() !== '') {
    return providedRef.trim();
  }
  const count = await prisma.stockMove.count({ where: { reference: { startsWith: 'WH/INT/' } } });
  let num = Math.floor(count / 2) + 1;
  let ref = `WH/INT/${String(num).padStart(4, '0')}`;
  while (await prisma.stockMove.findFirst({ where: { reference: ref } })) {
    num++;
    ref = `WH/INT/${String(num).padStart(4, '0')}`;
  }
  return ref;
}

