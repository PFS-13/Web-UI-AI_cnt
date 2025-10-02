import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { UserProfileInfo } from '../../components/common';
import styles from './Dashboard.module.css';
import { conversationAPI, authAPI } from '../../services';
import { messageAPI } from '../../services/api/message.api';
import type { Conversation } from '../../types/chat.types';
import { useNavigate } from 'react-router';

interface ChatMessage {
  id?: number
  content: string;
  is_user: boolean;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAttachDropdownOpen, setIsAttachDropdownOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const attachContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<
      Array<{ id: string; title: string; isActive: boolean }>
    >([]);
  
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        console.log('Current user:', userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) {
        console.log('Dashboard - No user ID available, skipping conversation fetch');
        return;
      }
      
      try {
        const conversationsData = await conversationAPI.getConversationsByUserId(user.id);
        
        // Enhanced: Fetch messages for each conversation to enable search
        const conversationsWithMessages = await Promise.all(
          conversationsData.map(async (conversation: any) => {
            try {
              // Fetch messages for this conversation
              const messagesResponse = await messageAPI.getPathMessages(conversation.conversation_id);
              // Extract messages from ConversationPath array
              const messages = messagesResponse?.flatMap(path => path.path_messages) || [];
              return {
                ...conversation,
                messages: messages || []
              };
            } catch (error) {
              console.warn(`Failed to fetch messages for conversation ${conversation.conversation_id}:`, error);
              return {
                ...conversation,
                messages: []
              };
            }
          })
        );
        
        // Set conversations for SearchPopup (with messages)
        setConversations(conversationsWithMessages);
        
        // Set chat history for sidebar
        const chatHistory = conversationsData.map((item: any) => ({
          id: item.conversation_id,
          title: item.title,
          isActive: false
        }));
  
        setChatHistory(chatHistory);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        // Set empty array if API fails
        setConversations([]);
      }
    };
    fetchConversations();
  }, [user])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea (stretch upward)
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 170); // 170px = 10.625rem
    textarea.style.height = newHeight + 'px';
    
    // Scroll to bottom to show latest content
    textarea.scrollTop = textarea.scrollHeight;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || uploadedImages.length > 0) {
      const userMessage: ChatMessage = {
        content: inputValue.trim(),
        is_user: true,
      };
      setInputValue('');
      setChatMessages(prev => [...prev, userMessage]);
      const conv = await conversationAPI.createConversation({ user_id: user.id });
      const response = await messageAPI.sendMessage({ 
        content: userMessage.content,
        conversation_id: conv.conversation_id!,
        is_user: true,
        is_attach_file: uploadedImages.length > 0,
        parent_message_id: null,
        edited_from_message_id: null
        });
      // console.log('AI response:', response);
      setTimeout(() => {
        const aiMessage: ChatMessage = { 
          content: response.reply.message,
          is_user: false,
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }, 1000);
      Navigate(`/c/${conv.conversation_id}`);
    }
  };

  const handleAttachClick = () => {
    console.log('Attach button clicked, current state:', isAttachDropdownOpen);
    
    if (!isAttachDropdownOpen && attachContainerRef.current) {
      const buttonRect = attachContainerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200; // Approximate dropdown height
      
      // Check if dropdown would overflow bottom of viewport
      const wouldOverflowBottom = buttonRect.bottom + dropdownHeight > viewportHeight;
      
      // Check if dropdown would overflow top of viewport (if positioned above)
      const wouldOverflowTop = buttonRect.top - dropdownHeight < 0;
      
      // Position dropdown to avoid overflow
      if (wouldOverflowBottom && !wouldOverflowTop) {
        // Dropdown would overflow bottom but not top, position above
        setDropdownPosition('top');
      } else if (wouldOverflowTop && !wouldOverflowBottom) {
        // Dropdown would overflow top but not bottom, position below
        setDropdownPosition('bottom');
      } else if (wouldOverflowBottom && wouldOverflowTop) {
        // Dropdown would overflow both, choose the side with more space
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        setDropdownPosition(spaceBelow > spaceAbove ? 'bottom' : 'top');
      } else {
        // No overflow, default to bottom
        setDropdownPosition('bottom');
      }
    }
    
    setIsAttachDropdownOpen(!isAttachDropdownOpen);
  };

  const handleAttachOptionClick = (option: string) => {
    console.log('Selected option:', option);
    if (option === 'photos') {
      fileInputRef.current?.click();
    }
    // TODO: Implement other options
    setIsAttachDropdownOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const previewPromises: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      // Validasi file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      validFiles.push(file);
      // Buat preview URL
      const previewPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
      previewPromises.push(previewPromise);
    });

           if (validFiles.length > 0) {
             setUploadedImages(prev => [...validFiles, ...prev]);
             
             // Update previews setelah semua file dibaca
             Promise.all(previewPromises).then((previews) => {
               setImagePreviews(prev => [...previews, ...prev]);
             });
           }

    // Reset input value agar bisa upload file yang sama lagi
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
    setIsModalOpen(false);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < imagePreviews.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDragging(false); // Hide drop zone after drop

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload({ target: { files } } as any);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    // Navigate to specific conversation
    window.location.href = `/c/${conversation.conversation_id}`;
  };

  const handleNewChat = () => {
    // Navigate to new chat or create new conversation
    window.location.href = '/dashboard';
  };


  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Close dropdown when clicking outside and adjust position on scroll/resize
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAttachDropdownOpen && attachContainerRef.current) {
        if (!attachContainerRef.current.contains(event.target as Node)) {
          setIsAttachDropdownOpen(false);
        }
      }
    };

    const handleScrollResize = () => {
      if (isAttachDropdownOpen && attachContainerRef.current) {
        const buttonRect = attachContainerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 200; // Approximate dropdown height
        
        // Check if dropdown would overflow bottom of viewport
        const wouldOverflowBottom = buttonRect.bottom + dropdownHeight > viewportHeight;
        
        // Check if dropdown would overflow top of viewport (if positioned above)
        const wouldOverflowTop = buttonRect.top - dropdownHeight < 0;
        
        // Position dropdown to avoid overflow
        if (wouldOverflowBottom && !wouldOverflowTop) {
          // Dropdown would overflow bottom but not top, position above
          setDropdownPosition('top');
        } else if (wouldOverflowTop && !wouldOverflowBottom) {
          // Dropdown would overflow top but not bottom, position below
          setDropdownPosition('bottom');
        } else if (wouldOverflowBottom && wouldOverflowTop) {
          // Dropdown would overflow both, choose the side with more space
          const spaceBelow = viewportHeight - buttonRect.bottom;
          const spaceAbove = buttonRect.top;
          setDropdownPosition(spaceBelow > spaceAbove ? 'bottom' : 'top');
        } else {
          // No overflow, default to bottom
          setDropdownPosition('bottom');
        }
      }
    };

    if (isAttachDropdownOpen) {
      // Add event listener with a small delay to avoid conflicts
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScrollResize);
        window.addEventListener('resize', handleScrollResize);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', handleScrollResize);
        window.removeEventListener('resize', handleScrollResize);
      };
    }
  }, [isAttachDropdownOpen]);

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  // Close modal with ESC key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeImageModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen]);

  // Global drag events to detect when user starts dragging files
  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only hide if we're leaving the document entirely
      if (!e.relatedTarget || e.relatedTarget === document.body) {
        setIsDragging(false);
        setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setIsDragOver(false);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar 
        isMinimized={isSidebarMinimized} 
        onToggle={toggleSidebar}
        user={user}
        chatHistory={chatHistory}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className={`${styles.mainContent} ${isSidebarMinimized ? styles.mainContentExpanded : ''}`}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1 className={`${styles.chatTitle} text-blue-500 font-bold`}>WebUI AI</h1>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.dropdownIcon}>
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.shareButton} onClick={handleShareClick}>
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
              <div className={styles.profileSection}>
                <UserProfileInfo />
              </div>
            </div>
          ) : (
            <div ref={messagesContainerRef} className={styles.messagesContainer}>
              <div className={styles.messagesWrapper}>
                {chatMessages.map((message) => (
                <div key={message.id} className={`${styles.message} ${message.is_user ? styles.userMessage : styles.aiMessage}`}>
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                  {!message.is_user && (
                    <div className={styles.messageActions}>
                      <button className={styles.actionButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-9h3V2H5v5h2V5zm11.5 6c-1.24 0-2.25-1.01-2.25-2.25S15.26 8.5 16.5 8.5s2.25 1.01 2.25 2.25S17.74 13.5 16.5 13.5zM7 16h3v2H7v-2zm0-8h3v2H7V8z"/>
                        </svg>
                      </button>
                      <button className={styles.actionButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 16V5h9v14H6zm8-12h-5v2h5V7zm0 4h-5v2h5v-2zm0 4h-5v2h5v-2z"/>
                        </svg>
                      </button>
                      <button className={styles.actionButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </button>
                      <button className={styles.actionButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                      </button>
                      <button className={styles.actionButton}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
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
          )}
          
          <form onSubmit={handleSubmit} className={`${styles.inputForm} ${chatMessages.length > 0 ? styles.inputFormWithMessages : ''}`}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviews}>
                {imagePreviews.slice(0, 8).map((preview, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      onClick={() => openImageModal(index)}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() => removeImage(index)}
                    >
                    </button>
                  </div>
                ))}
                {imagePreviews.length > 8 && (
                  <div className={styles.imagePreview}>
                    <div className={styles.moreImagesIndicator}>
                      +{imagePreviews.length - 8}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Modal */}
            {isModalOpen && selectedImageIndex !== null && (
              <div className={styles.imageModal} onClick={closeImageModal}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <button className={styles.closeModalButton} onClick={closeImageModal}>
                    ×
                  </button>
                  <img 
                    src={imagePreviews[selectedImageIndex]} 
                    alt={`Image ${selectedImageIndex + 1}`}
                    className={styles.modalImage}
                  />
                  {imagePreviews.length > 1 && (
                    <>
                      <button 
                        className={styles.prevButton} 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          prevImage();
                        }}
                        disabled={selectedImageIndex === 0}
                      >
                        ‹
                      </button>
                      <button 
                        className={styles.nextButton} 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          nextImage();
                        }}
                        disabled={selectedImageIndex === imagePreviews.length - 1}
                      >
                        ›
                      </button>
                    </>
                  )}
                  <div className={styles.imageCounter}>
                    {selectedImageIndex + 1} / {imagePreviews.length}
                  </div>
                </div>
              </div>
            )}

            {/* Drop Zone Modal - Only show when dragging */}
            {isDragging && (
              <div 
                ref={dropZoneRef}
                className={`${styles.dropZoneModal} ${isDragOver ? styles.dropZoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={styles.dropZoneContent}>
                  <div className={styles.dropZoneIcons}>
                    <div className={styles.dropIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                    <div className={styles.dropIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                    <div className={styles.dropIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.dropZoneText}>
                    <h3>Add anything</h3>
                    <p>Drop any file here to add it to the conversation</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className={styles.inputContainer}>
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className={styles.input}
                rows={1}
              />
              <div className={`${styles.inputButtons} ${isAttachDropdownOpen ? styles.dropdownOpen : ''}`}>
                <div ref={attachContainerRef} className={styles.attachContainer}>
                  <button type="button" className={styles.plusButton} onClick={handleAttachClick}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </button>
                  {isAttachDropdownOpen && (
                    <div className={`${styles.attachDropdown} ${dropdownPosition === 'top' ? styles.attachDropdownTop : ''}`}>
                      <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('photos')}>
                        <div className={styles.dropdownIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                          </svg>
                        </div>
                        <div className={styles.dropdownText}>
                          <div className={styles.dropdownTitle}>Add photos & files</div>
                        </div>
                      </div>
                      
                      <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('create-image')}>
                        <div className={styles.dropdownIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                        <div className={styles.dropdownText}>
                          <div className={styles.dropdownTitle}>Create image</div>
                        </div>
                      </div>
                      
                      <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('think-longer')}>
                        <div className={styles.dropdownIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                          </svg>
                        </div>
                        <div className={styles.dropdownText}>
                          <div className={styles.dropdownTitle}>Think longer</div>
                        </div>
                      </div>
                      
                      <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('deep-research')}>
                        <div className={styles.dropdownIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div className={styles.dropdownText}>
                          <div className={styles.dropdownTitle}>Deep research</div>
                        </div>
                      </div>
                      
                      <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('study-learn')}>
                        <div className={styles.dropdownIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                        <div className={styles.dropdownText}>
                          <div className={styles.dropdownTitle}>Study and learn</div>
                        </div>
                      </div>
                      
                      <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('more')}>
                        <div className={styles.dropdownIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </div>
                        <div className={styles.dropdownText}>
                          <div className={styles.dropdownTitle}>More</div>
                        </div>
                        <div className={styles.dropdownArrow}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {inputValue.trim() ? (
                  <button type="submit" className={styles.sendButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z"/>
                    </svg>
                  </button>
                ) : (
                  <button type="button" className={styles.voiceButton} data-tooltip="Use voice mode">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                    </svg>
                    Voice
                  </button>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className={styles.shareModal} onClick={closeShareModal}>
          <div className={styles.shareModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.shareModalHeader}>
              <h3>Share public link to chat</h3>
              <button className={styles.closeShareButton} onClick={closeShareModal}>
                ×
              </button>
            </div>
            <div className={styles.shareModalBody}>
              <p className={styles.privacyNotice}>Your name, custom instructions, and any messages you add after sharing stay private.</p>
              <div className={styles.shareLinkContainer}>
                <div className={styles.shareLinkDisplay}>
                  https://webui-ai.com/share/...
                </div>
                <button className={styles.createLinkButton} onClick={copyToClipboard}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.42l-.47.48a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24z"/>
                  </svg>
                  Create link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


