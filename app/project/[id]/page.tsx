import { prisma } from '@/lib/db';
import Link from 'next/link';
import PageContextSetter from '@/components/PageContextSetter';

const statusColors: Record<string, string> = {
  'In Progress':  'bg-jade/20 text-jade border border-jade/40',
  'Planning':     'bg-sea/20 text-sea border border-sea/40',
  'On Hold':      'bg-rust/20 text-rust border border-rust/40',
  'Closing':      'bg-frost/20 text-frost border border-frost/40',
  'Completed':    'bg-canvas text-jade/60 border border-jade/20',
};
const phaseColors: Record<string, string> = {
  'Discovery':      'bg-sea/20 text-sea',
  'Assessment':     'bg-sea/20 text-sea',
  'Planning':       'bg-frost/20 text-frost',
  'Requirements':   'bg-frost/20 text-frost',
  'Implementation': 'bg-jade/20 text-jade',
  'Testing':        'bg-jade/20 text-jade',
  'UAT':            'bg-jade/30 text-jade',
  'Go-Live':        'bg-rust/20 text-rust',
  'Support':        'bg-canvas text-jade/60',
};
const milestoneStatus: Record<string, string> = {
  'Completed':  'text-jade',
  'In Progress':'text-rust',
  'Upcoming':   'text-jade/50',
};
const roleColors: Record<string, string> = {
  PM: 'bg-jade/20 text-jade', BA: 'bg-sea/20 text-sea',
  Testing: 'bg-frost/20 text-frost', OCM: 'bg-rust/20 text-rust',
  DataAnalyst: 'bg-sea/30 text-sea', Cyber: 'bg-rust/30 text-rust',
  Oversight: 'bg-jade/30 text-jade', AIAdvisory: 'bg-frost/30 text-frost',
};

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
    return <div className="text-center py-8"><p className="text-rust font-body">Project not found</p></div>;
  }

  let milestones: { title: string; date: string; status: string; notes: string }[] = [];
  try { milestones = JSON.parse(project.milestones || '[]'); } catch {}
  let scopeCategories: string[] = [];
  try { scopeCategories = JSON.parse(project.scopeCategories || '[]'); } catch {}

  const today = new Date();
  const activeAllocs = project.allocations.filter(a => new Date(a.endDate) >= today);
  const pastAllocs   = project.allocations.filter(a => new Date(a.endDate) < today);

  const classColors: Record<string, string> = {
    Client: 'bg-jade/20 text-jade', ULC: 'bg-sea/20 text-sea',
    Cyber: 'bg-rust/20 text-rust',  ICON: 'bg-frost/20 text-frost',
  };

  const fmt = (d: Date | string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // Rich context for chatbot
  const chatbotContext = `Project: ${project.name} (${project.rampProjectCode})
Client: ${project.clientName}
Status: ${project.status} | Phase: ${project.currentPhase}
Engagement Class: ${project.engagementClass} | Industry: ${project.industryTag ?? 'N/A'}
Account Executive: ${project.accountExecutive} | Engagement Manager: ${project.engagementManager}
Start: ${fmt(project.startDate)} | End: ${fmt(project.endDate)}
Scope: ${scopeCategories.join(', ')}

Description:
${project.description}

Current Team (active allocations):
${activeAllocs.map(a => `  - ${a.employee.name} (${a.roleOnProject}, ${a.allocationPercent}% allocated, ends ${fmt(a.endDate)})`).join('\n')}

Milestones:
${milestones.map(m => `  - [${m.status}] ${m.title} (${m.date})${m.notes ? ': ' + m.notes : ''}`).join('\n')}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <PageContextSetter context={chatbotContext} />

      {/* Back */}
      <Link href="/browse/projects" className="text-jade/70 hover:text-jade text-sm font-body flex items-center gap-1">
        ← Back to Projects
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-jade/20 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="font-mono text-sm text-jade/60">{project.rampProjectCode}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${statusColors[project.status] ?? 'bg-canvas text-jade/60 border border-jade/20'}`}>
                {project.status}
              </span>
              {project.currentPhase && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-body ${phaseColors[project.currentPhase] ?? 'bg-canvas text-jade/60'}`}>
                  Phase: {project.currentPhase}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-display font-bold text-jade mb-1">{project.name}</h1>
            <p className="text-jade/70 font-body">{project.clientName}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded font-body font-medium ${classColors[project.engagementClass] ?? 'bg-canvas text-jade'}`}>
              {project.engagementClass}
            </span>
            {project.industryTag && (
              <span className="text-xs px-2 py-1 rounded bg-sea/20 text-sea font-body font-medium capitalize">
                {project.industryTag.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-body border-t border-jade/10 pt-4">
          <div><span className="text-jade/50 block text-xs uppercase tracking-wide">Start Date</span>{fmt(project.startDate)}</div>
          <div><span className="text-jade/50 block text-xs uppercase tracking-wide">End Date</span>{fmt(project.endDate)}</div>
          <div><span className="text-jade/50 block text-xs uppercase tracking-wide">Account Executive</span>{project.accountExecutive}</div>
          <div><span className="text-jade/50 block text-xs uppercase tracking-wide">Engagement Manager</span>{project.engagementManager}</div>
        </div>

        {scopeCategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {scopeCategories.map(s => (
              <span key={s} className="text-xs px-2 py-0.5 rounded bg-canvas border border-jade/20 text-jade/70 font-body capitalize">
                {s.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Description + Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <div className="bg-white rounded-xl border border-jade/20 p-6 shadow-sm">
              <h2 className="text-lg font-display font-semibold text-jade mb-3">Project Overview</h2>
              <div className="font-body text-jade/80 text-sm space-y-3">
                {project.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="bg-white rounded-xl border border-jade/20 p-6 shadow-sm">
              <h2 className="text-lg font-display font-semibold text-jade mb-4">Milestones</h2>
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {m.status === 'Completed'  && <span className="text-jade text-base">✓</span>}
                      {m.status === 'In Progress' && <span className="text-rust text-base">●</span>}
                      {m.status === 'Upcoming'    && <span className="text-jade/30 text-base">○</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-body font-medium text-sm ${milestoneStatus[m.status] ?? 'text-jade/60'}`}>
                          {m.title}
                        </span>
                        <span className="text-xs text-jade/40 font-mono">{m.date}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-body ${
                          m.status === 'Completed'  ? 'bg-jade/10 text-jade/70' :
                          m.status === 'In Progress'? 'bg-rust/10 text-rust' :
                          'bg-canvas text-jade/40'
                        }`}>{m.status}</span>
                      </div>
                      {m.notes && <p className="text-xs text-jade/50 font-body mt-0.5">{m.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Team */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-jade/20 p-6 shadow-sm">
            <h2 className="text-lg font-display font-semibold text-jade mb-4">
              Current Team <span className="text-base font-normal text-jade/50">({activeAllocs.length})</span>
            </h2>
            {activeAllocs.length === 0 ? (
              <p className="text-sm text-jade/40 font-body">No active team members</p>
            ) : (
              <div className="space-y-3">
                {activeAllocs.map(a => (
                  <div key={a.id} className="border-b border-jade/10 pb-3 last:border-0 last:pb-0">
                    <Link href={`/person/${a.employee.id}`} className="font-body font-medium text-sm text-jade hover:text-jade/70">
                      {a.employee.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-body ${roleColors[a.roleOnProject] ?? 'bg-canvas text-jade/60'}`}>
                        {a.roleOnProject}
                      </span>
                      <span className="text-xs text-jade/50 font-body">{a.allocationPercent}%</span>
                    </div>
                    <p className="text-xs text-jade/40 font-mono mt-0.5">
                      Until {fmt(a.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pastAllocs.length > 0 && (
            <div className="bg-white rounded-xl border border-jade/20 p-4 shadow-sm">
              <h3 className="text-sm font-display font-semibold text-jade/60 mb-3">Past Team Members</h3>
              <div className="space-y-2">
                {pastAllocs.map(a => (
                  <div key={a.id} className="flex items-center justify-between">
                    <Link href={`/person/${a.employee.id}`} className="text-xs font-body text-jade/50 hover:text-jade/70">
                      {a.employee.name}
                    </Link>
                    <span className={`text-xs px-1 py-0.5 rounded font-body opacity-60 ${roleColors[a.roleOnProject] ?? 'bg-canvas text-jade/60'}`}>
                      {a.roleOnProject}
                    </span>
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
