import { useQuestionStore } from '@/stores/questionStore';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  constraints: 'Constraints',
  canvas: 'Canvas',
  quiz: 'Quiz',
};

export function Filters() {
  const { filters, setDifficultyFilter, setTagFilter, setQuestionTypeFilter, getAllTags, getAllQuestionTypes } = useQuestionStore();
  const tags = getAllTags();
  const questionTypes = getAllQuestionTypes();

  return (
    <fieldset className="flex flex-wrap gap-4 mb-6 animate-fade-in border-none p-0">
      <legend className="sr-only">Filter questions</legend>
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
        <label htmlFor="topic-filter" className="block text-sm font-medium text-text-primary mb-1">
          Topic
        </label>
        <select
          id="topic-filter"
          value={filters.tag || ''}
          onChange={(e) => setTagFilter(e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-surface text-text-primary ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Topics</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
