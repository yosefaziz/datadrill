import { useState, useCallback } from 'react';
import { validateAnswer } from '@/services/validation/ResultValidator';
import { Question, ValidationResult } from '@/types';

export function useValidation() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (question: Question, userQuery: string) => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateAnswer(question, userQuery);
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return { validationResult, isValidating, validate, clearValidation };
}
