import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, variant = 'info', options = {}) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        variant,
        duration: options.duration ?? 4500,
      },
    ]);

    if ((options.duration ?? 4500) > 0) {
      setTimeout(() => remove(id), options.duration ?? 4500);
    }
  }, [remove]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur',
              toast.variant === 'success' && 'border-emerald-200 bg-white/95 text-emerald-700',
              toast.variant === 'error' && 'border-red-200 bg-white/95 text-red-600',
              toast.variant === 'info' && 'border-slate-200 bg-white/95 text-slate-600'
            )}
          >
            {icons[toast.variant] || icons.info}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="ml-2 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
            >
              Fechar
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser utilizado dentro de ToastProvider');
  }
  return ctx;
};

export const ToastViewport = () => null;
