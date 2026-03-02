'use client';

import { useState, useRef } from 'react';

interface ClientUploaderProps {
  clientId: string;
  clientName: string;
}

export default function ClientUploader({ clientId, clientName }: ClientUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const extractText = async (file: File): Promise<string> => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc')) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/extract-text', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Could not extract text from file');
      const data = await res.json();
      return data.text as string;
    }
    return file.text();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setStatus('idle');
    setMessage('');

    try {
      const text = await extractText(file);

      // Step 1: Parse with AI
      const parseRes = await fetch('/api/parse-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: text,
          entityType: 'client',
          context: { clientId, clientName },
        }),
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok) throw new Error(parseData.error || 'Parsing failed');

      // Step 2: Save pageLayout + notes to ClientNote
      const saveRes = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          pageLayout: parseData.pageLayout,
          notes: parseData.parsedData?.notes || '',
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save client insight');

      setStatus('success');
      setMessage('Client brief analyzed and saved. Page will reload with AI insights.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <label className={`btn-primary text-sm cursor-pointer flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing...
          </>
        ) : '↑ Upload Brief'}
        <input ref={fileRef} type="file" accept=".txt,.pdf,.docx,.doc" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} disabled={uploading} />
      </label>
      <p className="text-xs text-jade/40 font-body">Upload a client brief to generate AI insights</p>
      {status === 'success' && <p className="text-xs text-jade font-body">{message}</p>}
      {status === 'error' && <p className="text-xs text-rust font-body">{message}</p>}
    </div>
  );
}
