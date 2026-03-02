// app/api/action/route.ts
// AI Action Engine — classifies user requests as "small" or "large",
// auto-executes small safe changes, queues large changes for approval.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { chat, chatWithVision } from '@/lib/llm';
import {
  sendActionCompletedEmail,
  sendActionQueuedEmail,
  sendActionFailedEmail,
} from '@/lib/email';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionRequest {
  userMessage: string;
  pageContext?: string;
  entityType?: string;   // employee | project | allocation | client
  entityId?: string;
  notifyEmail?: string;
  chatTranscript?: string;
  imageBase64?: string;      // base64-encoded screenshot (no data: prefix)
  imageMimeType?: string;    // e.g. "image/png"
}

interface ActionClassification {
  intent: string;           // short description of what user wants to do
  complexity: 'small' | 'large';
  plan: string[];           // ordered steps
  entityType?: string;
  entityId?: string;
  fieldUpdates?: Record<string, unknown>; // for small actions: field → new value
  reason: string;           // why this complexity was chosen
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const CLASSIFY_PROMPT = `You are RAMP AI, an action classifier for a resource management platform.
The user has sent a message that may be a change request. Classify it and produce a JSON plan.

COMPLEXITY RULES:
- "small": A single, safe, reversible DB update to ONE field of ONE record (e.g. update a title, fix a typo, change a status, update a date). Only if entityId is known.
- "large": Anything else — multi-record, multi-field, structural, creates/deletes, unclear entity, or needs investigation first.

EXECUTABLE SMALL ACTIONS (auto-run, no approval):
- Update employee title / level / location / practice / companyGroup
- Update project status / currentPhase / description
- Update allocation allocationPercent / roleOnProject / startDate / endDate

ALWAYS "large" — NEVER auto-executable (no matter what):
- UI changes: font sizes, heading sizes, colors, spacing, layout, CSS, styling of any kind
- Frontend changes: components, pages, buttons, forms, navigation, visual design
- Code changes: adding features, fixing bugs in code, new pages, new components, new APIs
- Anything that requires a developer to write or edit code files
- Requests that do not target a specific known database record with a known entityId
- Bulk changes, reports, analysis, or multi-step workflows

If the request is about how something LOOKS or how the app BEHAVES visually, it is ALWAYS "large".

RESPONSE FORMAT (JSON only, no markdown):
{
  "intent": "short description of what user wants",
  "complexity": "small" | "large",
  "plan": ["step 1", "step 2", ...],
  "entityType": "employee" | "project" | "allocation" | "client" | null,
  "entityId": "the id if explicitly known from context, else null",
  "fieldUpdates": { "fieldName": "newValue" },
  "reason": "one sentence explaining complexity choice"
}

Context will be provided in the user message.`;

// ─── Executor for small actions ───────────────────────────────────────────────

async function executeSmallAction(
  classification: ActionClassification
): Promise<{ success: boolean; changes: string[]; summary: string; error?: string }> {
  const { entityType, entityId, fieldUpdates } = classification;

  if (!entityType || !entityId || !fieldUpdates || Object.keys(fieldUpdates).length === 0) {
    return { success: false, changes: [], summary: 'Missing entity info or field updates', error: 'Insufficient data for execution' };
  }

  const changes: string[] = [];

  try {
    if (entityType === 'employee') {
      // Whitelist allowed fields for safety
      const allowed = ['title', 'level', 'location', 'practice', 'companyGroup', 'businessUnit'];
      const safe = Object.fromEntries(
        Object.entries(fieldUpdates).filter(([k]) => allowed.includes(k))
      );
      if (Object.keys(safe).length === 0) {
        return { success: false, changes: [], summary: 'No safe fields to update', error: 'Requested fields are not auto-updatable' };
      }
      const emp = await prisma.employee.update({ where: { id: entityId }, data: safe });
      for (const [k, v] of Object.entries(safe)) {
        changes.push(`Updated employee "${emp.name}": ${k} → ${v}`);
      }
      return { success: true, changes, summary: `Updated ${emp.name}'s profile (${Object.keys(safe).join(', ')})` };
    }

    if (entityType === 'project') {
      const allowed = ['status', 'currentPhase', 'description', 'endDate', 'startDate'];
      const safe = Object.fromEntries(
        Object.entries(fieldUpdates).filter(([k]) => allowed.includes(k))
      );
      if (Object.keys(safe).length === 0) {
        return { success: false, changes: [], summary: 'No safe fields to update', error: 'Requested fields are not auto-updatable' };
      }
      const proj = await prisma.project.update({ where: { id: entityId }, data: safe });
      for (const [k, v] of Object.entries(safe)) {
        changes.push(`Updated project "${proj.name}": ${k} → ${v}`);
      }
      return { success: true, changes, summary: `Updated project "${proj.name}" (${Object.keys(safe).join(', ')})` };
    }

    if (entityType === 'allocation') {
      const allowed = ['allocationPercent', 'roleOnProject', 'assignmentDetail'];
      const safe: Record<string, unknown> = Object.fromEntries(
        Object.entries(fieldUpdates).filter(([k]) => allowed.includes(k))
      );
      if (safe.allocationPercent !== undefined) {
        safe.allocationPercent = Number(safe.allocationPercent);
      }
      if (Object.keys(safe).length === 0) {
        return { success: false, changes: [], summary: 'No safe fields to update', error: 'Requested fields are not auto-updatable' };
      }
      const alloc = await prisma.allocation.update({
        where: { id: entityId },
        data: safe as any,
        include: { employee: true, project: true },
      });
      for (const [k, v] of Object.entries(safe)) {
        changes.push(`Updated allocation for ${alloc.employee.name} on ${alloc.project.name}: ${k} → ${v}`);
      }
      return { success: true, changes, summary: `Updated allocation for ${alloc.employee.name} on ${alloc.project.name}` };
    }

    return { success: false, changes: [], summary: 'Unsupported entity type', error: `Cannot auto-execute for entity type: ${entityType}` };
  } catch (err: any) {
    return { success: false, changes: [], summary: 'Execution error', error: err.message };
  }
}

// ─── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ActionRequest = await req.json();
    const { userMessage, pageContext, entityType, entityId, notifyEmail, chatTranscript, imageBase64, imageMimeType } = body;

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // Build context string for the classifier
    const contextStr = [
      pageContext && `Page context: ${pageContext}`,
      entityType && `Entity type: ${entityType}`,
      entityId && `Entity ID: ${entityId}`,
    ].filter(Boolean).join('\n');

    const screenshotNote = imageBase64
      ? '\n\nNote: The user has attached a screenshot. Analyze it carefully alongside the description — look at what UI element or data they are pointing at, and classify accordingly.'
      : '';

    const userPrompt = contextStr
      ? `${userMessage}\n\n---\n${contextStr}${screenshotNote}`
      : `${userMessage}${screenshotNote}`;

    // Step 1 — Classify the request (use vision if image provided)
    let classification: ActionClassification;
    try {
      const messages = [
        { role: 'system' as const, content: CLASSIFY_PROMPT },
        { role: 'user' as const, content: userPrompt },
      ];
      const llmResponse = imageBase64
        ? await chatWithVision(messages, imageBase64, imageMimeType || 'image/png')
        : await chat(messages);
      const jsonStr = llmResponse.content
        .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      classification = JSON.parse(jsonStr);
    } catch (err) {
      // Fallback: treat as large
      classification = {
        intent: userMessage.substring(0, 100),
        complexity: 'large',
        plan: ['Review user request', 'Plan implementation', 'Execute with approval'],
        reason: 'Could not parse AI classification; defaulting to large for safety',
      };
    }

    // Merge entity info from context if AI didn't extract it
    if (!classification.entityId && entityId) classification.entityId = entityId;
    if (!classification.entityType && entityType) classification.entityType = entityType;

    // Step 2a — Small: auto-execute
    if (classification.complexity === 'small') {
      const result = await executeSmallAction(classification);

      // Create ticket to record what happened
      const ticket = await prisma.feedbackTicket.create({
        data: {
          type: 'action',
          status: result.success ? 'shipped' : 'closed',
          title: classification.intent.substring(0, 200),
          rawText: userMessage,
          chatTranscript: chatTranscript || '',
          structuredJson: JSON.stringify(classification),
          pageContext: pageContext || '',
          complexity: 'small',
          autoApproved: result.success,
          implementationPlan: JSON.stringify(classification.plan),
          implementationResult: JSON.stringify(result),
          notifyEmail: notifyEmail || '',
          errorMessage: result.error || '',
        },
      });

      // Send email if address provided
      if (notifyEmail && result.success) {
        await sendActionCompletedEmail(notifyEmail, {
          ticketId: ticket.id,
          title: classification.intent,
          complexity: 'small',
          changes: result.changes,
          summary: result.summary,
          pageContext,
        });
      } else if (notifyEmail && !result.success) {
        await sendActionFailedEmail(notifyEmail, classification.intent, result.error || 'Unknown error');
      }

      return NextResponse.json({
        ticketId: ticket.id,
        complexity: 'small',
        autoApplied: result.success,
        changes: result.changes,
        summary: result.success ? result.summary : result.error,
        plan: classification.plan,
        intent: classification.intent,
      });
    }

    // Step 2b — Large: queue for approval
    const ticket = await prisma.feedbackTicket.create({
      data: {
        type: 'action',
        status: 'new',
        title: classification.intent.substring(0, 200),
        rawText: userMessage,
        chatTranscript: chatTranscript || '',
        structuredJson: JSON.stringify(classification),
        pageContext: pageContext || '',
        complexity: 'large',
        autoApproved: false,
        implementationPlan: JSON.stringify(classification.plan),
        implementationResult: '',
        notifyEmail: notifyEmail || '',
        errorMessage: '',
      },
    });

    // Send queued email if address provided
    if (notifyEmail) {
      const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await sendActionQueuedEmail(notifyEmail, {
        ticketId: ticket.id,
        title: classification.intent,
        plan: classification.plan,
        reviewUrl: `${appUrl}/feedback`,
      });
    }

    return NextResponse.json({
      ticketId: ticket.id,
      complexity: 'large',
      autoApplied: false,
      queued: true,
      intent: classification.intent,
      plan: classification.plan,
      reason: classification.reason,
    });
  } catch (err: any) {
    console.error('[api/action] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST /api/action/execute  (called from feedback board for approved large tickets) ───
// This is called as POST /api/action with { execute: true, ticketId }

export async function PUT(req: NextRequest) {
  try {
    const { ticketId } = await req.json();

    if (!ticketId) return NextResponse.json({ error: 'ticketId required' }, { status: 400 });

    const ticket = await prisma.feedbackTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    if (ticket.complexity !== 'large') {
      return NextResponse.json({ error: 'Only large tickets need manual execution' }, { status: 400 });
    }

    // Parse the classification from structuredJson
    let classification: ActionClassification;
    try {
      classification = JSON.parse(ticket.structuredJson);
    } catch {
      return NextResponse.json({ error: 'Could not parse ticket data' }, { status: 400 });
    }

    // Mark as in_progress
    await prisma.feedbackTicket.update({
      where: { id: ticketId },
      data: { status: 'in_progress' },
    });

    // If no entityId/fieldUpdates → this is a UI/code change, cannot auto-execute
    const hasFieldUpdates = classification.entityId && classification.fieldUpdates && Object.keys(classification.fieldUpdates).length > 0;

    let result: { success: boolean; changes: string[]; summary: string; error?: string };

    if (!hasFieldUpdates) {
      // Code/UI change: mark as accepted (acknowledged), not executable by the engine
      result = {
        success: true,
        changes: [],
        summary: `Approved for developer implementation. Plan logged with ${classification.plan.length} steps.`,
      };
      await prisma.feedbackTicket.update({
        where: { id: ticketId },
        data: {
          status: 'accepted',
          implementationResult: JSON.stringify(result),
          errorMessage: '',
        },
      });
    } else {
      // DB change: try to execute
      result = await executeSmallAction(classification);
      const finalStatus = result.success ? 'shipped' : 'closed';
      await prisma.feedbackTicket.update({
        where: { id: ticketId },
        data: {
          status: finalStatus,
          autoApproved: false,
          implementationResult: JSON.stringify(result),
          errorMessage: result.error || '',
        },
      });
    }

    // Send completion email if configured
    if (ticket.notifyEmail) {
      if (result.success) {
        await sendActionCompletedEmail(ticket.notifyEmail, {
          ticketId,
          title: ticket.title,
          complexity: 'large (manually approved)',
          changes: result.changes,
          summary: result.summary,
          pageContext: ticket.pageContext || undefined,
        });
      } else {
        await sendActionFailedEmail(ticket.notifyEmail, ticket.title, result.error || 'Execution failed');
      }
    }

    return NextResponse.json({ success: result.success, changes: result.changes, summary: result.summary, error: result.error });
  } catch (err: any) {
    console.error('[api/action PUT] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
