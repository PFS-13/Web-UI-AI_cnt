import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isMinimized: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMinimized, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLibrary = () => {
    // Navigate to library or show library content
    console.log('Library clicked');
  };

  return (
    <div className={`${styles.sidebar} ${isMinimized ? styles.sidebarMinimized : ''}`}>
      {/* Logo and Toggle Button */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <button 
          className={`${styles.toggleButton} ${isMinimized ? styles.toggleButtonMinimized : ''}`}
          onClick={onToggle}
          title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <button 
        className={`${styles.newChatButton} ${isMinimized ? styles.newChatButtonMinimized : ''}`} 
        onClick={handleNewChat}
        title={isMinimized ? "New chat" : ""}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        {!isMinimized && <span>New chat</span>}
        {!isMinimized && <span className={styles.shortcut}>Ctrl + Shift + O</span>}
      </button>

      {/* Search Chats */}
      {!isMinimized && (
        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.searchIcon}>
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search chats"
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchField}
            />
          </div>
        </div>
      )}

      {/* Library */}
      <div className={styles.librarySection}>
        <button 
          className={`${styles.libraryButton} ${isMinimized ? styles.libraryButtonMinimized : ''}`} 
          onClick={handleLibrary}
          title={isMinimized ? "Library" : ""}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
          </svg>
          {!isMinimized && <span>Library</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
