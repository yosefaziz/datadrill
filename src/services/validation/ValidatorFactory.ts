import { IValidator } from './IValidator';
import { sqlValidator } from './SqlValidator';
import { pythonValidator } from './PythonValidator';
import { Question, isDebugQuestion } from '@/types';

export function getValidator(question: Question): IValidator {
  // For debug questions, use validator based on language
  if (isDebugQuestion(question)) {
    switch (question.language) {
      case 'sql':
        return sqlValidator;
      case 'python':
        return pythonValidator;
      default:
        return sqlValidator;
    }
  }

  // For regular questions, use validator based on skill
  switch (question.skill) {
    case 'sql':
      return sqlValidator;
    case 'python':
      return pythonValidator;
    default:
      return sqlValidator;
  }
}
