import { useEffect, useState } from 'react';
import { Database, Zap, Bug, Network, Table2, LucideIcon } from 'lucide-react';
import { SkillCard } from '@/components/questions/SkillCard';
import { SkillType } from '@/types';

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl p-6 shadow-lg ring-1 ring-white/5 animate-pulse">
      <div className="flex items-center justify-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/10" />
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-white/10 rounded w-2/3 mx-auto" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
      </div>
      <div className="mt-4 h-4 bg-white/5 rounded w-20 mx-auto" />
    </div>
  );
}

interface SkillConfig {
  skill: SkillType;
  name: string;
  Icon: LucideIcon;
  description: string;
}

const SKILLS: SkillConfig[] = [
  {
    skill: 'sql',
    name: 'SQL',
    Icon: Database,
    description: 'Write queries from scratch to retrieve and manipulate data',
  },
  {
    skill: 'pyspark',
    name: 'PySpark',
    Icon: Zap,
    description: 'Write DataFrame transformations for distributed data processing',
  },
  {
    skill: 'debug',
    name: 'Debug',
    Icon: Bug,
    description: 'Fix broken pipelines and identify bugs in SQL or PySpark code',
  },
  {
    skill: 'architecture',
    name: 'Data Architecture',
    Icon: Network,
    description: 'Practice asking the right questions before choosing an architecture',
  },
  {
    skill: 'modeling',
    name: 'Data Modeling',
    Icon: Table2,
    description: 'Design schemas by assigning fields to Fact and Dimension tables',
  },
];

export function HomePage() {
  const [questionCounts, setQuestionCounts] = useState<Record<SkillType, number>>({
    sql: 0,
    pyspark: 0,
    debug: 0,
    architecture: 0,
    modeling: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      // Fetch all skill counts in parallel
      const results = await Promise.all(
        SKILLS.map(async ({ skill }) => {
          try {
            const response = await fetch(`/questions/${skill}/index.json`);
            if (response.ok) {
              const questions = await response.json();
              return { skill, count: questions.length };
            }
          } catch {
            // Keep count at 0 if fetch fails
          }
          return { skill, count: 0 };
        })
      );

      const counts: Record<SkillType, number> = { sql: 0, pyspark: 0, debug: 0, architecture: 0, modeling: 0 };
      results.forEach(({ skill, count }) => {
        counts[skill] = count;
      });

      setQuestionCounts(counts);
      setIsLoading(false);
    }

    fetchCounts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12 hero-glow">
        <h1 className="text-4xl font-bold text-text-primary mb-3 animate-fade-in">
          DataDrill
        </h1>
        <p className="text-lg text-text-secondary animate-fade-in stagger-2">
          Practice data engineering skills with instant feedback
        </p>
      </div>

      <h2 className="text-xl font-semibold text-text-primary mb-6 text-center animate-fade-in stagger-3">
        Choose your skill track
      </h2>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {SKILLS.map((skillConfig, index) => (
            <SkillCard
              key={skillConfig.skill}
              skill={skillConfig.skill}
              name={skillConfig.name}
              Icon={skillConfig.Icon}
              description={skillConfig.description}
              questionCount={questionCounts[skillConfig.skill]}
              className={`animate-fade-in-up stagger-${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
