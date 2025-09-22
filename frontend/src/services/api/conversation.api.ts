import type { ApiResponse, ApiError } from '../../types';
import type { 
  Conversation, 
  CreateConversationRequest, 
  CreateConversationResponse,
  EditConversationRequest,
  EditConversationResponse,
  ShareConversationResponse,
  DeleteConversationResponse
} from '../../types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ConversationAPI {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = sessionStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return this.request<Conversation[]>(`/conversation/v1/conversations/user/${userId}`);
  }

  async createConversation(request: CreateConversationRequest): Promise<CreateConversationResponse> {
    return this.request<CreateConversationResponse>('/conversation/v1/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async editConversation(request: EditConversationRequest): Promise<EditConversationResponse> {
    return this.request<EditConversationResponse>('/conversation/v1/conversations/edit', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async shareConversation(conversationId: string): Promise<ShareConversationResponse> {
    return this.request<ShareConversationResponse>(`/conversation/v1/conversations/${conversationId}/create-share-url`, {
      method: 'PATCH',
    });
  }

  async deleteConversation(conversationId: string): Promise<DeleteConversationResponse> {
    return this.request<DeleteConversationResponse>(`/conversation/v1/conversations/${conversationId}/delete`, {
      method: 'POST',
    });
  }
}

export const conversationAPI = new ConversationAPI();
