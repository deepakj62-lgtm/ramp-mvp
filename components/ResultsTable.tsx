'use client';

import Link from 'next/link';

interface Result {
  id: string;
  name: string;
  rampName?: string;
  level: string;
  title?: string;
  companyGroup?: string;
  location?: string;
  allocationSummary: string;
  matchedSkills?: string[];
  matchScore?: number;
  whyMatched?: string;
}

interface ResultsTableProps {
  results: Result[];
}

const groupBadgeClass: Record<string, string> = {
  'Linea Solutions': 'badge-jade',
  'Linea Solutions ULC': 'badge-jade',
  'Linea Secure': 'badge-rust',
  'ICON': 'badge-frost',
};

const groupShortName: Record<string, string> = {
  'Linea Solutions': 'Linea US',
  'Linea Solutions ULC': 'Linea CA',
  'Linea Secure': 'Secure',
  'ICON': 'ICON',
};

export default function ResultsTable({ results }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full card">
        <thead className="bg-jade/5 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-body font-semibold text-jade">Name</th>
            <th className="px-4 py-3 text-left text-sm font-body font-semibold text-jade">Group</th>
            <th className="px-4 py-3 text-left text-sm font-body font-semibold text-jade">Title</th>
            <th className="px-4 py-3 text-left text-sm font-body font-semibold text-jade">Availability</th>
            <th className="px-4 py-3 text-left text-sm font-body font-semibold text-jade">Matched Skills</th>
            <th className="px-4 py-3 text-left text-sm font-body font-semibold text-jade">Score</th>
            <th className="px-4 py-3 text-left text-sm font-body font-semibold text-jade"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-canvas transition">
              <td className="px-4 py-3">
                <div className="font-body font-medium text-jade">{result.name}</div>
                {result.rampName && (
                  <div className="text-xs text-jade/40 font-mono">{result.rampName}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={groupBadgeClass[result.companyGroup || ''] || 'badge-jade'}>
                  {groupShortName[result.companyGroup || ''] || result.companyGroup}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-jade/80 font-body">{result.title || result.level}</div>
              </td>
              <td className="px-4 py-3 text-sm text-jade/70 font-body">
                {result.allocationSummary}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {result.matchedSkills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="badge-sea text-xs">
                      {skill}
                    </span>
                  ))}
                  {result.matchedSkills && result.matchedSkills.length > 3 && (
                    <span className="text-xs text-jade/50 font-body">
                      +{result.matchedSkills.length - 3} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-body font-semibold text-jade">
                  {result.matchScore ? `${(result.matchScore * 100).toFixed(0)}%` : 'N/A'}
                </div>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/person/${result.id}`}
                  className="text-jade hover:text-jade-light text-sm font-body font-medium underline underline-offset-2"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {results.length === 0 && (
        <div className="text-center py-8 text-jade/50 font-body">
          No results found
        </div>
      )}
    </div>
  );
}
