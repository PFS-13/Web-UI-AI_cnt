import React from 'react';
import styles from '../../pages/Dashboard/Dashboard.module.css';

interface ChatMessage {
  id?: number;
  content: string;
  is_user: boolean;
  is_edited?: boolean;
  edited_from_message_id?: number;
}

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  onMessageAction?: (messageId: number, action: string) => void;
  onChangePath?: (messageId: number, type: string, edited_from_message_id?: number) => void;
  OnEditMessage?: (messageId: number, content: string, is_edited?: boolean) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  messagesContainerRef,
  onMessageAction,
  onChangePath,
  OnEditMessage
}) => {
  return (
  <div ref={messagesContainerRef} className={styles.messagesContainer}>
    <div className={styles.messagesWrapper}>
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`${styles.message} ${message.is_user ? styles.userMessage : styles.aiMessage}`}
        >
          <div className={styles.messageContent}>
             {message.content}
          </div>
          
          {/* Edit indicators */}
            {message.is_edited && (
              <span 
                className={styles.editedLabel}
                onClick={() => onChangePath?.(message.id!, 'next')}
              >
                &gt; {/* simbol '>' */}
              </span>
            )}
            {message.edited_from_message_id && (
              <span 
                className={styles.editedLabel}
                onClick={() => onChangePath?.(message.id!, 'prev', message.edited_from_message_id)}
              >
                &lt; {/* simbol '<' */}
              </span>
            )}

          {/* User Message Actions */}
          {message.is_user && (
            <div className={styles.messageActions}>
              <button 
                className={styles.actionButton}
                onClick={() => OnEditMessage?.(message.id!, "Hewan apa yang berkaki 6?", message.is_edited)}
                title="Edit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.09H5v-1.92l8.06-8.06 1.92 1.92L5.92 19.34zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                </svg>
              </button>
            </div>
          )}

          {/* AI Message Actions */}
          {!message.is_user && (
            <div className={styles.messageActions}>
              <button 
                className={styles.actionButton}
                onClick={() => onMessageAction?.(message.id!, 'copy')}
                title="Copy"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-9h3V2H5v5h2V5zm11.5 6c-1.24 0-2.25-1.01-2.25-2.25S15.26 8.5 16.5 8.5s2.25 1.01 2.25 2.25S17.74 13.5 16.5 13.5zM7 16h3v2H7v-2zm0-8h3v2H7V8z"/>
                </svg>
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => onMessageAction?.(message.id!, 'edit')}
                title="Edit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 16V5h9v14H6zm8-12h-5v2h5V7zm0 4h-5v2h5v-2zm0 4h-5v2h5v-2z"/>
                </svg>
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => onMessageAction?.(message.id!, 'like')}
                title="Like"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => onMessageAction?.(message.id!, 'regenerate')}
                title="Regenerate"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => onMessageAction?.(message.id!, 'more')}
                title="More"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
      
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

export default MessageList;
