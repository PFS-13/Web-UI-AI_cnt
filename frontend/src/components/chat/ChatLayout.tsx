import React from 'react';
import Sidebar from '../layout/Sidebar/Sidebar';
import styles from '../../pages/Dashboard/Dashboard.module.css';

interface ChatLayoutProps {
  children: React.ReactNode;
  user: any;
  conversations: any[];
  chatHistory: Array<{ id: string; title: string; isActive: boolean }>;
  activatedConversation?: string;
  isSidebarMinimized: boolean;
  onToggleSidebar: () => void;
  onSelectConversation: (conversation: any) => void;
  onNewChat: () => void;
  onDeleteConversation: (conversationId: string) => void;
  isMobileSidebarOpen?: boolean;
  onMobileSidebarToggle?: () => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  user,
  conversations,
  chatHistory,
  activatedConversation,
  isSidebarMinimized,
  onToggleSidebar,
  onSelectConversation,
  onNewChat,
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
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        onNewChat={onNewChat}
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
