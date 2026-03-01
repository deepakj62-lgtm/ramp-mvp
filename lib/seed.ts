import { prisma } from './db';

// ─── REALISTIC LINEA CLIENTS ────────────────────────────────────────────────
const CLIENTS = [
  // US Pension funds
  { id: 'c-calstrs', name: 'California State Teachers Retirement System (CalSTRS)', sector: 'pension', country: 'US' },
  { id: 'c-ipers', name: 'Iowa Public Employees Retirement System (IPERS)', sector: 'pension', country: 'US' },
  { id: 'c-mainepers', name: 'Maine Public Employees Retirement System (MainePERS)', sector: 'pension', country: 'US' },
  { id: 'c-npers', name: 'Nebraska Public Employees Retirement Systems (NPERS)', sector: 'pension', country: 'US' },
  { id: 'c-samcera', name: 'San Bernardino County Employees Retirement Association (SamCERA)', sector: 'pension', country: 'US' },
  { id: 'c-sjcera', name: 'San Joaquin County Employees Retirement Association (SJCERA)', sector: 'pension', country: 'US' },
  { id: 'c-sacers', name: 'Sacramento County Employees Retirement System (SCERS)', sector: 'pension', country: 'US' },
  { id: 'c-ersg', name: 'Employees Retirement System of Georgia (ERSGA)', sector: 'pension', country: 'US' },
  { id: 'c-tcrs', name: 'Tennessee Consolidated Retirement System (TCRS)', sector: 'pension', country: 'US' },
  { id: 'c-ilsurs', name: 'Illinois State Universities Retirement System (SURS)', sector: 'pension', country: 'US' },
  { id: 'c-opf', name: 'Ohio Police & Fire Pension Fund (OP&F)', sector: 'pension', country: 'US' },
  { id: 'c-opers', name: 'Oklahoma Public Employees Retirement System (OPERS)', sector: 'pension', country: 'US' },
  { id: 'c-arters', name: 'Arkansas Public Employees Retirement System (APERS)', sector: 'pension', country: 'US' },
  { id: 'c-wetf', name: 'Wisconsin Employee Trust Funds (ETF)', sector: 'pension', country: 'US' },
  { id: 'c-fppa', name: 'Fire & Police Pension Association of Colorado (FPPA)', sector: 'pension', country: 'US' },
  { id: 'c-mnpera', name: 'Minnesota Public Employees Retirement Association (MN PERA)', sector: 'pension', country: 'US' },
  { id: 'c-scpeba', name: 'South Carolina Public Employee Benefit Authority (SC PEBA)', sector: 'pension', country: 'US' },
  // Canadian pension & benefits
  { id: 'c-otpp', name: 'Ontario Teachers Pension Plan Board (OTPP)', sector: 'pension', country: 'CA' },
  { id: 'c-upp', name: 'University Pension Plan (UPP)', sector: 'pension', country: 'CA' },
  { id: 'c-ttcpp', name: 'Toronto Transit Commission Pension Plan (TTCPP)', sector: 'pension', country: 'CA' },
  { id: 'c-asebp', name: 'Alberta School Employee Benefit Plan (ASEBP)', sector: 'benefits', country: 'CA' },
  { id: 'c-atrf', name: 'Alberta Teachers Retirement Fund (ATRF)', sector: 'pension', country: 'CA' },
  // Workers Compensation
  { id: 'c-wcbpei', name: 'Workers Compensation Board of Prince Edward Island (WCB PEI)', sector: 'workers_comp', country: 'CA' },
  { id: 'c-skwcb', name: 'Saskatchewan Workers Compensation Board (SK WCB)', sector: 'workers_comp', country: 'CA' },
  { id: 'c-yukon', name: 'Yukon Workers Safety and Compensation Board (YWSCC)', sector: 'workers_comp', country: 'CA' },
  { id: 'c-wsib', name: 'Workplace Safety and Insurance Board (WSIB)', sector: 'workers_comp', country: 'CA' },
  { id: 'c-wcebp', name: 'Workers Compensation and Employers Bipartisan (WCEBP)', sector: 'workers_comp', country: 'US' },
  // Insurance
  { id: 'c-mcare', name: 'Mcare Fund', sector: 'insurance', country: 'US' },
  { id: 'c-provident', name: 'Provident10', sector: 'insurance', country: 'US' },
  { id: 'c-mccain', name: 'McCain Foods', sector: 'insurance', country: 'CA' },
  // Vendors (appear as ecosystem partners)
  { id: 'c-sagitec', name: 'Sagitec Solutions', sector: 'vendor', country: 'US' },
  { id: 'c-plannera', name: 'Plannera', sector: 'vendor', country: 'US' },
];

// ─── REALISTIC LINEA PROJECTS ───────────────────────────────────────────────
let prjCounter = 100;
function nextPrjCode() { return `PRJ-${String(prjCounter++).padStart(6, '0')}`; }

const PROJECTS = [
  // Linea Solutions (US) - Pension
  { code: nextPrjCode(), name: 'CalSTRS - PAS Modernization Strategic Roadmap', clientId: 'c-calstrs', ae: 'Tiggelaar, Lon', em: 'Dudaney, Sanjay', cls: 'Client', industry: 'pension', scope: 'roadmap,assessment,procurement' },
  { code: nextPrjCode(), name: 'IPERS - Implementation Oversight Phase 2', clientId: 'c-ipers', ae: 'Tiggelaar, Lon', em: 'Patel, Riya', cls: 'Client', industry: 'pension', scope: 'implementation,oversight,testing' },
  { code: nextPrjCode(), name: 'MainePERS - Current State Assessment', clientId: 'c-mainepers', ae: 'Tiggelaar, Lon', em: 'Dudaney, Sanjay', cls: 'Client', industry: 'pension', scope: 'assessment' },
  { code: nextPrjCode(), name: 'SamCERA - Strategic Planning & Procurement', clientId: 'c-samcera', ae: 'Tiggelaar, Lon', em: 'Rivera, Carla', cls: 'Client', industry: 'pension', scope: 'assessment,roadmap,procurement' },
  { code: nextPrjCode(), name: 'Wisconsin ETF - PAS Implementation Support', clientId: 'c-wetf', ae: 'Tiggelaar, Lon', em: 'Dudaney, Sanjay', cls: 'Client', industry: 'pension', scope: 'implementation,ocm,testing' },
  { code: nextPrjCode(), name: 'FPPA - Phase 1 Business Transformation', clientId: 'c-fppa', ae: 'Tiggelaar, Lon', em: 'Rivera, Carla', cls: 'Client', industry: 'pension', scope: 'assessment,roadmap,ai_advisory' },
  { code: nextPrjCode(), name: 'MN PERA - PAS RFP & Procurement Support', clientId: 'c-mnpera', ae: 'Tiggelaar, Lon', em: 'Patel, Riya', cls: 'Client', industry: 'pension', scope: 'procurement,assessment' },
  { code: nextPrjCode(), name: 'SC PEBA - Implementation Oversight', clientId: 'c-scpeba', ae: 'Tiggelaar, Lon', em: 'Dudaney, Sanjay', cls: 'Client', industry: 'pension', scope: 'implementation,oversight,ocm' },
  { code: nextPrjCode(), name: 'Mcare - Additional Work', clientId: 'c-mcare', ae: 'Tiggelaar, Lon', em: 'Rivera, Carla', cls: 'Client', industry: 'insurance', scope: 'assessment,roadmap' },
  // Linea Solutions (US) - WC
  { code: nextPrjCode(), name: 'WCEBP - Strategic Consulting', clientId: 'c-wcebp', ae: 'Tiggelaar, Lon', em: 'Patel, Riya', cls: 'Client', industry: 'workers_comp', scope: 'assessment,roadmap' },
  // Linea Solutions ULC (Canada)
  { code: nextPrjCode(), name: 'WCB PEI - Transformation Roadmap Phase B1', clientId: 'c-wcbpei', ae: 'Tiggelaar, Lon', em: 'Chen, Wei', cls: 'ULC', industry: 'workers_comp', scope: 'roadmap,implementation,ocm' },
  { code: nextPrjCode(), name: 'Yukon - SOW #4 - Pre Implementation', clientId: 'c-yukon', ae: 'Tiggelaar, Lon', em: 'Chen, Wei', cls: 'ULC', industry: 'workers_comp', scope: 'implementation,assessment' },
  { code: nextPrjCode(), name: 'McCain Foods - TPA Assessment', clientId: 'c-mccain', ae: 'Tiggelaar, Lon', em: 'Chen, Wei', cls: 'ULC', industry: 'insurance', scope: 'assessment' },
  { code: nextPrjCode(), name: 'UPP - Benefits System Review', clientId: 'c-upp', ae: 'Tiggelaar, Lon', em: 'Chen, Wei', cls: 'ULC', industry: 'pension', scope: 'assessment,roadmap' },
  { code: nextPrjCode(), name: 'WSIB - Transformation Program Conversion Strategy', clientId: 'c-wsib', ae: 'Tiggelaar, Lon', em: 'Chen, Wei', cls: 'ULC', industry: 'workers_comp', scope: 'implementation,data_conversion' },
  // Linea Secure
  { code: nextPrjCode(), name: 'OP&F - vCISO Services 2026', clientId: 'c-opf', ae: 'Dewar, Peter', em: 'Davis, Idrissa', cls: 'Cyber', industry: 'cybersecurity', scope: 'cybersecurity,vciso' },
  { code: nextPrjCode(), name: 'WCB PEI - vCISO & Threat Monitoring', clientId: 'c-wcbpei', ae: 'Dewar, Peter', em: 'Davis, Idrissa', cls: 'Cyber', industry: 'cybersecurity', scope: 'cybersecurity,vciso,vulnerability_scanning' },
  { code: nextPrjCode(), name: 'ASEBP - Penetration Testing', clientId: 'c-asebp', ae: 'Dewar, Peter', em: 'Davis, Idrissa', cls: 'Cyber', industry: 'cybersecurity', scope: 'cybersecurity,pen_testing' },
  { code: nextPrjCode(), name: 'Provident10 - Cybersecurity Risk Assessment', clientId: 'c-provident', ae: 'Dewar, Peter', em: 'Davis, Idrissa', cls: 'Cyber', industry: 'cybersecurity', scope: 'cybersecurity,risk_assessment' },
  { code: nextPrjCode(), name: 'ATRF - Identity Verification Review', clientId: 'c-atrf', ae: 'Dewar, Peter', em: 'Davis, Idrissa', cls: 'Cyber', industry: 'cybersecurity', scope: 'cybersecurity,identity_verification' },
  // ICON Integration & Design
  { code: nextPrjCode(), name: 'TTCPP - Project Encore Data Conversion', clientId: 'c-ttcpp', ae: 'Tiggelaar, Lon', em: 'Nakamura, Kenji', cls: 'ICON', industry: 'data', scope: 'data_conversion,profiling,cleansing,reconciliation' },
  { code: nextPrjCode(), name: 'SC PEBA - Data Conversion (TELUS)', clientId: 'c-scpeba', ae: 'Tiggelaar, Lon', em: 'Nakamura, Kenji', cls: 'ICON', industry: 'data', scope: 'data_conversion,reconciliation' },
  { code: nextPrjCode(), name: 'WSIB - Legacy Data Migration', clientId: 'c-wsib', ae: 'Tiggelaar, Lon', em: 'Nakamura, Kenji', cls: 'ICON', industry: 'data', scope: 'data_conversion,profiling,cleansing' },
  { code: nextPrjCode(), name: 'IPERS - Data Quality & Cleansing', clientId: 'c-ipers', ae: 'Tiggelaar, Lon', em: 'Nakamura, Kenji', cls: 'ICON', industry: 'data', scope: 'profiling,cleansing' },
  // Internal / Placeholder
  { code: nextPrjCode(), name: 'Linea Placeholder', clientId: 'c-sagitec', ae: 'Tiggelaar, Lon', em: 'Tiggelaar, Lon', cls: 'Client', industry: 'pension', scope: 'internal' },
];

// ─── EMPLOYEE DEFINITIONS ───────────────────────────────────────────────────
// Each employee is hand-crafted to have role-appropriate skills

interface EmployeeDef {
  first: string; last: string;
  companyGroup: string; businessUnit: string;
  careerPath: string; roleFamily: string;
  practice: string; level: string; title: string;
  location: string;
  skills: string[];   // domain/technical skill names
  tools: string[];    // tool/platform names
  certs: string[];    // certifications
}

const EMPLOYEES: EmployeeDef[] = [
  // ═══════ LINEA SOLUTIONS (US) ═══════════════════════════════════════════
  // Leadership / Account Executives
  { first: 'Lon', last: 'Tiggelaar', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'CrossPractice', level: 'Principal', title: 'Principal, Account Executive', location: 'US', skills: ['Strategic Planning', 'Client Relationship Management', 'Pension Administration', 'Insurance Domain', 'Workers Compensation', 'Business Development'], tools: ['RAMP', 'Salesforce', 'MS Project'], certs: ['PMP'] },
  { first: 'Sanjay', last: 'Dudaney', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'Pension', level: 'Principal', title: 'Principal, Engagement Manager', location: 'US', skills: ['Project Management', 'Pension Administration', 'Strategic Planning', 'Implementation Oversight', 'Stakeholder Management', 'Business Case Development'], tools: ['RAMP', 'MS Project', 'JIRA', 'Confluence'], certs: ['PMP', 'ITIL'] },
  { first: 'Riya', last: 'Patel', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'Pension', level: 'Senior', title: 'Senior Engagement Manager', location: 'US', skills: ['Project Management', 'Requirements Gathering', 'Pension Administration', 'Procurement Support', 'Stakeholder Management', 'UAT Coordination'], tools: ['RAMP', 'MS Project', 'JIRA', 'Confluence', 'Visio'], certs: ['PMP'] },
  { first: 'Carla', last: 'Rivera', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'CrossPractice', level: 'Senior', title: 'Senior Engagement Manager', location: 'US', skills: ['Project Management', 'Insurance Domain', 'Strategic Planning', 'Roadmap Development', 'Vendor Management', 'Business Transformation'], tools: ['RAMP', 'MS Project', 'Smartsheet', 'Confluence'], certs: ['PMP', 'Six Sigma'] },
  // Senior Consultants - BA
  { first: 'James', last: 'Steele', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Senior', title: 'Senior Consultant', location: 'US', skills: ['Requirements Gathering', 'Business Process Improvement', 'Pension Administration', 'Current State Assessment', 'Gap Analysis', 'Stakeholder Management'], tools: ['Visio', 'Confluence', 'JIRA', 'Miro'], certs: ['CBAP'] },
  { first: 'Lisa', last: 'Vargas', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Insurance', level: 'Senior', title: 'Senior Consultant', location: 'US', skills: ['Requirements Gathering', 'Insurance Domain', 'Claims Processing', 'Business Analysis', 'Process Mapping', 'UAT Coordination'], tools: ['Visio', 'Confluence', 'JIRA', 'Balsamiq'], certs: ['CBAP'] },
  { first: 'Michael', last: 'Torres', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Senior', title: 'Senior Consultant', location: 'US', skills: ['Requirements Gathering', 'Pension Administration', 'Benefits Administration', 'Defined Benefit Plans', 'Vendor Evaluation', 'Implementation Support'], tools: ['Vitech', 'JIRA', 'Confluence', 'MS Project'], certs: ['PMP'] },
  { first: 'Sarah', last: 'Meadows', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'WorkersComp', level: 'Senior', title: 'Senior Consultant', location: 'US', skills: ['Workers Compensation', 'Claims Processing', 'Requirements Gathering', 'Business Process Improvement', 'Compliance & Audit', 'Current State Assessment'], tools: ['Sagitec', 'JIRA', 'Confluence', 'Visio'], certs: [] },
  // Mid-level Consultants - BA
  { first: 'David', last: 'Chen', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Consultant', title: 'Consultant', location: 'US', skills: ['Requirements Gathering', 'Pension Administration', 'Process Mapping', 'Gap Analysis', 'Test Planning'], tools: ['JIRA', 'Confluence', 'Visio'], certs: [] },
  { first: 'Emily', last: 'Wright', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Insurance', level: 'Consultant', title: 'Consultant', location: 'US', skills: ['Insurance Domain', 'Requirements Gathering', 'Business Analysis', 'Claims Processing', 'Documentation'], tools: ['JIRA', 'Confluence', 'Visio', 'Miro'], certs: [] },
  { first: 'Nathan', last: 'Haws', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Consultant', title: 'Consultant', location: 'US', skills: ['Pension Administration', 'Requirements Gathering', 'Current State Assessment', 'Stakeholder Interviews', 'Process Mapping'], tools: ['JIRA', 'Confluence', 'Visio', 'Power BI'], certs: [] },
  { first: 'Jessica', last: 'Kim', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Benefits', level: 'Consultant', title: 'Consultant', location: 'US', skills: ['Benefits Administration', 'Pension Administration', 'Requirements Gathering', 'Business Analysis', 'Data Analysis'], tools: ['JIRA', 'Confluence', 'Excel'], certs: [] },
  // Associates - BA
  { first: 'Brandon', last: 'Park', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Associate', title: 'Associate', location: 'US', skills: ['Requirements Gathering', 'Documentation', 'Process Mapping', 'Meeting Facilitation'], tools: ['JIRA', 'Confluence', 'Visio'], certs: [] },
  { first: 'Priya', last: 'Singh', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Insurance', level: 'Associate', title: 'Associate', location: 'US', skills: ['Business Analysis', 'Insurance Domain', 'Documentation', 'Testing Support'], tools: ['JIRA', 'Confluence'], certs: [] },
  // Specialists - Technical Analysis
  { first: 'Robert', last: 'Anderson', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice', level: 'Senior', title: 'Senior Specialist, Technical Analysis', location: 'US', skills: ['SQL Server', 'T-SQL Development', 'Data Warehousing', 'ETL Design', 'Data Analysis', 'Performance Tuning'], tools: ['SQL Server', 'SSIS', 'Power BI', 'Azure'], certs: ['SQL Server Certification', 'Azure Administrator'] },
  { first: 'Angela', last: 'Morris', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'Pension', level: 'Consultant', title: 'Specialist, Technical Analysis', location: 'US', skills: ['SQL Server', 'Data Analysis', 'Reporting', 'Vitech Administration', 'API Development'], tools: ['Vitech', 'SQL Server', 'SSRS', 'Power BI'], certs: [] },
  { first: 'Kevin', last: 'Thompson', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice', level: 'Consultant', title: 'Specialist, Technical Analysis', location: 'US', skills: ['Python', 'Data Analysis', 'Statistical Analysis', 'ETL Design', 'API Development', 'C#/.NET'], tools: ['Python', 'Azure', 'Power BI', 'Tableau'], certs: ['AWS Solutions Architect'] },
  // Specialists - Testing
  { first: 'Maria', last: 'Gonzalez', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'Testing', practice: 'Pension', level: 'Senior', title: 'Senior Specialist, Testing', location: 'US', skills: ['UAT Coordination', 'Test Planning', 'Regression Testing', 'Pension Administration', 'Defect Management', 'Test Automation'], tools: ['JIRA', 'Confluence', 'Selenium', 'Azure DevOps'], certs: ['ISTQB'] },
  { first: 'Thomas', last: 'Baker', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'Testing', practice: 'Insurance', level: 'Consultant', title: 'Specialist, Testing', location: 'US', skills: ['UAT Coordination', 'Test Planning', 'Insurance Domain', 'Defect Tracking', 'Regression Testing'], tools: ['JIRA', 'Azure DevOps', 'TestRail'], certs: [] },
  // Specialists - OCM
  { first: 'Jennifer', last: 'Campbell', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'OCM', practice: 'CrossPractice', level: 'Senior', title: 'Senior Specialist, OCM', location: 'US', skills: ['OCM (Organizational Change Management)', 'Training Development', 'Stakeholder Communication', 'Change Impact Assessment', 'Readiness Evaluation', 'Communications Planning'], tools: ['Prosci ADKAR', 'Confluence', 'SharePoint', 'Articulate'], certs: ['Prosci Change Management', 'PMP'] },
  { first: 'Amanda', last: 'Foster', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'OCM', practice: 'Pension', level: 'Consultant', title: 'Specialist, OCM', location: 'US', skills: ['OCM (Organizational Change Management)', 'Training Development', 'Communications Planning', 'Stakeholder Analysis'], tools: ['Prosci ADKAR', 'Confluence', 'SharePoint'], certs: [] },
  // Specialists - Training / Tech Writing
  { first: 'Laura', last: 'Mitchell', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'Training', practice: 'CrossPractice', level: 'Consultant', title: 'Specialist, Training & Documentation', location: 'US', skills: ['Training Development', 'Technical Writing', 'Curriculum Design', 'User Guides', 'Documentation'], tools: ['Articulate', 'Confluence', 'Camtasia', 'SharePoint'], certs: [] },
  // PM specialists
  { first: 'Richard', last: 'Hayes', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'Pension', level: 'Consultant', title: 'Consultant, Project Management', location: 'US', skills: ['Project Management', 'Agile/Scrum', 'Risk Management', 'Schedule Management', 'Pension Administration'], tools: ['MS Project', 'JIRA', 'Smartsheet', 'Confluence'], certs: ['PMP', 'CSM'] },
  { first: 'Stephanie', last: 'Cruz', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'WorkersComp', level: 'Consultant', title: 'Consultant, Project Management', location: 'US', skills: ['Project Management', 'Workers Compensation', 'Agile/Scrum', 'Waterfall', 'Stakeholder Management'], tools: ['MS Project', 'JIRA', 'Smartsheet'], certs: ['PMP'] },
  // AI Advisory (newer specialty)
  { first: 'Deepak', last: 'Johny', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice', level: 'Consultant', title: 'Specialist, AI & Innovation', location: 'US', skills: ['AI Strategy', 'AI Governance', 'Python', 'Data Analysis', 'Machine Learning', 'Process Automation', 'Pension Administration'], tools: ['Python', 'Azure AI', 'Power BI', 'Tableau', 'Claude', 'GitHub Copilot'], certs: ['Azure AI Engineer'] },
  // More Associates
  { first: 'Tyler', last: 'Reed', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Associate', title: 'Associate', location: 'US', skills: ['Requirements Gathering', 'Documentation', 'Pension Administration', 'Process Mapping'], tools: ['JIRA', 'Confluence'], certs: [] },
  { first: 'Samantha', last: 'Lee', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Insurance', level: 'Associate', title: 'Associate', location: 'US', skills: ['Business Analysis', 'Documentation', 'Insurance Domain', 'Testing Support'], tools: ['JIRA', 'Confluence', 'Excel'], certs: [] },
  { first: 'Jason', last: 'Cooper', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice', level: 'Associate', title: 'Associate, Technical Analysis', location: 'US', skills: ['SQL Server', 'Data Analysis', 'Python', 'Reporting'], tools: ['SQL Server', 'Python', 'Excel', 'Power BI'], certs: [] },
  { first: 'Rachel', last: 'Green', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'Testing', practice: 'Pension', level: 'Associate', title: 'Associate, Testing', location: 'US', skills: ['Test Execution', 'Defect Tracking', 'Documentation', 'UAT Support'], tools: ['JIRA', 'Azure DevOps'], certs: [] },
  { first: 'Marcus', last: 'Williams', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'WorkersComp', level: 'Consultant', title: 'Consultant', location: 'US', skills: ['Workers Compensation', 'Requirements Gathering', 'Business Process Improvement', 'Claims Processing'], tools: ['JIRA', 'Confluence', 'Visio', 'Sagitec'], certs: [] },
  { first: 'Katherine', last: 'Reeves', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Consultant', title: 'Consultant', location: 'US', skills: ['Pension Administration', 'Defined Benefit Plans', 'Requirements Gathering', 'Current State Assessment', 'Compliance & Audit'], tools: ['JIRA', 'Confluence', 'Visio', 'Vitech'], certs: [] },

  // ═══════ LINEA SOLUTIONS ULC (CANADA) ═══════════════════════════════════
  { first: 'Wei', last: 'Chen', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'WorkersComp', level: 'Senior', title: 'Senior Engagement Manager', location: 'Canada', skills: ['Project Management', 'Workers Compensation', 'Business Transformation', 'Roadmap Development', 'Stakeholder Management', 'Implementation Oversight'], tools: ['RAMP', 'MS Project', 'JIRA', 'Confluence'], certs: ['PMP'] },
  { first: 'Sophie', last: 'Tremblay', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'WorkersComp', level: 'Senior', title: 'Senior Consultant', location: 'Canada', skills: ['Workers Compensation', 'Requirements Gathering', 'Business Process Improvement', 'French Bilingual', 'Current State Assessment', 'Gap Analysis'], tools: ['JIRA', 'Confluence', 'Visio', 'Miro'], certs: ['CBAP'] },
  { first: 'Daniel', last: 'Murphy', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Consultant', title: 'Consultant', location: 'Canada', skills: ['Pension Administration', 'Requirements Gathering', 'Benefits Administration', 'Process Mapping', 'Data Analysis'], tools: ['JIRA', 'Confluence', 'Visio'], certs: [] },
  { first: 'Anika', last: 'Sharma', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'OCM', practice: 'WorkersComp', level: 'Consultant', title: 'Specialist, OCM', location: 'Canada', skills: ['OCM (Organizational Change Management)', 'Training Development', 'Communications Planning', 'Stakeholder Analysis', 'Workers Compensation'], tools: ['Prosci ADKAR', 'Confluence', 'SharePoint'], certs: ['Prosci Change Management'] },
  { first: 'Liam', last: 'MacKenzie', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'CrossPractice', level: 'Consultant', title: 'Specialist, Technical Analysis', location: 'Canada', skills: ['SQL Server', 'Data Analysis', 'ETL Design', 'Reporting', 'Python'], tools: ['SQL Server', 'SSIS', 'Power BI', 'Python'], certs: [] },
  { first: 'Claire', last: 'Bouchard', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'Testing', practice: 'WorkersComp', level: 'Consultant', title: 'Specialist, Testing', location: 'Canada', skills: ['UAT Coordination', 'Test Planning', 'Workers Compensation', 'Defect Management', 'Regression Testing'], tools: ['JIRA', 'Azure DevOps', 'TestRail'], certs: [] },
  { first: 'Oliver', last: 'Nguyen', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'WorkersComp', level: 'Associate', title: 'Associate', location: 'Canada', skills: ['Requirements Gathering', 'Documentation', 'Workers Compensation', 'Process Mapping'], tools: ['JIRA', 'Confluence'], certs: [] },
  { first: 'Emma', last: 'Robertson', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Associate', title: 'Associate', location: 'Canada', skills: ['Business Analysis', 'Pension Administration', 'Documentation', 'Testing Support'], tools: ['JIRA', 'Confluence', 'Excel'], certs: [] },
  { first: 'Hassan', last: 'Ali', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'Pension', level: 'Consultant', title: 'Consultant, Project Management', location: 'Canada', skills: ['Project Management', 'Pension Administration', 'Agile/Scrum', 'Risk Management'], tools: ['MS Project', 'JIRA', 'Confluence'], certs: ['PMP', 'CSM'] },
  { first: 'Isabelle', last: 'Gagnon', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'Training', practice: 'CrossPractice', level: 'Consultant', title: 'Specialist, Training & Documentation', location: 'Canada', skills: ['Training Development', 'Technical Writing', 'French Bilingual', 'Curriculum Design', 'User Guides'], tools: ['Articulate', 'Confluence', 'Camtasia'], certs: [] },

  // ═══════ LINEA SECURE ═══════════════════════════════════════════════════
  { first: 'Peter', last: 'Dewar', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Principal', title: 'President, Linea Secure', location: 'US', skills: ['Cybersecurity Strategy', 'NIST Framework', 'Risk Management', 'Client Relationship Management', 'Governance', 'Security Program Development'], tools: ['Nessus', 'Splunk', 'NIST CSF'], certs: ['CISSP', 'CISM'] },
  { first: 'Idrissa', last: 'Davis', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Senior', title: 'VP Cybersecurity Delivery Services', location: 'US', skills: ['Cybersecurity Strategy', 'vCISO Services', 'NIST Framework', 'Incident Response', 'Vulnerability Management', 'Security Program Development'], tools: ['Splunk', 'Nessus', 'Tenable', 'NIST CSF'], certs: ['CISSP', 'CISM', 'CEH'] },
  { first: 'Tosan', last: 'Tenumah', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Senior', title: 'Senior Cybersecurity Consultant', location: 'US', skills: ['Penetration Testing', 'Vulnerability Assessment', 'NIST Framework', 'Security Controls Review', 'Risk Assessment', 'Threat Monitoring'], tools: ['Burp Suite', 'Metasploit', 'Nessus', 'Kali Linux', 'Wireshark'], certs: ['CEH', 'OSCP', 'CISSP'] },
  { first: 'Ferdinand', last: 'Frimpong', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Consultant', title: 'Cybersecurity Consultant', location: 'US', skills: ['Vulnerability Assessment', 'Identity Verification', 'NIST Framework', 'Security Audit', 'Incident Response Planning', 'Access Controls'], tools: ['Nessus', 'Tenable', 'Splunk', 'CrowdStrike'], certs: ['CEH', 'CompTIA Security+'] },
  { first: 'Aditi', last: 'Kapoor', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Consultant', title: 'Cybersecurity Consultant', location: 'US', skills: ['Risk Assessment', 'NIST Framework', 'Cybersecurity Roadmap', 'Security Governance', 'Compliance & Audit', 'PII Protection'], tools: ['Nessus', 'Splunk', 'NIST CSF', 'ServiceNow'], certs: ['CISSP'] },
  { first: 'Marcus', last: 'Brown', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Consultant', title: 'Cybersecurity Consultant', location: 'US', skills: ['Penetration Testing', 'Threat Monitoring', 'Vulnerability Scanning', 'Security Controls Review', 'Incident Response'], tools: ['Burp Suite', 'Metasploit', 'Nessus', 'Kali Linux'], certs: ['CEH', 'OSCP'] },
  { first: 'Jordan', last: 'Mitchell', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Associate', title: 'Associate Cybersecurity Consultant', location: 'US', skills: ['Vulnerability Scanning', 'Security Audit', 'NIST Framework', 'Documentation', 'Risk Assessment'], tools: ['Nessus', 'Tenable', 'Splunk'], certs: ['CompTIA Security+'] },
  { first: 'Nadia', last: 'Okafor', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Associate', title: 'Associate Cybersecurity Consultant', location: 'US', skills: ['Security Audit', 'NIST Framework', 'Identity Verification', 'Access Controls', 'Documentation'], tools: ['Nessus', 'Splunk', 'CrowdStrike'], certs: ['CompTIA Security+'] },

  // ═══════ ICON INTEGRATION & DESIGN ═════════════════════════════════════
  { first: 'Kenji', last: 'Nakamura', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice', level: 'Senior', title: 'Senior Data Architect, ICON Lead', location: 'US', skills: ['Data Architecture', 'Data Conversion', 'Data Profiling', 'Reconciliation', 'System Profiling', 'Data Quality Management'], tools: ['SQL Server', 'SSIS', 'Python', 'Azure Data Factory'], certs: ['Certified Data Professional'] },
  { first: 'Patricia', last: 'Hayes', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'Pension', level: 'Senior', title: 'Senior Data Conversion Engineer', location: 'US', skills: ['Data Conversion', 'ETL Design', 'Data Cleansing', 'SQL Server', 'Data Validation', 'Pension Administration'], tools: ['SQL Server', 'SSIS', 'Python', 'Excel'], certs: [] },
  { first: 'Victor', last: 'Osei', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice', level: 'Consultant', title: 'Data Analyst', location: 'US', skills: ['Data Profiling', 'Data Quality Management', 'SQL Server', 'Reconciliation', 'Data Cleansing', 'Business Rules Documentation'], tools: ['SQL Server', 'Python', 'Excel', 'Power BI'], certs: [] },
  { first: 'Sandra', last: 'Petrova', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'Pension', level: 'Consultant', title: 'Data Conversion Engineer', location: 'US', skills: ['Data Conversion', 'ETL Design', 'SQL Server', 'T-SQL Development', 'Data Validation', 'Staging Database Design'], tools: ['SQL Server', 'SSIS', 'Python'], certs: ['SQL Server Certification'] },
  { first: 'Alex', last: 'Drummond', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice', level: 'Consultant', title: 'Reconciliation Analyst', location: 'Canada', skills: ['Reconciliation', 'Data Validation', 'Data Analysis', 'SQL Server', 'Reporting', 'Data Integrity Verification'], tools: ['SQL Server', 'Excel', 'Power BI', 'Python'], certs: [] },
  { first: 'Miriam', last: 'Santos', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'Pension', level: 'Consultant', title: 'Data Cleansing Specialist', location: 'US', skills: ['Data Cleansing', 'Data Quality Management', 'DQCP Process', 'SQL Server', 'Client Remediation Cycles'], tools: ['SQL Server', 'Python', 'Excel'], certs: [] },
  { first: 'Ryan', last: 'Foster', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice', level: 'Associate', title: 'Junior Data Analyst', location: 'US', skills: ['Data Profiling', 'SQL Server', 'Data Analysis', 'Documentation', 'Excel'], tools: ['SQL Server', 'Excel', 'Python'], certs: [] },
  { first: 'Tanya', last: 'Volkov', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice', level: 'Associate', title: 'Junior Data Analyst', location: 'Canada', skills: ['Data Analysis', 'SQL Server', 'Data Profiling', 'Documentation', 'Reporting'], tools: ['SQL Server', 'Excel', 'Power BI'], certs: [] },
  { first: 'Gregory', last: 'Pike', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'CrossPractice', level: 'Senior', title: 'Senior DBA', location: 'US', skills: ['Database Administration', 'SQL Server', 'Performance Tuning', 'Data Security', 'Backup & Recovery', 'Data Architecture'], tools: ['SQL Server', 'Azure SQL', 'SSMS', 'RedGate'], certs: ['SQL Server Certification', 'Azure Administrator'] },
  // Extra employees to reach ~80
  { first: 'Christina', last: 'Moore', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Senior', title: 'Senior Consultant', location: 'US', skills: ['Pension Administration', 'Defined Benefit Plans', 'Requirements Gathering', 'Business Process Improvement', 'Implementation Support', 'Vitech Administration'], tools: ['Vitech', 'JIRA', 'Confluence', 'Visio'], certs: ['PMP'] },
  { first: 'Patrick', last: 'Sullivan', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'PM', practice: 'Insurance', level: 'Senior', title: 'Senior Consultant, PM', location: 'US', skills: ['Project Management', 'Insurance Domain', 'Agile/Scrum', 'Stakeholder Management', 'Vendor Management', 'Risk Management'], tools: ['MS Project', 'JIRA', 'Smartsheet', 'Confluence'], certs: ['PMP', 'CSM'] },
  { first: 'Diana', last: 'Petrov', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'TechAnalysis', practice: 'Pension', level: 'Senior', title: 'Senior Specialist, Enterprise Architecture', location: 'US', skills: ['Enterprise Architecture', 'TOGAF', 'Technology Strategy', 'System Integration', 'Data Architecture', 'Cloud Migration'], tools: ['Azure', 'AWS', 'Visio', 'ArchiMate'], certs: ['TOGAF', 'AWS Solutions Architect'] },
  { first: 'Brian', last: 'Kelly', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'WorkersComp', level: 'Consultant', title: 'Consultant', location: 'US', skills: ['Workers Compensation', 'Claims Processing', 'Requirements Gathering', 'Business Analysis', 'Compliance & Audit'], tools: ['Sagitec', 'JIRA', 'Confluence', 'Visio'], certs: [] },
  { first: 'Michelle', last: 'Adams', companyGroup: 'Linea Solutions', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'OCM', practice: 'Pension', level: 'Consultant', title: 'Specialist, OCM', location: 'US', skills: ['OCM (Organizational Change Management)', 'Training Development', 'Communications Planning', 'Pension Administration', 'Readiness Evaluation'], tools: ['Prosci ADKAR', 'Confluence', 'SharePoint', 'Articulate'], certs: ['Prosci Change Management'] },
  { first: 'Andrew', last: 'Ross', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Consultant', roleFamily: 'BA', practice: 'Pension', level: 'Consultant', title: 'Consultant', location: 'Canada', skills: ['Pension Administration', 'Requirements Gathering', 'Business Process Improvement', 'Data Analysis', 'Process Mapping'], tools: ['JIRA', 'Confluence', 'Visio', 'Power BI'], certs: [] },
  { first: 'Maya', last: 'Delgado', companyGroup: 'Linea Solutions ULC', businessUnit: 'Delivery', careerPath: 'Specialist', roleFamily: 'Testing', practice: 'Pension', level: 'Associate', title: 'Associate, Testing', location: 'Canada', skills: ['Test Execution', 'Defect Tracking', 'Documentation', 'UAT Support', 'Pension Administration'], tools: ['JIRA', 'Azure DevOps'], certs: [] },
  { first: 'Ian', last: 'Fraser', companyGroup: 'Linea Secure', businessUnit: 'Cyber', careerPath: 'Consultant', roleFamily: 'Cyber', practice: 'CrossPractice', level: 'Consultant', title: 'Cybersecurity Consultant', location: 'Canada', skills: ['Cybersecurity Strategy', 'NIST Framework', 'Vulnerability Assessment', 'Security Governance', 'Risk Assessment'], tools: ['Nessus', 'Splunk', 'Tenable', 'NIST CSF'], certs: ['CISSP'] },
  { first: 'Elena', last: 'Popova', companyGroup: 'ICON', businessUnit: 'Data', careerPath: 'Specialist', roleFamily: 'Data', practice: 'Pension', level: 'Consultant', title: 'Data Conversion Engineer', location: 'Canada', skills: ['Data Conversion', 'ETL Design', 'SQL Server', 'Data Validation', 'Reconciliation', 'Python'], tools: ['SQL Server', 'SSIS', 'Python', 'Excel'], certs: [] },
];

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

function rampName(first: string, last: string): string {
  return `${last}, ${first}`;
}

function emailFor(first: string, last: string, group: string): string {
  const initial = first[0].toUpperCase();
  const domain = group === 'Linea Secure' ? 'lineasecure.com'
    : group === 'ICON' ? 'iconintegration.com'
    : 'lineasolutions.com';
  return `${initial}${last}@${domain}`;
}

let asCounter = 3600;
function nextAssignmentCode(): string {
  return `AS-${String(asCounter++).padStart(5, '0')}`;
}

function assignmentDetail(empRampName: string, projectName: string, start: Date, end: Date): string {
  const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
  return `${empRampName}-${projectName} (${fmt(start)}-${fmt(end)})`;
}

function generateRealisticResume(emp: EmployeeDef): string {
  const yearsExp = emp.level === 'Associate' ? 2 : emp.level === 'Consultant' ? 6 : emp.level === 'Senior' ? 12 : 18;
  const companyDesc = emp.companyGroup === 'Linea Secure' ? 'cybersecurity consulting'
    : emp.companyGroup === 'ICON' ? 'data management and conversion'
    : 'pension, insurance, and benefits consulting';
  const skillList = emp.skills.slice(0, 4).join(', ');

  return `PROFESSIONAL SUMMARY
${emp.title} with ${yearsExp}+ years of experience in ${companyDesc}. Proven expertise in ${skillList}. Track record of delivering high-quality results for public sector pension funds, workers compensation boards, and insurance organizations across North America.

PROFESSIONAL EXPERIENCE
${emp.title} (${2026 - Math.floor(yearsExp / 3)}-Present) - ${emp.companyGroup}
- ${emp.skills[0] ? `Led ${emp.skills[0].toLowerCase()} initiatives across multiple client engagements` : 'Led client engagements'}
- ${emp.skills[1] ? `Delivered ${emp.skills[1].toLowerCase()} solutions for complex organizational challenges` : 'Delivered solutions for complex challenges'}
- Managed stakeholder relationships and coordinated cross-functional teams
- ${emp.practice !== 'CrossPractice' ? `Specialized in ${emp.practice.toLowerCase()} sector engagements` : 'Supported engagements across pension, insurance, and workers compensation sectors'}

${emp.level !== 'Associate' ? `Previous Role (${2026 - Math.floor(yearsExp / 2)}-${2026 - Math.floor(yearsExp / 3)}) - ${emp.companyGroup}
- ${emp.skills[2] ? `Implemented ${emp.skills[2].toLowerCase()} processes` : 'Implemented business processes'}
- ${emp.skills[3] ? `Supported ${emp.skills[3].toLowerCase()} activities` : 'Supported project delivery'}
- Coordinated with clients and vendors on deliverables
- Contributed to proposals and statements of work` : ''}

TECHNICAL SKILLS
${emp.skills.map(s => `- ${s}`).join('\n')}

TOOLS & PLATFORMS
${emp.tools.map(t => `- ${t}`).join('\n')}

${emp.certs.length > 0 ? `CERTIFICATIONS
${emp.certs.map(c => `- ${c}`).join('\n')}` : ''}

EDUCATION
- Bachelor's Degree in ${emp.roleFamily === 'Cyber' ? 'Computer Science / Cybersecurity' : emp.roleFamily === 'Data' ? 'Computer Science / Information Systems' : 'Business Administration / Information Technology'}
`.trim();
}

// Role assignment logic: what roles make sense per project type
function roleForProject(emp: EmployeeDef, projScope: string): string {
  if (emp.roleFamily === 'PM') return 'PM';
  if (emp.roleFamily === 'OCM') return 'OCM';
  if (emp.roleFamily === 'Testing') return 'Testing';
  if (emp.roleFamily === 'Training') return 'Training';
  if (emp.roleFamily === 'Cyber') return 'Cyber';
  if (emp.roleFamily === 'Data') {
    if (projScope.includes('profiling')) return 'DataProfiling';
    if (projScope.includes('cleansing')) return 'DataCleansing';
    if (projScope.includes('reconciliation')) return 'Reconciliation';
    return 'DataConversion';
  }
  if (emp.roleFamily === 'TechAnalysis') {
    if (emp.skills.includes('AI Strategy')) return 'AIAdvisory';
    return 'TechAnalysis';
  }
  return 'BA';
}

// ─── MAIN SEED ───────────────────────────────────────────────────────────────

export async function seed() {
  console.log('Seeding database with realistic Linea data...');

  // Clear existing data
  await prisma.allocation.deleteMany();
  await prisma.feedbackTicket.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();

  // Create projects
  const createdProjects: any[] = [];
  for (const proj of PROJECTS) {
    const client = CLIENTS.find(c => c.id === proj.clientId)!;
    const project = await prisma.project.create({
      data: {
        rampProjectCode: proj.code,
        name: proj.name,
        clientId: proj.clientId,
        clientName: client.name,
        accountExecutive: proj.ae,
        engagementManager: proj.em,
        engagementClass: proj.cls,
        industryTag: proj.industry,
        scopeCategories: JSON.stringify(proj.scope.split(',')),
      },
    });
    createdProjects.push({ ...project, scope: proj.scope, cls: proj.cls });
  }
  console.log(`Created ${createdProjects.length} projects`);

  // Create employees
  const createdEmployees: any[] = [];
  for (const emp of EMPLOYEES) {
    const employee = await prisma.employee.create({
      data: {
        name: `${emp.first} ${emp.last}`,
        rampName: rampName(emp.first, emp.last),
        email: emailFor(emp.first, emp.last, emp.companyGroup),
        companyGroup: emp.companyGroup,
        businessUnit: emp.businessUnit,
        careerPath: emp.careerPath,
        roleFamily: emp.roleFamily,
        practice: emp.practice,
        level: emp.level,
        title: emp.title,
        location: emp.location,
        resumeText: generateRealisticResume(emp),
        extractedSkills: JSON.stringify({
          skills: emp.skills.map(s => ({
            name: s,
            yearsOfExp: emp.level === 'Associate' ? 2 : emp.level === 'Consultant' ? 5 : emp.level === 'Senior' ? 10 : 15,
            confidence: 'high',
          })),
          tools: emp.tools.map(t => ({
            name: t,
            yearsOfExp: emp.level === 'Associate' ? 1 : emp.level === 'Consultant' ? 4 : emp.level === 'Senior' ? 8 : 12,
            confidence: 'high',
          })),
          certifications: emp.certs,
        }),
      },
    });
    createdEmployees.push({ ...employee, def: emp });
  }
  console.log(`Created ${createdEmployees.length} employees`);

  // Create realistic assignments
  // Match employees to appropriate projects based on company group and practice
  let allocationCount = 0;

  for (const empRecord of createdEmployees) {
    const emp = empRecord.def as EmployeeDef;

    // Find eligible projects for this employee
    let eligibleProjects = createdProjects.filter(p => {
      if (emp.companyGroup === 'Linea Secure') return p.cls === 'Cyber';
      if (emp.companyGroup === 'ICON') return p.cls === 'ICON';
      if (emp.companyGroup === 'Linea Solutions ULC') return p.cls === 'ULC' || p.cls === 'Client';
      return p.cls === 'Client' || p.cls === 'ULC'; // Linea Solutions US can support ULC projects too
    });

    // Further filter: practice alignment
    if (emp.practice !== 'CrossPractice') {
      const practiceProjects = eligibleProjects.filter(p => {
        if (emp.practice === 'Pension') return p.scope.includes('pension') || p.industry === 'pension';
        if (emp.practice === 'Insurance') return p.industry === 'insurance';
        if (emp.practice === 'WorkersComp') return p.industry === 'workers_comp' || p.scope.includes('workers');
        if (emp.practice === 'Benefits') return p.industry === 'benefits' || p.industry === 'pension';
        return true;
      });
      if (practiceProjects.length > 0) eligibleProjects = practiceProjects;
    }

    if (eligibleProjects.length === 0) continue;

    // Principals/Seniors get 1-2 projects, others 1-3
    const numAssignments = emp.level === 'Principal' ? 1 : emp.level === 'Senior' ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 2) + 1;

    for (let j = 0; j < numAssignments && j < eligibleProjects.length; j++) {
      const project = eligibleProjects[j % eligibleProjects.length];
      const startMonth = Math.floor(Math.random() * 8); // Jan-Aug start
      const duration = Math.floor(Math.random() * 4) + 2; // 2-5 months
      const startDate = new Date(2026, startMonth, 1);
      const endDate = new Date(2026, startMonth + duration, 30);
      const allocationPercent = emp.level === 'Principal' ? 25 : [50, 50, 75, 100][Math.floor(Math.random() * 4)];

      const empRampName = rampName(emp.first, emp.last);
      const role = roleForProject(emp, project.scope);

      await prisma.allocation.create({
        data: {
          assignmentCode: nextAssignmentCode(),
          assignmentDetail: assignmentDetail(empRampName, project.name, startDate, endDate),
          employeeId: empRecord.id,
          projectId: project.id,
          roleOnProject: role,
          startDate,
          endDate,
          allocationPercent,
        },
      });
      allocationCount++;
    }
  }
  console.log(`Created ${allocationCount} assignments`);

  // Create sample feedback tickets
  const sampleFeedback = [
    {
      type: 'bug',
      title: 'The search results look great but it would be nice to filter by exact skill match confidence level',
      rawText: 'When I search for OCM skills, I see some results where the confidence is only medium. It would be helpful to filter by high confidence only so I get the most relevant matches.',
    },
    {
      type: 'bug',
      title: 'Search results not showing all matches',
      rawText: 'When I search for SQL skills, the results seem incomplete. I know more ICON people have SQL experience than what shows up.',
    },
    {
      type: 'feature',
      title: 'Add saved search filters',
      rawText: 'I frequently search for "50% free pension people in Canada" - it would be great to save common search filters.',
    },
    {
      type: 'feature',
      title: 'Add company group filter to search',
      rawText: 'Would love to filter by Linea Secure or ICON specifically. Sometimes I need a cybersecurity person and only want to see Secure team members.',
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
          priority: feedback.type === 'bug' ? 1 : 2,
        }),
        status: 'new',
      },
    });
  }

  console.log('Seeding complete!');
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
