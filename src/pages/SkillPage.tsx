import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuestionStore } from '@/stores/questionStore';
import { QuestionList } from '@/components/questions/QuestionList';
import { PathsList } from '@/components/paths/PathsList';
import { SkillType } from '@/types';

const SKILL_NAMES: Record<SkillType, string> = {
  sql: 'SQL',
  python: 'Python',
  debug: 'Debug',
  architecture: 'Data Architecture',
  modeling: 'Data Modeling',
};

const SKILL_DESCRIPTIONS: Record<SkillType, string> = {
  sql: 'Write SQL queries to retrieve and manipulate data',
  python: 'Write Python DataFrame transformations',
  debug: 'Fix broken SQL or Python pipelines',
  architecture: 'Practice asking the right questions before choosing an architecture',
  modeling: 'Design schemas by assigning fields to Fact and Dimension tables',
};

function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'python' || skill === 'debug' || skill === 'architecture' || skill === 'modeling';
}

type TabId = 'questions' | 'paths';

export function SkillPage() {
  const { skill } = useParams<{ skill: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'questions';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const { fetchQuestionsForSkill, setDifficultyFilter, setTagFilter, setQuestionTypeFilter, setSearchQuery, setStatusFilter } = useQuestionStore();

  useEffect(() => {
    if (isValidSkill(skill)) {
      setDifficultyFilter(null);
      setTagFilter(null);
      setQuestionTypeFilter(null);
      setSearchQuery('');
      setStatusFilter(null);
      fetchQuestionsForSkill(skill);
    }
  }, [skill, fetchQuestionsForSkill, setDifficultyFilter, setTagFilter, setQuestionTypeFilter, setSearchQuery, setStatusFilter]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'questions') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tab);
    }
    setSearchParams(searchParams, { replace: true });
  };

  if (!isValidSkill(skill)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary mb-4">Invalid skill: {skill}</div>
          <Link to="/" className="text-primary hover:text-primary-hover transition-colors duration-200">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* Back link */}
      <div className="mb-4 animate-fade-in">
        <Link to="/" className="text-primary hover:text-primary-hover text-sm transition-colors duration-200">
          &larr; All Skills
        </Link>
      </div>

      {/* Toggle switch — centered */}
      <div className="flex justify-center mb-6 animate-fade-in stagger-1">
        <button
          className="relative inline-flex items-center rounded-xl bg-bg-secondary p-1.5 ring-1 ring-border-color cursor-pointer select-none transition-shadow duration-200 hover:ring-primary/40"
          onClick={() => handleTabChange(activeTab === 'questions' ? 'paths' : 'questions')}
          role="switch"
          aria-checked={activeTab === 'paths'}
          aria-label="Toggle between Interview Questions and Solution Playbooks"
        >
          {/* Sliding blue pill */}
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-lg bg-primary transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              activeTab === 'paths' ? 'translate-x-full' : 'translate-x-0'
            }`}
          />

          <span className={`relative z-10 px-10 py-3 rounded-lg text-sm font-medium text-center leading-tight transition-colors duration-200 ${
            activeTab === 'questions' ? 'text-bg-primary' : 'text-text-muted'
          }`}>
            Interview<br />Questions
          </span>
          <span className={`relative z-10 px-10 py-3 rounded-lg text-sm font-medium text-center leading-tight transition-colors duration-200 ${
            activeTab === 'paths' ? 'text-bg-primary' : 'text-text-muted'
          }`}>
            Solution<br />Playbooks
          </span>
        </button>
      </div>

      {/* Title + description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-1 animate-fade-in stagger-2">
          {SKILL_NAMES[skill]}
        </h1>
        <p className="text-text-secondary text-sm animate-fade-in stagger-3">{SKILL_DESCRIPTIONS[skill]}</p>
      </div>

      {/* Tab content */}
      {activeTab === 'questions' ? (
        <QuestionList skill={skill} />
      ) : (
        <PathsList skill={skill} />
      )}
    </div>
  );
}
