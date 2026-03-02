import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding showcase profiles...\n');

  // ─── Kevin Lynch — Chief Sales Officer ─────────────────────────────
  const kevinLayout = {
    profileType: 'executive',
    tagline: 'Chief Sales Officer — architect of Linea\'s most strategic client relationships',
    insight: 'Kevin owns Linea\'s enterprise growth strategy across North America. With $40M+ in managed engagements and executive-level access at 15+ pension and insurance funds, he bridges delivery excellence with client trust. His background as a former pension fund CFO gives him rare credibility on both sides of the table.',
    accentColor: 'jade',
    keyStats: ['CSO since 2018', '$40M+ managed', '15+ enterprise accounts', '96% client retention'],
    primaryMetrics: [
      { label: 'Accounts Managed', value: '15+' },
      { label: 'Client Retention', value: '96%' },
      { label: 'Years in Industry', value: '22' },
      { label: 'Avg Engagement', value: '4.1 yrs' },
    ],
    sections: ['metrics', 'bio', 'skills'],
    showAllocationTimeline: false,
    statusBanner: null,
  };

  const kevinSkills = {
    skills: [
      { name: 'Executive Sales Strategy', yearsOfExp: 15 },
      { name: 'C-Suite Relationship Management', yearsOfExp: 18 },
      { name: 'Pension & Benefits Domain', yearsOfExp: 22 },
      { name: 'Enterprise Account Management', yearsOfExp: 15 },
      { name: 'Business Development', yearsOfExp: 18 },
      { name: 'Contract Negotiation', yearsOfExp: 15 },
    ],
    tools: [{ name: 'Salesforce' }, { name: 'HubSpot' }, { name: 'Microsoft Dynamics' }],
    certifications: ['Certified Public Accountant (CPA)', 'PMP — Project Management Professional'],
  };

  const kevinBio = `Kevin Lynch is Chief Sales Officer at Linea Solutions, where he leads the firm's revenue strategy and enterprise account portfolio across North America. Since joining Linea in 2018, Kevin has grown the firm's public sector pension and insurance practice by more than 60%, establishing Linea as a trusted partner to some of the largest retirement systems in the United States and Canada.

Before Linea, Kevin served as CFO at a $4.2B public pension fund for nine years, giving him firsthand experience with the operational, regulatory, and technology challenges facing plan administrators. That perspective informs his consultative approach: he focuses on long-term partnership rather than transactional selling, and his client relationships routinely span five to ten years.

Kevin holds a CPA designation and an MBA from the Wharton School. He is a frequent speaker at NCPERS, NASRA, and PEBA conferences, and serves on the advisory board of the International Foundation of Employee Benefit Plans.`;

  await prisma.employee.updateMany({
    where: { rampName: 'Lynch, Kevin' },
    data: {
      pageLayout: JSON.stringify(kevinLayout),
      extractedSkills: JSON.stringify(kevinSkills),
      resumeText: kevinBio,
    },
  });
  const kevinResult = await prisma.employee.findFirst({ where: { rampName: 'Lynch, Kevin' }, select: { id: true } });
  console.log(`✓ Kevin Lynch (${kevinResult?.id}) — executive profile seeded`);

  // ─── Marcus Webb — Principal Account Executive ─────────────────────
  const marcusLayout = {
    profileType: 'sales',
    tagline: 'Principal Account Executive — 18 years turning pension challenges into Linea partnerships',
    insight: 'Marcus combines deep public-sector domain knowledge with a consultative sales style that consistently converts single engagements into multi-year strategic relationships. His territory spans 15 Eastern US states and he has personally overseen $300M+ in aggregate project value. Former Deputy Director of a regional pension fund — he knows the client\'s problems from the inside.',
    accentColor: 'rust',
    keyStats: ['$300M+ engagements overseen', '15-state territory', '18 years experience', 'Former pension fund Deputy Director'],
    primaryMetrics: [
      { label: 'Territory', value: 'Eastern US (15 states)' },
      { label: 'Deals Closed (LTM)', value: '7' },
      { label: 'Win Rate', value: '68%' },
      { label: 'Avg Deal Size', value: '$1.4M' },
    ],
    sections: ['metrics', 'skills', 'bio'],
    showAllocationTimeline: false,
    statusBanner: null,
  };

  const marcusSkills = {
    skills: [
      { name: 'Consultative Selling', yearsOfExp: 18 },
      { name: 'Business Development', yearsOfExp: 18 },
      { name: 'RFP Strategy & Response', yearsOfExp: 13 },
      { name: 'C-Level Relationship Management', yearsOfExp: 18 },
      { name: 'Account Management', yearsOfExp: 11 },
      { name: 'Contract Negotiation', yearsOfExp: 13 },
      { name: 'Territory Planning', yearsOfExp: 13 },
    ],
    tools: [{ name: 'Salesforce CRM' }, { name: 'HubSpot' }, { name: 'Microsoft Dynamics' }],
    certifications: ['PMP — Project Management Professional', 'MBA — University of Michigan Ross School of Business'],
  };

  await prisma.employee.updateMany({
    where: { rampName: 'Webb, Marcus' },
    data: {
      pageLayout: JSON.stringify(marcusLayout),
      extractedSkills: JSON.stringify(marcusSkills),
    },
  });
  const marcusResult = await prisma.employee.findFirst({ where: { rampName: 'Webb, Marcus' }, select: { id: true } });
  console.log(`✓ Marcus Webb (${marcusResult?.id}) — sales profile seeded`);

  // ─── Gregory Pike — Senior DBA ─────────────────────────────────────
  const gregLayout = {
    profileType: 'technical',
    tagline: 'Senior DBA — zero-downtime migrations for mission-critical pension data systems',
    insight: 'Gregory is ICON\'s go-to database architect for high-stakes data conversion engagements. His 23 production migrations have a perfect zero-downtime record. He designs SQL Server environments capable of processing multi-million-record loads in sub-hour timeframes through careful index design, parallelism configuration, and query optimization.',
    accentColor: 'sea',
    keyStats: ['Microsoft Certified Azure DBA', '23 zero-downtime migrations', '99.9% uptime SLA', '15 yrs SQL Server'],
    primaryMetrics: [
      { label: 'DB Migrations', value: '23' },
      { label: 'Uptime SLA', value: '99.9%' },
      { label: 'Largest Dataset', value: '180M rows' },
      { label: 'Current Allocation', value: '80%' },
    ],
    sections: ['certifications', 'metrics', 'skills', 'allocations', 'bio'],
    showAllocationTimeline: true,
    statusBanner: null,
  };

  const gregSkills = {
    skills: [
      { name: 'SQL Server Administration', yearsOfExp: 15 },
      { name: 'Database Performance Tuning', yearsOfExp: 12 },
      { name: 'High Availability & Disaster Recovery', yearsOfExp: 10 },
      { name: 'ETL Optimization', yearsOfExp: 12 },
      { name: 'Data Architecture', yearsOfExp: 10 },
      { name: 'T-SQL Development', yearsOfExp: 15 },
      { name: 'Cloud Database Migration', yearsOfExp: 6 },
    ],
    tools: [
      { name: 'SQL Server' }, { name: 'SSIS' }, { name: 'Azure SQL' },
      { name: 'AWS RDS' }, { name: 'Redgate' }, { name: 'SSMS' }, { name: 'dbt' },
    ],
    certifications: [
      'Microsoft Certified: Azure Database Administrator Associate',
      'Microsoft Certified: Data Engineer Associate',
      'AWS Certified Database — Specialty',
    ],
  };

  const gregBio = `Gregory Pike is a Senior Database Administrator at ICON with 15 years of experience managing and optimizing SQL Server environments for data-intensive projects. He serves as ICON's DBA on all major data conversion engagements, responsible for database architecture decisions, performance tuning, and high availability setup.

Gregory has designed database environments capable of processing multi-million-record conversion loads in sub-hour timeframes through careful index design, parallelism configuration, and query optimization. His 23 production migrations across pension, insurance, and workers compensation systems maintain a perfect zero-downtime record — a direct result of his rigorous pre-migration validation and rollback planning.

His background in Azure SQL and AWS RDS makes him equally capable in cloud-hosted and hybrid environments. Gregory is the go-to escalation resource for any data pipeline performance issue on ICON engagements.`;

  await prisma.employee.updateMany({
    where: { rampName: 'Pike, Gregory' },
    data: {
      pageLayout: JSON.stringify(gregLayout),
      extractedSkills: JSON.stringify(gregSkills),
      resumeText: gregBio,
    },
  });
  const gregResult = await prisma.employee.findFirst({ where: { rampName: 'Pike, Gregory' }, select: { id: true } });
  console.log(`✓ Gregory Pike (${gregResult?.id}) — technical profile seeded`);

  console.log('\nAll showcase profiles seeded successfully.');
  console.log('\nProfile URLs:');
  console.log(`  Kevin Lynch:  /person/emp-kevin-lynch`);
  console.log(`  Marcus Webb:  /person/${marcusResult?.id}`);
  console.log(`  Gregory Pike: /person/${gregResult?.id}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
