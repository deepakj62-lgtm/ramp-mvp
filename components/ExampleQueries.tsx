'use client';

const EXAMPLE_QUERIES = [
  '50% free in April with pension experience',
  'Senior BA available for insurance project',
  'SQL + Python skills in Canada',
  'Cybersecurity consultant for pen testing',
  'Workers comp analyst available in Q2',
  'Vitech V3 experience, fully available',
  'Principal level with project management',
  'Data analyst with Tableau and Power BI',
];

interface ExampleQueriesProps {
  onSelect: (query: string) => void;
}

export default function ExampleQueries({ onSelect }: ExampleQueriesProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {EXAMPLE_QUERIES.map((query) => (
        <button
          key={query}
          onClick={() => onSelect(query)}
          className="query-chip"
        >
          {query}
        </button>
      ))}
    </div>
  );
}
