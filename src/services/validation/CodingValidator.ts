import { IValidator } from './IValidator';
import { codingRuntime } from '@/services/python/CodingRuntime';
import { Question, ValidationResult, isPythonCodingQuestion } from '@/types';

class CodingValidator implements IValidator {
  async validate(question: Question, userCode: string): Promise<ValidationResult> {
    if (!isPythonCodingQuestion(question)) {
      return {
        passed: false,
        totalDatasets: 0,
        passedDatasets: 0,
        error: 'CodingValidator can only validate Python coding questions',
      };
    }

    const allTestCases = [...question.testCases, ...question.hiddenTestCases];
    const totalTests = allTestCases.length;

    if (totalTests === 0) {
      return {
        passed: false,
        totalDatasets: 0,
        passedDatasets: 0,
        error: 'No test cases defined for this question',
      };
    }

    try {
      const results = await codingRuntime.runTestCases(userCode, allTestCases);
      const passedTests = results.filter((r) => r.passed).length;

      const firstFailure = results.find((r) => !r.passed);
      let error: string | undefined;
      if (firstFailure) {
        if (firstFailure.error) {
          error = `${firstFailure.label}: ${firstFailure.error}`;
        } else {
          error = `${firstFailure.label}: expected ${firstFailure.expected}, got ${firstFailure.actual}`;
        }
      }

      return {
        passed: passedTests === totalTests,
        totalDatasets: totalTests,
        passedDatasets: passedTests,
        error,
      };
    } catch (error) {
      return {
        passed: false,
        totalDatasets: totalTests,
        passedDatasets: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const codingValidator = new CodingValidator();
