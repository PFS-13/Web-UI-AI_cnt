export interface Message {
  id: number;
  conversation_id: string;
  content: string;
  is_from_sender: boolean;
  is_attach_file: boolean;
  edited_from?: number;
  reply_from?: number;
  created_at: Date;
}

export interface CreateMessagePayload {
  conversation_id: string;
  content: string;
  is_from_sender: boolean;
  is_attach_file?: boolean;
  edited_from?: number;
  reply_from?: number;
}


