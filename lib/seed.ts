import { prisma } from './db';

// ─── FICTIONAL CLIENTS ───────────────────────────────────────────────────────
const CLIENTS = [
  // US Pension funds (fictional names)
  { id: 'c-cprs',    name: 'Cascade Public Retirement System (CPRS)',              sector: 'pension',      country: 'US' },
  { id: 'c-gltera',  name: 'Great Lakes Teachers Retirement Association (GLTERA)', sector: 'pension',      country: 'US' },
  { id: 'c-sdera',   name: 'Sunbelt District Employees Retirement Association (SDERA)', sector: 'pension', country: 'US' },
  { id: 'c-nwpers',  name: 'Northwest Public Employees Retirement System (NWPERS)',sector: 'pension',      country: 'US' },
  { id: 'c-hlpf',    name: 'Heartland Laborers Pension Fund (HLPF)',               sector: 'pension',      country: 'US' },
  { id: 'c-brcera',  name: 'Blue Ridge County Employees Retirement Association (BRCERA)', sector: 'pension', country: 'US' },
  { id: 'c-gppers',  name: 'Great Plains Public Employees Retirement System (GPPERS)', sector: 'pension',  country: 'US' },
  { id: 'c-rmfpf',   name: 'Rocky Mountain First Responders Pension Fund (RMFPF)', sector: 'pension',     country: 'US' },
  { id: 'c-nepers',  name: 'New England Public Employees Retirement System (NEPERS)', sector: 'pension',  country: 'US' },
  { id: 'c-deltapf', name: 'Delta Region Teachers Pension Fund (DTPF)',             sector: 'pension',     country: 'US' },
  // Canadian pension & benefits (fictional)
  { id: 'c-prppb',   name: 'Prairie Region Public Pension Board (PRPPB)',           sector: 'pension',     country: 'CA' },
  { id: 'c-maritpf', name: 'Maritime Provinces Teachers Pension Fund (MPTPF)',      sector: 'pension',     country: 'CA' },
  { id: 'c-nortpp',  name: 'Northern Territories Pension Plan (NTPP)',              sector: 'pension',     country: 'CA' },
  { id: 'c-capebp',  name: 'Capital Region Employee Benefits Plan (CAPEBP)',        sector: 'benefits',    country: 'CA' },
  { id: 'c-westpf',  name: 'Western Canada Municipal Pension Fund (WCMPF)',         sector: 'pension',     country: 'CA' },
  // Workers Compensation (fictional)
  { id: 'c-nwwsb',   name: 'Northwest Workers Safety Board (NWWSB)',               sector: 'workers_comp', country: 'CA' },
  { id: 'c-gpwcf',   name: 'Great Plains Workers Compensation Fund (GPWCF)',        sector: 'workers_comp', country: 'CA' },
  { id: 'c-lakeswcb', name: 'Lakeside Workers Compensation Board (LWCB)',           sector: 'workers_comp', country: 'CA' },
  { id: 'c-midwcb',  name: 'Midlands Workers Compensation Board (MWCB)',            sector: 'workers_comp', country: 'US' },
  // Insurance (fictional)
  { id: 'c-tsmf',    name: 'Tri-State Medical Liability Fund (TSMF)',               sector: 'insurance',   country: 'US' },
  { id: 'c-nprisk',  name: 'Northern Plains Risk Management Group (NPRM)',          sector: 'insurance',   country: 'US' },
  { id: 'c-harbins',  name: 'Harbour Insurance Services Ltd (HISL)',                sector: 'insurance',   country: 'CA' },
  // Cybersecurity clients (fictional)
  { id: 'c-peaknet', name: 'Peakline Network Solutions (PNS)',                      sector: 'cyber',       country: 'US' },
  { id: 'c-ridgefs', name: 'Ridgecrest Financial Services (RFS)',                   sector: 'cyber',       country: 'US' },
  { id: 'c-montpb',  name: 'Montrose Public Benefit Corp (MPBC)',                   sector: 'cyber',       country: 'CA' },
  // Vendors / ecosystem
  { id: 'c-nexgen',  name: 'Nexgen Benefits Systems',                               sector: 'vendor',      country: 'US' },
  { id: 'c-pinnacle', name: 'Pinnacle Solutions Group',                             sector: 'vendor',      country: 'US' },
];

// ─── PROJECT COUNTER ─────────────────────────────────────────────────────────
let prjCounter = 1000;
let asgnCounter = 5000;
function nextPrjCode() { return `PRJ-${String(prjCounter++).padStart(6, '0')}`; }
function nextAsgnCode() { return `AS-${String(asgnCounter++).padStart(5, '0')}`; }

function d(y: number, m: number, day: number) { return new Date(y, m - 1, day); }

// ─── PROJECTS ────────────────────────────────────────────────────────────────
const PROJECTS = [
  // ── Linea Solutions (US) – Pension ──────────────────────────────────────
  {
    code: nextPrjCode(), clientId: 'c-cprs',
    name: 'CPRS – PAS Modernization Roadmap & Procurement',
    ae: 'Webb, Marcus', em: 'Kowalski, Diana', cls: 'Client', industry: 'pension',
    scope: 'assessment,roadmap,procurement',
    status: 'In Progress', currentPhase: 'Requirements',
    startDate: d(2025, 9, 1), endDate: d(2026, 6, 30),
    description: `Cascade Public Retirement System engaged Linea to lead a comprehensive modernization effort for their Pension Administration System (PAS). The current legacy platform dates to 2003 and no longer meets the operational demands of a membership base that has grown 40% over the past decade.

Linea is delivering a phased engagement: first conducting a Current State Assessment covering all business processes, data quality, and integration points; then producing a Future State Roadmap aligned to CPRS's five-year strategic plan; and finally providing procurement support including RFP development, vendor demonstrations, and evaluation scoring.

The engagement targets a June 2026 completion for all three phases, after which CPRS will be positioned to award an implementation contract to a qualified PAS vendor.`,
    milestones: JSON.stringify([
      { title: 'Kickoff & Stakeholder Interviews', date: '2025-09-15', status: 'Completed', notes: 'All 18 stakeholder interviews completed on schedule.' },
      { title: 'Current State Assessment Report', date: '2025-12-01', status: 'Completed', notes: 'Delivered 140-page assessment report. Client accepted with minor revisions.' },
      { title: 'Future State Roadmap Draft', date: '2026-02-28', status: 'Completed', notes: 'Roadmap approved by CPRS board Feb 20.' },
      { title: 'RFP Document Finalized', date: '2026-04-15', status: 'In Progress', notes: 'First draft under client review.' },
      { title: 'Vendor Demos & Scoring', date: '2026-06-01', status: 'Upcoming', notes: 'Scheduled for three vendors.' },
      { title: 'Procurement Award Recommendation', date: '2026-06-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-gltera',
    name: 'GLTERA – Implementation Oversight Phase 3',
    ae: 'Webb, Marcus', em: 'Mehta, Priya', cls: 'Client', industry: 'pension',
    scope: 'implementation,oversight,testing',
    status: 'In Progress', currentPhase: 'UAT',
    startDate: d(2025, 3, 1), endDate: d(2026, 8, 31),
    description: `Great Lakes Teachers Retirement Association is midway through a full PAS replacement using Vitech's V3 platform. Linea is engaged as independent implementation oversight, providing a dedicated team to monitor vendor deliverables, facilitate testing, and protect GLTERA's interests throughout the project lifecycle.

Linea's oversight responsibilities include reviewing vendor configuration documentation, facilitating business user acceptance testing (UAT), tracking defect resolution, and verifying data migration accuracy. The team works closely with GLTERA's internal project management office and the Vitech implementation team.

Phase 3 focuses on UAT and parallel processing, with go-live planned for Q3 2026.`,
    milestones: JSON.stringify([
      { title: 'Phase 3 Kickoff', date: '2026-01-06', status: 'Completed', notes: 'UAT planning session completed.' },
      { title: 'UAT Test Scripts Approved', date: '2026-02-14', status: 'Completed', notes: '1,200 test scripts finalized.' },
      { title: 'UAT Cycle 1 Complete', date: '2026-03-31', status: 'Completed', notes: '94% pass rate; 71 defects logged.' },
      { title: 'UAT Cycle 2 Complete', date: '2026-05-15', status: 'In Progress', notes: 'Cycle 2 began May 5; tracking 30 open defects.' },
      { title: 'Parallel Processing Window', date: '2026-07-01', status: 'Upcoming', notes: 'Two-month parallel run planned.' },
      { title: 'Go-Live', date: '2026-08-31', status: 'Upcoming', notes: 'Target date pending UAT completion.' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-sdera',
    name: 'SDERA – Current State Assessment',
    ae: 'Webb, Marcus', em: 'Kowalski, Diana', cls: 'Client', industry: 'pension',
    scope: 'assessment',
    status: 'In Progress', currentPhase: 'Assessment',
    startDate: d(2026, 1, 6), endDate: d(2026, 5, 30),
    description: `Sunbelt District Employees Retirement Association is exploring options to replace their aging benefits administration platform. Linea has been engaged to perform a targeted Current State Assessment covering member lifecycle workflows, reporting capabilities, and system integration architecture.

The deliverable is a comprehensive assessment report with gap analysis, risk rating of the current system, and high-level vendor market comparison. The engagement is scoped at five months with a small team of two to three consultants.`,
    milestones: JSON.stringify([
      { title: 'Discovery Workshops', date: '2026-01-30', status: 'Completed', notes: 'Eight process workshops completed across four departments.' },
      { title: 'Data Inventory & Quality Review', date: '2026-02-28', status: 'Completed', notes: 'Data quality issues documented; 22 critical gaps identified.' },
      { title: 'Draft Assessment Report', date: '2026-04-15', status: 'In Progress', notes: 'Report drafting underway; 60% complete.' },
      { title: 'Client Review & Finalization', date: '2026-05-15', status: 'Upcoming', notes: '' },
      { title: 'Final Report Delivery', date: '2026-05-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-hlpf',
    name: 'HLPF – Strategic Planning & Procurement Support',
    ae: 'Webb, Marcus', em: 'Reyes, Carlos', cls: 'Client', industry: 'pension',
    scope: 'assessment,roadmap,procurement',
    status: 'In Progress', currentPhase: 'Planning',
    startDate: d(2025, 11, 1), endDate: d(2026, 9, 30),
    description: `Heartland Laborers Pension Fund is a mid-sized union pension plan seeking to modernize their member services and benefit calculation platforms. Linea is providing strategic planning and procurement advisory support to guide HLPF through a structured vendor selection process.

The engagement covers stakeholder alignment workshops, business requirements documentation, market scan of qualified pension administration vendors, RFP authoring, and evaluation facilitation. HLPF's board has approved a budget envelope for the modernization initiative and Linea is helping them achieve best value through a rigorous procurement.`,
    milestones: JSON.stringify([
      { title: 'Project Charter Approved', date: '2025-11-15', status: 'Completed', notes: '' },
      { title: 'Business Requirements Workshops', date: '2026-01-31', status: 'Completed', notes: '14 workshops; 340 requirements captured.' },
      { title: 'Market Scan Report', date: '2026-03-15', status: 'Completed', notes: 'Six vendors evaluated and short-listed to three.' },
      { title: 'RFP Issued to Market', date: '2026-04-30', status: 'In Progress', notes: 'RFP issued April 28; proposals due June 1.' },
      { title: 'Proposal Evaluation', date: '2026-06-30', status: 'Upcoming', notes: '' },
      { title: 'Award Recommendation', date: '2026-09-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-gppers',
    name: 'GPPERS – PAS Implementation Support',
    ae: 'Webb, Marcus', em: 'Kowalski, Diana', cls: 'Client', industry: 'pension',
    scope: 'implementation,ocm,testing',
    status: 'In Progress', currentPhase: 'Implementation',
    startDate: d(2025, 6, 1), endDate: d(2027, 3, 31),
    description: `Great Plains Public Employees Retirement System awarded Linea an implementation support contract to assist with their Sagitec Neospin deployment. Linea's team is embedded alongside the vendor and client project team to provide business analysis support, OCM strategy execution, and quality assurance testing leadership.

Linea is responsible for all business process documentation (as-is and to-be), training strategy and materials, and UAT coordination. The implementation spans 22 months covering all benefit types managed by GPPERS including defined benefit, defined contribution, and retiree health.`,
    milestones: JSON.stringify([
      { title: 'Configuration Complete – Retirement Module', date: '2025-10-31', status: 'Completed', notes: '' },
      { title: 'Configuration Complete – Contribution Module', date: '2026-01-31', status: 'Completed', notes: '' },
      { title: 'Testing Phase 1 (SIT)', date: '2026-03-31', status: 'Completed', notes: '98.2% pass rate achieved.' },
      { title: 'Training Materials Draft', date: '2026-05-15', status: 'In Progress', notes: 'Module 1-4 complete; modules 5-8 in draft.' },
      { title: 'Configuration Complete – Health Module', date: '2026-06-30', status: 'Upcoming', notes: '' },
      { title: 'UAT Start', date: '2026-09-01', status: 'Upcoming', notes: '' },
      { title: 'Go-Live', date: '2027-03-31', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-nepers',
    name: 'NEPERS – RFP & Vendor Selection',
    ae: 'Webb, Marcus', em: 'Mehta, Priya', cls: 'Client', industry: 'pension',
    scope: 'procurement,assessment',
    status: 'In Progress', currentPhase: 'Assessment',
    startDate: d(2026, 2, 1), endDate: d(2026, 10, 31),
    description: `New England Public Employees Retirement System has retained Linea to lead their vendor selection process for a new pension administration platform. The engagement follows a previous Linea current state assessment completed in 2024.

Linea's scope includes finalization of functional requirements, RFP development and issuance, vendor demo facilitation, reference check coordination, scoring, and award recommendation. NEPERS serves approximately 80,000 active and retired members across six New England states.`,
    milestones: JSON.stringify([
      { title: 'Requirements Validation', date: '2026-02-28', status: 'Completed', notes: '' },
      { title: 'RFP Developed', date: '2026-04-01', status: 'In Progress', notes: 'Drafting underway; 75% complete.' },
      { title: 'RFP Issued', date: '2026-05-01', status: 'Upcoming', notes: '' },
      { title: 'Proposals Received', date: '2026-06-15', status: 'Upcoming', notes: '' },
      { title: 'Vendor Demos', date: '2026-07-31', status: 'Upcoming', notes: '' },
      { title: 'Award Recommendation', date: '2026-10-31', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-rmfpf',
    name: 'RMFPF – Business Transformation Phase 1',
    ae: 'Webb, Marcus', em: 'Reyes, Carlos', cls: 'Client', industry: 'pension',
    scope: 'assessment,roadmap,ai_advisory',
    status: 'In Progress', currentPhase: 'Discovery',
    startDate: d(2026, 3, 1), endDate: d(2026, 12, 31),
    description: `Rocky Mountain First Responders Pension Fund is undertaking an ambitious business transformation program to modernize member services, improve data analytics capabilities, and explore AI-assisted benefit processing. Linea was selected to lead Phase 1 of this transformation.

Phase 1 encompasses an operating model assessment, AI readiness evaluation, and a detailed transformation roadmap. Linea's team includes specialists in pension operations, data architecture, and AI advisory to ensure the roadmap is technically grounded and operationally achievable.`,
    milestones: JSON.stringify([
      { title: 'Engagement Kickoff', date: '2026-03-10', status: 'Completed', notes: '' },
      { title: 'AI Readiness Assessment', date: '2026-05-30', status: 'In Progress', notes: 'Data inventory phase underway.' },
      { title: 'Operating Model Workshop Series', date: '2026-07-15', status: 'Upcoming', notes: 'Five workshops planned.' },
      { title: 'Draft Transformation Roadmap', date: '2026-09-30', status: 'Upcoming', notes: '' },
      { title: 'Board Presentation', date: '2026-12-01', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-deltapf',
    name: 'DTPF – Implementation Oversight',
    ae: 'Webb, Marcus', em: 'Kowalski, Diana', cls: 'Client', industry: 'pension',
    scope: 'implementation,oversight,ocm',
    status: 'In Progress', currentPhase: 'Implementation',
    startDate: d(2025, 8, 1), endDate: d(2026, 11, 30),
    description: `Delta Region Teachers Pension Fund is implementing a new pension administration system with a major technology vendor. Linea was engaged as the independent implementation oversight team, providing a layer of quality assurance and member advocacy throughout the project.

Linea's responsibilities include reviewing vendor deliverables, facilitating change management with DTPF staff, conducting independent testing reviews, and escalating risks to the DTPF board. The engagement runs parallel to the vendor implementation lifecycle through go-live and into stabilization.`,
    milestones: JSON.stringify([
      { title: 'Oversight Framework Established', date: '2025-09-01', status: 'Completed', notes: '' },
      { title: 'Phase 1 Vendor Review Complete', date: '2025-12-15', status: 'Completed', notes: '14 issues identified; 11 resolved.' },
      { title: 'Change Impact Assessment', date: '2026-02-28', status: 'Completed', notes: '' },
      { title: 'Training Strategy Approved', date: '2026-04-30', status: 'In Progress', notes: 'Training calendar being finalized.' },
      { title: 'Phase 2 Vendor Review', date: '2026-07-31', status: 'Upcoming', notes: '' },
      { title: 'Go-Live Support', date: '2026-11-01', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-tsmf',
    name: 'TSMF – Additional Consulting Services',
    ae: 'Webb, Marcus', em: 'Reyes, Carlos', cls: 'Client', industry: 'insurance',
    scope: 'assessment,roadmap',
    status: 'In Progress', currentPhase: 'Assessment',
    startDate: d(2026, 1, 15), endDate: d(2026, 7, 31),
    description: `Tri-State Medical Liability Fund has engaged Linea for a focused consulting engagement to assess their claims management workflow and recommend process improvements. The scope is intentionally narrow: three months of analysis followed by a prioritized recommendations report.`,
    milestones: JSON.stringify([
      { title: 'Process Workshops Complete', date: '2026-02-28', status: 'Completed', notes: '' },
      { title: 'Claims Workflow Analysis', date: '2026-04-15', status: 'In Progress', notes: '' },
      { title: 'Recommendations Report', date: '2026-07-31', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-midwcb',
    name: 'MWCB – Strategic Consulting',
    ae: 'Webb, Marcus', em: 'Mehta, Priya', cls: 'Client', industry: 'workers_comp',
    scope: 'assessment,roadmap',
    status: 'In Progress', currentPhase: 'Assessment',
    startDate: d(2026, 2, 15), endDate: d(2026, 8, 31),
    description: `Midlands Workers Compensation Board has retained Linea to perform a strategic technology assessment and produce a five-year systems roadmap. The board is under legislative mandate to modernize their claims and employer reporting systems by 2029.`,
    milestones: JSON.stringify([
      { title: 'Stakeholder Interviews', date: '2026-03-15', status: 'Completed', notes: '' },
      { title: 'Technology Landscape Review', date: '2026-05-01', status: 'In Progress', notes: '' },
      { title: 'Draft Roadmap', date: '2026-07-15', status: 'Upcoming', notes: '' },
      { title: 'Final Report', date: '2026-08-31', status: 'Upcoming', notes: '' },
    ]),
  },
  // ── Linea Solutions ULC (Canada) ────────────────────────────────────────
  {
    code: nextPrjCode(), clientId: 'c-nwwsb',
    name: 'NWWSB – Transformation Roadmap Phase B2',
    ae: 'Webb, Marcus', em: 'Zhang, Wei', cls: 'ULC', industry: 'workers_comp',
    scope: 'roadmap,implementation,ocm',
    status: 'In Progress', currentPhase: 'Implementation',
    startDate: d(2025, 7, 1), endDate: d(2026, 9, 30),
    description: `Northwest Workers Safety Board is executing Phase B2 of a multi-phase digital transformation. Linea ULC is the primary delivery partner, responsible for business analysis, organizational change management, and testing support for the replacement of NWWSB's claims adjudication and employer services systems.

Phase B2 covers the employer portal implementation, integration with the provincial payment gateway, and the OCM program targeting 400+ board staff who will transition to the new system.`,
    milestones: JSON.stringify([
      { title: 'Phase B2 Kickoff', date: '2025-07-15', status: 'Completed', notes: '' },
      { title: 'Employer Portal Config Complete', date: '2026-01-31', status: 'Completed', notes: '' },
      { title: 'Payment Integration Testing', date: '2026-03-31', status: 'Completed', notes: 'All 84 integration test cases passed.' },
      { title: 'OCM Training Wave 1', date: '2026-05-15', status: 'In Progress', notes: '210 of 400 staff trained.' },
      { title: 'OCM Training Wave 2', date: '2026-07-31', status: 'Upcoming', notes: '' },
      { title: 'Go-Live', date: '2026-09-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-lakeswcb',
    name: 'LWCB – Pre-Implementation & SOW #3',
    ae: 'Webb, Marcus', em: 'Zhang, Wei', cls: 'ULC', industry: 'workers_comp',
    scope: 'implementation,assessment',
    status: 'In Progress', currentPhase: 'Requirements',
    startDate: d(2025, 11, 1), endDate: d(2026, 7, 31),
    description: `Lakeside Workers Compensation Board selected Pinnacle Solutions Group as their technology vendor and retained Linea ULC for pre-implementation readiness work. SOW #3 covers detailed requirements elaboration, data governance framework development, and organizational readiness assessment prior to the main implementation phase beginning in Q4 2026.`,
    milestones: JSON.stringify([
      { title: 'Data Governance Framework Draft', date: '2026-01-31', status: 'Completed', notes: '' },
      { title: 'Requirements Elaboration – Claims Module', date: '2026-03-15', status: 'Completed', notes: '520 requirements documented.' },
      { title: 'Requirements Elaboration – Employer Module', date: '2026-05-31', status: 'In Progress', notes: 'Currently 65% complete.' },
      { title: 'Organizational Readiness Report', date: '2026-07-31', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-harbins',
    name: 'HISL – TPA Platform Assessment',
    ae: 'Webb, Marcus', em: 'Zhang, Wei', cls: 'ULC', industry: 'insurance',
    scope: 'assessment',
    status: 'In Progress', currentPhase: 'Assessment',
    startDate: d(2026, 2, 1), endDate: d(2026, 6, 30),
    description: `Harbour Insurance Services Ltd engaged Linea ULC to assess their third-party administrator (TPA) platform and identify options for system modernization. The engagement is scoped at four months and will produce a technology assessment, vendor shortlist, and preliminary business case.`,
    milestones: JSON.stringify([
      { title: 'Process Discovery', date: '2026-02-28', status: 'Completed', notes: '' },
      { title: 'Vendor Market Scan', date: '2026-04-30', status: 'In Progress', notes: '' },
      { title: 'Assessment Report', date: '2026-06-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-westpf',
    name: 'WCMPF – Benefits System Review',
    ae: 'Webb, Marcus', em: 'Zhang, Wei', cls: 'ULC', industry: 'pension',
    scope: 'assessment,roadmap',
    status: 'In Progress', currentPhase: 'Planning',
    startDate: d(2026, 3, 1), endDate: d(2026, 9, 30),
    description: `Western Canada Municipal Pension Fund retained Linea ULC to conduct a benefits administration system review. WCMPF serves 65,000 municipal employees across four western provinces. The review will benchmark their current system against peer organizations and produce a multi-year modernization roadmap.`,
    milestones: JSON.stringify([
      { title: 'Benchmarking Survey Issued', date: '2026-03-31', status: 'Completed', notes: '' },
      { title: 'Peer Comparison Analysis', date: '2026-05-31', status: 'In Progress', notes: '' },
      { title: 'Draft Roadmap', date: '2026-08-15', status: 'Upcoming', notes: '' },
      { title: 'Final Report', date: '2026-09-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-gpwcf',
    name: 'GPWCF – Legacy Data Migration',
    ae: 'Webb, Marcus', em: 'Nakamura, Kenji', cls: 'ICON', industry: 'data',
    scope: 'data_conversion,profiling,cleansing',
    status: 'In Progress', currentPhase: 'Implementation',
    startDate: d(2025, 10, 1), endDate: d(2026, 8, 31),
    description: `Great Plains Workers Compensation Fund is migrating 22 years of historical claims data from their legacy mainframe system to the new Pinnacle platform. ICON Integration & Design was selected to lead the data migration based on their track record with complex compensation system conversions.

ICON's scope covers data profiling, cleansing rule development, ETL pipeline construction, conversion cycle execution, and reconciliation reporting. The migration involves approximately 4.2 million claim records across three legacy source systems.`,
    milestones: JSON.stringify([
      { title: 'Data Profiling Complete', date: '2025-12-15', status: 'Completed', notes: '847 data quality issues catalogued.' },
      { title: 'Cleansing Rules Approved', date: '2026-01-31', status: 'Completed', notes: '' },
      { title: 'ETL Pipeline Build', date: '2026-04-30', status: 'Completed', notes: '' },
      { title: 'Conversion Cycle 1', date: '2026-06-30', status: 'In Progress', notes: 'Cycle 1 reconciliation underway; 98.4% match rate.' },
      { title: 'Conversion Cycle 2 (Final)', date: '2026-08-15', status: 'Upcoming', notes: '' },
      { title: 'Sign-Off & Handover', date: '2026-08-31', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-prppb',
    name: 'PRPPB – Project Nexus Data Conversion',
    ae: 'Webb, Marcus', em: 'Nakamura, Kenji', cls: 'ICON', industry: 'data',
    scope: 'data_conversion,reconciliation',
    status: 'In Progress', currentPhase: 'Testing',
    startDate: d(2025, 5, 1), endDate: d(2026, 6, 30),
    description: `Prairie Region Public Pension Board's Project Nexus is the largest pension system replacement in the region's history. ICON is managing data conversion from two source systems (a 1990s-era mainframe and a 2010 supplemental system) into the new Vitech V3 platform.

The conversion covers 110,000 active and deferred members plus 45,000 retirees. ICON's approach uses a proprietary reconciliation framework to validate benefit calculations across conversion cycles, ensuring that every member's benefit is accurately reflected in the new system before go-live.`,
    milestones: JSON.stringify([
      { title: 'Source System Extraction', date: '2025-07-31', status: 'Completed', notes: '' },
      { title: 'Data Profiling & Cleansing', date: '2025-11-30', status: 'Completed', notes: '' },
      { title: 'ETL Development', date: '2026-02-28', status: 'Completed', notes: '' },
      { title: 'Conversion Cycle 1', date: '2026-04-30', status: 'Completed', notes: '99.1% reconciliation rate; 148 exceptions resolved.' },
      { title: 'Conversion Cycle 2', date: '2026-06-15', status: 'In Progress', notes: 'Final reconciliation in progress.' },
      { title: 'Client Sign-Off', date: '2026-06-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-nwwsb',
    name: 'NWWSB – Data Quality & Cleansing Program',
    ae: 'Webb, Marcus', em: 'Nakamura, Kenji', cls: 'ICON', industry: 'data',
    scope: 'profiling,cleansing',
    status: 'In Progress', currentPhase: 'Implementation',
    startDate: d(2026, 1, 1), endDate: d(2026, 7, 31),
    description: `In parallel with Linea ULC's transformation engagement at NWWSB, ICON was separately engaged to address a longstanding data quality problem in NWWSB's employer registry. Over 15 years of data entry errors, duplicate records, and incomplete employer information have been identified.

ICON's team is profiling all 28,000 employer records, applying cleansing rules, and building automated monitoring dashboards that NWWSB staff can use to maintain data quality going forward.`,
    milestones: JSON.stringify([
      { title: 'Employer Registry Profiling', date: '2026-02-15', status: 'Completed', notes: '6,200 duplicate or error records identified.' },
      { title: 'Cleansing Rules Development', date: '2026-03-31', status: 'Completed', notes: '' },
      { title: 'Cleansing Execution – Batch 1', date: '2026-05-15', status: 'In Progress', notes: '60% of records processed.' },
      { title: 'Cleansing Execution – Batch 2', date: '2026-06-30', status: 'Upcoming', notes: '' },
      { title: 'Monitoring Dashboard Deployment', date: '2026-07-31', status: 'Upcoming', notes: '' },
    ]),
  },
  // ── Linea Secure (Cybersecurity) ────────────────────────────────────────
  {
    code: nextPrjCode(), clientId: 'c-brcera',
    name: 'BRCERA – vCISO Services 2026',
    ae: 'Webb, Marcus', em: 'Diallo, Idrissa', cls: 'Cyber', industry: 'cybersecurity',
    scope: 'cybersecurity,vciso',
    status: 'In Progress', currentPhase: 'Support',
    startDate: d(2026, 1, 1), endDate: d(2026, 12, 31),
    description: `Blue Ridge County Employees Retirement Association retained Linea Secure to provide virtual CISO (vCISO) services for calendar year 2026. Following a 2025 security assessment that identified critical gaps in BRCERA's governance and incident response capabilities, Linea Secure is now embedded as BRCERA's strategic security leadership.

Services include monthly security committee participation, policy framework development, third-party vendor risk reviews, regulatory compliance monitoring, and quarterly board reporting.`,
    milestones: JSON.stringify([
      { title: 'Security Governance Framework v1', date: '2026-02-28', status: 'Completed', notes: '' },
      { title: 'Q1 Board Security Report', date: '2026-03-31', status: 'Completed', notes: '' },
      { title: 'Vendor Risk Review – Wave 1', date: '2026-04-30', status: 'Completed', notes: '12 vendors assessed; 3 high-risk findings.' },
      { title: 'Q2 Board Security Report', date: '2026-06-30', status: 'In Progress', notes: '' },
      { title: 'Incident Response Tabletop Exercise', date: '2026-08-15', status: 'Upcoming', notes: '' },
      { title: 'Q3 Board Security Report', date: '2026-09-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-nwwsb',
    name: 'NWWSB – vCISO & Threat Monitoring',
    ae: 'Webb, Marcus', em: 'Diallo, Idrissa', cls: 'Cyber', industry: 'cybersecurity',
    scope: 'cybersecurity,vciso,vulnerability_scanning',
    status: 'In Progress', currentPhase: 'Support',
    startDate: d(2026, 2, 1), endDate: d(2027, 1, 31),
    description: `Linea Secure was engaged by Northwest Workers Safety Board to provide ongoing vCISO advisory services and managed vulnerability scanning throughout their digital transformation period. With major system changes underway, NWWSB recognized the need for dedicated security oversight to protect member and employer data during the transition.`,
    milestones: JSON.stringify([
      { title: 'Security Baseline Assessment', date: '2026-02-28', status: 'Completed', notes: '' },
      { title: 'Vulnerability Scanning Program Launched', date: '2026-03-15', status: 'Completed', notes: '' },
      { title: 'Q2 Security Review', date: '2026-06-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-capebp',
    name: 'CAPEBP – Penetration Testing',
    ae: 'Webb, Marcus', em: 'Diallo, Idrissa', cls: 'Cyber', industry: 'cybersecurity',
    scope: 'cybersecurity,pen_testing',
    status: 'In Progress', currentPhase: 'Testing',
    startDate: d(2026, 3, 1), endDate: d(2026, 6, 30),
    description: `Capital Region Employee Benefits Plan engaged Linea Secure to conduct a comprehensive penetration test of their member self-service portal, internal network, and cloud infrastructure. The engagement is driven by a board requirement for annual third-party security validation.`,
    milestones: JSON.stringify([
      { title: 'Scoping & Rules of Engagement', date: '2026-03-15', status: 'Completed', notes: '' },
      { title: 'External Penetration Test', date: '2026-04-30', status: 'Completed', notes: '7 vulnerabilities found; 2 critical.' },
      { title: 'Internal Network Assessment', date: '2026-05-31', status: 'In Progress', notes: '' },
      { title: 'Remediation Report', date: '2026-06-30', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-nprisk',
    name: 'NPRM – Cybersecurity Risk Assessment',
    ae: 'Webb, Marcus', em: 'Diallo, Idrissa', cls: 'Cyber', industry: 'cybersecurity',
    scope: 'cybersecurity,risk_assessment',
    status: 'In Progress', currentPhase: 'Assessment',
    startDate: d(2026, 4, 1), endDate: d(2026, 7, 31),
    description: `Northern Plains Risk Management Group engaged Linea Secure to perform a comprehensive cybersecurity risk assessment aligned to the NIST Cybersecurity Framework. The assessment will evaluate NPRM's controls across all five framework functions (Identify, Protect, Detect, Respond, Recover) and produce a prioritized remediation roadmap.`,
    milestones: JSON.stringify([
      { title: 'Framework Scoping', date: '2026-04-15', status: 'Completed', notes: '' },
      { title: 'Control Assessment Interviews', date: '2026-05-31', status: 'In Progress', notes: '' },
      { title: 'Risk Register Draft', date: '2026-06-30', status: 'Upcoming', notes: '' },
      { title: 'Final Assessment Report', date: '2026-07-31', status: 'Upcoming', notes: '' },
    ]),
  },
  {
    code: nextPrjCode(), clientId: 'c-montpb',
    name: 'MPBC – Identity & Access Management Review',
    ae: 'Webb, Marcus', em: 'Diallo, Idrissa', cls: 'Cyber', industry: 'cybersecurity',
    scope: 'cybersecurity,identity_verification',
    status: 'In Progress', currentPhase: 'Assessment',
    startDate: d(2026, 4, 15), endDate: d(2026, 8, 31),
    description: `Montrose Public Benefit Corp engaged Linea Secure to conduct an Identity and Access Management (IAM) maturity assessment and develop a roadmap for improving their privileged access controls. The engagement follows a near-miss incident where a former employee's credentials remained active for 60 days post-termination.`,
    milestones: JSON.stringify([
      { title: 'IAM Maturity Assessment', date: '2026-05-31', status: 'In Progress', notes: '' },
      { title: 'Privileged Access Audit', date: '2026-06-30', status: 'Upcoming', notes: '' },
      { title: 'Remediation Roadmap', date: '2026-08-31', status: 'Upcoming', notes: '' },
    ]),
  },
  // ── Internal / Bench ────────────────────────────────────────────────────
  {
    code: nextPrjCode(), clientId: 'c-nexgen',
    name: 'Linea Placeholder – Bench',
    ae: 'Webb, Marcus', em: 'Webb, Marcus', cls: 'Client', industry: 'pension',
    scope: 'internal',
    status: 'In Progress', currentPhase: 'Support',
    startDate: d(2026, 1, 1), endDate: d(2026, 12, 31),
    description: 'Internal holding project for staff on bench or between engagements.',
    milestones: JSON.stringify([]),
  },
];

// ─── EMPLOYEE DEFINITIONS ────────────────────────────────────────────────────
interface EmployeeDef {
  first: string; last: string;
  companyGroup: string; businessUnit: string;
  careerPath: string; roleFamily: string;
  practice: string; level: string; title: string;
  location: string;
  skills: string[];
  tools: string[];
  certs: string[];
  bio: string; // multi-paragraph resume
}

const EMPLOYEES: EmployeeDef[] = [
  // ═══ LINEA SOLUTIONS (US) ══════════════════════════════════════════════════
  // Leadership
  {
    first: 'Marcus', last: 'Webb',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'PM', practice: 'CrossPractice',
    level: 'Principal', title: 'Principal, Account Executive', location: 'US',
    skills: ['Strategic Planning', 'Client Relationship Management', 'Pension Administration', 'Insurance Domain', 'Workers Compensation', 'Business Development', 'Executive Presentations'],
    tools: ['Salesforce', 'MS Project', 'Confluence', 'Power BI'],
    certs: ['PMP', 'ITIL Foundation'],
    bio: `Marcus Webb is a Principal Account Executive at Linea Solutions with over 18 years of experience serving public sector pension, insurance, and workers compensation clients across North America. He leads strategic business development and serves as executive sponsor on the firm's largest engagements.

Prior to joining Linea, Marcus held senior client advisory roles at two Big Four consulting firms and spent six years as Deputy Director of Operations at a regional public pension fund, giving him firsthand insight into the challenges facing plan administrators. He has personally overseen more than 40 pension and benefits technology modernization engagements with an aggregate project value exceeding $300 million.

Marcus is a certified Project Management Professional (PMP) and holds an MBA from the University of Michigan Ross School of Business. He is a frequent speaker at NCTR and PEBA conferences and serves on the advisory board of the International Foundation of Employee Benefit Plans.`,
  },
  {
    first: 'Diana', last: 'Kowalski',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'PM', practice: 'Pension',
    level: 'Principal', title: 'Principal, Engagement Manager', location: 'US',
    skills: ['Project Management', 'Pension Administration', 'Strategic Planning', 'Implementation Oversight', 'Stakeholder Management', 'Business Case Development', 'Risk Management'],
    tools: ['MS Project', 'JIRA', 'Confluence', 'Smartsheet', 'Power BI'],
    certs: ['PMP', 'ITIL v4', 'CSM'],
    bio: `Diana Kowalski is a Principal Engagement Manager at Linea Solutions and one of the firm's most experienced pension implementation oversight specialists. With 15 years at Linea and 4 years prior at a state retirement system, she brings deep operational knowledge to every oversight engagement she leads.

Diana has overseen pension system implementations for over a dozen public plans, managing vendor relationships, protecting client interests, and ensuring that complex multi-year projects deliver on their promised outcomes. She is known for her structured approach to quality assurance and her ability to navigate difficult vendor negotiations without jeopardizing timelines.

She holds a PMP certification, ITIL v4 certification, and a Certified ScrumMaster (CSM) designation. Diana earned her B.S. in Management Information Systems from Penn State University and her M.S. in Project Management from George Washington University.`,
  },
  {
    first: 'Priya', last: 'Mehta',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'PM', practice: 'Pension',
    level: 'Senior', title: 'Senior Engagement Manager', location: 'US',
    skills: ['Project Management', 'Requirements Gathering', 'Pension Administration', 'Procurement Support', 'Stakeholder Management', 'UAT Coordination', 'Vendor Evaluation'],
    tools: ['MS Project', 'JIRA', 'Confluence', 'Visio', 'Smartsheet'],
    certs: ['PMP'],
    bio: `Priya Mehta is a Senior Engagement Manager at Linea Solutions with 11 years of experience in pension technology consulting. She specializes in procurement engagements — helping public retirement systems navigate complex vendor selection processes — and has managed over eight successful RFP-to-award cycles.

Before joining Linea, Priya spent four years as a senior project manager at a regional benefits technology firm where she delivered SaaS implementations for mid-size insurance carriers. Her background in vendor-side project management gives her a unique perspective that clients appreciate during procurement negotiations.

Priya holds a PMP certification and a B.S. in Industrial Engineering from Purdue University. She is an active member of the Government Finance Officers Association and contributes regularly to Linea's internal knowledge management practice.`,
  },
  {
    first: 'Carlos', last: 'Reyes',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'PM', practice: 'CrossPractice',
    level: 'Senior', title: 'Senior Engagement Manager', location: 'US',
    skills: ['Project Management', 'Insurance Domain', 'Strategic Planning', 'Roadmap Development', 'Vendor Management', 'Business Transformation', 'OCM Strategy'],
    tools: ['MS Project', 'Smartsheet', 'Confluence', 'Miro', 'Tableau'],
    certs: ['PMP', 'Six Sigma Green Belt'],
    bio: `Carlos Reyes is a Senior Engagement Manager with 13 years of consulting experience spanning insurance, pension, and workers compensation technology projects. He is particularly skilled in business transformation engagements where organizational change and technology change must be managed simultaneously.

Carlos began his career as a business analyst at a national workers compensation insurer before transitioning to consulting. He has since led engagements for clients across the US and Canada, including three multi-year transformation programs that each involved replacing core administrative platforms. His Six Sigma background makes him a disciplined process improvement practitioner.

He holds a PMP, Six Sigma Green Belt, and a B.S. in Business Administration from the University of Texas at Austin.`,
  },
  // Senior BAs – US Pension
  {
    first: 'Eleanor', last: 'Fitzgerald',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Senior', title: 'Senior Consultant', location: 'US',
    skills: ['Requirements Gathering', 'Business Process Improvement', 'Pension Administration', 'Current State Assessment', 'Gap Analysis', 'Stakeholder Management', 'Defined Benefit Plans'],
    tools: ['Visio', 'Confluence', 'JIRA', 'Miro', 'Vitech'],
    certs: ['CBAP', 'PMP'],
    bio: `Eleanor Fitzgerald is a Senior Consultant and one of Linea's most respected pension domain experts with 14 years of industry experience. She has led business analysis efforts on over 20 pension modernization projects, covering defined benefit, defined contribution, and hybrid plan structures.

Eleanor is known for her ability to translate complex actuarial and benefit calculation requirements into clear, testable system specifications. She has a particular strength in current state assessment methodology and has developed several of Linea's proprietary assessment frameworks that are now used firm-wide. Her work on UAT facilitation has been recognized by multiple clients as a key factor in successful go-live outcomes.

She holds both CBAP and PMP certifications and earned her B.A. in Political Science from Georgetown University, followed by a Certificate in Pension Administration from the International Foundation of Employee Benefit Plans.`,
  },
  {
    first: 'Thomas', last: 'Blackwood',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Insurance',
    level: 'Senior', title: 'Senior Consultant', location: 'US',
    skills: ['Requirements Gathering', 'Insurance Domain', 'Claims Processing', 'Business Analysis', 'Process Mapping', 'UAT Coordination', 'Policy Administration'],
    tools: ['Visio', 'Confluence', 'JIRA', 'Balsamiq', 'Guidewire'],
    certs: ['CBAP'],
    bio: `Thomas Blackwood is a Senior Consultant specializing in insurance technology with 12 years of experience across property & casualty, health, and liability insurance domains. Before joining Linea, Thomas spent six years at a national P&C carrier as a senior business systems analyst, where he led the requirements effort for a full Guidewire PolicyCenter implementation.

At Linea, Thomas focuses primarily on insurance modernization engagements and brings practical operational knowledge to every assignment. He is adept at facilitating requirements workshops with underwriters, claims adjusters, and actuarial teams, translating their needs into structured system specifications. His deep familiarity with Guidewire and Duck Creek platforms is a significant differentiator on competitive pursuits.

Thomas holds a CBAP certification and a B.S. in Finance from Indiana University.`,
  },
  {
    first: 'Aisha', last: 'Okonkwo',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'WorkersComp',
    level: 'Senior', title: 'Senior Consultant', location: 'US',
    skills: ['Workers Compensation', 'Claims Processing', 'Requirements Gathering', 'Business Process Improvement', 'Compliance & Audit', 'Current State Assessment', 'Regulatory Reporting'],
    tools: ['Sagitec', 'JIRA', 'Confluence', 'Visio', 'SQL Server'],
    certs: ['CBAP', 'CPRW'],
    bio: `Aisha Okonkwo is a Senior Consultant with 10 years of specialized experience in workers compensation technology. She began her career as a claims specialist at a state workers compensation board before transitioning to consulting, and that operational background is evident in every engagement she leads.

Aisha is a recognized expert in Sagitec Neospin implementations and has supported four successful go-lives on that platform. She is equally skilled in requirements gathering for custom-built systems and has led several legacy modernization assessments for boards in the US midwest. Her knowledge of state-specific regulatory reporting requirements across 12 jurisdictions is frequently cited by clients as uniquely valuable.

She holds a CBAP, Certified Professional in Workers Compensation (CPRW), and a B.S. in Human Resources Management from Howard University.`,
  },
  {
    first: 'Richard', last: 'Hammersmith',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Senior', title: 'Senior Consultant', location: 'US',
    skills: ['Requirements Gathering', 'Pension Administration', 'Benefits Administration', 'Defined Benefit Plans', 'Vendor Evaluation', 'Implementation Support', 'Vitech V3'],
    tools: ['Vitech', 'JIRA', 'Confluence', 'MS Project', 'Visio'],
    certs: ['PMP', 'Vitech Certified Consultant'],
    bio: `Richard Hammersmith is a Senior Consultant and certified Vitech consultant with 13 years of experience in pension administration system implementations. He has been involved in six Vitech V3 implementations and is one of Linea's deepest subject matter experts on that platform's configuration, reporting, and integration capabilities.

Richard's career began at a large public pension fund where he spent seven years in benefits administration and system support roles before joining Linea. He brings a client-perspective sensibility to every engagement and is particularly effective when working with plan staff who are skeptical of consultants. His technical depth in Vitech is complemented by strong requirements writing skills and a practical approach to UAT management.

He holds a PMP certification, Vitech Certified Consultant designation, and a B.S. in Computer Information Systems from Arizona State University.`,
  },
  // Mid BAs
  {
    first: 'Gabrielle', last: 'Chen',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Consultant', title: 'Consultant', location: 'US',
    skills: ['Requirements Gathering', 'Pension Administration', 'Process Mapping', 'Gap Analysis', 'Test Planning', 'Stakeholder Interviews'],
    tools: ['JIRA', 'Confluence', 'Visio', 'Excel'],
    certs: [],
    bio: `Gabrielle Chen is a Consultant at Linea Solutions with five years of experience in pension technology engagements. She joined Linea directly from a master's program and has quickly developed into a reliable contributor on current state assessments and procurement support engagements.

Gabrielle excels at process mapping and gap analysis — she has a talent for quickly understanding complex benefit workflows and documenting them in a clear, structured format. She recently completed Linea's internal pension domain certification program and is working toward her CBAP designation.

She holds a B.A. in Economics from UCLA and an M.S. in Information Systems from Carnegie Mellon University.`,
  },
  {
    first: 'Damon', last: 'Wright',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Insurance',
    level: 'Consultant', title: 'Consultant', location: 'US',
    skills: ['Insurance Domain', 'Requirements Gathering', 'Business Analysis', 'Claims Processing', 'Documentation', 'Process Improvement'],
    tools: ['JIRA', 'Confluence', 'Visio', 'Miro', 'Lucidchart'],
    certs: [],
    bio: `Damon Wright is a Consultant with four years of experience in insurance technology consulting at Linea Solutions. He specializes in claims and policy administration system engagements, having contributed to projects for medical liability funds and P&C insurers.

Damon is known for producing high-quality business requirements documents and his ability to build quick rapport with business stakeholders during discovery workshops. He is currently pursuing his CBAP certification and is enrolled in Linea's internal insurance domain training track.

He holds a B.S. in Business Administration from the University of Georgia.`,
  },
  {
    first: 'Patrick', last: 'Nguyen',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Consultant', title: 'Consultant', location: 'US',
    skills: ['Pension Administration', 'Requirements Gathering', 'Current State Assessment', 'Stakeholder Interviews', 'Process Mapping', 'Power BI'],
    tools: ['JIRA', 'Confluence', 'Visio', 'Power BI', 'Excel'],
    certs: [],
    bio: `Patrick Nguyen is a Consultant at Linea Solutions with four years of experience on pension modernization engagements. He has contributed to current state assessments for three public retirement systems and is developing expertise in procurement support.

Patrick has a particular interest in data-driven analysis and has taken the initiative to build Power BI dashboards on several engagements to help clients visualize their current-state metrics. He completed Linea's internal pension domain program in 2024 and is pursuing his PMP certification.

He holds a B.S. in Industrial Engineering from UC Davis.`,
  },
  {
    first: 'Fatima', last: 'Al-Hassan',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Benefits',
    level: 'Consultant', title: 'Consultant', location: 'US',
    skills: ['Benefits Administration', 'Pension Administration', 'Requirements Gathering', 'Business Analysis', 'Data Analysis', 'Documentation'],
    tools: ['JIRA', 'Confluence', 'Excel', 'Visio'],
    certs: [],
    bio: `Fatima Al-Hassan is a Consultant at Linea Solutions focusing on benefits administration technology engagements. She joined Linea three years ago after working as a benefits specialist at a large healthcare system, bringing practical HR and benefits operations knowledge to her consulting work.

Fatima is skilled at requirements elicitation in complex multi-stakeholder environments and has developed a reputation for creating clear, well-structured functional specifications. She is working toward her CBAP certification and recently completed an internal training program on pension and benefits domain fundamentals.

She holds a B.S. in Human Resources from the University of Illinois at Urbana-Champaign.`,
  },
  // Associates
  {
    first: 'Jordan', last: 'Park',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Associate', title: 'Associate', location: 'US',
    skills: ['Requirements Gathering', 'Documentation', 'Process Mapping', 'Meeting Facilitation', 'Test Support'],
    tools: ['JIRA', 'Confluence', 'Visio', 'Excel'],
    certs: [],
    bio: `Jordan Park is an Associate at Linea Solutions, having joined the firm's graduate intake program 18 months ago. Jordan is contributing to pension assessment and implementation engagements under the mentorship of senior consultants.

Jordan demonstrates strong analytical thinking and has taken ownership of documentation deliverables on two current client engagements. The team appreciates Jordan's attention to detail and eagerness to learn the pension domain. Jordan is completing Linea's two-year Associate development program and expects to be promoted to Consultant level.

Jordan holds a B.S. in Business Analytics from the University of Minnesota.`,
  },
  {
    first: 'Samantha', last: 'Pierce',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Insurance',
    level: 'Associate', title: 'Associate', location: 'US',
    skills: ['Business Analysis', 'Insurance Domain', 'Documentation', 'Testing Support', 'Meeting Notes'],
    tools: ['JIRA', 'Confluence', 'Excel'],
    certs: [],
    bio: `Samantha Pierce is an Associate at Linea Solutions who joined the firm 12 months ago after graduating with a degree in Finance. She is currently assigned to an insurance consulting engagement where she is learning claims workflow analysis and requirement documentation under the guidance of senior team members.

Samantha is a quick learner with strong organizational skills. She has been recognized by engagement managers for her thoroughness in maintaining project trackers and action logs. She is pursuing Linea's internal insurance domain certification.

She holds a B.S. in Finance from the University of Florida.`,
  },
  // Technical Specialists – US
  {
    first: 'Robert', last: 'Andersen',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice',
    level: 'Senior', title: 'Senior Specialist, Technical Analysis', location: 'US',
    skills: ['SQL Server', 'T-SQL Development', 'Data Warehousing', 'ETL Design', 'Data Analysis', 'Performance Tuning', 'Azure Data Factory'],
    tools: ['SQL Server', 'SSIS', 'Power BI', 'Azure', 'Python'],
    certs: ['Microsoft Certified: Azure Data Engineer', 'SQL Server Specialist'],
    bio: `Robert Andersen is a Senior Technical Analysis Specialist with 16 years of experience in data engineering and analytics for public sector clients. He is one of Linea's most sought-after technical resources for engagements requiring complex SQL development, data warehouse design, or ETL architecture.

Robert has architected data solutions for pension, insurance, and workers compensation clients, consistently delivering high-performance query environments on tight timelines. He is fluent in T-SQL, SSIS, Azure Data Factory, and Python for data engineering tasks. His data warehouse designs have supported reporting systems serving hundreds of concurrent users without performance degradation.

He holds Microsoft Azure Data Engineer and SQL Server Specialist certifications and a B.S. in Computer Science from the University of Wisconsin-Madison.`,
  },
  {
    first: 'Angela', last: 'Morris',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'Pension',
    level: 'Consultant', title: 'Specialist, Technical Analysis', location: 'US',
    skills: ['SQL', 'Data Analysis', 'Reporting', 'Vitech Administration', 'API Integration', 'SSRS'],
    tools: ['Vitech', 'SQL Server', 'SSRS', 'Power BI', 'Postman'],
    certs: ['Vitech Certified Consultant'],
    bio: `Angela Morris is a Technical Analysis Specialist with eight years of experience in pension technology engagements, with particular depth in Vitech V3 administration and SQL-based reporting. She has supported four Vitech implementations in roles spanning configuration verification, report development, and API integration testing.

Angela is adept at bridging the gap between business stakeholders and technical teams, translating functional requirements into database queries and report specifications. Her work on SSRS and Power BI dashboards for several Linea clients has significantly improved their operational reporting capabilities.

She holds a Vitech Certified Consultant designation and a B.S. in Management Information Systems from Ohio State University.`,
  },
  {
    first: 'Kevin', last: 'Thompson',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice',
    level: 'Consultant', title: 'Specialist, Technical Analysis', location: 'US',
    skills: ['Python', 'Data Analysis', 'Statistical Analysis', 'ETL Design', 'API Development', 'Machine Learning', 'Azure'],
    tools: ['Python', 'Azure', 'Power BI', 'Tableau', 'Jupyter', 'FastAPI'],
    certs: ['AWS Solutions Architect – Associate', 'Azure AI Fundamentals'],
    bio: `Kevin Thompson is a Technical Analysis Specialist with six years of experience applying data science and AI techniques to insurance and pension administration problems. He is Linea's primary resource for AI advisory engagements, with expertise in machine learning model design, data pipeline development, and AI readiness assessments.

Kevin has contributed to AI-adjacent projects including predictive modeling for claims fraud detection, natural language processing for policy document analysis, and an LLM-powered member inquiry pilot for a pension fund. He is proficient in Python, Azure ML, and the major cloud data engineering services.

He holds AWS Solutions Architect and Azure AI Fundamentals certifications and a B.S. in Statistics from the University of Michigan.`,
  },
  // Testing Specialists
  {
    first: 'Melissa', last: 'Grant',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'Testing', practice: 'CrossPractice',
    level: 'Senior', title: 'Senior Specialist, Testing', location: 'US',
    skills: ['Test Strategy', 'UAT Coordination', 'Test Script Development', 'Defect Management', 'Performance Testing', 'Regression Testing'],
    tools: ['JIRA', 'Zephyr', 'qTest', 'SQL Server', 'HP ALM'],
    certs: ['ISTQB CTFL', 'ISTQB CTAL'],
    bio: `Melissa Grant is a Senior Testing Specialist with 12 years of experience leading testing programs for pension and insurance technology implementations. She is the architect of Linea's UAT methodology framework and has trained dozens of junior testing professionals across the firm.

Melissa has led testing efforts on eight full PAS implementations, managing test cycles involving hundreds to thousands of test scripts and coordinating business user testing groups of 20–80 participants. Her defect management processes are known for minimizing go-live risk and she has achieved a 100% successful go-live record on projects she has led.

She holds ISTQB Certified Tester Foundation Level (CTFL) and Advanced Level (CTAL) certifications and a B.S. in Computer Science from Purdue University.`,
  },
  {
    first: 'Brian', last: 'Holloway',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'Testing', practice: 'Pension',
    level: 'Consultant', title: 'Specialist, Testing', location: 'US',
    skills: ['UAT Coordination', 'Test Script Development', 'Defect Tracking', 'Regression Testing', 'Pension Administration'],
    tools: ['JIRA', 'Zephyr', 'SQL Server', 'Excel'],
    certs: ['ISTQB CTFL'],
    bio: `Brian Holloway is a Testing Specialist with seven years of experience in pension system testing. He has contributed to UAT programs for five public retirement systems, developing expertise in benefit calculation verification and member transaction testing for defined benefit plans.

Brian is a reliable execution-focused tester who brings methodical discipline to test script development and defect management. His pension domain knowledge allows him to design test cases that catch edge-case calculation errors that purely technical testers often miss.

He holds an ISTQB Certified Tester Foundation Level certification and a B.S. in Information Technology from Michigan State University.`,
  },
  // OCM Specialists
  {
    first: 'Sandra', last: 'Okonkwo',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'OCM', practice: 'CrossPractice',
    level: 'Senior', title: 'Senior Specialist, OCM', location: 'US',
    skills: ['Change Management', 'Training Strategy', 'Communication Planning', 'Stakeholder Engagement', 'OCM Framework Design', 'Leadership Coaching'],
    tools: ['Microsoft 365', 'Articulate 360', 'Camtasia', 'Viva Engage', 'Miro'],
    certs: ['Prosci ADKAR', 'CCMP'],
    bio: `Sandra Okonkwo is a Senior OCM Specialist and Linea's leading change management practitioner with 13 years of experience on public sector technology transformations. She designs and executes comprehensive OCM programs that address the human side of system change, from executive sponsorship alignment through frontline staff adoption.

Sandra has led OCM programs on seven pension and workers compensation implementations, working with organizations of 100 to 1,500 affected employees. Her approach combines the Prosci ADKAR model with lean communication techniques to deliver high adoption outcomes. She is particularly skilled at designing training programs that account for varying digital literacy levels across the workforce.

She holds Prosci ADKAR Practitioner and Certified Change Management Professional (CCMP) certifications and a B.A. in Organizational Psychology from the University of North Carolina.`,
  },
  {
    first: 'Marcus', last: 'Delacroix',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'OCM', practice: 'Pension',
    level: 'Consultant', title: 'Specialist, OCM', location: 'US',
    skills: ['Change Management', 'Training Delivery', 'Communication Planning', 'Impact Assessment', 'Stakeholder Mapping'],
    tools: ['Microsoft 365', 'Articulate 360', 'SharePoint', 'Miro'],
    certs: ['Prosci ADKAR'],
    bio: `Marcus Delacroix is an OCM Specialist with six years of experience on pension and benefits system implementations. He executes change management deliverables including communication plans, impact assessments, training calendars, and job aids, working under the direction of senior OCM leads or independently on smaller engagements.

Marcus is an engaging and approachable trainer who consistently receives positive feedback from end users in classroom settings. He has designed and delivered training programs covering both technical system navigation and underlying business process changes.

He holds a Prosci ADKAR certification and a B.A. in Communications from the University of Southern California.`,
  },
  // AI / Innovation
  {
    first: 'Deepak', last: 'Johny',
    companyGroup: 'Linea Solutions', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice',
    level: 'Consultant', title: 'Specialist, AI & Innovation', location: 'US',
    skills: ['AI Strategy', 'LLM Integration', 'Python', 'Data Analysis', 'Process Automation', 'Prompt Engineering', 'Technical Consulting'],
    tools: ['Python', 'Azure OpenAI', 'Anthropic Claude', 'Power Automate', 'Power BI', 'FastAPI'],
    certs: ['Azure AI Fundamentals', 'Google Cloud Professional Data Engineer'],
    bio: `Deepak Johny is a Specialist in AI & Innovation at Linea Solutions, focused on applying artificial intelligence and automation technologies to pension, insurance, and workers compensation administration challenges. With six years of technical consulting experience and a deep interest in emerging AI capabilities, Deepak serves as the firm's primary advisor for clients exploring AI adoption.

Deepak has led AI readiness assessments for three public pension funds and designed proof-of-concept LLM applications for member inquiry automation and document processing. He is proficient in Python, Azure OpenAI, and Anthropic Claude integration, and has hands-on experience building production-grade data pipelines and REST APIs.

He holds Azure AI Fundamentals and Google Cloud Professional Data Engineer certifications and a B.Tech in Computer Science from VIT University. He is currently pursuing an M.S. in Data Science from Georgia Tech.`,
  },

  // ═══ LINEA SOLUTIONS ULC (CANADA) ══════════════════════════════════════════
  {
    first: 'Wei', last: 'Zhang',
    companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'PM', practice: 'WorkersComp',
    level: 'Senior', title: 'Senior Engagement Manager', location: 'Canada',
    skills: ['Project Management', 'Workers Compensation', 'Business Transformation', 'Vendor Management', 'Stakeholder Engagement', 'Implementation Oversight'],
    tools: ['MS Project', 'JIRA', 'Confluence', 'Smartsheet'],
    certs: ['PMP', 'PMI-ACP'],
    bio: `Wei Zhang is a Senior Engagement Manager at Linea Solutions ULC and the firm's primary engagement manager for Canadian workers compensation clients. With 12 years of experience in public sector technology consulting, Wei has led major transformation programs for three provincial workers compensation boards.

Wei is recognized for building strong, trust-based relationships with client project sponsors and for his ability to manage complex multi-vendor environments without losing sight of business outcomes. His PMI-ACP agile certification reflects his practical experience managing hybrid waterfall-agile delivery teams.

He holds PMP and PMI-ACP certifications and a B.Eng. in Systems Engineering from the University of Waterloo.`,
  },
  {
    first: 'Claire', last: 'Beaumont',
    companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'WorkersComp',
    level: 'Senior', title: 'Senior Consultant', location: 'Canada',
    skills: ['Workers Compensation', 'Requirements Gathering', 'Business Process Improvement', 'UAT Coordination', 'French-English Bilingual', 'Regulatory Compliance'],
    tools: ['JIRA', 'Confluence', 'Visio', 'SQL Server'],
    certs: ['CBAP'],
    bio: `Claire Beaumont is a Senior Consultant at Linea Solutions ULC with 11 years of experience in Canadian workers compensation engagements. A native of Quebec, Claire is bilingual in French and English and has led bilingual requirements and training delivery on engagements in francophone jurisdictions.

Claire has deep expertise in WCB claims adjudication, employer reporting, and return-to-work case management processes across multiple provincial frameworks. Her regulatory knowledge of Workers Compensation Act requirements across western and maritime provinces is particularly valued on multi-jurisdictional clients.

She holds a CBAP certification and a B.A. in Business Administration from HEC Montréal.`,
  },
  {
    first: 'Andrew', last: 'MacLeod',
    companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Consultant', title: 'Consultant', location: 'Canada',
    skills: ['Pension Administration', 'Requirements Gathering', 'Process Mapping', 'Gap Analysis', 'Test Support', 'Documentation'],
    tools: ['JIRA', 'Confluence', 'Visio', 'Excel'],
    certs: [],
    bio: `Andrew MacLeod is a Consultant at Linea Solutions ULC with five years of experience on Canadian pension and benefits engagements. He has contributed to current state assessments and procurement support projects for two provincial pension plans and one municipal benefit plan.

Andrew has a strong grasp of Canadian pension regulatory requirements and brings a methodical approach to documentation and requirements work. He is currently enrolled in the Canadian Institute of Actuaries' plan administrator certificate program to deepen his domain expertise.

He holds a B.Comm. in Finance from Queen's University.`,
  },
  {
    first: 'Yasmine', last: 'Tremblay',
    companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'OCM', practice: 'WorkersComp',
    level: 'Consultant', title: 'Specialist, OCM', location: 'Canada',
    skills: ['Change Management', 'Training Delivery', 'French-English Bilingual', 'Communication Planning', 'Stakeholder Mapping', 'Impact Assessment'],
    tools: ['Microsoft 365', 'Articulate 360', 'SharePoint'],
    certs: ['Prosci ADKAR'],
    bio: `Yasmine Tremblay is an OCM Specialist at Linea Solutions ULC with seven years of experience delivering change management programs for Canadian public sector clients. Bilingual in French and English, Yasmine is a key resource for bilingual training and communication delivery on projects in Quebec and bilingual provinces.

Yasmine has supported three workers compensation board transformations in OCM roles, coordinating training logistics for frontline claims staff and developing communications in both official languages. She is known for her energetic training facilitation and her ability to make system change feel approachable for resistant user groups.

She holds a Prosci ADKAR certification and a B.A. in Organizational Communication from the Université de Montréal.`,
  },
  {
    first: 'Emma', last: 'Robertson',
    companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Associate', title: 'Associate', location: 'Canada',
    skills: ['Requirements Gathering', 'Documentation', 'Process Mapping', 'Meeting Facilitation'],
    tools: ['JIRA', 'Confluence', 'Excel'],
    certs: [],
    bio: `Emma Robertson is an Associate at Linea Solutions ULC, joining the firm 14 months ago following graduation. She is contributing to pension and benefits assessment engagements in a support capacity, developing her domain knowledge under the guidance of senior consultants.

Emma has shown strong initiative in learning the Canadian pension regulatory environment and has completed Linea's internal domain certification for Canadian pension administration. Her written communication skills have been highlighted by supervisors as a particular strength.

She holds a B.A. in Economics from the University of British Columbia.`,
  },
  {
    first: 'Daniel', last: 'Fortier',
    companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery',
    careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension',
    level: 'Consultant', title: 'Consultant', location: 'Canada',
    skills: ['Pension Administration', 'Process Mapping', 'Gap Analysis', 'Requirements Gathering', 'Test Coordination'],
    tools: ['JIRA', 'Confluence', 'Visio', 'Vitech'],
    certs: [],
    bio: `Daniel Fortier is a Consultant at Linea Solutions ULC with four years of experience on Canadian pension technology engagements. He has contributed to two Vitech V3 implementations in business analysis and test coordination roles, developing practical platform knowledge alongside strong BA fundamentals.

Daniel is detail-oriented and thorough in his documentation work. He recently took the lead on a benefits calculation requirements module for a major pension implementation and received positive client feedback on the quality of deliverables produced.

He holds a B.Sc. in Applied Mathematics from McGill University.`,
  },
  {
    first: 'Anika', last: 'Sharma',
    companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery',
    careerPath: 'Specialist', roleFamily: 'Testing', practice: 'WorkersComp',
    level: 'Consultant', title: 'Specialist, Testing', location: 'Canada',
    skills: ['UAT Coordination', 'Test Script Development', 'Defect Tracking', 'Workers Compensation', 'Regression Testing'],
    tools: ['JIRA', 'Zephyr', 'SQL', 'Excel'],
    certs: ['ISTQB CTFL'],
    bio: `Anika Sharma is a Testing Specialist at Linea Solutions ULC with five years of experience in testing for Canadian workers compensation and pension system implementations. She has led UAT cycles on two WCB transformation projects, coordinating test execution for business user groups of 30–60 participants.

Anika brings a combination of test methodology discipline and workers compensation domain knowledge to each engagement. She has developed reusable test script libraries for common WCB business processes that are now used across multiple Linea engagements.

She holds an ISTQB CTFL certification and a B.Tech in Information Technology from the University of Toronto.`,
  },

  // ═══ LINEA SECURE ══════════════════════════════════════════════════════════
  {
    first: 'Idrissa', last: 'Diallo',
    companyGroup: 'Linea Secure', businessUnit: 'Cyber',
    careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice',
    level: 'Senior', title: 'Senior Engagement Manager, Cyber', location: 'US',
    skills: ['vCISO Services', 'Cybersecurity Strategy', 'Risk Management', 'Security Governance', 'Incident Response', 'Compliance', 'NIST CSF'],
    tools: ['Microsoft Sentinel', 'CrowdStrike', 'Nessus', 'Splunk', 'ServiceNow'],
    certs: ['CISSP', 'CISM', 'CRISC'],
    bio: `Idrissa Diallo is the Senior Engagement Manager for Linea Secure with 15 years of cybersecurity leadership experience across financial services, public sector, and critical infrastructure organizations. He founded Linea's cybersecurity practice in 2018 and has grown it from a single service offering into a multi-service practice serving over a dozen clients annually.

Idrissa brings executive-level security leadership experience from his tenure as Chief Information Security Officer at a regional financial institution before joining Linea. He delivers vCISO services to smaller organizations that cannot justify a full-time CISO investment but require strategic security leadership, board-level reporting, and regulatory compliance guidance.

He holds CISSP, Certified Information Security Manager (CISM), and CRISC certifications and a B.S. in Information Assurance from Carnegie Mellon University.`,
  },
  {
    first: 'Aditi', last: 'Kapoor',
    companyGroup: 'Linea Secure', businessUnit: 'Cyber',
    careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice',
    level: 'Consultant', title: 'Cybersecurity Consultant', location: 'US',
    skills: ['Penetration Testing', 'Vulnerability Assessment', 'Network Security', 'Web Application Security', 'Security Risk Assessment', 'SQL Injection', 'OWASP'],
    tools: ['Kali Linux', 'Burp Suite', 'Metasploit', 'Nessus', 'Nmap', 'Wireshark'],
    certs: ['CEH', 'OSCP', 'Security+'],
    bio: `Aditi Kapoor is a Cybersecurity Consultant at Linea Secure specializing in penetration testing and vulnerability assessment. With seven years of experience in offensive security, she is one of Linea's primary resources for external and internal penetration testing engagements across pension, insurance, and workers compensation clients.

Aditi holds the Offensive Security Certified Professional (OSCP) certification, considered one of the most rigorous hands-on security certifications in the industry, and has conducted over 40 penetration tests across web applications, internal networks, and cloud environments. Her detailed technical reports are known for being both comprehensive and actionable for non-technical stakeholders.

She is also well-versed in SQL injection attack vectors and web application security testing using OWASP methodologies, making her a strong resource for clients requiring database security assessments or application security reviews. She holds CEH, OSCP, and CompTIA Security+ certifications and a B.S. in Computer Science from Georgia Tech.`,
  },
  {
    first: 'Ferdinand', last: 'Osei',
    companyGroup: 'Linea Secure', businessUnit: 'Cyber',
    careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice',
    level: 'Consultant', title: 'Cybersecurity Consultant', location: 'US',
    skills: ['vCISO Services', 'Security Policy Development', 'Risk Assessment', 'Third-Party Risk Management', 'Security Awareness Training', 'NIST CSF', 'ISO 27001'],
    tools: ['Microsoft Sentinel', 'ServiceNow GRC', 'Nessus', 'KnowBe4'],
    certs: ['CISSP', 'CISA', 'ISO 27001 Lead Auditor'],
    bio: `Ferdinand Osei is a Cybersecurity Consultant at Linea Secure with eight years of experience in governance, risk, and compliance (GRC) work for financial services and public sector organizations. He is a primary delivery resource on Linea's vCISO engagements, providing security governance, policy development, and regulatory compliance services.

Ferdinand is a certified ISO 27001 Lead Auditor and has led NIST CSF assessments for six organizations, each resulting in a prioritized remediation roadmap. His methodical approach to third-party vendor risk management and his ability to communicate complex security concepts to boards and executive teams make him an effective client-facing security advisor.

He holds CISSP, CISA, and ISO 27001 Lead Auditor certifications and a B.S. in Information Security from Florida State University.`,
  },
  {
    first: 'Priya', last: 'Sundaram',
    companyGroup: 'Linea Secure', businessUnit: 'Cyber',
    careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice',
    level: 'Consultant', title: 'Cybersecurity Consultant', location: 'US',
    skills: ['Identity & Access Management', 'Privileged Access Management', 'Active Directory', 'Azure AD', 'Zero Trust Architecture', 'MFA', 'SSO Implementation'],
    tools: ['CyberArk', 'Azure AD', 'Okta', 'Microsoft Entra ID', 'BeyondTrust'],
    certs: ['CISSP', 'Microsoft Certified: Identity and Access Administrator'],
    bio: `Priya Sundaram is a Cybersecurity Consultant at Linea Secure specializing in Identity and Access Management (IAM). With eight years of experience in IAM architecture and implementation, she is Linea's primary expert for engagements involving privileged access management, Active Directory hardening, and Zero Trust security architectures.

Priya has designed and implemented IAM solutions for five pension and insurance clients, each of which involved migrating from legacy permission structures to role-based access control frameworks. Her practical experience with CyberArk, Azure AD, and Okta platforms enables her to deliver both strategic advisory and hands-on implementation support.

She holds CISSP and Microsoft Certified Identity and Access Administrator certifications and a B.S. in Electrical and Computer Engineering from UT Austin.`,
  },

  // ═══ ICON INTEGRATION & DESIGN ════════════════════════════════════════════
  {
    first: 'Kenji', last: 'Nakamura',
    companyGroup: 'ICON', businessUnit: 'Data',
    careerPath: 'Consultant', roleFamily: 'PM', practice: 'CrossPractice',
    level: 'Senior', title: 'Senior Engagement Manager, Data', location: 'US',
    skills: ['Data Migration', 'Project Management', 'Data Governance', 'ETL Architecture', 'Vendor Management', 'Stakeholder Engagement'],
    tools: ['MS Project', 'JIRA', 'SQL Server', 'Azure Data Factory', 'Talend'],
    certs: ['PMP', 'DAMA-CDMP'],
    bio: `Kenji Nakamura is ICON's Senior Engagement Manager with 14 years of experience leading data migration and conversion programs for pension, workers compensation, and insurance clients. He oversees all ICON engagements and personally manages the most complex data conversion projects in the portfolio.

Kenji is a DAMA Certified Data Management Professional (CDMP) and has deep expertise in data profiling, cleansing, ETL architecture, and conversion cycle management. His track record of zero data integrity failures on production migrations is the result of a rigorous reconciliation methodology he developed and refined over a decade of practice.

He holds PMP and DAMA-CDMP certifications and a B.S. in Computer Science from the University of California, San Diego.`,
  },
  {
    first: 'Alex', last: 'Drummond',
    companyGroup: 'ICON', businessUnit: 'Data',
    careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice',
    level: 'Consultant', title: 'Reconciliation Analyst', location: 'Canada',
    skills: ['Data Reconciliation', 'SQL', 'Data Quality', 'ETL Testing', 'Pension Data', 'Benefit Calculation Verification'],
    tools: ['SQL Server', 'Python', 'Excel', 'SSIS', 'Power BI'],
    certs: [],
    bio: `Alex Drummond is a Reconciliation Analyst at ICON with six years of experience in pension and workers compensation data conversion reconciliation. He specializes in building and executing reconciliation frameworks that validate converted data against source systems, identifying discrepancies at the record level and tracing them to their root cause.

Alex has been a key analyst on three major data conversion projects, each involving millions of records. His systematic approach to reconciliation cycle management and his proficiency in writing complex SQL verification queries make him an efficient and reliable data quality resource.

He holds a B.Sc. in Computer Science from the University of Alberta.`,
  },
  {
    first: 'Elena', last: 'Popova',
    companyGroup: 'ICON', businessUnit: 'Data',
    careerPath: 'Specialist', roleFamily: 'Data', practice: 'Pension',
    level: 'Consultant', title: 'Data Conversion Engineer', location: 'Canada',
    skills: ['ETL Development', 'Data Profiling', 'SQL', 'Python', 'Data Cleansing', 'Pension Data Structures'],
    tools: ['SQL Server', 'SSIS', 'Python', 'Azure Data Factory', 'Talend'],
    certs: ['Microsoft Certified: Data Analyst Associate'],
    bio: `Elena Popova is a Data Conversion Engineer at ICON with five years of experience building ETL pipelines for pension data migrations. She is proficient in both SSIS and Azure Data Factory for pipeline development and has particular expertise in pension plan data structures including member master, contribution history, and service credit calculations.

Elena is known for writing clean, well-documented ETL code that is maintainable by client teams after the conversion engagement is complete. Her data profiling work consistently uncovers data quality issues early in the engagement, preventing costly surprises during conversion cycles.

She holds a Microsoft Certified Data Analyst Associate certification and a B.Sc. in Applied Mathematics from the University of Ottawa.`,
  },
  {
    first: 'Gregory', last: 'Pike',
    companyGroup: 'ICON', businessUnit: 'Data',
    careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice',
    level: 'Senior', title: 'Senior DBA', location: 'US',
    skills: ['SQL Server Administration', 'Database Performance Tuning', 'High Availability', 'Data Architecture', 'ETL Optimization', 'T-SQL Development'],
    tools: ['SQL Server', 'SSIS', 'Azure SQL', 'AWS RDS', 'Redgate'],
    certs: ['Microsoft Certified: Azure Database Administrator Associate'],
    bio: `Gregory Pike is a Senior Database Administrator at ICON with 15 years of experience managing and optimizing SQL Server environments for data-intensive projects. He serves as ICON's DBA on all major data conversion engagements, responsible for database architecture decisions, performance tuning, and high availability setup.

Gregory has designed database environments capable of processing multi-million-record conversion loads in sub-hour timeframes through careful index design, parallelism configuration, and query optimization. His background in Azure SQL and AWS RDS makes him equally capable in cloud-hosted database environments.

He holds a Microsoft Certified Azure Database Administrator Associate certification and a B.S. in Information Technology from Virginia Tech.`,
  },
];

// ─── RESUME & SKILLS GENERATOR ───────────────────────────────────────────────
function buildExtractedSkills(emp: EmployeeDef): string {
  const skills = emp.skills.map(s => ({ name: s, years: Math.floor(Math.random() * 8) + 2 }));
  const tools = emp.tools;
  const certifications = emp.certs;
  return JSON.stringify({ skills, tools, certifications });
}

function buildResumeText(emp: EmployeeDef): string {
  return emp.bio;
}

// ─── ALLOCATION BUILDER ──────────────────────────────────────────────────────
interface AllocDef {
  employeeRampName: string;
  projectCode: string;
  role: string;
  startDate: Date;
  endDate: Date;
  pct: number;
}

const ALLOCS: AllocDef[] = [
  // CPRS – Modernization Roadmap
  { employeeRampName: 'Kowalski, Diana',    projectCode: 'PRJ-001000', role: 'PM',        startDate: d(2025,9,1),  endDate: d(2026,6,30), pct: 80 },
  { employeeRampName: 'Fitzgerald, Eleanor',projectCode: 'PRJ-001000', role: 'BA',        startDate: d(2025,9,1),  endDate: d(2026,6,30), pct: 100 },
  { employeeRampName: 'Chen, Gabrielle',    projectCode: 'PRJ-001000', role: 'BA',        startDate: d(2025,10,1), endDate: d(2026,4,30), pct: 80 },
  { employeeRampName: 'Nguyen, Patrick',    projectCode: 'PRJ-001000', role: 'BA',        startDate: d(2026,1,1),  endDate: d(2026,6,30), pct: 60 },

  // GLTERA – Implementation Oversight Phase 3
  { employeeRampName: 'Mehta, Priya',       projectCode: 'PRJ-001001', role: 'PM',        startDate: d(2025,3,1),  endDate: d(2026,8,31), pct: 100 },
  { employeeRampName: 'Hammersmith, Richard',projectCode:'PRJ-001001', role: 'BA',        startDate: d(2025,3,1),  endDate: d(2026,8,31), pct: 100 },
  { employeeRampName: 'Grant, Melissa',     projectCode: 'PRJ-001001', role: 'Testing',   startDate: d(2025,6,1),  endDate: d(2026,8,31), pct: 100 },
  { employeeRampName: 'Holloway, Brian',    projectCode: 'PRJ-001001', role: 'Testing',   startDate: d(2026,1,1),  endDate: d(2026,8,31), pct: 100 },
  { employeeRampName: 'Morris, Angela',     projectCode: 'PRJ-001001', role: 'BA',        startDate: d(2025,6,1),  endDate: d(2026,6,30), pct: 60 },

  // SDERA – Current State Assessment
  { employeeRampName: 'Kowalski, Diana',    projectCode: 'PRJ-001002', role: 'PM',        startDate: d(2026,1,6),  endDate: d(2026,5,30), pct: 20 },
  { employeeRampName: 'Wright, Damon',      projectCode: 'PRJ-001002', role: 'BA',        startDate: d(2026,1,6),  endDate: d(2026,5,30), pct: 100 },
  { employeeRampName: 'Al-Hassan, Fatima',  projectCode: 'PRJ-001002', role: 'BA',        startDate: d(2026,1,6),  endDate: d(2026,5,30), pct: 60 },

  // HLPF – Strategic Planning
  { employeeRampName: 'Reyes, Carlos',      projectCode: 'PRJ-001003', role: 'PM',        startDate: d(2025,11,1), endDate: d(2026,9,30), pct: 80 },
  { employeeRampName: 'Fitzgerald, Eleanor',projectCode: 'PRJ-001003', role: 'BA',        startDate: d(2026,4,1),  endDate: d(2026,9,30), pct: 60 },
  { employeeRampName: 'Nguyen, Patrick',    projectCode: 'PRJ-001003', role: 'BA',        startDate: d(2025,11,1), endDate: d(2026,9,30), pct: 40 },
  { employeeRampName: 'Park, Jordan',       projectCode: 'PRJ-001003', role: 'BA',        startDate: d(2026,1,1),  endDate: d(2026,9,30), pct: 80 },

  // GPPERS – Implementation Support
  { employeeRampName: 'Kowalski, Diana',    projectCode: 'PRJ-001004', role: 'Oversight', startDate: d(2025,6,1),  endDate: d(2027,3,31), pct: 40 },
  { employeeRampName: 'Okonkwo, Aisha',     projectCode: 'PRJ-001004', role: 'BA',        startDate: d(2025,6,1),  endDate: d(2027,3,31), pct: 100 },
  { employeeRampName: 'Grant, Melissa',     projectCode: 'PRJ-001004', role: 'Testing',   startDate: d(2026,6,1),  endDate: d(2027,3,31), pct: 60 },
  { employeeRampName: 'Okonkwo, Sandra',    projectCode: 'PRJ-001004', role: 'OCM',       startDate: d(2025,9,1),  endDate: d(2027,3,31), pct: 80 },
  { employeeRampName: 'Delacroix, Marcus',  projectCode: 'PRJ-001004', role: 'OCM',       startDate: d(2026,1,1),  endDate: d(2027,3,31), pct: 80 },
  { employeeRampName: 'Thompson, Kevin',    projectCode: 'PRJ-001004', role: 'AIAdvisory',startDate: d(2026,3,1),  endDate: d(2026,9,30), pct: 40 },

  // NEPERS – RFP & Vendor Selection
  { employeeRampName: 'Mehta, Priya',       projectCode: 'PRJ-001005', role: 'PM',        startDate: d(2026,2,1),  endDate: d(2026,10,31),pct: 60 },
  { employeeRampName: 'Hammersmith, Richard',projectCode:'PRJ-001005', role: 'BA',        startDate: d(2026,2,1),  endDate: d(2026,10,31),pct: 60 },
  { employeeRampName: 'Pierce, Samantha',   projectCode: 'PRJ-001005', role: 'BA',        startDate: d(2026,2,1),  endDate: d(2026,10,31),pct: 100 },

  // RMFPF – Business Transformation Phase 1
  { employeeRampName: 'Reyes, Carlos',      projectCode: 'PRJ-001006', role: 'PM',        startDate: d(2026,3,1),  endDate: d(2026,12,31),pct: 60 },
  { employeeRampName: 'Thompson, Kevin',    projectCode: 'PRJ-001006', role: 'AIAdvisory',startDate: d(2026,3,1),  endDate: d(2026,12,31),pct: 60 },
  { employeeRampName: 'Johny, Deepak',      projectCode: 'PRJ-001006', role: 'AIAdvisory',startDate: d(2026,3,1),  endDate: d(2026,12,31),pct: 80 },
  { employeeRampName: 'Andersen, Robert',   projectCode: 'PRJ-001006', role: 'DataAnalyst',startDate: d(2026,5,1), endDate: d(2026,12,31),pct: 40 },

  // DTPF – Implementation Oversight
  { employeeRampName: 'Kowalski, Diana',    projectCode: 'PRJ-001007', role: 'Oversight', startDate: d(2025,8,1),  endDate: d(2026,11,30),pct: 40 },
  { employeeRampName: 'Chen, Gabrielle',    projectCode: 'PRJ-001007', role: 'BA',        startDate: d(2026,5,1),  endDate: d(2026,11,30),pct: 60 },
  { employeeRampName: 'Okonkwo, Sandra',    projectCode: 'PRJ-001007', role: 'OCM',       startDate: d(2026,2,1),  endDate: d(2026,11,30),pct: 40 },

  // TSMF – Additional Consulting
  { employeeRampName: 'Reyes, Carlos',      projectCode: 'PRJ-001008', role: 'PM',        startDate: d(2026,1,15), endDate: d(2026,7,31), pct: 20 },
  { employeeRampName: 'Wright, Damon',      projectCode: 'PRJ-001008', role: 'BA',        startDate: d(2026,5,1),  endDate: d(2026,7,31), pct: 80 },

  // MWCB – Strategic Consulting
  { employeeRampName: 'Mehta, Priya',       projectCode: 'PRJ-001009', role: 'PM',        startDate: d(2026,2,15), endDate: d(2026,8,31), pct: 40 },
  { employeeRampName: 'Al-Hassan, Fatima',  projectCode: 'PRJ-001009', role: 'BA',        startDate: d(2026,5,15), endDate: d(2026,8,31), pct: 80 },
  { employeeRampName: 'Park, Jordan',       projectCode: 'PRJ-001009', role: 'BA',        startDate: d(2026,2,15), endDate: d(2026,8,31), pct: 20 },

  // NWWSB – Transformation Phase B2
  { employeeRampName: 'Zhang, Wei',         projectCode: 'PRJ-001010', role: 'PM',        startDate: d(2025,7,1),  endDate: d(2026,9,30), pct: 100 },
  { employeeRampName: 'Beaumont, Claire',   projectCode: 'PRJ-001010', role: 'BA',        startDate: d(2025,7,1),  endDate: d(2026,9,30), pct: 100 },
  { employeeRampName: 'Tremblay, Yasmine',  projectCode: 'PRJ-001010', role: 'OCM',       startDate: d(2025,10,1), endDate: d(2026,9,30), pct: 80 },
  { employeeRampName: 'Sharma, Anika',      projectCode: 'PRJ-001010', role: 'Testing',   startDate: d(2026,3,1),  endDate: d(2026,9,30), pct: 100 },
  { employeeRampName: 'MacLeod, Andrew',    projectCode: 'PRJ-001010', role: 'BA',        startDate: d(2025,10,1), endDate: d(2026,9,30), pct: 80 },

  // LWCB – Pre-Implementation SOW #3
  { employeeRampName: 'Zhang, Wei',         projectCode: 'PRJ-001011', role: 'PM',        startDate: d(2025,11,1), endDate: d(2026,7,31), pct: 40 },
  { employeeRampName: 'Beaumont, Claire',   projectCode: 'PRJ-001011', role: 'BA',        startDate: d(2026,3,1),  endDate: d(2026,7,31), pct: 60 },
  { employeeRampName: 'Fortier, Daniel',    projectCode: 'PRJ-001011', role: 'BA',        startDate: d(2025,11,1), endDate: d(2026,7,31), pct: 80 },
  { employeeRampName: 'Robertson, Emma',    projectCode: 'PRJ-001011', role: 'BA',        startDate: d(2026,1,1),  endDate: d(2026,7,31), pct: 60 },

  // HISL – TPA Assessment
  { employeeRampName: 'Zhang, Wei',         projectCode: 'PRJ-001012', role: 'PM',        startDate: d(2026,2,1),  endDate: d(2026,6,30), pct: 20 },
  { employeeRampName: 'MacLeod, Andrew',    projectCode: 'PRJ-001012', role: 'BA',        startDate: d(2026,2,1),  endDate: d(2026,6,30), pct: 40 },

  // WCMPF – Benefits System Review
  { employeeRampName: 'Zhang, Wei',         projectCode: 'PRJ-001013', role: 'PM',        startDate: d(2026,3,1),  endDate: d(2026,9,30), pct: 40 },
  { employeeRampName: 'Fortier, Daniel',    projectCode: 'PRJ-001013', role: 'BA',        startDate: d(2026,3,1),  endDate: d(2026,9,30), pct: 60 },

  // GPWCF – Legacy Data Migration
  { employeeRampName: 'Nakamura, Kenji',    projectCode: 'PRJ-001014', role: 'PM',        startDate: d(2025,10,1), endDate: d(2026,8,31), pct: 80 },
  { employeeRampName: 'Drummond, Alex',     projectCode: 'PRJ-001014', role: 'DataAnalyst',startDate: d(2025,10,1),endDate: d(2026,8,31), pct: 100 },
  { employeeRampName: 'Pike, Gregory',      projectCode: 'PRJ-001014', role: 'DataAnalyst',startDate: d(2025,10,1),endDate: d(2026,8,31), pct: 80 },
  { employeeRampName: 'Popova, Elena',      projectCode: 'PRJ-001014', role: 'DataAnalyst',startDate: d(2026,1,1), endDate: d(2026,8,31), pct: 80 },

  // PRPPB – Project Nexus Data Conversion
  { employeeRampName: 'Nakamura, Kenji',    projectCode: 'PRJ-001015', role: 'PM',        startDate: d(2025,5,1),  endDate: d(2026,6,30), pct: 60 },
  { employeeRampName: 'Popova, Elena',      projectCode: 'PRJ-001015', role: 'DataAnalyst',startDate: d(2025,5,1), endDate: d(2026,6,30), pct: 80 },
  { employeeRampName: 'Pike, Gregory',      projectCode: 'PRJ-001015', role: 'DataAnalyst',startDate: d(2025,5,1), endDate: d(2026,6,30), pct: 40 },

  // NWWSB – Data Quality
  { employeeRampName: 'Nakamura, Kenji',    projectCode: 'PRJ-001016', role: 'PM',        startDate: d(2026,1,1),  endDate: d(2026,7,31), pct: 40 },
  { employeeRampName: 'Drummond, Alex',     projectCode: 'PRJ-001016', role: 'DataAnalyst',startDate: d(2026,1,1), endDate: d(2026,7,31), pct: 80 },
  { employeeRampName: 'Andersen, Robert',   projectCode: 'PRJ-001016', role: 'DataAnalyst',startDate: d(2026,1,1), endDate: d(2026,7,31), pct: 60 },

  // BRCERA – vCISO
  { employeeRampName: 'Diallo, Idrissa',    projectCode: 'PRJ-001017', role: 'Cyber',     startDate: d(2026,1,1),  endDate: d(2026,12,31),pct: 40 },
  { employeeRampName: 'Osei, Ferdinand',    projectCode: 'PRJ-001017', role: 'Cyber',     startDate: d(2026,1,1),  endDate: d(2026,12,31),pct: 80 },

  // NWWSB – vCISO & Threat Monitoring
  { employeeRampName: 'Diallo, Idrissa',    projectCode: 'PRJ-001018', role: 'Cyber',     startDate: d(2026,2,1),  endDate: d(2027,1,31), pct: 20 },
  { employeeRampName: 'Kapoor, Aditi',      projectCode: 'PRJ-001018', role: 'Cyber',     startDate: d(2026,2,1),  endDate: d(2026,7,31), pct: 60 },

  // CAPEBP – Pen Testing
  { employeeRampName: 'Diallo, Idrissa',    projectCode: 'PRJ-001019', role: 'Cyber',     startDate: d(2026,3,1),  endDate: d(2026,6,30), pct: 20 },
  { employeeRampName: 'Kapoor, Aditi',      projectCode: 'PRJ-001019', role: 'Cyber',     startDate: d(2026,3,1),  endDate: d(2026,6,30), pct: 100 },

  // NPRM – Cybersecurity Risk Assessment
  { employeeRampName: 'Diallo, Idrissa',    projectCode: 'PRJ-001020', role: 'Cyber',     startDate: d(2026,4,1),  endDate: d(2026,7,31), pct: 20 },
  { employeeRampName: 'Osei, Ferdinand',    projectCode: 'PRJ-001020', role: 'Cyber',     startDate: d(2026,4,1),  endDate: d(2026,7,31), pct: 60 },
  { employeeRampName: 'Sundaram, Priya',    projectCode: 'PRJ-001020', role: 'Cyber',     startDate: d(2026,4,1),  endDate: d(2026,7,31), pct: 40 },

  // MPBC – IAM Review
  { employeeRampName: 'Kapoor, Aditi',      projectCode: 'PRJ-001021', role: 'Cyber',     startDate: d(2026,7,1),  endDate: d(2026,8,31), pct: 80 },
  { employeeRampName: 'Sundaram, Priya',    projectCode: 'PRJ-001021', role: 'Cyber',     startDate: d(2026,4,15), endDate: d(2026,8,31), pct: 80 },
];

// ─── SEED FUNCTION ───────────────────────────────────────────────────────────
async function seed() {
  console.log('Seeding database with fictional Linea data...');

  // Clear existing data
  await prisma.allocation.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.feedbackTicket.deleteMany();

  // Build client lookup
  const clientMap: Record<string, { name: string }> = {};
  for (const c of CLIENTS) {
    clientMap[c.id] = { name: c.name };
  }

  // Insert projects
  const projectMap: Record<string, string> = {}; // code → db id
  for (const p of PROJECTS) {
    const client = clientMap[p.clientId];
    const proj = await prisma.project.create({
      data: {
        rampProjectCode: p.code,
        name: p.name,
        clientId: p.clientId,
        clientName: client.name,
        accountExecutive: p.ae,
        engagementManager: p.em,
        engagementClass: p.cls,
        industryTag: p.industry,
        scopeCategories: JSON.stringify(p.scope.split(',')),
        status: p.status,
        description: p.description,
        startDate: p.startDate,
        endDate: p.endDate,
        currentPhase: p.currentPhase,
        milestones: p.milestones,
      },
    });
    projectMap[p.code] = proj.id;
  }
  console.log(`Created ${PROJECTS.length} projects`);

  // Insert employees
  const employeeMap: Record<string, string> = {}; // rampName → db id
  for (const e of EMPLOYEES) {
    const rampName = `${e.last}, ${e.first}`;
    const email = `${e.first[0]}${e.last}@${
      e.companyGroup === 'Linea Secure' ? 'lineasecure' :
      e.companyGroup === 'ICON' ? 'iconintegration' :
      'lineasolutions'
    }.com`.toLowerCase();
    const emp = await prisma.employee.create({
      data: {
        name: `${e.first} ${e.last}`,
        rampName,
        email,
        companyGroup: e.companyGroup,
        businessUnit: e.businessUnit,
        careerPath: e.careerPath,
        roleFamily: e.roleFamily,
        practice: e.practice,
        level: e.level,
        title: e.title,
        location: e.location,
        resumeText: buildResumeText(e),
        extractedSkills: buildExtractedSkills(e),
      },
    });
    employeeMap[rampName] = emp.id;
  }
  console.log(`Created ${EMPLOYEES.length} employees`);

  // Insert allocations
  let allocCount = 0;
  for (const a of ALLOCS) {
    const employeeId = employeeMap[a.employeeRampName];
    const projectId = projectMap[a.projectCode];
    if (!employeeId || !projectId) {
      console.warn(`  ⚠ Skipped alloc: ${a.employeeRampName} / ${a.projectCode}`);
      continue;
    }
    const projectName = PROJECTS.find(p => p.code === a.projectCode)?.name ?? a.projectCode;
    const sd = a.startDate;
    const ed = a.endDate;
    const sdStr = `${(sd.getMonth()+1).toString().padStart(2,'0')}/${sd.getDate().toString().padStart(2,'0')}/${String(sd.getFullYear()).slice(2)}`;
    const edStr = `${(ed.getMonth()+1).toString().padStart(2,'0')}/${ed.getDate().toString().padStart(2,'0')}/${String(ed.getFullYear()).slice(2)}`;
    await prisma.allocation.create({
      data: {
        assignmentCode: nextAsgnCode(),
        assignmentDetail: `${a.employeeRampName}-${projectName} (${sdStr}-${edStr})`,
        employeeId,
        projectId,
        roleOnProject: a.role,
        startDate: a.startDate,
        endDate: a.endDate,
        allocationPercent: a.pct,
      },
    });
    allocCount++;
  }
  console.log(`Created ${allocCount} allocations`);

  // Seed some sample feedback tickets
  await prisma.feedbackTicket.createMany({ data: [
    { type: 'feature', status: 'new', title: 'Add availability calendar view per employee', rawText: 'It would be great to see a month-by-month calendar showing each person\'s availability', chatTranscript: '[]', structuredJson: '{}', pageContext: 'Browse Employees' },
    { type: 'bug', status: 'new', title: 'Search results not sorting by availability correctly', rawText: 'When I search for people with 50% availability, the results seem random', chatTranscript: '[]', structuredJson: '{}', pageContext: 'Search' },
    { type: 'feature', status: 'new', title: 'Export team roster per project to Excel', rawText: 'Need ability to export the team list for a project as an Excel file', chatTranscript: '[]', structuredJson: '{}', pageContext: 'Projects' },
  ]});

  console.log('Seeding complete!');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
