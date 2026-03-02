'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type EntityType = 'employee' | 'project' | 'allocation' | 'client';

interface AddEntityModalProps {
  entityType: EntityType;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

const ENTITY_LABELS: Record<EntityType, string> = {
  employee: 'Employee',
  project: 'Project',
  allocation: 'Allocation',
  client: 'Client',
};

const ENTITY_FILE_HINTS: Record<EntityType, string> = {
  employee: 'Upload a resume (.txt) — AI will extract name, skills, certifications, and bio',
  project: 'Upload a SOW, project charter, or brief (.txt) — AI will extract project details',
  allocation: 'Upload a staffing plan (.txt) — AI will extract assignment details',
  client: 'Upload a client brief, RFP, or engagement overview (.txt)',
};

// ── Default empty forms ────────────────────────────────────────────

function EmployeeForm({ data, onChange }: { data: any; onChange: (k: string, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-xs font-body font-semibold text-jade mb-1">Full Name *</label>
        <input value={data.name || ''} onChange={e => onChange('name', e.target.value)} className="form-input w-full" placeholder="First Last" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Email *</label>
        <input value={data.email || ''} onChange={e => onChange('email', e.target.value)} className="form-input w-full" placeholder="email@linea.com" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Title *</label>
        <input value={data.title || ''} onChange={e => onChange('title', e.target.value)} className="form-input w-full" placeholder="Senior Consultant" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Level</label>
        <select value={data.level || 'Consultant'} onChange={e => onChange('level', e.target.value)} className="form-input w-full">
          <option>Associate</option><option>Consultant</option><option>Senior</option><option>Principal</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Company Group</label>
        <select value={data.companyGroup || 'Linea Solutions'} onChange={e => onChange('companyGroup', e.target.value)} className="form-input w-full">
          <option>Linea Solutions</option><option>Linea Solutions ULC</option><option>Linea Secure</option><option>ICON</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Practice</label>
        <select value={data.practice || 'CrossPractice'} onChange={e => onChange('practice', e.target.value)} className="form-input w-full">
          <option>Pension</option><option>Insurance</option><option>WorkersComp</option><option>Benefits</option><option>CrossPractice</option><option>Cybersecurity</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Location</label>
        <select value={data.location || 'US'} onChange={e => onChange('location', e.target.value)} className="form-input w-full">
          <option>US</option><option>Canada</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Role Family</label>
        <select value={data.roleFamily || 'BA'} onChange={e => onChange('roleFamily', e.target.value)} className="form-input w-full">
          <option>BA</option><option>PM</option><option>Testing</option><option>OCM</option><option>TechAnalysis</option><option>Data</option><option>Cyber</option><option>Training</option>
        </select>
      </div>
    </div>
  );
}

function ProjectForm({ data, onChange }: { data: any; onChange: (k: string, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-xs font-body font-semibold text-jade mb-1">Project Name *</label>
        <input value={data.name || ''} onChange={e => onChange('name', e.target.value)} className="form-input w-full" placeholder="CLIENT – Project Description" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Client Name *</label>
        <input value={data.clientName || ''} onChange={e => onChange('clientName', e.target.value)} className="form-input w-full" placeholder="Full Client Name" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Client ID</label>
        <input value={data.clientId || ''} onChange={e => onChange('clientId', e.target.value)} className="form-input w-full" placeholder="ABBREV" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Status</label>
        <select value={data.status || 'Planning'} onChange={e => onChange('status', e.target.value)} className="form-input w-full">
          <option>Planning</option><option>In Progress</option><option>On Hold</option><option>Closing</option><option>Completed</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Phase</label>
        <select value={data.currentPhase || 'Discovery'} onChange={e => onChange('currentPhase', e.target.value)} className="form-input w-full">
          <option>Discovery</option><option>Assessment</option><option>Planning</option><option>Requirements</option><option>Implementation</option><option>Testing</option><option>UAT</option><option>Go-Live</option><option>Support</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Start Date</label>
        <input type="date" value={data.startDate || ''} onChange={e => onChange('startDate', e.target.value)} className="form-input w-full" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">End Date</label>
        <input type="date" value={data.endDate || ''} onChange={e => onChange('endDate', e.target.value)} className="form-input w-full" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Engagement Class</label>
        <select value={data.engagementClass || 'Client'} onChange={e => onChange('engagementClass', e.target.value)} className="form-input w-full">
          <option>Client</option><option>ULC</option><option>Cyber</option><option>ICON</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Industry</label>
        <select value={data.industryTag || ''} onChange={e => onChange('industryTag', e.target.value)} className="form-input w-full">
          <option value="">—</option><option value="pension">Pension</option><option value="insurance">Insurance</option><option value="workers_comp">Workers Comp</option><option value="benefits">Benefits</option><option value="cybersecurity">Cybersecurity</option><option value="data">Data</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-body font-semibold text-jade mb-1">Description</label>
        <textarea value={data.description || ''} onChange={e => onChange('description', e.target.value)} className="form-input w-full h-20 resize-none" placeholder="Project overview..." />
      </div>
    </div>
  );
}

function AllocationForm({ data, onChange }: { data: any; onChange: (k: string, v: any) => void }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [empSearch, setEmpSearch] = useState('');
  const [projSearch, setProjSearch] = useState('');

  useEffect(() => {
    fetch(`/api/employees?search=${encodeURIComponent(empSearch)}&limit=10`)
      .then(r => r.json()).then(d => setEmployees(d.employees || []));
  }, [empSearch]);

  useEffect(() => {
    fetch(`/api/projects?search=${encodeURIComponent(projSearch)}&limit=10`)
      .then(r => r.json()).then(d => setProjects(d.projects || []));
  }, [projSearch]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-xs font-body font-semibold text-jade mb-1">Employee *</label>
        <input value={empSearch} onChange={e => setEmpSearch(e.target.value)} placeholder="Search employee..." className="form-input w-full mb-1" />
        <select value={data.employeeId || ''} onChange={e => onChange('employeeId', e.target.value)} className="form-input w-full" size={3}>
          <option value="">— select —</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.title})</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-body font-semibold text-jade mb-1">Project *</label>
        <input value={projSearch} onChange={e => setProjSearch(e.target.value)} placeholder="Search project..." className="form-input w-full mb-1" />
        <select value={data.projectId || ''} onChange={e => onChange('projectId', e.target.value)} className="form-input w-full" size={3}>
          <option value="">— select —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Role</label>
        <select value={data.roleOnProject || 'BA'} onChange={e => onChange('roleOnProject', e.target.value)} className="form-input w-full">
          <option>BA</option><option>PM</option><option>Testing</option><option>OCM</option><option>DataAnalyst</option><option>Cyber</option><option>AIAdvisory</option><option>Oversight</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Allocation %</label>
        <input type="number" min="1" max="100" value={data.allocationPercent || 100} onChange={e => onChange('allocationPercent', parseInt(e.target.value))} className="form-input w-full" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Start Date *</label>
        <input type="date" value={data.startDate || ''} onChange={e => onChange('startDate', e.target.value)} className="form-input w-full" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">End Date *</label>
        <input type="date" value={data.endDate || ''} onChange={e => onChange('endDate', e.target.value)} className="form-input w-full" />
      </div>
    </div>
  );
}

function ClientForm({ data, onChange }: { data: any; onChange: (k: string, v: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Client Name *</label>
        <input value={data.clientName || ''} onChange={e => onChange('clientName', e.target.value)} className="form-input w-full" placeholder="Full Official Name" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Client ID</label>
        <input value={data.clientId || ''} onChange={e => onChange('clientId', e.target.value)} className="form-input w-full" placeholder="ABBREV" />
      </div>
      <div>
        <label className="block text-xs font-body font-semibold text-jade mb-1">Sector</label>
        <select value={data.sector || 'pension'} onChange={e => onChange('sector', e.target.value)} className="form-input w-full">
          <option value="pension">Pension</option><option value="insurance">Insurance</option><option value="workers_comp">Workers Comp</option><option value="benefits">Benefits</option><option value="cybersecurity">Cybersecurity</option><option value="data">Data</option><option value="government">Government</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-body font-semibold text-jade mb-1">Notes</label>
        <textarea value={data.notes || ''} onChange={e => onChange('notes', e.target.value)} className="form-input w-full h-20 resize-none" placeholder="Key context about this client..." />
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────

export default function AddEntityModal({ entityType, onClose, onSuccess }: AddEntityModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'form' | 'submitting' | 'done'>('upload');
  const [formData, setFormData] = useState<any>({});
  const [pageLayout, setPageLayout] = useState<any>({});
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [resultId, setResultId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

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

  const handleFileUpload = async (file: File) => {
    setParsing(true);
    setParseError('');
    try {
      const text = await extractText(file);
      const res = await fetch('/api/parse-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent: text, entityType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parsing failed');
      setFormData(data.parsedData || {});
      setPageLayout(data.pageLayout || {});
    } catch (err: any) {
      setParseError(err.message || 'Could not parse file');
    } finally {
      setParsing(false);
      setStep('form');
    }
  };

  const handleSubmit = async () => {
    setStep('submitting');
    setSubmitError('');

    const endpoints: Record<EntityType, string> = {
      employee: '/api/employees',
      project: '/api/projects',
      allocation: '/api/allocations',
      client: `/api/clients/${formData.clientId || 'new'}`,
    };

    const methods: Record<EntityType, string> = {
      employee: 'POST',
      project: 'POST',
      allocation: 'POST',
      client: 'PUT',
    };

    const payload = entityType === 'client'
      ? { ...formData, pageLayout }
      : { ...formData, pageLayout };

    try {
      const res = await fetch(endpoints[entityType], {
        method: methods[entityType],
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setResultId(data.id || data.note?.clientId || '');
      setStep('done');
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || 'Could not save');
      setStep('form');
    }
  };

  const navToResult = () => {
    const paths: Record<EntityType, string> = {
      employee: `/person/${resultId}`,
      project: `/project/${resultId}`,
      allocation: `/browse/allocations`,
      client: `/client/${formData.clientId}`,
    };
    router.push(paths[entityType]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-jade/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-jade to-jade/80 px-5 py-4 flex items-center justify-between">
          <h2 className="text-white font-heading font-bold text-base">
            Add {ENTITY_LABELS[entityType]}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-jade/25 rounded-xl p-8 text-center cursor-pointer hover:border-jade/50 hover:bg-jade/2 transition-all"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) handleFileUpload(f);
                }}
              >
                {parsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-jade/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-jade/60 font-body text-sm">AI is analyzing your document...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-3">📄</div>
                    <p className="text-jade font-body font-medium text-sm">Drop a file here or click to browse</p>
                    <p className="text-jade/50 font-body text-xs mt-1">{ENTITY_FILE_HINTS[entityType]}</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".txt,.pdf,.docx,.doc" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              </div>
              {parseError && <p className="text-rust text-sm font-body">{parseError}</p>}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-jade/15" />
                <span className="text-xs text-jade/40 font-body">or</span>
                <div className="flex-1 h-px bg-jade/15" />
              </div>
              <button onClick={() => setStep('form')} className="w-full py-2.5 border border-jade/25 rounded-lg text-jade text-sm font-body hover:bg-jade/5 transition-colors">
                Fill in manually
              </button>
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <div className="space-y-4">
              {Object.keys(pageLayout).length > 0 && (
                <div className="bg-jade/5 border border-jade/20 rounded-lg p-3">
                  <p className="text-xs font-body font-semibold text-jade mb-0.5">◆ AI pre-filled this form</p>
                  {(pageLayout as any).tagline && (
                    <p className="text-xs text-jade/60 font-body">{(pageLayout as any).tagline}</p>
                  )}
                </div>
              )}
              {entityType === 'employee' && <EmployeeForm data={formData} onChange={updateField} />}
              {entityType === 'project' && <ProjectForm data={formData} onChange={updateField} />}
              {entityType === 'allocation' && <AllocationForm data={formData} onChange={updateField} />}
              {entityType === 'client' && <ClientForm data={formData} onChange={updateField} />}
              {submitError && <p className="text-rust text-sm font-body">{submitError}</p>}
            </div>
          )}

          {/* Step: Submitting */}
          {step === 'submitting' && (
            <div className="py-8 flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-jade/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-jade/60 font-body text-sm">Saving to database...</p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="py-6 text-center space-y-4">
              <div className="text-4xl">✓</div>
              <p className="text-jade font-heading font-bold">
                {ENTITY_LABELS[entityType]} added successfully!
              </p>
              {(pageLayout as any).tagline && (
                <p className="text-jade/60 text-sm font-body">{(pageLayout as any).tagline}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3.5 flex gap-2 justify-end bg-canvas">
          {step === 'upload' && (
            <button onClick={onClose} className="btn-accent text-sm">Cancel</button>
          )}
          {step === 'form' && (
            <>
              <button onClick={() => setStep('upload')} className="btn-accent text-sm">← Back</button>
              <button onClick={handleSubmit} className="btn-primary text-sm">Save {ENTITY_LABELS[entityType]}</button>
            </>
          )}
          {step === 'done' && (
            <>
              <button onClick={onClose} className="btn-accent text-sm">Close</button>
              {resultId && (
                <button onClick={navToResult} className="btn-primary text-sm">
                  View {ENTITY_LABELS[entityType]} →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
