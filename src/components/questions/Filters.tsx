import { Search } from 'lucide-react';
import { useQuestionStore, QuestionStatus } from '@/stores/questionStore';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  constraints: 'Constraints',
  canvas: 'Canvas',
  quiz: 'Quiz',
};

const STATUS_OPTIONS: { value: QuestionStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'failed', label: 'Failed' },
  { value: 'passed', label: 'Passed' },
];

export function Filters() {
  const { filters, setDifficultyFilter, setSearchQuery, setStatusFilter, setQuestionTypeFilter, getAllQuestionTypes } = useQuestionStore();
  const questionTypes = getAllQuestionTypes();

  return (
    <fieldset className="flex flex-wrap items-end gap-4 mb-6 animate-fade-in border-none p-0">
      <legend className="sr-only">Filter questions</legend>

      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search-filter" className="block text-sm font-medium text-text-primary mb-1">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            id="search-filter"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface text-text-primary ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {questionTypes.length > 0 && (
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-text-primary mb-1">
            Type
          </label>
          <select
            id="type-filter"
            value={filters.questionType || ''}
            onChange={(e) => setQuestionTypeFilter(e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-surface text-text-primary ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_LABELS[type] || type}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="difficulty-filter" className="block text-sm font-medium text-text-primary mb-1">
          Difficulty
        </label>
        <select
          id="difficulty-filter"
          value={filters.difficulty || ''}
          onChange={(e) => setDifficultyFilter(e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-surface text-text-primary ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div>
        <label htmlFor="status-filter" className="block text-sm font-medium text-text-primary mb-1">
          Status
        </label>
        <select
          id="status-filter"
          value={filters.status || ''}
          onChange={(e) => setStatusFilter((e.target.value || null) as QuestionStatus | null)}
          className="px-3 py-2 rounded-lg bg-surface text-text-primary ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
