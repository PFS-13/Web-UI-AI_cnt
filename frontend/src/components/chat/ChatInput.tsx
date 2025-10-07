import React from 'react';
import styles from '../../pages/Dashboard/Dashboard.module.css';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onAttachClick: () => void;
  onAttachOptionClick: (option: string) => void;
  isAttachDropdownOpen: boolean;
  dropdownPosition: 'top' | 'bottom';
  attachContainerRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  hasMessages: boolean;
  // Additional props for compatibility
  onSendMessage?: (content: string) => Promise<void>;
  onTyping?: React.Dispatch<React.SetStateAction<boolean>>;
  placeholder?: string;
  disabled?: boolean;
  showSendButton?: boolean;
  // File upload props
  imagePreviews: string[];
  selectedImageIndex: number | null;
  isModalOpen: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onOpenImageModal: (index: number) => void;
  onCloseImageModal: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onKeyDown,
  onSubmit,
  onAttachClick,
  onAttachOptionClick,
  isAttachDropdownOpen,
  dropdownPosition,
  attachContainerRef,
  fileInputRef,
  hasMessages,
  imagePreviews,
  selectedImageIndex,
  isModalOpen,
  isDragging,
  isDragOver,
  dropZoneRef,
  onImageUpload,
  onRemoveImage,
  onOpenImageModal,
  onCloseImageModal,
  onNextImage,
  onPrevImage,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  return (
    <form onSubmit={onSubmit} className={`${styles.inputForm} ${hasMessages ? styles.inputFormWithMessages : ''}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onImageUpload}
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
                onClick={() => onOpenImageModal(index)}
                className={styles.previewImage}
              />
              <button
                type="button"
                className={styles.removeImageButton}
                onClick={() => onRemoveImage(index)}
              >
                ×
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
        <div className={styles.imageModal} onClick={onCloseImageModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalButton} onClick={onCloseImageModal}>
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
                    onPrevImage();
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
                    onNextImage();
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
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="Ask anything"
          className={styles.input}
          rows={1}
        />
        <div className={`${styles.inputButtons} ${isAttachDropdownOpen ? styles.dropdownOpen : ''}`}>
          <div ref={attachContainerRef} className={styles.attachContainer}>
            <button type="button" className={styles.plusButton} onClick={onAttachClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            {isAttachDropdownOpen && (
              <div className={`${styles.attachDropdown} ${dropdownPosition === 'top' ? styles.attachDropdownTop : ''}`}>
                <div className={styles.dropdownItem} onClick={() => onAttachOptionClick('photos')}>
                  <div className={styles.dropdownIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                    </svg>
                  </div>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownTitle}>Add photos & files</div>
                  </div>
                </div>
                
                <div className={styles.dropdownItem} onClick={() => onAttachOptionClick('create-image')}>
                  <div className={styles.dropdownIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                  </div>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownTitle}>Create image</div>
                  </div>
                </div>
                
                <div className={styles.dropdownItem} onClick={() => onAttachOptionClick('think-longer')}>
                  <div className={styles.dropdownIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                    </svg>
                  </div>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownTitle}>Think longer</div>
                  </div>
                </div>
                
                <div className={styles.dropdownItem} onClick={() => onAttachOptionClick('deep-research')}>
                  <div className={styles.dropdownIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownTitle}>Deep research</div>
                  </div>
                </div>
                
                <div className={styles.dropdownItem} onClick={() => onAttachOptionClick('study-learn')}>
                  <div className={styles.dropdownIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownTitle}>Study and learn</div>
                  </div>
                </div>
                
                <div className={styles.dropdownItem} onClick={() => onAttachOptionClick('more')}>
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
  );
};

export default ChatInput;
