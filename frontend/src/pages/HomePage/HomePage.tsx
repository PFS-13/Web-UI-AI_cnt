import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

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
  const attachContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const helpDropdownRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || uploadedImages.length > 0) {
      // Redirect to chat page with the input and images
      navigate('/chat', { 
        state: { 
          initialMessage: inputValue,
          uploadedImages: uploadedImages,
          imagePreviews: imagePreviews
        } 
      });
    }
  };

  const handleAttachClick = () => {
    console.log('Attach button clicked, current state:', isAttachDropdownOpen);
    setIsAttachDropdownOpen(!isAttachDropdownOpen);
  };

  const handleAttachOptionClick = (option: string) => {
    console.log('Selected option:', option);
    if (option === 'images') {
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

  const handleHelpOptionClick = (option: string) => {
    console.log('Selected help option:', option);
    setIsHelpDropdownOpen(false);
    // Handle different help options here
  };

  // Close dropdown when clicking outside
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

    if (isAttachDropdownOpen || isHelpDropdownOpen) {
      // Add event listener with a small delay to avoid conflicts
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isAttachDropdownOpen, isHelpDropdownOpen]);

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
    navigate('/register');
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
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>WebUI AI</h1>
          
          <form onSubmit={handleSubmit} className={styles.inputForm}>
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
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={
                  isSearchActive ? "Search the web" : 
                  isStudyActive ? "Learn something new" : 
                  "Ask anything"
                }
                className={styles.input}
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
                      <div className={styles.attachDropdown}>
                        <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('images')}>
                          <div className={styles.dropdownIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                          </div>
                          <div className={styles.dropdownText}>
                            <div className={styles.dropdownTitle}>Images</div>
                          </div>
                        </div>
                        <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('documents')}>
                          <div className={styles.dropdownIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          </div>
                          <div className={styles.dropdownText}>
                            <div className={styles.dropdownTitle}>Documents</div>
                            <div className={styles.dropdownSubtitle}>Login required</div>
                          </div>
                        </div>
                        <div className={styles.dropdownItem} onClick={() => handleAttachOptionClick('connect-apps')}>
                          <div className={styles.dropdownIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                            </svg>
                          </div>
                          <div className={styles.dropdownText}>
                            <div className={styles.dropdownTitle}>Connect apps</div>
                            <div className={styles.dropdownSubtitle}>Login required</div>
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
