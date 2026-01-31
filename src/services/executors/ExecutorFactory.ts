import { IExecutor } from './IExecutor';
import { sqlExecutor } from './SqlExecutor';
import { pySparkExecutor } from './PySparkExecutor';
import { SkillType } from '@/types';

export function getExecutor(skill: SkillType): IExecutor {
  switch (skill) {
    case 'sql':
      return sqlExecutor;
    case 'pyspark':
      return pySparkExecutor;
    case 'debug':
      // Debug uses either SQL or PySpark executor based on question language
      // This is handled at the question level, not here
      // Default to SQL
      return sqlExecutor;
    default:
      return sqlExecutor;
  }
}

export function getExecutorForDebug(language: 'sql' | 'pyspark'): IExecutor {
  switch (language) {
    case 'sql':
      return sqlExecutor;
    case 'pyspark':
      return pySparkExecutor;
    default:
      return sqlExecutor;
  }
}
