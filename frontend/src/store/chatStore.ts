import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Conversation } from '../types/chat.types';

interface ChatState {
  // Current conversation
  currentConversationId: string | null;
  currentPath: number[];
  
  // Conversations list
  conversations: Conversation[];
  chatHistory: Array<{ id: string; title: string; isActive: boolean }>;
  
  // UI state
  isSidebarMinimized: boolean;
  isMobileSidebarOpen: boolean;
  
  // Actions
  setCurrentConversation: (id: string | null) => void;
  setCurrentPath: (path: number[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setChatHistory: (history: Array<{ id: string; title: string; isActive: boolean }>) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setSidebarMinimized: (minimized: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentConversationId: null,
        currentPath: [],
        conversations: [],
        chatHistory: [],
        isSidebarMinimized: false,
        isMobileSidebarOpen: false,

        // Actions
        setCurrentConversation: (id) => 
          set({ currentConversationId: id }, false, 'setCurrentConversation'),

        setCurrentPath: (path) => 
          set({ currentPath: path }, false, 'setCurrentPath'),

        setConversations: (conversations) => 
          set({ conversations }, false, 'setConversations'),

        setChatHistory: (chatHistory) => 
          set({ chatHistory }, false, 'setChatHistory'),

        addConversation: (conversation) => 
          set((state) => ({
            conversations: [...state.conversations, conversation]
          }), false, 'addConversation'),

        updateConversation: (id, updates) => 
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.conversation_id === id ? { ...conv, ...updates } : conv
            )
          }), false, 'updateConversation'),

        removeConversation: (id) => 
          set((state) => ({
            conversations: state.conversations.filter(conv => conv.conversation_id !== id),
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId
          }), false, 'removeConversation'),

        setSidebarMinimized: (minimized) => 
          set({ isSidebarMinimized: minimized }, false, 'setSidebarMinimized'),

        setMobileSidebarOpen: (open) => 
          set({ isMobileSidebarOpen: open }, false, 'setMobileSidebarOpen'),

        toggleSidebar: () => 
          set((state) => ({ 
            isSidebarMinimized: !state.isSidebarMinimized 
          }), false, 'toggleSidebar'),

        toggleMobileSidebar: () => 
          set((state) => ({ 
            isMobileSidebarOpen: !state.isMobileSidebarOpen 
          }), false, 'toggleMobileSidebar'),
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          conversations: state.conversations,
          chatHistory: state.chatHistory,
          isSidebarMinimized: state.isSidebarMinimized,
        }),
      }
    ),
    {
      name: 'chat-store',
    }
  )
);
