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
  last_message: string;
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
  title: string;
  user_id: string;
}

export interface CreateConversationResponse {
  message: string;
  data?: Conversation;
}

export interface EditConversationRequest {
  conversation_id: string;
  title: string;
}

export interface EditConversationResponse {
  message: string;
}

export interface ShareConversationResponse {
  message: string;
  data?: string;
}

export interface DeleteConversationResponse {
  message: string;
}
