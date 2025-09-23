import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Dashboard.module.css';
import { authAPI } from '../../services';

const Dashboard: React.FC = () => {
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
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const attachContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const helpDropdownRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authAPI.getMe(); // ✅ tunggu Promise
        if (!user) {
          navigate("/login");
        } else {
          console.log("Authenticated user:", user);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    };

    checkUser();
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || uploadedImages.length > 0) {
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

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
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

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar 
        isMinimized={isSidebarMinimized} 
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className={`${styles.mainContent} ${isSidebarMinimized ? styles.mainContentExpanded : ''}`}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1 className={styles.chatTitle}>WebUI AI</h1>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.dropdownIcon}>
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.documentButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </button>
            <button className={styles.profileButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Chat Content */}
        <main className={styles.chatContent}>
          <div className={styles.welcomeMessage}>
            <h2>How can I help, Manusia?</h2>
          </div>
          
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
              <button type="button" className={styles.attachButton} onClick={handleAttachClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask anything"
                className={styles.input}
              />
              <div className={styles.inputRightButtons}>
                <button type="button" className={styles.voiceButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                </button>
                <button type="button" className={styles.waveformButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
