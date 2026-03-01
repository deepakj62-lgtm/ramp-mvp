'use client';

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: Filter[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, values, onChange, onReset }: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some(v => v && v !== 'all' && v !== '');

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {filters.map((filter) => (
          <div key={filter.key} className="flex-1 min-w-[160px]">
            <label className="block text-xs font-body font-medium text-jade/70 mb-1">
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select
                value={values[filter.key] || 'all'}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
              >
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'text' ? (
              <input
                type="text"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
              />
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
              />
            ) : (
              <input
                type="number"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
              />
            )}
          </div>
        ))}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm font-body text-rust hover:text-rust/80 transition whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
