import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * Satu instance PrismaClient per proses. Saat `tsx watch` me-reload modul,
 * instance lama dipakai ulang lewat global agar koneksi tidak bocor.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
