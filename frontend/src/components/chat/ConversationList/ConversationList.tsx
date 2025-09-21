import React, { useState } from 'react';
import type { Conversation } from '../../../types/chat.types';
import { formatRelativeTime, truncateText } from '../../../utils/helpers';
import { Button } from '../../common';
import styles from './ConversationList.module.css';

export interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onEditConversation?: (conversation: Conversation) => void;
  onNewConversation?: () => void;
  isLoading?: boolean;
  className?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onEditConversation,
  onNewConversation,
  isLoading = false,
  className = '',
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (conversation: Conversation) => {
    setEditingId(conversation.conversation_id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = () => {
    if (editingId && editTitle.trim() && onEditConversation) {
      const conversation = conversations.find(c => c.conversation_id === editingId);
      if (conversation) {
        onEditConversation({
          ...conversation,
          title: editTitle.trim(),
        });
      }
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (onDeleteConversation) {
      onDeleteConversation(conversationId);
    }
  };

  const containerClasses = [
    styles.container,
    className,
  ].filter(Boolean).join(' ');

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={styles.header}>
        <h2 className={styles.title}>Conversations</h2>
        {onNewConversation && (
          <Button
            onClick={onNewConversation}
            variant="primary"
            size="small"
            className={styles.newButton}
          >
            + New
          </Button>
        )}
      </div>

      <div className={styles.list}>
        {conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyText}>No conversations yet</p>
            <p className={styles.emptySubtext}>
              Start a new conversation to get started
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const isActive = conversation.conversation_id === currentConversationId;
            const isEditing = editingId === conversation.conversation_id;

            return (
              <div
                key={conversation.conversation_id}
                className={`${styles.conversationItem} ${isActive ? styles.active : ''}`}
                onClick={() => !isEditing && onSelectConversation(conversation)}
              >
                <div className={styles.conversationContent}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleEditSave}
                      className={styles.editInput}
                      autoFocus
                    />
                  ) : (
                    <>
                      <h3 className={styles.conversationTitle}>
                        {truncateText(conversation.title, 30)}
                      </h3>
                      <p className={styles.conversationTime}>
                        {formatRelativeTime(conversation.last_message)}
                      </p>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className={styles.actions}>
                    {onEditConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(conversation);
                        }}
                        className={styles.actionButton}
                        title="Edit conversation"
                      >
                        ✏️
                      </button>
                    )}
                    {onDeleteConversation && (
                      <button
                        onClick={(e) => handleDelete(e, conversation.conversation_id)}
                        className={styles.actionButton}
                        title="Delete conversation"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
