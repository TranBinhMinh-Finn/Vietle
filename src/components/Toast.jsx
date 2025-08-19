import { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const MAX_TOASTS = 3; 

  const toast = (message, duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message };
    
    setToasts(prev => {
      const updatedToasts = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
      return [...updatedToasts, newToast];
    });
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="bg-[#202224] px-4 py-3 rounded-lg shadow-lg animate-slide-in max-w-sm pointer-events-auto flex items-center justify-between gap-3"
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white hover:text-gray-300 flex-shrink-0 p-1 -m-1"
              aria-label="Close notification"
            ><X size={14} /></button>
          </div>
        ))}
      </div>
      <style jsx="true">{`
        @keyframes slide-in {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
    );
}