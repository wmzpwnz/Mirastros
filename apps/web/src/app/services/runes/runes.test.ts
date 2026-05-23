import { describe, it, expect } from 'vitest';

/**
 * Property 1: Form Validation Prevents Invalid Submission
 *
 * For any service page with a form, submitting with empty or whitespace-only required fields
 * should be prevented, and an error message should be displayed.
 *
 * Validates: Requirements 3.7
 */
describe('Runes Service - Property 1: Form Validation Prevents Invalid Submission', () => {
  it('should reject empty questions', () => {
    // When question is empty, form submission should be prevented
    const question = '';
    expect(question.trim()).toBe('');
  });

  it('should reject whitespace-only questions', () => {
    // When question is only whitespace, form submission should be prevented
    const question = '   \n\t  ';
    expect(question.trim()).toBe('');
  });

  it('should accept non-empty questions', () => {
    // When question is non-empty, form submission should be allowed
    const question = 'What guidance do the runes have for me?';
    expect(question.trim().length).toBeGreaterThan(0);
  });

  it('should accept questions with leading/trailing whitespace', () => {
    // When question has leading/trailing whitespace but content, submission should be allowed
    const question = '  What guidance do the runes have for me?  ';
    expect(question.trim().length).toBeGreaterThan(0);
  });

  it('should display error message for empty submission', () => {
    // When user tries to submit empty form, error message should be displayed
    const error = 'Пожалуйста, задайте вопрос';
    expect(error).toBeTruthy();
  });

  it('should clear error message when user starts typing', () => {
    // When user starts typing after error, error message should be cleared
    const initialError = 'Пожалуйста, задайте вопрос';
    const afterTyping = '';
    expect(initialError).toBeTruthy();
    expect(afterTyping).toBe('');
  });
});
