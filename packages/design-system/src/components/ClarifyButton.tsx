/**
 * Clarify Button Component
 * Displays a button to open the Clarify with Mirastros chat
 */

import React from 'react';

export interface ClarifyButtonProps {
  onClick: () => void;
  available: boolean;
  className?: string;
  variant?: 'default' | 'compact';
}

export const ClarifyButton: React.FC<ClarifyButtonProps> = ({
  onClick,
  available,
  className = '',
  variant = 'default',
}) => {
  if (!available) {
    return (
      <div
        className={`inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg border border-gray-700 cursor-not-allowed ${className}`}
        title="Upgrade to Premium or Platinum to use this feature"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span className={variant === 'compact' ? 'text-sm' : ''}>
          Clarify with Mirastros
        </span>
        <span className="text-xs bg-[#BE8F44] text-[#050505] px-2 py-0.5 rounded">
          Premium
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#BE8F44] to-[#d4a556] text-[#050505] rounded-lg font-semibold hover:from-[#d4a556] hover:to-[#BE8F44] transition-all duration-300 shadow-lg hover:shadow-[#BE8F44]/50 ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <span className={variant === 'compact' ? 'text-sm' : ''}>
        Clarify with Mirastros
      </span>
    </button>
  );
};
