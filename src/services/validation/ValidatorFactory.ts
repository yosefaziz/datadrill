import { IValidator } from './IValidator';
import { sqlValidator } from './SqlValidator';
import { Question, isDebugQuestion } from '@/types';

// Placeholder for future validators
// import { pysparkValidator } from './PySparkValidator';

export function getValidator(question: Question): IValidator {
  // For debug questions, use validator based on language
  if (isDebugQuestion(question)) {
    switch (question.language) {
      case 'sql':
        return sqlValidator;
      case 'pyspark':
        throw new Error('PySpark validator not yet implemented');
      default:
        return sqlValidator;
    }
  }

  // For regular questions, use validator based on skill
  switch (question.skill) {
    case 'sql':
      return sqlValidator;
    case 'pyspark':
      throw new Error('PySpark validator not yet implemented');
    default:
      return sqlValidator;
  }
}
