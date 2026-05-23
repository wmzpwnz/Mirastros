'use client';

import React from 'react';

interface ResultTextProps {
  title: string;
  content: string;
  subtitle?: string;
  className?: string;
}

export function ResultText({
  title,
  content,
  subtitle,
  className = '',
}: ResultTextProps) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-8 ${className}`}>
      <h2 className="font-cinzel text-2xl font-bold text-white mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-400 text-sm mb-6">{subtitle}</p>
      )}
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}
