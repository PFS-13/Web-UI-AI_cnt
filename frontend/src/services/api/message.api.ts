import type { 
CreateMessagePayload,
SendMessageResponse,
Message
} from '../../types/message.types';
const API_BASE_URL = import.meta.env.VITE_API_URL;


class MessageApi {
async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Clone options to avoid mutating caller's object
  const opts: RequestInit = { ...options };

  // Build headers as a plain object we can modify
  const incomingHeaders = options.headers ?? {};
  // Normalize to a plain object (Headers | array | object possible). Simplest: create a new object and copy.
  const headers: Record<string, string> = {};

  if (incomingHeaders instanceof Headers) {
    incomingHeaders.forEach((v, k) => { headers[k] = v; });
  } else if (Array.isArray(incomingHeaders)) {
    // array of [k, v]
    (incomingHeaders as [string, string][]).forEach(([k, v]) => { headers[k] = v; });
  } else {
    Object.assign(headers, incomingHeaders as Record<string, string>);
  }

  // If body is FormData or URLSearchParams, DO NOT set Content-Type (browser will add correct header & boundary)
  const body = opts.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isUrlSearchParams = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;

  if (!isFormData && !isUrlSearchParams) {
    // Only set JSON header if not provided already
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    // If body is a plain object (not string) and method allows body, stringify it
    if (body && typeof body !== 'string' && !(body instanceof ArrayBuffer) && !(body instanceof Blob)) {
      try {
        opts.body = JSON.stringify(body);
      } catch (e) {
        // leave as is if cannot stringify
      }
    }
  } else {
    // Ensure we don't accidentally keep a JSON content-type when sending FormData
    delete headers['Content-Type'];
  }

  const config: RequestInit = {
    credentials: 'include',
    ...opts,
    headers,
  };

  const response = await fetch(url, config);

  // handle 204 (No Content)
  if (response.status === 204) return null as any;

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text in message field for easier debugging
    data = { message: text };
  }

  if (!response.ok) {
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

async sendMessage(message: CreateMessagePayload, file?: File): Promise<SendMessageResponse> {
  const formData = new FormData();

  for (const [key, value] of Object.entries(message)) {
    // skip null / undefined
    if (value === undefined || value === null) continue;

    // skip empty string (optional: treat empty string as missing)
    if (typeof value === 'string' && value.trim() === '') continue;

    // Explicit casting:
    if (typeof value === 'boolean' || typeof value === 'number') {
      formData.append(key, String(value)); // "true"/"false" or "123"
    } else {
      formData.append(key, value as string);
    }
  }

  if (file) {
    formData.append('file', file);
  }

  // IMPORTANT: don't set Content-Type header — let fetch/browser set it
  return this.request('/message/v1/messages/create', {
    method: 'POST',
    body: formData,
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
