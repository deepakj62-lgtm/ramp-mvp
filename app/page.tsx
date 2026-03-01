'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExampleQueries from '@/components/ExampleQueries';
import ResultsTable from '@/components/ResultsTable';

interface ExtractedParams {
  skills?: string[];
  startDate?: string;
  endDate?: string;
  minAvailability?: number;
  location?: string;
  companyGroup?: string;
  level?: string;
  practice?: string;
  roleFamily?: string;
  rawQuery?: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [extractedParams, setExtractedParams] = useState<ExtractedParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [provider, setProvider] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch('/api/llm-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setResults(data.results || []);
      setExtractedParams(data.extractedParams || null);
      setProvider(data.provider || '');
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleSelect = (example: string) => {
    setQuery(example);
    handleSearch(example);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getParamPills = (): { label: string; value: string }[] => {
    if (!extractedParams) return [];
    const pills: { label: string; value: string }[] = [];

    if (extractedParams.skills && extractedParams.skills.length > 0) {
      pills.push({ label: 'Skills', value: extractedParams.skills.join(', ') });
    }
    if (extractedParams.minAvailability) {
      pills.push({ label: 'Availability', value: `>= ${extractedParams.minAvailability}%` });
    }
    if (extractedParams.startDate) {
      const start = new Date(extractedParams.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const end = extractedParams.endDate
        ? new Date(extractedParams.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '';
      pills.push({ label: 'Date', value: end ? `${start} - ${end}` : start });
    }
    if (extractedParams.location) {
      pills.push({ label: 'Location', value: extractedParams.location });
    }
    if (extractedParams.companyGroup) {
      pills.push({ label: 'Group', value: extractedParams.companyGroup });
    }
    if (extractedParams.level) {
      pills.push({ label: 'Level', value: extractedParams.level });
    }
    if (extractedParams.practice) {
      pills.push({ label: 'Practice', value: extractedParams.practice });
    }
    if (extractedParams.roleFamily) {
      pills.push({ label: 'Role', value: extractedParams.roleFamily });
    }

    return pills;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center pt-8 pb-4">
        <h2 className="text-4xl font-heading font-bold text-jade mb-2">
          Find the right people
        </h2>
        <p className="text-jade/60 font-body text-lg">
          Ask in plain English — we'll search skills, availability, and experience
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g., "Find someone 50% free in April with pension + SQL experience"'
            className="flex-1 px-5 py-4 border-2 border-jade/20 rounded-xl text-base font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade shadow-sm"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="btn-primary px-8 py-4 text-base rounded-xl disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Provider badge */}
        {provider && searched && (
          <p className="text-xs text-jade/40 font-body mt-2 text-center">
            {provider === 'mock' ? 'Keyword mode' : `Powered by ${provider === 'anthropic' ? 'Claude' : 'GPT'}`}
            {' '}&middot;{' '}
            <Link href="/search" className="underline underline-offset-2 hover:text-jade/60">
              Advanced Search
            </Link>
          </p>
        )}
      </div>

      {/* Example Queries */}
      {!searched && (
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm text-jade/50 font-body mb-3">Try one of these:</p>
          <ExampleQueries onSelect={handleExampleSelect} />
        </div>
      )}

      {/* Extracted Parameters */}
      {extractedParams && searched && getParamPills().length > 0 && (
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <span className="text-xs text-jade/50 font-body">Understood:</span>
            {getParamPills().map((pill, idx) => (
              <span key={idx} className="param-pill">
                <strong>{pill.label}:</strong> {pill.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-rust/10 border border-rust/30 rounded-lg p-4 text-center">
            <p className="text-rust font-body text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && !loading && !error && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading font-semibold text-jade">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
                : 'No results found'}
            </h3>
            {results.length > 0 && (
              <button
                onClick={() => {
                  setSearched(false);
                  setResults([]);
                  setExtractedParams(null);
                  setQuery('');
                }}
                className="text-sm text-jade/50 hover:text-jade font-body underline underline-offset-2"
              >
                Clear results
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <ResultsTable results={results} />
          ) : (
            <div className="card p-8 text-center">
              <p className="text-jade/50 font-body mb-3">
                No staff match your search criteria. Try broadening your query.
              </p>
              <Link
                href="/search"
                className="text-jade hover:text-jade-light font-body font-medium underline underline-offset-2"
              >
                Try Advanced Search
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Getting Started - only show when no search has been done */}
      {!searched && (
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Link href="/browse/employees" className="card p-5 hover:shadow-md transition group text-center">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-heading font-semibold text-jade text-sm group-hover:text-jade-light">
              Browse Employees
            </h3>
            <p className="text-jade/50 text-xs font-body mt-1">View all staff profiles</p>
          </Link>
          <Link href="/browse/projects" className="card p-5 hover:shadow-md transition group text-center">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-heading font-semibold text-jade text-sm group-hover:text-jade-light">
              Browse Projects
            </h3>
            <p className="text-jade/50 text-xs font-body mt-1">See all active projects</p>
          </Link>
          <Link href="/browse/allocations" className="card p-5 hover:shadow-md transition group text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-heading font-semibold text-jade text-sm group-hover:text-jade-light">
              View Allocations
            </h3>
            <p className="text-jade/50 text-xs font-body mt-1">Track staffing assignments</p>
          </Link>
        </div>
      )}
    </div>
  );
}
