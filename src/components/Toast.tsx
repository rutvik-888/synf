import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    setExiting(prev => new Set(prev).add(id));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setExiting(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map(t => {
          const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? AlertCircle : Info;
          const color = t.type === 'success' ? 'text-lime-400' : t.type === 'error' ? 'text-coral-400' : 'text-cyan-300';
          const border = t.type === 'success' ? 'border-lime-400/30' : t.type === 'error' ? 'border-coral-500/40' : 'border-white/15';
          const isExiting = exiting.has(t.id);
          return (
            <div
              key={t.id}
              className={`glass-dark flex items-center gap-3 rounded-xl border ${border} px-4 py-3 text-sm text-white shadow-xl transition-all duration-250 ease-out ${
                isExiting ? 'opacity-0 translate-y-2 scale-95' : 'animate-fade-up'
              }`}
            >
              <Icon size={18} className={color} />
              <span>{t.message}</span>
              <button onClick={() => removeToast(t.id)} className="ml-2 text-white/40 hover:text-white"><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
