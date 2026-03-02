'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Annotation {
  id: string;
  // Stored as fractions (0-1) of the CANVAS size so they stay correct
  // regardless of canvas resizes or sidebar toggling
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
  note: string;
}

interface DrawRect { x: number; y: number; w: number; h: number; }

interface Props {
  imageDataUrl: string;
  onSubmit: (annotatedBase64: string, description: string, mimeType: string) => void;
  onCancel: () => void;
}

const COLORS = ['#7C3AED', '#0D9488', '#DC2626', '#D97706', '#2563EB', '#DB2777'];
const getColor = (i: number) => COLORS[i % COLORS.length];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScreenshotAnnotator({ imageDataUrl, onSubmit, onCancel }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);   // full area (toolbar excluded)
  const noteInputRef = useRef<HTMLInputElement>(null);
  const popupRef    = useRef<HTMLDivElement>(null);   // note popup (for click-outside dismiss)

  const [image,   setImage]   = useState<HTMLImageElement | null>(null);
  const [canvasW, setCanvasW] = useState(0);
  const [canvasH, setCanvasH] = useState(0);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [drawing,    setDrawing]    = useState(false);
  const [startFrac,  setStartFrac]  = useState({ x: 0, y: 0 });
  const [liveFrac,   setLiveFrac]   = useState<DrawRect | null>(null);

  const [pendingFrac, setPendingFrac] = useState<DrawRect | null>(null);
  const [noteText,    setNoteText]    = useState('');
  const [popupPos,    setPopupPos]    = useState({ x: 0, y: 0 });

  // ── Load image ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  // ── Track the FULL wrapper size (canvas always fills this entire area) ───────
  // The sidebar is an OVERLAY — it does NOT affect the canvas dimensions
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      setCanvasW(r.width);
      setCanvasH(r.height);
    });
    ro.observe(wrap);
    const r = wrap.getBoundingClientRect();
    setCanvasW(r.width);
    setCanvasH(r.height);
    return () => ro.disconnect();
  }, []);

  // ── Set canvas logical size whenever the measured size changes ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasW || !canvasH) return;
    canvas.width  = canvasW;
    canvas.height = canvasH;
    // Setting .width clears canvas; redraw runs next via the [redraw] effect
  }, [canvasW, canvasH]);

  // ── Draw ───────────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image || !canvasW || !canvasH) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // Fit screenshot into canvas
    const scale = Math.min(cw / image.naturalWidth, ch / image.naturalHeight);
    const imgW  = image.naturalWidth  * scale;
    const imgH  = image.naturalHeight * scale;
    const imgX  = (cw - imgW) / 2;
    const imgY  = (ch - imgH) / 2;
    ctx.drawImage(image, imgX, imgY, imgW, imgH);

    // Dim letterbox strips
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    if (imgX > 0) { ctx.fillRect(0, 0, imgX, ch); ctx.fillRect(imgX + imgW, 0, cw - imgX - imgW, ch); }
    if (imgY > 0) { ctx.fillRect(imgX, 0, imgW, imgY); ctx.fillRect(imgX, imgY + imgH, imgW, ch - imgY - imgH); }

    // Draw committed annotations (fractional → pixel)
    annotations.forEach((ann, i) => {
      const ax = ann.xFrac * cw, ay = ann.yFrac * ch;
      const aw = ann.wFrac * cw, ah = ann.hFrac * ch;
      const color = getColor(i);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.strokeRect(ax, ay, aw, ah);
      ctx.fillStyle = `${color}28`; ctx.fillRect(ax, ay, aw, ah);
      // Badge
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(ax + 4, ay + 4, 18, 18, 4); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, ax + 13, ay + 13);
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    });

    // Rubber-band (live) rect
    if (liveFrac) {
      const lx = liveFrac.x * cw, ly = liveFrac.y * ch;
      const lw = liveFrac.w * cw, lh = liveFrac.h * ch;
      ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]); ctx.strokeRect(lx, ly, lw, lh);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(124,58,237,0.08)'; ctx.fillRect(lx, ly, lw, lh);
    }
  }, [image, annotations, liveFrac, canvasW, canvasH]);

  useEffect(() => { redraw(); }, [redraw]);

  // ── Mouse → fractional coordinates (immune to canvas resize) ────────────────
  const getFrac = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    // Always divide by current CSS size — no sx/sy needed because canvas logical
    // size is kept equal to CSS size via our resize observer
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top)  / r.height)),
    };
  };

  // ── Dismiss note popup on click outside ────────────────────────────────────
  useEffect(() => {
    if (!pendingFrac) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        dismissNote();
      }
    };
    // Capture phase so it fires before canvas mousedown handler
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [pendingFrac]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pendingFrac) return; // click-outside effect handles dismissal
    const f = getFrac(e);
    setStartFrac(f);
    setDrawing(true);
    setLiveFrac(null);
  };

  // Cancel the rubber-band rect if mouse leaves the canvas while dragging
  const handleMouseLeave = () => {
    if (!drawing) return;
    setDrawing(false);
    setLiveFrac(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const f = getFrac(e);
    setLiveFrac({
      x: Math.min(startFrac.x, f.x),
      y: Math.min(startFrac.y, f.y),
      w: Math.abs(f.x - startFrac.x),
      h: Math.abs(f.y - startFrac.y),
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    setDrawing(false);
    const f = getFrac(e);
    const frac: DrawRect = {
      x: Math.min(startFrac.x, f.x),
      y: Math.min(startFrac.y, f.y),
      w: Math.abs(f.x - startFrac.x),
      h: Math.abs(f.y - startFrac.y),
    };
    setLiveFrac(null);
    // Require a minimum drag (1% of dimension)
    if (frac.w < 0.01 || frac.h < 0.01) return;

    // Position popup in viewport coords for the fixed popup
    const canvas = canvasRef.current!;
    const cr = canvas.getBoundingClientRect();
    setPopupPos({
      x: cr.left + (frac.x + frac.w / 2) * cr.width,
      y: cr.top  + (frac.y + frac.h)      * cr.height + 8,
    });
    setPendingFrac(frac);
    setNoteText('');
    setTimeout(() => noteInputRef.current?.focus(), 50);
  };

  const confirmNote = () => {
    if (!pendingFrac) return;
    setAnnotations(prev => [...prev, {
      id: `ann-${Date.now()}`,
      xFrac: pendingFrac.x, yFrac: pendingFrac.y,
      wFrac: pendingFrac.w, hFrac: pendingFrac.h,
      note: noteText.trim(),
    }]);
    setPendingFrac(null);
    setNoteText('');
  };

  const dismissNote = () => { setPendingFrac(null); setNoteText(''); };
  const removeAnnotation = (id: string) => setAnnotations(prev => prev.filter(a => a.id !== id));

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const lines: string[] = [];
    if (annotations.length > 0) {
      lines.push(`The user annotated the screenshot with ${annotations.length} selection(s):`);
      annotations.forEach((a, i) => lines.push(`  • Selection ${i + 1}: ${a.note || '(no note added)'}`));
      lines.push('Please analyze the screenshot and selections to understand what changes are needed.');
    } else {
      lines.push('The user shared a screenshot of the current page. Please analyze it and identify what changes or fixes might be needed.');
    }
    const base64 = canvas.toDataURL('image/png').split(',')[1];
    onSubmit(base64, lines.join('\n'), 'image/png');
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gray-950 select-none">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">📸</span>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Screenshot Annotator</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {annotations.length === 0
                ? 'Drag to select areas you want to change, then add notes'
                : `${annotations.length} area${annotations.length > 1 ? 's' : ''} selected — add more or send`}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">🖱 Drag to select</span>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">✎ Type a note</span>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">✓ Send when done</span>
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5"
          >
            {annotations.length > 0
              ? <><span>Send</span><span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{annotations.length}</span></>
              : 'Send Screenshot'}
          </button>
          <button onClick={onCancel} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition">
            Cancel
          </button>
        </div>
      </div>

      {/* ── Canvas + overlay sidebar (sidebar does NOT push canvas) ── */}
      <div ref={wrapRef} className="flex-1 relative overflow-hidden">

        {/* Canvas always fills the full wrapper */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        {!image && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading screenshot…</p>
            </div>
          </div>
        )}

        {/* Sidebar overlays canvas on the right — canvas size NEVER changes */}
        {annotations.length > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gray-900/95 border-l border-gray-700 flex flex-col backdrop-blur-sm">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
                Selections ({annotations.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {annotations.map((ann, i) => (
                <div key={ann.id} className="bg-gray-800 rounded-lg p-2.5 border border-gray-700 group">
                  <div className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: getColor(i) }}
                    >{i + 1}</span>
                    <p className="text-gray-300 text-xs flex-1 min-w-0 leading-relaxed">
                      {ann.note || <span className="text-gray-500 italic">No note</span>}
                    </p>
                    <button
                      onClick={() => removeAnnotation(ann.id)}
                      className="text-gray-600 hover:text-red-400 transition shrink-0 opacity-0 group-hover:opacity-100"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-700">
              <button
                onClick={handleSubmit}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition"
              >
                Send to AI →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Note popup (viewport-fixed) ── */}
      {pendingFrac && (
        <div
          ref={popupRef}
          className="fixed z-[70] bg-white rounded-xl shadow-2xl border border-violet-200 p-3 w-72"
          style={{
            left: Math.min(Math.max(popupPos.x - 144, 8), window.innerWidth - 296),
            top:  Math.min(popupPos.y, window.innerHeight - 140),
          }}
        >
          <p className="text-xs text-gray-500 mb-2">
            <span className="font-semibold text-violet-600">Selection {annotations.length + 1}</span>
            {' '}— describe what should change here:
          </p>
          <input
            ref={noteInputRef}
            type="text"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmNote(); if (e.key === 'Escape') dismissNote(); }}
            placeholder="e.g. Change this button colour to blue"
            className="w-full px-2.5 py-1.5 border border-violet-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          <div className="flex gap-2 mt-2.5">
            <button onClick={confirmNote} className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition">
              ✓ Add Note
            </button>
            <button onClick={dismissNote} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg transition">
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
