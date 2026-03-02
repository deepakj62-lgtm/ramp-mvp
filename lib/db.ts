import { PrismaClient } from '@prisma/client';

// In production: use Turso (persistent, serverless SQLite)
// In development: use local SQLite file via DATABASE_URL
function createPrismaClient() {
  if (process.env.NODE_ENV === 'production' && process.env.TURSO_DATABASE_URL) {
    // Turso connection for Vercel — persistent, survives cold starts
    const { PrismaLibSQL } = require('@prisma/adapter-libsql');
    const { createClient } = require('@libsql/client');

    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const adapter = new PrismaLibSQL(turso);
    return new PrismaClient({ adapter, log: ['error'] } as any);
  }

  // Local dev: plain SQLite
  return new PrismaClient({ log: ['error'] });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
