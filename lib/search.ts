import { prisma } from './db';

interface SearchFilters {
  query?: string;
  skills?: string[];
  startDate?: Date;
  endDate?: Date;
  minAllocation?: number;
  location?: string;
  companyGroup?: string;
  level?: string;
  practice?: string;
  roleFamily?: string;
}

export async function searchStaff(filters: SearchFilters) {
  const {
    query = '',
    skills: providedSkills,
    startDate = new Date(),
    endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    minAllocation = 0,
    location,
    companyGroup,
    level,
    practice,
    roleFamily,
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

    // Filter by company group if specified
    if (companyGroup) {
      results = results.filter(emp => emp.companyGroup === companyGroup);
    }

    // Filter by level if specified
    if (level) {
      results = results.filter(emp => emp.level.toLowerCase().includes(level.toLowerCase()));
    }

    // Filter by practice if specified
    if (practice) {
      results = results.filter(emp => emp.practice.toLowerCase().includes(practice.toLowerCase()));
    }

    // Filter by role family if specified
    if (roleFamily) {
      results = results.filter(emp => emp.roleFamily.toLowerCase().includes(roleFamily.toLowerCase()));
    }

    // Use LLM-provided skills if available, otherwise extract from query
    const skillKeywords = providedSkills && providedSkills.length > 0
      ? providedSkills
      : extractKeywords(query);
    const scoredResults = results.map(emp => {
      // Parse JSON string from database
      let empSkills: any[] = [];
      let empTools: any[] = [];
      let empCerts: string[] = [];
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
          s.name && s.name.toLowerCase().includes(lowerKeyword)
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
        const certMatch = empCerts.find((c: any) => {
          const certName = typeof c === 'string' ? c : c.name || '';
          return certName.toLowerCase().includes(lowerKeyword);
        });
        if (certMatch) {
          matchScore += 0.2;
          matchedSkills.push(typeof certMatch === 'string' ? certMatch : certMatch.name);
        }

        // Check role family and practice
        if (emp.roleFamily.toLowerCase().includes(lowerKeyword) ||
            emp.practice.toLowerCase().includes(lowerKeyword)) {
          matchScore += 0.15;
        }

        // Check title
        if (emp.title.toLowerCase().includes(lowerKeyword)) {
          matchScore += 0.1;
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
        rampName: emp.rampName,
        level: emp.level,
        title: emp.title,
        companyGroup: emp.companyGroup,
        roleFamily: emp.roleFamily,
        practice: emp.practice,
        location: emp.location,
        allocationSummary,
        matchedSkills: [...new Set(matchedSkills)],
        matchScore,
        whyMatched: `Matched: ${matchedSkills.slice(0, 3).join(', ') || 'Availability fit'}`,
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
  const commonWords = new Set([
    'find', 'someone', 'who', 'has', 'with', 'is', 'are', 'and', 'or',
    'the', 'a', 'an', 'in', 'at', 'by', 'for', 'of', 'to', 'percent',
    '%', 'free', 'available', 'allocated', 'can', 'could', 'need', 'looking',
    'search', 'people', 'person', 'employee', 'staff', 'team', 'member',
    'from', 'that', 'this', 'any', 'some', 'get', 'me', 'show',
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .slice(0, 10);
}
