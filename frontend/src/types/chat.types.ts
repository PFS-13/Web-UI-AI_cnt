export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  conversation_id: string;
  title: string;
  user_id: string;
  shared_url?: string;
  created_at: string;
  last_updated?: string;
  messages?: Message[];
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface CreateConversationRequest {
  user_id: string;
}

export interface CreateConversationResponse {
  conversation_id?: string;
  message?: string;
}

export interface EditConversationRequest {
  conversation_id: string;
  title: string;
}

export interface EditConversationResponse {
  message: string;
}

export interface ShareConversationResponse {
  message?: string;
  shared_url?: string;
}

export interface DeleteConversationResponse {
  message?: string;
}
