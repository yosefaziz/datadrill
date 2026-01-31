import { Question, ValidationResult } from '@/types';

export interface IValidator {
  validate(question: Question, userCode: string): Promise<ValidationResult>;
}
