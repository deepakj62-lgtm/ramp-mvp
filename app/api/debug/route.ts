import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const cwd = process.cwd();
  const dirname = __dirname;
  const dbUrl = process.env.DATABASE_URL || 'not set';

  const checkPaths = [
    path.join(cwd, 'db.sqlite'),
    path.join(cwd, 'prisma/db.sqlite'),
    path.join(dirname, 'db.sqlite'),
    path.join(dirname, '../prisma/db.sqlite'),
    '/var/task/prisma/db.sqlite',
    '/var/task/db.sqlite',
  ];

  const fileChecks: Record<string, boolean> = {};
  for (const p of checkPaths) {
    try { fileChecks[p] = fs.existsSync(p); } catch { fileChecks[p] = false; }
  }

  let prismaDir: string[] = [];
  try { prismaDir = fs.readdirSync(path.join(cwd, 'prisma')); } catch { prismaDir = ['error reading']; }

  return NextResponse.json({ cwd, dirname, dbUrl, fileChecks, prismaDir });
}
