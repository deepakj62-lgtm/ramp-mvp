// Migration script: copies all data from local SQLite → Turso
import { createClient } from '@libsql/client';
import { PrismaClient as LocalPrisma } from '@prisma/client';

const TURSO_URL = 'libsql://ramp-mvp-deepakj62.aws-us-east-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

async function main() {
  console.log('Connecting to local SQLite...');
  const local = new LocalPrisma({
    log: ['error'],
    datasources: { db: { url: process.env.DATABASE_URL! } },
  } as any);

  console.log('Connecting to Turso...');
  const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // 1. Drop existing tables (clean slate)
  console.log('Dropping existing tables...');
  const dropSQL = [
    'DROP TABLE IF EXISTS "FeedbackTicket"',
    'DROP TABLE IF EXISTS "ChangeLog"',
    'DROP TABLE IF EXISTS "Allocation"',
    'DROP TABLE IF EXISTS "ClientNote"',
    'DROP TABLE IF EXISTS "Project"',
    'DROP TABLE IF EXISTS "Employee"',
    'DROP TABLE IF EXISTS "Client"',
    'DROP TABLE IF EXISTS "_prisma_migrations"',
  ];
  for (const stmt of dropSQL) {
    await turso.execute(stmt);
  }
  console.log('Tables dropped ✓');

  // 2. Create schema in Turso — exactly matching prisma/schema.prisma
  console.log('Creating schema in Turso...');

  await turso.execute(`
    CREATE TABLE "Employee" (
      "id"              TEXT NOT NULL PRIMARY KEY,
      "name"            TEXT NOT NULL,
      "rampName"        TEXT NOT NULL,
      "email"           TEXT NOT NULL,
      "companyGroup"    TEXT NOT NULL,
      "businessUnit"    TEXT NOT NULL,
      "careerPath"      TEXT NOT NULL,
      "roleFamily"      TEXT NOT NULL,
      "practice"        TEXT NOT NULL,
      "level"           TEXT NOT NULL,
      "title"           TEXT NOT NULL,
      "location"        TEXT NOT NULL,
      "resumeText"      TEXT NOT NULL DEFAULT '',
      "extractedSkills" TEXT NOT NULL DEFAULT '[]',
      "pageLayout"      TEXT NOT NULL DEFAULT '{}',
      "reportsTo"       TEXT,
      "createdAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE "Project" (
      "id"                TEXT NOT NULL PRIMARY KEY,
      "rampProjectCode"   TEXT NOT NULL,
      "name"              TEXT NOT NULL,
      "clientId"          TEXT NOT NULL,
      "clientName"        TEXT NOT NULL,
      "accountExecutive"  TEXT NOT NULL,
      "engagementManager" TEXT NOT NULL,
      "engagementClass"   TEXT NOT NULL,
      "industryTag"       TEXT,
      "scopeCategories"   TEXT,
      "status"            TEXT NOT NULL DEFAULT 'In Progress',
      "description"       TEXT NOT NULL DEFAULT '',
      "startDate"         DATETIME,
      "endDate"           DATETIME,
      "currentPhase"      TEXT NOT NULL DEFAULT '',
      "milestones"        TEXT NOT NULL DEFAULT '[]',
      "pageLayout"        TEXT NOT NULL DEFAULT '{}',
      "createdAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE "Allocation" (
      "id"                TEXT NOT NULL PRIMARY KEY,
      "assignmentCode"    TEXT NOT NULL,
      "assignmentDetail"  TEXT NOT NULL,
      "employeeId"        TEXT NOT NULL,
      "projectId"         TEXT NOT NULL,
      "roleOnProject"     TEXT NOT NULL,
      "startDate"         DATETIME NOT NULL,
      "endDate"           DATETIME NOT NULL,
      "allocationPercent" INTEGER NOT NULL,
      "createdAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE "ClientNote" (
      "id"         TEXT NOT NULL PRIMARY KEY,
      "clientId"   TEXT NOT NULL UNIQUE,
      "clientName" TEXT NOT NULL,
      "pageLayout" TEXT NOT NULL DEFAULT '{}',
      "notes"      TEXT NOT NULL DEFAULT '',
      "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE "ChangeLog" (
      "id"          TEXT NOT NULL PRIMARY KEY,
      "command"     TEXT NOT NULL,
      "actionPlan"  TEXT NOT NULL,
      "executed"    INTEGER NOT NULL DEFAULT 0,
      "executedAt"  DATETIME,
      "docText"     TEXT NOT NULL DEFAULT '',
      "docFileName" TEXT NOT NULL DEFAULT '',
      "summary"     TEXT NOT NULL DEFAULT '',
      "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE "FeedbackTicket" (
      "id"                   TEXT NOT NULL PRIMARY KEY,
      "type"                 TEXT NOT NULL,
      "status"               TEXT NOT NULL DEFAULT 'new',
      "title"                TEXT NOT NULL,
      "rawText"              TEXT NOT NULL,
      "chatTranscript"       TEXT NOT NULL DEFAULT '',
      "structuredJson"       TEXT NOT NULL DEFAULT '{}',
      "pageContext"          TEXT,
      "createdBy"            TEXT,
      "complexity"           TEXT NOT NULL DEFAULT 'large',
      "autoApproved"         INTEGER NOT NULL DEFAULT 0,
      "implementationPlan"   TEXT NOT NULL DEFAULT '',
      "implementationResult" TEXT NOT NULL DEFAULT '',
      "notifyEmail"          TEXT NOT NULL DEFAULT '',
      "errorMessage"         TEXT NOT NULL DEFAULT '',
      "createdAt"            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE "_prisma_migrations" (
      "id"                  TEXT NOT NULL PRIMARY KEY,
      "checksum"            TEXT NOT NULL,
      "finished_at"         DATETIME,
      "migration_name"      TEXT NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      DATETIME,
      "started_at"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);

  console.log('Schema created ✓');

  // Helper: batch insert
  async function insertBatch(table: string, rows: any[], batchSize = 30) {
    if (rows.length === 0) { console.log(`  ${table}: 0 rows`); return; }
    const cols = Object.keys(rows[0]);
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const tx = batch.map(row => ({
        sql: `INSERT OR REPLACE INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
        args: cols.map(c => {
          const v = row[c];
          if (v === null || v === undefined) return null;
          if (typeof v === 'boolean') return v ? 1 : 0;
          if (v instanceof Date) return v.getTime();
          if (typeof v === 'object') return JSON.stringify(v);
          return v;
        }),
      }));
      await turso.batch(tx);
      inserted += batch.length;
    }
    console.log(`  ${table}: ${inserted} rows ✓`);
  }

  // 3. Copy data
  console.log('Copying data...');

  const employees = await local.employee.findMany();
  console.log(`  Found ${employees.length} employees in local DB`);
  await insertBatch('Employee', employees);

  const projects = await local.project.findMany();
  console.log(`  Found ${projects.length} projects in local DB`);
  await insertBatch('Project', projects);

  const allocations = await local.allocation.findMany();
  console.log(`  Found ${allocations.length} allocations in local DB`);
  await insertBatch('Allocation', allocations);

  const clientNotes = await local.clientNote.findMany();
  console.log(`  Found ${clientNotes.length} client notes in local DB`);
  await insertBatch('ClientNote', clientNotes);

  const changeLogs = await local.changeLog.findMany();
  console.log(`  Found ${changeLogs.length} change logs in local DB`);
  await insertBatch('ChangeLog', changeLogs);

  const tickets = await local.feedbackTicket.findMany();
  console.log(`  Found ${tickets.length} feedback tickets in local DB`);
  await insertBatch('FeedbackTicket', tickets);

  await local.$disconnect();
  console.log('\nMigration complete! ✅');
}

main().catch(e => { console.error(e); process.exit(1); });
