// app/api/code-edit/route.ts
// Self-Correcting Engine — reads source files, asks Claude to generate targeted
// code edits, applies them to disk, and lets Next.js hot-reload pick them up.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getConfig } from '@/lib/llm';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

// ─── File map: page context keywords → relevant source files ─────────────────

// layout.tsx is ALWAYS included for header/nav/global-element requests
const LAYOUT_FILES = ['app/layout.tsx'];

// Keywords that indicate the change is in the global layout/navbar, not the page body
const LAYOUT_KEYWORDS = [
  'header', 'navbar', 'nav bar', 'navigation', 'top bar', 'title bar',
  'site title', 'site name', 'app title', 'app name', 'brand', 'logo text',
  'talent + allocation', 'talent and allocation', 'find available staff',
  'subtitle', 'tagline', 'header text',
];

const PAGE_FILE_MAP: Array<{ keywords: string[]; files: string[] }> = [
  {
    keywords: ['employees directory', 'employee directory', 'browse/employees', 'employees page'],
    files: ['app/browse/employees/page.tsx'],
  },
  {
    keywords: ['clients directory', 'client directory', 'browse/clients', 'clients page'],
    files: ['app/browse/clients/page.tsx'],
  },
  {
    keywords: ['projects directory', 'project directory', 'browse/projects', 'projects page'],
    files: ['app/browse/projects/page.tsx'],
  },
  {
    keywords: ['allocations', 'browse/allocations'],
    files: ['app/browse/allocations/page.tsx'],
  },
  {
    keywords: ['org chart', 'orgchart'],
    files: ['app/browse/orgchart/page.tsx'],
  },
  {
    keywords: ['employee profile', 'person/', 'staff profile'],
    files: ['app/person/[id]/page.tsx'],
  },
  {
    keywords: ['project detail', 'project page', 'project/'],
    files: ['app/project/[id]/page.tsx'],
  },
  {
    keywords: ['feedback board', 'feedback'],
    files: ['app/feedback/page.tsx'],
  },
  {
    keywords: ['home', 'ask anything', 'search page'],
    files: ['app/page.tsx'],
  },
];

function getRelevantFiles(pageContext: string, title: string): string[] {
  const combined = `${pageContext} ${title}`.toLowerCase();

  // If it's about the global header/nav, always start with layout.tsx
  const isLayoutChange = LAYOUT_KEYWORDS.some(kw => combined.includes(kw));
  if (isLayoutChange) {
    return [...LAYOUT_FILES, 'app/page.tsx'];
  }

  for (const entry of PAGE_FILE_MAP) {
    if (entry.keywords.some(kw => combined.includes(kw))) {
      // Always include layout.tsx as a secondary file so Claude can see global context
      return [...entry.files, ...LAYOUT_FILES];
    }
  }

  // Default: check if the title mentions a specific area
  if (combined.includes('client')) return ['app/browse/clients/page.tsx', ...LAYOUT_FILES];
  if (combined.includes('employee') || combined.includes('staff')) return ['app/browse/employees/page.tsx', ...LAYOUT_FILES];
  if (combined.includes('project')) return ['app/browse/projects/page.tsx', ...LAYOUT_FILES];

  // Final fallback: home page + layout
  return ['app/page.tsx', ...LAYOUT_FILES];
}

// ─── Safe path check (prevent path traversal) ─────────────────────────────────

function safePath(relativePath: string): string | null {
  const resolved = path.resolve(PROJECT_ROOT, relativePath);
  if (!resolved.startsWith(PROJECT_ROOT)) return null;
  return resolved;
}

// ─── Call Claude with large token budget for code editing ─────────────────────

async function callClaudeForCodeEdit(
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ─── Build the prompt ─────────────────────────────────────────────────────────

function buildPrompt(
  userRequest: string,
  plan: string[],
  fileContents: Record<string, string>
): string {
  const filesSection = Object.entries(fileContents)
    .map(([filePath, content]) => `FILE: ${filePath}\n\`\`\`tsx\n${content}\n\`\`\``)
    .join('\n\n---\n\n');

  return `You are a precise code editor for a Next.js / Tailwind CSS application called RAMP (Resource Allocation Management Platform).

The user has requested this UI change:
"${userRequest}"

Implementation plan:
${plan.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Here are the relevant source files:

${filesSection}

Your task: produce the MINIMAL set of code edits to implement the user's request.

RULES:
- "oldCode" MUST be an EXACT substring found verbatim in the file shown above (copy-paste it). It will be used as a literal string.replace() target — it must match character for character.
- "newCode" is the replacement text.
- Make the smallest possible change — only change what is needed.
- For Tailwind classes: change class names inside className strings.
- For text changes: change only the specific text string.
- For font/size changes: update the relevant Tailwind text/font classes (e.g., text-sm → text-lg, font-medium → font-bold).
- For color changes: update the bg-*/text-*/border-* classes.
- Preserve all surrounding code structure.

Return ONLY a JSON object in this exact format (no markdown, no explanation outside JSON):
{
  "edits": [
    {
      "filePath": "app/browse/employees/page.tsx",
      "description": "Brief description of this specific edit",
      "oldCode": "exact text to find",
      "newCode": "replacement text"
    }
  ],
  "explanation": "One sentence summary of all changes made"
}`;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { ticketId } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId required' }, { status: 400 });
    }

    // Load ticket
    const ticket = await prisma.feedbackTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Parse classification to get the plan
    let classification: { plan?: string[]; intent?: string } = {};
    try {
      classification = JSON.parse(ticket.structuredJson);
    } catch {
      classification = { plan: ['Apply UI change as requested'], intent: ticket.title };
    }

    const plan = classification.plan || ['Apply UI change as requested'];

    // Check for API key — code edits require real AI
    const cfg = getConfig();
    if (cfg.provider === 'mock' || !cfg.apiKey) {
      return NextResponse.json(
        { error: 'Code editing requires an Anthropic or OpenAI API key configured in your .env file.' },
        { status: 400 }
      );
    }

    // Mark ticket as in_progress
    await prisma.feedbackTicket.update({
      where: { id: ticketId },
      data: { status: 'in_progress' },
    });

    // Determine which files to edit
    const relativeFiles = getRelevantFiles(ticket.pageContext || '', ticket.title);

    // Read file contents (safely)
    const fileContents: Record<string, string> = {};
    for (const relFile of relativeFiles) {
      const absPath = safePath(relFile);
      if (!absPath) continue;
      try {
        fileContents[relFile] = fs.readFileSync(absPath, 'utf-8');
      } catch {
        console.warn(`[code-edit] Could not read file: ${relFile}`);
      }
    }

    if (Object.keys(fileContents).length === 0) {
      await prisma.feedbackTicket.update({
        where: { id: ticketId },
        data: {
          status: 'closed',
          implementationResult: JSON.stringify({
            success: false,
            changes: [],
            summary: 'Could not find relevant source files',
            error: 'No readable source files found for this page context',
          }),
        },
      });
      return NextResponse.json({ error: 'No relevant source files found' }, { status: 400 });
    }

    // Build and send prompt to Claude
    const prompt = buildPrompt(ticket.title, plan, fileContents);

    let llmRaw: string;
    try {
      llmRaw = await callClaudeForCodeEdit(prompt, cfg.apiKey!, cfg.model);
    } catch (err: any) {
      await prisma.feedbackTicket.update({
        where: { id: ticketId },
        data: {
          status: 'closed',
          implementationResult: JSON.stringify({
            success: false,
            changes: [],
            summary: 'AI failed to generate code edits',
            error: err.message,
          }),
        },
      });
      return NextResponse.json({ error: `AI error: ${err.message}` }, { status: 500 });
    }

    // Parse the JSON response — robustly extract JSON even if model adds extra prose
    let editPlan: { edits: Array<{ filePath: string; description: string; oldCode: string; newCode: string }>; explanation: string };
    try {
      // Strategy 1: extract JSON from a code block if present
      const codeBlockMatch = llmRaw.match(/```(?:json)?\s*([\s\S]*?)```/);
      let jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : llmRaw.trim();

      // Strategy 2: find the outermost { ... } in case of trailing prose
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }

      editPlan = JSON.parse(jsonStr);
    } catch (err) {
      console.error('[code-edit] Failed to parse LLM response:', llmRaw);
      await prisma.feedbackTicket.update({
        where: { id: ticketId },
        data: {
          status: 'closed',
          implementationResult: JSON.stringify({
            success: false,
            changes: [],
            summary: 'AI response could not be parsed',
            error: 'Invalid JSON from AI',
          }),
        },
      });
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 });
    }

    // If AI says oldCode === newCode for all edits, check WHY:
    // - True no-op: the explanation says "already present/implemented" → ship it
    // - False no-op: the explanation says "cannot find / not in this file" → it looked at wrong file, close with error
    const allNoOp = (editPlan.edits || []).every(e => e.oldCode === e.newCode);
    if (allNoOp) {
      const explanation = (editPlan.explanation || '').toLowerCase();
      const cantFindIt = explanation.includes('cannot') || explanation.includes('not appear') ||
        explanation.includes('not found') || explanation.includes('unable') ||
        explanation.includes('not in') || explanation.includes('not located') ||
        explanation.includes('without identifying') || explanation.includes('not shown');

      if (cantFindIt) {
        // Claude looked at the wrong file — close so the user can retry
        const result = {
          success: false,
          changes: [],
          failedEdits: [`AI could not locate the target text in the provided files. The text may be in a different component. Try retrying — the engine will now search more files.`],
          summary: editPlan.explanation,
          error: 'Target text not found in provided files',
        };
        await prisma.feedbackTicket.update({
          where: { id: ticketId },
          data: {
            status: 'closed',
            implementationResult: JSON.stringify(result),
            errorMessage: 'Target text not found in provided files',
          },
        });
        return NextResponse.json(result, { status: 200 });
      }

      // True no-op: change is already applied
      const result = {
        success: true,
        changes: ['Change already present in source code — no edit needed'],
        failedEdits: [],
        summary: editPlan.explanation || 'The requested change is already reflected in the source code.',
      };
      await prisma.feedbackTicket.update({
        where: { id: ticketId },
        data: { status: 'shipped', implementationResult: JSON.stringify(result) },
      });
      return NextResponse.json(result);
    }

    // Apply each edit to disk
    const appliedChanges: string[] = [];
    const failedEdits: string[] = [];

    for (const edit of editPlan.edits || []) {
      const absPath = safePath(edit.filePath);
      if (!absPath) {
        failedEdits.push(`Skipped (unsafe path): ${edit.filePath}`);
        continue;
      }

      try {
        let fileContent = fs.readFileSync(absPath, 'utf-8');

        if (!fileContent.includes(edit.oldCode)) {
          // Try a normalized whitespace match as fallback
          const normalizedFile = fileContent.replace(/\s+/g, ' ');
          const normalizedOld = edit.oldCode.replace(/\s+/g, ' ');
          if (normalizedFile.includes(normalizedOld)) {
            // Find approximate location and note it
            failedEdits.push(`Could not find exact match for edit in ${edit.filePath}: "${edit.description}"`);
          } else {
            failedEdits.push(`Text not found in ${edit.filePath}: "${edit.description}" — oldCode did not match`);
          }
          continue;
        }

        // Apply the replacement (first occurrence only for safety)
        fileContent = fileContent.replace(edit.oldCode, edit.newCode);
        fs.writeFileSync(absPath, fileContent, 'utf-8');
        appliedChanges.push(edit.description);
        console.log(`[code-edit] Applied: ${edit.description} in ${edit.filePath}`);
      } catch (err: any) {
        failedEdits.push(`Error applying edit to ${edit.filePath}: ${err.message}`);
      }
    }

    const success = appliedChanges.length > 0;
    const result = {
      success,
      changes: appliedChanges,
      failedEdits,
      summary: success
        ? `Applied ${appliedChanges.length} code change(s): ${editPlan.explanation}`
        : `Failed to apply code changes: ${failedEdits.join('; ')}`,
      error: !success ? failedEdits.join('; ') : undefined,
    };

    // Update ticket
    await prisma.feedbackTicket.update({
      where: { id: ticketId },
      data: {
        status: success ? 'shipped' : 'closed',
        autoApproved: false,
        implementationResult: JSON.stringify(result),
        errorMessage: result.error || '',
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[api/code-edit] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
