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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Available Staff</h2>
        <p className="text-gray-600">Search by skills, availability, and other criteria</p>
      </div>

      <SearchFilters onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Found {results.length} result{results.length !== 1 ? 's' : ''}</p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              📥 Export to CSV
            </button>
          </div>
          <ResultsTable results={results} />
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
          Enter search criteria above and click "Search" to find available staff
        </div>
      )}
    </div>
  );
}
