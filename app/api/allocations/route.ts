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
        { employee: { title: { contains: search } } },
        { employee: { practice: { contains: search } } },
        { project: { name: { contains: search } } },
        { project: { clientName: { contains: search } } },
        { project: { clientId: { contains: search } } },
        { project: { engagementManager: { contains: search } } },
        { project: { currentPhase: { contains: search } } },
        { assignmentCode: { contains: search } },
        { roleOnProject: { contains: search } },
        { assignmentDetail: { contains: search } },
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
              clientId: true,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, projectId, roleOnProject, startDate, endDate, allocationPercent } = body;

    if (!employeeId || !projectId || !startDate || !endDate || allocationPercent === undefined) {
      return NextResponse.json(
        { error: 'employeeId, projectId, startDate, endDate, and allocationPercent are required' },
        { status: 400 }
      );
    }

    // Verify employee and project exist
    const [employee, project] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId } }),
      prisma.project.findUnique({ where: { id: projectId } }),
    ]);

    if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const count = await prisma.allocation.count();
    const assignmentCode = `AS-${String(5080 + count + 1).padStart(5, '0')}`;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const assignmentDetail = `${employee.rampName}-${project.name} (${start.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}-${end.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })})`;

    const allocation = await prisma.allocation.create({
      data: {
        assignmentCode,
        assignmentDetail,
        employeeId,
        projectId,
        roleOnProject: roleOnProject || 'BA',
        startDate: start,
        endDate: end,
        allocationPercent: parseInt(String(allocationPercent)),
      },
      include: {
        employee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, allocation }, { status: 201 });
  } catch (error) {
    console.error('Create allocation error:', error);
    return NextResponse.json({ error: 'Failed to create allocation' }, { status: 500 });
  }
}
