import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContextSetter from '@/components/PageContextSetter';
import DynamicInsightBanner from '@/components/DynamicInsightBanner';
import ClientUploader from '@/components/ClientUploader';
import Avatar from '@/components/Avatar';
import ProfileFeedbackButton from '@/components/ProfileFeedbackButton';

const fmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const fmtShort = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

const statusStyle: Record<string, { bg: string; dot: string }> = {
  'In Progress': { bg: 'bg-jade/10 text-jade',       dot: 'bg-jade' },
  'Planning':    { bg: 'bg-sea/15 text-sea',          dot: 'bg-sea' },
  'On Hold':     { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  'Closing':     { bg: 'bg-rust/10 text-rust',        dot: 'bg-rust' },
  'Completed':   { bg: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-300' },
};

const sectorLabel: Record<string, string> = {
  pension: 'Pension', insurance: 'Insurance', workers_comp: 'Workers Comp',
  benefits: 'Benefits', cybersecurity: 'Cybersecurity', data: 'Data',
  government: 'Government', vendor: 'Vendor',
};

const sectorAccentBar: Record<string, string> = {
  pension:       'bg-gradient-to-r from-jade to-jade/40',
  insurance:     'bg-gradient-to-r from-sea to-sea/40',
  workers_comp:  'bg-gradient-to-r from-rust to-rust/40',
  cybersecurity: 'bg-gradient-to-r from-red-500 to-red-300',
  benefits:      'bg-gradient-to-r from-sky-500 to-sky-300',
  data:          'bg-gradient-to-r from-purple-500 to-purple-300',
};

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const decodedClientId = decodeURIComponent(clientId);

  const projects = await prisma.project.findMany({
    where: { clientId: decodedClientId },
    include: {
      allocations: {
        include: { employee: true },
        orderBy: { startDate: 'asc' },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  if (projects.length === 0) notFound();

  const clientName = projects[0].clientName;
  const sector     = projects[0].industryTag || '';
  const today      = new Date();

  const clientNote = await prisma.clientNote.findUnique({
    where: { clientId: decodedClientId },
  });

  let pageLayout: any = {};
  if (clientNote?.pageLayout) {
    try { pageLayout = JSON.parse(clientNote.pageLayout); } catch {}
  }

  // Build active team map with roles
  const activeTeamMap = new Map<string, { employee: any; projectNames: string[]; roles: string[] }>();
  for (const p of projects) {
    for (const a of p.allocations) {
      if (new Date(a.endDate) >= today) {
        if (!activeTeamMap.has(a.employeeId)) {
          activeTeamMap.set(a.employeeId, { employee: a.employee, projectNames: [], roles: [] });
        }
        const entry = activeTeamMap.get(a.employeeId)!;
        if (!entry.projectNames.includes(p.name)) entry.projectNames.push(p.name);
        if (!entry.roles.includes(a.roleOnProject)) entry.roles.push(a.roleOnProject);
      }
    }
  }
  const activeTeam = Array.from(activeTeamMap.values());

  const activeProjects    = projects.filter(p => p.status !== 'Completed');
  const completedProjects = projects.filter(p => p.status === 'Completed');

  const totalCapacity = activeProjects.reduce((sum, p) =>
    sum + p.allocations
      .filter(a => new Date(a.endDate) >= today)
      .reduce((s, a) => s + a.allocationPercent, 0), 0);

  const allRoles = new Set<string>();
  for (const p of projects) for (const a of p.allocations) allRoles.add(a.roleOnProject);

  const chatbotContext = {
    pageName: `Client: ${clientName}`,
    entityType: 'client' as const,
    entityName: clientName,
    entityId: clientId,
    additionalContext: `Sector: ${sectorLabel[sector] || sector} · ${projects.length} projects (${activeProjects.length} active) · Team: ${activeTeam.length} members`,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-0">
      <PageContextSetter context={chatbotContext} />
      <ProfileFeedbackButton
        entityType="client"
        entityName={clientName}
        entityId={decodedClientId}
        pageUrl={`/client/${encodeURIComponent(decodedClientId)}`}
      />

      {/* AI Insight Banner */}
      {Object.keys(pageLayout).length > 0 && (
        <div className="mb-6">
          <DynamicInsightBanner layout={pageLayout} />
        </div>
      )}

      {/* Back nav */}
      <Link href="/browse/clients" className="text-jade/50 hover:text-jade text-sm font-body flex items-center gap-1 mb-4 transition-colors">
        ← Back to Clients
      </Link>

      {/* ── Header Card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-jade/20 shadow-sm overflow-hidden mb-6">
        <div className={`h-1.5 ${sectorAccentBar[sector] ?? 'bg-gradient-to-r from-jade to-sea/50'}`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar name={clientName} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-jade/35">{decodedClientId}</span>
                  {sector && (
                    <span className="badge-sea text-xs">{sectorLabel[sector] || sector}</span>
                  )}
                </div>
                <h1 className="text-2xl font-heading font-bold text-jade">{clientName}</h1>
                <p className="text-jade/50 font-body text-sm mt-0.5">
                  {projects.length} engagement{projects.length !== 1 ? 's' : ''} · {activeTeam.length} active staff
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ClientUploader clientId={decodedClientId} clientName={clientName} />
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Active Projects</p>
              <p className="text-jade font-heading font-bold text-xl">{activeProjects.length}</p>
              <p className="text-xs text-jade/35 font-body mt-0.5">{completedProjects.length} completed</p>
            </div>
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Team Members</p>
              <p className="text-jade font-heading font-bold text-xl">{activeTeam.length}</p>
              <p className="text-xs text-jade/35 font-body mt-0.5">currently assigned</p>
            </div>
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Total Capacity</p>
              <p className={`font-heading font-bold text-xl ${totalCapacity > 600 ? 'text-rust' : 'text-jade'}`}>
                {totalCapacity}%
              </p>
              <p className="text-xs text-jade/35 font-body mt-0.5">staff hours allocated</p>
            </div>
            <div className="bg-canvas rounded-xl p-3 border border-jade/10">
              <p className="text-xs text-jade/45 font-body uppercase tracking-wide mb-1">Roles Engaged</p>
              <p className="text-jade font-heading font-bold text-xl">{allRoles.size}</p>
              <p className="text-xs text-jade/35 font-body mt-0.5">unique role types</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Projects */}
        <div className="lg:col-span-2 space-y-6">

          {activeProjects.length > 0 && (
            <div className="bg-white rounded-2xl border border-jade/20 p-6 shadow-sm">
              <h2 className="text-lg font-heading font-bold text-jade mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-jade inline-block" />
                Active Engagements
                <span className="font-normal text-jade/40 text-sm">({activeProjects.length})</span>
              </h2>

              <div className="space-y-2">
                {activeProjects.map(p => {
                  const active  = p.allocations.filter(a => new Date(a.endDate) >= today).length;
                  const st      = statusStyle[p.status] || statusStyle['In Progress'];
                  let pct = 0;
                  if (p.startDate && p.endDate) {
                    const total   = new Date(p.endDate).getTime() - new Date(p.startDate).getTime();
                    const elapsed = today.getTime() - new Date(p.startDate).getTime();
                    pct = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
                  }
                  return (
                    <div key={p.id} className="group rounded-xl border border-jade/10 hover:border-jade/25 p-4 transition-all hover:shadow-sm bg-canvas">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium flex items-center gap-1.5 ${st.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {p.status}
                            </span>
                            {p.currentPhase && (
                              <span className="text-xs text-jade/40 font-body">{p.currentPhase}</span>
                            )}
                            <span className="text-xs font-mono text-jade/25">{p.rampProjectCode}</span>
                          </div>
                          <Link href={`/project/${p.id}`}
                            className="font-body font-semibold text-jade hover:text-jade/70 transition-colors group-hover:underline underline-offset-2">
                            {p.name}
                          </Link>
                          <p className="text-xs text-jade/35 font-body mt-0.5">
                            {fmtShort(p.startDate)} → {fmtShort(p.endDate)}
                          </p>
                          {p.engagementManager && (
                            <Link
                              href={`/browse/employees?search=${encodeURIComponent(p.engagementManager)}`}
                              className="text-xs text-jade/40 font-body mt-0.5 hover:text-jade hover:underline transition-colors inline-block"
                            >
                              EM: {p.engagementManager}
                            </Link>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-jade/50 font-body">{active} staff</p>
                          <Link href={`/project/${p.id}`} className="text-xs text-jade/30 hover:text-jade font-body mt-0.5 block transition-colors">
                            View →
                          </Link>
                        </div>
                      </div>
                      {p.startDate && p.endDate && (
                        <div className="mt-2.5">
                          <div className="w-full bg-white rounded-full h-1 overflow-hidden border border-jade/10">
                            <div className="h-full rounded-full bg-jade/45 transition-all"
                              style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-jade/25 font-body mt-0.5">{pct}% through timeline</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {completedProjects.length > 0 && (
            <div className="bg-white rounded-2xl border border-jade/12 p-6 shadow-sm opacity-75">
              <h2 className="text-base font-heading font-bold text-jade/50 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gray-300 inline-block" />
                Completed
                <span className="font-normal text-jade/30 text-sm">({completedProjects.length})</span>
              </h2>
              <div className="space-y-1.5">
                {completedProjects.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <Link href={`/project/${p.id}`} className="font-body text-sm text-jade/50 hover:text-jade transition-colors">
                      {p.name}
                    </Link>
                    <span className="text-xs text-jade/30 font-body">{fmtShort(p.endDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Active Team */}
        <div>
          <div className="bg-white rounded-2xl border border-jade/20 p-6 shadow-sm sticky top-20">
            <h2 className="text-lg font-heading font-bold text-jade mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-rust inline-block" />
              Current Team
              <span className="font-normal text-jade/40 text-sm">({activeTeam.length})</span>
            </h2>

            {activeTeam.length === 0 ? (
              <p className="text-sm text-jade/35 font-body italic">No active team members</p>
            ) : (
              <div className="space-y-3">
                {activeTeam.map(({ employee, projectNames, roles }) => (
                  <div key={employee.id} className="flex items-start gap-3 group py-1">
                    <Avatar name={employee.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/person/${employee.id}`}
                        className="font-body font-semibold text-jade text-sm hover:text-jade/70 group-hover:underline underline-offset-2 transition-colors block truncate">
                        {employee.name}
                      </Link>
                      <p className="text-xs text-jade/40 font-body truncate">{employee.title}</p>
                      {roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {roles.slice(0, 2).map(r => (
                            <span key={r} className="text-xs px-1.5 py-0.5 rounded bg-jade/10 text-jade font-body">{r}</span>
                          ))}
                        </div>
                      )}
                      {projectNames.length > 1 && (
                        <p className="text-xs text-jade/25 font-body mt-0.5">{projectNames.length} projects</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
