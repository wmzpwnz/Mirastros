'use client';

import React from 'react';
import { Button, Input, Label } from '@mirastros-universal/design-system';

export interface FormData {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  [key: string]: string | undefined;
}

interface DataFormProps {
  data: FormData;
  onDataChange?: (field: string, value: string) => void;
  onChange?: (data: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  fields?: DataFormField[];
  submitButtonText?: string;
  showSubmitButton?: boolean;
}

interface DataFormField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'time';
  placeholder?: string;
  required?: boolean;
}

const defaultFields: DataFormField[] = [
  { name: 'name', label: 'Имя', type: 'text', required: true },
  { name: 'birthDate', label: 'Дата рождения', type: 'date', required: true },
  { name: 'birthTime', label: 'Время рождения', type: 'time', required: true },
  { name: 'birthLocation', label: 'Место рождения', type: 'text', required: true },
];

export function DataForm({
  data,
  onChange,
  onDataChange,
  onSubmit,
  loading,
  error,
  fields = defaultFields,
  submitButtonText = 'Получить результат',
  showSubmitButton = true,
}: DataFormProps) {
  const handleFieldChange = (field: string, value: string) => {
    onDataChange?.(field, value);
    onChange?.({ ...data, [field]: value });
  };

  const handleSubmit = () => {
    // Validate: all required fields must be filled
    const allFieldsFilled = fields
      .filter((f) => f.required !== false)
      .every((f) => data[f.name]?.trim());

    if (!allFieldsFilled) {
      return;
    }
    onSubmit();
  };

  const isInvalid = !fields
    .filter((f) => f.required !== false)
    .every((f) => data[f.name]?.trim());

  return (
    <div className="space-y-4">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <Label>
              {field.label}
              {field.required !== false && <span className="text-red-400">*</span>}
            </Label>
            <Input
              type={field.type}
              value={data[field.name] || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Validation Error */}
      {isInvalid && Object.values(data).some((v) => v?.trim()) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            Пожалуйста, заполните все обязательные поля
          </p>
        </div>
      )}

      {/* Submit Button */}
      {showSubmitButton && (
        <Button
          onClick={handleSubmit}
          disabled={loading || isInvalid}
          loading={loading}
          className="w-full"
        >
          {submitButtonText}
        </Button>
      )}
    </div>
  );
}
