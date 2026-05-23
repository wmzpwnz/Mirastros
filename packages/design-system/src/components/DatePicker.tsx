'use client';

/**
 * DatePicker Component
 * A calendar-based date picker with range selection and keyboard navigation
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import type { DatePickerProps } from '../types';

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select a date',
      range = false,
      startDate,
      endDate,
      minDate,
      maxDate,
      disabled = false,
      format = 'MM/DD/YYYY',
      id,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(
      value ? new Date(value.getFullYear(), value.getMonth()) : new Date(),
    );
    const [selectedStart, setSelectedStart] = useState<Date | null>(startDate || null);
    const [selectedEnd, setSelectedEnd] = useState<Date | null>(endDate || null);
    const containerRef = useRef<HTMLDivElement>(null);

    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();

      return format
        .replace('MM', month)
        .replace('DD', day)
        .replace('YYYY', String(year));
    };

    const getDaysInMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    const isDateInRange = (date: Date): boolean => {
      if (!range || !selectedStart || !selectedEnd) return false;
      return date >= selectedStart && date <= selectedEnd;
    };

    const handleDateClick = (day: number) => {
      const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

      if (isDateDisabled(selectedDate)) return;

      if (range) {
        if (!selectedStart || (selectedStart && selectedEnd)) {
          setSelectedStart(selectedDate);
          setSelectedEnd(null);
        } else if (selectedDate < selectedStart) {
          setSelectedStart(selectedDate);
        } else {
          setSelectedEnd(selectedDate);
          onChange?.(selectedDate);
          setIsOpen(false);
        }
      } else {
        onChange?.(selectedDate);
        setIsOpen(false);
      }
    };

    const handlePrevMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
      );
    };

    const handleNextMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
      );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevMonth();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextMonth();
          break;
        default:
          break;
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayDate = range
      ? selectedStart && selectedEnd
        ? `${formatDate(selectedStart)} - ${formatDate(selectedEnd)}`
        : selectedStart
          ? formatDate(selectedStart)
          : placeholder
      : value
        ? formatDate(value)
        : placeholder;

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const baseStyles =
      'w-full px-4 py-2 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed';

    const borderStyles = 'border-gray-600 focus:border-gold-500';

    const combinedClassName = `${baseStyles} ${borderStyles} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className="relative w-full"
        style={style}
        data-testid={testId}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`${combinedClassName} text-left flex justify-between items-center`}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          id={id}
        >
          <span className={displayDate === placeholder ? 'text-gray-400' : 'text-gray-100'}>
            {displayDate}
          </span>
          <span className="text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div
            ref={containerRef}
            className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-50 p-4"
            role="dialog"
            aria-label="Date picker"
          >
            {/* Month/Year header */}
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-700 rounded"
                aria-label="Previous month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-gray-100 font-semibold">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-700 rounded"
                aria-label="Next month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-gray-400 text-xs font-semibold">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isDisabled = isDateDisabled(date);
                const isSelected =
                  (value && date.toDateString() === value.toDateString()) ||
                  (selectedStart && date.toDateString() === selectedStart.toDateString()) ||
                  (selectedEnd && date.toDateString() === selectedEnd.toDateString());
                const inRange = isDateInRange(date);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`p-2 text-sm rounded transition-colors ${
                      isSelected ? 'bg-gold-500 text-cosmic font-semibold' : ''
                    } ${inRange ? 'bg-gold-200 text-cosmic' : ''} ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-700 text-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
