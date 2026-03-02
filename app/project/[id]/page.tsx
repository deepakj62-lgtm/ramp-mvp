import { prisma } from '@/lib/db';
import Link from 'next/link';
import PageContextSetter from '@/components/PageContextSetter';
import DynamicInsightBanner from '@/components/DynamicInsightBanner';
import Avatar from '@/components/Avatar';
import ProfileFeedbackButton from '@/components/ProfileFeedbackButton';

const statusColors: Record<string, string> = {
  'In Progress':  'bg-jade/15 text-jade border border-jade/30',
  'Planning':     'bg-sea/20 text-sea border border-sea/30',
  'On Hold':      'bg-amber-100 text-amber-700 border border-amber-200',
  'Closing':      'bg-rust/15 text-rust border border-rust/30',
  'Completed':    'bg-gray-100 text-gray-500 border border-gray-200',
};

const phaseColors: Record<string, string> = {
  'Discovery':      'bg-sea/15 text-sea',
  'Assessment':     'bg-sea/15 text-sea',
  'Planning':       'bg-sky-100 text-sky-700',
  'Requirements':   'bg-sky-100 text-sky-700',
  'Implementation': 'bg-jade/15 text-jade',
  'Testing':        'bg-jade/20 text-jade',
  'UAT':            'bg-jade/25 text-jade',
  'Go-Live':        'bg-rust/15 text-rust',
  'Support':        'bg-gray-100 text-gray-500',
};

const milestoneStatusStyle: Record<string, { icon: string; bar: string; label: string }> = {
  'Completed':   { icon: '✓', bar: 'bg-jade',     label: 'bg-jade/10 text-jade'   },
  'In Progress': { icon: '●', bar: 'bg-rust',     label: 'bg-rust/10 text-rust'   },
  'Upcoming':    { icon: '○', bar: 'bg-gray-200', label: 'bg-gray-100 text-gray-500' },
};

const roleColors: Record<string, string> = {
  PM:          'bg-jade/15 text-jade',
  BA:          'bg-sea/20 text-sea',
  Testing:     'bg-sky-100 text-sky-700',
  OCM:         'bg-rust/15 text-rust',
  DataAnalyst: 'bg-sea/25 text-sea',
  Cyber:       'bg-rust/20 text-rust',
  Oversight:   'bg-jade/25 text-jade',
  AIAdvisory:  'bg-purple-100 text-purple-700',
};

function fmt(d: Date | string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

function fmtShort(d: Date | string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';
}

function durationLabel(start: Date | null, end: Date | null): string {
  if (!start || !end) return '—';
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years} yr${years > 1 ? 's' : ''}`;
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      allocations: {
        include: { employee: true },
        orderBy: { startDate: 'asc' },
      },
    },
  });

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-rust font-body text-lg">Project not found</p>
        <Link href="/browse/projects" className="text-jade/60 hover:text-jade font-body text-sm mt-2 inline-block">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  let milestones: { title: string; date: string; status: string; notes: string }[] = [];
  try { milestones = JSON.parse(project.milestones || '[]'); } catch {}
  let scopeCategories: string[] = [];
  try { scopeCategories = JSON.parse(project.scopeCategories || '[]'); } catch {}

  // Parse stored AI page layout
  let pageLayout: any = {};
  try {
    const raw = typeof (project as any).pageLayout === 'string'
      ? (project as any).pageLayout : '{}';
    pageLayout = JSON.parse(raw);
  } catch {}
  const hasLayout = Object.keys(pageLayout).length > 0;

  const today       = new Date();
  const startDate   = project.startDate ? new Date(project.startDate) : null;
  const endDate     = project.endDate   ? new Date(project.endDate)   : null;

  const activeAllocs = project.allocations.filter(a => new Date(a.endDate) >= today);
  const pastAllocs   = project.allocations.filter(a => new Date(a.endDate) < today);

  // Timeline progress
  let timelinePct = 0;
  if (startDate && endDate) {
    const total   = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    timelinePct = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
  }

  // Total allocation capacity
  const totalCapacity = activeAllocs.reduce((sum, a) => sum + a.allocationPercent, 0);

  // Milestone counts
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;

  // Chatbot context — structured object so ChatWidget knows entityId for actions
  const chatbotContext = {
    pageName: `Project: ${project.name}`,
    entityType: 'project' as const,
    entityName: project.name,
    entityId: project.id,
    additionalContext: [
      `Client: ${project.clientName}`,
      `Status: ${project.status} | Phase: ${project.currentPhase}`,
      `Class: ${project.engagementClass}`,
      `EM: ${project.engagementManager}`,
      `Team: ${activeAllocs.length} active allocations`,
      `${timelinePct}% through timeline`,
    ].join(' · '),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-0">
      <PageContextSetter context={chatbotContext} />
      <ProfileFeedbackButton
        entityType="project"
        entityName={project.name}
        entityId={project.id}
        pageUrl={`/project/${project.id}`}
      />

      {/* AI Insight Banner */}
      {hasLayout && (
        <div className="mb-6">
          <DynamicInsightBanner layout={pageLayout} />
        </div>
      )}

      {/* Back nav */}
      <Link href="/browse/projects" className="text-jade/50 hover:text-jade text-sm font-body flex items-center gap-1 mb-4 transition-colors">
        ← Back to Projects
      </Link>

      {/* ── Header Card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-jade/20 shadow-sm overflow-hidden mb-6">
        {/* Top accent bar with status-driven color */}
        <div className={`h-1.5 ${
          project.status === 'In Progress' ? 'bg-gradient-to-r from-jade to-jade/50' :
          project.status === 'Planning'    ? 'bg-gradient-to-r from-sea to-sea/50' :
          project.status === 'On Hold'     ? 'bg-gradient-to-r from-amber-400 to-amber-200' :
          project.status === 'Closing'     ? 'bg-gradient-to-r from-rust to-rust/50' :
          'bg-gradient-to-r from-gray-300 to-gray-200'
        }`} />

        <div className="p-6">
          {/* Project identity row */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0">
              <Avatar name={project.clientName} size="lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs text-jade/50">{project.rampProjectCode}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${statusColors[project.status] ?? 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                  {project.status}
                </span>
                {project.currentPhase && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body ${phaseColors[project.currentPhase] ?? 'bg-canvas text-jade/60'}`}>
                    Phase: {project.currentPhase}
                  </span>
                )}
                {project.engagementClass && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-jade/10 text-jade font-body">
                    {project.engagementClass}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-heading font-bold text-jade leading-tight">{project.name}</h1>
              <Link
                href={`/client/${encodeURIComponent(project.clientId)}`}
                className="text-jade/55 hover:text-jade font-body text-sm mt-0.5 inline-flex items-center gap-1 transition-colors"
              >
                {project.clientName}
                <span className="text-jade/30 ml-1">→</span>
              </Link>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Duration</p>
              <p className="text-jade font-heading font-bold text-base leading-tight">
                {durationLabel(startDate, endDate)}
              </p>
              <p className="text-xs text-jade/40 font-body mt-0.5">{fmtShort(startDate)} → {fmtShort(endDate)}</p>
            </div>
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Active Team</p>
              <p className="text-jade font-heading font-bold text-base leading-tight">
                {activeAllocs.length} <span className="text-jade/40 text-sm font-normal">member{activeAllocs.length !== 1 ? 's' : ''}</span>
              </p>
              <p className="text-xs text-jade/40 font-body mt-0.5">{pastAllocs.length} past</p>
            </div>
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Milestones</p>
              <p className="text-jade font-heading font-bold text-base leading-tight">
                {completedMilestones}<span className="text-jade/40 text-sm font-normal">/{milestones.length}</span>
              </p>
              <p className="text-xs text-jade/40 font-body mt-0.5">completed</p>
            </div>
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Capacity</p>
              <p className={`font-heading font-bold text-base leading-tight ${totalCapacity > 400 ? 'text-rust' : 'text-jade'}`}>
                {totalCapacity}%
              </p>
              <p className="text-xs text-jade/40 font-body mt-0.5">total allocated</p>
            </div>
          </div>

          {/* Timeline progress */}
          {startDate && endDate && (
            <div className="mt-5 pt-4 border-t border-jade/8">
              <div className="flex justify-between text-xs font-body mb-1.5">
                <span className="text-jade/50">{fmt(startDate)}</span>
                <span className={`font-semibold ${
                  timelinePct >= 90 ? 'text-rust' :
                  timelinePct >= 60 ? 'text-amber-600' : 'text-jade'
                }`}>
                  {timelinePct}% through timeline
                </span>
                <span className="text-jade/50">{fmt(endDate)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    timelinePct >= 90 ? 'bg-rust' :
                    timelinePct >= 60 ? 'bg-amber-400' :
                    'bg-gradient-to-r from-jade to-jade/70'
                  }`}
                  style={{ width: `${timelinePct}%` }}
                />
              </div>
              {/* Today marker label */}
              <p className="text-xs text-jade/35 font-body mt-1 text-center">
                Today · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Scope tags */}
          {scopeCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {scopeCategories.map(s => (
                <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-jade/20 text-jade/60 font-body capitalize">
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: Description + Milestones */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          {project.description && (
            <div className="bg-white rounded-2xl border border-jade/20 p-6 shadow-sm">
              <h2 className="text-lg font-heading font-bold text-jade mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-jade inline-block" />
                Project Overview
              </h2>
              <div className="font-body text-jade/75 text-sm leading-relaxed space-y-3">
                {project.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-jade/10 grid grid-cols-2 gap-3 text-sm font-body">
                <div>
                  <span className="text-jade/45 text-xs uppercase tracking-wide block mb-0.5">Account Executive</span>
                  {project.accountExecutive ? (
                    <Link
                      href={`/browse/employees?search=${encodeURIComponent(project.accountExecutive)}`}
                      className="text-jade font-medium hover:text-jade/70 hover:underline underline-offset-2 transition-colors"
                    >
                      {project.accountExecutive}
                    </Link>
                  ) : <span className="text-jade/40">—</span>}
                </div>
                <div>
                  <span className="text-jade/45 text-xs uppercase tracking-wide block mb-0.5">Engagement Manager</span>
                  {project.engagementManager ? (
                    <Link
                      href={`/browse/employees?search=${encodeURIComponent(project.engagementManager)}`}
                      className="text-jade font-medium hover:text-jade/70 hover:underline underline-offset-2 transition-colors"
                    >
                      {project.engagementManager}
                    </Link>
                  ) : <span className="text-jade/40">—</span>}
                </div>
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="bg-white rounded-2xl border border-jade/20 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-jade flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-sea inline-block" />
                  Milestones
                </h2>
                <span className="text-xs text-jade/40 font-body bg-canvas px-2 py-1 rounded-full">
                  {completedMilestones}/{milestones.length} complete
                </span>
              </div>

              {/* Progress bar */}
              {milestones.length > 0 && (
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-jade transition-all duration-700"
                    style={{ width: `${Math.round((completedMilestones / milestones.length) * 100)}%` }}
                  />
                </div>
              )}

              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-2.5 top-3 bottom-3 w-px bg-jade/10" />

                <div className="space-y-4">
                  {milestones.map((m, i) => {
                    const st = milestoneStatusStyle[m.status] || milestoneStatusStyle['Upcoming'];
                    return (
                      <div key={i} className="flex gap-4 relative">
                        {/* Status dot */}
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                          m.status === 'Completed'   ? 'bg-jade text-white' :
                          m.status === 'In Progress' ? 'bg-rust text-white' :
                          'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}>
                          {m.status === 'Completed' ? '✓' : m.status === 'In Progress' ? '●' : '○'}
                        </div>
                        {/* Milestone content */}
                        <div className="flex-1 pb-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-body font-semibold text-sm ${
                              m.status === 'Completed'   ? 'text-jade' :
                              m.status === 'In Progress' ? 'text-jade' :
                              'text-jade/45'
                            }`}>{m.title}</span>
                            <span className="text-xs font-mono text-jade/35">{m.date}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-body ${st.label}`}>
                              {m.status}
                            </span>
                          </div>
                          {m.notes && <p className="text-xs text-jade/50 font-body mt-0.5 leading-relaxed">{m.notes}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Team */}
        <div className="space-y-4">
          {/* Active Team */}
          <div className="bg-white rounded-2xl border border-jade/20 p-6 shadow-sm">
            <h2 className="text-lg font-heading font-bold text-jade mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-rust inline-block" />
              Current Team
              <span className="text-base font-normal text-jade/40">({activeAllocs.length})</span>
            </h2>

            {activeAllocs.length === 0 ? (
              <p className="text-sm text-jade/35 font-body italic">No active team members</p>
            ) : (
              <div className="space-y-3">
                {activeAllocs.map(a => (
                  <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-jade/8 last:border-0 last:pb-0 group">
                    <Avatar name={a.employee.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/person/${a.employee.id}`}
                        className="font-body font-semibold text-sm text-jade hover:text-jade/70 group-hover:underline underline-offset-2 transition-colors block truncate"
                      >
                        {a.employee.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-body ${roleColors[a.roleOnProject] ?? 'bg-canvas text-jade/60'}`}>
                          {a.roleOnProject}
                        </span>
                        <span className="text-xs text-jade/40">{a.allocationPercent}%</span>
                      </div>
                      <p className="text-xs text-jade/30 font-mono mt-0.5">Until {fmt(a.endDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Team */}
          {pastAllocs.length > 0 && (
            <div className="bg-white rounded-2xl border border-jade/15 p-5 shadow-sm opacity-70">
              <h3 className="text-sm font-heading font-semibold text-jade/55 mb-3">
                Past Team <span className="font-normal">({pastAllocs.length})</span>
              </h3>
              <div className="space-y-2">
                {pastAllocs.map(a => (
                  <div key={a.id} className="flex items-center gap-2">
                    <Avatar name={a.employee.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/person/${a.employee.id}`} className="text-xs font-body text-jade/50 hover:text-jade/70 transition-colors block truncate">
                        {a.employee.name}
                      </Link>
                      <span className={`text-xs px-1 py-0.5 rounded font-body opacity-60 ${roleColors[a.roleOnProject] ?? 'bg-canvas text-jade/60'}`}>
                        {a.roleOnProject}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
