import { describe, it, expect } from 'vitest';
import {
  isValidQuestion,
  isValidField,
  isValidBirthDate,
  isValidBirthTime,
  areAllRequiredFieldsFilled,
  validateQuestionForm,
  validateDataForm,
  validateSelectionForm,
} from '../../utils/formValidation';

/**
 * Property 1: Form Validation Prevents Invalid Submission
 *
 * For any service page with a form, submitting with empty or whitespace-only required fields
 * should be prevented, and an error message should be displayed.
 *
 * Validates: Requirements 2.7, 3.7, 4.7, 5.7, 11.7, 12.7, 13.7, 14.7
 */
describe('Form Validation - Property 1: Form Validation Prevents Invalid Submission', () => {
  describe('isValidQuestion', () => {
    it('should reject empty strings', () => {
      expect(isValidQuestion('')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(isValidQuestion('   ')).toBe(false);
      expect(isValidQuestion('\t')).toBe(false);
      expect(isValidQuestion('\n')).toBe(false);
    });

    it('should accept non-empty strings', () => {
      expect(isValidQuestion('What is my future?')).toBe(true);
      expect(isValidQuestion('a')).toBe(true);
    });

    it('should accept strings with leading/trailing whitespace', () => {
      expect(isValidQuestion('  question  ')).toBe(true);
    });
  });

  describe('isValidField', () => {
    it('should reject empty strings', () => {
      expect(isValidField('')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(isValidField('   ')).toBe(false);
      expect(isValidField('\t')).toBe(false);
    });

    it('should accept non-empty strings', () => {
      expect(isValidField('John Doe')).toBe(true);
      expect(isValidField('1')).toBe(true);
    });
  });

  describe('isValidBirthDate', () => {
    it('should reject empty strings', () => {
      expect(isValidBirthDate('')).toBe(false);
    });

    it('should reject invalid date formats', () => {
      expect(isValidBirthDate('invalid')).toBe(false);
      expect(isValidBirthDate('01/01/1990')).toBe(false);
    });

    it('should accept valid ISO date format', () => {
      expect(isValidBirthDate('1990-01-15')).toBe(true);
      expect(isValidBirthDate('2000-12-31')).toBe(true);
    });
  });

  describe('isValidBirthTime', () => {
    it('should reject empty strings', () => {
      expect(isValidBirthTime('')).toBe(false);
    });

    it('should reject invalid time formats', () => {
      expect(isValidBirthTime('25:00')).toBe(false);
      expect(isValidBirthTime('12:60')).toBe(false);
      expect(isValidBirthTime('invalid')).toBe(false);
    });

    it('should accept valid time format', () => {
      expect(isValidBirthTime('14:30')).toBe(true);
      expect(isValidBirthTime('00:00')).toBe(true);
      expect(isValidBirthTime('23:59')).toBe(true);
    });
  });

  describe('areAllRequiredFieldsFilled', () => {
    it('should return true when all required fields are filled', () => {
      const data = { name: 'John', date: '1990-01-15' };
      expect(areAllRequiredFieldsFilled(data, ['name', 'date'])).toBe(true);
    });

    it('should return false when any required field is empty', () => {
      const data = { name: 'John', date: '' };
      expect(areAllRequiredFieldsFilled(data, ['name', 'date'])).toBe(false);
    });

    it('should return false when any required field is whitespace-only', () => {
      const data = { name: 'John', date: '   ' };
      expect(areAllRequiredFieldsFilled(data, ['name', 'date'])).toBe(false);
    });

    it('should return false when required field is missing', () => {
      const data = { name: 'John' };
      expect(areAllRequiredFieldsFilled(data, ['name', 'date'])).toBe(false);
    });

    it('should return true when no required fields are specified', () => {
      const data = { name: 'John' };
      expect(areAllRequiredFieldsFilled(data, [])).toBe(true);
    });
  });

  describe('validateQuestionForm', () => {
    it('should reject empty questions', () => {
      const result = validateQuestionForm('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject whitespace-only questions', () => {
      const result = validateQuestionForm('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept valid questions', () => {
      const result = validateQuestionForm('What is my future?');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateDataForm', () => {
    it('should reject when required fields are missing', () => {
      const data = { name: 'John', date: '' };
      const result = validateDataForm(data, ['name', 'date']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject when required fields are whitespace-only', () => {
      const data = { name: 'John', date: '   ' };
      const result = validateDataForm(data, ['name', 'date']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept when all required fields are filled', () => {
      const data = { name: 'John', date: '1990-01-15' };
      const result = validateDataForm(data, ['name', 'date']);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept when no required fields are specified', () => {
      const data = { name: '', date: '' };
      const result = validateDataForm(data, []);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateSelectionForm', () => {
    it('should reject when no selection is made', () => {
      const result = validateSelectionForm('', 'What is my future?');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject when question is empty', () => {
      const result = validateSelectionForm('option-1', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject when question is whitespace-only', () => {
      const result = validateSelectionForm('option-1', '   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept when both selection and question are valid', () => {
      const result = validateSelectionForm('option-1', 'What is my future?');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
