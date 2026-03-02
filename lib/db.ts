import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// On Vercel (Lambda), /var/task is read-only. Copy the bundled SQLite to /tmp
// so all reads AND writes work. Data resets on each cold start (perfect for demos).
function ensureWritableDb() {
  if (process.env.NODE_ENV !== 'production') return;

  const tmpDb = '/tmp/ramp.db';
  if (!fs.existsSync(tmpDb)) {
    // The bundled db lives at prisma/db.sqlite (included via outputFileTracingIncludes)
    const bundledDb = path.join(process.cwd(), 'prisma', 'db.sqlite');
    try {
      if (fs.existsSync(bundledDb)) {
        fs.copyFileSync(bundledDb, tmpDb);
        console.log('[db] Copied bundled SQLite → /tmp/ramp.db');
      } else {
        console.warn('[db] Bundled db not found at:', bundledDb);
      }
    } catch (err) {
      console.error('[db] Failed to copy db to /tmp:', err);
    }
  }
}

ensureWritableDb();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
