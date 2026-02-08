import { SkillType } from '@/types';

interface HistoryFiltersProps {
  skillFilter: string | null;
  passedFilter: boolean | null;
  onSkillChange: (skill: string | null) => void;
  onPassedChange: (passed: boolean | null) => void;
}

const SKILLS: { value: SkillType; label: string }[] = [
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
  { value: 'debug', label: 'Debug' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'modeling', label: 'Modeling' },
];

export function HistoryFilters({ skillFilter, passedFilter, onSkillChange, onPassedChange }: HistoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={skillFilter || ''}
        onChange={(e) => onSkillChange(e.target.value || null)}
        className="px-3 py-1.5 rounded-lg bg-bg-primary text-text-primary ring-1 ring-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Filter by skill"
      >
        <option value="">All Skills</option>
        {SKILLS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        value={passedFilter === null ? '' : passedFilter ? 'passed' : 'failed'}
        onChange={(e) => {
          if (e.target.value === '') onPassedChange(null);
          else onPassedChange(e.target.value === 'passed');
        }}
        className="px-3 py-1.5 rounded-lg bg-bg-primary text-text-primary ring-1 ring-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Filter by result"
      >
        <option value="">All Results</option>
        <option value="passed">Passed</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
}
