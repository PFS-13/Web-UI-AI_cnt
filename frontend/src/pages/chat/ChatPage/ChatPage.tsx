import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatInput } from '../../../components/chat';
import { useAuth } from '../../../hooks';
import type { Message, Conversation } from '../../../types/chat.types';
import { conversationAPI } from '../../../services/api';
import styles from './ChatPage.module.css';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const data = await conversationAPI.getConversationsByUserId(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages(conversation.messages || []);
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
          last_message: '',
          messages: [],
          created_at: new Date().toISOString(),
        };
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversation || !user) return;

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation.conversation_id,
      content,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          conversation_id: currentConversation.conversation_id,
          content: `I received your message: "${content}". This is a simulated response. In a real implementation, this would call an AI API.`,
          role: 'assistant',
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ChatGPT Sidebar */}
      <div className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={handleNewConversation}
          className={styles.newChatButton}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5V19M5 12H19"/>
          </svg>
          New chat
        </button>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21L16.65 16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search chats" 
              className={styles.searchField}
            />
            <div className={styles.searchShortcut}>Ctrl + K</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className={styles.navigationSection}>
          <div className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Library</span>
          </div>
          
          <div className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16,18 22,12 16,6"/>
              <polyline points="8,6 2,12 8,18"/>
            </svg>
            <span>Codex</span>
          </div>
          
          <div className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21 5,3"/>
            </svg>
            <span>Sora</span>
          </div>
          
          <div className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>GPTs</span>
          </div>
          
          <div className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span>Scholar GPT</span>
          </div>
          
          <div className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span>Scholar AI</span>
          </div>
          
          <div className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Headshot Pro</span>
          </div>
        </div>

        {/* Separator */}
        <div className={styles.separator}></div>

        {/* New Project */}
        <div className={styles.navItem}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span>New project</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>

        {/* Recent Chats */}
        <div className={styles.recentChats}>
          {conversations.map((conversation) => (
            <div
              key={conversation.conversation_id}
              className={`${styles.chatItem} ${
                currentConversation?.conversation_id === conversation.conversation_id 
                  ? styles.active 
                  : ''
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className={styles.chatTitle}>{conversation.title}</span>
            </div>
          ))}
        </div>

        {/* See More */}
        <div className={styles.seeMore}>
          <span>See more</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </div>

        {/* User Profile */}
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            <span>OY</span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>oh yeah</span>
            <span className={styles.userStatus}>Plus</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.main}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.modelSelector}>
            <span className={styles.modelName}>ChatGPT 5</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
          <div className={styles.topActions}>
            <button className={styles.topActionButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {currentConversation ? (
          <>
            <div className={styles.messagesContainer}>
              <div className={styles.messages}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwn={message.role === 'user'}
                  />
                ))}
                
                {isTyping && (
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>AI is typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className={styles.inputContainer}>
              <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={setIsTyping}
                placeholder="Message ChatGPT"
                disabled={isTyping}
                showSendButton={false}
              />
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.greeting}>
              <h1 className={styles.greetingText}>How can I help, {user?.username || 'Human'}?</h1>
            </div>
            <div className={styles.inputContainer}>
              <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={setIsTyping}
                placeholder="Message ChatGPT"
                disabled={isTyping}
                showSendButton={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
