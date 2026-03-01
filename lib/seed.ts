import { prisma } from './db';

const FAKE_CLIENTS = [
  { id: 'client-1', name: 'Pension Services Group' },
  { id: 'client-2', name: 'Workers Compensation Solutions Inc' },
  { id: 'client-3', name: 'Insurance Analytics Corp' },
  { id: 'client-4', name: 'Benefits Administration Ltd' },
  { id: 'client-5', name: 'Risk Management Services' },
  { id: 'client-6', name: 'Employee Benefits Plus' },
  { id: 'client-7', name: 'Actuarial Insights' },
  { id: 'client-8', name: 'Claims Processing Systems' },
  { id: 'client-9', name: 'Compliance & Audit Solutions' },
  { id: 'client-10', name: 'Data Analytics Group' },
];

const FAKE_PROJECTS = [
  { name: 'Pension System Migration', clientId: 'client-1', industry: 'pension' },
  { name: 'WC Claims Processing Overhaul', clientId: 'client-2', industry: 'workers_comp' },
  { name: 'Insurance Data Analytics', clientId: 'client-3', industry: 'insurance' },
  { name: 'Benefits Portal Redesign', clientId: 'client-4', industry: 'insurance' },
  { name: 'Risk Assessment Dashboard', clientId: 'client-5', industry: 'insurance' },
  { name: 'Claims Management System', clientId: 'client-2', industry: 'workers_comp' },
  { name: 'Actuarial Model Validation', clientId: 'client-7', industry: 'pension' },
  { name: 'Compliance Reporting Platform', clientId: 'client-9', industry: 'insurance' },
  { name: 'Data Warehouse Implementation', clientId: 'client-10', industry: 'insurance' },
  { name: 'Process Automation Initiative', clientId: 'client-1', industry: 'pension' },
  { name: 'API Integration Project', clientId: 'client-4', industry: 'insurance' },
  { name: 'Business Intelligence Setup', clientId: 'client-3', industry: 'insurance' },
  { name: 'Change Management Program', clientId: 'client-5', industry: 'workers_comp' },
  { name: 'Security Audit & Enhancement', clientId: 'client-9', industry: 'insurance' },
  { name: 'Training & Documentation', clientId: 'client-2', industry: 'workers_comp' },
  { name: 'Tableau Dashboard Development', clientId: 'client-10', industry: 'insurance' },
  { name: 'SQL Performance Tuning', clientId: 'client-1', industry: 'pension' },
  { name: 'Vitech Implementation', clientId: 'client-7', industry: 'pension' },
  { name: 'Sagitec Customization', clientId: 'client-2', industry: 'workers_comp' },
  { name: 'Legacy System Decommission', clientId: 'client-4', industry: 'insurance' },
];

const FIRST_NAMES = [
  'Nathan', 'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Lisa', 'Robert', 'Mary',
  'John', 'Patricia', 'William', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Barbara', 'Thomas', 'Elizabeth',
  'Christopher', 'Susan', 'Daniel', 'Karen', 'Matthew', 'Nancy', 'Anthony', 'Margaret', 'Donald', 'Sandra',
  'Steven', 'Ashley', 'Andrew', 'Kimberly', 'Edward', 'Donna', 'Brian', 'Carol', 'Ronald', 'Michelle',
  'Ryan', 'Amanda', 'Jacob', 'Melissa', 'Gary', 'Deborah', 'Nicholas', 'Stephanie', 'Eric', 'Rebecca',
  'Jonathan', 'Sharon', 'Stephen', 'Laura', 'Larry', 'Cynthia', 'Justin', 'Kathleen', 'Scott', 'Amy',
];

const LAST_NAMES = [
  'Haws', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
  'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson',
  'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis',
  'Robinson', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Peterson', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Reeves', 'Stewart', 'Morris', 'Morales', 'Meadows', 'Johny',
];

const LEVELS = ['Associate', 'Consultant', 'Senior', 'Principal'];
const LOCATIONS = ['US', 'Canada'];

const SKILL_OPTIONS = [
  { name: 'OCM (Organizational Change Management)', category: 'domain' },
  { name: 'BPI (Business Process Improvement)', category: 'domain' },
  { name: 'Project Management', category: 'domain' },
  { name: 'Requirements Gathering', category: 'domain' },
  { name: 'UAT Coordination', category: 'domain' },
  { name: 'Insurance Domain', category: 'domain' },
  { name: 'Workers Compensation', category: 'domain' },
  { name: 'Pension Administration', category: 'domain' },
  { name: 'Benefits Administration', category: 'domain' },
  { name: 'Claims Processing', category: 'domain' },
  { name: 'Actuarial Analysis', category: 'domain' },
  { name: 'Compliance & Audit', category: 'domain' },
  { name: 'SQL Server', category: 'technical' },
  { name: 'T-SQL Development', category: 'technical' },
  { name: 'Data Warehousing', category: 'technical' },
  { name: 'ETL Design', category: 'technical' },
  { name: 'Python', category: 'technical' },
  { name: 'C#/.NET', category: 'technical' },
  { name: 'Java Development', category: 'technical' },
  { name: 'API Development', category: 'technical' },
  { name: 'Tableau', category: 'tools' },
  { name: 'Power BI', category: 'tools' },
  { name: 'Qlik Sense', category: 'tools' },
  { name: 'Vitech', category: 'tools' },
  { name: 'Sagitec', category: 'tools' },
  { name: 'Workday', category: 'tools' },
  { name: 'SAP', category: 'tools' },
  { name: 'Salesforce', category: 'tools' },
  { name: 'Azure', category: 'tools' },
  { name: 'AWS', category: 'tools' },
  { name: 'Agile/Scrum', category: 'methodology' },
  { name: 'Waterfall', category: 'methodology' },
  { name: 'Data Analysis', category: 'technical' },
  { name: 'Statistical Analysis', category: 'technical' },
];

const CERTIFICATIONS = [
  'PMP',
  'ITIL',
  'Six Sigma',
  'CISSP',
  'AWS Solutions Architect',
  'Azure Administrator',
  'Tableau Desktop Specialist',
  'SQL Server Certification',
  'TOGAF',
  'Certified Data Professional',
];

function generateSyntheticResume(level: string, skills: any[]): string {
  const yearsExp = level === 'Associate' ? 3 : level === 'Consultant' ? 7 : level === 'Senior' ? 12 : 18;
  const skillTexts = skills.map(s => `${s.name} (${s.yearsOfExp || 2}-${s.yearsOfExp || 2 + 3} years)`);

  return `
PROFESSIONAL SUMMARY
Experienced ${level} with ${yearsExp} years in insurance, pension, and business process optimization. Proven expertise in ${skills.slice(0, 2).map(s => s.name).join(' and ')}.

PROFESSIONAL EXPERIENCE
Senior Consultant (2020-Present) - Various Engagements
- Led cross-functional teams in ${skills[0]?.name || 'process improvements'}
- Delivered ${skills[1]?.name || 'solutions'} for complex business challenges
- Managed stakeholder relationships and change initiatives

Consultant (2016-2020) - Project Delivery
- Implemented ${skills[0]?.name || 'systems'} and ${skills[1]?.name || 'processes'}
- Supported ${skills[2]?.name || 'technical'} implementations
- Coordinated UAT activities and training

Associate (2013-2016) - Business Analysis
- Gathered requirements and documented business processes
- Supported project delivery across multiple clients
- Participated in technical and functional testing

TECHNICAL SKILLS
${skillTexts.join('\n')}

CERTIFICATIONS & EDUCATION
${CERTIFICATIONS.slice(0, Math.floor(Math.random() * 3) + 1).map(c => `- ${c}`).join('\n')}
- Bachelor's Degree in Business Administration or equivalent

EXPERTISE AREAS
${skills.slice(0, 5).map(s => `- ${s.name}`).join('\n')}
  `.trim();
}

export async function seed() {
  console.log('Seeding database with synthetic data...');

  // Clear existing data
  await prisma.allocation.deleteMany();
  await prisma.feedbackTicket.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();

  // Create 30 projects
  const projects = [];
  for (const fakeProject of FAKE_PROJECTS) {
    const project = await prisma.project.create({
      data: {
        name: fakeProject.name,
        clientId: fakeProject.clientId,
        clientName: FAKE_CLIENTS.find(c => c.id === fakeProject.clientId)?.name || 'Unknown',
        industryTag: fakeProject.industry,
      },
    });
    projects.push(project);
  }

  console.log(`✓ Created ${projects.length} projects`);

  // Create 80 employees with resumes and skills
  const employees = [];
  for (let i = 0; i < 80; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    // Select 5-10 random skills
    const numSkills = Math.floor(Math.random() * 6) + 5;
    const selectedSkills = [];
    const skillSet = new Set();
    while (selectedSkills.length < numSkills && skillSet.size < SKILL_OPTIONS.length) {
      const idx = Math.floor(Math.random() * SKILL_OPTIONS.length);
      if (!skillSet.has(idx)) {
        skillSet.add(idx);
        selectedSkills.push({
          name: SKILL_OPTIONS[idx].name,
          yearsOfExp: level === 'Associate' ? 2 : level === 'Consultant' ? 5 : level === 'Senior' ? 10 : 15,
          confidence: Math.random() > 0.3 ? 'high' : 'medium',
        });
      }
    }

    const resumeText = generateSyntheticResume(level, selectedSkills);

    const employee = await prisma.employee.create({
      data: {
        name: `${firstName} ${lastName}`,
        nameAlt: `${lastName}, ${firstName}`,
        level,
        location,
        resumeText,
        extractedSkills: JSON.stringify({
          skills: selectedSkills,
          tools: selectedSkills.filter(s => SKILL_OPTIONS.find(o => o.name === s.name)?.category === 'tools'),
          certifications: CERTIFICATIONS.slice(0, Math.floor(Math.random() * 3) + 1),
        }),
      },
    });
    employees.push(employee);
  }

  console.log(`✓ Created ${employees.length} employees with resumes`);

  // Create ~150 allocations
  let allocationCount = 0;
  for (let i = 0; i < employees.length; i++) {
    const numAllocations = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numAllocations; j++) {
      const projectIdx = Math.floor(Math.random() * projects.length);
      const startMonth = Math.floor(Math.random() * 12);
      const duration = Math.floor(Math.random() * 3) + 1;
      const startDate = new Date(2026, startMonth, 1);
      const endDate = new Date(2026, startMonth + duration, 30);
      const allocationPercent = [50, 75, 100][Math.floor(Math.random() * 3)];

      await prisma.allocation.create({
        data: {
          employeeId: employees[i].id,
          projectId: projects[projectIdx].id,
          startDate,
          endDate,
          allocationPercent,
        },
      });
      allocationCount++;
    }
  }

  console.log(`✓ Created ${allocationCount} allocations`);

  // Create some sample feedback tickets
  const sampleFeedback = [
    {
      type: 'feature',
      title: 'Add saved search filters',
      rawText: 'It would be great to save my common search filters like "50% free insurance people" so I don\'t have to enter them every time',
    },
    {
      type: 'bug',
      title: 'Search results not showing all matches',
      rawText: 'When I search for SQL skills, the results seem incomplete. I know more people have SQL than what\'s showing.',
    },
  ];

  for (const feedback of sampleFeedback) {
    await prisma.feedbackTicket.create({
      data: {
        ...feedback,
        chatTranscript: `User: ${feedback.rawText}`,
        structuredJson: JSON.stringify({
          problem: feedback.rawText,
          type: feedback.type,
          priority: 2,
        }),
        status: 'new',
      },
    });
  }

  console.log('✓ Seeding complete!');
}

// Run if called directly
if (require.main === module) {
  seed()
    .catch(err => {
      console.error('Seed error:', err);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}
