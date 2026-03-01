import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const companyGroup = searchParams.get('companyGroup') || '';
    const level = searchParams.get('level') || '';
    const practice = searchParams.get('practice') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { rampName: { contains: search } },
        { title: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (location && location !== 'all') {
      where.location = location;
    }

    if (companyGroup && companyGroup !== 'all') {
      where.companyGroup = companyGroup;
    }

    if (level && level !== 'all') {
      where.level = level;
    }

    if (practice && practice !== 'all') {
      where.practice = practice;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          rampName: true,
          email: true,
          companyGroup: true,
          businessUnit: true,
          careerPath: true,
          roleFamily: true,
          practice: true,
          level: true,
          title: true,
          location: true,
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({ employees, total });
  } catch (error) {
    console.error('Employees API error:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}
