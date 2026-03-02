'use client';

import { useState, useRef } from 'react';

interface ResumeUploaderProps {
  employeeId: string;
  employeeName: string;
}

export default function ResumeUploader({ employeeId, employeeName }: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus('idle');
    setMessage('');
    setExtractedSkills(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch(`/api/upload-resume/${employeeId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Upload failed. Please try again.');
      } else {
        setStatus('success');
        setMessage(data.message);
        setExtractedSkills(data.extractedSkills);
        // Reload page after short delay to reflect updated profile
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch {
      setStatus('error');
      setMessage('Upload failed. Please check your connection and try again.');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-body text-jade/60">Upload a resume to auto-update this profile</p>
        <label className={`btn-primary text-sm cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Parsing...
            </span>
          ) : 'Upload Resume'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx,.doc"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <p className="text-xs text-jade/40 font-body">Accepts .txt, .pdf, .docx, and .doc files.</p>

      {status === 'success' && (
        <div className="mt-3 bg-jade/5 border border-jade/20 rounded-lg p-3">
          <p className="text-sm text-jade font-body font-medium">{message}</p>
          {extractedSkills && (
            <div className="mt-2 text-xs text-jade/70 font-body">
              {extractedSkills.skills?.length > 0 && (
                <p>Skills: {extractedSkills.skills.slice(0, 5).map((s: any) => s.name).join(', ')}{extractedSkills.skills.length > 5 ? ` +${extractedSkills.skills.length - 5} more` : ''}</p>
              )}
              {extractedSkills.tools?.length > 0 && (
                <p>Tools: {extractedSkills.tools.slice(0, 4).map((t: any) => t.name || t).join(', ')}{extractedSkills.tools.length > 4 ? ` +${extractedSkills.tools.length - 4} more` : ''}</p>
              )}
            </div>
          )}
          <p className="text-xs text-jade/40 mt-1">Reloading page...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 bg-rust/10 border border-rust/30 rounded-lg p-3">
          <p className="text-sm text-rust font-body">{message}</p>
        </div>
      )}
    </div>
  );
}
