'use client';

import React from 'react';
import { Button, Textarea } from '@mirastros-universal/design-system';

interface QuestionFormProps {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  placeholder?: string;
  submitButtonText?: string;
  rows?: number;
}

export function QuestionForm({
  question,
  onQuestionChange,
  onSubmit,
  loading,
  error,
  placeholder = 'Задайте ваш вопрос...',
  submitButtonText = 'Получить ответ',
  rows = 4,
}: QuestionFormProps) {
  const handleSubmit = () => {
    // Validate: question must not be empty or only whitespace
    if (!question.trim()) {
      return;
    }
    onSubmit();
  };

  const isInvalid = !question.trim();

  return (
    <div className="space-y-4">
      {/* Question Input */}
      <div>
        <Textarea
          value={question}
          onChange={onQuestionChange}
          placeholder={placeholder}
          rows={rows}
          error={isInvalid && question.length > 0 ? 'Пожалуйста, введите непустой вопрос' : undefined}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading || isInvalid}
        loading={loading}
        className="w-full"
      >
        {submitButtonText}
      </Button>
    </div>
  );
}
