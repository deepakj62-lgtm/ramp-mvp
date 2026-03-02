import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET  /api/org-chart → returns hierarchical tree
// POST /api/org-chart → seed reporting relationships (run once)

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        title: true,
        level: true,
        companyGroup: true,
        practice: true,
        roleFamily: true,
        reportsTo: true,
        pageLayout: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Org chart fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch org chart' }, { status: 500 });
  }
}

// Seed reporting relationships once
export async function POST(request: NextRequest) {
  try {
    const { seed } = await request.json().catch(() => ({ seed: false }));
    if (!seed) return NextResponse.json({ error: 'Send { seed: true } to seed org hierarchy' }, { status: 400 });

    const employees = await prisma.employee.findMany({
      select: { id: true, name: true, title: true, level: true, companyGroup: true, practice: true, reportsTo: true },
    });

    // Identify key leaders by name + title heuristics
    const akio  = employees.find(e => e.name.toLowerCase().includes('akio'));
    const brian = employees.find(e => e.name.toLowerCase().includes('brian') || e.name.toLowerCase().includes('colker'));

    // Helper: level rank
    const rank = (level: string) => {
      const r: Record<string, number> = {
        'Executive': 5, 'Principal Consultant': 4, 'Senior Consultant': 3,
        'Consultant': 2, 'Associate': 1,
      };
      return r[level] || 0;
    };

    // Group employees by companyGroup + practice
    type EmpEntry = { id: string; name: string; title: string; level: string; companyGroup: string; practice: string; reportsTo: string | null };

    const byGroupPractice: Record<string, EmpEntry[]> = {};
    for (const e of employees as EmpEntry[]) {
      const key = `${e.companyGroup}::${e.practice}`;
      if (!byGroupPractice[key]) byGroupPractice[key] = [];
      byGroupPractice[key].push(e);
    }

    const updates: { id: string; reportsTo: string | null }[] = [];

    for (const e of employees as EmpEntry[]) {
      // CEO / Co-Founders → no manager
      if (e.id === akio?.id || e.id === brian?.id) {
        updates.push({ id: e.id, reportsTo: null });
        continue;
      }

      const myRank = rank(e.level);
      const key    = `${e.companyGroup}::${e.practice}`;
      const peers  = byGroupPractice[key] || [];

      // Find the nearest person in the same group+practice with rank = myRank + 1
      const directManager = peers
        .filter(p => p.id !== e.id && rank(p.level) === myRank + 1)
        .sort((a, b) => a.name.localeCompare(b.name))[0];

      if (directManager) {
        updates.push({ id: e.id, reportsTo: directManager.id });
        continue;
      }

      // If no same-practice manager, look in same companyGroup with higher rank
      const sameGroup = employees.filter(p => p.companyGroup === e.companyGroup && p.id !== e.id && rank(p.level) > myRank);
      const groupManager = sameGroup
        .sort((a, b) => rank(a.level) - rank(b.level))[0]; // lowest rank that's still higher

      if (groupManager) {
        updates.push({ id: e.id, reportsTo: groupManager.id });
        continue;
      }

      // Fall back: report to Akio (or Brian for Canadian/Cyber)
      const fallback = e.companyGroup === 'Linea Solutions ULC' && brian ? brian.id
        : akio ? akio.id : null;
      updates.push({ id: e.id, reportsTo: fallback });
    }

    // Write all updates
    let count = 0;
    for (const u of updates) {
      await prisma.employee.update({
        where: { id: u.id },
        data: { reportsTo: u.reportsTo },
      });
      count++;
    }

    return NextResponse.json({ success: true, updated: count });
  } catch (error) {
    console.error('Org seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
