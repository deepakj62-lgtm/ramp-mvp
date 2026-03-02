'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrgEmployee {
  id: string;
  name: string;
  title: string;
  level: string;
  companyGroup: string;
  practice: string;
  roleFamily: string;
  reportsTo: string | null;
  pageLayout: string;
}

interface OrgNode extends OrgEmployee {
  children: OrgNode[];
  tagline?: string;
  accentColor?: string;
}

// ── Avatar (inline) ─────────────────────────────────────────────────
const PALETTE = [
  '#2D5560','#86A4AC','#B06C50','#AD9A7D','#4B6E75','#6A8E6E','#8B7355',
];
function pickColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function InlineAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const bg = pickColor(name);
  const fs = Math.round(size * 0.35);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={bg} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        fill="#fff" fontSize={fs} fontFamily="sans-serif" fontWeight="600">
        {initials(name)}
      </text>
    </svg>
  );
}

// ── Group colour ──────────────────────────────────────────────────────
const groupColors: Record<string, { border: string; bg: string; badge: string }> = {
  'Linea Solutions':     { border: 'border-jade/40',  bg: 'bg-jade/5',   badge: 'bg-jade/15 text-jade' },
  'Linea Solutions ULC': { border: 'border-sea/40',   bg: 'bg-sea/5',    badge: 'bg-sea/15 text-sea' },
  'Linea Secure':        { border: 'border-rust/40',  bg: 'bg-rust/5',   badge: 'bg-rust/15 text-rust' },
  'ICON':                { border: 'border-amber-300',bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
};

// ── Build tree from flat list ────────────────────────────────────────
function buildTree(employees: OrgEmployee[]): OrgNode[] {
  const nodeMap = new Map<string, OrgNode>();
  for (const e of employees) {
    let tagline = '';
    let accentColor = '';
    try {
      const pl = JSON.parse(e.pageLayout || '{}');
      tagline     = pl.tagline || '';
      accentColor = pl.accentColor || '';
    } catch {}
    nodeMap.set(e.id, { ...e, children: [], tagline, accentColor });
  }

  const roots: OrgNode[] = [];
  for (const node of nodeMap.values()) {
    if (!node.reportsTo || !nodeMap.has(node.reportsTo)) {
      roots.push(node);
    } else {
      nodeMap.get(node.reportsTo)!.children.push(node);
    }
  }

  // Sort children by level rank desc, then name
  const levelRank: Record<string, number> = {
    'Executive': 5, 'Principal Consultant': 4, 'Senior Consultant': 3,
    'Consultant': 2, 'Associate': 1,
  };
  const sortChildren = (nodes: OrgNode[]) => {
    nodes.sort((a, b) => {
      const rd = (levelRank[b.level] || 0) - (levelRank[a.level] || 0);
      return rd !== 0 ? rd : a.name.localeCompare(b.name);
    });
    for (const n of nodes) sortChildren(n.children);
  };
  sortChildren(roots);
  roots.sort((a, b) => (levelRank[b.level] || 0) - (levelRank[a.level] || 0));

  return roots;
}

// ── Single org node card ─────────────────────────────────────────────
function OrgCard({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const hasChildren = node.children.length > 0;
  const gc = groupColors[node.companyGroup] || groupColors['Linea Solutions'];

  return (
    <div className="flex flex-col items-center">
      {/* The card */}
      <div className={`relative group border-2 rounded-2xl shadow-sm hover:shadow-md transition-all w-44 ${gc.border} ${gc.bg} bg-white`}>
        {/* Expand/collapse toggle */}
        {hasChildren && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-white border-2 border-jade/30 flex items-center justify-center text-jade/60 hover:text-jade hover:border-jade transition-all shadow-sm"
            title={collapsed ? `Show ${node.children.length} report${node.children.length > 1 ? 's' : ''}` : 'Collapse'}
          >
            <span className="text-xs font-bold leading-none">{collapsed ? '+' : '−'}</span>
          </button>
        )}

        {/* Card body */}
        <div className="p-3 text-center">
          <div className="flex justify-center mb-2">
            <InlineAvatar name={node.name} size={depth === 0 ? 52 : 36} />
          </div>
          <Link href={`/person/${node.id}`}
            className="font-heading font-semibold text-jade text-xs leading-tight hover:underline underline-offset-2 block mb-0.5"
            style={{ fontSize: depth === 0 ? '0.85rem' : '0.75rem' }}
          >
            {node.name}
          </Link>
          <p className="text-jade/50 font-body leading-tight mb-1.5"
            style={{ fontSize: '0.65rem' }}>
            {node.title}
          </p>
          {/* Tagline if available */}
          {node.tagline && depth < 2 && (
            <p className="text-jade/40 font-body italic leading-tight mb-1.5"
              style={{ fontSize: '0.6rem' }}>
              "{node.tagline.slice(0, 40)}{node.tagline.length > 40 ? '…' : ''}"
            </p>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-body inline-block ${gc.badge}`}
            style={{ fontSize: '0.6rem' }}>
            {node.companyGroup.replace('Linea Solutions', 'LS').replace('Linea Secure', 'Secure')}
          </span>
          {hasChildren && !collapsed && (
            <p className="text-jade/30 font-body mt-1" style={{ fontSize: '0.6rem' }}>
              {node.children.length} direct report{node.children.length !== 1 ? 's' : ''}
            </p>
          )}
          {hasChildren && collapsed && (
            <p className="text-jade/30 font-body mt-1" style={{ fontSize: '0.6rem' }}>
              +{node.children.length} collapsed
            </p>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="mt-7 relative">
          {/* Vertical connector from parent to horizontal bar */}
          <div className="absolute top-0 left-1/2 -translate-x-px w-px h-3.5 bg-jade/20" />

          {/* Children row */}
          <div className="flex gap-4 items-start relative">
            {node.children.length > 1 && (
              // Horizontal connector bar
              <div
                className="absolute top-3 bg-jade/15"
                style={{
                  left: '50%',
                  right: '50%',
                  height: '1px',
                  width: '0',
                }}
              />
            )}
            {node.children.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Vertical stub down to each child */}
                <div className="w-px h-3.5 bg-jade/20 mb-0" />
                <OrgCard node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root tree renderer with horizontal lines ─────────────────────────
function OrgTree({ roots }: { roots: OrgNode[] }) {
  if (roots.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-8 items-start justify-center">
      {roots.map(root => (
        <OrgCard key={root.id} node={root} depth={0} />
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function OrgChartPage() {
  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [seeding, setSeeding]     = useState(false);
  const [seedDone, setSeedDone]   = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/org-chart');
      const json = await res.json();
      setEmployees(json.employees || []);
    } catch {
      setError('Failed to load org chart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res  = await fetch('/api/org-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      });
      const json = await res.json();
      if (json.success) {
        setSeedDone(true);
        await fetchData();
      }
    } catch {
      setError('Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  // Check if hierarchy has been seeded (any employee has reportsTo set)
  const isSeeded = employees.some(e => e.reportsTo !== null);

  // Filter employees
  const filtered = employees.filter(e => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.practice.toLowerCase().includes(search.toLowerCase());
    const matchGroup = groupFilter === 'all' || e.companyGroup === groupFilter;
    return matchSearch && matchGroup;
  });

  const tree = buildTree(filtered);

  const groups = Array.from(new Set(employees.map(e => e.companyGroup))).sort();

  // Stats
  const totalReporting = employees.filter(e => e.reportsTo !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-jade">Org Chart</h1>
          <p className="text-jade/55 font-body mt-1">
            {employees.length} people · reporting hierarchy
            {isSeeded && ` · ${totalReporting} reporting relationships`}
          </p>
        </div>

        {/* Seed button if hierarchy not yet set up */}
        {!isSeeded && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {seeding ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Building hierarchy…
              </>
            ) : (
              <>◆ Build Org Hierarchy</>
            )}
          </button>
        )}

        {isSeeded && (
          <button onClick={handleSeed} disabled={seeding}
            className="text-xs text-jade/40 hover:text-jade font-body underline underline-offset-2 transition-colors">
            {seeding ? 'Rebuilding…' : 'Rebuild hierarchy'}
          </button>
        )}
      </div>

      {/* Legend + filters */}
      <div className="bg-white rounded-xl border border-jade/15 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, title, practice..."
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/30 focus:border-jade"
          />
          {/* Group filter */}
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/30 focus:border-jade"
          >
            <option value="all">All Groups</option>
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Group legend */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-jade/8">
          {Object.entries(groupColors).map(([g, s]) => (
            <span key={g} className={`text-xs px-2 py-0.5 rounded-full font-body ${s.badge}`}>{g}</span>
          ))}
          <span className="text-xs text-jade/35 font-body ml-auto">Click cards to visit profile · click ± to expand/collapse</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rust/10 border border-rust/30 rounded-xl p-4 text-rust font-body text-sm">
          {error}
        </div>
      )}

      {/* Seed prompt */}
      {!loading && !isSeeded && !error && (
        <div className="bg-jade/5 border border-jade/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🌳</div>
          <h3 className="font-heading font-bold text-jade text-lg mb-2">No hierarchy yet</h3>
          <p className="text-jade/55 font-body text-sm mb-4">
            Click "Build Org Hierarchy" above to automatically assign reporting relationships based on level, practice, and company group.
            You can also upload an org chart document to override with real data.
          </p>
          <button onClick={handleSeed} disabled={seeding} className="btn-primary">
            {seeding ? 'Building…' : '◆ Build Org Hierarchy'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="flex items-center justify-center gap-2 text-jade/50 font-body">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading org chart…
          </div>
        </div>
      )}

      {/* Org tree */}
      {!loading && isSeeded && (
        <div className="bg-white rounded-2xl border border-jade/15 shadow-sm p-6 overflow-x-auto">
          <div style={{ minWidth: 'max-content' }}>
            <OrgTree roots={tree} />
          </div>
        </div>
      )}

      {/* Flat list view (always shown) */}
      {!loading && isSeeded && (
        <div className="bg-white rounded-2xl border border-jade/15 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-jade/10 bg-canvas">
            <h3 className="font-heading font-semibold text-jade text-sm">Full Roster</h3>
            <p className="text-xs text-jade/40 font-body mt-0.5">{filtered.length} people</p>
          </div>
          <div className="divide-y divide-jade/5 max-h-96 overflow-y-auto">
            {filtered.map(e => {
              const managerName = e.reportsTo
                ? employees.find(m => m.id === e.reportsTo)?.name || '—'
                : '—';
              const gc = groupColors[e.companyGroup] || groupColors['Linea Solutions'];
              return (
                <div key={e.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-canvas transition-colors">
                  <InlineAvatar name={e.name} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/person/${e.id}`} className="font-body font-medium text-jade text-sm hover:underline underline-offset-2">
                        {e.name}
                      </Link>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-body ${gc.badge}`} style={{ fontSize: '0.6rem' }}>
                        {e.level}
                      </span>
                    </div>
                    <p className="text-xs text-jade/40 font-body">{e.title} · {e.practice}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-jade/35 font-body">reports to</p>
                    <p className="text-xs font-body text-jade/60 font-medium">{managerName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
