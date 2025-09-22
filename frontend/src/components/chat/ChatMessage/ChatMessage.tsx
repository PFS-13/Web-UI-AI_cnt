import React from 'react';
import type { Message } from '../../../types/chat.types';
import { formatRelativeTime, getInitials } from '../../../utils/helpers';
import styles from './ChatMessage.module.css';

export interface ChatMessageProps {
  message: Message;
  isOwn?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn = false,
  showAvatar = true,
  showTimestamp = true,
  className = '',
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const messageClasses = [
    styles.message,
    isOwn && styles.ownMessage,
    isUser && styles.userMessage,
    isAssistant && styles.assistantMessage,
    className,
  ].filter(Boolean).join(' ');

  const avatarClasses = [
    styles.avatar,
    isUser && styles.userAvatar,
    isAssistant && styles.assistantAvatar,
  ].filter(Boolean).join(' ');

  return (
    <div className={messageClasses}>
      {showAvatar && !isOwn && (
        <div className={avatarClasses}>
          {isUser ? (
            <span className={styles.userInitials}>
              {getInitials('User')}
            </span>
          ) : (
            <div className={styles.assistantIcon}>
              🤖
            </div>
          )}
        </div>
      )}
      
      <div className={styles.messageContent}>
        <div className={styles.messageBubble}>
          <div className={styles.messageText}>
            {message.content}
          </div>
        </div>
        
        {showTimestamp && (
          <div className={styles.timestamp}>
            {formatRelativeTime(message.created_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
