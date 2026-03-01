import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const engagementClass = searchParams.get('engagementClass') || '';
    const industryTag = searchParams.get('industryTag') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { clientName: { contains: search } },
        { rampProjectCode: { contains: search } },
      ];
    }

    if (engagementClass && engagementClass !== 'all') {
      where.engagementClass = engagementClass;
    }

    if (industryTag && industryTag !== 'all') {
      where.industryTag = industryTag;
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
