// app/changes/page.tsx
// Shows the full history of NL-driven data changes.

import { prisma } from '@/lib/db';
import Link from 'next/link';

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(d));
}

export default async function ChangesPage() {
  const logs = await prisma.changeLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-jade">Change History</h2>
          <p className="text-jade/50 font-body text-sm mt-0.5">
            All natural language data changes applied via the Command Engine
          </p>
        </div>
        <Link
          href="/?mode=change"
          className="btn-primary px-4 py-2.5 text-sm rounded-xl"
        >
          ⚡ New Command
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">⚡</div>
          <p className="text-jade/50 font-body text-sm mb-4">No changes yet.</p>
          <Link href="/" className="text-jade font-body font-medium underline underline-offset-2">
            Go to homepage and try a command
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            let plan: any = null;
            try { plan = JSON.parse(log.actionPlan); } catch {}
            const actionCount = plan?.actions?.length ?? 0;

            return (
              <details
                key={log.id}
                className="card overflow-hidden group"
              >
                <summary className="flex items-start gap-4 px-5 py-4 cursor-pointer list-none hover:bg-jade/3 transition-colors">
                  {/* Status dot */}
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${log.executed ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-slate-800 leading-snug truncate">
                      {log.command}
                    </p>
                    <p className="text-xs font-body text-slate-500 mt-0.5 line-clamp-2">
                      {log.summary || '—'}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-body text-slate-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <span className={`text-xs font-body px-2 py-0.5 rounded-full ${log.executed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {log.executed ? 'Applied' : 'Partial'}
                      </span>
                      {actionCount > 0 && (
                        <span className="text-xs font-body text-slate-400">
                          {actionCount} action{actionCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {log.docFileName && (
                        <span className="text-xs font-body text-jade/60">📎 doc</span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg className="w-4 h-4 text-jade/30 flex-shrink-0 mt-1 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </summary>

                {/* Expanded detail */}
                <div className="border-t border-jade/10 px-5 py-4 bg-slate-50/60 space-y-4">
                  {/* Action plan breakdown */}
                  {plan?.actions?.length > 0 && (
                    <div>
                      <p className="text-xs font-body font-semibold text-jade/60 uppercase tracking-widest mb-2">
                        Actions
                      </p>
                      <div className="space-y-1.5">
                        {plan.actions.map((a: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs font-body text-slate-600">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                              a.type.startsWith('CREATE') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {a.type.replace('_', ' ')}
                            </span>
                            <span>{a.reason || JSON.stringify(a).slice(0, 120)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assumptions */}
                  {plan?.missingInfo?.length > 0 && (
                    <div>
                      <p className="text-xs font-body font-semibold text-jade/60 uppercase tracking-widest mb-1">
                        Assumptions
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {plan.missingInfo.map((m: string, i: number) => (
                          <li key={i} className="text-xs font-body text-slate-500">{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Attached document */}
                  {log.docFileName && (
                    <div>
                      <p className="text-xs font-body font-semibold text-jade/60 uppercase tracking-widest mb-1">
                        Attached Document
                      </p>
                      <p className="text-xs font-body text-slate-600">📎 {log.docFileName}</p>
                      {log.docText && (
                        <p className="text-xs font-body text-slate-400 mt-1 line-clamp-3">
                          {log.docText.slice(0, 300)}…
                        </p>
                      )}
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs font-body text-slate-400 flex gap-4">
                    <span>Created: {formatDate(log.createdAt)}</span>
                    {log.executedAt && <span>Executed: {formatDate(log.executedAt)}</span>}
                    {plan?.confidence && (
                      <span>Confidence: {Math.round(plan.confidence * 100)}%</span>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
