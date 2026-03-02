'use client';

import Link from 'next/link';
import { Fragment } from 'react';

interface MarkdownAnswerProps {
  text: string;
}

// Parse inline markdown with a single combined regex.
// Pattern priority (highest first):
//   1. **[text](url)**  — bold-wrapped link
//   2. **text**         — plain bold
//   3. [text](url)      — plain link
function parseInline(line: string): React.ReactNode[] {
  if (!line) return [line];

  // Group numbers:
  //  match[1,2] → bold-link  **[text](url)**
  //  match[3]   → plain bold **text**
  //  match[4,5] → plain link [text](url)
  const regex =
    /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    // Literal text before this token
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      // ── Bold link: **[Label](href)** ──────────────────────────
      const label = match[1];
      const href  = match[2];
      const cls   = 'font-semibold text-jade underline underline-offset-2 hover:text-jade/70 transition-colors';
      parts.push(
        href.startsWith('/')
          ? <Link key={match.index} href={href} className={cls}>{label}</Link>
          : <a   key={match.index} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
      );
    } else if (match[3] !== undefined) {
      // ── Plain bold: **text** ───────────────────────────────────
      parts.push(
        <strong key={match.index} className="font-semibold text-jade">{match[3]}</strong>
      );
    } else if (match[4] !== undefined) {
      // ── Plain link: [Label](href) ──────────────────────────────
      const label = match[4];
      const href  = match[5];
      const cls   = 'text-jade font-medium underline underline-offset-2 hover:text-jade/70 transition-colors';
      parts.push(
        href.startsWith('/')
          ? <Link key={match.index} href={href} className={cls}>{label}</Link>
          : <a   key={match.index} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining literal text
  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [line];
}

export default function MarkdownAnswer({ text }: MarkdownAnswerProps) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-3 text-sm leading-relaxed font-body text-jade/80">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').filter(l => l !== undefined);

        const isHeading = lines[0]?.match(/^#{1,3}\s/);
        const isTable   = lines[0]?.trim().startsWith('|') && lines.length >= 2;
        const isList    = lines.every(l => l.match(/^[\-\*•]\s/) || l.match(/^\d+\.\s/) || l.trim() === '');

        // ── Heading ───────────────────────────────────────────────
        if (isHeading) {
          const headingText = lines[0].replace(/^#{1,3}\s/, '');
          const rest = lines.slice(1).filter(l => l.trim());
          return (
            <Fragment key={pIdx}>
              <h4 className="text-sm font-heading font-bold text-jade mt-4 mb-1">
                {parseInline(headingText)}
              </h4>
              {rest.length > 0 && (
                <p>{rest.map((line, lIdx) => (
                  <Fragment key={lIdx}>
                    {parseInline(line)}
                    {lIdx < rest.length - 1 && <br />}
                  </Fragment>
                ))}</p>
              )}
            </Fragment>
          );
        }

        // ── Markdown Table ────────────────────────────────────────
        if (isTable) {
          // lines[0] = header row, lines[1] = separator (|---|---| etc.), lines[2+] = data rows
          const parseRow = (row: string) =>
            row.split('|').map(c => c.trim()).filter((c, i, arr) =>
              // Remove empty leading/trailing cells from pipe-delimited rows
              !(i === 0 && c === '') && !(i === arr.length - 1 && c === '')
            );

          const headers  = parseRow(lines[0]);
          const dataRows = lines
            .slice(2) // skip separator
            .filter(l => l.trim() && !l.match(/^\|[-| :]+\|$/)) // skip separator-like rows
            .map(parseRow)
            .filter(r => r.length > 0);

          return (
            <div key={pIdx} className="overflow-x-auto rounded-lg border border-jade/15 mt-1">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-jade/5">
                  <tr>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left text-xs font-heading font-semibold text-jade uppercase tracking-wide border-b border-jade/15"
                      >
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-canvas/60 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-jade/80">
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // ── Bullet list ───────────────────────────────────────────
        if (isList && lines.some(l => l.match(/^[\-\*•]\s/) || l.match(/^\d+\.\s/))) {
          return (
            <ul key={pIdx} className="space-y-1.5 ml-1">
              {lines.filter(l => l.trim()).map((line, lIdx) => {
                const isOrdered = line.match(/^\d+\.\s/);
                const content   = line.replace(/^[\-\*•]\s/, '').replace(/^\d+\.\s/, '');
                return (
                  <li key={lIdx} className="flex gap-2 items-start">
                    {isOrdered
                      ? <span className="mt-0.5 text-xs font-mono text-jade/40 flex-shrink-0 w-4">{lIdx + 1}.</span>
                      : <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-jade/30 flex-shrink-0" />
                    }
                    <span>{parseInline(content)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // ── Regular paragraph ─────────────────────────────────────
        return (
          <p key={pIdx}>
            {lines.map((line, lIdx) => (
              <Fragment key={lIdx}>
                {parseInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
