import { useQuestionStore } from '@/stores/questionStore';

export function Filters() {
  const { filters, setDifficultyFilter, setTagFilter, getAllTags } = useQuestionStore();
  const tags = getAllTags();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Difficulty
        </label>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => setDifficultyFilter(e.target.value || null)}
          className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Topic
        </label>
        <select
          value={filters.tag || ''}
          onChange={(e) => setTagFilter(e.target.value || null)}
          className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
