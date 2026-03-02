'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExampleQueries from '@/components/ExampleQueries';
import ResultsTable from '@/components/ResultsTable';
import MarkdownAnswer from '@/components/MarkdownAnswer';
import FeatureShowcase from '@/components/FeatureShowcase';
import VideoAd from '@/components/VideoAd';
import CommandPanel from '@/components/CommandPanel';

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
  const [answer, setAnswer] = useState('');
  const [responseType, setResponseType] = useState<'talent_search' | 'general_question' | ''>('');
  const [extractedParams, setExtractedParams] = useState<ExtractedParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // ── Command (Change) mode state ──────────────────────────────────────
  const [mode, setMode] = useState<'ask' | 'change'>('ask');
  const [commandQuery, setCommandQuery] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandError, setCommandError] = useState('');
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeResult, setExecuteResult] = useState<{ success: boolean; changes: string[]; errors: string[]; summary: string; changeLogId: string } | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);
    setAnswer('');
    setResults([]);
    setResponseType('');

    try {
      const res = await fetch('/api/universal-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setResponseType(data.type);

      if (data.type === 'talent_search') {
        setResults(data.results || []);
        setExtractedParams(data.extractedParams || null);
      } else {
        setAnswer(data.answer || 'No answer returned.');
        setExtractedParams(null);
      }
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
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setSearched(false);
    setResults([]);
    setAnswer('');
    setExtractedParams(null);
    setResponseType('');
    setQuery('');
  };

  // ── Command mode handlers ────────────────────────────────────────────
  const handleCommand = async () => {
    if (!commandQuery.trim()) return;
    setCommandLoading(true);
    setCommandError('');
    setActionPlan(null);
    setExecuteResult(null);
    try {
      const res = await fetch('/api/nl-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Command failed');
      setActionPlan(data.actionPlan);
    } catch (err: any) {
      setCommandError(err.message || 'Failed to parse command.');
    } finally {
      setCommandLoading(false);
    }
  };

  const handleExecute = async (docText: string, docFileName: string) => {
    if (!actionPlan) return;
    setExecuteLoading(true);
    try {
      const res = await fetch('/api/nl-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionPlan, command: commandQuery, docText, docFileName }),
      });
      const data = await res.json();
      setExecuteResult(data);
      setActionPlan(null);
    } catch (err: any) {
      setCommandError(err.message || 'Execution failed.');
    } finally {
      setExecuteLoading(false);
    }
  };

  const handleCommandClear = () => {
    setCommandQuery('');
    setActionPlan(null);
    setExecuteResult(null);
    setCommandError('');
  };

  const getParamPills = (): { label: string; value: string }[] => {
    if (!extractedParams) return [];
    const pills: { label: string; value: string }[] = [];
    if (extractedParams.skills?.length) pills.push({ label: 'Skills', value: extractedParams.skills.join(', ') });
    if (extractedParams.minAvailability) pills.push({ label: 'Availability', value: `>= ${extractedParams.minAvailability}%` });
    if (extractedParams.startDate) {
      const start = new Date(extractedParams.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const end = extractedParams.endDate ? new Date(extractedParams.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      pills.push({ label: 'Date', value: end ? `${start} - ${end}` : start });
    }
    if (extractedParams.location) pills.push({ label: 'Location', value: extractedParams.location });
    if (extractedParams.level) pills.push({ label: 'Level', value: extractedParams.level });
    if (extractedParams.practice) pills.push({ label: 'Practice', value: extractedParams.practice });
    if (extractedParams.roleFamily) pills.push({ label: 'Role', value: extractedParams.roleFamily });
    return pills;
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center pt-8 pb-4">
        <h2 className="text-6xl font-heading font-extrabold text-jade mb-2">Ask anything</h2>
        <p className="text-jade/60 font-body text-lg">
          Find people, check project status, look up allocations — just ask in plain English
        </p>
      </div>

      {/* Mode Toggle + Search/Command Bar */}
      <div className="max-w-3xl mx-auto">
        {/* Mode toggle */}
        <div className="flex gap-1 mb-3 p-1 bg-jade/8 rounded-xl w-fit mx-auto border border-jade/15">
          <button
            onClick={() => { setMode('ask'); handleCommandClear(); }}
            className={`px-5 py-2 rounded-lg text-sm font-body font-semibold transition-all ${
              mode === 'ask'
                ? 'bg-jade text-white shadow-sm'
                : 'text-jade/60 hover:text-jade/80'
            }`}
          >
            🔍 Ask
          </button>
          <button
            onClick={() => { setMode('change'); setSearched(false); setQuery(''); }}
            className={`px-5 py-2 rounded-lg text-sm font-body font-semibold transition-all ${
              mode === 'change'
                ? 'bg-jade text-white shadow-sm'
                : 'text-jade/60 hover:text-jade/80'
            }`}
          >
            ⚡ Change
          </button>
        </div>

        {/* Ask mode bar */}
        {mode === 'ask' && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g., "What is the status of the BRCERA project?" or "Find a BA free in April"'
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
                ) : 'Ask'}
              </button>
            </div>
            {searched && (
              <p className="text-xs text-jade/40 font-body mt-2 text-center">
                Powered by Claude &middot;{' '}
                <button onClick={handleClear} className="underline underline-offset-2 hover:text-jade/60">
                  Clear
                </button>
                {' '}&middot;{' '}
                <Link href="/search" className="underline underline-offset-2 hover:text-jade/60">
                  Advanced Search
                </Link>
              </p>
            )}
          </>
        )}

        {/* Change mode bar */}
        {mode === 'change' && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCommand(); }}
                placeholder={`e.g., "Change Nate's allocation on CalSTRS to 80% and add 20% on SJCERA"`}
                className="flex-1 px-5 py-4 border-2 border-jade/20 rounded-xl text-base font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade shadow-sm"
              />
              <button
                onClick={handleCommand}
                disabled={commandLoading || !commandQuery.trim()}
                className="btn-primary px-6 py-4 text-base rounded-xl disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {commandLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Plan Changes'}
              </button>
            </div>
            <p className="text-xs text-jade/40 font-body mt-2 text-center">
              Describe what to change — the AI will plan, show you a preview, and apply with your confirmation.{' '}
              <Link href="/changes" className="underline underline-offset-2 hover:text-jade/60">View history</Link>
            </p>
          </>
        )}
      </div>

      {/* Example Queries */}
      {!searched && (
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm text-jade/50 font-body mb-3">Try one of these:</p>
          <ExampleQueries onSelect={handleExampleSelect} />
        </div>
      )}

      {/* Extracted Params (talent search only) */}
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

      {/* Command mode — error */}
      {mode === 'change' && commandError && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-rust/10 border border-rust/30 rounded-lg p-4 text-center">
            <p className="text-rust font-body text-sm">{commandError}</p>
          </div>
        </div>
      )}

      {/* Command mode — action plan review */}
      {mode === 'change' && actionPlan && (
        <div className="max-w-3xl mx-auto">
          <CommandPanel
            actionPlan={actionPlan}
            command={commandQuery}
            onConfirm={handleExecute}
            onCancel={() => setActionPlan(null)}
            loading={executeLoading}
          />
        </div>
      )}

      {/* Command mode — success */}
      {mode === 'change' && executeResult && (
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-2xl overflow-hidden border shadow-sm ${executeResult.success ? 'border-emerald-200' : 'border-amber-200'}`}>
            <div className={`px-5 py-3.5 flex items-center gap-2.5 ${executeResult.success ? 'bg-emerald-600' : 'bg-amber-500'}`}>
              <span className="text-white text-lg">{executeResult.success ? '✓' : '⚠'}</span>
              <span className="text-white font-heading font-semibold text-sm">
                {executeResult.success ? 'Changes Applied Successfully' : 'Applied with Errors'}
              </span>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="text-slate-700 font-body text-sm mb-3">{executeResult.summary}</p>
              {(executeResult.changes?.length ?? 0) > 0 && (
                <ul className="space-y-1.5">
                  {executeResult.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-body text-slate-600">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              )}
              {(executeResult.errors?.length ?? 0) > 0 && (
                <ul className="space-y-1 mt-2">
                  {executeResult.errors?.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-body text-red-600">
                      <span className="mt-0.5">✕</span>
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-5 py-2.5 flex items-center gap-3 text-xs font-body text-slate-400">
              <Link href="/changes" className="underline underline-offset-2 hover:text-slate-600">View in Change History</Link>
              <span>·</span>
              <button onClick={handleCommandClear} className="underline underline-offset-2 hover:text-slate-600">
                Make another change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results — Talent Search */}
      {searched && !loading && !error && responseType === 'talent_search' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading font-semibold text-jade">
              {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''} found` : 'No results found'}
            </h3>
          </div>
          {results.length > 0 ? (
            <ResultsTable results={results} />
          ) : (
            <div className="card p-8 text-center">
              <p className="text-jade/50 font-body mb-3">No staff match your search criteria. Try broadening your query.</p>
              <Link href="/search" className="text-jade hover:text-jade-light font-body font-medium underline underline-offset-2">
                Try Advanced Search
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Results — General Answer */}
      {searched && !loading && !error && responseType === 'general_question' && answer && (
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-jade/15">
            {/* Header gradient bar */}
            <div className="bg-gradient-to-r from-jade to-jade/80 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-white/80 text-lg leading-none">◆</span>
                <span className="text-white font-heading font-semibold text-sm tracking-wide">RAMP Assistant</span>
              </div>
              <span className="text-white/50 text-xs font-body">Powered by Claude</span>
            </div>
            {/* Body */}
            <div className="bg-white px-6 py-5">
              <MarkdownAnswer text={answer} />
            </div>
            {/* Footer */}
            <div className="bg-canvas border-t border-jade/10 px-5 py-2.5 flex items-center gap-3 text-xs text-jade/40 font-body">
              <span>Answer generated from live RAMP data</span>
              <span>·</span>
              <button
                onClick={() => { setSearched(false); setAnswer(''); setQuery(''); }}
                className="underline underline-offset-2 hover:text-jade/60 transition-colors"
              >
                Ask another question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Video Ad + Feature Showcase — only on home */}
      {!searched && <VideoAd />}
      {!searched && <FeatureShowcase />}

      {/* Getting Started */}
      {!searched && (
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Link href="/browse/employees" className="card p-5 hover:shadow-md transition group text-center">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-heading font-semibold text-jade text-sm group-hover:text-jade-light">Browse Employees</h3>
            <p className="text-jade/50 text-xs font-body mt-1">View all staff profiles</p>
          </Link>
          <Link href="/browse/projects" className="card p-5 hover:shadow-md transition group text-center">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-heading font-semibold text-jade text-sm group-hover:text-jade-light">Browse Projects</h3>
            <p className="text-jade/50 text-xs font-body mt-1">See all active projects</p>
          </Link>
          <Link href="/browse/allocations" className="card p-5 hover:shadow-md transition group text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-heading font-semibold text-jade text-sm group-hover:text-jade-light">View Allocations</h3>
            <p className="text-jade/50 text-xs font-body mt-1">Track staffing assignments</p>
          </Link>
        </div>
      )}
    </div>
  );
}
