import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const note = await prisma.clientNote.findUnique({ where: { clientId } });
    return NextResponse.json({ note });
  } catch (error) {
    console.error('ClientNote GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch client note' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { clientName, pageLayout, notes } = await request.json();

    const note = await prisma.clientNote.upsert({
      where: { clientId },
      create: {
        clientId,
        clientName: clientName || clientId,
        pageLayout: pageLayout ? JSON.stringify(pageLayout) : '{}',
        notes: notes || '',
      },
      update: {
        clientName: clientName || undefined,
        pageLayout: pageLayout ? JSON.stringify(pageLayout) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('ClientNote PUT error:', error);
    return NextResponse.json({ error: 'Failed to save client note' }, { status: 500 });
  }
}
