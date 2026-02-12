import { IExecutor } from './IExecutor';
import { sqlExecutor } from './SqlExecutor';
import { pythonExecutor } from './PythonExecutor';
import { codingExecutor } from './CodingExecutor';
import { pandasExecutor } from './PandasExecutor';
import { SkillType, Question, isPySparkQuestion, isPythonCodingQuestion, isPandasQuestion, isDebugQuestion } from '@/types';

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

export function getQuestionExecutor(question: Question): IExecutor {
  if (isDebugQuestion(question)) {
    return getExecutorForDebug(question.language);
  }
  if (isPySparkQuestion(question)) {
    return pythonExecutor;
  }
  if (isPythonCodingQuestion(question)) {
    return codingExecutor;
  }
  if (isPandasQuestion(question)) {
    return pandasExecutor;
  }
  return getExecutor(question.skill);
}
