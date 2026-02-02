import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuestionStore } from '@/stores/questionStore';
import { QuestionList } from '@/components/questions/QuestionList';
import { SkillType } from '@/types';

const SKILL_NAMES: Record<SkillType, string> = {
  sql: 'SQL',
  pyspark: 'PySpark',
  debug: 'Debug',
  architecture: 'Data Architecture',
  modeling: 'Data Modeling',
};

const SKILL_DESCRIPTIONS: Record<SkillType, string> = {
  sql: 'Write SQL queries to retrieve and manipulate data',
  pyspark: 'Write PySpark DataFrame transformations',
  debug: 'Fix broken SQL or PySpark pipelines',
  architecture: 'Practice asking the right questions before choosing an architecture',
  modeling: 'Design schemas by assigning fields to Fact and Dimension tables',
};

function isValidSkill(skill: string | undefined): skill is SkillType {
  return skill === 'sql' || skill === 'pyspark' || skill === 'debug' || skill === 'architecture' || skill === 'modeling';
}

export function SkillPage() {
  const { skill } = useParams<{ skill: string }>();
  const { fetchQuestionsForSkill, setDifficultyFilter, setTagFilter } = useQuestionStore();

  useEffect(() => {
    if (isValidSkill(skill)) {
      // Reset filters when changing skills
      setDifficultyFilter(null);
      setTagFilter(null);
      fetchQuestionsForSkill(skill);
    }
  }, [skill, fetchQuestionsForSkill, setDifficultyFilter, setTagFilter]);

  if (!isValidSkill(skill)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 mb-4">Invalid skill: {skill}</div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; All Skills
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        {SKILL_NAMES[skill]} Practice Questions
      </h1>
      <p className="text-slate-600 mb-8">{SKILL_DESCRIPTIONS[skill]}</p>
      <QuestionList skill={skill} />
    </div>
  );
}
