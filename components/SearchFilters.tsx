'use client';

import { useState } from 'react';

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  loading: boolean;
}

export default function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAllocation, setMinAllocation] = useState('0');
  const [location, setLocation] = useState('all');
  const [companyGroup, setCompanyGroup] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minAllocation: parseInt(minAllocation),
      location: location === 'all' ? undefined : location,
      companyGroup: companyGroup === 'all' ? undefined : companyGroup,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="block text-sm font-body font-medium text-jade mb-2">
          Search Query (natural language)
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g., "Find someone 50% free in April with pension experience"'
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade font-body"
        />
        <p className="text-xs text-jade/50 mt-1 font-body">
          Describe what you're looking for. Include availability window, allocation %, and required skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-jade mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade font-body"
          />
        </div>

        <div>
          <label className="block text-sm font-body font-medium text-jade mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade font-body"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-jade mb-2">
            Minimum Free Allocation %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={minAllocation}
            onChange={(e) => setMinAllocation(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade font-body"
          />
        </div>

        <div>
          <label className="block text-sm font-body font-medium text-jade mb-2">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade font-body"
          >
            <option value="all">Any Location</option>
            <option value="US">US</option>
            <option value="Canada">Canada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-body font-medium text-jade mb-2">
            Company Group
          </label>
          <select
            value={companyGroup}
            onChange={(e) => setCompanyGroup(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade font-body"
          >
            <option value="all">All Groups</option>
            <option value="Linea Solutions">Linea Solutions (US)</option>
            <option value="Linea Solutions ULC">Linea Solutions ULC (Canada)</option>
            <option value="Linea Secure">Linea Secure</option>
            <option value="ICON">ICON Integration & Design</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
