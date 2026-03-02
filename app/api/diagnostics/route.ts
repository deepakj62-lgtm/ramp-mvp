// app/api/diagnostics/route.ts
// Self-healing health checks for the RAMP database.
// GET  /api/diagnostics — run all checks, return issues
// POST /api/diagnostics — run a specific check and optionally auto-fix

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiagnosticIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  autoFixable: boolean;
  fixDescription?: string;
  data?: Record<string, unknown>;
}

export interface DiagnosticReport {
  runAt: string;
  totalIssues: number;
  errors: number;
  warnings: number;
  infos: number;
  issues: DiagnosticIssue[];
  durationMs: number;
}

// ─── Check functions ──────────────────────────────────────────────────────────

async function checkOverAllocatedEmployees(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

  // Get all active allocations this month
  const allocations = await prisma.allocation.findMany({
    where: {
      startDate: { lte: today },
      endDate: { gte: today },
    },
    include: { employee: true },
  });

  // Sum by employee
  const byEmployee: Record<string, { name: string; total: number; ids: string[] }> = {};
  for (const a of allocations) {
    if (!byEmployee[a.employeeId]) {
      byEmployee[a.employeeId] = { name: a.employee.name, total: 0, ids: [] };
    }
    byEmployee[a.employeeId].total += a.allocationPercent;
    byEmployee[a.employeeId].ids.push(a.id);
  }

  for (const [empId, info] of Object.entries(byEmployee)) {
    if (info.total > 100) {
      issues.push({
        id: `over-alloc-${empId}`,
        severity: info.total >= 150 ? 'error' : 'warning',
        category: 'Over-allocation',
        message: `${info.name} is allocated at ${info.total}% this month (${info.ids.length} active assignments)`,
        entityType: 'employee',
        entityId: empId,
        entityName: info.name,
        autoFixable: false,
        fixDescription: 'Reduce one or more allocation percentages on the Allocations page',
        data: { totalPercent: info.total, allocationIds: info.ids },
      });
    }
  }

  return issues;
}

async function checkProjectsWithNoTeam(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const today = new Date();

  const activeProjects = await prisma.project.findMany({
    where: { status: { in: ['In Progress', 'Planning'] } },
    include: { _count: { select: { allocations: true } } },
  });

  for (const project of activeProjects) {
    if (project._count.allocations === 0) {
      issues.push({
        id: `no-team-${project.id}`,
        severity: project.status === 'In Progress' ? 'error' : 'warning',
        category: 'No Team',
        message: `Project "${project.name}" (${project.status}) has no allocations`,
        entityType: 'project',
        entityId: project.id,
        entityName: project.name,
        autoFixable: false,
        fixDescription: 'Add allocations from the project page or the Allocations page',
        data: { status: project.status },
      });
    }
  }

  return issues;
}

async function checkPastDueProjects(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const today = new Date();

  const projects = await prisma.project.findMany({
    where: {
      endDate: { lt: today },
      status: { in: ['In Progress', 'On Hold', 'Closing'] },
    },
  });

  for (const project of projects) {
    const daysOverdue = Math.floor(
      (today.getTime() - new Date(project.endDate!).getTime()) / (1000 * 60 * 60 * 24)
    );
    issues.push({
      id: `past-due-${project.id}`,
      severity: daysOverdue > 30 ? 'error' : 'warning',
      category: 'Past Due',
      message: `Project "${project.name}" passed its end date ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago and is still "${project.status}"`,
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      autoFixable: true,
      fixDescription: `Mark "${project.name}" as Completed or update its end date`,
      data: { endDate: project.endDate, daysOverdue, currentStatus: project.status },
    });
  }

  return issues;
}

async function checkProjectsMissingDates(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];

  const projects = await prisma.project.findMany({
    where: {
      status: { in: ['In Progress', 'Planning', 'On Hold'] },
      OR: [{ startDate: null }, { endDate: null }],
    },
  });

  for (const project of projects) {
    const missing = [
      !project.startDate && 'start date',
      !project.endDate && 'end date',
    ].filter(Boolean).join(' and ');

    issues.push({
      id: `missing-dates-${project.id}`,
      severity: 'warning',
      category: 'Missing Dates',
      message: `Project "${project.name}" is missing ${missing}`,
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      autoFixable: false,
      fixDescription: 'Set project dates from the project detail page',
      data: { missingFields: missing },
    });
  }

  return issues;
}

async function checkEmployeesMissingResume(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];

  const employees = await prisma.employee.findMany({
    where: {
      OR: [
        { resumeText: '' },
        { extractedSkills: '' },
        { extractedSkills: '[]' },
      ],
    },
  });

  for (const emp of employees) {
    issues.push({
      id: `no-resume-${emp.id}`,
      severity: 'info',
      category: 'Missing Resume',
      message: `${emp.name} has no resume or skills on file — search results may be less accurate`,
      entityType: 'employee',
      entityId: emp.id,
      entityName: emp.name,
      autoFixable: false,
      fixDescription: 'Upload a resume from the employee profile page',
      data: { hasResume: !!emp.resumeText, hasSkills: emp.extractedSkills !== '' && emp.extractedSkills !== '[]' },
    });
  }

  return issues;
}

async function checkProjectsNoEngagementManager(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];

  const projects = await prisma.project.findMany({
    where: {
      status: { in: ['In Progress', 'Planning'] },
      OR: [
        { engagementManager: '' },
        { accountExecutive: '' },
      ],
    },
  });

  for (const project of projects) {
    const missing = [
      !project.engagementManager && 'Engagement Manager',
      !project.accountExecutive && 'Account Executive',
    ].filter(Boolean);

    issues.push({
      id: `no-mgr-${project.id}`,
      severity: 'warning',
      category: 'Missing Leadership',
      message: `Project "${project.name}" is missing ${missing.join(' and ')}`,
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      autoFixable: false,
      fixDescription: 'Assign leadership roles from the project detail page',
      data: { missing },
    });
  }

  return issues;
}

// ─── Auto-fix: mark past-due projects as Completed ───────────────────────────

async function autoFixPastDueProject(issue: DiagnosticIssue): Promise<{ fixed: boolean; message: string }> {
  if (issue.entityType !== 'project' || !issue.entityId) {
    return { fixed: false, message: 'Not a project issue' };
  }

  try {
    const project = await prisma.project.update({
      where: { id: issue.entityId },
      data: { status: 'Completed' },
    });
    return { fixed: true, message: `Marked "${project.name}" as Completed` };
  } catch (err: any) {
    return { fixed: false, message: err.message };
  }
}

// ─── GET handler — run all checks ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const start = Date.now();

  try {
    const [overAlloc, noTeam, pastDue, missingDates, noResume, noMgr] = await Promise.all([
      checkOverAllocatedEmployees(),
      checkProjectsWithNoTeam(),
      checkPastDueProjects(),
      checkProjectsMissingDates(),
      checkEmployeesMissingResume(),
      checkProjectsNoEngagementManager(),
    ]);

    const allIssues = [...overAlloc, ...noTeam, ...pastDue, ...missingDates, ...noResume, ...noMgr];

    const report: DiagnosticReport = {
      runAt: new Date().toISOString(),
      totalIssues: allIssues.length,
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length,
      infos: allIssues.filter(i => i.severity === 'info').length,
      issues: allIssues.sort((a, b) => {
        const order = { error: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
      }),
      durationMs: Date.now() - start,
    };

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[diagnostics GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST handler — auto-fix a single issue ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { issueId, issueData } = await req.json() as { issueId: string; issueData: DiagnosticIssue };

    if (!issueData?.autoFixable) {
      return NextResponse.json({ fixed: false, message: 'Issue is not auto-fixable' }, { status: 400 });
    }

    let result: { fixed: boolean; message: string };

    if (issueData.category === 'Past Due') {
      result = await autoFixPastDueProject(issueData);
    } else {
      result = { fixed: false, message: 'No auto-fix handler for this category' };
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[diagnostics POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
