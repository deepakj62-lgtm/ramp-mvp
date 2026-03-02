import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/llm';

const ENTITY_PROMPTS: Record<string, string> = {
  employee: `You are a resume/profile parser for a consulting firm staffing system. Parse the provided document and return ONLY valid JSON with EXACTLY this structure:

{
  "parsedData": {
    "name": "First Last",
    "email": "email@example.com",
    "title": "Senior Consultant",
    "level": "Senior",
    "companyGroup": "Linea Solutions",
    "businessUnit": "Delivery",
    "careerPath": "Consultant",
    "roleFamily": "BA",
    "practice": "Pension",
    "location": "US",
    "resumeText": "3-paragraph professional bio in third person, consulting-focused",
    "extractedSkills": {
      "skills": [{"name": "Skill Name", "yearsOfExp": 3}],
      "tools": [{"name": "Tool Name"}],
      "certifications": [{"name": "Cert Name"}]
    }
  },
  "pageLayout": {
    "tagline": "One-sentence specialist descriptor, e.g. 'OSCP-certified penetration tester with 7+ years'",
    "insight": "2-3 sentence paragraph about this person's value, expertise focus, and key strengths",
    "emphasis": "certifications OR skills OR tools OR experience (whichever is most distinctive)",
    "accentColor": "jade OR rust OR sea (rust for cyber/security, sea for data/analytics, jade for consulting/PM)",
    "keyStats": ["3-5 short stat chips, e.g. 'PMP certified', '10+ yrs pension', 'Canada-based'"]
  }
}

Guidelines:
- level: Associate | Consultant | Senior | Principal (infer from title/experience)
- companyGroup: Linea Solutions | Linea Solutions ULC | Linea Secure | ICON (infer from context, default Linea Solutions)
- businessUnit: Delivery | Cyber | Data
- careerPath: Consultant | Specialist
- roleFamily: BA | PM | Testing | OCM | TechAnalysis | Data | Cyber | Training
- practice: Pension | Insurance | WorkersComp | Benefits | CrossPractice | Cybersecurity
- location: US | Canada
- If a field cannot be determined, use a sensible default
- Return ONLY valid JSON. No markdown, no explanation.`,

  project: `You are a project document parser for a consulting firm. Parse the provided document (SOW, project charter, brief, etc.) and return ONLY valid JSON:

{
  "parsedData": {
    "name": "Client Abbreviation – Project Title",
    "clientName": "Full Client Name",
    "clientId": "ABBREVIATION",
    "engagementClass": "Client OR ULC OR Cyber OR ICON",
    "industryTag": "pension OR insurance OR workers_comp OR benefits OR cybersecurity OR data",
    "status": "Planning OR In Progress OR On Hold OR Closing OR Completed",
    "currentPhase": "Discovery OR Assessment OR Planning OR Requirements OR Implementation OR Testing OR UAT OR Go-Live OR Support",
    "description": "2-3 paragraph project overview",
    "startDate": "YYYY-MM-DD OR null",
    "endDate": "YYYY-MM-DD OR null",
    "accountExecutive": "Last, First OR ''",
    "engagementManager": "Last, First OR ''",
    "scopeCategories": ["assessment", "implementation", "data_conversion", "cybersecurity", "ocm"],
    "milestones": [{"title": "Milestone Name", "date": "YYYY-MM-DD", "status": "completed OR upcoming OR in_progress", "notes": ""}]
  },
  "pageLayout": {
    "tagline": "One-sentence project descriptor",
    "insight": "2-3 sentences about project scope, key risks, and current status",
    "accentColor": "jade OR rust OR sea",
    "keyStats": ["3-5 stat chips, e.g. 'In Progress', 'Q2 2026 delivery', '3 milestones']"
  }
}

Return ONLY valid JSON. No markdown, no explanation.`,

  client: `You are a client information parser for a consulting firm. Parse the provided document (client brief, RFP, engagement overview, etc.) and return ONLY valid JSON:

{
  "parsedData": {
    "clientName": "Full Official Client Name",
    "clientId": "SHORT_ABBREV",
    "sector": "pension OR insurance OR workers_comp OR benefits OR cybersecurity OR data OR government",
    "notes": "3-4 sentence overview of the client: what they do, why they engaged Linea, key context"
  },
  "pageLayout": {
    "tagline": "One-sentence client descriptor",
    "insight": "2-3 sentences about the client relationship, key engagement types, and strategic importance",
    "accentColor": "jade OR rust OR sea",
    "keyStats": ["3-5 stat chips about this client"]
  }
}

Return ONLY valid JSON. No markdown, no explanation.`,

  allocation: `You are a staffing plan parser. Parse the provided document (staffing plan, assignment sheet, etc.) and return ONLY valid JSON:

{
  "parsedData": {
    "employeeName": "Full Name (to look up)",
    "projectName": "Project Name or Code (to look up)",
    "roleOnProject": "PM OR BA OR Testing OR OCM OR DataAnalyst OR Cyber OR AIAdvisory OR Oversight",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "allocationPercent": 50
  },
  "pageLayout": {}
}

Return ONLY valid JSON. No markdown, no explanation.`,
};

export async function POST(request: NextRequest) {
  try {
    const { fileContent, entityType, context } = await request.json();

    if (!fileContent || !entityType) {
      return NextResponse.json({ error: 'fileContent and entityType are required' }, { status: 400 });
    }

    const prompt = ENTITY_PROMPTS[entityType];
    if (!prompt) {
      return NextResponse.json({ error: `Unknown entity type: ${entityType}` }, { status: 400 });
    }

    const capped = (fileContent as string).substring(0, 12000);

    const response = await chat([
      { role: 'system', content: prompt },
      {
        role: 'user',
        content: `Parse this ${entityType} document${context ? ` (context: ${JSON.stringify(context)})` : ''}:\n\n${capped}`,
      },
    ]);

    let result: { parsedData: object; pageLayout: object };
    try {
      const clean = response.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      result = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'Could not parse document. Please upload a plain text (.txt) file with clear structured information.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      parsedData: result.parsedData || {},
      pageLayout: result.pageLayout || {},
    });

  } catch (error) {
    console.error('Parse upload error:', error);
    return NextResponse.json({ error: 'Document parsing failed' }, { status: 500 });
  }
}
