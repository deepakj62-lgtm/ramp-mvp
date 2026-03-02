'use client';

import { useState } from 'react';

interface ProfileFeedbackButtonProps {
  entityType: 'employee' | 'project' | 'client';
  entityName: string;
  entityId: string;
  pageUrl: string;
}

export default function ProfileFeedbackButton({
  entityType,
  entityName,
  entityId,
  pageUrl,
}: ProfileFeedbackButtonProps) {
  const [open, setOpen]       = useState(false);
  const [text, setText]       = useState('');
  const [status, setStatus]   = useState<'idle' | 'sending' | 'done'>('idle');

  const entityLabel = entityType === 'employee' ? 'profile' : entityType === 'project' ? 'project page' : 'client page';

  async function handleSubmit() {
    if (!text.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: text.trim(),
          pageContext: pageUrl,
          chatTranscript: JSON.stringify([
            { role: 'user', content: `[Feedback on ${entityType} ${entityLabel}: ${entityName} (${entityId})]\n${text.trim()}` },
          ]),
        }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title={`Suggest a change to this ${entityLabel}`}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-jade/20 shadow-md text-jade/60 hover:text-jade hover:border-jade/40 hover:shadow-lg transition-all text-sm font-body font-medium"
      >
        <span className="text-base leading-none">✏️</span>
        <span>Suggest a change</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 w-80 bg-white rounded-2xl shadow-xl border border-jade/15 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-jade/10 bg-canvas">
        <span className="text-sm font-heading font-semibold text-jade">Suggest a change</span>
        <button onClick={() => { setOpen(false); setStatus('idle'); setText(''); }}
          className="text-jade/40 hover:text-jade transition-colors text-lg leading-none">✕</button>
      </div>

      {status === 'done' ? (
        <div className="px-4 py-6 text-center">
          <div className="text-2xl mb-2">✓</div>
          <p className="font-body text-jade font-semibold text-sm">We're on it.</p>
          <p className="font-body text-jade/55 text-xs mt-1">
            You'll be notified once the change is live.
          </p>
          <button
            onClick={() => { setOpen(false); setStatus('idle'); setText(''); }}
            className="mt-4 text-xs text-jade/40 hover:text-jade underline font-body"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <p className="text-xs text-jade/50 font-body">
            You're viewing <span className="font-semibold text-jade/70">{entityName}</span>'s {entityLabel}.
            Describe what you'd like changed:
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`e.g. "Move certifications to the top" or "Update the tagline to highlight cloud skills"`}
            rows={3}
            className="w-full text-sm font-body text-jade placeholder-jade/30 bg-canvas border border-jade/15 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-jade/30"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-jade/30 font-body">⌘↵ to send</span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || status === 'sending'}
              className="px-4 py-1.5 rounded-full bg-jade text-white text-xs font-body font-semibold disabled:opacity-40 hover:bg-jade/90 transition-colors"
            >
              {status === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
