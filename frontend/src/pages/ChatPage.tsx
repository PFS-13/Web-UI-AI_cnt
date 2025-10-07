import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import ChatLayout from '../components/chat/ChatLayout';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { UserProfileInfo } from '../components/common';
import styles from './Dashboard/Dashboard.module.css';

export interface ChatPageProps {
  mode: 'new' | 'existing';
}

const ChatPage: React.FC<ChatPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Chat functionality
  const {
    chatMessages,
    inputValue,
    isLoading,
    messagesContainerRef,
    handleInputChange,
    handleKeyDown,
    handleSubmit,
    handleSelectConversation,
    handleNewChat,
    // File upload
    imagePreviews,
    selectedImageIndex,
    isModalOpen,
    isDragging,
    isDragOver,
    dropZoneRef,
    fileInputRef,
    handleImageUpload,
    removeImage,
    openImageModal,
    closeImageModal,
    nextImage,
    prevImage,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    // Conversation
    conversations,
    chatHistory,
  } = useChat({
    mode,
    conversationId: id,
    userId: user?.id,
  });

  // Sidebar state
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isAttachDropdownOpen, setIsAttachDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const attachContainerRef = React.useRef<HTMLDivElement>(null);

  // Handle attach dropdown
  const handleAttachClick = () => {
    if (!isAttachDropdownOpen && attachContainerRef.current) {
      const buttonRect = attachContainerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200;
      
      const wouldOverflowBottom = buttonRect.bottom + dropdownHeight > viewportHeight;
      const wouldOverflowTop = buttonRect.top - dropdownHeight < 0;
      
      if (wouldOverflowBottom && !wouldOverflowTop) {
        setDropdownPosition('top');
      } else if (wouldOverflowTop && !wouldOverflowBottom) {
        setDropdownPosition('bottom');
      } else if (wouldOverflowBottom && wouldOverflowTop) {
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        setDropdownPosition(spaceBelow > spaceAbove ? 'bottom' : 'top');
      } else {
        setDropdownPosition('bottom');
      }
    }
    
    setIsAttachDropdownOpen(!isAttachDropdownOpen);
  };

  const handleAttachOptionClick = (option: string) => {
    if (option === 'photos') {
      fileInputRef.current?.click();
    }
    setIsAttachDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAttachDropdownOpen && attachContainerRef.current) {
        if (!attachContainerRef.current.contains(event.target as Node)) {
          setIsAttachDropdownOpen(false);
        }
      }
    };

    if (isAttachDropdownOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isAttachDropdownOpen]);


  return (
    <ChatLayout
      user={user}
      conversations={conversations}
      chatHistory={chatHistory}
      activatedConversation={id}
      isSidebarMinimized={isSidebarMinimized}
      onToggleSidebar={() => setIsSidebarMinimized(!isSidebarMinimized)}
      onSelectConversation={handleSelectConversation}
      onNewChat={handleNewChat}
    >
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1 className={`${styles.chatTitle} text-blue-500 font-bold`}>WebUI AI</h1>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.dropdownIcon}>
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
        <div className={styles.topBarRight}>
          <button className={styles.shareButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            Share
          </button>
        </div>
      </header>

      {/* Chat Content */}
      <main className={chatMessages.length === 0 ? styles.chatContent : styles.chatContentWithMessages}>
        {chatMessages.length === 0 ? (
          <div className={styles.welcomeMessage}>
            <h2>How can I help, {user?.username}</h2>
            {mode === 'new' && (
              <div className={styles.profileSection}>
                <UserProfileInfo />
              </div>
            )}
          </div>
        ) : (
          <MessageList
            messages={chatMessages}
            isLoading={isLoading}
                 messagesContainerRef={messagesContainerRef as React.RefObject<HTMLDivElement>}
          />
        )}
        
        <ChatInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSubmit={handleSubmit}
          onAttachClick={handleAttachClick}
          onAttachOptionClick={handleAttachOptionClick}
          isAttachDropdownOpen={isAttachDropdownOpen}
          dropdownPosition={dropdownPosition}
          attachContainerRef={attachContainerRef as React.RefObject<HTMLDivElement>}
          fileInputRef={fileInputRef}
          hasMessages={chatMessages.length > 0}
          imagePreviews={imagePreviews}
          selectedImageIndex={selectedImageIndex}
          isModalOpen={isModalOpen}
          isDragging={isDragging}
          isDragOver={isDragOver}
          dropZoneRef={dropZoneRef}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onOpenImageModal={openImageModal}
          onCloseImageModal={closeImageModal}
          onNextImage={nextImage}
          onPrevImage={prevImage}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      </main>
    </ChatLayout>
  );
};

export default ChatPage;
