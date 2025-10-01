import React, { useState, useEffect } from 'react';
import { ConversationList } from '../../../components/chat';
import { Button, Input } from '../../../components/common';
import { useAuth } from '../../../hooks';
import type { Conversation } from '../../../types/chat.types';
import { conversationAPI } from '../../../services/api';
import { formatRelativeTime } from '../../../utils/helpers';
import styles from './ConversationHistory.module.css';

const ConversationHistory: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await conversationAPI.getConversationsByUserId(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conversation =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConversations(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await conversationAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
      
      if (selectedConversation?.conversation_id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleEditConversation = async (conversation: Conversation) => {
    try {
      await conversationAPI.editConversation({
        conversation_id: conversation.conversation_id,
        title: conversation.title,
      });
      
      setConversations(prev => 
        prev.map(c => 
          c.conversation_id === conversation.conversation_id 
            ? conversation 
            : c
        )
      );
    } catch (error) {
      console.error('Failed to edit conversation:', error);
    }
  };

  const handleNewConversation = async () => {
    if (!user) return;
    
    try {
      const response = await conversationAPI.createConversation({
        user_id: user.id,
      });
      
      if (response.conversation_id) {
        const newConversation: Conversation = {
          conversation_id: response.conversation_id,
          title: 'New Conversation',
          user_id: user.id,
          last_updated: new Date().toISOString(),
          messages: [],
          created_at: new Date().toISOString(),
        };
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Conversation History</h1>
        <div className={styles.headerActions}>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            startIcon="🔍"
            className={styles.searchInput}
          />
          <Button
            onClick={handleNewConversation}
            variant="primary"
            size="medium"
          >
            + New Conversation
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <ConversationList
            conversations={filteredConversations}
            currentConversationId={selectedConversation?.conversation_id}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            onEditConversation={handleEditConversation}
            isLoading={isLoading}
          />
        </div>

        <div className={styles.main}>
          {selectedConversation ? (
            <div className={styles.conversationDetails}>
              <div className={styles.conversationHeader}>
                <h2 className={styles.conversationTitle}>
                  {selectedConversation.title}
                </h2>
                <div className={styles.conversationMeta}>
                  <span className={styles.createdAt}>
                    Created: {formatRelativeTime(selectedConversation.created_at)}
                  </span>
                  <span className={styles.lastMessage}>
                    Last message: {formatRelativeTime(selectedConversation.last_updated || selectedConversation.created_at)}
                  </span>
                </div>
              </div>

              <div className={styles.messagesList}>
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((message) => (
                    <div key={message.id} className={styles.messageItem}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageRole}>
                          {message.role === 'user' ? 'You' : 'AI'}
                        </span>
                        <span className={styles.messageTime}>
                          {formatRelativeTime(message.created_at)}
                        </span>
                      </div>
                      <div className={styles.messageContent}>
                        {message.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyMessages}>
                    <p>No messages in this conversation yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📚</div>
              <h2 className={styles.emptyTitle}>Select a Conversation</h2>
              <p className={styles.emptyText}>
                Choose a conversation from the sidebar to view its details and message history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;
