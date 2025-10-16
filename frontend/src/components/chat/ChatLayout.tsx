import React from 'react';
import Sidebar from '../layout/Sidebar/Sidebar';
import styles from '../../pages/Dashboard/Dashboard.module.css';

interface ChatLayoutProps {
  children: React.ReactNode;
  user: any;
  chatHistory: Array<{ id: string; title: string; isActive: boolean }>;
  activatedConversation?: string;
  isSidebarMinimized: boolean;
  onToggleSidebar: () => void;
  onDeleteConversation: (conversationId: string) => void;
  isMobileSidebarOpen?: boolean;
  onMobileSidebarToggle?: () => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  user,
  chatHistory,
  activatedConversation,
  isSidebarMinimized,
  onToggleSidebar,
  onDeleteConversation,
  isMobileSidebarOpen = false,
  onMobileSidebarToggle
}) => {
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar 
        isMinimized={isSidebarMinimized} 
        onToggle={onToggleSidebar}
        user={user}
        activated_conversation={activatedConversation}
        chatHistory={chatHistory}
        onDeleteConversation={onDeleteConversation}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={onMobileSidebarToggle}
      />

      {/* Main Content */}
      <div className={`${styles.mainContent} ${isSidebarMinimized ? styles.mainContentExpanded : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;
