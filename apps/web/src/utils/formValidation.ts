/**
 * Form validation utilities for service pages
 */

/**
 * Validates that a string is not empty or only whitespace
 * @param value - The string to validate
 * @returns true if the string is valid (non-empty and not only whitespace)
 */
export function isValidQuestion(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates that a string is not empty
 * @param value - The string to validate
 * @returns true if the string is not empty
 */
export function isValidField(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates a birth date format (YYYY-MM-DD)
 * @param value - The date string to validate
 * @returns true if the date is valid
 */
export function isValidBirthDate(value: string): boolean {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates a birth time format (HH:MM)
 * @param value - The time string to validate
 * @returns true if the time is valid
 */
export function isValidBirthTime(value: string): boolean {
  if (!value) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value);
}

/**
 * Validates that all required fields are filled
 * @param data - Object containing form data
 * @param requiredFields - Array of required field names
 * @returns true if all required fields are filled
 */
export function areAllRequiredFieldsFilled(
  data: Record<string, string | undefined>,
  requiredFields: string[]
): boolean {
  return requiredFields.every((field) => isValidField(data[field] || ''));
}

/**
 * Validates form data for question-based services
 * @param question - The question text
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateQuestionForm(question: string): {
  isValid: boolean;
  error?: string;
} {
  if (!isValidQuestion(question)) {
    return {
      isValid: false,
      error: 'Пожалуйста, введите непустой вопрос',
    };
  }
  return { isValid: true };
}

/**
 * Validates form data for data-based services
 * @param data - Object containing form data
 * @param requiredFields - Array of required field names
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateDataForm(
  data: Record<string, string | undefined>,
  requiredFields: string[]
): {
  isValid: boolean;
  error?: string;
} {
  const missingFields = requiredFields.filter((field) => !isValidField(data[field] || ''));

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Пожалуйста, заполните все обязательные поля: ${missingFields.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates form data for selection-based services
 * @param selectedId - The selected option ID
 * @param question - The question text
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateSelectionForm(selectedId: string, question: string): {
  isValid: boolean;
  error?: string;
} {
  if (!selectedId) {
    return {
      isValid: false,
      error: 'Пожалуйста, выберите опцию',
    };
  }

  if (!isValidQuestion(question)) {
    return {
      isValid: false,
      error: 'Пожалуйста, введите непустой вопрос',
    };
  }

  return { isValid: true };
}
