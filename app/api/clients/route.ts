import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sector = searchParams.get('sector') || '';

    // Get all projects and aggregate by client
    const projects = await prisma.project.findMany({
      orderBy: { clientName: 'asc' },
      select: {
        id: true,
        clientId: true,
        clientName: true,
        name: true,
        rampProjectCode: true,
        engagementClass: true,
        industryTag: true,
        accountExecutive: true,
        engagementManager: true,
      },
    });

    // Aggregate by clientId
    const clientMap: Record<string, {
      clientId: string;
      clientName: string;
      sector: string;
      projects: Array<{
        id: string;
        name: string;
        rampProjectCode: string;
        engagementClass: string;
      }>;
    }> = {};

    for (const project of projects) {
      if (!clientMap[project.clientId]) {
        clientMap[project.clientId] = {
          clientId: project.clientId,
          clientName: project.clientName,
          sector: project.industryTag || 'Other',
          projects: [],
        };
      }
      clientMap[project.clientId].projects.push({
        id: project.id,
        name: project.name,
        rampProjectCode: project.rampProjectCode,
        engagementClass: project.engagementClass,
        engagementManager: project.engagementManager,
        accountExecutive: project.accountExecutive,
      } as any);
    }

    let clients = Object.values(clientMap);

    // Filter by search — client name, project names, managers
    if (search) {
      const lowerSearch = search.toLowerCase();
      clients = clients.filter(c =>
        c.clientName.toLowerCase().includes(lowerSearch) ||
        c.clientId.toLowerCase().includes(lowerSearch) ||
        c.projects.some(p =>
          (p as any).name?.toLowerCase().includes(lowerSearch) ||
          (p as any).engagementManager?.toLowerCase().includes(lowerSearch) ||
          (p as any).accountExecutive?.toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Filter by sector
    if (sector && sector !== 'all') {
      clients = clients.filter(c =>
        c.sector.toLowerCase() === sector.toLowerCase()
      );
    }

    // Sort by name
    clients.sort((a, b) => a.clientName.localeCompare(b.clientName));

    return NextResponse.json({ clients, total: clients.length });
  } catch (error) {
    console.error('Clients API error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
