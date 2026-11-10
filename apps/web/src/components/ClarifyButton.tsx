/**
 * Clarify with Mirastros Button Component
 * Displays a button to open the AI chat with service context
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ChatInterface } from './ChatInterface';

export interface ClarifyButtonProps {
  onClarify: () => void;
  contextType: string;
  contextData: any;
  available?: boolean;
  className?: string;
}

export const ClarifyButton: React.FC<ClarifyButtonProps> = ({
  onClarify,
  contextType,
  contextData,
  available = true,
  className = '',
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const context = useMemo(() => ({ type: contextType, title: 'интерпретацией', data: contextData }), [contextType, contextData]);
  if (!available) {
    return (
      <div className={`bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-cinzel text-xl font-bold text-gray-400 mb-2">
              Есть вопросы о вашем результате?
            </h3>
            <p className="text-gray-500 text-sm">
              Обновитесь до Premium или Platinum для доступа к AI-ассистенту
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 text-gray-400 rounded-lg border border-gray-700 cursor-not-allowed">
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
            <span>Уточнить с Mirastros</span>
            <span className="text-xs bg-mirastros-gold text-black px-2 py-0.5 rounded">
              Premium
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={`bg-gradient-to-r from-mirastros-gold/10 to-mirastros-gold/5 border border-mirastros-gold/30 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-cinzel text-xl font-bold text-white mb-2">
            Есть вопросы о вашем результате?
          </h3>
          <p className="text-gray-400 text-sm">
            Задайте уточняющие вопросы AI-ассистенту Mirastros
          </p>
        </div>
        <button
          onClick={() => {
            onClarify();
            setChatOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-mirastros-gold to-mirastros-gold/80 text-black rounded-lg font-semibold hover:from-mirastros-gold/90 hover:to-mirastros-gold/70 transition-all duration-300 shadow-lg hover:shadow-mirastros-gold/50"
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
          <span>Уточнить с Mirastros</span>
        </button>
      </div>
    </div>
    <ChatInterface context={context} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};
