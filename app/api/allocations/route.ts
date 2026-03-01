import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const employeeId = searchParams.get('employeeId') || '';
    const projectId = searchParams.get('projectId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { employee: { name: { contains: search } } },
        { project: { name: { contains: search } } },
        { project: { clientName: { contains: search } } },
        { assignmentCode: { contains: search } },
      ];
    }

    const [allocations, total] = await Promise.all([
      prisma.allocation.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              rampName: true,
              companyGroup: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              clientName: true,
              rampProjectCode: true,
            },
          },
        },
      }),
      prisma.allocation.count({ where }),
    ]);

    return NextResponse.json({ allocations, total });
  } catch (error) {
    console.error('Allocations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
  }
}
