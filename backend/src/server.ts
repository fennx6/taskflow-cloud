import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`[server] TaskFlow API berjalan di http://localhost:${env.port} (${env.nodeEnv})`);
});

/**
 * Penutupan rapi: penting untuk deployment Dokku, agar container tidak
 * memutus koneksi database secara mendadak saat restart.
 */
function shutdown(signal: string): void {
  console.log(`[server] Menerima ${signal}, menutup server...`);

  server.close(() => {
    void prisma.$disconnect().finally(() => {
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('[server] Penutupan melebihi batas waktu, keluar paksa');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
