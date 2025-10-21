import { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api/message.api';
// import type { Conversation } from '../types/chat.types';

interface MessageResponse {
  id: number;
  content: string;
  is_user: boolean;
  is_edited?: boolean;
  edited_from_message_id?: number;
}

// interface PathMessageResponse {
//   path_messages: MessageResponse[];
// }

interface ChatMessage {
  id?: number;
  content: string;
  is_user: boolean;
  is_edited?: boolean;
  edited_from_message_id?: number;
}

interface UseChatMessagesProps {
  mode: 'new' | 'existing';
  conversationId?: string;
}

interface UseChatMessagesReturn {
  chatMessages: ChatMessage[];
  isLoading: boolean;
  lastChat: number | null;
  path: number[];
  allMessagesId: number[][];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setPath: React.Dispatch<React.SetStateAction<number[]>>;
  setLastChat: React.Dispatch<React.SetStateAction<number | null>>;
  scrollToBottom: () => void;
}

export const useChatMessages = ({ 
  mode, 
  conversationId 
}: UseChatMessagesProps): UseChatMessagesReturn => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading] = useState(false);
  const [lastChat, setLastChat] = useState<number | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [allMessagesId, setAllMessagesId] = useState<number[][]>([]);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const removeDuplicatesAcrossArrays = (arrays: number[][]) => {
    const seen = new Set<number>();
    return arrays.map(arr => {
      const filtered = arr.filter(num => !seen.has(num));
      filtered.forEach(num => seen.add(num));
      return filtered;
    });
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // const addValuesToMessageGroup = (messageId: number | null, newValues: number[]) => {
  //   setAllMessagesId(prev => {
  //     if (messageId === null) {
  //       return [...prev, newValues];
  //     }

  //     return prev.map(group =>
  //       group.includes(messageId)
  //         ? [...group, ...newValues]
  //         : group
  //     );
  //   });
  // };

  // Load existing conversation messages
  useEffect(() => {
    if (mode === 'existing' && conversationId) {
      const fetchMessages = async () => {
        try {
          const messages = await messageAPI.getMessages(conversationId);
          const messages_no_dupes = removeDuplicatesAcrossArrays(messages);
          setAllMessagesId(messages_no_dupes);
          const firstPathIds: number[] = messages[0] || [];
          const content_message = firstPathIds.length ? await messageAPI.getMessageByIds(firstPathIds) : [];
          setPath(firstPathIds);
          const chat_message: ChatMessage[] = content_message.map((msg: MessageResponse) => ({
            id: msg.id,
            content: msg.content,
            is_user: msg.is_user,
            is_edited: msg.is_edited,
            edited_from_message_id: msg.edited_from_message_id
          }));
          setChatMessages(chat_message);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };
      fetchMessages();
    }
  }, [mode, conversationId]);

  // Load messages when path changes
  useEffect(() => {
    if (path.length > 0) {
      const fetchMessages = async () => {
        const messages = await messageAPI.getMessageByIds(path);
        const chat_message: ChatMessage[] = messages.map((msg: MessageResponse) => ({
          id: msg.id,
          content: msg.content,
          is_user: msg.is_user,
          is_edited: msg.is_edited,
          edited_from_message_id: msg.edited_from_message_id
        }));
        setChatMessages(chat_message);
        setLastChat(path[path.length - 1] || null);
      };
      fetchMessages();
    }
  }, [path]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  return {
    chatMessages,
    isLoading,
    lastChat,
    path,
    allMessagesId,
    messagesContainerRef,
    setChatMessages,
    setPath,
    setLastChat,
    scrollToBottom,
  };
};
