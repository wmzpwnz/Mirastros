'use client';

/**
 * Chat Interface Component for Clarify with Mirastros
 * Optimized for streaming with EventSource, smooth animations, and error handling
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatStreamEvent } from '@mirastros-universal/shared-core';

export interface ChatInterfaceProps {
  conversationId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onSendMessageStream?: (message: string) => AsyncGenerator<ChatStreamEvent, void, unknown>;
  isLoading?: boolean;
  contextInfo?: {
    serviceType: string;
    readingId?: string;
  };
  className?: string;
  apiBaseUrl?: string;
  authToken?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  messages,
  onSendMessage,
  onSendMessageStream,
  isLoading = false,
  contextInfo,
  className = '',
  apiBaseUrl,
  authToken,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasQuickResponse, setHasQuickResponse] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when messages change with smooth animation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Handle EventSource streaming with reconnection logic
  const handleEventSourceStream = useCallback(
    async (message: string) => {
      if (!apiBaseUrl || !authToken) {
        throw new Error('API base URL and auth token are required for EventSource streaming');
      }

      setIsStreaming(true);
      setStreamingMessage('');
      setHasQuickResponse(false);
      setConnectionError(null);

      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        // Create EventSource connection
        const url = new URL(
          `/chat/conversations/${conversationId}/messages/stream`,
          apiBaseUrl
        );
        
        // EventSource doesn't support custom headers, so we need to use a different approach
        // We'll use fetch with ReadableStream instead
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let tokenCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                setIsStreaming(false);
                setStreamingMessage('');
                setRetryCount(0);
                return;
              }

              try {
                const event: ChatStreamEvent = JSON.parse(data);

                if (event.type === 'token' && event.content) {
                  tokenCount++;
                  
                  // Check for quick response marker (first few tokens)
                  if (tokenCount <= 3 && !hasQuickResponse) {
                    setHasQuickResponse(true);
                  }

                  // Token-by-token rendering with smooth animation
                  setStreamingMessage((prev) => prev + event.content);
                } else if (event.type === 'done') {
                  setIsStreaming(false);
                  setStreamingMessage('');
                  setRetryCount(0);
                  return;
                } else if (event.type === 'error') {
                  throw new Error(event.error || 'Streaming error occurred');
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError);
              }
            }
          }
        }

        setIsStreaming(false);
        setStreamingMessage('');
        setRetryCount(0);
      } catch (error) {
        console.error('EventSource streaming error:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        setIsStreaming(false);
        setStreamingMessage('');

        // Implement exponential backoff for reconnection
        if (retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setRetryCount((prev) => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            handleEventSourceStream(message);
          }, delay);
        }
      }
    },
    [apiBaseUrl, authToken, conversationId, retryCount, hasQuickResponse]
  );

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || isStreaming) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      // Use EventSource streaming if API base URL and token are provided
      if (apiBaseUrl && authToken) {
        await handleEventSourceStream(message);
      } else if (onSendMessageStream) {
        // Fallback to AsyncGenerator streaming
        setIsStreaming(true);
        setStreamingMessage('');
        setHasQuickResponse(false);

        for await (const event of onSendMessageStream(message)) {
          if (event.type === 'token' && event.content) {
            setStreamingMessage((prev) => prev + event.content);
          } else if (event.type === 'done') {
            setStreamingMessage('');
            setIsStreaming(false);
          } else if (event.type === 'error') {
            console.error('Streaming error:', event.error);
            setStreamingMessage('');
            setIsStreaming(false);
          }
        }
      } else {
        // Use regular request
        await onSendMessage(message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to send message');
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    setConnectionError(null);
    setRetryCount(0);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#050505] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#BE8F44]/20">
        <div>
          <h2 className="text-xl font-cinzel text-[#BE8F44]">
            Clarify with Mirastros
          </h2>
          {contextInfo && (
            <p className="text-sm text-gray-400 mt-1">
              About your {contextInfo.serviceType} reading
            </p>
          )}
        </div>
        
        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center space-x-2 text-sm text-[#BE8F44]">
            <div className="w-2 h-2 bg-[#BE8F44] rounded-full animate-pulse"></div>
            <span>Mirastros is responding...</span>
          </div>
        )}
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="px-6 py-3 bg-red-900/20 border-b border-red-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-red-300">
                Connection error: {connectionError}
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="text-sm text-[#BE8F44] hover:text-[#d4a556] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-[#BE8F44] text-[#050505]'
                  : 'bg-[#1a1a1a] text-gray-100 border border-[#BE8F44]/20'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-60 mt-2 block">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Quick response indicator */}
        {isStreaming && hasQuickResponse && !streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#1a1a1a] text-gray-100 border border-[#BE8F44]/20">
              <p className="text-sm text-[#BE8F44] animate-pulse">
                Mirastros is thinking...
              </p>
            </div>
          </div>
        )}

        {/* Streaming message with smooth token-by-token animation */}
        {isStreaming && streamingMessage && (
          <div className="flex justify-start animate-fadeIn">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#1a1a1a] text-gray-100 border border-[#BE8F44]/20">
              <p className="text-sm whitespace-pre-wrap">
                {streamingMessage}
                <span className="inline-block w-0.5 h-4 bg-[#BE8F44] animate-pulse ml-1 align-middle"></span>
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator (initial connection) */}
        {(isLoading || (isStreaming && !streamingMessage && !hasQuickResponse)) && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#1a1a1a] text-gray-100 border border-[#BE8F44]/20">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 bg-[#BE8F44] rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#BE8F44] rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#BE8F44] rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[#BE8F44]/20">
        <div className="flex items-end space-x-3">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mirastros for clarification..."
            disabled={isLoading || isStreaming}
            className="flex-1 bg-[#1a1a1a] text-gray-100 border border-[#BE8F44]/20 rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[#BE8F44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading || isStreaming}
            className="px-6 py-3 bg-[#BE8F44] text-[#050505] rounded-lg font-semibold hover:bg-[#d4a556] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#BE8F44] disabled:hover:scale-100"
          >
            {isStreaming ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
