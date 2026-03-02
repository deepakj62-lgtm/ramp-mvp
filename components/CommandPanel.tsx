'use client';

import { useState, useRef } from 'react';

interface Action {
  type: string;
  [key: string]: any;
}

interface ActionPlan {
  summary: string;
  actions: Action[];
  missingInfo: string[];
  confidence: number;
}

interface CommandPanelProps {
  actionPlan: ActionPlan;
  command: string;
  onConfirm: (docText: string, docFileName: string) => void;
  onCancel: () => void;
  loading: boolean;
}

const ACTION_COLORS: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  UPDATE_ALLOCATION:  { bg: 'bg-amber-50',   border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',   label: 'Update Allocation' },
  UPDATE_EMPLOYEE:    { bg: 'bg-amber-50',   border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',   label: 'Update Employee' },
  UPDATE_PROJECT:     { bg: 'bg-amber-50',   border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',   label: 'Update Project' },
  CREATE_CLIENT:      { bg: 'bg-emerald-50', border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700', label: 'Create Client' },
  CREATE_PROJECT:     { bg: 'bg-emerald-50', border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700', label: 'Create Project' },
  CREATE_ALLOCATION:  { bg: 'bg-emerald-50', border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700', label: 'Create Allocation' },
  CREATE_EMPLOYEE:    { bg: 'bg-emerald-50', border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700', label: 'Create Employee' },
};

function getActionSummary(action: Action): string {
  switch (action.type) {
    case 'UPDATE_ALLOCATION':
      return action.reason || `Update allocation ${action.allocationId} → ${JSON.stringify(action.changes)}`;
    case 'CREATE_ALLOCATION':
      return `${action.employeeDisplayName} → ${action.projectDisplayName} at ${action.allocationPercent}% (${action.roleOnProject})`;
    case 'CREATE_CLIENT':
      return `New client: ${action.clientName} (ID: ${action.clientId})`;
    case 'CREATE_PROJECT':
      return `New project: "${action.name}" for ${action.clientName}`;
    case 'CREATE_EMPLOYEE':
      return `New employee: ${action.name} — ${action.title}`;
    case 'UPDATE_EMPLOYEE':
      return action.reason || `Update employee ${action.employeeId}`;
    case 'UPDATE_PROJECT':
      return action.reason || `Update project ${action.projectId}`;
    default:
      return JSON.stringify(action);
  }
}

export default function CommandPanel({
  actionPlan,
  command,
  onConfirm,
  onCancel,
  loading,
}: CommandPanelProps) {
  const [docText, setDocText] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docUploading, setDocUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const confidenceColor =
    actionPlan.confidence >= 0.85
      ? 'text-emerald-600'
      : actionPlan.confidence >= 0.65
      ? 'text-amber-600'
      : 'text-red-600';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/extract-text', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.text) {
        setDocText(data.text);
        setDocFileName(file.name);
      }
    } catch {
      alert('Could not extract text from file.');
    } finally {
      setDocUploading(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-jade/20 shadow-md bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-jade to-jade/80 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-white/80 text-lg">⚡</span>
          <span className="text-white font-heading font-semibold text-sm tracking-wide">RAMP Command Engine</span>
        </div>
        <span className={`text-xs font-body font-semibold ${confidenceColor} bg-white/90 px-2 py-0.5 rounded-full`}>
          {Math.round(actionPlan.confidence * 100)}% confidence
        </span>
      </div>

      {/* Summary */}
      <div className="px-5 py-3 bg-jade/5 border-b border-jade/10">
        <p className="text-jade font-body font-medium text-sm">{actionPlan.summary}</p>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 space-y-2.5">
        <p className="text-xs text-jade/50 font-body uppercase tracking-widest mb-3">
          {actionPlan.actions.length} action{actionPlan.actions.length !== 1 ? 's' : ''} planned
        </p>
        {actionPlan.actions.map((action, i) => {
          const color = ACTION_COLORS[action.type] || ACTION_COLORS['UPDATE_ALLOCATION'];
          return (
            <div
              key={i}
              className={`flex items-start gap-3 px-3.5 py-2.5 rounded-lg border ${color.bg} ${color.border}`}
            >
              <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ${color.badge}`}>
                {color.label}
              </span>
              <p className="text-sm font-body text-slate-700 leading-snug">
                {getActionSummary(action)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Missing info warnings */}
      {actionPlan.missingInfo?.length > 0 && (
        <div className="px-5 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
            <p className="text-xs font-body font-semibold text-amber-700 mb-1">Assumptions & defaults used:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {actionPlan.missingInfo.map((info, i) => (
                <li key={i} className="text-xs font-body text-amber-600">{info}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Document upload */}
      <div className="px-5 pb-4">
        <div className="border border-dashed border-jade/30 rounded-xl p-3.5 bg-jade/2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              {docFileName ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-body text-jade font-semibold">📎 {docFileName}</span>
                  <button
                    onClick={() => { setDocText(''); setDocFileName(''); }}
                    className="text-xs text-jade/50 hover:text-jade/70"
                  >
                    ✕ remove
                  </button>
                </div>
              ) : (
                <p className="text-xs font-body text-jade/60">
                  <span className="font-semibold">Optional:</span> Attach a contract, SOW, or brief — the AI will extract details to fill any gaps automatically.
                </p>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={docUploading}
              className="text-xs font-body font-semibold text-jade border border-jade/30 px-3 py-1.5 rounded-lg hover:bg-jade/10 transition-colors whitespace-nowrap"
            >
              {docUploading ? 'Reading...' : docFileName ? 'Replace' : 'Attach Doc'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3">
        <button
          onClick={() => onConfirm(docText, docFileName)}
          disabled={loading}
          className="flex-1 bg-jade text-white font-body font-semibold text-sm py-3 rounded-xl hover:bg-jade/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Applying changes...
            </>
          ) : (
            <>⚡ Confirm &amp; Apply {actionPlan.actions.length} Change{actionPlan.actions.length !== 1 ? 's' : ''}</>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-3 rounded-xl border border-jade/20 text-jade/70 font-body text-sm hover:bg-jade/5 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
