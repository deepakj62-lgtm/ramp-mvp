'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContextSetter from '@/components/PageContextSetter';
import AddEntityModal from '@/components/AddEntityModal';
import Avatar from '@/components/Avatar';

interface AllocationRow {
  id: string;
  assignmentCode: string;
  assignmentDetail: string;
  roleOnProject: string;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  employee: {
    id: string;
    name: string;
    rampName: string;
    companyGroup: string;
  };
  project: {
    id: string;
    name: string;
    clientName: string;
    clientId: string;
    rampProjectCode: string;
  };
}

type StatusFilter = 'all' | 'active' | 'upcoming' | 'past';

function getAllocStatus(startDate: string, endDate: string, today: Date): 'active' | 'upcoming' | 'past' {
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (e < today) return 'past';
  if (s > today) return 'upcoming';
  return 'active';
}

const statusBadge: Record<string, { cls: string; dot: string; label: string }> = {
  active:   { cls: 'bg-jade/10 text-jade',     dot: 'bg-jade',     label: 'Active'   },
  upcoming: { cls: 'bg-sea/15 text-sea',        dot: 'bg-sea',      label: 'Upcoming' },
  past:     { cls: 'bg-gray-100 text-gray-400', dot: 'bg-gray-300', label: 'Ended'    },
};

const roleColor: Record<string, string> = {
  PM:          'bg-jade/15 text-jade',
  BA:          'bg-sea/20 text-sea',
  Testing:     'bg-sky-100 text-sky-600',
  OCM:         'bg-rust/15 text-rust',
  DataAnalyst: 'bg-sea/25 text-sea',
  Cyber:       'bg-red-100 text-red-600',
  Oversight:   'bg-jade/25 text-jade',
  AIAdvisory:  'bg-purple-100 text-purple-600',
};

function AllocationBar({ pct }: { pct: number }) {
  const color = pct > 90 ? '#B06C50' : pct > 60 ? '#AD9A7D' : '#86A4AC';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-body font-semibold text-jade whitespace-nowrap">{pct}%</span>
    </div>
  );
}

export default function AllocationsPage() {
  const [data, setData]         = useState<AllocationRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAdd, setShowAdd]   = useState(false);

  const today = new Date();

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '50');
    if (search) params.set('search', search);
    try {
      const res  = await fetch(`/api/allocations?${params.toString()}`);
      const json = await res.json();
      setData(json.allocations || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error('Failed to fetch allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const allActive   = data.filter(r => getAllocStatus(r.startDate, r.endDate, today) === 'active');
  const allUpcoming = data.filter(r => getAllocStatus(r.startDate, r.endDate, today) === 'upcoming');
  const allPast     = data.filter(r => getAllocStatus(r.startDate, r.endDate, today) === 'past');
  const overAlloc   = allActive.filter(r => r.allocationPercent > 90);

  const filtered = statusFilter === 'all' ? data
    : data.filter(r => getAllocStatus(r.startDate, r.endDate, today) === statusFilter);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      <PageContextSetter context={{ pageName: 'Allocations' }} />
      {showAdd && <AddEntityModal entityType="allocation" onClose={() => { setShowAdd(false); fetchData(); }} />}

      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-jade">Allocations</h1>
          <p className="text-jade/55 font-body mt-1">{total} assignments across all projects</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <span className="text-lg leading-none">+</span> Add Allocation
        </button>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { key: 'all',      label: 'All',      count: total,           sub: 'total assignments',  activeColor: 'bg-jade border-jade' },
          { key: 'active',   label: 'Active',   count: allActive.length,   sub: 'in progress',     activeColor: 'bg-jade border-jade' },
          { key: 'upcoming', label: 'Upcoming', count: allUpcoming.length, sub: 'starts soon',     activeColor: 'bg-sea border-sea' },
          { key: 'past',     label: 'Ended',    count: allPast.length,     sub: overAlloc.length > 0 ? `${overAlloc.length} over 90%` : 'completed', activeColor: 'bg-gray-600 border-gray-600' },
        ] as const).map(({ key, label, count, sub, activeColor }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key as StatusFilter)}
            className={`rounded-xl p-4 border text-left transition-all ${
              statusFilter === key
                ? `${activeColor} text-white shadow-sm`
                : 'bg-white border-jade/15 hover:border-jade/30 hover:shadow-sm'
            }`}
          >
            <p className={`text-xs uppercase tracking-wide mb-1 font-body ${statusFilter === key ? 'text-white/70' : 'text-jade/45'}`}>{label}</p>
            <p className={`font-heading font-bold text-2xl ${statusFilter === key ? 'text-white' : 'text-jade'}`}>{count}</p>
            <p className={`text-xs font-body mt-0.5 ${statusFilter === key ? 'text-white/60' : 'text-jade/35'}`}>{sub}</p>
          </button>
        ))}
      </div>

      {/* Over-allocation alert */}
      {overAlloc.length > 0 && (statusFilter === 'all' || statusFilter === 'active') && (
        <div className="flex items-center gap-3 bg-rust/8 border border-rust/20 rounded-xl px-4 py-3 text-sm font-body text-rust">
          <span className="text-base font-bold">⚠</span>
          <span>
            <strong>{overAlloc.length}</strong> active assignment{overAlloc.length !== 1 ? 's' : ''} at {'>'}90% —{' '}
            {overAlloc.map(r => r.employee.name).join(', ')}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-jade/15 p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by employee, project, client, role, phase, assignment code..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/30 focus:border-jade"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 flex items-center justify-center gap-2 text-jade/50 font-body">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-jade/15 p-8 text-center">
          <p className="text-jade/40 font-body text-sm">No allocations match your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-jade/15 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jade/10 bg-canvas">
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold text-jade/45 uppercase tracking-wide w-24">Code</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold text-jade/45 uppercase tracking-wide">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold text-jade/45 uppercase tracking-wide">Project</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold text-jade/45 uppercase tracking-wide w-28">Role</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold text-jade/45 uppercase tracking-wide w-32">Allocation</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold text-jade/45 uppercase tracking-wide w-28">Status</th>
                <th className="px-4 py-3 text-left text-xs font-heading font-semibold text-jade/45 uppercase tracking-wide">Dates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jade/5">
              {filtered.map((row) => {
                const status = getAllocStatus(row.startDate, row.endDate, today);
                const sb     = statusBadge[status];
                return (
                  <tr key={row.id} className={`hover:bg-canvas/60 transition-colors ${status === 'past' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-jade/40">{row.assignmentCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/person/${row.employee.id}`} className="flex items-center gap-2.5 group">
                        <Avatar name={row.employee.name} size="sm" />
                        <div>
                          <div className="font-body font-medium text-jade group-hover:underline underline-offset-2">{row.employee.name}</div>
                          <div className="text-xs text-jade/30 font-mono">{row.employee.rampName}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/project/${row.project.id}`} className="group block">
                        <div className="font-body font-medium text-jade group-hover:underline underline-offset-2 text-sm">{row.project.name}</div>
                      </Link>
                      <Link href={`/client/${encodeURIComponent(row.project.clientId)}`} className="text-xs text-jade/40 font-body hover:text-jade hover:underline transition-colors">
                        {row.project.clientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-body ${roleColor[row.roleOnProject] ?? 'bg-canvas text-jade/55'}`}>
                        {row.roleOnProject}
                      </span>
                    </td>
                    <td className="px-4 py-3"><AllocationBar pct={row.allocationPercent} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-body flex items-center gap-1.5 w-fit ${sb.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sb.dot}`} />
                        {sb.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-jade/50 font-body whitespace-nowrap">{fmt(row.startDate)}</span>
                      <span className="text-jade/20 mx-1">→</span>
                      <span className="text-xs text-jade/50 font-body whitespace-nowrap">{fmt(row.endDate)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {total > 50 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-jade/8 bg-canvas">
              <span className="text-xs text-jade/40 font-body">
                Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-body rounded-lg border border-jade/20 text-jade disabled:opacity-35 hover:bg-jade/5">
                  ← Prev
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
                  className="px-3 py-1.5 text-xs font-body rounded-lg border border-jade/20 text-jade disabled:opacity-35 hover:bg-jade/5">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
