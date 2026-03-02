'use client';

import { useEffect, useState, useCallback } from 'react';
import type { DiagnosticIssue, DiagnosticReport } from '@/app/api/diagnostics/route';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string;
  type: string;
  status: string;
  title: string;
  rawText: string;
  chatTranscript: string;
  structuredJson: string;
  pageContext?: string;
  complexity: string;
  autoApproved: boolean;
  implementationPlan: string;
  implementationResult: string;
  notifyEmail: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  new: 'bg-sea/15 text-sea',
  triaged: 'bg-frost/30 text-jade/70',
  accepted: 'bg-jade/15 text-jade',
  in_progress: 'bg-amber-100 text-amber-700',
  shipped: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-500',
  rejected: 'bg-rust/10 text-rust',
};

const complexityColor: Record<string, string> = {
  small: 'bg-jade/10 text-jade',
  large: 'bg-amber-100 text-amber-700',
};

const typeColor: Record<string, string> = {
  action: 'bg-sea/15 text-sea',
  bug: 'bg-rust/10 text-rust',
  feature: 'bg-jade/10 text-jade',
  data_issue: 'bg-amber-100 text-amber-700',
  question: 'bg-gray-100 text-gray-500',
};

const severityColor = {
  error: { bg: 'bg-rust/10 border-rust/20', text: 'text-rust', icon: '🔴' },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: '🟡' },
  info: { bg: 'bg-sea/10 border-sea/20', text: 'text-sea', icon: '🔵' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [executing, setExecuting] = useState<string | null>(null);

  // Diagnostics
  const [diagnosticsReport, setDiagnosticsReport] = useState<DiagnosticReport | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [tab, setTab] = useState<'tickets' | 'diagnostics'>('tickets');

  // Email config
  const [notifyEmail, setNotifyEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);

  // ── Load tickets ──────────────────────────────────────────────────────────────

  const loadTickets = useCallback(async () => {
    try {
      const response = await fetch('/api/feedback');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    // Load saved email from localStorage
    const saved = localStorage.getItem('ramp_notify_email');
    if (saved) setNotifyEmail(saved);
  }, [loadTickets]);

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const stats = {
    total: tickets.length,
    autoApplied: tickets.filter(t => t.autoApproved && t.status === 'shipped').length,
    pendingApproval: tickets.filter(t => t.complexity === 'large' && t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    shipped: tickets.filter(t => t.status === 'shipped').length,
    actions: tickets.filter(t => t.type === 'action').length,
  };

  // ── Filter ────────────────────────────────────────────────────────────────────

  const filteredTickets = tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    return true;
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  const handleApprove = async (ticketId: string) => {
    await fetch(`/api/feedback/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });
    loadTickets();
    setSelectedTicket(prev => prev?.id === ticketId ? { ...prev, status: 'accepted' } : prev);
  };

  const handleReject = async (ticketId: string) => {
    await fetch(`/api/feedback/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
    loadTickets();
    setSelectedTicket(null);
  };

  const handleApproveAndExecute = async (ticketId: string) => {
    setExecuting(ticketId);
    try {
      // First approve
      await fetch(`/api/feedback/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      // Then execute via action engine
      const res = await fetch('/api/action', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const result = await res.json();
      await loadTickets();
      // Refresh selected ticket view
      const updated = await fetch('/api/feedback').then(r => r.json());
      const updatedTicket = (updated.tickets || []).find((t: Ticket) => t.id === ticketId);
      if (updatedTicket) setSelectedTicket(updatedTicket);
    } catch (err) {
      console.error('Execute failed:', err);
    } finally {
      setExecuting(null);
    }
  };

  // ── Code Edit (self-correcting: AI edits source files directly) ───────────────

  const handleCodeEdit = async (ticketId: string) => {
    setExecuting(ticketId);
    try {
      const res = await fetch('/api/code-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const result = await res.json();
      await loadTickets();
      // Refresh selected ticket view
      const updated = await fetch('/api/feedback').then(r => r.json());
      const updatedTicket = (updated.tickets || []).find((t: Ticket) => t.id === ticketId);
      if (updatedTicket) setSelectedTicket(updatedTicket);
    } catch (err) {
      console.error('Code edit failed:', err);
    } finally {
      setExecuting(null);
    }
  };

  // ── Diagnostics ───────────────────────────────────────────────────────────────

  const runDiagnostics = async () => {
    setDiagLoading(true);
    try {
      const res = await fetch('/api/diagnostics');
      const report = await res.json();
      setDiagnosticsReport(report);
    } catch (err) {
      console.error('Diagnostics failed:', err);
    } finally {
      setDiagLoading(false);
    }
  };

  const autoFix = async (issue: DiagnosticIssue) => {
    setFixingIssue(issue.id);
    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: issue.id, issueData: issue }),
      });
      const result = await res.json();
      if (result.fixed) {
        // Re-run diagnostics
        await runDiagnostics();
      }
    } catch (err) {
      console.error('Auto-fix failed:', err);
    } finally {
      setFixingIssue(null);
    }
  };

  // ── Email save ─────────────────────────────────────────────────────────────────

  const saveEmail = () => {
    localStorage.setItem('ramp_notify_email', notifyEmail);
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2000);
  };

  // ── Helper: parse JSON safely ─────────────────────────────────────────────────

  function tryParseJson(str: string): any {
    try { return JSON.parse(str); } catch { return null; }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-jade">Feedback &amp; Action Board</h2>
          <p className="text-jade/60 font-body mt-1">Review tickets, approve large changes, run diagnostics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('tickets')}
            className={`px-4 py-2 rounded-lg text-sm font-body transition ${tab === 'tickets' ? 'bg-jade text-white' : 'border border-jade/20 text-jade hover:bg-jade/5'}`}
          >
            Tickets
          </button>
          <button
            onClick={() => { setTab('diagnostics'); if (!diagnosticsReport) runDiagnostics(); }}
            className={`px-4 py-2 rounded-lg text-sm font-body transition ${tab === 'diagnostics' ? 'bg-jade text-white' : 'border border-jade/20 text-jade hover:bg-jade/5'}`}
          >
            🔍 Diagnostics
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-jade' },
          { label: 'Auto-applied', value: stats.autoApplied, color: 'text-emerald-600' },
          { label: 'Need Approval', value: stats.pendingApproval, color: 'text-amber-600', highlight: stats.pendingApproval > 0 },
          { label: 'In Progress', value: stats.inProgress, color: 'text-sea' },
          { label: 'Shipped', value: stats.shipped, color: 'text-jade' },
          { label: 'Actions', value: stats.actions, color: 'text-sea' },
        ].map(s => (
          <div key={s.label} className={`card p-3 text-center ${s.highlight ? 'border-amber-300 bg-amber-50' : ''}`}>
            <p className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-jade/50 font-body mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Email notification config */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-jade/70 font-body">
            <span>📧</span>
            <span>Notify email for auto-applied changes:</span>
          </div>
          <div className="flex gap-2 flex-1 min-w-[260px]">
            <input
              type="email"
              value={notifyEmail}
              onChange={e => setNotifyEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-3 py-1.5 border border-jade/20 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/30 focus:border-jade"
            />
            <button
              onClick={saveEmail}
              className={`px-3 py-1.5 text-sm rounded-lg font-body transition ${emailSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-jade text-white hover:bg-jade/80'}`}
            >
              {emailSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-jade/40 font-body w-full">Set once — the ChatWidget will use this automatically for all future actions.</p>
        </div>
      </div>

      {/* ── DIAGNOSTICS TAB ─────────────────────────────────────────────────── */}

      {tab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-jade">System Health</h3>
              {diagnosticsReport && (
                <p className="text-xs text-jade/50 font-body mt-0.5">
                  Last run: {new Date(diagnosticsReport.runAt).toLocaleString()} · {diagnosticsReport.durationMs}ms
                </p>
              )}
            </div>
            <button
              onClick={runDiagnostics}
              disabled={diagLoading}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {diagLoading ? 'Scanning...' : '🔄 Run Health Check'}
            </button>
          </div>

          {diagLoading && (
            <div className="card p-8 text-center text-jade/50 font-body">
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Running health checks...
              </div>
            </div>
          )}

          {!diagLoading && diagnosticsReport && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`card p-4 text-center border-2 ${diagnosticsReport.errors > 0 ? 'border-rust/30 bg-rust/5' : 'border-gray-100'}`}>
                  <p className={`text-3xl font-heading font-bold ${diagnosticsReport.errors > 0 ? 'text-rust' : 'text-jade/30'}`}>{diagnosticsReport.errors}</p>
                  <p className="text-sm text-jade/60 font-body mt-1">Errors</p>
                </div>
                <div className={`card p-4 text-center border-2 ${diagnosticsReport.warnings > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
                  <p className={`text-3xl font-heading font-bold ${diagnosticsReport.warnings > 0 ? 'text-amber-600' : 'text-jade/30'}`}>{diagnosticsReport.warnings}</p>
                  <p className="text-sm text-jade/60 font-body mt-1">Warnings</p>
                </div>
                <div className="card p-4 text-center border-2 border-gray-100">
                  <p className="text-3xl font-heading font-bold text-sea">{diagnosticsReport.infos}</p>
                  <p className="text-sm text-jade/60 font-body mt-1">Info</p>
                </div>
              </div>

              {/* Issue List */}
              {diagnosticsReport.issues.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-jade font-body font-medium">All clear! No issues found.</p>
                  <p className="text-jade/50 font-body text-sm mt-1">Your database is healthy.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {diagnosticsReport.issues.map(issue => {
                    const sev = severityColor[issue.severity];
                    return (
                      <div key={issue.id} className={`card p-4 border ${sev.bg} flex items-start justify-between gap-4`}>
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-base mt-0.5 shrink-0">{sev.icon}</span>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`text-xs font-body font-semibold ${sev.text}`}>{issue.category}</span>
                              {issue.entityName && (
                                <span className="text-xs text-jade/60 font-body">
                                  {issue.entityType === 'employee'
                                    ? <a href={`/person/${issue.entityId}`} className="hover:underline">{issue.entityName}</a>
                                    : issue.entityType === 'project'
                                    ? <a href={`/project/${issue.entityId}`} className="hover:underline">{issue.entityName}</a>
                                    : issue.entityName}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-jade/80 font-body">{issue.message}</p>
                            {issue.fixDescription && (
                              <p className="text-xs text-jade/50 font-body mt-1">💡 {issue.fixDescription}</p>
                            )}
                          </div>
                        </div>
                        {issue.autoFixable && (
                          <button
                            onClick={() => autoFix(issue)}
                            disabled={fixingIssue === issue.id}
                            className="text-xs bg-jade text-white px-3 py-1.5 rounded-lg hover:bg-jade/80 transition disabled:opacity-50 shrink-0 font-body"
                          >
                            {fixingIssue === issue.id ? 'Fixing...' : '⚡ Auto-fix'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {!diagLoading && !diagnosticsReport && (
            <div className="card p-8 text-center text-jade/50 font-body">
              Click "Run Health Check" to scan for issues
            </div>
          )}
        </div>
      )}

      {/* ── TICKETS TAB ─────────────────────────────────────────────────────── */}

      {tab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="flex-1 px-3 py-2 border border-jade/20 rounded-lg text-sm font-body text-jade focus:outline-none focus:ring-2 focus:ring-jade/30"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="shipped">Shipped</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="flex-1 px-3 py-2 border border-jade/20 rounded-lg text-sm font-body text-jade focus:outline-none focus:ring-2 focus:ring-jade/30"
              >
                <option value="all">All Types</option>
                <option value="action">⚡ Actions</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="data_issue">Data Issue</option>
                <option value="question">Question</option>
              </select>
            </div>

            {loading ? (
              <div className="text-jade/50 text-sm font-body text-center py-8">Loading...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="card p-6 text-center text-jade/50 text-sm font-body">No tickets found</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-3 rounded-xl border transition font-body ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-jade/5 border-jade/30'
                        : 'bg-white border-jade/10 hover:border-jade/25 hover:bg-canvas'
                    } ${ticket.complexity === 'large' && ticket.status === 'new' ? 'border-l-4 border-l-amber-400' : ''}`}
                  >
                    <p className="font-medium text-sm text-jade line-clamp-2">{ticket.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${statusColors[ticket.status] || 'bg-gray-100 text-gray-500'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-body ${typeColor[ticket.type] || 'bg-gray-100 text-gray-500'}`}>
                        {ticket.type === 'action' ? '⚡' : ''}{ticket.type}
                      </span>
                      {ticket.complexity === 'large' && ticket.status === 'new' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-body font-medium">
                          ⏳ Needs approval
                        </span>
                      )}
                      {ticket.autoApproved && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-body">
                          ✅ auto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-jade/35 font-body mt-1.5">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="card p-6 space-y-5">
                {/* Title + badges */}
                <div>
                  <h3 className="text-xl font-heading font-bold text-jade">{selectedTicket.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-body font-medium ${statusColors[selectedTicket.status] || 'bg-gray-100'}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-body ${typeColor[selectedTicket.type] || 'bg-gray-100'}`}>
                      {selectedTicket.type}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-body ${complexityColor[selectedTicket.complexity] || 'bg-gray-100'}`}>
                      {selectedTicket.complexity} change
                    </span>
                    {selectedTicket.autoApproved && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-body">✅ auto-applied</span>
                    )}
                  </div>
                  <p className="text-xs text-jade/40 font-body mt-2">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                    {selectedTicket.pageContext && ` · ${selectedTicket.pageContext}`}
                  </p>
                </div>

                {/* Raw text */}
                <div className="border-t border-jade/8 pt-4">
                  <h4 className="font-heading font-semibold text-jade text-sm mb-2">Request</h4>
                  <p className="text-jade/70 text-sm font-body whitespace-pre-wrap">{selectedTicket.rawText}</p>
                </div>

                {/* Implementation plan */}
                {selectedTicket.implementationPlan && selectedTicket.implementationPlan !== '' && (
                  (() => {
                    const plan = tryParseJson(selectedTicket.implementationPlan);
                    return plan && Array.isArray(plan) && plan.length > 0 ? (
                      <div className="border-t border-jade/8 pt-4">
                        <h4 className="font-heading font-semibold text-jade text-sm mb-2">Implementation Plan</h4>
                        <ol className="space-y-1">
                          {plan.map((step: string, i: number) => (
                            <li key={i} className="text-sm text-jade/70 font-body flex gap-2">
                              <span className="text-jade/30 font-mono shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null;
                  })()
                )}

                {/* Implementation result */}
                {selectedTicket.implementationResult && selectedTicket.implementationResult !== '' && (
                  (() => {
                    const result = tryParseJson(selectedTicket.implementationResult);
                    if (!result) return null;
                    // Old "logged as dev task" path — summary contains "developer" but no real changes
                    const isOldDevTask = result.success && (!result.changes || result.changes.length === 0) && result.summary?.includes('developer');
                    // New self-correcting path — code-edit results ALWAYS have a failedEdits array (even if empty)
                    const isCodeEdit = 'failedEdits' in result;
                    return (
                      <div className="border-t border-jade/8 pt-4">
                        {isOldDevTask ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-sm font-body text-amber-800 font-semibold flex items-center gap-1.5">
                              ⚠️ Previously Logged as Dev Task
                            </p>
                            <p className="text-xs text-amber-700 font-body mt-1">
                              This was queued before the self-correcting engine was built. Click <strong>⚡ Apply Code Change</strong> above to apply it now.
                            </p>
                          </div>
                        ) : isCodeEdit ? (
                          <>
                            <h4 className="font-heading font-semibold text-sm mb-2 flex items-center gap-1.5">
                              {result.success ? <><span className="text-emerald-600">✅</span><span className="text-jade">Code Applied</span></> : <><span>❌</span><span className="text-rust">Code Edit Failed</span></>}
                            </h4>
                            {result.summary && (
                              <p className="text-xs text-jade/70 font-body mb-2">{result.summary}</p>
                            )}
                            {result.changes && result.changes.length > 0 && (
                              <ul className="space-y-1 mb-2">
                                {result.changes.map((c: string, i: number) => (
                                  <li key={i} className="text-xs text-emerald-700 font-body flex gap-2 bg-emerald-50 rounded px-2 py-1">
                                    <span className="shrink-0">✓</span><span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {result.failedEdits && result.failedEdits.length > 0 && (
                              <ul className="space-y-1">
                                {result.failedEdits.map((e: string, i: number) => (
                                  <li key={i} className="text-xs text-amber-700 font-body flex gap-2 bg-amber-50 rounded px-2 py-1">
                                    <span className="shrink-0">⚠</span><span>{e}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {!result.success && result.error && !result.failedEdits?.length && (
                              <p className="text-sm text-rust font-body mt-1">{result.error}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <h4 className="font-heading font-semibold text-jade text-sm mb-2">
                              {result.success ? '✅ Result' : '❌ Error'}
                            </h4>
                            {result.success && result.summary && (
                              <p className="text-sm text-jade/70 font-body mb-2">{result.summary}</p>
                            )}
                            {result.changes && result.changes.length > 0 && (
                              <ul className="space-y-1">
                                {result.changes.map((c: string, i: number) => (
                                  <li key={i} className="text-xs text-jade/60 font-body flex gap-2">
                                    <span className="text-jade/30 shrink-0">•</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {!result.success && (result.error || result.summary) && (
                              <p className="text-sm text-rust font-body mt-1">{result.error || result.summary}</p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()
                )}

                {/* Error message — only show if implementationResult didn't already display the error */}
                {selectedTicket.errorMessage && !selectedTicket.implementationResult && (
                  <div className="border-t border-jade/8 pt-4">
                    <h4 className="font-heading font-semibold text-rust text-sm mb-2">⚠️ Error</h4>
                    <p className="text-sm text-rust/80 font-body">{selectedTicket.errorMessage}</p>
                  </div>
                )}

                {/* Re-apply / retry button for accepted, failed-closed, or stuck in_progress UI change tickets */}
                {selectedTicket.type === 'action' && (selectedTicket.status === 'accepted' || selectedTicket.status === 'closed' || selectedTicket.status === 'in_progress') && (() => {
                  const result = tryParseJson(selectedTicket.implementationResult);
                  // Don't show if already successfully applied
                  const alreadyApplied = result?.changes && result.changes.length > 0 && result.success;
                  if (alreadyApplied) return null;
                  // Don't show for DB-change closed tickets (those have a different error path — no failedEdits)
                  const isDbFailure = result && !('failedEdits' in (result || {})) && result.error && !result.error.includes('JSON') && !result.error.includes('code');
                  if (isDbFailure) return null;
                  const isRetry = selectedTicket.status === 'closed' || selectedTicket.status === 'in_progress';
                  return (
                    <div className="border-t border-jade/8 pt-4">
                      <div className={`${isRetry ? 'bg-amber-50 border-amber-200' : 'bg-violet-50 border-violet-200'} border rounded-lg p-3`}>
                        <p className="text-xs font-body mb-2" style={{ color: isRetry ? '#92400e' : '#5b21b6' }}>
                          {isRetry ? '🔄' : '🤖'} <strong>{isRetry ? 'Retry' : 'Self-correcting engine available'}</strong> — {isRetry ? 'previous attempt failed; click to try again.' : 'click to apply this change to the source code now.'}
                        </p>
                        <button
                          onClick={() => handleCodeEdit(selectedTicket.id)}
                          disabled={executing === selectedTicket.id}
                          className={`px-3 py-1.5 ${isRetry ? 'bg-amber-600 hover:bg-amber-500' : 'bg-violet-600 hover:bg-violet-500'} text-white rounded-lg text-xs font-body transition disabled:opacity-50 flex items-center gap-1.5`}
                        >
                          {executing === selectedTicket.id ? (
                            <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Applying…</>
                          ) : isRetry ? '🔄 Retry Code Change' : '⚡ Apply Code Change Now'}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Notify email on ticket */}
                {selectedTicket.notifyEmail && (
                  <div className="border-t border-jade/8 pt-4">
                    <p className="text-xs text-jade/50 font-body">📧 Notify: {selectedTicket.notifyEmail}</p>
                  </div>
                )}

                {/* Structured JSON */}
                {selectedTicket.structuredJson && (
                  <details className="border-t border-jade/8 pt-4">
                    <summary className="font-heading font-semibold text-jade text-sm cursor-pointer select-none hover:text-jade/70">
                      Structured Data ▾
                    </summary>
                    <pre className="bg-canvas p-3 rounded-lg text-xs overflow-x-auto font-mono text-jade/80 border border-jade/8 mt-2">
                      {(() => {
                        try { return JSON.stringify(JSON.parse(selectedTicket.structuredJson), null, 2); }
                        catch { return selectedTicket.structuredJson; }
                      })()}
                    </pre>
                  </details>
                )}

                {/* Chat transcript */}
                {selectedTicket.chatTranscript && (
                  <details className="border-t border-jade/8 pt-4">
                    <summary className="font-heading font-semibold text-jade text-sm cursor-pointer select-none hover:text-jade/70">
                      Chat Transcript ▾
                    </summary>
                    <div className="bg-canvas p-3 rounded-lg text-xs max-h-48 overflow-y-auto border border-jade/8 mt-2">
                      <pre className="whitespace-pre-wrap font-mono text-jade/80">{selectedTicket.chatTranscript}</pre>
                    </div>
                  </details>
                )}

                {/* Action buttons */}
                <div className="border-t border-jade/8 pt-4">
                  {/* Large action pending approval — only for action-type tickets */}
                  {selectedTicket.type === 'action' && selectedTicket.complexity === 'large' && selectedTicket.status === 'new' && (() => {
                    // Detect if this is a DB change (has fieldUpdates) or a UI/code change (no fieldUpdates)
                    let hasFieldUpdates = false;
                    try {
                      const parsed = JSON.parse(selectedTicket.structuredJson);
                      hasFieldUpdates = !!(parsed.entityId && parsed.fieldUpdates && Object.keys(parsed.fieldUpdates).length > 0);
                    } catch { /* ignore */ }

                    return hasFieldUpdates ? (
                      // DB change — can auto-execute
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-amber-700 font-body mb-3">
                          ⏳ This is a <strong>database change</strong> waiting for approval. Review the plan above, then execute.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproveAndExecute(selectedTicket.id)}
                            disabled={executing === selectedTicket.id}
                            className="btn-primary text-sm disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {executing === selectedTicket.id ? (
                              <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Executing...</>
                            ) : '⚡ Approve & Execute'}
                          </button>
                          <button onClick={() => handleReject(selectedTicket.id)} className="px-4 py-2 border border-rust/25 text-rust rounded-lg text-sm font-body hover:bg-rust/5 transition">Reject</button>
                        </div>
                      </div>
                    ) : (
                      // UI / code change — self-correcting engine edits source files directly
                      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-2 mb-3">
                          <span className="text-lg shrink-0">🤖</span>
                          <div>
                            <p className="text-sm text-violet-800 font-body font-semibold">UI / Code Change — AI Can Apply This</p>
                            <p className="text-xs text-violet-600 font-body mt-0.5">
                              The self-correcting engine will find the relevant source file, generate the code edit, and apply it to disk. Next.js will hot-reload the change instantly.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleCodeEdit(selectedTicket.id)}
                            disabled={executing === selectedTicket.id}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-body transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {executing === selectedTicket.id ? (
                              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Applying…</>
                            ) : '⚡ Apply Code Change'}
                          </button>
                          <button onClick={() => handleReject(selectedTicket.id)} className="px-4 py-2 border border-rust/25 text-rust rounded-lg text-sm font-body hover:bg-rust/5 transition">Reject</button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Standard approve/reject for regular tickets */}
                  {selectedTicket.type !== 'action' && selectedTicket.status === 'new' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleApprove(selectedTicket.id)} className="btn-primary text-sm">Approve</button>
                      <button onClick={() => handleReject(selectedTicket.id)} className="btn-accent text-sm">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center text-jade/40 font-body">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium">Select a ticket to view details</p>
                {stats.pendingApproval > 0 && (
                  <p className="text-sm text-amber-600 mt-2">⏳ {stats.pendingApproval} large action{stats.pendingApproval > 1 ? 's' : ''} waiting for your approval</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
