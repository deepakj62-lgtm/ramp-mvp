'use client';

import Link from 'next/link';

interface Result {
  id: string;
  name: string;
  level: string;
  allocationSummary: string;
  matchedSkills?: string[];
  matchScore?: number;
  whyMatched?: string;
}

interface ResultsTableProps {
  results: Result[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg border">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Level</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Allocation</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Matched Skills</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{result.name}</div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {result.level}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {result.allocationSummary}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {result.matchedSkills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {result.matchedSkills && result.matchedSkills.length > 3 && (
                    <span className="text-xs text-gray-600">
                      +{result.matchedSkills.length - 3} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">
                  {result.matchScore ? `${(result.matchScore * 100).toFixed(0)}%` : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <Link
                  href={`/person/${result.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {results.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No results found
        </div>
      )}
    </div>
  );
}
