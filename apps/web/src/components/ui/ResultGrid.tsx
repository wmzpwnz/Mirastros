'use client';

import React from 'react';

interface ResultGridProps {
  items: Array<{
    id: string;
    title: string;
    content: string | React.ReactNode;
    icon?: string;
  }>;
  columns?: number;
  className?: string;
}

export function ResultGrid({
  items,
  columns = 3,
  className = '',
}: ResultGridProps) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridColsClass} gap-4 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
        >
          {item.icon && <div className="text-4xl mb-2">{item.icon}</div>}
          <p className="text-white font-semibold text-sm mb-2">{item.title}</p>
          <div className="text-gray-400 text-xs">
            {typeof item.content === 'string' ? (
              <p>{item.content}</p>
            ) : (
              item.content
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
