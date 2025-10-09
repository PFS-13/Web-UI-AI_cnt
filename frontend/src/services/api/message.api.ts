import type { 
CreateMessagePayload,
SendMessageResponse,
Message
} from '../../types/message.types';
const API_BASE_URL = import.meta.env.VITE_API_URL;


class MessageApi {
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

  async getPathMessages(conversation_id: string): Promise<{ path_messages: any[] }[]> {
    return this.request(`/message/v1/conversations/${conversation_id}/paths`, { method: 'GET' });
  }
  async getMessages(conversation_id: string): Promise<number[][]> {
    return this.request(`/message/v1/conversations/${conversation_id}`, { method: 'GET' });
  }

  async sendMessage(message : CreateMessagePayload): Promise<SendMessageResponse> {
    return this.request('/message/v1/messages/create', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json', 
    },
      body: JSON.stringify(message),
      
    });
  }

  async getMessageByIds(message_ids: number[]): Promise<Message[]> {
    return this.request('/message/v1/messages/get-by-ids', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json', 
    },
      body: JSON.stringify({ message_ids }),
  });
  }


  async getEditedMessageId(message_id: number): Promise<{ edited_id: number }> {
    return this.request(`/message/v1/messages/${message_id}/edited-id`, { method: 'GET' });
  }

  async editMessage(message_id: number): Promise<{ success: boolean }> {
    return this.request(`/message/v1/messages/${message_id}/is-edited`, {
      method: 'PATCH'
  });
}

async getChainedMessage(message_id: number): Promise<{ chain: number[] }> {
    return this.request(`/message/v1/messages/${message_id}/chained-message`, {
      method: 'GET'
  });

}
}

export const messageAPI = new MessageApi();
