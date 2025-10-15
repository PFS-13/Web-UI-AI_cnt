import { useState, useEffect } from 'react';
import { conversationAPI } from '../services';
import { messageAPI } from '../services/api/message.api';
import type { Conversation } from '../types/chat.types';

interface UseConversationReturn {
  conversations: Conversation[];
  chatHistory: Array<{ id: string; title: string; isActive: boolean }>;
  loading: boolean;
  error: string | null;
  refetchConversations: () => Promise<void>;
  createNewConversation: (userId: string) => Promise<Conversation | null>;
  selectConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  shareConversation: (conversationId: string, path:string) => Promise<string | null>;
}

export const useConversation = (userId?: string): UseConversationReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; isActive: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversationsData = await conversationAPI.getConversationsByUserId(userId);
      
      // Enhanced: Fetch messages for each conversation to enable search
      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conversation: any) => {
            try {
              // Fetch messages for this conversation
              const messagesResponse = await messageAPI.getPathMessages(conversation.conversation_id);
              // Extract messages from ConversationPath array
              const messages = messagesResponse?.flatMap((path: any) => path.path_messages) || [];
            return {
              ...conversation,
              messages: messages || []
            };
          } catch (error) {
            console.warn(`Failed to fetch messages for conversation ${conversation.conversation_id}:`, error);
            return {
              ...conversation,
              messages: []
            };
          }
        })
      );
      
      // Set conversations for SearchPopup (with messages)
      setConversations(conversationsWithMessages);
      
      // Set chat history for sidebar
      const chatHistory = conversationsData.map((item: any) => ({
        id: item.conversation_id,
        title: item.title,
        isActive: false
      }));

      setChatHistory(chatHistory);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch conversations');
      setConversations([]);
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string): Promise<boolean> => {
    try {
      await conversationAPI.deleteConversation(conversationId);
      // Refresh conversations list
      const new_chatHistory = chatHistory.filter(item => item.id !== conversationId);
      setChatHistory(new_chatHistory);
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete conversation');
      return false;
    }
  };  

  const createNewConversation = async (userId: string): Promise<Conversation | null> => {
    try {
      const newConversation = await conversationAPI.createConversation({ user_id: userId });
      // Refresh conversations list
      await fetchConversations();
      // Convert CreateConversationResponse to Conversation
      const conversation: Conversation = {
        conversation_id: newConversation.conversation_id || '',
        title: 'New Conversation',
        user_id: userId,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        messages: []
      };
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
      return null;
    }
  };

  const shareConversation = async (conversationId: string, path:string): Promise<string | null> => {
    try {
      const response = await conversationAPI.shareConversation(conversationId, path);
      return response.shared_url || null;
    } catch (error) {
      console.error('Failed to share conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to share conversation');
      return null;
    }
  };

  const selectConversation = (conversationId: string) => {
    // Update active state in chat history
    setChatHistory(prev => 
      prev.map(item => ({
        ...item,
        isActive: item.id === conversationId
      }))
    );
  };

  const setActiveConversation = (conversationId: string) => {
    selectConversation(conversationId);
  };

  const refetchConversations = async () => {
    await fetchConversations();
  };

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  return {
    conversations,
    chatHistory,
    loading,
    error,
    refetchConversations,
    createNewConversation,
    selectConversation,
    setActiveConversation,
    deleteConversation,
    shareConversation,
  };
};
