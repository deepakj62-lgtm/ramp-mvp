'use client';

import { useState } from 'react';
import SearchFilters from '@/components/SearchFilters';
import ResultsTable from '@/components/ResultsTable';

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (filters: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      const data = await response.json();
      if (response.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;

    const headers = ['Name', 'Level', 'Allocation Summary', 'Matched Skills', 'Match Score'];
    const rows = results.map(r => [
      r.name,
      r.level,
      r.allocationSummary,
      r.matchedSkills?.join('; ') || '',
      r.matchScore?.toFixed(2) || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staffing-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-jade mb-2">Find Available Staff</h2>
        <p className="text-jade/60 font-body">Search by skills, availability, and other criteria</p>
      </div>

      <SearchFilters onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="bg-rust/10 border border-rust/30 rounded-lg p-4 text-rust font-body">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-jade/60 font-body">Found {results.length} result{results.length !== 1 ? 's' : ''}</p>
            <button
              onClick={handleExport}
              className="btn-secondary text-sm"
            >
              Export to CSV
            </button>
          </div>
          <ResultsTable results={results} />
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="bg-canvas rounded-lg border border-gray-200 p-8 text-center text-jade/50 font-body">
          Enter search criteria above and click "Search" to find available staff
        </div>
      )}
    </div>
  );
}
