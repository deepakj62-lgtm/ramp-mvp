'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import FilterBar from '@/components/FilterBar';
import PageContextSetter from '@/components/PageContextSetter';

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
  _count: { allocations: number };
}

const engagementBadge: Record<string, string> = {
  'Client': 'badge-jade',
  'ULC': 'badge-sea',
  'Cyber': 'badge-rust',
  'ICON': 'badge-frost',
};

const statusColors: Record<string, string> = {
  'In Progress': 'bg-jade/20 text-jade border border-jade/40',
  'Planning':    'bg-sea/20 text-sea border border-sea/40',
  'On Hold':     'bg-rust/20 text-rust border border-rust/40',
  'Closing':     'bg-frost/20 text-frost border border-frost/40',
  'Completed':   'bg-canvas text-jade/60 border border-jade/20',
};

const filters = [
  {
    key: 'search',
    label: 'Search',
    type: 'text' as const,
    placeholder: 'Search by name, client, code...',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'All Statuses', value: 'all' },
      { label: 'In Progress', value: 'In Progress' },
      { label: 'Planning', value: 'Planning' },
      { label: 'On Hold', value: 'On Hold' },
      { label: 'Closing', value: 'Closing' },
      { label: 'Completed', value: 'Completed' },
    ],
  },
  {
    key: 'engagementClass',
    label: 'Engagement Class',
    type: 'select' as const,
    options: [
      { label: 'All Classes', value: 'all' },
      { label: 'Client', value: 'Client' },
      { label: 'ULC', value: 'ULC' },
      { label: 'Cyber', value: 'Cyber' },
      { label: 'ICON', value: 'ICON' },
    ],
  },
  {
    key: 'industryTag',
    label: 'Industry',
    type: 'select' as const,
    options: [
      { label: 'All Industries', value: 'all' },
      { label: 'Pension', value: 'pension' },
      { label: 'Insurance', value: 'insurance' },
      { label: 'Workers Comp', value: 'workers_comp' },
      { label: 'Benefits', value: 'benefits' },
      { label: 'Cybersecurity', value: 'cybersecurity' },
      { label: 'Data', value: 'data' },
      { label: 'Government', value: 'government' },
    ],
  },
];

export default function ProjectsPage() {
  const [data, setData] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '25');
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });

    try {
      const res = await fetch(`/api/projects?${params.toString()}`);
      const json = await res.json();
      setData(json.projects || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleFilterReset = () => {
    setFilterValues({});
    setPage(1);
  };

  const columns = [
    {
      key: 'rampProjectCode',
      label: 'Code',
      render: (row: Project) => (
        <span className="text-xs font-mono text-jade/60">{row.rampProjectCode}</span>
      ),
    },
    {
      key: 'name',
      label: 'Project Name',
      sortable: true,
      render: (row: Project) => (
        <Link href={`/project/${row.id}`} className="font-body font-medium text-jade hover:text-jade/70 hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Project) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${statusColors[row.status] ?? 'bg-canvas text-jade/60 border border-jade/20'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'clientName',
      label: 'Client',
      sortable: true,
      render: (row: Project) => (
        <span className="text-sm text-jade/80 font-body">{row.clientName}</span>
      ),
    },
    {
      key: 'engagementClass',
      label: 'Class',
      render: (row: Project) => (
        <span className={engagementBadge[row.engagementClass] || 'badge-jade'}>
          {row.engagementClass}
        </span>
      ),
    },
    {
      key: 'engagementManager',
      label: 'Engagement Manager',
      render: (row: Project) => (
        <span className="text-sm text-jade/70 font-body">{row.engagementManager}</span>
      ),
    },
    {
      key: 'industryTag',
      label: 'Industry',
      render: (row: Project) => (
        <span className="badge-sea text-xs">{row.industryTag?.replace('_', ' ') || 'N/A'}</span>
      ),
    },
    {
      key: 'allocations',
      label: 'Team',
      render: (row: Project) => (
        <span className="text-sm text-jade/60 font-body">{row._count.allocations}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageContextSetter context={{ pageName: 'Projects Directory' }} />

      <div>
        <h1 className="text-3xl font-heading font-bold text-jade">Projects</h1>
        <p className="text-jade/60 font-body mt-1">Browse all {total} projects across Linea</p>
      </div>

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={25}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="No projects match your filters"
      />
    </div>
  );
}
