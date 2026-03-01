import { prisma } from '@/lib/db';
import Link from 'next/link';
import PageContextSetter from '@/components/PageContextSetter';

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      allocations: {
        include: { project: true },
        orderBy: { startDate: 'asc' },
      },
    },
  });

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-rust font-body">Employee not found</p>
      </div>
    );
  }

  // Parse JSON string
  let skills: any[] = [];
  let tools: any[] = [];
  let certs: string[] = [];
  try {
    const extractedSkills = typeof employee.extractedSkills === 'string'
      ? JSON.parse(employee.extractedSkills)
      : employee.extractedSkills;
    skills = extractedSkills?.skills || [];
    tools = extractedSkills?.tools || [];
    certs = extractedSkills?.certifications || [];
  } catch (e) {
    // Fallback if parsing fails
  }

  // Calculate monthly allocations
  const monthAllocations: Record<number, number> = {};
  for (const alloc of employee.allocations) {
    const startMonth = alloc.startDate.getMonth();
    const endMonth = alloc.endDate.getMonth();
    for (let m = startMonth; m <= endMonth && m < 12; m++) {
      monthAllocations[m] = (monthAllocations[m] || 0) + alloc.allocationPercent;
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const groupBadge: Record<string, string> = {
    'Linea Solutions': 'badge-jade',
    'Linea Solutions ULC': 'badge-jade',
    'Linea Secure': 'badge-rust',
    'ICON': 'badge-frost',
  };

  return (
    <div className="space-y-6">
      <PageContextSetter context={{
        pageName: 'Employee Profile',
        entityType: 'employee',
        entityName: employee.name,
        entityId: employee.id,
        additionalContext: `${employee.title}, ${employee.practice}, ${employee.location}`,
      }} />

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-jade">{employee.name}</h1>
            <p className="text-jade/50 font-mono text-sm mt-1">{employee.rampName} &middot; {employee.email}</p>
            <p className="text-jade/70 font-body mt-2">{employee.title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={groupBadge[employee.companyGroup] || 'badge-jade'}>
              {employee.companyGroup}
            </span>
            <span className="badge-jade">{employee.level}</span>
            <span className="badge-frost">{employee.location}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="badge-sea">{employee.careerPath}</span>
          <span className="badge-sea">{employee.roleFamily}</span>
          <span className="badge-sea">{employee.practice}</span>
          <span className="badge-sea">{employee.businessUnit}</span>
        </div>
      </div>

      {/* Allocation Timeline */}
      <div className="card p-6">
        <h2 className="text-xl font-heading font-bold text-jade mb-4">Allocation Timeline (2026)</h2>
        <div className="space-y-3">
          {months.map((month, idx) => {
            const alloc = monthAllocations[idx] || 0;
            const free = Math.max(0, 100 - alloc);
            return (
              <div key={month}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-body font-medium text-jade">{month}</span>
                  <span className="text-sm font-body text-jade/60">
                    {free}% free / {alloc}% allocated
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(alloc, 100)}%`,
                      backgroundColor: alloc > 90 ? '#B06C50' : alloc > 60 ? '#AD9A7D' : '#86A4AC',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Assignments */}
      {employee.allocations.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-heading font-bold text-jade mb-4">Assignments</h2>
          <div className="space-y-4">
            {employee.allocations.map((alloc) => (
              <div key={alloc.id} className="border-l-4 border-sea pl-4 py-2">
                <p className="font-body font-medium text-jade">{alloc.project.name}</p>
                <p className="text-sm text-jade/60 font-body">{alloc.project.clientName}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm font-body">
                  <span className="badge-jade text-xs">{alloc.roleOnProject}</span>
                  <span className="text-jade/60">
                    {new Date(alloc.startDate).toLocaleDateString()} - {new Date(alloc.endDate).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-jade">{alloc.allocationPercent}%</span>
                </div>
                <p className="text-xs text-jade/40 font-mono mt-1">{alloc.assignmentCode} &middot; {alloc.assignmentDetail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Expertise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="card p-6">
          <h2 className="text-lg font-heading font-bold text-jade mb-4">Professional Skills</h2>
          <div className="space-y-2">
            {skills.length > 0 ? (
              skills.map((skill: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-body text-jade">{skill.name}</span>
                  <span className="badge-sea text-xs">
                    {skill.yearsOfExp} yrs
                  </span>
                </div>
              ))
            ) : (
              <p className="text-jade/50 text-sm font-body">No skills listed</p>
            )}
          </div>
        </div>

        {/* Tools & Certifications */}
        <div className="card p-6">
          <h2 className="text-lg font-heading font-bold text-jade mb-4">Tools & Certifications</h2>
          <div className="space-y-4">
            {certs.length > 0 && (
              <div>
                <p className="text-sm font-body font-semibold text-jade mb-2">Certifications:</p>
                <div className="flex flex-wrap gap-2">
                  {certs.map((cert: any, idx: number) => (
                    <span key={idx} className="badge-frost">
                      {typeof cert === 'string' ? cert : cert.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tools.length > 0 && (
              <div>
                <p className="text-sm font-body font-semibold text-jade mb-2">Tools/Platforms:</p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool: any, idx: number) => (
                    <span key={idx} className="badge-rust">
                      {typeof tool === 'string' ? tool : tool.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="card p-6">
        <h2 className="text-lg font-heading font-bold text-jade mb-4">Resume</h2>
        <div className="bg-canvas p-4 rounded-lg text-sm text-jade/80 whitespace-pre-wrap font-mono border border-gray-100">
          {employee.resumeText}
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center py-4">
        <Link
          href="/search"
          className="text-jade hover:text-jade-light font-body font-medium underline underline-offset-2"
        >
          Back to Search
        </Link>
      </div>
    </div>
  );
}
