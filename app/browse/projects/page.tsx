'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FilterBar from '@/components/FilterBar';
import PageContextSetter from '@/components/PageContextSetter';
import AddEntityModal from '@/components/AddEntityModal';

interface Project {
  id: string;
  rampProjectCode: string;
  name: string;
  clientId: string;
  clientName: string;
  accountExecutive: string;
  engagementManager: string;
  engagementClass: string;
  industryTag: string;
  scopeCategories: string;
  status: string;
  currentPhase: string;
  startDate: string | null;
  endDate: string | null;
  _count: { allocations: number };
}

const statusStyle: Record<string, { cls: string; dot: string }> = {
  'In Progress': { cls: 'bg-jade/10 text-jade',       dot: 'bg-jade' },
  'Planning':    { cls: 'bg-sea/15 text-sea',          dot: 'bg-sea' },
  'On Hold':     { cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  'Closing':     { cls: 'bg-rust/10 text-rust',        dot: 'bg-rust' },
  'Completed':   { cls: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-300' },
};

const classStyle: Record<string, string> = {
  'Client': 'badge-jade',
  'ULC':    'badge-sea',
  'Cyber':  'badge-rust',
  'ICON':   'badge-frost',
};

const industryLabel: Record<string, string> = {
  pension:       'Pension',
  insurance:     'Insurance',
  workers_comp:  'Workers Comp',
  benefits:      'Benefits',
  cybersecurity: 'Cyber',
  data:          'Data',
  government:    'Government',
  vendor:        'Vendor',
};

const filters = [
  {
    key: 'search',
    label: 'Search',
    type: 'text' as const,
    placeholder: 'Search by name, client, manager, description, scope, phase...',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'All Statuses', value: 'all' },
      { label: 'In Progress',  value: 'In Progress' },
      { label: 'Planning',     value: 'Planning' },
      { label: 'On Hold',      value: 'On Hold' },
      { label: 'Closing',      value: 'Closing' },
      { label: 'Completed',    value: 'Completed' },
    ],
  },
  {
    key: 'engagementClass',
    label: 'Engagement Class',
    type: 'select' as const,
    options: [
      { label: 'All Classes', value: 'all' },
      { label: 'Client',      value: 'Client' },
      { label: 'ULC',         value: 'ULC' },
      { label: 'Cyber',       value: 'Cyber' },
      { label: 'ICON',        value: 'ICON' },
    ],
  },
  {
    key: 'industryTag',
    label: 'Industry',
    type: 'select' as const,
    options: [
      { label: 'All Industries', value: 'all' },
      { label: 'Pension',        value: 'pension' },
      { label: 'Insurance',      value: 'insurance' },
      { label: 'Workers Comp',   value: 'workers_comp' },
      { label: 'Benefits',       value: 'benefits' },
      { label: 'Cybersecurity',  value: 'cybersecurity' },
      { label: 'Data',           value: 'data' },
      { label: 'Government',     value: 'government' },
    ],
  },
];

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function ProjectTimeline({ startDate, endDate, status }: {
  startDate: string | null;
  endDate: string | null;
  status: string;
}) {
  if (!startDate || !endDate) {
    return <p className="text-xs text-jade/25 font-body mt-2 italic">No dates set</p>;
  }

  const today   = new Date();
  const start   = new Date(startDate);
  const end     = new Date(endDate);
  const total   = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();

  let pct = total > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))) : 0;
  if (status === 'Completed') pct = 100;
  if (status === 'Planning')  pct = 0;

  const barColor =
    pct >= 90 ? 'bg-rust' :
    pct >= 60 ? 'bg-amber-400' :
    'bg-gradient-to-r from-jade to-jade/70';

  const pctColor =
    pct >= 90 ? 'text-rust font-bold' :
    pct >= 60 ? 'text-amber-500 font-semibold' :
    'text-jade/45';

  return (
    <div className="mt-3 pt-3 border-t border-jade/8">
      <div className="flex items-center justify-between text-xs font-body mb-1.5">
        <span className="text-jade/30">{fmtShort(startDate)}</span>
        <span className={`tabular-nums ${pctColor}`}>{pct}% through</span>
        <span className="text-jade/30">{fmtShort(endDate)}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get('search') || '';

  const [data, setData]             = useState<Project[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    initialSearch ? { search: initialSearch } : {}
  );
  const [showAdd, setShowAdd]       = useState(false);

  const PAGE_SIZE = 24;

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', PAGE_SIZE.toString());
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });

    try {
      const res  = await fetch(`/api/projects?${params.toString()}`);
      const json = await res.json();
      setData(json.projects || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleFilterReset = () => {
    setFilterValues({});
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageContextSetter context={{ pageName: 'Projects Directory' }} />

      {showAdd && (
        <AddEntityModal
          entityType="project"
          onClose={() => { setShowAdd(false); fetchData(); }}
        />
      )}

      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-jade">Projects</h1>
          <p className="text-jade/60 font-body mt-1">Browse all {total} projects across Linea</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <span className="text-lg leading-none">+</span> Add Project
        </button>
      </div>

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Cards grid */}
      {loading ? (
        <div className="text-center py-16 flex items-center justify-center gap-2 text-jade/50 font-body">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading projects...
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-jade/15 p-12 text-center shadow-sm">
          <p className="text-jade/40 font-body">No projects match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map(project => {
            const st  = statusStyle[project.status] ?? statusStyle['In Progress'];
            const cls = classStyle[project.engagementClass] || 'badge-jade';
            const isPast = project.status === 'Completed';

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/project/${project.id}`)}
                className={`group bg-white rounded-2xl border border-jade/15 p-5 shadow-sm hover:shadow-md hover:border-jade/30 transition-all flex flex-col cursor-pointer ${isPast ? 'opacity-70' : ''}`}
              >
                {/* Top row: status + class badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium flex items-center gap-1.5 ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {project.status}
                    </span>
                    {project.currentPhase && (
                      <span className="text-xs text-jade/40 font-body">{project.currentPhase}</span>
                    )}
                  </div>
                  <span className={`${cls} text-xs flex-shrink-0`}>{project.engagementClass}</span>
                </div>

                {/* Project name */}
                <div className="flex-1">
                  <p className="text-xs font-mono text-jade/30 mb-0.5">{project.rampProjectCode}</p>
                  <h3 className="font-heading font-bold text-jade text-base leading-snug group-hover:text-jade/70 group-hover:underline underline-offset-2 transition-colors">
                    {project.name}
                  </h3>
                  <Link
                    href={`/client/${encodeURIComponent(project.clientId)}`}
                    onClick={e => e.stopPropagation()}
                    className="text-sm text-jade/55 font-body hover:text-jade hover:underline transition-colors mt-0.5 inline-block"
                  >
                    {project.clientName}
                  </Link>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {project.industryTag && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-sea/15 text-sea font-body">
                      {industryLabel[project.industryTag] || project.industryTag}
                    </span>
                  )}
                  {(project.engagementManager || project.accountExecutive) && (
                    <Link
                      href={`/browse/employees?search=${encodeURIComponent(project.engagementManager || project.accountExecutive)}`}
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-jade/40 font-body hover:text-jade hover:underline transition-colors"
                    >
                      {project.engagementManager || project.accountExecutive}
                    </Link>
                  )}
                  <span className="ml-auto text-xs text-jade/50 font-body">
                    👥 {project._count.allocations}
                  </span>
                </div>

                {/* Timeline bar */}
                <ProjectTimeline
                  startDate={project.startDate}
                  endDate={project.endDate}
                  status={project.status}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-jade/40 font-body">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} projects
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-body rounded-lg border border-jade/20 text-jade disabled:opacity-35 hover:bg-jade/5 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * PAGE_SIZE >= total}
              className="px-3 py-1.5 text-xs font-body rounded-lg border border-jade/20 text-jade disabled:opacity-35 hover:bg-jade/5 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
