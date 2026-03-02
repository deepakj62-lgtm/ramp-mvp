import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const engagementClass = searchParams.get('engagementClass') || '';
    const industryTag = searchParams.get('industryTag') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { clientName: { contains: search } },
        { rampProjectCode: { contains: search } },
        { description: { contains: search } },
        { engagementManager: { contains: search } },
        { accountExecutive: { contains: search } },
        { currentPhase: { contains: search } },
        { scopeCategories: { contains: search } },
        { milestones: { contains: search } },
        { clientId: { contains: search } },
        { industryTag: { contains: search } },
      ];
    }

    if (engagementClass && engagementClass !== 'all') {
      where.engagementClass = engagementClass;
    }

    if (industryTag && industryTag !== 'all') {
      where.industryTag = industryTag;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { allocations: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({ projects, total });
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, clientName, clientId, engagementClass, industryTag, status,
      currentPhase, description, startDate, endDate, accountExecutive,
      engagementManager, scopeCategories, milestones, pageLayout,
    } = body;

    if (!name || !clientName) {
      return NextResponse.json({ error: 'name and clientName are required' }, { status: 400 });
    }

    const count = await prisma.project.count();
    const rampProjectCode = `PRJ-${String(1023 + count + 1).padStart(6, '0')}`;

    const project = await prisma.project.create({
      data: {
        rampProjectCode,
        name: name.trim(),
        clientName: clientName.trim(),
        clientId: (clientId || clientName.replace(/\s+/g, '').toUpperCase().slice(0, 8)).trim(),
        engagementClass: engagementClass || 'Client',
        industryTag: industryTag || null,
        status: status || 'Planning',
        currentPhase: currentPhase || 'Discovery',
        description: description || '',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        accountExecutive: accountExecutive || '',
        engagementManager: engagementManager || '',
        scopeCategories: scopeCategories ? JSON.stringify(scopeCategories) : null,
        milestones: milestones ? JSON.stringify(milestones) : '[]',
        pageLayout: pageLayout ? JSON.stringify(pageLayout) : '{}',
      },
    });

    return NextResponse.json({ success: true, project, id: project.id }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
