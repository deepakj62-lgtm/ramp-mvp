import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { chat, extractSearchParams } from '@/lib/llm';
import { searchStaff } from '@/lib/search';

const fmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Step 1: Classify the query
    const classifyResponse = await chat([
      {
        role: 'system',
        content: `You classify user queries for a staffing/resource-allocation application called RAMP into one of two types:
1. "talent_search" — the user wants to FIND employees/people based on skills, availability, location, or criteria (e.g. "find someone with SQL free in April")
2. "general_question" — anything else: questions about specific projects, allocations, app features, data lookup, how-to, status checks, etc.

Respond with ONLY valid JSON: {"type":"talent_search"} or {"type":"general_question"}`,
      },
      { role: 'user', content: query },
    ]);

    let queryType = 'general_question';
    try {
      const clean = classifyResponse.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      queryType = JSON.parse(clean).type || 'general_question';
    } catch {}

    // ── Talent Search ──────────────────────────────────────────────────
    if (queryType === 'talent_search') {
      const extracted = await extractSearchParams(query);
      const results = await searchStaff({
        query: extracted.rawQuery,
        skills: extracted.skills,
        startDate: extracted.startDate ? new Date(extracted.startDate) : undefined,
        endDate: extracted.endDate ? new Date(extracted.endDate) : undefined,
        minAllocation: extracted.minAvailability || 0,
        location: extracted.location,
        companyGroup: extracted.companyGroup,
        level: extracted.level,
        practice: extracted.practice,
        roleFamily: extracted.roleFamily,
      });
      return NextResponse.json({ type: 'talent_search', results, extractedParams: extracted });
    }

    // ── General Question: build full DB context ────────────────────────
    const today = new Date();

    const [projects, employees] = await Promise.all([
      prisma.project.findMany({
        include: {
          allocations: {
            include: { employee: true },
            where: { endDate: { gte: today } },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.employee.findMany({
        include: {
          allocations: {
            include: { project: true },
            where: { endDate: { gte: today } },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    // ── Pre-compute aggregate stats so the AI never has to count ───────
    const countByGroup: Record<string, number> = {};
    const countByPractice: Record<string, number> = {};
    const countByLevel: Record<string, number> = {};
    for (const e of employees) {
      countByGroup[e.companyGroup]     = (countByGroup[e.companyGroup] || 0) + 1;
      countByPractice[e.practice]      = (countByPractice[e.practice]  || 0) + 1;
      countByLevel[e.level]            = (countByLevel[e.level]        || 0) + 1;
    }
    const availableNow = employees.filter(e => e.allocations.length === 0).length;
    const executives   = employees.filter(e =>
      e.level === 'Executive' ||
      e.title.toLowerCase().includes('ceo') ||
      e.title.toLowerCase().includes('president') ||
      e.title.toLowerCase().includes('founder') ||
      e.title.toLowerCase().includes('principal') && e.companyGroup === 'Linea Solutions'
    );

    const groupSummary    = Object.entries(countByGroup).map(([g, n]) => `${g}: ${n}`).join(', ');
    const practiceSummary = Object.entries(countByPractice).map(([p, n]) => `${p}: ${n}`).join(', ');
    const levelSummary    = Object.entries(countByLevel).map(([l, n]) => `${l}: ${n}`).join(', ');

    const summaryContext = `ORGANIZATION SUMMARY (exact numbers from live database):
- Total employees: ${employees.length}
- Available / on bench right now: ${availableNow}
- By company group: ${groupSummary}
- By practice: ${practiceSummary}
- By level: ${levelSummary}
- Total active/recent projects: ${projects.length}
- Founders: Akio Tagawa (President & CEO, co-founded 1999) and Brian Colker (Principal & Co-Founder, co-founded 1999)
- Executive leadership: ${executives.map(e => `[${e.name}](/person/${e.id}) – ${e.title}`).join(', ')}`;

    const projectContext = projects.map(p => {
      const team = p.allocations
        .map(a => `[${a.employee.name}](/person/${a.employee.id}) (${a.roleOnProject}, ${a.allocationPercent}%, until ${fmt(a.endDate)})`)
        .join('; ');
      return `• [${p.name}](/project/${p.id}) | Code: ${p.rampProjectCode} | Client: ${p.clientName} | Status: ${p.status} | Phase: ${p.currentPhase || '—'} | ${fmt(p.startDate)} → ${fmt(p.endDate)} | Team: ${team || 'none'}`;
    }).join('\n');

    const employeeContext = employees.map(e => {
      const allocs = e.allocations
        .map(a => `[${a.project.name}](/project/${a.project.id}) (${a.roleOnProject}, ${a.allocationPercent}%, until ${fmt(a.endDate)})`)
        .join('; ');
      return `• [${e.name}](/person/${e.id}) | ${e.title} | ${e.level} | ${e.companyGroup} | ${e.practice} | Active: ${allocs || 'none (available)'}`;
    }).join('\n');

    const systemPrompt = `You are the RAMP Assistant for Linea Solutions — a staffing and resource allocation management platform.

You have access to live data from the system today (${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}):

${summaryContext}

ACTIVE PROJECTS (${projects.length} total):
${projectContext}

ALL EMPLOYEES (${employees.length} total):
${employeeContext}

APP CAPABILITIES:
- LLM-powered talent search: find people by skills, availability, location, level, practice
- Browse all employees with profiles: allocation timelines, skills, resume, certifications
- Browse all projects: detail pages with milestones, team roster, status
- Client pages: view all projects and team for any client
- Feedback board: submit bugs, feature requests, data issues
- File upload: upload resumes, project docs, client briefs to auto-update records

FORMATTING RULES — CRITICAL:
- Always use the ORGANIZATION SUMMARY numbers above for headcount questions — do NOT count manually
- When mentioning any employee by name, format as a markdown link: [Name](/person/id)
- When mentioning any project by name, format as a markdown link: [Project Name](/project/id)
- Use bullet points (starting with -) for lists, OR a clean markdown table if comparing multiple values
- Use **bold** for key metrics, names, and status values
- Keep answers factual and concise

Answer the user's question using the live data above.`;

    const answerResponse = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ]);

    return NextResponse.json({
      type: 'general_question',
      answer: answerResponse.content,
    });

  } catch (error) {
    console.error('Universal search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
