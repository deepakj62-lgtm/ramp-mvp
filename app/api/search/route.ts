import { NextRequest, NextResponse } from 'next/server';
import { searchStaff } from '@/lib/search';

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();
    const results = await searchStaff(filters);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
