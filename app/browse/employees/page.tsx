'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import FilterBar from '@/components/FilterBar';
import PageContextSetter from '@/components/PageContextSetter';

interface Employee {
  id: string;
  name: string;
  rampName: string;
  email: string;
  companyGroup: string;
  businessUnit: string;
  careerPath: string;
  roleFamily: string;
  practice: string;
  level: string;
  title: string;
  location: string;
}

const groupBadgeClass: Record<string, string> = {
  'Linea Solutions': 'badge-jade',
  'Linea Solutions ULC': 'badge-jade',
  'Linea Secure': 'badge-rust',
  'ICON': 'badge-frost',
};

const groupShortName: Record<string, string> = {
  'Linea Solutions': 'Linea US',
  'Linea Solutions ULC': 'Linea CA',
  'Linea Secure': 'Secure',
  'ICON': 'ICON',
};

const filters = [
  {
    key: 'search',
    label: 'Search',
    type: 'text' as const,
    placeholder: 'Search by name, title, email...',
  },
  {
    key: 'companyGroup',
    label: 'Company Group',
    type: 'select' as const,
    options: [
      { label: 'All Groups', value: 'all' },
      { label: 'Linea Solutions (US)', value: 'Linea Solutions' },
      { label: 'Linea Solutions ULC (CA)', value: 'Linea Solutions ULC' },
      { label: 'Linea Secure', value: 'Linea Secure' },
      { label: 'ICON', value: 'ICON' },
    ],
  },
  {
    key: 'level',
    label: 'Level',
    type: 'select' as const,
    options: [
      { label: 'All Levels', value: 'all' },
      { label: 'Associate', value: 'Associate' },
      { label: 'Consultant', value: 'Consultant' },
      { label: 'Senior Consultant', value: 'Senior Consultant' },
      { label: 'Principal Consultant', value: 'Principal Consultant' },
    ],
  },
  {
    key: 'location',
    label: 'Location',
    type: 'select' as const,
    options: [
      { label: 'All Locations', value: 'all' },
      { label: 'US', value: 'US' },
      { label: 'Canada', value: 'Canada' },
    ],
  },
  {
    key: 'practice',
    label: 'Practice',
    type: 'select' as const,
    options: [
      { label: 'All Practices', value: 'all' },
      { label: 'Pension', value: 'Pension' },
      { label: 'Insurance', value: 'Insurance' },
      { label: 'Workers Compensation', value: 'Workers Compensation' },
      { label: 'Benefits', value: 'Benefits' },
      { label: 'Cybersecurity', value: 'Cybersecurity' },
      { label: 'Data & Analytics', value: 'Data & Analytics' },
    ],
  },
];

export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });

    try {
      const res = await fetch(`/api/employees?${params.toString()}`);
      const json = await res.json();
      setData(json.employees || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
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
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row: Employee) => (
        <div>
          <div className="font-body font-medium text-jade">{row.name}</div>
          <div className="text-xs text-jade/40 font-mono">{row.rampName}</div>
        </div>
      ),
    },
    {
      key: 'companyGroup',
      label: 'Group',
      render: (row: Employee) => (
        <span className={groupBadgeClass[row.companyGroup] || 'badge-jade'}>
          {groupShortName[row.companyGroup] || row.companyGroup}
        </span>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      render: (row: Employee) => (
        <span className="text-sm text-jade/80 font-body">{row.level}</span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (row: Employee) => (
        <span className="text-sm text-jade/80 font-body">{row.title}</span>
      ),
    },
    {
      key: 'practice',
      label: 'Practice',
      render: (row: Employee) => (
        <span className="badge-sea text-xs">{row.practice}</span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row: Employee) => (
        <span className="text-sm text-jade/70 font-body">{row.location}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row: Employee) => (
        <Link
          href={`/person/${row.id}`}
          className="text-jade hover:text-jade-light text-sm font-body font-medium underline underline-offset-2"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageContextSetter context={{ pageName: 'Employees Directory' }} />

      <div>
        <h1 className="text-3xl font-heading font-bold text-jade">Employees</h1>
        <p className="text-jade/60 font-body mt-1">Browse and filter all {total} employees</p>
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
        pageSize={20}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="No employees match your filters"
      />
    </div>
  );
}
