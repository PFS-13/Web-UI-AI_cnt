export interface Message {
  id: number;
  conversation_id: string;
  content: string;
  is_user: boolean;
  is_attach_file: boolean;
  edited_from_message_id?: number;
  parent_message_id?: number;
  created_at: Date;
  is_edited: boolean;
}

export interface CreateMessagePayload {
  conversation_id: string;
  content: string;
  is_user: boolean;
  is_attach_file?: boolean;
  edited_from_message_id?: number | null;
  parent_message_id?: number | null;
  is_edited?: boolean;
}


export interface SendMessageResponse {
  reply: {
    message_id: number;
    message: string;
  };
}

export interface ConversationPath {
  path_ids: number[];
  path_messages: Message[];
}

export type FetchMessagesResponse = ConversationPath[];