import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

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
}


const Sidebar: React.FC<SidebarProps> = ({ isMinimized, onToggle, user, chatHistory }) => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: '0px', left: '0px', width: '200px' });
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileSectionRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    navigate('/dashboard');
  };

  const handleSearchClick = () => {
    // Navigate to search or show search functionality
    // TODO: Implement search functionality
  };

  const handleLibrary = () => {
    // Navigate to library or show library content
    // TODO: Implement library functionality
  };

  const handleUpgrade = () => {
    // Navigate to upgrade page or show upgrade modal
    // TODO: Implement upgrade functionality
  };

  const handleProfileClick = () => {
    if (!isProfileDropdownOpen && profileSectionRef.current) {
      const rect = profileSectionRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: `${rect.top - 250}px`, // 8px di atas profile section
        left: `${rect.left}px`,   // Sejajar dengan kiri profile section
        width: `${rect.width}px`  // Lebar sama dengan profile section
      });
    }
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfileDropdownItem = (_action: string) => {
    setIsProfileDropdownOpen(false);
    // TODO: Implement different actions based on action parameter
  };

  const handleChatClick = (chatId: string) => {
    // TODO: Navigate to specific chat
    navigate(`/c/${chatId}`);
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
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Keyboard shortcut for search (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        handleSearchClick();
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
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  className={`${styles.sidebarButton} ${chat.id == activated_conversation ? styles.sidebarButtonActive : ''}`}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <span>{chat.title}</span>
                </button>
              ))}
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
    </div>
  );
};

export default Sidebar;
