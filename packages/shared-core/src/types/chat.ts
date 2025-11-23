/**
 * Chat types for Clarify with Mirastros feature
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  service_type?: string;
  reading_id?: string;
  context_data?: Record<string, any>;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface CreateConversationRequest {
  service_type: string;
  reading_id?: string;
  context_data?: Record<string, any>;
  initial_message?: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface ChatStreamEvent {
  type: 'token' | 'done' | 'error' | 'quick_response';
  content?: string;
  message_id?: string;
  error?: string;
}
