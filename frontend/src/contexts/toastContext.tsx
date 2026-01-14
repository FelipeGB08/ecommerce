import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto toast-animation"
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[320px] max-w-md ${
                toast.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p className="flex-1 font-medium text-sm">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`flex-shrink-0 hover:opacity-70 transition-opacity ${
                  toast.type === 'success'
                    ? 'text-green-600'
                    : toast.type === 'error'
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
