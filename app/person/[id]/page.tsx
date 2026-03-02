import { prisma } from '@/lib/db';
import Link from 'next/link';
import PageContextSetter from '@/components/PageContextSetter';
import ResumeUploader from '@/components/ResumeUploader';
import DynamicInsightBanner from '@/components/DynamicInsightBanner';
import Avatar from '@/components/Avatar';
import ProfileFeedbackButton from '@/components/ProfileFeedbackButton';
import AllocationTimeline from '@/components/AllocationTimeline';

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

  // Parse skills
  let skills: any[] = [];
  let tools: any[] = [];
  let certs: string[] = [];
  try {
    const raw = typeof employee.extractedSkills === 'string'
      ? JSON.parse(employee.extractedSkills)
      : employee.extractedSkills;
    skills = raw?.skills || [];
    tools  = raw?.tools  || [];
    certs  = raw?.certifications || [];
  } catch {}

  // Parse AI page layout
  let layout: any = {};
  try {
    const raw = typeof (employee as any).pageLayout === 'string'
      ? (employee as any).pageLayout : '{}';
    layout = JSON.parse(raw);
  } catch {}
  const hasLayout = Object.keys(layout).length > 0;

  // Determine profile type & section order
  const profileType: string = layout.profileType || 'consultant';
  const showTimeline: boolean = hasLayout ? (layout.showAllocationTimeline !== false) : true;
  const primaryMetrics: { label: string; value: string }[] = layout.primaryMetrics || [];

  // Default section order per profile type if no layout
  const defaultSections: Record<string, string[]> = {
    consultant:  ['allocations', 'skills', 'bio'],
    specialist:  ['certifications', 'allocations', 'skills', 'bio'],
    executive:   ['metrics', 'bio', 'skills'],
    sales:       ['metrics', 'skills', 'bio'],
    manager:     ['metrics', 'allocations', 'skills', 'bio'],
    technical:   ['skills', 'allocations', 'bio'],
    support:     ['metrics', 'bio', 'skills'],
  };
  const sections: string[] = (hasLayout && Array.isArray(layout.sections) && layout.sections.length > 0)
    ? layout.sections
    : (defaultSections[profileType] || defaultSections.consultant);

  const today       = new Date();
  const currentYear = today.getFullYear();
  const curMonth    = today.getMonth();
  const fmt = (d: Date | string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Monthly allocation map
  const monthAlloc: Record<number, number> = {};
  for (const a of employee.allocations) {
    const s  = new Date(a.startDate);
    const e  = new Date(a.endDate);
    const sm = s.getFullYear() === currentYear ? s.getMonth() : (s.getFullYear() < currentYear ? 0 : 12);
    const em = e.getFullYear() === currentYear ? e.getMonth() : (e.getFullYear() > currentYear ? 11 : -1);
    for (let m = sm; m <= em; m++) monthAlloc[m] = (monthAlloc[m] || 0) + a.allocationPercent;
  }
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const activeAllocs = employee.allocations.filter(a => new Date(a.endDate) >= today);
  const pastAllocs   = employee.allocations.filter(a => new Date(a.endDate) < today);

  // Chatbot context — structured object so ChatWidget knows entityId for actions
  const chatbotContext = {
    pageName: `Employee Profile: ${employee.name}`,
    entityType: 'employee' as const,
    entityName: employee.name,
    entityId: employee.id,
    additionalContext: [
      `${employee.title} | ${employee.level} | ${employee.location}`,
      `Group: ${employee.companyGroup} | BU: ${employee.businessUnit}`,
      `Role: ${employee.roleFamily} | Practice: ${employee.practice}`,
      `Skills: ${skills.map((s: any) => s.name).join(', ')}`,
      `Active allocations: ${activeAllocs.length}`,
    ].join(' · '),
  };

  const groupBadge: Record<string, string> = {
    'Linea Solutions': 'badge-jade', 'Linea Solutions ULC': 'badge-jade',
    'Linea Secure': 'badge-rust',   'ICON': 'badge-frost',
  };

  // ── Section: Allocations ──────────────────────────────────────────
  const freeMonthCount = months.filter((_, i) => !monthAlloc[i]).length;
  const overMonthCount = months.filter((_, i) => (monthAlloc[i] || 0) > 100).length;

  const renderAllocations = () => (
    <div key="allocations">
      {showTimeline && (
        <AllocationTimeline
          allocations={employee.allocations.map(a => ({
            id: a.id,
            allocationPercent: a.allocationPercent,
            roleOnProject: a.roleOnProject,
            startDate: a.startDate.toISOString(),
            endDate: a.endDate.toISOString(),
            assignmentCode: a.assignmentCode,
            project: {
              id: a.project.id,
              name: a.project.name,
              clientId: a.project.clientId,
              clientName: a.project.clientName,
            },
          }))}
          currentYear={currentYear}
          currentMonth={curMonth}
          overMonthCount={overMonthCount}
          freeMonthCount={freeMonthCount}
        />
      )}

      {(activeAllocs.length > 0 || pastAllocs.length > 0) && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-heading font-bold text-jade mb-4">
            Active Assignments{' '}
            <span className="text-base font-normal text-jade/50">({activeAllocs.length})</span>
          </h2>
          {activeAllocs.length === 0 ? (
            <p className="text-sm text-jade/40 font-body">No active assignments</p>
          ) : (
            <div className="space-y-3">
              {activeAllocs.map(a => (
                <div key={a.id} className="relative border-l-4 border-jade pl-4 py-3 pr-3 rounded-r-xl hover:bg-jade/5 hover:border-jade/70 transition-all group">
                  {/* Stretched link covers whole card → project page */}
                  <Link href={`/project/${a.project.id}`}
                    className="font-body font-semibold text-jade group-hover:text-jade/70 text-sm after:absolute after:inset-0 after:rounded-r-xl after:content-['']">
                    {a.project.name}
                    <span className="ml-2 text-jade/30 group-hover:text-jade/50 text-xs">→</span>
                  </Link>
                  {/* Client link z-10 sits above the overlay */}
                  <Link href={`/client/${encodeURIComponent(a.project.clientId)}`}
                    className="relative z-10 text-xs text-jade/55 font-body mt-0.5 hover:text-jade hover:underline transition-colors block w-fit">
                    {a.project.clientName}
                  </Link>
                  <div className="relative z-10 flex flex-wrap gap-2 mt-2 text-xs font-body">
                    <span className="badge-jade">{a.roleOnProject}</span>
                    <span className="text-jade/50">{fmt(a.startDate)} – {fmt(a.endDate)}</span>
                    <span className={`font-semibold ${a.allocationPercent > 90 ? 'text-rust' : 'text-jade'}`}>{a.allocationPercent}%</span>
                  </div>
                  <p className="relative z-10 text-xs text-jade/30 font-mono mt-1">{a.assignmentCode}</p>
                </div>
              ))}
            </div>
          )}
          {pastAllocs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-heading font-semibold text-jade/50 mb-3">
                Past Assignments ({pastAllocs.length})
              </h3>
              <div className="space-y-1.5">
                {pastAllocs.map(a => (
                  <Link key={a.id} href={`/project/${a.project.id}`}
                    className="block border-l-4 border-jade/20 pl-4 py-1.5 pr-2 rounded-r-lg hover:bg-jade/5 hover:border-jade/40 transition-all group">
                    <span className="text-sm font-body text-jade/50 group-hover:text-jade/70 group-hover:underline">
                      {a.project.name}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-0.5 text-xs font-body text-jade/35">
                      <span>{a.roleOnProject}</span>
                      <span>·</span>
                      <span>{fmt(a.startDate)} – {fmt(a.endDate)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Section: Metrics ──────────────────────────────────────────────
  const renderMetrics = () => primaryMetrics.length > 0 ? (
    <div key="metrics" className="card p-6 mb-6">
      <h2 className="text-lg font-heading font-bold text-jade mb-4">At a Glance</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryMetrics.map((m: { label: string; value: string }, i: number) => (
          <div key={i} className="bg-canvas rounded-lg p-4 border border-jade/10 text-center">
            <p className="text-xs text-jade/50 font-body uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-jade font-heading font-bold text-lg leading-tight">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // ── Section: Skills ───────────────────────────────────────────────
  const renderSkills = () => (
    <div key="skills" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="card p-6">
        <h2 className="text-lg font-heading font-bold text-jade mb-4">Professional Skills</h2>
        <div className="space-y-2">
          {skills.length > 0 ? skills.map((s: any, i: number) => (
            <div key={i} className="flex justify-between items-center">
              <span className="font-body text-jade">{s.name}</span>
              <span className="badge-sea text-xs">{s.yearsOfExp} yrs</span>
            </div>
          )) : <p className="text-jade/50 text-sm font-body">No skills listed. Upload a resume to populate.</p>}
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-heading font-bold text-jade mb-4">Tools &amp; Platforms</h2>
        <div className="space-y-4">
          {tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tools.map((t: any, i: number) => (
                <span key={i} className="badge-rust">{typeof t === 'string' ? t : t.name}</span>
              ))}
            </div>
          )}
          {tools.length === 0 && <p className="text-jade/50 text-sm font-body">No tools listed.</p>}
        </div>
      </div>
    </div>
  );

  // ── Section: Certifications ───────────────────────────────────────
  const renderCertifications = () => certs.length > 0 ? (
    <div key="certifications" className="card p-6 mb-6">
      <h2 className="text-lg font-heading font-bold text-jade mb-3">Certifications &amp; Credentials</h2>
      <div className="flex flex-wrap gap-3">
        {certs.map((c: any, i: number) => (
          <span key={i} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-jade/5 border border-jade/20 text-jade font-body font-medium text-sm">
            <span className="text-jade/60">✓</span>
            {typeof c === 'string' ? c : c.name}
          </span>
        ))}
      </div>
    </div>
  ) : null;

  // ── Section: Bio ──────────────────────────────────────────────────
  const renderBio = () => (
    <div key="bio" className="card p-6 mb-6">
      <h2 className="text-lg font-heading font-bold text-jade mb-4">
        {profileType === 'executive' ? 'Executive Profile' :
         profileType === 'sales'     ? 'About' :
         profileType === 'technical' ? 'Technical Profile' : 'Professional Profile'}
      </h2>
      {employee.resumeText ? (
        <div className="space-y-3">
          {employee.resumeText.split('\n\n').map((para, i) => (
            <p key={i} className="font-body text-jade/80 text-sm leading-relaxed">{para}</p>
          ))}
        </div>
      ) : (
        <p className="text-jade/50 text-sm font-body italic">No profile yet. Upload a resume to generate one.</p>
      )}
      <ResumeUploader employeeId={employee.id} employeeName={employee.name} />
    </div>
  );

  const sectionMap: Record<string, () => React.ReactNode> = {
    allocations:    renderAllocations,
    metrics:        renderMetrics,
    skills:         renderSkills,
    certifications: renderCertifications,
    bio:            renderBio,
  };

  return (
    <div className="space-y-0">
      <PageContextSetter context={chatbotContext} />
      <ProfileFeedbackButton
        entityType="employee"
        entityName={employee.name}
        entityId={employee.id}
        pageUrl={`/person/${employee.id}`}
      />

      {/* AI Insight Banner */}
      {hasLayout && (
        <div className="mb-6">
          <DynamicInsightBanner layout={layout} />
        </div>
      )}

      {/* Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Avatar name={employee.name} size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-jade">{employee.name}</h1>
              <p className="text-jade/50 font-mono text-sm mt-1">{employee.rampName} &middot; {employee.email}</p>
              <p className="text-jade/70 font-body mt-2">{employee.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={groupBadge[employee.companyGroup] || 'badge-jade'}>{employee.companyGroup}</span>
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

      {/* Dynamic sections in AI-determined order */}
      {sections.map(sectionId => {
        const renderer = sectionMap[sectionId];
        return renderer ? renderer() : null;
      })}

      {/* If no layout yet, show upload prompt */}
      {!hasLayout && (
        <div className="card p-6 mb-6 border-dashed border-2 border-jade/20 bg-canvas text-center">
          <p className="text-jade/50 font-body text-sm">
            Upload a resume to generate an AI-personalized layout for this profile
          </p>
        </div>
      )}
    </div>
  );
}
