import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tickets = await prisma.feedbackTicket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, rawText, chatTranscript, structuredJson, pageContext } = body;

    const ticket = await prisma.feedbackTicket.create({
      data: {
        type,
        title,
        rawText,
        chatTranscript,
        structuredJson: typeof structuredJson === 'string' ? structuredJson : JSON.stringify(structuredJson || {}),
        pageContext,
        status: 'new',
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Feedback creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
