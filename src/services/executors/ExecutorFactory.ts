import { IExecutor } from './IExecutor';
import { sqlExecutor } from './SqlExecutor';
import { pythonExecutor } from './PythonExecutor';
import { SkillType } from '@/types';

export function getExecutor(skill: SkillType): IExecutor {
  switch (skill) {
    case 'sql':
      return sqlExecutor;
    case 'python':
      return pythonExecutor;
    case 'debug':
      // Debug uses either SQL or Python executor based on question language
      // This is handled at the question level, not here
      // Default to SQL
      return sqlExecutor;
    default:
      return sqlExecutor;
  }
}

export function getExecutorForDebug(language: 'sql' | 'python'): IExecutor {
  switch (language) {
    case 'sql':
      return sqlExecutor;
    case 'python':
      return pythonExecutor;
    default:
      return sqlExecutor;
  }
}
