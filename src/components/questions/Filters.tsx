import { useQuestionStore } from '@/stores/questionStore';

export function Filters() {
  const { filters, setDifficultyFilter, setTagFilter, getAllTags } = useQuestionStore();
  const tags = getAllTags();

  return (
    <fieldset className="flex flex-wrap gap-4 mb-6 animate-fade-in border-none p-0">
      <legend className="sr-only">Filter questions</legend>
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
