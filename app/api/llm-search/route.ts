import { NextRequest, NextResponse } from 'next/server';
import { extractSearchParams, getConfig } from '@/lib/llm';
import { searchStaff } from '@/lib/search';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Step 1: Extract structured params via LLM (or mock)
    const extracted = await extractSearchParams(query);

    // Step 2: Map extracted params to searchStaff filters
    const filters = {
      query: extracted.rawQuery,
      skills: extracted.skills,
      startDate: extracted.startDate ? new Date(extracted.startDate) : undefined,
      endDate: extracted.endDate ? new Date(extracted.endDate) : undefined,
      minAllocation: extracted.minAvailability || 0,
      location: extracted.location,
      companyGroup: extracted.companyGroup,
      level: extracted.level,
      practice: extracted.practice,
      roleFamily: extracted.roleFamily,
    };

    // Step 3: Search
    const results = await searchStaff(filters);

    const config = getConfig();

    return NextResponse.json({
      results,
      extractedParams: extracted,
      provider: config.provider,
    });
  } catch (error) {
    console.error('LLM search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
