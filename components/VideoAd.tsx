'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Scene definitions ─────────────────────────────────────────────────────
const SCENES = [
  { id: 'intro',       duration: 3800 },
  { id: 'problem',     duration: 4200 },
  { id: 'search',      duration: 5500 },
  { id: 'assistant',   duration: 5500 },
  { id: 'selfcorrect', duration: 6500 },
  { id: 'stats',       duration: 4200 },
  { id: 'cta',         duration: 3500 },
];
const TOTAL_MS = SCENES.reduce((s, sc) => s + sc.duration, 0);

// ─── Typewriter hook ───────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 28, active = true) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return displayed;
}

// ─── Scene components ──────────────────────────────────────────────────────

function SceneIntro({ visible }: { visible: boolean }) {
  const t1 = useTypewriter('RAMP', 80, visible);
  const t2 = useTypewriter('Resource Allocation Management Platform', 30, visible);
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-center">
        <div className="text-7xl font-heading font-black tracking-tight text-white mb-3" style={{ letterSpacing: '-2px' }}>
          {t1}
          <span className="text-[#6BBDC0]">.</span>
        </div>
        <div className="text-[#6BBDC0] font-body text-lg font-light tracking-widest uppercase mb-2 h-7">
          {t2}
        </div>
        <div className={`text-white/30 text-sm font-body transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '2.5s' }}>
          by Linea Solutions
        </div>
      </div>
    </div>
  );
}

function SceneProblem({ visible }: { visible: boolean }) {
  const rows = ['Spreadsheet A', 'Email thread', 'Slack DM', 'Phone call', 'Another spreadsheet'];
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-white/50 font-body text-sm uppercase tracking-widest mb-4">The old way</div>
      <div className="w-full max-w-lg space-y-2 mb-6">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)', transition: `all 0.4s ease ${i * 0.12}s` }}
          >
            <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
            <div className="text-white/40 font-body text-sm line-through">{row}</div>
            <div className="ml-auto text-red-400/60 text-xs font-body">outdated</div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <div className="text-white font-heading text-2xl font-bold mb-1">Finding the right person</div>
        <div className="text-white font-heading text-2xl font-bold text-[#6BBDC0]">used to take days.</div>
      </div>
    </div>
  );
}

function SceneSearch({ visible }: { visible: boolean }) {
  const query = useTypewriter('CISSP consultant free in Canada', 40, visible);
  const results = [
    { name: 'Cassandra Kirchmeier', title: 'Sr. Consultant, Linea Secure', score: '94%', tag: 'CISSP · Canada · Cyber', avail: '100% free' },
    { name: 'Peter Dewar', title: 'President, Linea Secure', score: '88%', tag: 'CISSP · CISA · PCSF', avail: '60% free' },
    { name: 'Jason Todd', title: 'VP, Cybersecurity', score: '71%', tag: 'Pen Testing · Cloud', avail: '40% free' },
  ];
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full max-w-lg">
        <div className="text-white/50 text-xs font-body uppercase tracking-widest mb-3 text-center">AI Talent Search</div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-body text-white text-sm backdrop-blur-sm">
            <span className="text-white/40">{query}</span>
            <span className="inline-block w-0.5 h-4 bg-[#6BBDC0] ml-0.5 animate-pulse align-middle" />
          </div>
          <div className="bg-[#1C4A52] text-white rounded-xl px-4 py-3 text-sm font-body font-medium">Ask</div>
        </div>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 flex items-center justify-between backdrop-blur-sm"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: `all 0.4s ease ${0.8 + i * 0.2}s` }}
            >
              <div>
                <div className="text-white font-heading font-semibold text-sm">{r.name}</div>
                <div className="text-white/40 font-body text-xs">{r.title}</div>
                <div className="text-[#6BBDC0]/70 font-body text-xs mt-0.5">{r.tag}</div>
              </div>
              <div className="text-right">
                <div className="text-[#6BBDC0] font-body font-bold text-sm">{r.score}</div>
                <div className="text-white/40 font-body text-xs">{r.avail}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-3 text-white/40 font-body text-xs">Results in under 2 seconds</div>
      </div>
    </div>
  );
}

function SceneAssistant({ visible }: { visible: boolean }) {
  const question = 'Who is leading the CalSTRS AI project?';
  const answerLines = [
    { text: 'CalSTRS — AI Deployment & System Implementation', bold: true },
    { text: 'is currently in the Implementation phase.' },
    { text: '' },
    { text: 'Engagement Manager: Nathan Haws', bold: true },
    { text: 'Associate Principal & AI Researcher' },
    { text: '' },
    { text: 'Account Executive: Kevin Lynch', bold: true },
    { text: 'Chief Sales Officer' },
  ];
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    if (!visible) { setLineIdx(0); return; }
    const id = setInterval(() => setLineIdx(i => Math.min(i + 1, answerLines.length)), 350);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full max-w-lg">
        <div className="text-white/50 text-xs font-body uppercase tracking-widest mb-3 text-center">RAMP Assistant</div>
        <div className="bg-white/8 border border-white/15 rounded-xl overflow-hidden backdrop-blur-sm mb-3">
          <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/60 font-body text-xs italic">"{question}"</span>
          </div>
        </div>
        <div className="bg-white/8 border border-white/15 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="bg-[#1C4A52] px-4 py-2.5 flex items-center justify-between">
            <span className="text-white font-heading font-semibold text-sm">◆ RAMP Assistant</span>
            <span className="text-white/40 text-xs font-body">Powered by Claude</span>
          </div>
          <div className="p-4 space-y-1 min-h-[120px]">
            {answerLines.slice(0, lineIdx).map((line, i) => (
              <div key={i} className={`font-body text-sm ${line.bold ? 'text-white font-semibold' : 'text-white/60'} ${line.text === '' ? 'h-2' : ''}`}>
                {line.text}
              </div>
            ))}
            {lineIdx < answerLines.length && (
              <span className="inline-block w-0.5 h-4 bg-[#6BBDC0] animate-pulse align-middle" />
            )}
          </div>
        </div>
        <div className="text-center mt-3 text-white/40 font-body text-xs">Live answers from your real data</div>
      </div>
    </div>
  );
}

function SceneSelfCorrect({ visible }: { visible: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!visible) { setStep(0); return; }
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2800),
      setTimeout(() => setStep(4), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const steps = [
    { icon: '📸', label: 'User annotates screenshot', detail: '"Make the heading larger and bolder"', color: 'border-white/20' },
    { icon: '🧠', label: 'AI reads source files', detail: 'Locates text in app/page.tsx line 109', color: 'border-[#6BBDC0]/40' },
    { icon: '✏️', label: 'Generates targeted edit', detail: 'text-4xl font-bold → text-6xl font-extrabold', color: 'border-yellow-400/40' },
    { icon: '✅', label: 'Writes to disk & hot-reloads', detail: 'Live in < 3 seconds. No redeploy needed.', color: 'border-green-400/40' },
  ];

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full max-w-lg">
        <div className="text-white/50 text-xs font-body uppercase tracking-widest mb-2 text-center">Self-Correcting Engine</div>
        <div className="text-white font-heading text-xl font-bold text-center mb-5">
          Your feedback <span className="text-[#6BBDC0]">rewrites the app</span> — automatically.
        </div>
        <div className="space-y-2.5">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl px-4 py-3 border transition-all duration-500 ${
                i < step
                  ? `bg-white/10 ${s.color} opacity-100`
                  : 'bg-white/3 border-white/5 opacity-30'
              }`}
              style={{ transform: i < step ? 'scale(1)' : 'scale(0.98)' }}
            >
              <span className="text-xl mt-0.5">{s.icon}</span>
              <div className="flex-1">
                <div className="text-white font-body font-semibold text-sm">{s.label}</div>
                <div className={`font-body text-xs mt-0.5 font-mono ${i < step ? 'text-white/50' : 'text-white/20'}`}>{s.detail}</div>
              </div>
              {i === 3 && step === 4 && (
                <div className="text-green-400 font-body text-xs font-bold bg-green-400/10 px-2 py-1 rounded-full">Live ✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneStats({ visible }: { visible: boolean }) {
  const stats = [
    { value: 69, label: 'Consultants', suffix: '' },
    { value: 32, label: 'Projects', suffix: '' },
    { value: 29, label: 'Clients', suffix: '' },
    { value: 3, label: 'Seconds to apply a change', suffix: '' },
  ];
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    if (!visible) { setCounts([0, 0, 0, 0]); return; }
    const duration = 1400;
    const start = Date.now();
    const id = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts(stats.map(s => Math.round(s.value * ease)));
      if (progress >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-white/50 text-xs font-body uppercase tracking-widest mb-6 text-center">Everything in one platform</div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/8 border border-white/15 rounded-2xl p-5 text-center backdrop-blur-sm">
            <div className="text-4xl font-heading font-black text-white mb-1">{counts[i]}<span className="text-[#6BBDC0]">{s.suffix}</span></div>
            <div className="text-white/40 font-body text-xs">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="text-white/60 font-body text-sm text-center">Real data. Live search. Automatic updates.</div>
    </div>
  );
}

function SceneCTA({ visible }: { visible: boolean }) {
  const t = useTypewriter('Ask anything.', 60, visible);
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="text-center">
        <div className="text-6xl font-heading font-black text-white mb-2" style={{ letterSpacing: '-1px' }}>{t}</div>
        <div
          className="text-[#6BBDC0] font-body text-lg mb-8 transition-opacity duration-1000"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '1.5s' }}
        >
          Find people. Track projects. Fix the app itself.
        </div>
        <div
          className="inline-flex items-center gap-2 bg-[#6BBDC0] text-[#0D2B30] font-body font-bold px-8 py-3 rounded-full text-sm transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transitionDelay: '2.2s' }}
        >
          <span>↑</span> Scroll up and try it
        </div>
      </div>
    </div>
  );
}

// ─── Main VideoAd component ────────────────────────────────────────────────

export default function VideoAd() {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const playingRef = useRef(false);

  const tick = useCallback((now: number) => {
    if (!playingRef.current) return; // bail if stopped externally
    if (lastRef.current !== null) {
      setElapsed(e => {
        const next = e + (now - lastRef.current!);
        if (next >= TOTAL_MS) {
          playingRef.current = false;
          setPlaying(false);
          return TOTAL_MS;
        }
        return next;
      });
    }
    lastRef.current = now;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (playing) {
      playingRef.current = true;
      lastRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      playingRef.current = false;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      lastRef.current = null;
    }
    return () => {
      playingRef.current = false;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [playing, tick]);

  const handlePlay = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    playingRef.current = false;
    setElapsed(0);
    setStarted(true);
    setPlaying(true);
  };

  const handlePause = () => setPlaying(p => !p);

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setElapsed(pct * TOTAL_MS);
    setStarted(true);
  };

  // Determine current scene
  let acc = 0;
  let sceneIdx = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (elapsed < acc + SCENES[i].duration) { sceneIdx = i; break; }
    acc += SCENES[i].duration;
    sceneIdx = i;
  }
  const progressPct = (elapsed / TOTAL_MS) * 100;
  const finished = elapsed >= TOTAL_MS;

  // Scene start times for chapter markers
  let markerAcc = 0;
  const markers = SCENES.map(sc => {
    const pct = (markerAcc / TOTAL_MS) * 100;
    markerAcc += sc.duration;
    return pct;
  });

  const sceneLabels = ['Intro', 'Problem', 'Search', 'Assistant', 'Self-Correct', 'Stats', 'CTA'];

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-6">
      {/* Video container */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0D2B30 0%, #0a1f23 50%, #071518 100%)' }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Scenes */}
        <SceneIntro        visible={started && sceneIdx === 0} />
        <SceneProblem      visible={started && sceneIdx === 1} />
        <SceneSearch       visible={started && sceneIdx === 2} />
        <SceneAssistant    visible={started && sceneIdx === 3} />
        <SceneSelfCorrect  visible={started && sceneIdx === 4} />
        <SceneStats        visible={started && sceneIdx === 5} />
        <SceneCTA          visible={started && sceneIdx === 6} />

        {/* Play overlay (before start or finished) */}
        {(!started || finished) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            {!started ? (
              <div className="text-center">
                <div className="text-white/40 font-body text-xs uppercase tracking-widest mb-4">
                  2 min · All features
                </div>
                <button
                  onClick={handlePlay}
                  className="w-20 h-20 rounded-full bg-white/15 border border-white/30 flex items-center justify-center hover:bg-white/25 transition-all group backdrop-blur-sm"
                >
                  <div className="w-0 h-0 border-y-[14px] border-y-transparent border-l-[22px] border-l-white ml-2 group-hover:scale-110 transition-transform" />
                </button>
                <div className="text-white font-heading font-bold text-xl mt-4">Watch RAMP in action</div>
                <div className="text-white/40 font-body text-sm mt-1">AI search · Smart answers · Self-correcting code</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-white font-heading font-bold text-2xl mb-4">That's RAMP.</div>
                <button
                  onClick={handlePlay}
                  className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center hover:bg-white/25 transition-all mx-auto backdrop-blur-sm"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  </svg>
                </button>
                <div className="text-white/40 font-body text-sm mt-3">Watch again</div>
              </div>
            )}
          </div>
        )}

        {/* Controls bar */}
        {started && !finished && (
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            {/* Chapter markers + progress */}
            <div
              className="h-1 rounded-full bg-white/15 cursor-pointer mb-2.5 relative"
              onClick={handleScrub}
            >
              {/* Chapter markers */}
              {markers.slice(1).map((pct, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2.5 bg-white/30 rounded-full"
                  style={{ left: `${pct}%` }}
                />
              ))}
              {/* Fill */}
              <div
                className="h-full rounded-full bg-[#6BBDC0] transition-none relative"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md" />
              </div>
            </div>
            {/* Buttons row */}
            <div className="flex items-center gap-3">
              <button onClick={handlePause} className="text-white/80 hover:text-white transition-colors">
                {playing ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <div className="text-white/50 font-body text-xs">
                {sceneLabels[sceneIdx]}
              </div>
              <div className="ml-auto text-white/30 font-body text-xs font-mono">
                {Math.floor(elapsed / 1000)}s / {Math.floor(TOTAL_MS / 1000)}s
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chapter dots below */}
      {started && (
        <div className="flex justify-center gap-1.5 mt-3">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${i === sceneIdx ? 'w-6 bg-jade' : 'w-2 bg-gray-300'}`}
              onClick={() => {
                let t = 0;
                for (let j = 0; j < i; j++) t += SCENES[j].duration;
                setElapsed(t);
                setPlaying(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
