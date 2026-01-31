import { useState, useCallback } from 'react';
import { getValidator } from '@/services/validation/ValidatorFactory';
import { Question, ValidationResult } from '@/types';

export function useValidation() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (question: Question, userCode: string) => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const validator = getValidator(question);
      const result = await validator.validate(question, userCode);
      setValidationResult(result);
      return result;
    } catch (error) {
      const errorResult: ValidationResult = {
        passed: false,
        totalDatasets: 0,
        passedDatasets: 0,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return { validationResult, isValidating, validate, clearValidation };
}
