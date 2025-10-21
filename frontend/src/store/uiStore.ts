import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Modal states
  isShareModalOpen: boolean;
  isAttachDropdownOpen: boolean;
  isImageModalOpen: boolean;
  
  // Toast states
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  }>;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setAttachDropdownOpen: (open: boolean) => void;
  setImageModalOpen: (open: boolean) => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      isLoading: false,
      isSubmitting: false,
      isShareModalOpen: false,
      isAttachDropdownOpen: false,
      isImageModalOpen: false,
      toasts: [],

      // Actions
      setLoading: (loading) => 
        set({ isLoading: loading }, false, 'setLoading'),

      setSubmitting: (submitting) => 
        set({ isSubmitting: submitting }, false, 'setSubmitting'),

      setShareModalOpen: (open) => 
        set({ isShareModalOpen: open }, false, 'setShareModalOpen'),

      setAttachDropdownOpen: (open) => 
        set({ isAttachDropdownOpen: open }, false, 'setAttachDropdownOpen'),

      setImageModalOpen: (open) => 
        set({ isImageModalOpen: open }, false, 'setImageModalOpen'),

      addToast: (toast) => 
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id: Date.now().toString() }]
        }), false, 'addToast'),

      removeToast: (id) => 
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }), false, 'removeToast'),

      clearToasts: () => 
        set({ toasts: [] }, false, 'clearToasts'),
    }),
    {
      name: 'ui-store',
    }
  )
);
