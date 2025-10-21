import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/api/message.api';
import { useConversation } from './useConversation';
import { useFileUpload } from './useFileUpload';
import { findLatestMessageInChain } from '../utils/pathTraversal';
// import type { Conversation } from '../types/chat.types';
import axios from 'axios';

interface ChatMessage {
  id?: number;
  content: string;
  is_user: boolean;
  is_edited?: boolean;
  edited_from_message_id?: number;
}

interface UseChatSubmitProps {
  mode: 'new' | 'existing';
  conversationId?: string;
  userId?: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setLastChat: React.Dispatch<React.SetStateAction<number | null>>;
  setPath: React.Dispatch<React.SetStateAction<number[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  lastChat: number | null;
  addValuesToMessageGroup: (messageId: number | null, newValues: number[]) => void;
  path: number[];
  chatMessages: ChatMessage[];
}

interface UseChatSubmitReturn {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEditMessage: (messageId: number, content: string, is_edited?: boolean) => Promise<void>;
}

export const useChatSubmit = ({
  mode,
  conversationId,
  userId,
  inputValue,
  setInputValue,
  setChatMessages,
  setLastChat,
  setPath,
  setIsLoading,
  lastChat,
  addValuesToMessageGroup,
  path,
  chatMessages,
}: UseChatSubmitProps): UseChatSubmitReturn => {
  const navigate = useNavigate();
  const fileUpload = useFileUpload();
  const conversation = useConversation(userId);

  const uploadFiles = async (files: File[], message_id: number) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message_id", String(message_id));

      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/attachments/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || fileUpload.uploadedImages.length > 0) {
      // Add user message
      const userMessage: ChatMessage = {
        content: inputValue.trim(),
        is_user: true,
      };
      setInputValue('');
      setChatMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

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
          }, fileUpload.uploadedImages.length > 0 ? fileUpload.uploadedImages[0] : undefined);

          setChatMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0) {
              updated[lastIndex] = {
                ...updated[lastIndex],
                id: response.reply.message_id_client,
              };
            }
            return updated;
          });
          
          const aiMessage: ChatMessage = { 
            content: response.reply.message,
            is_user: false,
          };
          addValuesToMessageGroup(lastChat || -1, [response.reply.message_id_client, response.reply.message_id_server]);

          setChatMessages(prev => [...prev, aiMessage]);
          setLastChat(response.reply.message_id_server);
          setIsLoading(false);
          
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
        }, fileUpload.uploadedImages.length > 0 ? fileUpload.uploadedImages[0] : undefined);

        setChatMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              id: response.reply.message_id_client,
            };
          }
          return updated;
        });

        if (fileUpload.uploadedImages.length > 0) {
          await uploadFiles(fileUpload.uploadedImages, response.reply.message_id_client);
        }
        
        const aiMessage: ChatMessage = { 
          content: response.reply.message,
          is_user: false,
        };

        addValuesToMessageGroup(lastChat || -1, [response.reply.message_id_client, response.reply.message_id_server]);
        setChatMessages(prev => [...prev, aiMessage]);
        setLastChat(response.reply.message_id_server);
        setPath(prev => [...prev, response.reply.message_id_client, response.reply.message_id_server]);
        setIsLoading(false);
      }
      
      // Clear input and images
      fileUpload.clearImages();
    }
  }, [
    inputValue,
    fileUpload.uploadedImages,
    mode,
    userId,
    conversationId,
    lastChat,
    setInputValue,
    setChatMessages,
    setLastChat,
    setPath,
    setIsLoading,
    addValuesToMessageGroup,
    conversation,
    navigate,
    fileUpload.clearImages
  ]);

  const handleEditMessage = useCallback(async (
    messageId: number, 
    content: string, 
    is_edited?: boolean
  ) => {
    try {
      let value_before = null;
      let edited_from = messageId;
      
      if (is_edited && conversationId) {
        const allPathsResponse = await messageAPI.getPathMessages(conversationId);
        const allPaths: number[][] = (allPathsResponse as any[]).map((pathData: any) => {
          if (pathData.path_messages && Array.isArray(pathData.path_messages)) {
            return pathData.path_messages.map((msg: any) => msg.id).filter((id: number) => id != null);
          }
          return [];
        }).filter((path: number[]) => path.length > 0);
        
        const allMessageIds = allPaths.flat();
        const allConversationMessages = await messageAPI.getMessageByIds(allMessageIds);
        
        await messageAPI.getChainedMessage(messageId);
        edited_from = findLatestMessageInChain(messageId, allConversationMessages);
      }
      
      const index_value_before = path.indexOf(messageId);
      value_before = index_value_before > 0 ? path[index_value_before - 1] : null;

      // Remove message from path and chatMessages
      const index = path.indexOf(messageId);
      if (index !== -1) {
        path.splice(index);
      }

      const index_chat = chatMessages.findIndex(msg => msg.id === messageId);
      if (index_chat !== -1) {
        chatMessages.splice(index_chat);
      }

      if (conversationId === undefined) {
        console.error("Cannot edit message: conversation isnt found");
        return;
      }

      // Edit message di backend
      await messageAPI.editMessage(edited_from);
      
      // Buat userMessage baru dengan konten yang diedit
      const userMessage: ChatMessage = {
        content: content,
        is_user: true,
        edited_from_message_id: edited_from
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      const response = await messageAPI.sendMessage({ 
        content: userMessage.content,
        conversation_id: conversationId,
        is_user: true,
        is_attach_file: fileUpload.uploadedImages.length > 0,
        parent_message_id: value_before,
        edited_from_message_id: edited_from
      });

      setChatMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            id: response.reply.message_id_client,
          };
        }
        return updated;
      });
      
      setTimeout(() => {
        const aiMessage: ChatMessage = { 
          content: response.reply.message,
          is_user: false,
        };
        addValuesToMessageGroup(null, [response.reply.message_id_client, response.reply.message_id_server]);
        setChatMessages(prev => [...prev, aiMessage]);
        setLastChat(response.reply.message_id_server);
        setPath(prev => [...prev, response.reply.message_id_client, response.reply.message_id_server]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error editing message:", error);
      setIsLoading(false);
      // Restore original message if edit fails
      setChatMessages(prev => [...prev, { content, is_user: true, id: messageId }]);
    }
  }, [
    conversationId,
    path,
    chatMessages,
    setChatMessages,
    setIsLoading,
    setLastChat,
    setPath,
    addValuesToMessageGroup,
    fileUpload.uploadedImages.length
  ]);

  return {
    handleSubmit,
    handleEditMessage,
  };
};
