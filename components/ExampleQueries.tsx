'use client';

const EXAMPLE_QUERIES = [
  'BA with Vitech experience pension',
  'Pen tester with OSCP certification',
  'PMP certified project manager',
  'Python developer data analytics',
  'OCM change management specialist',
  'Workers comp BA Canada',
  'SQL database engineer',
  'CBAP requirements gathering pension',
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
