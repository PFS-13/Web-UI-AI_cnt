import React, { useState } from 'react';
import styles from './ChainMessageControls.module.css';

interface ChainMessageControlsProps {
  messageId: number;
  isUser: boolean;
  currentChainIndex?: number;
  totalChains?: number;
  onCopy?: (messageId: number) => void;
  onEdit?: (messageId: number) => void;
  onNavigateLeft?: (messageId: number) => void;
  onNavigateRight?: (messageId: number) => void;
}

const ChainMessageControls: React.FC<ChainMessageControlsProps> = ({
  messageId,
  isUser,
  currentChainIndex = 1,
  totalChains = 1,
  onCopy,
  onEdit,
  onNavigateLeft,
  onNavigateRight
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const hasChains = totalChains && totalChains > 1;
  const canNavigateLeft = currentChainIndex > 1;
  const canNavigateRight = currentChainIndex < (totalChains || 1);

  // Debug logging
  console.log(`ChainMessageControls for message ${messageId}:`, {
    isUser,
    currentChainIndex,
    totalChains,
    hasChains,
    canNavigateLeft,
    canNavigateRight,
    onCopy: !!onCopy,
    onEdit: !!onEdit,
    onNavigateLeft: !!onNavigateLeft,
    onNavigateRight: !!onNavigateRight
  });

  const handleCopyClick = () => {
    if (onCopy) {
      onCopy(messageId);
      setIsCopied(true);
      // Reset to copy icon after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <div className={`${styles.chainControls} ${isUser ? 'userMessage' : 'aiMessage'}`}>
      {/* Copy Message Button - untuk semua messages */}
      {onCopy && (
        <button
          className={`${styles.controlButton} ${isCopied ? styles.copied : ''}`}
          onClick={handleCopyClick}
          title={isCopied ? "Copied!" : "Copy message"}
        >
          {isCopied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          )}
        </button>
      )}

      {/* Edit Message Button - hanya untuk user messages */}
      {isUser && onEdit && (
        <button
          className={styles.controlButton}
          onClick={() => onEdit(messageId)}
          title="Edit message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.09H5v-1.92l8.06-8.06 1.92 1.92L5.92 19.34zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
          </svg>
        </button>
      )}

      {/* Navigation Controls - hanya muncul untuk user messages dan jika ada chains */}
      {isUser && hasChains && (
        <>
          {/* Left Arrow */}
          <button
            className={`${styles.controlButton} ${!canNavigateLeft ? styles.disabled : ''}`}
            onClick={() => canNavigateLeft && onNavigateLeft?.(messageId)}
            disabled={!canNavigateLeft}
            title="Previous chain"
          >
            &lt;
          </button>

          {/* Chain Indicator */}
          <span className={styles.chainIndicator}>
            {currentChainIndex}/{totalChains}
          </span>

          {/* Right Arrow */}
          <button
            className={`${styles.controlButton} ${!canNavigateRight ? styles.disabled : ''}`}
            onClick={() => canNavigateRight && onNavigateRight?.(messageId)}
            disabled={!canNavigateRight}
            title="Next chain"
          >
            &gt;
          </button>
        </>
      )}
    </div>
  );
};

export default ChainMessageControls;
