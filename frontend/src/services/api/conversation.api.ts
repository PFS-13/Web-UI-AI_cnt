import type { 
  Conversation, 
  CreateConversationRequest, 
  CreateConversationResponse,
  EditConversationRequest,
  EditConversationResponse,
  ShareConversationResponse,
  DeleteConversationResponse
} from '../../types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ConversationAPI {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    // handle 204 (No Content)
    if (response.status === 204) return null as any;

    const text = await response.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      // balikin error dalam bentuk json
      throw data;
    }

    return data as T;
  }

  async getConversationsByUserId(user_id: string): Promise<Conversation[]> {
    return this.request<Conversation[]>(`/conversation/v1/users/${user_id}`);
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

  async shareConversation(conversation_id: string, path:string): Promise<ShareConversationResponse> {
    return this.request<ShareConversationResponse>(`/conversation/v1/conversations/${conversation_id}/create-share-url`, {
      method: 'PATCH',
      body: JSON.stringify({ path }),

    });
  }

  async deleteConversation(conversation_id: string): Promise<DeleteConversationResponse> {
    return this.request<DeleteConversationResponse>(`/conversation/v1/conversations/${conversation_id}/delete`, {
      method: 'DELETE',
    });
  }
}

export const conversationAPI = new ConversationAPI();
