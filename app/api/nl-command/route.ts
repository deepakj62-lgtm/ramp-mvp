// app/api/nl-command/route.ts
// Interprets a natural language data-management command into a structured JSON action plan.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { chat } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { command, docText } = await request.json();
    if (!command?.trim()) {
      return NextResponse.json({ error: 'No command provided' }, { status: 400 });
    }

    // ── Load full DB context ──────────────────────────────────────────
    const [employees, projects, allocations, clientNotes] = await Promise.all([
      prisma.employee.findMany({
        select: { id: true, name: true, title: true, rampName: true, level: true, practice: true },
      }),
      prisma.project.findMany({
        select: { id: true, name: true, clientId: true, clientName: true, status: true, rampProjectCode: true },
      }),
      prisma.allocation.findMany({
        include: {
          employee: { select: { name: true } },
          project: { select: { name: true, clientName: true } },
        },
      }),
      prisma.clientNote.findMany({ select: { clientId: true, clientName: true } }),
    ]);

    // Build unique clients list from projects + clientNotes
    const clientMap = new Map<string, string>();
    projects.forEach(p => clientMap.set(p.clientId, p.clientName));
    clientNotes.forEach(c => clientMap.set(c.clientId, c.clientName));
    const clients = Array.from(clientMap.entries()).map(([id, name]) => ({ id, name }));

    // ── Context summary ───────────────────────────────────────────────
    const empLines = employees.map(e =>
      `ID:${e.id} | Name:${e.name} | Title:${e.title} | Level:${e.level}`
    ).join('\n');

    const projLines = projects.map(p =>
      `ID:${p.id} | Code:${p.rampProjectCode} | Name:${p.name} | Client:${p.clientName}(clientId:${p.clientId}) | Status:${p.status}`
    ).join('\n');

    const clientLines = clients.map(c =>
      `ClientID:${c.id} | Name:${c.name}`
    ).join('\n');

    const allocLines = allocations.map(a =>
      `ID:${a.id} | Employee:${a.employee.name}(empId:${a.employeeId}) | Project:${a.project.name}(projId:${a.projectId}) | Client:${a.project.clientName} | ${a.allocationPercent}% | ${a.startDate.toISOString().slice(0, 10)} to ${a.endDate.toISOString().slice(0, 10)} | Role:${a.roleOnProject}`
    ).join('\n');

    const contextBlock = [
      '=== EMPLOYEES ===', empLines, '',
      '=== PROJECTS ===', projLines, '',
      '=== CLIENTS ===', clientLines, '',
      '=== CURRENT ALLOCATIONS ===', allocLines,
    ].join('\n');

    const systemPrompt = `You are RAMP's intelligent data management assistant. You interpret natural language commands about employee allocations, projects, clients, and organizational data, then produce a structured JSON action plan.

RULES:
1. Fuzzy-match entity names (e.g., "Nate" → find employee whose name contains "Nate", "CalSTRS" → find client/project matching "CalSTRS")
2. For entities that EXIST: use UPDATE_ actions with the exact IDs from the database
3. For entities that DON'T EXIST: use CREATE_ actions and fill all required fields with sensible defaults
4. For CREATE_ALLOCATION referencing a newly created project/employee, use the tempId prefixed with "temp:" e.g. "projectId":"temp:new_proj_1"
5. Always include a reason field explaining each change
6. Return ONLY valid JSON — no markdown fences, no explanation

REQUIRED JSON FORMAT:
{
  "summary": "One-sentence description of all changes",
  "actions": [
    { "type": "UPDATE_ALLOCATION", "allocationId": "<id>", "changes": { "allocationPercent": 80 }, "reason": "..." },
    { "type": "CREATE_ALLOCATION", "employeeId": "<id>", "employeeDisplayName": "...", "projectId": "<id or temp:xxx>", "projectDisplayName": "...", "allocationPercent": 20, "roleOnProject": "BA", "startDate": "2025-01-01", "endDate": "2025-12-31", "reason": "..." },
    { "type": "CREATE_CLIENT", "clientId": "<lowercase-slug>", "clientName": "..." },
    { "type": "CREATE_PROJECT", "tempId": "new_proj_1", "name": "...", "clientId": "...", "clientName": "...", "status": "In Progress", "description": "...", "startDate": "2025-01-01", "endDate": "2025-12-31" },
    { "type": "CREATE_EMPLOYEE", "tempId": "new_emp_1", "name": "First Last", "title": "Senior Consultant", "companyGroup": "Linea Solutions", "businessUnit": "Delivery", "careerPath": "Consultant", "roleFamily": "BA", "practice": "CrossPractice", "level": "Senior", "location": "US", "email": "first.last@linea.com", "reason": "..." },
    { "type": "UPDATE_EMPLOYEE", "employeeId": "<id>", "changes": { ... }, "reason": "..." },
    { "type": "UPDATE_PROJECT", "projectId": "<id>", "changes": { ... }, "reason": "..." }
  ],
  "missingInfo": ["List any assumptions made or gaps filled automatically"],
  "confidence": 0.92
}`;

    const todayStr = new Date().toISOString().slice(0, 10); // e.g. "2026-03-02"
    const thisMonthStart = todayStr.slice(0, 7) + '-01';
    const thisMonthEnd   = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString().slice(0, 10);

    const userPrompt = `[TODAY'S DATE: ${todayStr}]
When the user says "this month" use ${thisMonthStart} to ${thisMonthEnd}.
When the user says "next month", "now", "starting today", or similar relative dates, resolve them relative to ${todayStr}.
For new allocations without explicit dates, default startDate to ${todayStr} and endDate to the project's own endDate (or +6 months if unknown).

[CURRENT DATABASE STATE]
${contextBlock}

${docText ? `[SUPPORTING DOCUMENT — use this to fill in missing details]\n${docText.slice(0, 4000)}\n\n` : ''}[COMMAND TO EXECUTE]
${command}`;

    const response = await chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { model: 'claude-sonnet-4-6' }
    );

    // Parse JSON — Claude may occasionally wrap in ```json
    let actionPlan;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      actionPlan = JSON.parse(jsonMatch ? jsonMatch[0] : response.content);
    } catch {
      return NextResponse.json(
        { error: 'AI returned unparseable response', raw: response.content },
        { status: 500 }
      );
    }

    return NextResponse.json({
      actionPlan,
      contextUsed: {
        employees: employees.length,
        projects: projects.length,
        allocations: allocations.length,
        clients: clients.length,
      },
    });
  } catch (error: any) {
    console.error('NL command error:', error);
    return NextResponse.json({ error: 'Internal error', detail: error.message }, { status: 500 });
  }
}
