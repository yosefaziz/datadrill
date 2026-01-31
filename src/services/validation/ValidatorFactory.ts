import { IValidator } from './IValidator';
import { sqlValidator } from './SqlValidator';
import { pySparkValidator } from './PySparkValidator';
import { Question, isDebugQuestion } from '@/types';

export function getValidator(question: Question): IValidator {
  // For debug questions, use validator based on language
  if (isDebugQuestion(question)) {
    switch (question.language) {
      case 'sql':
        return sqlValidator;
      case 'pyspark':
        return pySparkValidator;
      default:
        return sqlValidator;
    }
  }

  // For regular questions, use validator based on skill
  switch (question.skill) {
    case 'sql':
      return sqlValidator;
    case 'pyspark':
      return pySparkValidator;
    default:
      return sqlValidator;
  }
}
