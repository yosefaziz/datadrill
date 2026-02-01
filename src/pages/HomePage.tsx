import { useEffect, useState } from 'react';
import { SkillCard } from '@/components/questions/SkillCard';
import { SkillType } from '@/types';

interface SkillConfig {
  skill: SkillType;
  name: string;
  icon: string;
  description: string;
}

const SKILLS: SkillConfig[] = [
  {
    skill: 'sql',
    name: 'SQL',
    icon: '🔍',
    description: 'Write queries from scratch to retrieve and manipulate data',
  },
  {
    skill: 'pyspark',
    name: 'PySpark',
    icon: '⚡',
    description: 'Write DataFrame transformations for distributed data processing',
  },
  {
    skill: 'debug',
    name: 'Debug',
    icon: '🔧',
    description: 'Fix broken pipelines and identify bugs in SQL or PySpark code',
  },
  {
    skill: 'architecture',
    name: 'Data Architecture',
    icon: '🏗️',
    description: 'Practice asking the right questions before choosing an architecture',
  },
];

export function HomePage() {
  const [questionCounts, setQuestionCounts] = useState<Record<SkillType, number>>({
    sql: 0,
    pyspark: 0,
    debug: 0,
    architecture: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      const counts: Record<SkillType, number> = { sql: 0, pyspark: 0, debug: 0, architecture: 0 };

      for (const skill of SKILLS) {
        try {
          const response = await fetch(`/questions/${skill.skill}/index.json`);
          if (response.ok) {
            const questions = await response.json();
            counts[skill.skill] = questions.length;
          }
        } catch {
          // Keep count at 0 if fetch fails
        }
      }

      setQuestionCounts(counts);
      setIsLoading(false);
    }

    fetchCounts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-3">DataDrill</h1>
        <p className="text-lg text-slate-600">
          Practice data engineering skills with instant feedback
        </p>
      </div>

      <h2 className="text-xl font-semibold text-slate-700 mb-6 text-center">
        Choose your skill track
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-600">Loading...</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {SKILLS.map((skillConfig) => (
            <SkillCard
              key={skillConfig.skill}
              skill={skillConfig.skill}
              name={skillConfig.name}
              icon={skillConfig.icon}
              description={skillConfig.description}
              questionCount={questionCounts[skillConfig.skill]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
