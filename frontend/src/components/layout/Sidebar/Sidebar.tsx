import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { authAPI } from '../../../services';
import SearchPopup from './SearchPopup';
import type { Conversation } from '../../../types/chat.types';

export interface SidebarProps {
  isMinimized: boolean;
  onToggle: () => void;
  user?: {
    username: string;
    email: string;
    id: string;
  };
  activated_conversation?: string;
  chatHistory?: Array<{ id: string; title: string; isActive: boolean }>;
  conversations?: Conversation[];
  onSelectConversation?: (conversation: Conversation) => void;
  onNewChat?: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ 
  isMinimized, 
  onToggle, 
  user, 
  chatHistory, 
  activated_conversation, 
  conversations = [], 
  onSelectConversation, 
  onNewChat 
}) => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: '0px', left: '0px', width: '240px' });
  const [openConversationMenuId, setOpenConversationMenuId] = useState<string | null>(null);
  const [conversationMenuPosition, setConversationMenuPosition] = useState({ top: '0px', left: '0px' });
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileSectionRef = useRef<HTMLDivElement>(null);
  const conversationMenuRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    navigate('/dashboard');
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const handleSearchSelectConversation = (conversation: Conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  const handleSearchNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      handleNewChat();
    }
  };

  const handleLibrary = () => {
    // Navigate to library or show library content
    // TODO: Implement library functionality
  };

  const handleUpgrade = () => {
    // Navigate to upgrade page or show upgrade modal
    // TODO: Implement upgrade functionality
  };

  // Function to measure text width
  const measureTextWidth = (text: string, fontSize: string = '14px', fontFamily: string = 'system-ui, -apple-system, sans-serif') => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = `${fontSize} ${fontFamily}`;
      return context.measureText(text).width;
    }
    return 0;
  };

  const handleProfileClick = () => {
    if (!isProfileDropdownOpen && profileSectionRef.current) {
      const rect = profileSectionRef.current.getBoundingClientRect();
      
      // Calculate dynamic width based on email length
      const baseWidth = 240; // Minimum width
      const emailText = user?.email || '';
      const emailWidth = measureTextWidth(emailText, '14px') + 80; // Add padding for icon and margins
      const dynamicWidth = Math.max(baseWidth, emailWidth);
      
      setDropdownPosition({
        top: `${rect.top - 250}px`, // 8px di atas profile section
        left: `${rect.left}px`,   // Sejajar dengan kiri profile section
        width: `${dynamicWidth}px`  // Dynamic width based on email length
      });
    }
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfileDropdownItem = (_action: string) => {
    setIsProfileDropdownOpen(false);
    // TODO: Implement different actions based on action parameter
    if (_action === 'logout') {
      authAPI.logout().then(() => {
        navigate('/login');
      });
    }
  };

  const handleChatClick = (chatId: string) => {
    // TODO: Navigate to specific chat
    navigate(`/c/${chatId}`);
  };

  // Function to truncate text and determine if tooltip is needed
  const truncateTitle = (title: string | null | undefined, maxLength: number = 30) => {
    // Handle null, undefined, or empty string cases
    if (!title || typeof title !== 'string') {
      return { truncated: 'Untitled', needsTooltip: false };
    }
    
    if (title.length <= maxLength) {
      return { truncated: title, needsTooltip: false };
    }
    return { 
      truncated: title.substring(0, maxLength) + '...', 
      needsTooltip: true 
    };
  };

  // Handle conversation menu click
  const handleConversationMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent conversation selection
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setConversationMenuPosition({
      top: `${rect.bottom + 5}px`,
      left: `${rect.left - 100}px` // Offset to the left
    });
    
    setOpenConversationMenuId(openConversationMenuId === chatId ? null : chatId);
  };

  // Handle conversation menu actions
  const handleConversationAction = (action: string, chatId: string) => {
    switch(action) {
      case 'share':
        // TODO: Implement share functionality
        console.log('Share conversation:', chatId);
        break;
      case 'rename':
        // TODO: Implement rename functionality
        console.log('Rename conversation:', chatId);
        break;
      case 'delete':
        // TODO: Implement delete functionality
        console.log('Delete conversation:', chatId);
        break;
    }
    setOpenConversationMenuId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileSectionRef.current && 
        profileDropdownRef.current &&
        !profileSectionRef.current.contains(event.target as Node) &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }

      // Close conversation menu when clicking outside
      if (
        conversationMenuRef.current &&
        !conversationMenuRef.current.contains(event.target as Node)
      ) {
        setOpenConversationMenuId(null);
      }
    };

    if (isProfileDropdownOpen || openConversationMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, openConversationMenuId]);

  // Keyboard shortcut for search (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Keyboard shortcut for new chat (Ctrl + Shift + O)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        handleNewChat();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`${styles.sidebar} ${isMinimized ? styles.sidebarMinimized : ''}`}>
      {/* Logo and Toggle Button */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <button 
          className={`${styles.toggleButton} ${isMinimized ? styles.toggleButtonMinimized : ''}`}
          onClick={onToggle}
          title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
      {/* Sticky Buttons Container */}
      <div className={styles.stickyButtons}>
        {/* New Chat Button */}
        <button 
          className={`${styles.sidebarButton} ${isMinimized ? styles.sidebarButtonMinimized : ''}`} 
          onClick={handleNewChat}
          title={isMinimized ? "New chat" : ""}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          {!isMinimized && <span>New chat</span>}
          {!isMinimized && <span className={styles.shortcut}>Ctrl + Shift + O</span>}
        </button>

        {/* Search Chats */}
        <button 
          className={`${styles.sidebarButton} ${isMinimized ? styles.sidebarButtonMinimized : ''}`} 
          onClick={handleSearchClick}
          title={isMinimized ? "Search chats" : ""}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          {!isMinimized && <span>Search chats</span>}
          {!isMinimized && <span className={styles.shortcut}>Ctrl + K</span>}
        </button>

        {/* Library */}
        <button 
          className={`${styles.sidebarButton} ${isMinimized ? styles.sidebarButtonMinimized : ''}`} 
          onClick={handleLibrary}
          title={isMinimized ? "Library" : ""}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
          </svg>
          {!isMinimized && <span>Library</span>}
        </button>
      </div>

      {/* Chat History Section - Hidden when minimized */}
      {!isMinimized && (
        <div className={styles.chatHistorySection}>
          <div className={styles.sectionTitle}>Chats</div>

          {chatHistory  ? (
            <div className={styles.chatHistoryList}>
              {chatHistory.map((chat) => {
                const { truncated, needsTooltip } = truncateTitle(chat.title);
                return (
                  <div key={chat.id} className={styles.conversationItem}>
                    <button
                      className={`${styles.sidebarButton} ${chat.id == activated_conversation ? styles.sidebarButtonActive : ''}`}
                      onClick={() => handleChatClick(chat.id)}
                      title={needsTooltip && chat.title ? chat.title : undefined}
                    >
                      <span className={styles.chatTitle}>{truncated}</span>
                    </button>
                    <button
                      className={styles.conversationMenuButton}
                      onClick={(e) => handleConversationMenuClick(e, chat.id)}
                      title="More options"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                    
                    {/* Conversation Menu Dropdown */}
                    {openConversationMenuId === chat.id && (
                      <div 
                        className={styles.conversationMenu}
                        ref={conversationMenuRef}
                        style={{
                          position: 'fixed',
                          top: conversationMenuPosition.top,
                          left: conversationMenuPosition.left,
                          zIndex: 10000
                        }}
                      >
                        <div 
                          className={styles.conversationMenuItem}
                          onClick={() => handleConversationAction('share', chat.id)}
                        >
                          <div className={styles.conversationMenuIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                            </svg>
                          </div>
                          <span>Share</span>
                        </div>
                        <div 
                          className={styles.conversationMenuItem}
                          onClick={() => handleConversationAction('rename', chat.id)}
                        >
                          <div className={styles.conversationMenuIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </div>
                          <span>Rename</span>
                        </div>
                        
                        {/* Divider */}
                        <div className={styles.conversationMenuDivider}></div>
                        
                        <div 
                          className={`${styles.conversationMenuItem} ${styles.conversationMenuItemDanger}`}
                          onClick={() => handleConversationAction('delete', chat.id)}
                        >
                          <div className={styles.conversationMenuIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </div>
                          <span>Delete</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <div className={styles.emptyTitle}>No chats yet</div>
              <div className={styles.emptySubtitle}>Start a new conversation to see your chat history here</div>
            </div>
          )}
        </div>
      )}

      {/* Profile Section - Footer */}
      <div className={`${styles.sidebarButton} ${styles.profileSection} ${isMinimized ? styles.sidebarButtonMinimized : ''}`} ref={profileSectionRef} onClick={handleProfileClick}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          {!isMinimized && (
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.username}</div>
              <div className={styles.userStatus}>Free</div>
            </div>
          )}
        </div>
        {!isMinimized && (
          <button className={styles.upgradeButton} onClick={(e) => {
            e.stopPropagation();
            handleUpgrade();
          }}>
            Upgrade
          </button>
        )}

        {/* Profile Dropdown */}
        {isProfileDropdownOpen && (
          <div 
            className={styles.profileDropdown} 
            ref={profileDropdownRef}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }}
          >
            {/* User Account Info */}
            <div className={styles.dropdownItem} onClick={() => handleProfileDropdownItem('account')}>
              <div className={styles.dropdownIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className={styles.dropdownText}>
                <div className={styles.dropdownTitle}>{user?.email}</div>
              </div>
            </div>

            {/* Upgrade Plan */}
            <div className={styles.dropdownItem} onClick={() => handleProfileDropdownItem('upgrade')}>
              <div className={styles.dropdownIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className={styles.dropdownText}>
                <div className={styles.dropdownTitle}>Upgrade plan</div>
              </div>
            </div>

            {/* Personalization */}
            <div className={styles.dropdownItem} onClick={() => handleProfileDropdownItem('personalization')}>
              <div className={styles.dropdownIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className={styles.dropdownText}>
                <div className={styles.dropdownTitle}>Personalization</div>
              </div>
            </div>

            {/* Settings */}
            <div className={styles.dropdownItem} onClick={() => handleProfileDropdownItem('settings')}>
              <div className={styles.dropdownIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
              </div>
              <div className={styles.dropdownText}>
                <div className={styles.dropdownTitle}>Settings</div>
              </div>
            </div>

            {/* Separator */}
            <div className={styles.dropdownSeparator}></div>

            {/* Help */}
            <div className={styles.dropdownItem} onClick={() => handleProfileDropdownItem('help')}>
              <div className={styles.dropdownIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
              </div>
              <div className={styles.dropdownText}>
                <div className={styles.dropdownTitle}>Help</div>
              </div>
              <div className={styles.dropdownArrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>

            {/* Log out */}
            <div className={styles.dropdownItem} onClick={() => handleProfileDropdownItem('logout')}>
              <div className={styles.dropdownIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </div>
              <div className={styles.dropdownText}>
                <div className={styles.dropdownTitle}>Log out</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Popup */}
      <SearchPopup
        isOpen={isSearchOpen}
        onClose={handleSearchClose}
        conversations={conversations}
        onSelectConversation={handleSearchSelectConversation}
        onNewChat={handleSearchNewChat}
      />
    </div>
  );
};

export default Sidebar;
