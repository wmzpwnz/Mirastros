'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContextData {
  type: string;
  title: string;
  description?: string;
  data: any;
}

export interface ChatInterfaceProps {
  context?: ChatContextData;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  context,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const conversationId = useRef<string>();
  const generation = useRef(0);

  useEffect(() => {
    generation.current += 1;
    conversationId.current = undefined;
    setMessages([]);
    setError('');
    setLoading(false);
  }, [context]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && context) {
      const initialMessage: ChatMessage = {
        id: '0',
        role: 'assistant',
        content: `Привет! Я помогу вам разобраться с вашей ${context.title}. ${context.description || 'Задайте мне любые вопросы.'}`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, context]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || !input.trim()) {
      return;
    }

    const requestGeneration = generation.current;
    setError('');
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!conversationId.current) {
        const conversation = await api.startConversation(context?.type, context?.data);
        if (requestGeneration !== generation.current) return;
        conversationId.current = conversation.id;
      }
      const response = await api.requestChatCompletion(input, {
        conversationId: conversationId.current,
      });
      if (requestGeneration !== generation.current) return;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      if (requestGeneration !== generation.current) return;
      setError(err.message || 'Ошибка при обработке запроса');
      console.error('Chat error:', err);
    } finally {
      if (requestGeneration === generation.current) setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end md:justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full md:w-96 h-full md:h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 border border-mirastros-gold/30 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-mirastros-gold/20">
          <div>
            <h2 className="font-cinzel text-white font-bold">Mirastros AI</h2>
            {context && (
              <p className="text-xs text-gray-400 mt-1">{context.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-mirastros-gold text-black rounded-br-none'
                    : 'bg-slate-700 text-gray-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-gray-100 rounded-lg rounded-bl-none px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-mirastros-gold/20 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Задайте вопрос..."
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mirastros-gold disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-mirastros-gold hover:bg-mirastros-gold/80 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-2.976 5.951 2.976a1 1 0 001.169-1.409l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
