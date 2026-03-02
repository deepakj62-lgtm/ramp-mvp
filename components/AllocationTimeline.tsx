'use client';
// components/AllocationTimeline.tsx
// Interactive monthly allocation heatmap.
// Click any month cell to see the breakdown of which projects contribute to that month's total.

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export interface AllocationSlot {
  id: string;
  allocationPercent: number;
  roleOnProject: string;
  startDate: string;
  endDate: string;
  assignmentCode: string;
  project: {
    id: string;
    name: string;
    clientId: string;
    clientName: string;
  };
}

interface Props {
  allocations: AllocationSlot[];
  currentYear: number;
  currentMonth: number;
  overMonthCount: number;
  freeMonthCount: number;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function tileColors(alloc: number) {
  if (alloc === 0)   return { bg: '#f3f4f6', fg: '#6B8E96' };
  if (alloc <= 60)   return { bg: '#C8D9DC', fg: '#2D5560' };
  if (alloc <= 100)  return { bg: '#AD9A7D', fg: '#ffffff' };
  return               { bg: '#B06C50', fg: '#ffffff' };
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function AllocationTimeline({
  allocations,
  currentYear,
  currentMonth,
  overMonthCount,
  freeMonthCount,
}: Props) {
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Build monthAlloc totals
  const monthAlloc: Record<number, number> = {};
  for (const a of allocations) {
    const s  = new Date(a.startDate);
    const e  = new Date(a.endDate);
    const sm = s.getFullYear() === currentYear ? s.getMonth() : (s.getFullYear() < currentYear ? 0 : 12);
    const em = e.getFullYear() === currentYear ? e.getMonth() : (e.getFullYear() > currentYear ? 11 : -1);
    for (let m = sm; m <= em; m++) {
      monthAlloc[m] = (monthAlloc[m] || 0) + a.allocationPercent;
    }
  }

  // Get all allocations that overlap a given month
  const getAllocsForMonth = (monthIdx: number): AllocationSlot[] =>
    allocations.filter(a => {
      const s  = new Date(a.startDate);
      const e  = new Date(a.endDate);
      const sm = s.getFullYear() === currentYear ? s.getMonth() : (s.getFullYear() < currentYear ? 0 : 12);
      const em = e.getFullYear() === currentYear ? e.getMonth() : (e.getFullYear() > currentYear ? 11 : -1);
      return monthIdx >= sm && monthIdx <= em;
    });

  // Close panel on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActiveMonth(null);
      }
    }
    if (activeMonth !== null) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activeMonth]);

  const legendItems = [
    { bg: '#f3f4f6', bordered: true,  label: 'Free'      },
    { bg: '#C8D9DC', bordered: false, label: '1 – 60%'   },
    { bg: '#AD9A7D', bordered: false, label: '61 – 100%' },
    { bg: '#B06C50', bordered: false, label: '> 100%'    },
  ];

  // Which row does the active month fall in? (0–5 = row 0, 6–11 = row 1)
  const activeRow = activeMonth !== null ? (activeMonth < 6 ? 0 : 1) : null;

  return (
    <div className="card p-6 mb-6" ref={panelRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-bold text-jade">
          Allocation
          <span className="font-normal text-jade/40 text-sm ml-2">{currentYear}</span>
        </h2>
        <div className="flex items-center gap-3 text-xs font-body">
          {overMonthCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rust/10 text-rust font-medium">
              {overMonthCount} mo over-allocated
            </span>
          )}
          <span className="text-jade/50">{freeMonthCount} months free</span>
        </div>
      </div>

      {/* Month grid — rendered in 2 rows of 6 so the detail panel can appear between rows */}
      {[0, 1].map(row => (
        <div key={row}>
          <div className="grid grid-cols-6 gap-1.5 mb-1.5">
            {MONTHS.slice(row * 6, row * 6 + 6).map((month, colIdx) => {
              const idx = row * 6 + colIdx;
              const alloc = monthAlloc[idx] || 0;
              const colors = tileColors(alloc);
              const isCurrent = idx === currentMonth;
              const isSelected = activeMonth === idx;
              const hasAlloc = alloc > 0;

              return (
                <button
                  key={month}
                  onClick={() => setActiveMonth(isSelected ? null : idx)}
                  aria-label={`${month}: ${alloc > 0 ? `${alloc}% allocated` : 'Free'}. Click for details.`}
                  className={[
                    'rounded-lg py-3 px-1 text-center w-full transition-all duration-150',
                    hasAlloc ? 'cursor-pointer hover:opacity-80 hover:scale-[1.06] active:scale-100' : 'cursor-default opacity-70',
                    isCurrent ? 'ring-2 ring-jade ring-offset-1' : '',
                    isSelected ? 'ring-2 ring-white ring-offset-1 scale-[1.06] shadow-md' : '',
                  ].join(' ')}
                  style={{ backgroundColor: colors.bg }}
                >
                  <p className="text-xs font-body font-semibold leading-none mb-1" style={{ color: colors.fg }}>
                    {month.slice(0, 3)}
                  </p>
                  <p className="text-xs font-mono leading-none" style={{ color: colors.fg, opacity: 0.8 }}>
                    {alloc > 0 ? `${alloc}%` : '—'}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detail panel — appears after the row containing the selected month */}
          {activeMonth !== null && activeRow === row && (() => {
            const monthAllocs = getAllocsForMonth(activeMonth);
            const total = monthAlloc[activeMonth] || 0;
            const avail = 100 - total;

            return (
              <div className="mb-3 rounded-xl border border-jade/15 bg-jade/3 overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-jade/10 bg-white/60">
                  <span className="text-sm font-heading font-bold text-jade">
                    {MONTHS[activeMonth]} {currentYear}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-body px-2 py-0.5 rounded-full font-medium ${
                      total > 100 ? 'bg-rust/10 text-rust' :
                      total === 100 ? 'bg-amber-50 text-amber-700' :
                      total > 0 ? 'bg-jade/10 text-jade' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {total > 0 ? `${total}% allocated` : 'Free'}
                    </span>
                    {avail > 0 && total > 0 && (
                      <span className="text-xs text-jade/50 font-body">{avail}% available</span>
                    )}
                    <button
                      onClick={() => setActiveMonth(null)}
                      className="ml-1 text-jade/30 hover:text-jade/60 transition-colors text-base leading-none"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Allocation rows */}
                <div className="px-4 py-3">
                  {monthAllocs.length === 0 ? (
                    <p className="text-sm text-jade/40 font-body py-2">
                      No assignments this month — fully available.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {monthAllocs.map(a => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-jade/8 hover:border-jade/20 transition-colors group"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <Link
                              href={`/project/${a.project.id}`}
                              className="text-sm font-body font-semibold text-jade hover:underline block truncate"
                            >
                              {a.project.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <Link
                                href={`/client/${encodeURIComponent(a.project.clientId)}`}
                                className="text-xs text-jade/55 hover:text-jade hover:underline font-body"
                              >
                                {a.project.clientName}
                              </Link>
                              <span className="text-jade/20 text-xs">·</span>
                              <span className="badge-jade text-xs py-0 px-1.5">{a.roleOnProject}</span>
                              <span className="text-jade/20 text-xs">·</span>
                              <span className="text-xs text-jade/40 font-body">
                                {fmtShort(a.startDate)} – {fmtShort(a.endDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className={`text-base font-mono font-bold ${
                              a.allocationPercent > 90 ? 'text-rust' : 'text-jade'
                            }`}>
                              {a.allocationPercent}%
                            </span>
                            <p className="text-xs text-jade/30 font-mono">{a.assignmentCode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-gray-100 text-xs font-body text-jade/50">
        {legendItems.map(item => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.bg, border: item.bordered ? '1px solid #e5e7eb' : 'none' }}
            />
            {item.label}
          </span>
        ))}
        <span className="ml-auto text-jade/40 italic">click a month to see breakdown</span>
      </div>
    </div>
  );
}
