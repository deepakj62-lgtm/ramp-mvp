import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { chat } from '@/lib/llm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Extract text based on file type
    const fileName = file.name.toLowerCase();
    let rawText = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      rawText = data.text;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else {
      rawText = buffer.toString('utf-8');
    }

    const resumeInput = rawText.substring(0, 12000); // cap token usage

    if (!resumeInput.trim()) {
      return NextResponse.json({ error: 'File appears empty or unreadable' }, { status: 400 });
    }

    // Ask Claude to parse the resume and return structured data + page layout
    const extractResponse = await chat([
      {
        role: 'system',
        content: `You are a resume parser for a consulting firm staffing system. Parse the provided resume and return a JSON object with EXACTLY this structure:

{
  "resumeText": "3-paragraph professional bio written in third person, highlighting domain expertise and key accomplishments. Make it compelling and specific.",
  "extractedSkills": {
    "skills": [{"name": "Skill Name", "yearsOfExp": 3}],
    "tools": [{"name": "Tool or Platform Name"}],
    "certifications": [{"name": "Certification Name"}]
  },
  "pageLayout": {
    "profileType": "consultant",
    "tagline": "One punchy sentence — their single best credential or specialty",
    "insight": "2-3 sentences about this person's unique value, expertise, and what makes them stand out",
    "accentColor": "jade",
    "keyStats": ["stat chip 1", "stat chip 2", "stat chip 3"],
    "showAllocationTimeline": true,
    "sections": ["allocations", "skills", "bio"],
    "primaryMetrics": [],
    "statusBanner": null
  }
}

PROFILE TYPE RULES — choose one profileType and configure accordingly:

"consultant" (BA, PM, OCM, Testing, Requirements, Change Management):
  showAllocationTimeline: true
  sections: ["allocations", "skills", "bio"]
  accentColor: "jade"
  primaryMetrics: []

"specialist" (CISSP, OSCP, CBAP, actuarial, deep domain expert with certifications):
  showAllocationTimeline: true
  sections: ["certifications", "allocations", "skills", "bio"]
  accentColor: "rust" for cyber/security, "jade" for domain certs
  primaryMetrics: []

"executive" (CEO, COO, VP, Director, Managing Director, President):
  showAllocationTimeline: false
  sections: ["metrics", "bio", "skills"]
  accentColor: "jade"
  primaryMetrics: [
    {"label": "Tenure", "value": "e.g. 12 years"},
    {"label": "Team Size", "value": "e.g. 40 staff"},
    {"label": "P&L", "value": "e.g. $15M portfolio"},
    {"label": "Focus", "value": "e.g. Pension & Benefits"}
  ]

"sales" (Account Executive, Business Development, Client Relations, Sales Manager):
  showAllocationTimeline: false
  sections: ["metrics", "skills", "bio"]
  accentColor: "sea"
  primaryMetrics: [
    {"label": "Territory", "value": "e.g. Eastern Canada"},
    {"label": "Sector Focus", "value": "e.g. Pension & Insurance"},
    {"label": "Client Type", "value": "e.g. Public Sector"},
    {"label": "Approach", "value": "e.g. Consultative selling"}
  ]

"manager" (Engagement Manager, Senior EM, Program Manager, Principal EM):
  showAllocationTimeline: true
  sections: ["metrics", "allocations", "skills", "bio"]
  accentColor: "jade"
  primaryMetrics: [
    {"label": "Active Projects", "value": "count from context"},
    {"label": "Team Led", "value": "e.g. 8 consultants"},
    {"label": "Domain", "value": "e.g. Pension Systems"}
  ]

"technical" (Developer, Data Engineer, Architect, DevOps, Integration):
  showAllocationTimeline: true
  sections: ["skills", "allocations", "bio"]
  accentColor: "sea"
  primaryMetrics: []

"support" (HR, Finance, Admin, Operations, internal non-billable):
  showAllocationTimeline: false
  sections: ["metrics", "bio", "skills"]
  accentColor: "jade"
  primaryMetrics: [
    {"label": "Department", "value": "e.g. Human Resources"},
    {"label": "Function", "value": "e.g. Talent Acquisition"}
  ]

GUIDELINES:
- skills: domain expertise, methodologies (e.g. Pension Admin, UAT, Requirements Gathering, OCM)
- tools: specific software (e.g. Vitech V3, Tableau, Jira, SAP)
- certifications: credentials (e.g. PMP, CISSP, OSCP, CBAP, CPA)
- keyStats: 3-5 chips like "PMP certified", "12 yrs pension", "CBAP holder", "Canada-based"
- primaryMetrics values: estimate from resume context; be specific and credible
- statusBanner: only set if something notable (e.g. {"type":"info","message":"Available from Q3 2026"}) otherwise null

Return ONLY valid JSON. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Parse this resume for employee "${employee.name}" (${employee.title}):\n\n${resumeInput}`,
      },
    ]);

    let parsed: { resumeText?: string; extractedSkills?: object; pageLayout?: object };
    try {
      const clean = extractResponse.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'Could not parse resume. Please upload a plain text (.txt) file.' },
        { status: 422 }
      );
    }

    // Update employee record including pageLayout
    await prisma.employee.update({
      where: { id },
      data: {
        resumeText: parsed.resumeText || employee.resumeText,
        extractedSkills: JSON.stringify(parsed.extractedSkills || {}),
        pageLayout: JSON.stringify(parsed.pageLayout || {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Resume processed successfully. Profile for ${employee.name} has been updated with new skills, bio, and AI insight.`,
      extractedSkills: parsed.extractedSkills,
      pageLayout: parsed.pageLayout,
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: 'Resume processing failed' }, { status: 500 });
  }
}
