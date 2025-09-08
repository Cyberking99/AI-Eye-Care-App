import { apiClient } from './config';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  conversationId?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  message: string;
  conversationId?: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  conversationId: string;
}

export const chatService = {
  // Send a message to the chat
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return await apiClient.post<SendMessageResponse>('/chat/message', data);
  },

  // Get chat history
  async getHistory(): Promise<ChatConversation[]> {
    return await apiClient.get<ChatConversation[]>('/chat/history');
  },

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/chat/conversation/${conversationId}`);
  },
};
