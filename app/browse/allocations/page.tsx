'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import PageContextSetter from '@/components/PageContextSetter';

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
    rampProjectCode: string;
  };
}

export default function AllocationsPage() {
  const [data, setData] = useState<AllocationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '25');
    if (search) params.set('search', search);

    try {
      const res = await fetch(`/api/allocations?${params.toString()}`);
      const json = await res.json();
      setData(json.allocations || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error('Failed to fetch allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const getAllocationColor = (pct: number): string => {
    if (pct > 90) return '#B06C50';
    if (pct > 60) return '#AD9A7D';
    return '#86A4AC';
  };

  const columns = [
    {
      key: 'assignmentCode',
      label: 'Code',
      render: (row: AllocationRow) => (
        <span className="text-xs font-mono text-jade/60">{row.assignmentCode}</span>
      ),
    },
    {
      key: 'employee',
      label: 'Employee',
      render: (row: AllocationRow) => (
        <div>
          <Link
            href={`/person/${row.employee.id}`}
            className="font-body font-medium text-jade hover:text-jade-light underline underline-offset-2"
          >
            {row.employee.name}
          </Link>
          <div className="text-xs text-jade/40 font-mono">{row.employee.rampName}</div>
        </div>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (row: AllocationRow) => (
        <div>
          <div className="font-body text-sm text-jade">{row.project.name}</div>
          <div className="text-xs text-jade/50 font-body">{row.project.clientName}</div>
        </div>
      ),
    },
    {
      key: 'roleOnProject',
      label: 'Role',
      render: (row: AllocationRow) => (
        <span className="badge-jade text-xs">{row.roleOnProject}</span>
      ),
    },
    {
      key: 'allocationPercent',
      label: 'Allocation',
      sortable: true,
      render: (row: AllocationRow) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(row.allocationPercent, 100)}%`,
                backgroundColor: getAllocationColor(row.allocationPercent),
              }}
            />
          </div>
          <span className="text-sm font-body font-semibold text-jade">
            {row.allocationPercent}%
          </span>
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Start',
      render: (row: AllocationRow) => (
        <span className="text-sm text-jade/70 font-body">
          {new Date(row.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'endDate',
      label: 'End',
      render: (row: AllocationRow) => (
        <span className="text-sm text-jade/70 font-body">
          {new Date(row.endDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageContextSetter context={{ pageName: 'Allocations' }} />

      <div>
        <h1 className="text-3xl font-heading font-bold text-jade">Allocations</h1>
        <p className="text-jade/60 font-body mt-1">{total} assignments across all projects</p>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by employee, project, client, or assignment code..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        pageSize={25}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="No allocations match your search"
      />
    </div>
  );
}
