import { NextRequest, NextResponse } from 'next/server';
import { chatbotRespond, getConfig } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { messages, pageContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const response = await chatbotRespond(messages, pageContext || 'Unknown page');
    const config = getConfig();

    return NextResponse.json({
      reply: response.content,
      provider: config.provider,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
