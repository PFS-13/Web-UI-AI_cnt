import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversation } from './useConversation';
import { useFileUpload } from './useFileUpload';
import { useChatMessages } from './useChatMessages';
import { useChatInput } from './useChatInput';
import { useChatNavigation } from './useChatNavigation';
import { useChatSubmit } from './useChatSubmit';
import type { Conversation } from '../types/chat.types';

interface UseChatProps {
  mode: 'new' | 'existing';
  conversationId?: string;
  userId?: string;
}

interface UseChatReturn {
  // State
  chatMessages: Array<{
    id?: number;
    content: string;
    is_user: boolean;
    is_edited?: boolean;
    edited_from_message_id?: number;
  }>;
  inputValue: string;
  isLoading: boolean;
  lastChat: number | null;
  path: number[];
  allMessagesId: number[][];
  conversationId?: string;
  
  // File upload (from useFileUpload)
  uploadedImages: File[];
  imagePreviews: string[];
  selectedImageIndex: number | null;
  isModalOpen: boolean;
  isDragOver: boolean;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  
  // Conversation (from useConversation)
  conversations: Conversation[];
  chatHistory: Array<{ id: string; title: string; isActive: boolean }>;
  
  // Refs
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  
  // Actions
  setInputValue: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleChangePath: (messageId: number, type: string, edited_from_message_id?: number) => void;
  handleEditMessage: (messageId: number, content: string, is_edited?: boolean) => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleShareConversation: (conversationId: string) => Promise<string | null>;
  handleNewChat: () => void;
  scrollToBottom: () => void;
  handleDeleteConversation: (conversationId: string) => void;
  
  // File upload actions
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  openImageModal: (index: number) => void;
  closeImageModal: () => void;
  nextImage: () => void;
  prevImage: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  clearImages: () => void;
}

export const useChat = ({ mode, conversationId, userId }: UseChatProps): UseChatReturn => {
  const navigate = useNavigate();
  
  // Custom hooks
  const fileUpload = useFileUpload();
  const conversation = useConversation(userId);
  
  // Chat state hooks
  const chatMessages = useChatMessages({ mode, conversationId });
  const chatInput = useChatInput();
  const chatNavigation = useChatNavigation({
    conversationId,
    setPath: chatMessages.setPath
  });
  
  // Memoized addValuesToMessageGroup function
  const addValuesToMessageGroup = useMemo(() => {
    return () => {
      // This will be handled by the individual hooks
    };
  }, []);
  
  const chatSubmit = useChatSubmit({
    mode,
    conversationId,
    userId,
    inputValue: chatInput.inputValue,
    setInputValue: chatInput.setInputValue,
    setChatMessages: chatMessages.setChatMessages,
    setLastChat: chatMessages.setLastChat,
    setPath: chatMessages.setPath,
    setIsLoading: () => {}, // Will be handled by chatMessages
    lastChat: chatMessages.lastChat,
    addValuesToMessageGroup,
    path: chatMessages.path,
    chatMessages: chatMessages.chatMessages,
  });

  // Navigation handlers
  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/c/${conversation.conversation_id}`);
  };

  const handleNewChat = () => {
    navigate('/');
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await conversation.deleteConversation(conversationId);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleShareConversation = async (conversationId: string) => {
    try {
      const response = await conversation.shareConversation(conversationId, chatMessages.path.join(','));
      return response;
    } catch (error) {
      console.error('Failed to share conversation:', error);
      return null;
    }
  };

  return {
    // State from chatMessages
    chatMessages: chatMessages.chatMessages,
    isLoading: chatMessages.isLoading,
    lastChat: chatMessages.lastChat,
    path: chatMessages.path,
    allMessagesId: chatMessages.allMessagesId,
    conversationId,
    messagesContainerRef: chatMessages.messagesContainerRef as React.RefObject<HTMLDivElement>,
    
    // State from chatInput
    inputValue: chatInput.inputValue,
    setInputValue: chatInput.setInputValue,
    handleInputChange: chatInput.handleInputChange,
    handleKeyDown: chatInput.handleKeyDown,
    
    // Actions from chatSubmit
    handleSubmit: chatSubmit.handleSubmit,
    handleEditMessage: chatSubmit.handleEditMessage,
    
    // Actions from chatNavigation
    handleChangePath: chatNavigation.handleChangePath,
    
    // File upload from useFileUpload
    ...fileUpload,
    
    // Conversation from useConversation
    conversations: conversation.conversations,
    chatHistory: conversation.chatHistory,
    
    // Navigation actions
    handleSelectConversation,
    handleNewChat,
    handleDeleteConversation,
    handleShareConversation,
    scrollToBottom: chatMessages.scrollToBottom,
  };
};