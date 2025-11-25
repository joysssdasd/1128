import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, AlertDescription } from './ui/Alert';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 3000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto hide after duration
    setTimeout(() => {
      hideToast(id);
    }, newToast.duration);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getAlertVariant = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'destructive';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Alert key={toast.id} variant={getAlertVariant(toast.type)} className="shadow-lg animate-slide-in">
            <AlertDescription>
              <div className="font-medium">{toast.title}</div>
              {toast.message && (
                <div className="text-sm opacity-90 mt-1">{toast.message}</div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </ToastContext>
  );
};