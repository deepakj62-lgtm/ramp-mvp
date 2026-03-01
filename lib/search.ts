import { prisma } from './db';

interface SearchFilters {
  query?: string;
  startDate?: Date;
  endDate?: Date;
  minAllocation?: number;
  location?: string;
}

export async function searchStaff(filters: SearchFilters) {
  const {
    query = '',
    startDate = new Date(),
    endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    minAllocation = 0,
    location,
  } = filters;

  try {
    // Get all employees
    const employees = await prisma.employee.findMany();

    // Get all allocations in the date range
    const allocations = await prisma.allocation.findMany({
      where: {
        endDate: { gte: startDate },
        startDate: { lte: endDate },
      },
      include: { employee: true },
    });

    // Calculate available allocation per employee during the window
    const employeeAllocation: Record<string, number> = {};
    for (const emp of employees) {
      const empAllocations = allocations.filter(a => a.employeeId === emp.id);
      let totalAllocation = 0;
      for (const alloc of empAllocations) {
        totalAllocation += alloc.allocationPercent;
      }
      employeeAllocation[emp.id] = Math.max(0, 100 - totalAllocation);
    }

    // Filter by availability
    let results = employees.filter(emp => {
      const availablePct = employeeAllocation[emp.id] || 0;
      return availablePct >= minAllocation;
    });

    // Filter by location if specified
    if (location) {
      results = results.filter(emp => emp.location === location);
    }

    // Score and filter by skills if query contains skill keywords
    const skillKeywords = extractKeywords(query);
    const scoredResults = results.map(emp => {
      // Parse JSON string from database
      let empSkills = [];
      let empTools = [];
      let empCerts = [];
      try {
        const extractedSkills = typeof emp.extractedSkills === 'string'
          ? JSON.parse(emp.extractedSkills)
          : emp.extractedSkills;
        empSkills = extractedSkills?.skills || [];
        empTools = extractedSkills?.tools || [];
        empCerts = extractedSkills?.certifications || [];
      } catch (e) {
        // Fallback if parsing fails
      }

      let matchScore = 0;
      const matchedSkills: string[] = [];

      // Score based on skill matches
      for (const keyword of skillKeywords) {
        const lowerKeyword = keyword.toLowerCase();

        // Check skills
        const skillMatch = empSkills.find((s: any) =>
          s.name.toLowerCase().includes(lowerKeyword)
        );
        if (skillMatch) {
          matchScore += 0.3;
          matchedSkills.push(skillMatch.name);
        }

        // Check tools
        const toolMatch = empTools.find((t: any) => {
          const toolName = typeof t === 'string' ? t : t.name;
          return toolName && toolName.toLowerCase().includes(lowerKeyword);
        });
        if (toolMatch) {
          matchScore += 0.2;
          const toolName = typeof toolMatch === 'string' ? toolMatch : toolMatch.name;
          matchedSkills.push(toolName);
        }

        // Check certs
        const certMatch = empCerts.find((c: string) =>
          c.toLowerCase().includes(lowerKeyword)
        );
        if (certMatch) {
          matchScore += 0.2;
          matchedSkills.push(certMatch);
        }

        // Check resume text
        if (emp.resumeText.toLowerCase().includes(lowerKeyword)) {
          matchScore += 0.1;
        }
      }

      // Normalize score to 0-1
      matchScore = Math.min(1, matchScore / Math.max(1, skillKeywords.length));

      // If no skills in query, use basic availability score
      if (skillKeywords.length === 0) {
        matchScore = employeeAllocation[emp.id] / 100;
      }

      const allocationSummary = `${employeeAllocation[emp.id]}% available`;

      return {
        id: emp.id,
        name: emp.name,
        level: emp.level,
        location: emp.location,
        allocationSummary,
        matchedSkills: [...new Set(matchedSkills)],
        matchScore,
        whyMatched: `Matched because: ${matchedSkills.slice(0, 3).join(', ') || 'Availability fit'}`,
      };
    });

    // Sort by match score and return top 20
    return scoredResults
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

function extractKeywords(query: string): string[] {
  // Remove common words and extract potential skill/tool keywords
  const commonWords = new Set([
    'find',
    'someone',
    'who',
    'has',
    'with',
    'is',
    'are',
    'and',
    'or',
    'the',
    'a',
    'an',
    'in',
    'at',
    'by',
    'for',
    'of',
    'to',
    'percent',
    '%',
    'free',
    'available',
    'allocated',
    'can',
    'could',
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .slice(0, 10); // Limit to first 10 keywords
}
