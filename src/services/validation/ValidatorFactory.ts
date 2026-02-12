import { IValidator } from './IValidator';
import { sqlValidator } from './SqlValidator';
import { pythonValidator } from './PythonValidator';
import { codingValidator } from './CodingValidator';
import { pandasValidator } from './PandasValidator';
import { Question, isDebugQuestion, isPySparkQuestion, isPythonCodingQuestion, isPandasQuestion } from '@/types';

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

  // Python subtypes
  if (isPySparkQuestion(question)) {
    return pythonValidator;
  }
  if (isPythonCodingQuestion(question)) {
    return codingValidator;
  }
  if (isPandasQuestion(question)) {
    return pandasValidator;
  }

  // For regular questions, use validator based on skill
  switch (question.skill) {
    case 'sql':
      return sqlValidator;
    default:
      return sqlValidator;
  }
}
