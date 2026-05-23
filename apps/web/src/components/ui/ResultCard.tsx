'use client';

import React from 'react';

interface ResultCardProps {
  title: string;
  content: string | React.ReactNode;
  icon?: string;
  className?: string;
}

export function ResultCard({
  title,
  content,
  icon,
  className = '',
}: ResultCardProps) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-lg p-6 ${className}`}
    >
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="font-cinzel text-xl font-bold text-white mb-3">
        {title}
      </h3>
      <div className="text-gray-300 text-sm leading-relaxed">
        {typeof content === 'string' ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
