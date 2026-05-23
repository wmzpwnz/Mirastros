'use client';

import React from 'react';
import { Button, Textarea, Label } from '@mirastros-universal/design-system';

export interface SelectionOption {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

interface SelectionFormProps {
  selectedId: string;
  onSelectionChange: (id: string) => void;
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  options: SelectionOption[];
  optionLabel?: string;
  questionLabel?: string;
  questionPlaceholder?: string;
  submitButtonText?: string;
  rows?: number;
}

export function SelectionForm({
  selectedId,
  onSelectionChange,
  question,
  onQuestionChange,
  onSubmit,
  loading,
  error,
  options,
  optionLabel = 'Выберите опцию',
  questionLabel = 'Задайте вопрос',
  questionPlaceholder = 'Введите ваш вопрос...',
  submitButtonText = 'Получить результат',
  rows = 4,
}: SelectionFormProps) {
  const handleSubmit = () => {
    // Validate: question must not be empty or only whitespace
    if (!question.trim()) {
      return;
    }
    onSubmit();
  };

  const isInvalid = !question.trim();

  return (
    <div className="space-y-8">
      {/* Selection */}
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-white mb-4">
          {optionLabel}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectionChange(option.id)}
              className={`text-left p-6 rounded-lg border-2 transition ${
                selectedId === option.id
                  ? 'bg-mirastros-gold/10 border-mirastros-gold'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {option.icon && <span className="text-2xl">{option.icon}</span>}
                  <h3 className="font-cinzel text-xl font-bold text-white">
                    {option.name}
                  </h3>
                </div>
              </div>
              {option.description && (
                <p className="text-gray-400 text-sm">{option.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input */}
      <div>
        <Label className="font-cinzel text-2xl font-bold text-white mb-4">
          {questionLabel}
        </Label>
        <Textarea
          value={question}
          onChange={onQuestionChange}
          placeholder={questionPlaceholder}
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
