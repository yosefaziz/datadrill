import { useQuestionStore } from '@/stores/questionStore';

export function Filters() {
  const { filters, setDifficultyFilter, setTagFilter, getAllTags } = useQuestionStore();
  const tags = getAllTags();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Difficulty
        </label>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => setDifficultyFilter(e.target.value || null)}
          className="px-3 py-2 border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Topic
        </label>
        <select
          value={filters.tag || ''}
          onChange={(e) => setTagFilter(e.target.value || null)}
          className="px-3 py-2 border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Topics</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
