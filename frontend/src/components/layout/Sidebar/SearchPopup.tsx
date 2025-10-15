import React, { useState, useEffect, useRef } from 'react';
import type { Conversation } from '../../../types/chat.types';
import styles from './SearchPopup.module.css';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat: () => void;
}

const SearchPopup: React.FC<SearchPopupProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
  onNewChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Enhanced search function - prioritize full message content over truncated title
  const searchInConversation = (conversation: Conversation, searchTerm: string) => {
    if (!conversation || !searchTerm.trim()) return null;
    
    const term = searchTerm.toLowerCase();
    
    // Priority 1: Search in full messages first (most comprehensive)
    if (conversation.messages && Array.isArray(conversation.messages)) {
      for (const message of conversation.messages) {
        if (message.content && 
            typeof message.content === 'string' &&
            message.content.toLowerCase().includes(term)) {
          return {
            type: 'message',
            content: message.content,
            match: true,
            messageRole: message.role
          };
        }
      }
    }
    
    // Priority 2: Search in title (truncated, least reliable)
    if (conversation.title && 
        typeof conversation.title === 'string' &&
        conversation.title.toLowerCase().includes(term)) {
      return {
        type: 'title',
        content: conversation.title,
        match: true
      };
    }
    
    return null;
  };

  // Extract snippet from content ensuring search term is visible
  const extractSnippet = (content: string, searchTerm: string, maxLength: number = 40) => {
    if (!content || !searchTerm) return content;
    
    const term = searchTerm.toLowerCase();
    const contentLower = content.toLowerCase();
    const termIndex = contentLower.indexOf(term);
    
    if (termIndex === -1) return content;
    
    // Find word boundaries for better snippet extraction
    const findWordBoundary = (text: string, position: number, direction: 'start' | 'end') => {
      if (direction === 'start') {
        // Find start of word
        while (position > 0 && /\w/.test(text[position - 1])) {
          position--;
        }
      } else {
        // Find end of word
        while (position < text.length && /\w/.test(text[position])) {
          position++;
        }
      }
      return position;
    };
    
    // Calculate context around the search term
    const termLength = term.length;
    const availableLength = maxLength - termLength;
    
    // Try to center the search term in the snippet
    const contextBefore = Math.floor(availableLength * 0.4);
    const contextAfter = Math.floor(availableLength * 0.6);
    
    // Calculate snippet boundaries
    let snippetStart = Math.max(0, termIndex - contextBefore);
    let snippetEnd = Math.min(content.length, termIndex + termLength + contextAfter);
    
    // Adjust to word boundaries for better readability
    snippetStart = findWordBoundary(content, snippetStart, 'start');
    snippetEnd = findWordBoundary(content, snippetEnd, 'end');
    
    // Extract snippet
    let snippet = content.substring(snippetStart, snippetEnd);
    
    // Verify that the search term is actually in the snippet
    if (snippet.toLowerCase().indexOf(term) === -1) {
      // If not, center the snippet around the search term
      const centerStart = Math.max(0, termIndex - Math.floor(maxLength / 2));
      const centerEnd = Math.min(content.length, centerStart + maxLength);
      snippet = content.substring(centerStart, centerEnd);
    }
    
    // Add ellipsis if needed (only if we're not at the beginning/end of content)
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < content.length) snippet = snippet + '...';
    
    // Test the snippet extraction with example data
    // Debug logging removed for production
    
    return snippet;
  };

  // Highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!text || !searchTerm.trim()) return text;
    
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const result = text.replace(regex, '<mark>$1</mark>');
    
    return result;
  };

  // Filter conversations based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = conversations
        .map(conversation => {
          const searchResult = searchInConversation(conversation, searchQuery);
          if (searchResult) {
            return {
              conversation,
              searchResult,
              snippet: extractSnippet(searchResult.content, searchQuery),
              highlightedSnippet: highlightSearchTerm(extractSnippet(searchResult.content, searchQuery), searchQuery),
              highlightedTitle: highlightSearchTerm(conversation.title || '', searchQuery)
            };
          }
          return null;
        })
        .filter(Boolean);
      
      setSearchResults(searchResults);
      setFilteredConversations(searchResults.map(result => result!.conversation));
    } else {
      const recentConversations = conversations.slice(0, 6);
      setSearchResults([]);
      setFilteredConversations(recentConversations);
    }
    setSelectedIndex(0);
  }, [searchQuery, conversations]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.min(prev + 1, filteredConversations.length)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === 0) {
          onNewChat();
        } else {
          const conversation = filteredConversations[selectedIndex - 1];
          if (conversation) {
            onSelectConversation(conversation);
          }
        }
        onClose();
        break;
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle conversation click
  const handleConversationClick = (conversation: Conversation) => {
    onSelectConversation(conversation);
    onClose();
  };

  // Handle new chat click
  const handleNewChatClick = () => {
    onNewChat();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div ref={popupRef} className={styles.popup}>
        {/* Header */}
        <div className={styles.header}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.searchInput}
          />
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* New Chat Option */}
          <div
            className={`${styles.option} ${selectedIndex === 0 ? styles.selected : ''}`}
            onClick={handleNewChatClick}
          >
            <div className={styles.optionIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5V19M5 12H19"/>
              </svg>
            </div>
            <span className={styles.optionText}>New chat</span>
          </div>

           {/* Today Section */}
           {filteredConversations.length > 0 && (
             <>
               <div className={styles.sectionHeader}>
                 {searchQuery.trim() ? 'Search Results' : 'Today'}
               </div>
               {filteredConversations.map((conversation, index) => {
                 const searchResult = searchResults.find(result => 
                   result.conversation.conversation_id === conversation.conversation_id
                 );
                 
                 return (
                   <div
                     key={conversation.conversation_id}
                     className={`${styles.option} ${selectedIndex === index + 1 ? styles.selected : ''}`}
                     onClick={() => handleConversationClick(conversation)}
                   >
                     <div className={styles.optionIcon}>
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                       </svg>
                     </div>
                     <div className={styles.optionContent}>
                       <div className={styles.optionTitle}>
                         {searchResult ? (
                           <span dangerouslySetInnerHTML={{
                             __html: searchResult.highlightedTitle
                           }} />
                         ) : (
                           conversation.title
                         )}
                       </div>
                       {searchResult && searchResult.snippet && (
                         <div className={styles.optionSnippet}>
                           <span dangerouslySetInnerHTML={{
                             __html: searchResult.highlightedSnippet
                           }} />
                         </div>
                       )}
                     </div>
                   </div>
                 );
               })}
             </>
           )}


          {/* No Results */}
          {searchQuery.trim() && filteredConversations.length === 0 && (
            <div className={styles.noResults}>
              <span>No conversations found</span>
            </div>
          )}

          {/* Empty State - when no conversations at all */}
          {!searchQuery.trim() && filteredConversations.length === 0 && conversations.length === 0 && (
            <div className={styles.noResults}>
              <span>No conversations available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
