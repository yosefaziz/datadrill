import { Lock } from 'lucide-react';

export type QuestionTab = 'description' | 'hints' | 'discussion' | 'solutions';

interface QuestionTabsProps {
  activeTab: QuestionTab;
  onTabChange: (tab: QuestionTab) => void;
  hasHints: boolean;
  isAuthenticated: boolean;
  hasSubmitted: boolean;
  showSolutions?: boolean;
}

const TABS: { id: QuestionTab; label: string; requiresAuth: boolean; requiresSubmission: boolean }[] = [
  { id: 'description', label: 'Description', requiresAuth: false, requiresSubmission: false },
  { id: 'hints', label: 'Hints', requiresAuth: true, requiresSubmission: false },
  { id: 'discussion', label: 'Discussion', requiresAuth: true, requiresSubmission: true },
  { id: 'solutions', label: 'Solutions', requiresAuth: true, requiresSubmission: true },
];

export function QuestionTabs({
  activeTab,
  onTabChange,
  hasHints,
  isAuthenticated,
  hasSubmitted,
  showSolutions = true,
}: QuestionTabsProps) {
  return (
    <div className="flex border-b border-border-color bg-bg-secondary">
      {TABS.map((tab) => {
        if (tab.id === 'hints' && !hasHints) return null;
        if (tab.id === 'solutions' && !showSolutions) return null;

        const isLocked =
          (tab.requiresAuth && !isAuthenticated) ||
          (tab.requiresSubmission && !hasSubmitted);
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-color'
            }`}
          >
            {tab.label}
            {isLocked && <Lock className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
}
