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
        { roleFamily: { contains: search } },
        { practice: { contains: search } },
        { businessUnit: { contains: search } },
        { careerPath: { contains: search } },
        { level: { contains: search } },
        { location: { contains: search } },
        { resumeText: { contains: search } },
        { extractedSkills: { contains: search } },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, title, level, companyGroup, businessUnit, careerPath,
      roleFamily, practice, location, resumeText, extractedSkills, pageLayout,
    } = body;

    if (!name || !email || !title) {
      return NextResponse.json({ error: 'name, email, and title are required' }, { status: 400 });
    }

    // Generate rampName (Last, First)
    const parts = name.trim().split(' ');
    const rampName = parts.length >= 2
      ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`
      : name;

    // Auto-generate assignment code
    const count = await prisma.employee.count();
    const empCode = `EMP-${String(count + 1).padStart(5, '0')}`;

    const employee = await prisma.employee.create({
      data: {
        name: name.trim(),
        rampName,
        email: email.trim(),
        title: title.trim(),
        level: level || 'Consultant',
        companyGroup: companyGroup || 'Linea Solutions',
        businessUnit: businessUnit || 'Delivery',
        careerPath: careerPath || 'Consultant',
        roleFamily: roleFamily || 'BA',
        practice: practice || 'CrossPractice',
        location: location || 'US',
        resumeText: resumeText || `${name} is a ${title} at Linea Solutions.`,
        extractedSkills: extractedSkills ? JSON.stringify(extractedSkills) : '{}',
        pageLayout: pageLayout ? JSON.stringify(pageLayout) : '{}',
      },
    });

    return NextResponse.json({ success: true, employee, id: employee.id }, { status: 201 });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
