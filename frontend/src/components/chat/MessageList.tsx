import React, { useState, useEffect, useRef } from 'react';
import styles from '../../pages/Dashboard/Dashboard.module.css';
import ChainMessageControls from './ChainMessageControls';
import TypingEffect from './TypingEffect';
import MarkdownRenderer from './MarkdownRenderer';
import { MarkdownProvider, useMarkdownContext } from './MarkdownRenderer/MarkdownContext';
import { messageAPI } from '../../services/api/message.api';

interface ChatMessage {
  id?: number;
  content: string;
  is_user: boolean;
  is_edited?: boolean;
  edited_from_message_id?: number;
}

interface ChainData {
  [messageId: number]: {
    currentIndex: number;
    totalChains: number;
  };
}

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  conversationId?: string;
  onChangePath?: (messageId: number, type: string, edited_from_message_id?: number) => void;
  OnEditMessage?: (messageId: number, content: string, is_edited?: boolean) => void;
}

// Internal component that uses MarkdownContext
const MessageListInternal: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  messagesContainerRef,
  conversationId,
  onChangePath,
  OnEditMessage
}) => {
  const { resetNumbering } = useMarkdownContext();
  const [chainData, setChainData] = useState<ChainData>({});
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Load chain data based on path system
  useEffect(() => {
    const loadChainData = async () => {
      if (!conversationId) return;
      
      try {
        console.log('Loading path data for conversation:', conversationId);
        
        // Get all paths for this conversation
        const allPathsResponse = await messageAPI.getPathMessages(conversationId);
        console.log('All paths response:', allPathsResponse);
        
        // Extract paths from response - Backend returns array of objects with path_messages
        const allPaths: number[][] = allPathsResponse.map((pathData: any) => {
          if (pathData.path_messages && Array.isArray(pathData.path_messages)) {
            // Extract IDs from message objects
            return pathData.path_messages.map((msg: any) => msg.id).filter((id: any) => id != null);
          }
          return [];
        }).filter((path: number[]) => path.length > 0);
        
        console.log('All paths:', allPaths);
        
        // Find chains for each message - only for edited messages
        for (const message of messages) {
          if (message.id) {
            console.log(`Checking message ${message.id}:`, {
              is_edited: message.is_edited,
              edited_from_message_id: message.edited_from_message_id,
              content: message.content.substring(0, 50) + '...'
            });
            
            // Only check for chains if message is edited or has edited_from_message_id
            if (message.is_edited || message.edited_from_message_id) {
              // Find all paths that contain this message
              const pathsContainingMessage = allPaths.filter(path => 
                path.includes(message.id!)
              );
              
              console.log(`Paths containing message ${message.id}:`, pathsContainingMessage);
              
              // If message is in multiple paths, it has chains
              if (pathsContainingMessage.length > 1) {
                console.log(`Setting chain data for message ${message.id}:`, {
                  currentIndex: 1,
                  totalChains: pathsContainingMessage.length
                });
                
                setChainData(prev => ({
                  ...prev,
                  [message.id!]: {
                    currentIndex: 1, // Default to first chain
                    totalChains: pathsContainingMessage.length
                  }
                }));
              } else {
                console.log(`Message ${message.id} has no chains (only in ${pathsContainingMessage.length} path)`);
              }
            } else {
              console.log(`Message ${message.id} is not edited, skipping chain check`);
            }
          }
        }
      } catch (error) {
        console.error('Error loading path data:', error);
      }
    };

    loadChainData();
  }, [messages, conversationId]);

  // Detect new AI messages for typing effect
  useEffect(() => {
    const currentMessageCount = messages.length;
    const lastMessage = messages[messages.length - 1];
    
    // Only trigger typing effect if there's a new message and it's an AI message
    // AND if lastMessageCountRef has been initialized (not 0 on first load)
    if (currentMessageCount > lastMessageCountRef.current && 
        lastMessageCountRef.current > 0 && // Pastikan bukan first load
        lastMessage && 
        !lastMessage.is_user && 
        lastMessage.id) {
      
      // Reset state terlebih dahulu untuk memastikan clean start
      setIsNewMessage(false);
      setTypingMessageId(null);
      
      // Set state untuk message baru dengan delay minimal
      setTimeout(() => {
        setIsNewMessage(true);
        setTypingMessageId(lastMessage.id!);
      }, 0);
      
      lastMessageCountRef.current = currentMessageCount;
    } else if (lastMessageCountRef.current === 0) {
      // Initialize lastMessageCountRef pada first load tanpa trigger typing
      lastMessageCountRef.current = currentMessageCount;
    }
  }, [messages]);

  // Auto scroll during AI typing
  useEffect(() => {
    if (isTyping && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollToBottom = () => {
        container.scrollTop = container.scrollHeight;
      };

      // Scroll immediately when typing starts
      scrollToBottom();

      // Set up interval to scroll during typing
      const scrollInterval = setInterval(scrollToBottom, 100);

      return () => {
        clearInterval(scrollInterval);
      };
    }
  }, [isTyping, messagesContainerRef]);

  // Auto scroll when new message is added
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }, [messages.length, messagesContainerRef]);

  // Reset numbering for new conversations
  useEffect(() => {
    if (messages.length === 0) {
      resetNumbering();
    }
  }, [messages.length, resetNumbering]);

  const handleCopyMessage = async (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      try {
        await navigator.clipboard.writeText(message.content);
        console.log('Message copied to clipboard:', message.content);
      } catch (err) {
        console.error('Failed to copy message:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = message.content;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          console.log('Message copied to clipboard (fallback):', message.content);
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleEditMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      console.log('Edit message clicked:', { messageId, content: message.content, is_edited: message.is_edited });
      setEditingMessageId(messageId);
      setEditContent(message.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessageId && OnEditMessage && editContent.trim()) {
      const message = messages.find(m => m.id === editingMessageId);
      if (message) {
        OnEditMessage(editingMessageId, editContent.trim(), message.is_edited);
      }
    }
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleTypingComplete = () => {
    setTypingMessageId(null);
    setIsNewMessage(false);
    setIsTyping(false);
  };

  const handleTypingStart = () => {
    setIsTyping(true);
  };

  const handleNavigateLeft = async (messageId: number) => {
    try {
      console.log(`Navigating left from message ${messageId}`);
      
      // Get all paths for this conversation
      const allPathsResponse = await messageAPI.getPathMessages(conversationId!);
      const allPaths: number[][] = allPathsResponse.map((pathData: any) => {
        if (pathData.path_messages && Array.isArray(pathData.path_messages)) {
          // Extract IDs from message objects
          return pathData.path_messages.map((msg: any) => msg.id).filter((id: any) => id != null);
        }
        return [];
      }).filter((path: number[]) => path.length > 0);
      
      // Find current path containing this message
      const currentPath = allPaths.find(path => path.includes(messageId));
      if (!currentPath) {
        console.log(`No path found containing message ${messageId}`);
        return;
      }
      
      // Find previous path (path that shares common ancestor but is different)
      const currentPathIndex = allPaths.indexOf(currentPath);
      const previousPath = allPaths[currentPathIndex - 1];
      
      if (previousPath) {
        console.log(`Navigating to previous path:`, previousPath);
        onChangePath?.(messageId, 'prev');
      } else {
        console.log(`No previous path available`);
      }
    } catch (error) {
      console.error(`Error navigating left from message ${messageId}:`, error);
    }
  };

  const handleNavigateRight = async (messageId: number) => {
    try {
      console.log(`Navigating right from message ${messageId}`);
      
      // Get all paths for this conversation
      const allPathsResponse = await messageAPI.getPathMessages(conversationId!);
      const allPaths: number[][] = allPathsResponse.map((pathData: any) => {
        if (pathData.path_messages && Array.isArray(pathData.path_messages)) {
          // Extract IDs from message objects
          return pathData.path_messages.map((msg: any) => msg.id).filter((id: any) => id != null);
        }
        return [];
      }).filter((path: number[]) => path.length > 0);
      
      // Find current path containing this message
      const currentPath = allPaths.find(path => path.includes(messageId));
      if (!currentPath) {
        console.log(`No path found containing message ${messageId}`);
        return;
      }
      
      // Find next path (path that shares common ancestor but is different)
      const currentPathIndex = allPaths.indexOf(currentPath);
      const nextPath = allPaths[currentPathIndex + 1];
      
      if (nextPath) {
        console.log(`Navigating to next path:`, nextPath);
        onChangePath?.(messageId, 'next');
      } else {
        console.log(`No next path available`);
      }
    } catch (error) {
      console.error(`Error navigating right from message ${messageId}:`, error);
    }
  };
  return (
  <div ref={messagesContainerRef} className={styles.messagesContainer}>
    <div className={styles.messagesWrapper}>
      {messages.map((message) => {
        const chainInfo = message.id ? chainData[message.id] : null;
        
        return (
          <div 
            key={message.id} 
            className={`${styles.message} ${styles.messageContainer} ${message.is_user ? styles.userMessage : styles.aiMessage}`}
          >
            <div className={styles.messageContent}>
              {editingMessageId === message.id ? (
                // Edit Form - tampilkan form edit inline
                <div className={styles.editForm}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.editTextarea}
                    placeholder="Edit your message..."
                    autoFocus
                    rows={3}
                  />
                  <div className={styles.editButtons}>
                    <button 
                      className={styles.cancelEditButton}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                    <button 
                      className={styles.saveEditButton}
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim() || editContent === message.content}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                // Normal Message Bubble
                <>
                  <div className={styles.messageBubble}>
                    {message.is_user ? (
                      <MarkdownRenderer text={message.content} messageId={message.id} />
                    ) : (
                      <TypingEffect
                        text={message.content}
                        speed={4}
                        isNewMessage={isNewMessage && typingMessageId === message.id}
                        onComplete={handleTypingComplete}
                        onStart={handleTypingStart}
                      />
                    )}
                  </div>
                  
                  {/* Chain Message Controls - untuk semua messages */}
                  {message.id && (
                    <ChainMessageControls
                      messageId={message.id}
                      isUser={message.is_user}
                      currentChainIndex={chainInfo?.currentIndex || 1}
                      totalChains={chainInfo?.totalChains || 1}
                      onCopy={handleCopyMessage}
                      onEdit={message.is_user ? handleEditMessage : undefined}
                      onNavigateLeft={handleNavigateLeft}
                      onNavigateRight={handleNavigateRight}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className={`${styles.message} ${styles.aiMessage}`}>
          <div className={styles.loadingMessage}>
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
);

};

// Main component with MarkdownProvider
const MessageList: React.FC<MessageListProps> = (props) => {
  return (
    <MarkdownProvider>
      <MessageListInternal {...props} />
    </MarkdownProvider>
  );
};

export default MessageList;
