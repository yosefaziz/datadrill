import { IExecutor } from './IExecutor';
import { sqlExecutor } from './SqlExecutor';
import { SkillType } from '@/types';

// Placeholder for future executors
// import { pysparkExecutor } from './PySparkExecutor';

export function getExecutor(skill: SkillType): IExecutor {
  switch (skill) {
    case 'sql':
      return sqlExecutor;
    case 'pyspark':
      // Will return pysparkExecutor when implemented
      // For now, throw an error since PySpark isn't ready
      throw new Error('PySpark executor not yet implemented');
    case 'debug':
      // Debug uses either SQL or PySpark executor based on question language
      // This is handled at the question level, not here
      // Default to SQL for now
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
      throw new Error('PySpark executor not yet implemented');
    default:
      return sqlExecutor;
  }
}
