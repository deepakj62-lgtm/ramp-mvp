// app/api/refresh-entities/route.ts
// Manually trigger AI refresh on specific employees and/or projects.
// Also called internally by nl-execute after changes are applied.

import { NextRequest, NextResponse } from 'next/server';
import { refreshEntities } from '@/lib/refresh-profiles';

export async function POST(request: NextRequest) {
  try {
    const { employeeIds = [], projectIds = [] } = await request.json() as {
      employeeIds?: string[];
      projectIds?: string[];
    };

    if (employeeIds.length === 0 && projectIds.length === 0) {
      return NextResponse.json({ error: 'No entity IDs provided' }, { status: 400 });
    }

    const result = await refreshEntities({ employeeIds, projectIds });

    return NextResponse.json({
      success: result.errors.length === 0,
      ...result,
    });
  } catch (error: any) {
    console.error('Refresh entities error:', error);
    return NextResponse.json({ error: 'Internal error', detail: error.message }, { status: 500 });
  }
}
