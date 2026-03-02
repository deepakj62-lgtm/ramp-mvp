// lib/refresh-profiles.ts
// After any NL change is applied, this module re-runs AI on all touched entities
// so their profiles, insights, and stats always reflect the latest database state.

import { prisma } from './db';
import { chat } from './llm';

export interface RefreshInput {
  employeeIds?: string[];
  projectIds?: string[];
}

export interface RefreshResult {
  refreshed: string[];
  errors: string[];
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function refreshEntities(input: RefreshInput): Promise<RefreshResult> {
  const { employeeIds = [], projectIds = [] } = input;
  const refreshed: string[] = [];
  const errors: string[] = [];

  // Deduplicate and filter out any unresolved temp: IDs
  const empIds = [...new Set(employeeIds)].filter(id => id && !id.startsWith('temp:'));
  const projIds = [...new Set(projectIds)].filter(id => id && !id.startsWith('temp:'));

  // Run all refreshes in parallel
  await Promise.all([
    ...empIds.map(async (id) => {
      try {
        await refreshEmployeeProfile(id);
        refreshed.push(`employee:${id}`);
      } catch (err: any) {
        console.error(`[refresh] employee ${id} failed:`, err.message);
        errors.push(`employee ${id}: ${err.message}`);
      }
    }),
    ...projIds.map(async (id) => {
      try {
        await refreshProjectInsight(id);
        refreshed.push(`project:${id}`);
      } catch (err: any) {
        console.error(`[refresh] project ${id} failed:`, err.message);
        errors.push(`project ${id}: ${err.message}`);
      }
    }),
  ]);

  console.log(`[refresh] Done. Refreshed: ${refreshed.join(', ') || 'none'}. Errors: ${errors.length}`);
  return { refreshed, errors };
}

// ── Employee Profile Refresh ─────────────────────────────────────────────────

async function refreshEmployeeProfile(empId: string): Promise<void> {
  const employee = await prisma.employee.findUnique({
    where: { id: empId },
    include: {
      allocations: {
        include: {
          project: {
            select: { id: true, name: true, clientName: true, status: true, endDate: true },
          },
        },
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!employee || !employee.pageLayout) return;

  let layout: any;
  try {
    layout = JSON.parse(employee.pageLayout as string);
  } catch {
    return; // Malformed layout — skip
  }

  const today = new Date();
  const activeAllocs = employee.allocations.filter(a => new Date(a.endDate) >= today);
  const pastAllocs   = employee.allocations.filter(a => new Date(a.endDate) < today);
  const totalActivePct = activeAllocs.reduce((s, a) => s + a.allocationPercent, 0);
  const uniqueClients = [...new Set(activeAllocs.map(a => a.project.clientName))];

  // ── Recalculate dynamic primaryMetrics (no AI needed for numbers) ──────────
  if (Array.isArray(layout.primaryMetrics)) {
    layout.primaryMetrics = layout.primaryMetrics.map((m: any) => {
      const label = (m.label ?? '').toLowerCase();
      if (label.includes('current allocation') || label === 'allocation') {
        return { ...m, value: `${totalActivePct}%` };
      }
      if (label.includes('active project')) {
        return { ...m, value: String(activeAllocs.length) };
      }
      if (label.includes('active client') || label.includes('accounts managed')) {
        return { ...m, value: String(uniqueClients.length) };
      }
      if (label.includes('active engagement')) {
        return { ...m, value: String(activeAllocs.length) };
      }
      return m;
    });
  }

  // ── Build context for AI text refresh ─────────────────────────────────────
  const availabilityNote =
    totalActivePct === 0
      ? 'Fully available — no active assignments'
      : totalActivePct < 100
      ? `${100 - totalActivePct}% available`
      : '100% allocated';

  const activeLines = activeAllocs.length > 0
    ? activeAllocs.map(a =>
        `  - ${a.project.name} (client: ${a.project.clientName}): ${a.allocationPercent}% as ${a.roleOnProject}, ends ${new Date(a.endDate).toLocaleDateString()}`
      ).join('\n')
    : '  (No active assignments)';

  const recentPastLines = pastAllocs.slice(0, 3).map(a =>
    `  - ${a.project.name} (${a.project.clientName}): ${a.allocationPercent}% as ${a.roleOnProject}`
  ).join('\n');

  const contextStr = [
    `Employee: ${employee.name}`,
    `Title: ${employee.title}`,
    `Level: ${employee.level} | Practice: ${employee.practice}`,
    `Profile type: ${layout.profileType}`,
    `Current tagline: "${layout.tagline}"`,
    ``,
    `Active assignments (${activeAllocs.length}, total ${totalActivePct}%):`,
    activeLines,
    recentPastLines ? `Recent past:\n${recentPastLines}` : '',
    ``,
    `Clients currently served: ${uniqueClients.join(', ') || 'None'}`,
    `Availability: ${availabilityNote}`,
  ].filter(Boolean).join('\n');

  const response = await chat(
    [
      {
        role: 'system',
        content: `You are a profile writer for a consulting firm. Update employee profile text to reflect current assignments. Return ONLY a valid JSON object — no markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Update this consultant's profile text based on their current state.

${contextStr}

Return exactly this JSON (no markdown fences, no extra keys):
{
  "insight": "2-3 sentences: what they're doing now, key clients, and their primary value. Be specific about current projects.",
  "statusBanner": "Short phrase like '3 active engagements · 100% allocated' or '20% available · 2 active projects'"
}`,
      },
    ],
    { model: 'claude-haiku-4-5-20251001' }
  );

  // Parse and apply AI output
  let aiUpdates: { insight?: string; statusBanner?: string } = {};
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiUpdates = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // AI returned malformed JSON — still save the metric updates
  }

  if (aiUpdates.insight)       layout.insight = aiUpdates.insight;
  if (aiUpdates.statusBanner)  layout.statusBanner = aiUpdates.statusBanner;

  await prisma.employee.update({
    where: { id: empId },
    data: { pageLayout: JSON.stringify(layout) },
  });
}

// ── Project Insight Refresh ──────────────────────────────────────────────────

async function refreshProjectInsight(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      allocations: {
        include: {
          employee: { select: { name: true, title: true } },
        },
        orderBy: { allocationPercent: 'desc' },
      },
    },
  });

  if (!project) return;

  const today = new Date();
  const activeTeam = project.allocations.filter(a => new Date(a.endDate) >= today);

  const teamLines = activeTeam.slice(0, 8).map(a =>
    `  - ${a.employee.name} (${a.employee.title}): ${a.allocationPercent}% as ${a.roleOnProject}`
  ).join('\n');

  const response = await chat(
    [
      {
        role: 'system',
        content: `You are a project description writer for a consulting firm. Write concise, professional descriptions. Return ONLY a valid JSON object.`,
      },
      {
        role: 'user',
        content: `Update this project's description to reflect its current state.

Project: ${project.name}
Client: ${project.clientName}
Status: ${project.status}
Dates: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} – ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
Current description: "${project.description}"

Active team (${activeTeam.length} members):
${teamLines || '  (No active team members assigned)'}

Return exactly this JSON (no markdown fences):
{
  "description": "2-3 sentences covering what this project delivers, its current status, and the team's focus areas."
}`,
      },
    ],
    { model: 'claude-haiku-4-5-20251001' }
  );

  let aiUpdates: { description?: string } = {};
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiUpdates = JSON.parse(jsonMatch[0]);
    }
  } catch {
    return;
  }

  if (aiUpdates.description) {
    await prisma.project.update({
      where: { id: projectId },
      data: { description: aiUpdates.description },
    });
  }
}
