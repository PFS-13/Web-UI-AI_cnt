import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const HomePage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isAttachDropdownOpen, setIsAttachDropdownOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isStudyActive, setIsStudyActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const attachContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const helpDropdownRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const scrollElement = messagesContainerRef.current;
      
      // Force scroll to bottom with multiple methods
      const scrollToBottomValue = scrollElement.scrollHeight - scrollElement.clientHeight;
      
      // Method 1: Direct assignment
      scrollElement.scrollTop = scrollToBottomValue;
      
      // Method 2: Using scrollTo method
      scrollElement.scrollTo({
        top: scrollToBottomValue,
        behavior: 'smooth'
      });
      
      // Method 3: Using scrollIntoView on last message
      const lastMessage = scrollElement.querySelector('.message:last-child');
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      // Method 4: Fallback with setTimeout
      setTimeout(() => {
        scrollElement.scrollTop = scrollToBottomValue;
      }, 100);
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
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue.trim(),
        isUser: true,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      // Scroll immediately after adding user message
      setTimeout(() => scrollToBottom(), 100);
      
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: "Hi! Could you share a bit more about what you'd like me to respond to?",
          isUser: false,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        
        // Scroll after AI response
        setTimeout(() => scrollToBottom(), 100);
      }, 1000);
      
      // Clear input
      setInputValue('');
      setUploadedImages([]);
      setImagePreviews([]);
    }
  };

  const handleAttachClick = () => {
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
    if (option === 'photos') {
      fileInputRef.current?.click();
    }
    setIsAttachDropdownOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const previewPromises: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      // Validasi file type
      // if (!file.type.startsWith('image/')) {
      //   alert('Please select only image files');
      //   return;
      // }

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

  const handleSearchClick = () => {
    if (isSearchActive) {
      // If search is active, deactivate it
      setIsSearchActive(false);
    } else {
      // If search is not active, activate it and deactivate study
      setIsSearchActive(true);
      setIsStudyActive(false);
    }
  };

  const handleStudyClick = () => {
    if (isStudyActive) {
      // If study is active, deactivate it
      setIsStudyActive(false);
    } else {
      // If study is not active, activate it and deactivate search
      setIsStudyActive(true);
      setIsSearchActive(false);
    }
  };

  const handleHelpClick = () => {
    setIsHelpDropdownOpen(!isHelpDropdownOpen);
  };

  const handleHelpOptionClick = (_option: string) => {
    setIsHelpDropdownOpen(false);
    // Handle different help options here
  };

  // Close dropdown when clicking outside and adjust position on scroll/resize
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAttachDropdownOpen && attachContainerRef.current) {
        if (!attachContainerRef.current.contains(event.target as Node)) {
          setIsAttachDropdownOpen(false);
        }
      }
      if (isHelpDropdownOpen && helpDropdownRef.current) {
        if (!helpDropdownRef.current.contains(event.target as Node)) {
          setIsHelpDropdownOpen(false);
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

    if (isAttachDropdownOpen || isHelpDropdownOpen) {
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
  }, [isAttachDropdownOpen, isHelpDropdownOpen]);

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  // Additional scroll trigger for when loading state changes
  React.useEffect(() => {
    if (!isLoading && chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [isLoading]);

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

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} data-tooltip="New chat">
          <svg className={styles.logoIcon} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path className={styles.logoCheckmark} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            <path className={styles.logoPencil} d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </div>
        <div className={styles.headerButtons}>
          <button onClick={handleLogin} className={styles.loginButton}>
            Log in
          </button>
          <button onClick={handleSignUp} className={styles.signupButton}>
            Sign up for free
          </button>
          <div ref={helpDropdownRef} className={styles.helpContainer}>
            <button onClick={handleHelpClick} className={styles.helpButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
            </button>
            {isHelpDropdownOpen && (
              <div className={styles.helpDropdown}>
                <div className={styles.helpItem} onClick={() => handleHelpOptionClick('plans')}>
                  <div className={styles.helpIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className={styles.helpText}>See plans and pricing</div>
                </div>
                <div className={styles.helpItem} onClick={() => handleHelpOptionClick('settings')}>
                  <div className={styles.helpIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                    </svg>
                  </div>
                  <div className={styles.helpText}>Settings</div>
                </div>
                <div className={styles.helpSeparator}></div>
                <div className={styles.helpItem} onClick={() => handleHelpOptionClick('help')}>
                  <div className={styles.helpIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                    </svg>
                  </div>
                  <div className={styles.helpText}>Help center</div>
                </div>
                <div className={styles.helpItem} onClick={() => handleHelpOptionClick('release')}>
                  <div className={styles.helpIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </div>
                  <div className={styles.helpText}>Release notes</div>
                </div>
                <div className={styles.helpItem} onClick={() => handleHelpOptionClick('terms')}>
                  <div className={styles.helpIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div className={styles.helpText}>Terms & policies</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={chatMessages.length === 0 ? styles.main : styles.mainWithMessages}>
        <div className={styles.content}>
          {chatMessages.length === 0 ? (
            <h1 className={styles.title}>WebUI AI</h1>
          ) : (
            <div ref={messagesContainerRef} className={styles.messagesContainer}>
              <div className={styles.messagesWrapper}>
                {chatMessages.map((message) => (
                <div key={message.id} className={`${styles.message} ${message.isUser ? styles.userMessage : styles.aiMessage}`}>
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                  {!message.isUser && (
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
                placeholder={
                  isSearchActive ? "Search the web" : 
                  isStudyActive ? "Learn something new" : 
                  "Ask anything"
                }
                className={styles.input}
                rows={1}
              />
              <div className={`${styles.inputButtons} ${isAttachDropdownOpen ? styles.dropdownOpen : ''}`}>
                <div className={styles.leftButtons}>
                  <div ref={attachContainerRef} className={styles.attachContainer}>
                    <button type="button" className={styles.actionButton} data-tooltip="Add photos" onClick={handleAttachClick}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                      </svg>
                      Attach
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
                  <button 
                    type="button" 
                    className={`${styles.actionButton} ${isSearchActive ? styles.actionButtonActive : ''}`} 
                    data-tooltip="Search the web"
                    onClick={handleSearchClick}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    Search
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.actionButton} ${isStudyActive ? styles.actionButtonActive : ''}`}
                    onClick={handleStudyClick}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    Study
                  </button>
                </div>
                <div className={styles.rightButtons}>
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
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          By messaging WebUI AI, you agree to our{' '}
          <a href="#" className={styles.footerLink}>Terms</a>
          {' '}and have read our{' '}
          <a href="#" className={styles.footerLink}>Privacy Policy</a>
          . See{' '}
          <a href="#" className={styles.footerLink}>Cookie Preferences</a>
          .
        </p>
      </footer>
    </div>
  );
};

export default HomePage;

