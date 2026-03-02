// app/api/nl-execute/route.ts
// Executes an approved NL action plan against the database and saves a ChangeLog entry.
// After changes are applied, triggers a background AI refresh on all touched entities
// so their profiles, insights, and stats stay in sync with the new data.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { refreshEntities } from '@/lib/refresh-profiles';

interface Action {
  type: string;
  [key: string]: any;
}

interface ActionPlan {
  summary: string;
  actions: Action[];
  missingInfo: string[];
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const {
      actionPlan,
      command,
      docText = '',
      docFileName = '',
    } = await request.json() as {
      actionPlan: ActionPlan;
      command: string;
      docText?: string;
      docFileName?: string;
    };

    const changes: string[] = [];
    const errors: string[] = [];

    // Maps tempId → real DB ID for newly created entities
    const tempIdMap: Record<string, string> = {};
    const resolveId = (id: string): string => {
      if (id?.startsWith('temp:')) return tempIdMap[id.slice(5)] || id;
      return id;
    };

    // Track all entities touched by this execution for post-change AI refresh
    const affectedEmployeeIds = new Set<string>();
    const affectedProjectIds  = new Set<string>();

    for (const action of actionPlan.actions) {
      try {
        switch (action.type) {

          // ── Allocation updates ──────────────────────────────────────
          case 'UPDATE_ALLOCATION': {
            const updates: Record<string, any> = {};
            if (action.changes.allocationPercent !== undefined)
              updates.allocationPercent = Number(action.changes.allocationPercent);
            if (action.changes.roleOnProject)
              updates.roleOnProject = action.changes.roleOnProject;
            if (action.changes.startDate)
              updates.startDate = new Date(action.changes.startDate);
            if (action.changes.endDate)
              updates.endDate = new Date(action.changes.endDate);
            await prisma.allocation.update({ where: { id: action.allocationId }, data: updates });
            // Look up which employee + project this allocation belongs to
            const updatedAlloc = await prisma.allocation.findUnique({
              where: { id: action.allocationId },
              select: { employeeId: true, projectId: true },
            });
            if (updatedAlloc) {
              affectedEmployeeIds.add(updatedAlloc.employeeId);
              affectedProjectIds.add(updatedAlloc.projectId);
            }
            changes.push(`Updated allocation: ${action.reason || JSON.stringify(action.changes)}`);
            break;
          }

          // ── Client creation ─────────────────────────────────────────
          case 'CREATE_CLIENT': {
            await prisma.clientNote.upsert({
              where: { clientId: action.clientId },
              update: { clientName: action.clientName },
              create: { clientId: action.clientId, clientName: action.clientName },
            });
            changes.push(`Created/updated client: ${action.clientName}`);
            break;
          }

          // ── Project creation ────────────────────────────────────────
          case 'CREATE_PROJECT': {
            const newProj = await prisma.project.create({
              data: {
                rampProjectCode: `PRJ-${Date.now().toString().slice(-6)}`,
                name: action.name,
                clientId: action.clientId,
                clientName: action.clientName,
                accountExecutive: 'TBD',
                engagementManager: 'TBD',
                engagementClass: 'Client',
                status: action.status || 'In Progress',
                description: action.description || '',
                startDate: action.startDate ? new Date(action.startDate) : new Date(),
                endDate: action.endDate
                  ? new Date(action.endDate)
                  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
            });
            if (action.tempId) tempIdMap[action.tempId] = newProj.id;
            affectedProjectIds.add(newProj.id);
            changes.push(`Created project: "${action.name}" for ${action.clientName}`);
            break;
          }

          // ── Employee creation ───────────────────────────────────────
          case 'CREATE_EMPLOYEE': {
            const nameParts = (action.name as string).trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || firstName;
            const newEmp = await prisma.employee.create({
              data: {
                name: action.name,
                rampName: `${lastName}, ${firstName}`,
                email:
                  action.email ||
                  `${firstName.toLowerCase()}.${lastName.toLowerCase()}@linea.com`,
                companyGroup: action.companyGroup || 'Linea Solutions',
                businessUnit: action.businessUnit || 'Delivery',
                careerPath: action.careerPath || 'Consultant',
                roleFamily: action.roleFamily || 'BA',
                practice: action.practice || 'CrossPractice',
                level: action.level || 'Consultant',
                title: action.title || 'Consultant',
                location: action.location || 'US',
                resumeText:
                  action.resumeText ||
                  `${action.name} — ${action.title || 'Consultant'} at Linea Solutions. ${action.reason || ''}`,
                extractedSkills: action.extractedSkills || '[]',
              },
            });
            if (action.tempId) tempIdMap[action.tempId] = newEmp.id;
            affectedEmployeeIds.add(newEmp.id);
            changes.push(`Created employee: ${action.name}`);
            break;
          }

          // ── Allocation creation ─────────────────────────────────────
          case 'CREATE_ALLOCATION': {
            const empId = resolveId(action.employeeId);
            const projId = resolveId(action.projectId);
            const startDate = action.startDate
              ? new Date(action.startDate)
              : new Date();
            const endDate = action.endDate
              ? new Date(action.endDate)
              : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

            await prisma.allocation.create({
              data: {
                assignmentCode: `AS-${Date.now().toString().slice(-5)}`,
                assignmentDetail: `${action.employeeDisplayName || empId}-${action.projectDisplayName || projId} (${startDate.toLocaleDateString()}-${endDate.toLocaleDateString()})`,
                employeeId: empId,
                projectId: projId,
                allocationPercent: Number(action.allocationPercent),
                roleOnProject: action.roleOnProject || 'Consultant',
                startDate,
                endDate,
              },
            });
            affectedEmployeeIds.add(empId);
            affectedProjectIds.add(projId);
            changes.push(
              `Created allocation: ${action.employeeDisplayName} → ${action.projectDisplayName} at ${action.allocationPercent}%`
            );
            break;
          }

          // ── Employee updates ────────────────────────────────────────
          case 'UPDATE_EMPLOYEE': {
            await prisma.employee.update({
              where: { id: action.employeeId },
              data: action.changes,
            });
            affectedEmployeeIds.add(action.employeeId);
            changes.push(`Updated employee: ${action.reason || JSON.stringify(action.changes)}`);
            break;
          }

          // ── Project updates ─────────────────────────────────────────
          case 'UPDATE_PROJECT': {
            await prisma.project.update({
              where: { id: action.projectId },
              data: action.changes,
            });
            affectedProjectIds.add(action.projectId);
            changes.push(`Updated project: ${action.reason || JSON.stringify(action.changes)}`);
            break;
          }

          default:
            errors.push(`Unknown action type: ${action.type}`);
        }
      } catch (err: any) {
        errors.push(`Failed ${action.type}: ${err.message}`);
      }
    }

    const summary =
      changes.length > 0
        ? `${changes.length} change(s) applied: ${changes.join('; ')}`
        : errors.length > 0
        ? `All actions failed: ${errors.join('; ')}`
        : 'No changes were made.';

    // Save ChangeLog entry
    const log = await prisma.changeLog.create({
      data: {
        command,
        actionPlan: JSON.stringify(actionPlan),
        executed: errors.length === 0 && changes.length > 0,
        executedAt: new Date(),
        docText,
        docFileName,
        summary,
      },
    });

    // ── Background AI refresh of all touched entities ──────────────────────
    // Fire without awaiting — the client gets its response immediately,
    // and profile pages re-render with fresh AI text on the next visit.
    const empIds  = [...affectedEmployeeIds].filter(id => !id.startsWith('temp:'));
    const projIds = [...affectedProjectIds].filter(id => !id.startsWith('temp:'));
    const willRefresh = changes.length > 0 && (empIds.length > 0 || projIds.length > 0);

    if (willRefresh) {
      refreshEntities({ employeeIds: empIds, projectIds: projIds })
        .catch(err => console.error('[nl-execute] Background refresh error:', err));
    }

    return NextResponse.json({
      success: errors.length === 0,
      changes,
      errors,
      summary,
      changeLogId: log.id,
      // Tells the UI which entities are being refreshed in the background
      refreshing: willRefresh
        ? { employeeIds: empIds, projectIds: projIds }
        : null,
    });
  } catch (error: any) {
    console.error('NL execute error:', error);
    return NextResponse.json({ error: 'Internal error', detail: error.message }, { status: 500 });
  }
}
