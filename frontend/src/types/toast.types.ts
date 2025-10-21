export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: Date;
}

export interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}
