/**
 * Chat API Client for Clarify with Mirastros
 */

import type {
  ChatConversation,
  ChatMessage,
  CreateConversationRequest,
  SendMessageRequest,
  ChatStreamEvent,
} from '../types/chat';

export class ChatAPI {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL;
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Create a new chat conversation
   */
  async createConversation(
    request: CreateConversationRequest
  ): Promise<ChatConversation> {
    const response = await fetch(`${this.baseURL}/chat/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create conversation');
    }

    return response.json();
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ conversations: ChatConversation[]; total: number }> {
    const response = await fetch(
      `${this.baseURL}/chat/conversations?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch conversations');
    }

    return response.json();
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<ChatConversation> {
    const response = await fetch(
      `${this.baseURL}/chat/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch conversation');
    }

    return response.json();
  }

  /**
   * Send a message in a conversation (non-streaming)
   */
  async sendMessage(
    conversationId: string,
    request: SendMessageRequest
  ): Promise<ChatMessage> {
    const response = await fetch(
      `${this.baseURL}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  }

  /**
   * Send a message and stream the response using Server-Sent Events
   * Optimized with better error handling and reconnection support
   */
  async *sendMessageStream(
    conversationId: string,
    request: SendMessageRequest
  ): AsyncGenerator<ChatStreamEvent, void, unknown> {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000);

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch(
          `${this.baseURL}/chat/conversations/${conversationId}/messages/stream`,
          {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let tokenCount = 0;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                
                // Handle [DONE] marker
                if (data === '[DONE]') {
                  yield { type: 'done' };
                  return;
                }

                try {
                  const event: ChatStreamEvent = JSON.parse(data);
                  
                  // Track token count for quick response detection
                  if (event.type === 'token') {
                    tokenCount++;
                    
                    // Add quick response marker for first few tokens
                    if (tokenCount === 1) {
                      yield { type: 'quick_response' };
                    }
                  }
                  
                  yield event;

                  if (event.type === 'done' || event.type === 'error') {
                    return;
                  }
                } catch (parseError) {
                  console.error('Failed to parse SSE data:', parseError, 'Data:', data);
                  // Continue processing other lines instead of failing completely
                }
              }
            }
          }

          // Stream completed successfully
          yield { type: 'done' };
          return;
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        console.error(`Streaming attempt ${retryCount + 1} failed:`, error);
        
        // If we've exhausted retries, throw the error
        if (retryCount >= maxRetries) {
          yield {
            type: 'error',
            error: error instanceof Error ? error.message : 'Streaming failed after multiple retries',
          };
          throw error;
        }

        // Wait before retrying with exponential backoff
        retryCount++;
        const delay = retryDelay(retryCount - 1);
        
        yield {
          type: 'error',
          error: `Connection lost. Retrying in ${delay / 1000}s... (Attempt ${retryCount}/${maxRetries})`,
        };

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/chat/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete conversation');
    }
  }
}
