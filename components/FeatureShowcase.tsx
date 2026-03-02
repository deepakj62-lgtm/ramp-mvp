'use client';

import { useState, useEffect, useCallback } from 'react';

const FEATURES = [
  {
    id: 'search',
    label: 'AI Talent Search',
    icon: '🔍',
    color: 'jade',
    tagline: 'Ask in plain English. Get the right person.',
    description: 'No filters, no dropdowns. Just type what you need — skills, availability, certifications, location — and RAMP surfaces the best match from your entire workforce.',
    demo: {
      type: 'search',
      query: 'CISSP-certified cyber consultant available in Canada',
      results: [
        { name: 'Cassandra Kirchmeier', title: 'Sr. Consultant, Linea Secure', avail: '100% free', score: '94%', tag: 'CISSP · Canada · Cyber' },
        { name: 'Peter Dewar', title: 'President, Linea Secure', avail: '80% free', score: '88%', tag: 'CISSP · CISA · PCSF' },
        { name: 'Jason Todd', title: 'VP, Cybersecurity', avail: '60% free', score: '71%', tag: 'Pen Testing · Cloud' },
      ],
    },
  },
  {
    id: 'assistant',
    label: 'RAMP Assistant',
    icon: '◆',
    color: 'sea',
    tagline: 'Ask anything about your data.',
    description: 'Project status, team rosters, client overviews, allocation conflicts — just ask. The AI has live access to every record and answers with formatted responses and clickable links.',
    demo: {
      type: 'assistant',
      question: 'Who is leading the CalSTRS AI project and what phase are they in?',
      answer: 'The **CalSTRS — AI Deployment & System Implementation Support** project (PRJ-001001) is currently in the **Implementation** phase.\n\n**Engagement Manager:** [Nathan Haws](/person/emp-nate-haws) – Associate Principal Consultant & AI Researcher\n\n**Account Executive:** [Kevin Lynch](/person/emp-kevin-lynch) – Chief Sales Officer\n\nNate has been serving as AI Strategic Advisor since Jul 2023, alongside [Jessica Mahoney](/person/emp-jessica-mahoney) as Senior BA.',
    },
  },
  {
    id: 'selfcorrect',
    label: 'Self-Correcting Engine',
    icon: '⚡',
    color: 'rust',
    tagline: 'Your feedback rewrites the app — automatically.',
    description: 'Annotate a screenshot, describe what you want changed. RAMP\'s AI reads the actual source code, generates a targeted edit, writes it to disk, and hot-reloads the change — no developer needed.',
    demo: {
      type: 'selfcorrect',
      steps: [
        { icon: '📸', label: 'User annotates screenshot', detail: '"Make this heading larger and bolder"' },
        { icon: '🧠', label: 'AI reads source files', detail: 'Locates exact code in app/page.tsx' },
        { icon: '✏️', label: 'Generates targeted edit', detail: 'text-4xl → text-6xl font-extrabold' },
        { icon: '✅', label: 'Writes & hot-reloads', detail: 'Live in < 3 seconds, no redeploy' },
      ],
    },
  },
  {
    id: 'profiles',
    label: 'Rich Profiles',
    icon: '👤',
    color: 'jade',
    tagline: 'Every person. Every project. Every allocation.',
    description: 'Upload a resume and AI auto-extracts skills, certifications, and tools. View monthly allocation heatmaps, active assignments, and career history — all in one place.',
    demo: {
      type: 'profile',
      name: 'Nathan Haws',
      title: 'Associate Principal & AI Researcher',
      group: 'Linea Solutions',
      skills: ['AI Strategy', 'Six Sigma Black Belt', 'OCEB2', 'ChFC', 'Data Analysis', 'Pension Administration'],
      months: [0, 0, 90, 90, 90, 50, 50, 50, 40, 40, 0, 0],
    },
  },
  {
    id: 'clients',
    label: 'Client Intelligence',
    icon: '🏦',
    color: 'sea',
    tagline: 'Every client. Every engagement. One view.',
    description: 'Upload a client brief and AI generates an insight banner, key stats, and project summary. See all projects, team members, and capacity at a glance for any client.',
    demo: {
      type: 'client',
      name: 'California State Teachers\' Retirement System',
      tag: 'Pension',
      stats: [
        { label: 'Active Projects', value: '2' },
        { label: 'Roles Engaged', value: '5' },
        { label: 'Since', value: '2023' },
      ],
      projects: [
        { name: 'CalSTRS — AI Deployment & System Implementation', phase: 'Implementation', em: 'Haws, Nathan' },
        { name: 'Pension Cyber Security Framework (PCSF) Rollout', phase: 'Implementation', em: 'Dewar, Peter' },
      ],
    },
  },
  {
    id: 'addentity',
    label: 'AI-Powered Onboarding',
    icon: '✨',
    color: 'rust',
    tagline: 'Upload a file. Get a fully populated record.',
    description: 'Drop in a resume, SOW, or client brief. AI parses it instantly and pre-fills every field — name, skills, certifications, dates, roles. Review, confirm, and it\'s live.',
    demo: {
      type: 'addentity',
      steps: [
        { label: 'Drop a file', sub: 'Resume · SOW · Client brief', icon: '📄' },
        { label: 'AI extracts everything', sub: 'Name, skills, certs, dates, roles', icon: '🤖' },
        { label: 'Review & confirm', sub: 'All fields editable before saving', icon: '✏️' },
        { label: 'Record goes live', sub: 'Searchable instantly', icon: '🚀' },
      ],
    },
  },
];

const MONTH_LABELS = ['J','F','M','A','M','J','J','A','S','O','N','D'];

function tileColor(v: number) {
  if (v === 0) return 'bg-gray-100';
  if (v <= 60) return 'bg-jade/30';
  if (v <= 100) return 'bg-jade/60';
  return 'bg-rust/70';
}

const accentBorder: Record<string, string> = {
  jade: 'border-jade',
  sea:  'border-sea',
  rust: 'border-rust',
};
const accentText: Record<string, string> = {
  jade: 'text-jade',
  sea:  'text-sea',
  rust: 'text-rust',
};
const accentBg: Record<string, string> = {
  jade: 'bg-jade',
  sea:  'bg-sea',
  rust: 'bg-rust',
};

export default function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setAnimKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive(a => {
        const next = (a + 1) % FEATURES.length;
        setAnimKey(k => k + 1);
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [paused]);

  const f = FEATURES[active];

  return (
    <div
      className="max-w-5xl mx-auto mt-16 mb-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jade/10 border border-jade/20 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
          <span className="text-xs font-body font-medium text-jade tracking-wide uppercase">Platform Capabilities</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-jade">Everything RAMP can do</h2>
        <p className="text-jade/50 text-sm font-body mt-1">Hover to pause · Click a tab to explore</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 justify-center flex-wrap mb-6">
        {FEATURES.map((feat, i) => (
          <button
            key={feat.id}
            onClick={() => goTo(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all duration-200 ${
              i === active
                ? `${accentBg[feat.color]} text-white shadow-sm`
                : 'bg-gray-100 text-jade/60 hover:bg-gray-200'
            }`}
          >
            <span>{feat.icon}</span>
            {feat.label}
          </button>
        ))}
      </div>

      {/* Main card */}
      <div
        key={animKey}
        className={`card overflow-hidden border-t-4 ${accentBorder[f.color]} shadow-md`}
        style={{ animation: 'fadeSlideIn 0.4s ease' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left — description */}
          <div className="p-8 flex flex-col justify-center border-r border-gray-100">
            <div className={`text-3xl mb-3`}>{f.icon}</div>
            <h3 className={`text-xl font-heading font-bold mb-2 ${accentText[f.color]}`}>{f.tagline}</h3>
            <p className="text-jade/70 font-body text-sm leading-relaxed">{f.description}</p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-6">
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === active ? `${accentBg[f.color]} w-6` : 'bg-gray-200 w-2'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right — live demo preview */}
          <div className="p-6 bg-canvas/40 flex flex-col justify-center">
            {f.demo.type === 'search' && (
              <div className="space-y-2">
                <div className="bg-white rounded-lg px-3 py-2 text-xs font-body text-jade/50 border border-jade/15 mb-3 italic">
                  "{f.demo.query}"
                </div>
                {(f.demo as any).results.map((r: any, i: number) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between gap-2 shadow-sm">
                    <div>
                      <div className="text-sm font-heading font-semibold text-jade">{r.name}</div>
                      <div className="text-xs text-jade/50 font-body">{r.title}</div>
                      <div className="text-xs text-jade/40 font-body mt-0.5">{r.tag}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-body text-jade font-semibold">{r.score}</div>
                      <div className="text-xs text-jade/40 font-body">{r.avail}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {f.demo.type === 'assistant' && (
              <div className="space-y-3">
                <div className="bg-jade/10 rounded-lg px-3 py-2 text-xs font-body text-jade/70 italic border border-jade/15">
                  "{(f.demo as any).question}"
                </div>
                <div className="bg-white rounded-xl overflow-hidden border border-jade/15 shadow-sm">
                  <div className="bg-jade px-4 py-2 flex items-center justify-between">
                    <span className="text-white text-xs font-heading font-semibold">◆ RAMP Assistant</span>
                    <span className="text-white/50 text-xs font-body">Powered by Claude</span>
                  </div>
                  <div className="p-3 text-xs font-body text-jade/80 leading-relaxed space-y-1">
                    {(f.demo as any).answer.split('\n\n').slice(0, 3).map((line: string, i: number) => (
                      <p key={i} className={line.startsWith('**') ? 'font-semibold text-jade' : ''}>
                        {line.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, (_, t) => t)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {f.demo.type === 'selfcorrect' && (
              <div className="space-y-2">
                {(f.demo as any).steps.map((step: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-rust/10 flex items-center justify-center text-sm flex-shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-xs font-heading font-semibold text-jade">{step.label}</div>
                      <div className="text-xs text-jade/50 font-body">{step.detail}</div>
                    </div>
                    {i === 3 && (
                      <span className="ml-auto text-xs font-body font-semibold text-rust bg-rust/10 px-2 py-0.5 rounded-full">Live ✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {f.demo.type === 'profile' && (
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-jade text-white flex items-center justify-center text-sm font-heading font-bold">NH</div>
                    <div>
                      <div className="text-sm font-heading font-bold text-jade">{(f.demo as any).name}</div>
                      <div className="text-xs text-jade/50 font-body">{(f.demo as any).title}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(f.demo as any).skills.map((s: string) => (
                      <span key={s} className="text-xs bg-jade/10 text-jade px-2 py-0.5 rounded-full font-body">{s}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-12 gap-0.5">
                    {(f.demo as any).months.map((v: number, i: number) => (
                      <div key={i} className="text-center">
                        <div className={`h-5 rounded-sm text-[9px] flex items-center justify-center font-body text-jade/60 ${tileColor(v)}`}>
                          {v > 0 ? `${v}` : ''}
                        </div>
                        <div className="text-[9px] text-jade/30 mt-0.5">{MONTH_LABELS[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {f.demo.type === 'client' && (
              <div className="space-y-2">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-sea/20 text-sea flex items-center justify-center text-xs font-heading font-bold">C</div>
                    <div>
                      <div className="text-xs font-heading font-bold text-jade leading-tight">{(f.demo as any).name}</div>
                      <span className="text-xs bg-sea/15 text-sea px-1.5 py-0.5 rounded font-body">{(f.demo as any).tag}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(f.demo as any).stats.map((s: any) => (
                      <div key={s.label} className="bg-canvas rounded-lg p-2 text-center">
                        <div className="text-base font-heading font-bold text-jade">{s.value}</div>
                        <div className="text-[10px] text-jade/50 font-body">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {(f.demo as any).projects.map((p: any) => (
                    <div key={p.name} className="text-xs border-t border-gray-100 pt-2 mt-2">
                      <div className="font-body font-medium text-jade leading-tight">{p.name}</div>
                      <div className="text-jade/40 font-body">{p.phase} · EM: {p.em}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {f.demo.type === 'addentity' && (
              <div className="space-y-2">
                {(f.demo as any).steps.map((step: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="text-xl">{step.icon}</div>
                    <div className="flex-1">
                      <div className="text-xs font-heading font-semibold text-jade">{step.label}</div>
                      <div className="text-xs text-jade/50 font-body">{step.sub}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      i < 4 ? 'bg-rust/15 text-rust' : 'bg-gray-100 text-gray-300'
                    }`}>
                      {i < 4 ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-play progress bar */}
      {!paused && (
        <div className="mt-3 h-0.5 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            key={`bar-${animKey}`}
            className={`h-full ${accentBg[f.color]} rounded-full`}
            style={{ animation: 'progressBar 5s linear forwards' }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
