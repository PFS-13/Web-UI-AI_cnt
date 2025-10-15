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
  conversations: any[];
  chatHistory: Array<{ id: string; title: string; isActive: boolean }>;
  
  // Refs
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  
  // Actions
  setInputValue: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleChangePath: (messageId: number, type: string) => void;
  handleEditMessage: (messageId: number, content: string, is_edited?: boolean) => void;
  handleSelectConversation: (conversation: any) => void;
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
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChat, setLastChat] = useState<number | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [allMessagesId, setAllMessagesId] = useState<number[][]>([]);
  // const [allPath, setAllPath] = useState<number[][]>([]);
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const fileUpload = useFileUpload();
  const conversation = useConversation(userId);
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

  


// Removed findPathIndex as it's no longer needed with path-based navigation

const addValuesToMessageGroup = (messageId: number | null, newValues: number[]) => {
  setAllMessagesId(prev => {
    if (messageId === null) {
      return [...prev, newValues];
    }

    // kalau bukan null → tambahkan ke group yang mengandung messageId
    return prev.map(group =>
      group.includes(messageId)
        ? [...group, ...newValues]
        : group
    );
  });
};




const handleChangePath = async (message_id: number, type: string) => {
  try {
    console.log(`Changing path for message ${message_id}, type: ${type}`);
    
    // Get all paths for this conversation
    const allPathsResponse = await messageAPI.getPathMessages(conversationId!);
    const allPaths: number[][] = allPathsResponse.map((pathData: any) => {
      if (pathData.path_messages && Array.isArray(pathData.path_messages)) {
        // Extract IDs from message objects
        return pathData.path_messages.map((msg: any) => msg.id).filter((id: any) => id != null);
      }
      return [];
    }).filter((path: number[]) => path.length > 0);
    
    console.log("All available paths:", allPaths);
    
    // Find current path containing this message
    const currentPath = allPaths.find(path => path.includes(message_id));
    if (!currentPath) {
      console.log(`No path found containing message ${message_id}`);
      return;
    }
    
    const currentPathIndex = allPaths.indexOf(currentPath);
    console.log(`Current path index: ${currentPathIndex}, path:`, currentPath);
    
    let targetPath: number[];
    
    if (type === 'next') {
      // Navigate to next path
      if (currentPathIndex + 1 >= allPaths.length) {
        console.log("Already at latest path");
        return;
      }
      targetPath = allPaths[currentPathIndex + 1];
    } else {
      // Navigate to previous path
      if (currentPathIndex - 1 < 0) {
        console.log("Already at original path");
        return;
      }
      targetPath = allPaths[currentPathIndex - 1];
    }
    
    console.log(`Target path:`, targetPath);
    
    // Update path to show target path
    setPath(targetPath);
    
    console.log("Updated path:", targetPath);

  } catch (error) {
    console.error("Error in handleChangePath:", error);
  }
};

const handleEditMessage = async (messageId: number, content: string, is_edited?: boolean) => {
  // Inline form edit sudah dihandle di MessageList component
  // Fungsi ini hanya untuk memproses edit yang sudah dikonfirmasi
  try {
    let value_before = null;
    let edited_from = messageId;
    
    if (is_edited) {
      const chain = await messageAPI.getChainedMessage(messageId);
      edited_from = chain && chain.chain && Array.isArray(chain.chain) && chain.chain.length > 0 
        ? chain.chain[chain.chain.length - 1] 
        : messageId;    
    }
    
    const index_value_before = path.indexOf(messageId);
    value_before = index_value_before > 0 ? path[index_value_before - 1] : null;

    // Hapus message dari path dan chatMessages
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
    
    // Kirim message yang diedit ke AI
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
}



  useEffect(() => {
    console.log("the path", path);
  }, [path]);

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

const handleDeleteConversation = async (conversationId: string) => {
  console.log("delete conversation", conversationId);
  try {
    await conversation.deleteConversation(conversationId);
  }
  catch (error) {
    console.error('Failed to delete conversation:', error);
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
          });

          setChatMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0) {updated[lastIndex] = {
              ...updated[lastIndex],
              id: response.reply.message_id_client,};}return updated;});
          
          // setTimeout(() => {
            const aiMessage: ChatMessage = { 
              content: response.reply.message,
              is_user: false,
            };
            addValuesToMessageGroup(lastChat || -1, [response.reply.message_id_client, response.reply.message_id_server]);

            setChatMessages(prev => [...prev, aiMessage]);
            setLastChat(response.reply.message_id_server);
            setIsLoading(false);
          // }, 1000);
          
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
        // setTimeout(() => {
          const aiMessage: ChatMessage = { 
            content: response.reply.message,
            is_user: false,
          };

          addValuesToMessageGroup(lastChat || -1, [response.reply.message_id_client, response.reply.message_id_server]);
          setChatMessages(prev => [...prev, aiMessage]);
          setLastChat(response.reply.message_id_server);
          setPath(prev => [...prev, response.reply.message_id_client, response.reply.message_id_server]);
          setIsLoading(false);
        // }, 1000);
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
    conversationId,
    
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
    handleChangePath,
    handleEditMessage,
    handleSelectConversation,
    handleNewChat,
    scrollToBottom,
    handleDeleteConversation,
    
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
