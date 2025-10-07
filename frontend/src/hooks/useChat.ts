import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/api/message.api';
import { useConversation } from './useConversation';
import { useFileUpload } from './useFileUpload';
import axios from "axios";

interface ChatMessage {
  id?: number;
  content: string;
  is_user: boolean;
  is_edited?: boolean;
  edited_from_message_id?: number;
}

interface UseChatProps {
  mode: 'new' | 'existing';
  conversationId?: string;
  userId?: string;
}

interface UseChatReturn {
  // State
  chatMessages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  lastChat: number | null;
  path: number[];
  allMessagesId: number[][];
  
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
  conversations: any[];
  chatHistory: Array<{ id: string; title: string; isActive: boolean }>;
  
  // Refs
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  
  // Actions
  setInputValue: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSelectConversation: (conversation: any) => void;
  handleNewChat: () => void;
  scrollToBottom: () => void;
  
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
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChat, setLastChat] = useState<number | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [allMessagesId, setAllMessagesId] = useState<number[][]>([]);
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const fileUpload = useFileUpload();
  const conversation = useConversation(userId);

  // Load messages for existing conversation
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
          const chat_message: ChatMessage[] = content_message.map((msg: any) => ({
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

  // Update messages when path changes
  useEffect(() => {
    if (path.length > 0) {
      const fetchMessages = async () => {
        const messages = await messageAPI.getMessageByIds(path);
        const chat_message: ChatMessage[] = messages.map((msg: any) => ({
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

  useEffect(() => {
    console.log("Last chat updated:", lastChat);
  }, [chatMessages]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea (stretch upward)
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 170); // 170px = 10.625rem
    textarea.style.height = newHeight + 'px';
    
    // Scroll to bottom to show latest content
    textarea.scrollTop = textarea.scrollHeight;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // contoh upload multiple files (1 request per file)

async function uploadFiles(files: File[], message_id: number) {
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("message_id", String(message_id));

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/attachments/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // kalau pakai cookie auth
      });
      console.log("Uploaded:", res.data);
    } catch (err) {
      console.error("Upload error:", err);
    }
  }
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || fileUpload.uploadedImages.length > 0) {
      // Add user message
      const userMessage: ChatMessage = {
        content: inputValue.trim(),
        is_user: true,
      };
      setInputValue('');
      setChatMessages(prev => [...prev, userMessage]);
      
      if (mode === 'new' && userId) {
        // Create new conversation
        const newConversation = await conversation.createNewConversation(userId);
        if (newConversation) {
          const response = await messageAPI.sendMessage({ 
            content: userMessage.content,
            conversation_id: newConversation.conversation_id!,
            is_user: true,
            is_attach_file: fileUpload.uploadedImages.length > 0,
            parent_message_id: null,
            edited_from_message_id: null
          });
          
          setTimeout(() => {
            const aiMessage: ChatMessage = { 
              content: response.reply.message,
              is_user: false,
            };
            setChatMessages(prev => [...prev, aiMessage]);
            setLastChat(response.reply.message_id_server);
            setIsLoading(false);
          }, 1000);
          
          // Navigate to new conversation
          navigate(`/c/${newConversation.conversation_id}`);
        }
      } else if (mode === 'existing' && conversationId) {
        // Continue existing conversation        
        const response = await messageAPI.sendMessage({ 
          content: userMessage.content,
          conversation_id: conversationId,
          is_user: true,
          is_attach_file: fileUpload.uploadedImages.length > 0,
          parent_message_id: lastChat,
          edited_from_message_id: undefined
        });

        if (fileUpload.uploadedImages.length > 0) {
          await uploadFiles(fileUpload.uploadedImages, response.reply.message_id_client);
        }
        setTimeout(() => {
          const aiMessage: ChatMessage = { 
            content: response.reply.message,
            is_user: false,
          };
          setChatMessages(prev => [...prev, aiMessage]);
          setLastChat(response.reply.message_id_server);
          setIsLoading(false);
        }, 1000);
      }
      
      // Clear input and images
      fileUpload.clearImages();
    }
  };

  const handleSelectConversation = (conversation: any) => {
    // Navigate to specific conversation
    navigate(`/c/${conversation.conversation_id}`);
  };

  const handleNewChat = () => {
    // Navigate to new chat
    navigate('/');
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  // Global drag events
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        fileUpload.setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.relatedTarget || e.relatedTarget === document.body) {
        fileUpload.setIsDragging(false);
        fileUpload.setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      fileUpload.setIsDragging(false);
      fileUpload.setIsDragOver(false);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [fileUpload]);

  return {
    // State
    chatMessages,
    inputValue,
    isLoading,
    lastChat,
    path,
    allMessagesId,
    
    // File upload
    ...fileUpload,
    
    // Conversation
    conversations: conversation.conversations,
    chatHistory: conversation.chatHistory,
    
    // Refs
    messagesContainerRef: messagesContainerRef as React.RefObject<HTMLDivElement>,
    
    // Actions
    setInputValue,
    handleInputChange,
    handleKeyDown,
    handleSubmit,
    handleSelectConversation,
    handleNewChat,
    scrollToBottom,
    
    // File upload actions (re-exported for convenience)
    handleImageUpload: fileUpload.handleImageUpload,
    removeImage: fileUpload.removeImage,
    openImageModal: fileUpload.openImageModal,
    closeImageModal: fileUpload.closeImageModal,
    nextImage: fileUpload.nextImage,
    prevImage: fileUpload.prevImage,
    handleDragOver: fileUpload.handleDragOver,
    handleDragLeave: fileUpload.handleDragLeave,
    handleDrop: fileUpload.handleDrop,
    clearImages: fileUpload.clearImages,
  };
};
